<?php

namespace App\Console\Commands;

use App\Models\AdsAlert;
use App\Models\AdsCommand;
use App\Models\AdsDailyCampaign;
use App\Support\AdsWatchdog;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Günlük Google Ads özeti + anomali taraması. Varsayılan olarak dünün
 * verisini işler (veri bir gün gecikmeli gelir), kuralları çalıştırır ve
 * özeti Telegram'a gönderir. Alarm çıkması hata değildir (çıkış kodu 0);
 * yalnızca gönderim başarısız olursa hata koduyla döner - sessiz arıza,
 * özetin hiç ulaşmamasından daha kötüdür.
 */
class AdsDigestCommand extends Command
{
    /** Telegram yapılandırılmamış - hata değil, atlanan gönderim. */
    private const TELEGRAM_NOT_CONFIGURED = 'not-configured';

    protected $signature = 'ads:digest {--date= : İşlenecek gün (YYYY-MM-DD); varsayılan dün}';

    protected $description = 'Günlük Google Ads özetini çıkarır, anomali alarmlarını üretir ve Telegram\'a gönderir';

    public function handle(AdsWatchdog $watchdog): int
    {
        $date = $this->resolveDate();

        $alertCount = $watchdog->evaluate($date);

        $summary = $this->buildSummary($date);
        $text = $this->formatMessage($date, $summary, $alertCount);

        $delivery = $this->sendTelegram($text);

        // Konsolda etiketler gürültü: <b> at, kaçırılmış karakterleri geri çöz.
        $this->line(html_entity_decode(strip_tags($text), ENT_QUOTES, 'UTF-8'));
        $this->info("Alarm sayısı: {$alertCount}");

        if ($delivery === self::TELEGRAM_NOT_CONFIGURED) {
            $this->warn('Telegram yapılandırılmadı (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID) - gönderilmedi.');

            return self::SUCCESS;
        }

        if ($delivery === null) {
            // Sessiz başarısızlık en kötü senaryo: özet hesaplandı ama kimse görmedi.
            // Hata koduyla dönüyoruz ki cron/scheduler bunu bildirsin.
            $this->error('Telegram gönderimi BAŞARISIZ - ayrıntı için laravel.log.');

            return self::FAILURE;
        }

        $this->info("Telegram: gönderildi (message_id={$delivery}).");

        return self::SUCCESS;
    }

    private function resolveDate(): CarbonImmutable
    {
        $option = $this->option('date');

        if (is_string($option) && $option !== '') {
            return CarbonImmutable::parse($option)->startOfDay();
        }

        return CarbonImmutable::now()->subDay()->startOfDay();
    }

    /**
     * @return array<string, mixed>
     */
    private function buildSummary(CarbonImmutable $date): array
    {
        $dateString = $date->toDateString();

        $campaigns = AdsDailyCampaign::query()
            ->whereDate('date', $dateString)
            ->orderByDesc('cost')
            ->get();

        $cost = (float) $campaigns->sum('cost');
        $clicks = (int) $campaigns->sum('clicks');
        $conversions = (float) $campaigns->sum('conversions');
        $cpa = $conversions > 0 ? $cost / $conversions : null;

        $monthSpend = (float) AdsDailyCampaign::query()
            ->whereDate('date', '>=', $date->startOfMonth()->toDateString())->whereDate('date', '<=', $dateString)
            ->sum('cost');

        $budget = (float) config('ads.monthly_budget');
        $budgetPct = $budget > 0 ? ($monthSpend / $budget) * 100 : 0.0;

        $rank = ['critical' => 0, 'warning' => 1, 'info' => 2];
        $alerts = AdsAlert::query()
            ->whereDate('detected_on', $dateString)
            ->whereNull('resolved_at')
            ->get()
            ->sortBy(fn ($a) => $rank[$a->severity] ?? 9)
            ->values();

        return [
            'cost' => $cost,
            'clicks' => $clicks,
            'conversions' => $conversions,
            'cpa' => $cpa,
            'month_spend' => $monthSpend,
            'monthly_budget' => $budget,
            'budget_pct' => $budgetPct,
            'campaigns' => $campaigns,
            'alerts' => $alerts,
        ];
    }

