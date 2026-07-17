<?php

namespace App\Support;

use App\Models\Announcement;
use App\Models\Appointment;
use App\Models\AppUser;
use App\Models\Campaign;
use Illuminate\Database\Eloquent\Builder;

class AppChatContext
{
    private const STATUS_LABELS = [
        'requested' => 'Talep Edildi',
        'confirmed' => 'Onaylandı',
        'cancelled' => 'İptal',
        'no_show' => 'Gelmedi',
    ];

    public function __construct(private Loyalty $loyalty) {}

    /**
     * Build the per-user context appended to the shared chat system prompt.
     * All personal data here belongs strictly to the authenticated user.
     */
    public function build(AppUser $user): string
    {
        $sections = [
            'UYGULAMA BAĞLAMI: Kullanıcı Stria Studio mobil uygulamasından yazıyor.',
            $this->userLine($user),
            $this->appointments($user),
            $this->loyaltySummary($user),
            $this->campaigns(),
            $this->announcements(),
            $this->rules(),
        ];

        return implode("\n\n", $sections);
    }

    private function userLine(AppUser $user): string
    {
        return "KULLANICI: {$user->name} (müşteri kodu: {$user->code})";
    }

    private function appointments(AppUser $user): string
    {
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
            ->limit(10)
            ->get();

        if ($appointments->isEmpty()) {
            return 'RANDEVULAR: Kayıtlı randevu yok.';
        }

        $lines = $appointments->map(function (Appointment $appointment): string {
            $when = $appointment->starts_at->format('d.m.Y H:i');
            $service = $appointment->service?->name_tr ?? 'Hizmet belirtilmemiş';
            $status = self::STATUS_LABELS[$appointment->status] ?? $appointment->status;

            return "- {$when} — {$service} — {$status}";
        })->implode("\n");

        return "RANDEVULAR (son 10):\n{$lines}";
    }

    private function loyaltySummary(AppUser $user): string
    {
        $loyalty = $this->loyalty->for($user);

        if ($loyalty === null) {
            return 'SADAKAT: Aktif sadakat kaydı yok.';
        }

        return sprintf(
            'SADAKAT: Tamamlanan işlem: %d, kampanya: %s, sonraki ödüle kalan: %d',
            $loyalty['completed_count'],
            $loyalty['campaign_title'],
            $loyalty['remaining'],
        );
    }

    private function campaigns(): string
    {
        $today = now()->toDateString();

        $campaigns = Campaign::query()
            ->where('is_active', true)
            ->where(function (Builder $query) use ($today): void {
                $query->whereNull('starts_at')->orWhereDate('starts_at', '<=', $today);
            })
            ->where(function (Builder $query) use ($today): void {
                $query->whereNull('ends_at')->orWhereDate('ends_at', '>=', $today);
            })
            ->orderByRaw("CASE WHEN kind = 'promo' THEN 0 ELSE 1 END")
            ->orderBy('id')
            ->get();

        if ($campaigns->isEmpty()) {
            return 'AKTİF KAMPANYALAR: Şu an aktif kampanya yok.';
        }

        $lines = $campaigns->map(fn (Campaign $campaign): string => '- '.$this->campaignLine($campaign))->implode("\n");

        return "AKTİF KAMPANYALAR:\n{$lines}";
    }

    private function campaignLine(Campaign $campaign): string
    {
        if ($campaign->kind === 'loyalty') {
            return sprintf('%s (her %d. işleme %%%d)', $campaign->title, $campaign->nth, $campaign->discount_percent);
        }

        $old = $campaign->old_price !== null ? '₺'.$campaign->old_price : '?';
        $new = $campaign->new_price !== null ? '₺'.$campaign->new_price : '?';
        $validity = ($campaign->starts_at || $campaign->ends_at)
            ? sprintf('%s-%s', $campaign->starts_at?->format('d.m.Y') ?? '', $campaign->ends_at?->format('d.m.Y') ?? '')
            : 'süresiz';

        return sprintf('%s (eski %s → %s, geçerlilik: %s)', $campaign->title, $old, $new, $validity);
    }

    private function announcements(): string
    {
        $today = now()->toDateString();

        $announcements = Announcement::query()
            ->where('is_active', true)
            ->where(function (Builder $query) use ($today): void {
                $query->whereNull('starts_at')->orWhereDate('starts_at', '<=', $today);
            })
            ->where(function (Builder $query) use ($today): void {
                $query->whereNull('ends_at')->orWhereDate('ends_at', '>=', $today);
            })
            ->orderByDesc('id')
            ->get();

        if ($announcements->isEmpty()) {
            return 'AKTİF DUYURULAR: Şu an aktif duyuru yok.';
        }

        $lines = $announcements
            ->map(fn (Announcement $announcement): string => "- {$announcement->title}: {$announcement->body}")
            ->implode("\n");

        return "AKTİF DUYURULAR:\n{$lines}";
    }

    private function rules(): string
    {
        return 'KURALLAR: Yukarıdaki kişisel veriler YALNIZ bu oturumdaki kullanıcıya aittir ve yalnız ona söylenebilir.'
            .' BAŞKA kullanıcı, müşteri veya üçüncü kişiler hakkında ASLA bilgi verme, tahminde bulunma, doğrulama yapma;'
            .' böyle bir soru gelirse yalnızca kendi bilgilerini görebildiğini söyle.'
            .' Kullanıcı kendi randevusunu iptal etmek isterse Randevular sekmesindeki Gelemeyeceğim butonunu tarif et (12 saat kuralını hatırlat).'
            .' Randevu almak isterse Randevu Al sekmesine yönlendir.';
    }
}
