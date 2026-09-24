<?php

namespace App\Http\Controllers\Desktop;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Service;
use App\Models\Setting;
use App\Support\AppointmentSessions;
use App\Support\DesktopApi;
use App\Support\DesktopAppointmentSchedule;
use Carbon\CarbonImmutable;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class StudioController extends Controller
{
    private const STATUSES = ['confirmed', 'requested', 'cancelled', 'no_show'];

    public function __construct(private readonly DesktopAppointmentSchedule $schedule) {}

    public function state(): JsonResponse
    {
        $setting = Setting::query()->whereNull('site')->first();

        try {
            $hours = DesktopApi::hours($setting);
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'code' => 'hours_not_roundtrippable',
            ], 409);
        }

        $appointments = Appointment::query()->orderBy('starts_at')->orderBy('id')->get();
        $serviceIds = $appointments->pluck('service_id')->filter()->unique()->values();
        $services = Service::query()
            ->where(function ($query) use ($serviceIds): void {
                $query->where('is_active', true);

                if ($serviceIds->isNotEmpty()) {
                    $query->orWhereIn('id', $serviceIds);
                }
            })
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'name_tr', 'duration_min']);

        return response()->json([
            'customers' => Customer::query()
                ->orderBy('name')
                ->orderBy('id')
                ->get()
                ->map(fn (Customer $customer): array => DesktopApi::customer($customer))
                ->values(),
            'appointments' => $appointments
                ->map(fn (Appointment $appointment): array => DesktopApi::appointment($appointment))
                ->values(),
            'services' => $services->map(fn (Service $service): array => [
                'id' => $service->id,
                'title' => $service->name_tr,
                'duration_min' => $service->duration_min,
            ])->values(),
            'hours' => $hours,
            'timezone' => config('app.timezone'),
        ]);
    }

    public function storeCustomer(Request $request): JsonResponse
    {
        $validated = $request->validate($this->customerRules(false));
        $customer = Customer::query()->create($this->cleanCustomer($validated));

        return response()->json(['customer' => DesktopApi::customer($customer->refresh())], 201);
    }

    public function updateCustomer(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate($this->customerRules(true));

        return DB::transaction(function () use ($validated, $id): JsonResponse {
            $customer = Customer::query()->lockForUpdate()->findOrFail($id);

            if (! hash_equals(DesktopApi::revision($customer), $validated['revision'])) {
                return response()->json([
                    'message' => 'Müşteri başka bir yerde güncellendi.',
                    'customer' => DesktopApi::customer($customer),
                ], 409);
            }

            $customer->fill($this->cleanCustomer(Arr::except($validated, 'revision')));
            if ($customer->isDirty()) {
                $customer->save();
            }

            return response()->json(['customer' => DesktopApi::customer($customer->refresh())]);
        });
    }

    public function storeAppointment(Request $request): JsonResponse
    {
        $validated = $request->validate($this->appointmentRules(false));
        $startsAt = $this->startsAt($validated['starts_at']);

        return DB::transaction(function () use ($validated, $startsAt): JsonResponse {
            // Every desktop writer locks the same main settings row before its
            // overlap query. This serializes desktop creates on MySQL.
            $setting = Setting::query()->whereNull('site')->lockForUpdate()->first();

            if ($validated['status'] === 'confirmed') {
                $this->schedule->validate($startsAt, $validated['duration_min'], setting: $setting);
            }

            $appointment = Appointment::query()->create([
                'customer_id' => $validated['customer_id'],
                'service_id' => $validated['service_id'] ?? null,
                'starts_at' => $startsAt,
                'duration_min' => $validated['duration_min'],
                'status' => $validated['status'],
                'note' => $this->nullableString($validated['note'] ?? null),
            ]);

            return response()->json([
                'appointment' => DesktopApi::appointment($appointment->refresh()),
            ], 201);
        });
    }

    public function updateAppointment(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate($this->appointmentRules(true));

        return DB::transaction(function () use ($validated, $id): JsonResponse {
            // Keep lock ordering aligned with creates: studio lock, then row lock.
            $setting = Setting::query()->whereNull('site')->lockForUpdate()->first();
            $appointment = Appointment::query()->lockForUpdate()->findOrFail($id);

            if (! hash_equals(DesktopApi::revision($appointment), $validated['revision'])) {
                return response()->json([
                    'message' => 'Randevu başka bir yerde güncellendi.',
                    'appointment' => DesktopApi::appointment($appointment),
                ], 409);
            }

            $root = $appointment->isSessionChild()
                ? AppointmentSessions::root($appointment)
                : $appointment;
            $payload = $this->appointmentPayload($validated, $appointment, $root);
            $resultingStatus = $payload['status'] ?? $appointment->status;
            $scheduleChanged = (array_key_exists('starts_at', $payload)
                    && ! $appointment->starts_at->equalTo($payload['starts_at']))
                || (array_key_exists('duration_min', $payload)
                    && $appointment->duration_min !== $payload['duration_min'])
                || (array_key_exists('service_id', $payload)
                    && $appointment->service_id !== $payload['service_id'])
                || (array_key_exists('status', $payload)
                    && $appointment->status !== $payload['status']);

            if ($resultingStatus === 'confirmed' && $scheduleChanged) {
                $this->schedule->validate(
                    $payload['starts_at'] ?? $appointment->starts_at->toImmutable(),
                    $payload['duration_min'] ?? $appointment->duration_min,
                    $appointment,
                    $setting,
                );
            }

            $wasPackage = $appointment->isSessionPackage();
            $appointment->fill($payload);
            if ($appointment->isDirty()) {
                $appointment->save();
            }

            if ($wasPackage) {
                AppointmentSessions::resync($appointment);
            }

            return response()->json([
                'appointment' => DesktopApi::appointment($appointment->refresh()),
            ]);
        });
    }

    public function updateHours(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'hours' => ['required', 'array', 'size:7'],
            'hours.*.id' => ['required', 'integer', 'between:1,7', 'distinct'],
            'hours.*.enabled' => ['required', 'boolean'],
            'hours.*.open' => ['required', 'integer', 'between:0,1439'],
            'hours.*.close' => ['required', 'integer', 'between:0,1439'],
            'expected_hours' => ['required', 'array', 'size:7'],
            'expected_hours.*.id' => ['required', 'integer', 'between:1,7', 'distinct'],
            'expected_hours.*.enabled' => ['required', 'boolean'],
            'expected_hours.*.open' => ['required', 'integer', 'between:0,1439'],
            'expected_hours.*.close' => ['required', 'integer', 'between:0,1439'],
        ]);
        $hours = $this->canonicalInputHours($validated['hours'], 'hours');
        $expected = $this->canonicalInputHours($validated['expected_hours'], 'expected_hours');

        return DB::transaction(function () use ($hours, $expected): JsonResponse {
            $setting = Setting::query()->whereNull('site')->lockForUpdate()->first();

            try {
                $current = DesktopApi::hours($setting);
            } catch (DomainException $exception) {
                return response()->json([
                    'message' => $exception->getMessage(),
                    'code' => 'hours_not_roundtrippable',
                ], 409);
            }

            if ($current !== $expected) {
                return response()->json([
                    'message' => 'Çalışma saatleri başka bir yerde güncellendi.',
                    'hours' => $current,
                ], 409);
            }

            $setting ??= new Setting(['site' => null]);
            $setting->hours = DesktopApi::settingHours($hours);
            $setting->save();

            return response()->json(['hours' => DesktopApi::hours($setting->refresh())]);
        });
    }

    /** @return array<string, mixed> */
    private function customerRules(bool $patch): array
    {
        $presence = $patch ? 'sometimes' : 'required';

        return [
            'name' => [$presence, 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:255'],
            'email' => ['sometimes', 'nullable', 'string', 'email', 'max:255'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:10000'],
            'revision' => $patch ? ['required', 'string', 'size:64'] : ['prohibited'],
        ];
    }

    /** @return array<string, mixed> */
    private function appointmentRules(bool $patch): array
    {
        $presence = $patch ? 'sometimes' : 'required';

        return [
            'customer_id' => [$presence, 'integer', 'exists:customers,id'],
            'service_id' => [$patch ? 'sometimes' : 'nullable', 'nullable', 'integer', 'exists:services,id'],
            'starts_at' => [$presence, 'string', 'max:64', function (string $attribute, mixed $value, $fail): void {
                if (! is_string($value) || $this->parseStartsAt($value) === null) {
                    $fail('Başlangıç zamanı saat dilimi içeren geçerli bir ISO 8601 tarihi olmalı.');
                }
            }],
            'duration_min' => [$presence, 'integer', 'between:5,1440'],
            'status' => [$presence, 'string', Rule::in(self::STATUSES)],
            'note' => ['sometimes', 'nullable', 'string', 'max:10000'],
            'revision' => $patch ? ['required', 'string', 'size:64'] : ['prohibited'],
        ];
    }

    /** @param array<string, mixed> $validated @return array<string, mixed> */
    private function cleanCustomer(array $validated): array
    {
        foreach (['name', 'phone', 'email', 'notes'] as $field) {
            if (array_key_exists($field, $validated)) {
                $validated[$field] = $field === 'name'
                    ? trim($validated[$field])
                    : $this->nullableString($validated[$field]);
            }
        }

        return $validated;
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function appointmentPayload(array $validated, Appointment $appointment, Appointment $root): array
    {
        $payload = Arr::only($validated, [
            'customer_id', 'service_id', 'duration_min', 'status', 'note',
        ]);

        if (array_key_exists('starts_at', $validated)) {
            $payload['starts_at'] = $this->startsAt($validated['starts_at']);
        }
        if (array_key_exists('note', $payload)) {
            $payload['note'] = $this->nullableString($payload['note']);
        }

        if ($appointment->isSessionChild()) {
            $payload['customer_id'] = $root->customer_id;
            $payload['service_id'] = $root->service_id;
        }

        return $payload;
    }

    /**
     * @param  array<int, array<string, mixed>>  $input
     * @return array<int, array{id:int, enabled:bool, open:int, close:int}>
     */
    private function canonicalInputHours(array $input, string $key): array
    {
        $hours = collect($input)->keyBy('id');
        if ($hours->keys()->sort()->values()->all() !== range(1, 7)) {
            throw ValidationException::withMessages([$key => ['Yedi günün her biri tam bir kez gönderilmeli.']]);
        }

        return collect(range(1, 7))->map(function (int $id) use ($hours, $key): array {
            $hour = $hours[$id];
            $enabled = (bool) $hour['enabled'];
            $open = $hour['open'];
            $close = $hour['close'];

            if (($enabled && $close <= $open)
                || (! $enabled && ($open !== 540 || $close !== 1140))) {
                throw ValidationException::withMessages([
                    $key => ['Açık günlerde geçerli bir aralık, kapalı günlerde 09:00-19:00 varsayılanı gönderilmeli.'],
                ]);
            }

            return compact('id', 'enabled', 'open', 'close');
        })->all();
    }

    private function startsAt(string $value): CarbonImmutable
    {
        return $this->parseStartsAt($value)->setTimezone(config('app.timezone'));
    }

    private function parseStartsAt(string $value): ?CarbonImmutable
    {
        if (preg_match(
            '/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-](?:(?:0\d|1[0-3]):[0-5]\d|14:00))$/',
            $value,
        ) !== 1) {
            return null;
        }

        $format = str_contains($value, '.') ? '!Y-m-d\TH:i:s.uP' : '!Y-m-d\TH:i:sP';
        $parsed = \DateTimeImmutable::createFromFormat($format, $value);
        $errors = \DateTimeImmutable::getLastErrors();

        if ($parsed === false || (is_array($errors) && ($errors['warning_count'] > 0 || $errors['error_count'] > 0))) {
            return null;
        }

        return CarbonImmutable::instance($parsed);
    }

    private function nullableString(mixed $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
