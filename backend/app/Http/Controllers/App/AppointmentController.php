<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Campaign;
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
            ->with(['service:id,name_tr', 'campaign:id,title,new_price'])
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
                'campaign' => $appointment->campaign !== null ? [
                    'title' => $appointment->campaign->title,
                    'new_price' => $appointment->campaign->new_price !== null ? (string) $appointment->campaign->new_price : null,
                ] : null,
            ])
            ->values();

        return response()->json(['data' => $appointments]);
    }

    /**
     * Uygulama hep geçerli değer gönderiyor; bu mesajlar hizmet arada pasife
     * alınırsa kullanıcının İngilizce hata görmemesi için.
     */
    private const VALIDATION_MESSAGES = [
        'service_slug.required' => 'Bir işlem seçmelisin.',
        'service_slug.exists' => 'Seçtiğin işlem artık uygun değil, lütfen tekrar seç.',
        'date.required' => 'Bir gün seçmelisin.',
        'date.date_format' => 'Geçersiz tarih.',
        'time.required' => 'Bir saat seçmelisin.',
        'time.date_format' => 'Geçersiz saat.',
        'note.max' => 'Not en fazla 500 karakter olabilir.',
    ];

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
            'campaign_id' => ['nullable', 'integer'],
        ], self::VALIDATION_MESSAGES);
        $date = CarbonImmutable::createFromFormat('!Y-m-d', $validated['date']);
        $this->ensureNotPast($date);

        $service = Service::query()->where('slug', $validated['service_slug'])->firstOrFail();

        if (! in_array($validated['time'], $appointmentSlots->forDate($date, (int) $service->duration_min), true)) {
            throw ValidationException::withMessages([
                'time' => ['Seçilen randevu saati uygun değil.'],
            ]);
        }

        $user = $request->user();
        $campaignId = $this->resolveCampaignId($validated['campaign_id'] ?? null, $service->id);

        $appointment = Appointment::query()->create([
            'customer_id' => $user->customer()->value('id'),
            'app_user_id' => $user->id,
            'service_id' => $service->id,
            'campaign_id' => $campaignId,
            'starts_at' => CarbonImmutable::createFromFormat(
                '!Y-m-d H:i',
                $validated['date'].' '.$validated['time'],
            ),
            'duration_min' => (int) $service->duration_min,
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
            'service_slug' => [
                'required',
                'string',
                Rule::exists('services', 'slug')->where('is_active', true),
            ],
        ], self::VALIDATION_MESSAGES);
        $date = CarbonImmutable::createFromFormat('!Y-m-d', $validated['date']);
        $this->ensureNotPast($date);
        $duration = (int) Service::query()->where('slug', $validated['service_slug'])->value('duration_min');

        return response()->json([
            'data' => [
                'date' => $validated['date'],
                'duration_min' => $duration,
                'slots' => $appointmentSlots->forDate($date, $duration),
            ],
        ]);
    }

    private function resolveCampaignId(?int $campaignId, ?int $serviceId): ?int
    {
        if ($campaignId === null) {
            return null;
        }

        $today = CarbonImmutable::today()->toDateString();

        $campaign = Campaign::query()
            ->where('id', $campaignId)
            ->where('is_active', true)
            ->where('kind', 'promo')
            ->where(function (Builder $query) use ($today): void {
                $query->whereNull('starts_at')->orWhereDate('starts_at', '<=', $today);
            })
            ->where(function (Builder $query) use ($today): void {
                $query->whereNull('ends_at')->orWhereDate('ends_at', '>=', $today);
            })
            ->first();

        if ($campaign === null) {
            throw ValidationException::withMessages([
                'campaign_id' => ['Kampanya artık geçerli değil.'],
            ]);
        }

        $serviceIds = $campaign->service_ids;
        if (! empty($serviceIds) && ! in_array($serviceId, array_map('intval', $serviceIds), true)) {
            throw ValidationException::withMessages([
                'campaign_id' => ['Kampanya bu hizmet için geçerli değil.'],
            ]);
        }

        return $campaign->id;
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
