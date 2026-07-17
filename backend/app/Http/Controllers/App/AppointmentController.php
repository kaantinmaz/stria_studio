<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Service;
use App\Support\AppointmentSlots;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AppointmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $customerId = $user->customer()->value('id');
        $appointments = Appointment::query()
            ->with('service:id,name_tr')
            ->where(function (Builder $query) use ($customerId, $user): void {
                $query->where('app_user_id', $user->id);

                if ($customerId) {
                    $query->orWhere('customer_id', $customerId);
                }
            })
            ->orderByDesc('starts_at')
            ->get()
            ->map(fn (Appointment $appointment): array => [
                'id' => $appointment->id,
                'service_name' => $appointment->service?->name_tr,
                'starts_at' => $appointment->starts_at->toIso8601String(),
                'duration_min' => $appointment->duration_min,
                'status' => $appointment->status,
                'photos' => collect($appointment->photos ?? [])->map(fn ($p) => str_starts_with($p, 'http') || str_starts_with($p, '/') ? $p : asset('storage/'.$p))->values()->all(),
            ])
            ->values();

        return response()->json(['data' => $appointments]);
    }

    public function store(Request $request, AppointmentSlots $appointmentSlots): JsonResponse
    {
        $validated = $request->validate([
            'service_slug' => [
                'required',
                'string',
                Rule::exists('services', 'slug')->where('is_active', true),
            ],
            'date' => ['required', 'date_format:Y-m-d'],
            'time' => ['required', 'date_format:H:i'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);
        $date = CarbonImmutable::createFromFormat('!Y-m-d', $validated['date']);
        $this->ensureNotPast($date);

        if (! in_array($validated['time'], $appointmentSlots->forDate($date), true)) {
            throw ValidationException::withMessages([
                'time' => ['Seçilen randevu saati uygun değil.'],
            ]);
        }

        $user = $request->user();
        $appointment = Appointment::query()->create([
            'customer_id' => $user->customer()->value('id'),
            'app_user_id' => $user->id,
            'service_id' => Service::query()->where('slug', $validated['service_slug'])->value('id'),
            'starts_at' => CarbonImmutable::createFromFormat(
                '!Y-m-d H:i',
                $validated['date'].' '.$validated['time'],
            ),
            'duration_min' => 60,
            'note' => filled($validated['note'] ?? null) ? trim($validated['note']) : null,
            'status' => 'requested',
        ]);

        return response()->json([
            'data' => [
                'id' => $appointment->id,
                'status' => $appointment->status,
            ],
        ], 201);
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $customerId = $user->customer()->value('id');
        $appointment = Appointment::query()
            ->where('id', $id)
            ->where(function (Builder $query) use ($customerId, $user): void {
                $query->where('app_user_id', $user->id);

                if ($customerId) {
                    $query->orWhere('customer_id', $customerId);
                }
            })
            ->first();

        abort_if($appointment === null, 404);

        if (! in_array($appointment->status, ['requested', 'confirmed'], true)) {
            throw ValidationException::withMessages([
                'status' => ['Bu randevu iptal edilemez.'],
            ]);
        }

        if ($appointment->starts_at->lessThanOrEqualTo(CarbonImmutable::now()->addHours(12))) {
            throw ValidationException::withMessages([
                'starts_at' => ['Randevu başlangıcına 12 saatten az kaldığı için uygulamadan iptal edilemiyor. Lütfen bizi arayın.'],
            ]);
        }

        $appointment->update(['status' => 'cancelled']);

        return response()->json([
            'data' => [
                'id' => $appointment->id,
                'status' => $appointment->status,
            ],
        ]);
    }

    public function slots(Request $request, AppointmentSlots $appointmentSlots): JsonResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
        ]);
        $date = CarbonImmutable::createFromFormat('!Y-m-d', $validated['date']);
        $this->ensureNotPast($date);

        return response()->json([
            'data' => [
                'date' => $validated['date'],
                'slots' => $appointmentSlots->forDate($date),
            ],
        ]);
    }

    private function ensureNotPast(CarbonImmutable $date): void
    {
        if ($date->isBefore(CarbonImmutable::today())) {
            throw ValidationException::withMessages([
                'date' => ['Geçmiş bir tarih seçilemez.'],
            ]);
        }
    }
}
