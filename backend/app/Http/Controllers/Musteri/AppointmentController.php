<?php

namespace App\Http\Controllers\Musteri;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Service;
use App\Support\AppointmentSessions;
use App\Support\BodyRegions;
use App\Support\MusteriPanel;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\View\View;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AppointmentController extends Controller
{
    private const STATUSES = ['confirmed', 'requested', 'cancelled', 'no_show'];

    private const PAYMENTS = ['nakit', 'kart', 'havale'];

    public function index(Request $request): View
    {
        $appointments = $this->filtered($request)
            ->with(['customer:id,name,phone', 'service:id,name_tr'])
            ->orderBy('starts_at')
            ->paginate(25)
            ->withQueryString();

        return view('musteri.randevular.index', [
            'appointments' => $appointments,
            'services' => Service::query()->orderBy('name_tr')->get(['id', 'name_tr']),
            'filters' => $this->filterValues($request),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $appointments = $this->filtered($request)
            ->with(['customer:id,name,phone', 'service:id,name_tr'])
            ->orderBy('starts_at')
            ->get();

        $rows = [['Tarih', 'Saat', 'Müşteri', 'Telefon', 'Hizmet', 'Seans', 'Süre (dk)', 'Durum', 'Kaynak', 'Tutar', 'Ödendi', 'Ödeme']];

        foreach ($appointments as $a) {
            $rows[] = [
                $a->starts_at->format('d.m.Y'),
                $a->starts_at->format('H:i'),
                $a->customer?->name ?? 'Silinmiş müşteri',
                $a->customer?->phone ?? '',
                $a->service?->name_tr ?? '',
                $a->isSessionPackage() ? "{$a->session_no}/{$a->session_total}" : '',
                (string) $a->duration_min,
                MusteriPanel::statusLabel($a->status),
                MusteriPanel::sourceLabel($a),
                $a->price === null ? '' : number_format((float) $a->price, 2, ',', '.'),
                $a->is_paid ? 'Evet' : 'Hayır',
                MusteriPanel::paymentLabel($a->payment_method),
            ];
        }

        return $this->csv('randevular-'.now()->format('Y-m-d').'.csv', $rows);
    }

    public function show(int $id): View
    {
        $appointment = Appointment::query()
            ->with(['customer', 'service', 'campaign'])
            ->findOrFail($id);
        $root = AppointmentSessions::root($appointment);
        $sessions = AppointmentSessions::all($appointment)
            ->load(['service:id,name_tr']);

        return view('musteri.randevular.show', [
            'appointment' => $appointment,
            'root' => $root,
            'sessions' => $sessions,
        ]);
    }

    public function create(Request $request): View
    {
        return view('musteri.randevular.form', [
            'appointment' => null,
            'customers' => Customer::query()->orderBy('name')->get(['id', 'name', 'phone']),
            'services' => Service::query()->orderBy('name_tr')->get(['id', 'name_tr', 'duration_min', 'subservices_tr']),
            'presetCustomerId' => $request->integer('customer_id') ?: null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateAppointment($request, false);

        $customerId = $this->resolveCustomerId($validated);
        $startsAt = $this->parseStartsAt($validated['starts_at']);
        $total = (int) ($validated['session_total'] ?? 1);
        $interval = (int) ($validated['interval_days'] ?? 28);
        $serviceId = $validated['service_id'] ?? null;

        $appointment = DB::transaction(function () use ($validated, $customerId, $serviceId, $startsAt, $total, $interval): Appointment {
            $appointment = Appointment::query()->create([
                'customer_id' => $customerId,
                'service_id' => $serviceId,
                'starts_at' => $startsAt,
                'duration_min' => $validated['duration_min'],
                'status' => $validated['status'],
                'note' => $this->nullableString($validated['note'] ?? null),
                'price' => $validated['price'] ?? null,
                'is_paid' => (bool) ($validated['is_paid'] ?? false),
                'payment_method' => $validated['payment_method'] ?? null,
                'subservices' => $this->subservices($validated['subservices'] ?? null, $serviceId),
                'body_regions' => BodyRegions::normalize($validated['body_regions'] ?? null),
            ]);

            if ($total >= 2) {
                AppointmentSessions::split($appointment, $total, $interval);
            }

            return AppointmentSessions::root($appointment->refresh());
        });

        return redirect()
            ->route('musteri.appointments.show', $appointment->id)
            ->with('flash', ['type' => 'success', 'message' => 'Randevu oluşturuldu.']);
    }

    public function edit(int $id): View
    {
        $appointment = Appointment::query()->findOrFail($id);

        return view('musteri.randevular.form', [
            'appointment' => $appointment,
            'customers' => Customer::query()->orderBy('name')->get(['id', 'name', 'phone']),
            'services' => Service::query()->orderBy('name_tr')->get(['id', 'name_tr', 'duration_min', 'subservices_tr']),
            'presetCustomerId' => $appointment->customer_id,
        ]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $appointment = Appointment::query()->findOrFail($id);
        $validated = $this->validateAppointment($request, true);

        // Para yalnızca paketin kökünde düzenlenir (AppointmentSessions değişmezi).
        if ($appointment->isSessionChild() && $request->filled('price')) {
            throw ValidationException::withMessages([
                'price' => ['Paket fiyatı 1. seansta düzenlenir.'],
            ]);
        }

        DB::transaction(function () use ($appointment, $validated, $request): void {
            $serviceId = $validated['service_id'] ?? null;
            $payload = [
                'starts_at' => $this->parseStartsAt($validated['starts_at']),
                'duration_min' => $validated['duration_min'],
                'status' => $validated['status'],
                'note' => $this->nullableString($validated['note'] ?? null),
            ];

            if (! $appointment->isSessionChild()) {
                // Kök (veya tek randevu): hizmet, alt uygulamalar, bölgeler ve para alanları.
                $payload['customer_id'] = $this->resolveCustomerId($validated);
                $payload['service_id'] = $serviceId;
                $payload['subservices'] = $this->subservices($validated['subservices'] ?? null, $serviceId);
                $payload['body_regions'] = BodyRegions::normalize($validated['body_regions'] ?? null);
                $payload['price'] = $validated['price'] ?? null;
                $payload['is_paid'] = (bool) ($validated['is_paid'] ?? false);
                $payload['payment_method'] = $validated['payment_method'] ?? null;
            }

            $wasPackage = $appointment->isSessionPackage();
            $appointment->fill($payload);
            if ($appointment->isDirty()) {
                $appointment->save();
            }

            if ($wasPackage) {
                AppointmentSessions::resync($appointment);
            }
        });

        return redirect()
            ->route('musteri.appointments.show', $appointment->id)
            ->with('flash', ['type' => 'success', 'message' => 'Randevu güncellendi.']);
    }

    public function destroy(int $id): RedirectResponse
    {
        $appointment = Appointment::query()->findOrFail($id);

        DB::transaction(fn () => AppointmentSessions::remove($appointment));

        return redirect()
            ->route('musteri.appointments.index')
            ->with('flash', ['type' => 'success', 'message' => 'Randevu silindi.']);
    }

    public function confirm(int $id): RedirectResponse
    {
        return $this->setStatus($id, 'confirmed', 'Randevu onaylandı.');
    }

    public function cancel(int $id): RedirectResponse
    {
        return $this->setStatus($id, 'cancelled', 'Randevu iptal edildi.');
    }

    private function setStatus(int $id, string $status, string $message): RedirectResponse
    {
        $appointment = Appointment::query()->findOrFail($id);
        $appointment->update(['status' => $status]);

        return redirect()
            ->back()
            ->with('flash', ['type' => 'success', 'message' => $message]);
    }

    private function filtered(Request $request): Builder
    {
        $query = Appointment::query();

        $from = $request->filled('from') ? $this->parseDate($request->string('from')) : null;
        $to = $request->filled('to') ? $this->parseDate($request->string('to')) : null;

        // Varsayılan: bugünden itibaren yaklaşan randevular.
        if ($from === null && $to === null && ! $request->filled('status') && ! $request->filled('q')) {
            $query->where('starts_at', '>=', CarbonImmutable::now()->startOfDay());
        }

        if ($from !== null) {
            $query->where('starts_at', '>=', $from->startOfDay());
        }
        if ($to !== null) {
            $query->where('starts_at', '<=', $to->endOfDay());
        }

        if (in_array($request->string('status')->value(), self::STATUSES, true)) {
            $query->where('status', $request->string('status')->value());
        }

        if ($request->filled('service_id')) {
            $query->where('service_id', $request->integer('service_id'));
        }

        $source = $request->string('source')->value();
        if ($source === 'mobil') {
            $query->whereNotNull('app_user_id');
        } elseif ($source === 'panel') {
            $query->whereNull('app_user_id');
        }

        if ($request->filled('q')) {
            $term = '%'.$request->string('q')->value().'%';
            $query->whereHas('customer', function (Builder $q) use ($term): void {
                $q->where('name', 'like', $term)->orWhere('phone', 'like', $term);
            });
        }

        return $query;
    }

    /** @return array<string, mixed> */
    private function filterValues(Request $request): array
    {
        return [
            'from' => $request->string('from')->value(),
            'to' => $request->string('to')->value(),
            'status' => $request->string('status')->value(),
            'service_id' => $request->string('service_id')->value(),
            'source' => $request->string('source')->value(),
            'q' => $request->string('q')->value(),
        ];
    }

    /** @return array<string, mixed> */
    private function validateAppointment(Request $request, bool $isUpdate): array
    {
        return $request->validate([
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'new_customer_name' => $isUpdate ? ['nullable', 'string', 'max:255'] : ['nullable', 'string', 'max:255', 'required_without:customer_id'],
            'new_customer_phone' => ['nullable', 'string', 'max:255'],
            'service_id' => ['nullable', 'integer', 'exists:services,id'],
            'starts_at' => ['required', 'string', 'max:32', function (string $attr, mixed $value, $fail): void {
                if ($this->parseStartsAt((string) $value) === null) {
                    $fail('Geçerli bir tarih/saat girin.');
                }
            }],
            'duration_min' => ['required', 'integer', 'between:5,1440'],
            'status' => ['required', 'string', Rule::in(self::STATUSES)],
            'note' => ['nullable', 'string', 'max:10000'],
            'price' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'is_paid' => ['nullable', 'boolean'],
            'payment_method' => ['nullable', 'string', Rule::in(self::PAYMENTS)],
            'subservices' => ['nullable', 'array', 'max:30'],
            'subservices.*' => ['string', 'max:255'],
            'body_regions' => ['nullable', 'array', 'max:'.count(BodyRegions::LABELS)],
            'body_regions.*' => ['string', Rule::in(array_keys(BodyRegions::LABELS))],
            'session_total' => $isUpdate ? ['prohibited'] : ['nullable', 'integer', 'between:1,12'],
            'interval_days' => $isUpdate ? ['prohibited'] : ['nullable', 'integer', 'between:1,365'],
        ]);
    }

    /** @param array<string, mixed> $validated */
    private function resolveCustomerId(array $validated): int
    {
        if (! empty($validated['customer_id'])) {
            return (int) $validated['customer_id'];
        }

        $customer = Customer::query()->create([
            'name' => trim((string) $validated['new_customer_name']),
            'phone' => $this->nullableString($validated['new_customer_phone'] ?? null),
        ]);

        return $customer->id;
    }

    /**
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

    private function parseStartsAt(string $value): ?CarbonImmutable
    {
        foreach (['!Y-m-d\TH:i', '!Y-m-d H:i', '!Y-m-d\TH:i:s', '!Y-m-d H:i:s'] as $format) {
            $parsed = $this->tryFormat($format, $value);
            if ($parsed !== null) {
                return $parsed;
            }
        }

        return null;
    }

    private function parseDate(string $value): ?CarbonImmutable
    {
        return $this->tryFormat('!Y-m-d', $value);
    }

    private function tryFormat(string $format, string $value): ?CarbonImmutable
    {
        try {
            $parsed = CarbonImmutable::createFromFormat($format, $value, config('app.timezone'));
        } catch (\Throwable) {
            return null;
        }

        // PHP 8.2+: getLastErrors() temiz ayrıştırmada false döner.
        $errors = CarbonImmutable::getLastErrors();
        $clean = $errors === false || ($errors['warning_count'] === 0 && $errors['error_count'] === 0);

        return $parsed !== false && $clean ? $parsed : null;
    }

    private function nullableString(mixed $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }

    /**
     * @param  array<int, array<int, string>>  $rows
     */
    private function csv(string $filename, array $rows): StreamedResponse
    {
        return response()->streamDownload(function () use ($rows): void {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF"); // UTF-8 BOM (Excel TR)
            foreach ($rows as $row) {
                fputcsv($handle, $row, ';');
            }
            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'X-Robots-Tag' => 'noindex, nofollow',
        ]);
    }
}
