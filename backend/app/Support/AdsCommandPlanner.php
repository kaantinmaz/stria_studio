<?php

namespace App\Support;

use App\Models\AdsAlert;
use App\Models\AdsCommand;
use Carbon\CarbonImmutable;

/**
 * Watchdog alarmlarını uygulanabilir komutlara çevirir. Şu an tek kaynak:
 * negative_candidate alarmlarındaki terim listesi → add_negative_keyword
 * komutları. Komutlar kuyruğa yazılır, Ads Script uygular.
 *
 * Idempotans command_hash üzerinden: aynı mantıksal komut ikinci kez üretilmez.
 * Owner bir komutu reddettiyse (status=rejected) ISRAR ETMEYİZ — hash zaten
 * mevcut sayılır ve yeniden üretilmez.
 */
class AdsCommandPlanner
{
    /** negative_candidate penceresi (AdsWatchdog::NEGATIVE_DAYS ile aynı). */
    private const NEGATIVE_DAYS = 14;

    /**
     * Verilen günün alarmlarından komut üretir ve üretilen komut sayısını döner.
     */
    public function planFrom(CarbonImmutable $date): int
    {
        return $this->planNegativeKeywords($date);
    }

    /**
     * negative_candidate alarm(lar)ının context['terms'] listesinden
     * add_negative_keyword komutları (match=phrase) üretir.
     */
    private function planNegativeKeywords(CarbonImmutable $date): int
    {
        $alerts = AdsAlert::query()
            ->whereDate('detected_on', $date->toDateString())
            ->where('code', 'negative_candidate')
            ->get();

        $created = 0;

        foreach ($alerts as $alert) {
            $terms = $alert->context['terms'] ?? [];

            foreach ($terms as $term) {
                $text = $term['search_term'] ?? null;
                if (! is_string($text) || $text === '') {
                    continue;
                }

                $clicks = (int) ($term['clicks'] ?? 0);
                $cost = (float) ($term['cost'] ?? 0);

                $payload = ['text' => $text, 'match' => 'phrase'];
                $hash = AdsCommand::hashFor('add_negative_keyword', $alert->campaign_name, null, $payload);

                // Hash HANGİ statüde olursa olsun (rejected dahil) varsa üretme.
                if (AdsCommand::query()->where('command_hash', $hash)->exists()) {
                    continue;
                }

                AdsCommand::query()->create([
                    'kind' => 'add_negative_keyword',
                    'tier' => AdsCommand::tierFor('add_negative_keyword', $payload),
                    'status' => 'pending',
                    'campaign_name' => $alert->campaign_name,
                    'ad_group_name' => null,
                    'payload' => $payload,
                    'reason' => self::NEGATIVE_DAYS.' günde '.$clicks.' tıklama, 0 dönüşüm, '
                        .$this->money($cost).' ₺ boşa harcama.',
                    'command_hash' => $hash,
                    'source' => 'watchdog',
                ]);

                $created++;
            }
        }

        return $created;
    }

    /** Para/sayı biçimi: sade "1234.56" (nokta ondalık, gruplama yok). */
    private function money(float $value): string
    {
        return number_format($value, 2, '.', '');
    }
}
