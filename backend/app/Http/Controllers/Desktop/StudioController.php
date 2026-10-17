<?php

namespace App\Http\Controllers\Desktop;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Service;
use App\Models\Setting;
use App\Support\AppointmentSessions;
use App\Support\BodyRegions;
use App\Support\DesktopApi;
use App\Support\DesktopAppointmentSchedule;
use Carbon\CarbonImmutable;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
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
            'services' => $this->services(),
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
        $total = (int) ($validated['session_total'] ?? 1);
        $interval = (int) ($validated['interval_days'] ?? 28);
        $sessionStarts = $this->sessionStarts($validated, $startsAt, $total);

        return DB::transaction(function () use ($validated, $startsAt, $total, $interval, $sessionStarts): JsonResponse {
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
                'price' => $validated['price'] ?? null,
                'subservices' => $this->subservices($validated['subservices'] ?? null, $validated['service_id'] ?? null),
                'body_regions' => BodyRegions::normalize($validated['body_regions'] ?? null),
            ]);

            if ($total >= 2) {
                if ($sessionStarts !== null) {
                    AppointmentSessions::splitAt($appointment, $sessionStarts);
                } else {
                    AppointmentSessions::split($appointment, $total, $interval);
                }

                if ($validated['status'] === 'confirmed') {
                    // The created appointment is the root (earliest session); the
                    // children split()/splitAt() added must also fit hours and not overlap.
                    foreach (AppointmentSessions::all($appointment) as $session) {
                        $this->validateSession($session, $setting);
                    }
                }
            }

            $root = AppointmentSessions::root($appointment->refresh());

            return response()->json([
                'appointment' => DesktopApi::appointment($root),
                'appointments' => AppointmentSessions::all($root)
                    ->map(fn (Appointment $session): array => DesktopApi::appointment($session))
                    ->all(),
            ], 201);
        });
    }

    public function addSession(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'revision' => ['required', 'string', 'size:64'],
            'interval_days' => ['sometimes', 'integer', 'between:1,365'],
        ]);
        $interval = (int) ($validated['interval_days'] ?? 28);

        return DB::transaction(function () use ($validated, $id, $interval): JsonResponse {
            // Same lock order as creates/updates: studio lock, then row lock.
            $setting = Setting::query()->whereNull('site')->lockForUpdate()->first();
            $appointment = Appointment::query()->lockForUpdate()->findOrFail($id);

            if (! hash_equals(DesktopApi::revision($appointment), $validated['revision'])) {
                return response()->json([
                    'message' => 'Randevu başka bir yerde güncellendi.',
                    'appointment' => DesktopApi::appointment($appointment),
                ], 409);
            }

            $child = AppointmentSessions::add($appointment, $interval);

            if ($child->status === 'confirmed') {
                $this->validateSession($child, $setting);
            }

            $root = AppointmentSessions::root($appointment->refresh());

            return response()->json([
                'appointment' => DesktopApi::appointment($child->refresh()),
                'appointments' => AppointmentSessions::all($root)
                    ->map(fn (Appointment $session): array => DesktopApi::appointment($session))
                    ->all(),
            ], 201);
        });
    }

    public function storePhotos(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'photos' => ['required', 'array', 'min:1', 'max:10'],
            'photos.*' => ['image', 'max:10240'],
        ]);

        return DB::transaction(function () use ($validated, $id): JsonResponse {
            $appointment = Appointment::query()->lockForUpdate()->findOrFail($id);
            $photos = array_values($appointment->photos ?? []);

            foreach ($validated['photos'] as $photo) {
                $photos[] = $photo->store('appointments', 'public');
            }

            $appointment->photos = $photos;
            $appointment->save();

            return response()->json(['appointment' => DesktopApi::appointment($appointment->refresh())], 201);
        });
    }

    public function destroyPhoto(Request $request, int $id, int $index): JsonResponse
    {
        $validated = $request->validate([
            'revision' => ['required', 'string', 'size:64'],
        ]);

        return DB::transaction(function () use ($validated, $id, $index): JsonResponse {
            $appointment = Appointment::query()->lockForUpdate()->findOrFail($id);

            if (! hash_equals(DesktopApi::revision($appointment), $validated['revision'])) {
                return response()->json([
                    'message' => 'Randevu başka bir yerde güncellendi.',
                    'appointment' => DesktopApi::appointment($appointment),
                ], 409);
            }

            $photos = array_values($appointment->photos ?? []);
            abort_unless(array_key_exists($index, $photos), 404, 'Fotoğraf bulunamadı.');

            $path = $photos[$index];
            unset($photos[$index]);

            $appointment->photos = array_values($photos);
            $appointment->save();

            // Panel (Calendar) ile aynı: yalnızca bizim yüklediğimiz dosyalar silinir.
            if (is_string($path) && str_starts_with($path, 'appointments/')) {
                Storage::disk('public')->delete($path);
            }

            return response()->json(['appointment' => DesktopApi::appointment($appointment->refresh())]);
        });
    }

    public function destroyAppointment(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'revision' => ['required', 'string', 'size:64'],
        ]);

        return DB::transaction(function () use ($validated, $id): JsonResponse {
            $setting = Setting::query()->whereNull('site')->lockForUpdate()->first();
            $appointment = Appointment::query()->lockForUpdate()->findOrFail($id);

            if (! hash_equals(DesktopApi::revision($appointment), $validated['revision'])) {
                return response()->json([
                    'message' => 'Randevu başka bir yerde güncellendi.',
                    'appointment' => DesktopApi::appointment($appointment),
                ], 409);
            }

            $deletedId = $appointment->id;
            // Capture surviving member ids before removal; remove() renumbers and
            // may move the package root, so re-query by id afterwards.
            $remainingIds = AppointmentSessions::all($appointment)
                ->reject(fn (Appointment $member): bool => $member->is($appointment))
                ->pluck('id')
                ->all();

            // remove() plain-deletes a single appointment and reorganizes packages.
            AppointmentSessions::remove($appointment);

            $remaining = Appointment::query()
                ->whereIn('id', $remainingIds)
                ->orderBy('starts_at')
                ->get();

            return response()->json([
                'deleted_id' => $deletedId,
                'appointments' => $remaining
                    ->map(fn (Appointment $session): array => DesktopApi::appointment($session))
                    ->all(),
            ]);
        });
    }

    /**
     * Validate one session against hours/overlap and, on failure, rethrow a 422
     * naming the session: "N. seans (d.m.Y H:i): <original message>".
     */
    private function validateSession(Appointment $session, ?Setting $setting): void
    {
        if ($session->status !== 'confirmed') {
            return;
        }

        try {
            $this->schedule->validate(
                $session->starts_at->toImmutable(),
                $session->duration_min,
                $session,
                $setting,
            );
        } catch (ValidationException $exception) {
            $messages = $exception->errors()['starts_at'] ?? ['Randevu doğrulanamadı.'];

            throw ValidationException::withMessages([
                'starts_at' => [sprintf(
                    '%d. seans (%s): %s',
                    $session->session_no ?? 1,
                    $session->starts_at->format('d.m.Y H:i'),
                    $messages[0],
                )],
            ]);
        }
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

            // Package money lives on the root only (see AppointmentSessions).
            if ($appointment->isSessionChild() && array_key_exists('price', $validated)) {
                throw ValidationException::withMessages([
                    'price' => ['Paket fiyatı 1. seansta düzenlenir.'],
                ]);
            }
            if ($appointment->isSessionChild() && array_key_exists('subservices', $validated)) {
                throw ValidationException::withMessages([
                    'subservices' => ['Alt uygulamalar 1. seansta düzenlenir.'],
                ]);
            }
            if ($appointment->isSessionChild() && array_key_exists('body_regions', $validated)) {
                throw ValidationException::withMessages([
                    'body_regions' => ['Bölgeler 1. seansta düzenlenir.'],
                ]);
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

    public function updateServicePrices(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'prices' => ['required', 'array', function (string $attribute, mixed $value, $fail): void {
                $ids = array_keys((array) $value);
                $valid = array_filter($ids, fn (int|string $id): bool => ctype_digit((string) $id));

                if (count($valid) !== count($ids) || Service::query()->whereIn('id', $valid)->count() !== count($ids)) {
                    $fail('Fiyatlar mevcut hizmet kimlikleriyle gönderilmeli.');
                }
            }],
            'prices.*' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
        ]);

        // Son yazan kazanır: fiyat listesi için revizyon tutulmuyor.
        DB::transaction(function () use ($validated): void {
            foreach ($validated['prices'] as $id => $price) {
                Service::query()->whereKey($id)->update(['session_price' => $price]);
            }
        });

        return response()->json(['services' => $this->services()]);
    }

    /** Aktif hizmetler + randevularda geçen pasifler (/state ile aynı liste). */
    private function services(): Collection
    {
        $serviceIds = Appointment::query()->whereNotNull('service_id')->distinct()->pluck('service_id');

        return Service::query()
            ->where(function ($query) use ($serviceIds): void {
                $query->where('is_active', true);

                if ($serviceIds->isNotEmpty()) {
                    $query->orWhereIn('id', $serviceIds);
                }
            })
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'slug', 'name_tr', 'duration_min', 'subservices_tr', 'session_price'])
            ->map(fn (Service $service): array => [
                'id' => $service->id,
                'slug' => $service->slug,
                'title' => $service->name_tr,
                'duration_min' => $service->duration_min,
                'subservices' => $service->subserviceNames(),
                'session_price' => $service->session_price === null ? null : (float) $service->session_price,
            ])
            ->values();
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
            'price' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'subservices' => ['sometimes', 'nullable', 'array', 'max:30'],
            'subservices.*' => ['string', 'max:255'],
            'body_regions' => ['sometimes', 'nullable', 'array', 'max:'.count(BodyRegions::LABELS), function (string $attribute, mixed $value, $fail): void {
                foreach ((array) $value as $key) {
                    if (! is_string($key) || ! array_key_exists($key, BodyRegions::LABELS)) {
                        $fail('Bölgeler geçerli bölge anahtarları olmalı.');

                        return;
                    }
                }
            }],
            'session_total' => $patch ? ['prohibited'] : ['sometimes', 'integer', 'between:1,12'],
            'interval_days' => $patch ? ['prohibited'] : ['sometimes', 'integer', 'between:1,365'],
            'session_starts' => $patch ? ['prohibited'] : ['sometimes', 'array', 'max:11', function (string $attribute, mixed $value, $fail): void {
                foreach ((array) $value as $item) {
                    if (! is_string($item) || $this->parseStartsAt($item) === null) {
                        $fail('Seans başlangıç zamanları saat dilimi içeren geçerli ISO 8601 tarihleri olmalı.');

                        return;
                    }
                }
            }],
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
            'customer_id', 'service_id', 'duration_min', 'status', 'note', 'price',
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
            $payload['subservices'] = $root->subservices;
            $payload['body_regions'] = $root->body_regions;
        } elseif (array_key_exists('subservices', $validated)) {
            $payload['subservices'] = $this->subservices(
                $validated['subservices'],
                array_key_exists('service_id', $payload) ? $payload['service_id'] : $appointment->service_id,
            );
        } elseif (array_key_exists('service_id', $payload) && $payload['service_id'] !== $appointment->service_id) {
            // Hizmet değişti, alt uygulamalar gönderilmedi: eski hizmetinkiler geçersiz.
            $payload['subservices'] = null;
        }
        if (! $appointment->isSessionChild() && array_key_exists('body_regions', $validated)) {
            $payload['body_regions'] = BodyRegions::normalize($validated['body_regions']);
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

    /**
     * Alt uygulama adlarını hizmetin tanımına göre doğrular; hizmet sırasıyla,
     * tekrarsız döner. Boş liste null olarak saklanır.
     *
     * @param  array<int, string>|null  $names
     * @return array<int, string>|null
     */
    private function subservices(?array $names, mixed $serviceId): ?array
    {
        if ($names === null || $names === []) {
            return null;
        }

        $allowed = $serviceId === null
            ? []
            : (Service::query()->find($serviceId)?->subserviceNames() ?? []);

        if (array_diff($names, $allowed) !== []) {
            throw ValidationException::withMessages([
                'subservices' => [$allowed === []
                    ? 'Seçilen hizmetin alt uygulaması yok.'
                    : 'Alt uygulamalar seçilen hizmete ait olmalı.'],
            ]);
        }

        return array_values(array_intersect($allowed, $names));
    }

    /**
     * 2..N. seansların özel başlangıç zamanları; gönderilmediyse null.
     *
     * @param  array<string, mixed>  $validated
     * @return array<int, CarbonImmutable>|null
     */
    private function sessionStarts(array $validated, CarbonImmutable $startsAt, int $total): ?array
    {
        if (! array_key_exists('session_starts', $validated)) {
            return null;
        }

        if ($total < 2 || count($validated['session_starts']) !== $total - 1) {
            throw ValidationException::withMessages([
                'session_starts' => ['Seans başlangıçları yalnızca çok seanslı pakette ve seans sayısının bir eksiği kadar gönderilmeli.'],
            ]);
        }

        $previous = $startsAt;
        $sessionStarts = [];
        foreach (array_values($validated['session_starts']) as $value) {
            $sessionStart = $this->startsAt($value);
            if ($sessionStart->lessThanOrEqualTo($previous)) {
                throw ValidationException::withMessages([
                    'session_starts' => ['Her seans, ilk seanstan ve bir önceki seanstan sonra başlamalı.'],
                ]);
            }
            $sessionStarts[] = $previous = $sessionStart;
        }

        return $sessionStarts;
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