    /**
     * @param  array<string, mixed>  $s
     */
    private function formatMessage(CarbonImmutable $date, array $s, int $alertCount): string
    {
        $lines = [];
        $lines[] = '<b>Google Ads Günlük Özet — '.$date->toDateString().'</b>';
        $lines[] = '';
        $lines[] = 'Harcama: '.$this->money($s['cost']).' ₺';
        $lines[] = 'Tıklama: '.$s['clicks'];
        $lines[] = 'Dönüşüm: '.$this->money($s['conversions']);
        $lines[] = 'Harmanlanmış CPA: '.($s['cpa'] === null ? '—' : $this->money($s['cpa']).' ₺');
        $lines[] = 'Aylık bütçe: '.$this->money($s['month_spend']).' / '.$this->money($s['monthly_budget'])
            .' ₺ (%'.$this->money($s['budget_pct']).')';

        $lines[] = '';
        $lines[] = '<b>Kampanyalar</b>';
        if ($s['campaigns']->isEmpty()) {
            $lines[] = '(veri yok)';
        } else {
            foreach ($s['campaigns'] as $c) {
                $lines[] = '• '.$this->escape($c->campaign_name).': '.$this->money((float) $c->cost).' ₺, '
                    .((int) $c->clicks).' tık, '.$this->money((float) $c->conversions).' dön.';
            }
        }

        $lines[] = '';
        $lines[] = '<b>Açık alarmlar ('.$alertCount.')</b>';
        if ($s['alerts']->isEmpty()) {
            $lines[] = 'Alarm yok.';
        } else {
            foreach ($s['alerts'] as $a) {
                $lines[] = '⚠️ ['.strtoupper($a->severity).'] '.$this->escape($a->message);
            }
        }

        $lines[] = '';
        $lines[] = $this->commandLines();

        return implode("\n", $lines);
    }

    /**
     * Komut kuyruğunun durumu. Onay bekleyen bir şey varsa özetin içinde
     * görünmeli - panele girmeyi hatırlatan tek yer bu.
     */
    private function commandLines(): string
    {
        $lines = ['<b>Ads komutları</b>'];

        $applied = AdsCommand::query()
            ->where('status', 'applied')
            ->whereDate('applied_at', CarbonImmutable::now()->subDay()->toDateString())
            ->get();

        $failed = AdsCommand::query()->where('status', 'failed')->count();
        $waiting = AdsCommand::query()
            ->where('tier', 'approval')
            ->where('status', 'pending')
            ->get();

        if ($applied->isEmpty() && $failed === 0 && $waiting->isEmpty()) {
            $lines[] = 'Bekleyen veya uygulanan komut yok.';

            return implode("\n", $lines);
        }

        if ($applied->isNotEmpty()) {
            $lines[] = '✅ Otomatik uygulandı ('.$applied->count().'):';
            foreach ($applied as $c) {
                $lines[] = '  • '.$this->escape($c->reason);
            }
        }

        if ($waiting->isNotEmpty()) {
            $lines[] = '⏳ Onayını bekliyor ('.$waiting->count().'):';
            foreach ($waiting as $c) {
                $lines[] = '  • '.$this->escape($c->reason);
            }
            $lines[] = 'Onay: '.config('app.url').'/admin/ads-commands';
        }

        if ($failed > 0) {
            $lines[] = '❌ Uygulanamayan komut: '.$failed.' (panelde hata metnine bak).';
        }

        return implode("\n", $lines);
    }

    /**
     * Telegram HTML modunda kaçırma. Kampanya adları ve arama terimleri
     * kullanıcı/reklamveren kaynaklı: içindeki bir '<' tüm gönderimi 400'e
     * düşürür. Yalnızca bizim eklediğimiz <b> etiketleri ham kalır.
     */
    private function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_NOQUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    /**
     * Özeti Telegram'a gönderir.
     *
     * @return int|string|null Başarılıysa message_id, yapılandırma yoksa
     *                         self::TELEGRAM_NOT_CONFIGURED, başarısızsa null.
     */
    private function sendTelegram(string $text): int|string|null
    {
        $token = config('services.telegram.bot_token');
        $chatId = config('services.telegram.chat_id');

        if (empty($token) || empty($chatId)) {
            return self::TELEGRAM_NOT_CONFIGURED;
        }

        // parse_mode HTML: yalnızca bizim <b> başlıklarımız etiket; kampanya adı
        // ve arama terimi gibi dinamik değerler formatMessage'da kaçırılıyor.
        try {
            $response = Http::timeout(15)->asForm()->post(
                "https://api.telegram.org/bot{$token}/sendMessage",
                [
                    'chat_id' => $chatId,
                    'text' => $text,
                    'parse_mode' => 'HTML',
                    'disable_web_page_preview' => true,
                ]
            );
        } catch (\Throwable $e) {
            Log::error('Ads digest Telegram gönderimi hata verdi.', ['exception' => $e->getMessage()]);

            return null;
        }

        $messageId = $response->json('result.message_id');

        if (! $response->successful() || $response->json('ok') !== true || $messageId === null) {
            Log::error('Ads digest Telegram gönderimi reddedildi.', [
                'status' => $response->status(),
                // Telegram hata nedenini burada döndürür (ör. chat not found).
                'description' => $response->json('description'),
            ]);

            return null;
        }

        return $messageId;
    }

    private function money(float $value): string
    {
        return number_format($value, 2, '.', '');
    }
}
