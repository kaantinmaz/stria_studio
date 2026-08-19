<?php

namespace App\Support;

use App\Models\AdsAdIssue;
use App\Models\AdsAlert;
use App\Models\AdsDailyCampaign;
use App\Models\AdsDailyKeyword;
use App\Models\AdsIngestRun;
use App\Models\AdsSearchTerm;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

/**
 * Google Ads kural motoru: verilen gün için performans verisini tarar,
 * anomali/uyarı üretir ve ads_alerts tablosuna idempotent (upsert) yazar.
 *
 * Eşikler config('ads.*')'ten okunur. Kurallara özgü sabitler (pencere
 * uzunluğu, sapma yüzdesi, minimum tıklama vb.) burada sınıf sabiti olarak
 * tutulur — kural metni ile birebir okunabilir kalsın diye.
 */
class AdsWatchdog
{
    /** tracking_dead: dönüşüm 0 iken en az bu kadar tıklama şüphe uyandırır. */
    private const TRACKING_DEAD_MIN_CLICKS = 20;

    /** zero_conversion_streak: 0 dönüşümlü kaç gün + minimum harcama. */
    private const STREAK_DAYS = 3;
    private const STREAK_MIN_COST = 300.0;

    /** cpa_over_ceiling / spend_anomaly: son N gün penceresi. */
    private const WEEK_DAYS = 7;

    /** budget_limited: son N gün ortalama kayıp IS eşiği. */
    private const BUDGET_LIMITED_DAYS = 3;
    private const BUDGET_LIMITED_SHARE = 0.20;

    /** spend_anomaly: önceki dönemde en az bu kadar gün veri + sapma eşiği. */
    private const ANOMALY_MIN_DAYS = 3;
    private const ANOMALY_DEVIATION = 0.40;

    /** negative_candidate: son N gün, minimum tıklama/harcama, en pahalı N terim. */
    private const NEGATIVE_DAYS = 14;
    private const NEGATIVE_MIN_CLICKS = 5;
    private const NEGATIVE_MIN_COST = 50.0;
    private const NEGATIVE_TOP = 5;

    /**
     * Verilen gün için tüm kuralları çalıştırır, ads_alerts'e upsert eder
     * ve yazılan alarm sayısını döner.
     */
    public function evaluate(CarbonImmutable $date): int
    {
        $alerts = array_merge(
            $this->trackingDead($date),
            $this->zeroConversionStreak($date),
            $this->cpaOverCeiling($date),
            $this->budgetLimited($date),
            $this->spendAnomaly($date),
            $this->adDisapproved($date),
            $this->negativeCandidate($date),
            $this->capacityExceeded($date),
            $this->ingestMissing($date),
            $this->keywordGap($date),
        );

        foreach ($alerts as $alert) {
            // detected_on bir DATE kolonu; sqlite'ta cast zamanı da saklayabildiği
            // için eşleşmeyi whereDate ile normalize ederiz (idempotans şart).
            $existing = AdsAlert::query()
                ->whereDate('detected_on', $alert['detected_on'])
                ->where('code', $alert['code'])
                ->when(
                    $alert['campaign_name'] === null,
                    fn ($q) => $q->whereNull('campaign_name'),
                    fn ($q) => $q->where('campaign_name', $alert['campaign_name']),
                )
                ->first();

            $payload = [
                'severity' => $alert['severity'],
                'message' => $alert['message'],
                'context' => $alert['context'] ?? null,
            ];

            if ($existing !== null) {
                $existing->update($payload);
            } else {
                AdsAlert::query()->create(array_merge([
                    'detected_on' => $alert['detected_on'],
                    'code' => $alert['code'],
                    'campaign_name' => $alert['campaign_name'],
                ], $payload));
            }
        }

        // Alarmlar yazıldıktan SONRA komut planlayıcısını çalıştır. Ürettiği komut
        // sayısı alarm sayısına EKLENMEZ — dönüş değeri sadece alarm sayısıdır.
        app(AdsCommandPlanner::class)->planFrom($date);

        return count($alerts);
    }

    /**
     * 1. tracking_dead (critical): o gün tüm kampanyalarda dönüşüm toplamı 0
     * VE tıklama toplamı >= eşik. Smart Bidding'in tamamı buna bağlı olduğu
     * için en kritik kural.
     */
    private function trackingDead(CarbonImmutable $date): array
    {
        $row = AdsDailyCampaign::query()
            ->whereDate('date', $date->toDateString())
            ->selectRaw('COALESCE(SUM(clicks), 0) as clicks, COALESCE(SUM(conversions), 0) as conversions')
            ->first();

        $clicks = (int) ($row->clicks ?? 0);
        $conversions = (float) ($row->conversions ?? 0);

        if ($conversions == 0.0 && $clicks >= self::TRACKING_DEAD_MIN_CLICKS) {
            return [$this->alert(
                $date,
                'tracking_dead',
                'critical',
                null,
                "Dönüşüm izleme ölmüş olabilir: {$clicks} tıklama, 0 dönüşüm.",
                ['clicks' => $clicks, 'conversions' => 0],
            )];
        }

        return [];
    }

    /**
     * 2. zero_conversion_streak (warning): kampanya son 3 gün (o gün dahil)
     * 0 dönüşüm VE toplam harcama >= eşik.
     */
    private function zeroConversionStreak(CarbonImmutable $date): array
    {
        $start = $date->subDays(self::STREAK_DAYS - 1)->toDateString();

        $rows = AdsDailyCampaign::query()
            ->whereDate('date', '>=', $start)->whereDate('date', '<=', $date->toDateString())
            ->groupBy('campaign_name')
            ->selectRaw('campaign_name, COALESCE(SUM(conversions), 0) as conversions, COALESCE(SUM(cost), 0) as cost, COUNT(DISTINCT date) as days')
            ->get();

        $out = [];
        foreach ($rows as $row) {
            $cost = (float) $row->cost;
            if ((int) $row->days >= self::STREAK_DAYS
                && (float) $row->conversions == 0.0
                && $cost >= self::STREAK_MIN_COST) {
                $out[] = $this->alert(
                    $date,
                    'zero_conversion_streak',
                    'warning',
                    $row->campaign_name,
                    "{$row->campaign_name}: son ".self::STREAK_DAYS." gün 0 dönüşüm, {$this->money($cost)} ₺ harcandı.",
                    ['cost' => $cost, 'days' => (int) $row->days],
                );
            }
        }

        return $out;
    }

    /**
     * 3. cpa_over_ceiling (warning): kampanya son 7 gün CPA (cost/conversions)
     * > ads.cpa_ceiling. conversions 0 ise atlanır (2 numara yakalar).
     */
    private function cpaOverCeiling(CarbonImmutable $date): array
    {
        $ceiling = (float) config('ads.cpa_ceiling');
        $start = $date->subDays(self::WEEK_DAYS - 1)->toDateString();

        $rows = AdsDailyCampaign::query()
            ->whereDate('date', '>=', $start)->whereDate('date', '<=', $date->toDateString())
            ->groupBy('campaign_name')
            ->selectRaw('campaign_name, COALESCE(SUM(cost), 0) as cost, COALESCE(SUM(conversions), 0) as conversions')
            ->get();

        $out = [];
        foreach ($rows as $row) {
            $conversions = (float) $row->conversions;
            if ($conversions <= 0.0) {
                continue;
            }
            $cost = (float) $row->cost;
            $cpa = $cost / $conversions;
            if ($cpa > $ceiling) {
                $out[] = $this->alert(
                    $date,
                    'cpa_over_ceiling',
                    'warning',
                    $row->campaign_name,
                    "{$row->campaign_name}: son ".self::WEEK_DAYS." gün CPA {$this->money($cpa)} ₺, üst sınır {$this->money($ceiling)} ₺ aşıldı.",
                    ['cpa' => round($cpa, 2), 'ceiling' => $ceiling],
                );
            }
        }

        return $out;
    }

    /**
     * 4. budget_limited (info): kampanya son 3 gün ortalama
     * budget_lost_impression_share >= eşik → ölçekleme sinyali.
     */
    private function budgetLimited(CarbonImmutable $date): array
    {
        $start = $date->subDays(self::BUDGET_LIMITED_DAYS - 1)->toDateString();

        $rows = AdsDailyCampaign::query()
            ->whereDate('date', '>=', $start)->whereDate('date', '<=', $date->toDateString())
            ->groupBy('campaign_name')
            ->selectRaw('campaign_name, AVG(budget_lost_impression_share) as avg_lost')
            ->get();

        $out = [];
        foreach ($rows as $row) {
            $avg = (float) $row->avg_lost;
            if ($avg >= self::BUDGET_LIMITED_SHARE) {
                $pct = $this->money($avg * 100);
                $out[] = $this->alert(
                    $date,
                    'budget_limited',
                    'info',
                    $row->campaign_name,
                    "{$row->campaign_name}: bütçe yetersizliğinden gösterimlerin %{$pct}'i kaybediliyor — ölçekleme sinyali.",
                    ['avg_budget_lost_share' => round($avg, 4)],
                );
            }
        }

        return $out;
    }

    /**
     * 5. spend_anomaly (info): kampanyanın o günkü harcaması, önceki 7 gün
     * ortalamasından ±%40 sapıyor (önceki dönemde en az 3 gün veri varsa).
     */
    private function spendAnomaly(CarbonImmutable $date): array
    {
        $today = AdsDailyCampaign::query()
            ->whereDate('date', $date->toDateString())
            ->get(['campaign_name', 'cost']);

        if ($today->isEmpty()) {
            return [];
        }

        $prevStart = $date->subDays(self::WEEK_DAYS)->toDateString();
        $prevEnd = $date->subDay()->toDateString();

        $prev = AdsDailyCampaign::query()
            ->whereDate('date', '>=', $prevStart)->whereDate('date', '<=', $prevEnd)
            ->groupBy('campaign_name')
            ->selectRaw('campaign_name, COALESCE(SUM(cost), 0) as cost, COUNT(DISTINCT date) as days')
            ->get()
            ->keyBy('campaign_name');

        $out = [];
        foreach ($today as $row) {
            $ref = $prev->get($row->campaign_name);
            if ($ref === null || (int) $ref->days < self::ANOMALY_MIN_DAYS) {
                continue;
            }
            $avg = (float) $ref->cost / (int) $ref->days;
            if ($avg <= 0.0) {
                continue;
            }
            $cost = (float) $row->cost;
            $deviation = abs($cost - $avg) / $avg;
            if ($deviation >= self::ANOMALY_DEVIATION) {
                $direction = $cost >= $avg ? 'arttı' : 'düştü';
                $pct = $this->money($deviation * 100);
                $out[] = $this->alert(
                    $date,
                    'spend_anomaly',
                    'info',
                    $row->campaign_name,
                    "{$row->campaign_name}: günlük harcama {$this->money($cost)} ₺ — 7 gün ortalaması {$this->money($avg)} ₺'ye göre %{$pct} {$direction}.",
                    ['cost' => $cost, 'avg' => round($avg, 2), 'deviation' => round($deviation, 4)],
                );
            }
        }

        return $out;
    }

    /**
     * 6. ad_disapproved (critical): o gün ads_ad_issues'da policy_status
     * DISAPPROVED olan reklamlar. Kampanya başına tek alarm, sebepler mesajda.
     */
    private function adDisapproved(CarbonImmutable $date): array
    {
        $rows = AdsAdIssue::query()
            ->whereDate('date', $date->toDateString())
            ->where('policy_status', 'DISAPPROVED')
            ->get(['campaign_name', 'reason']);

        if ($rows->isEmpty()) {
            return [];
        }

        $out = [];
        foreach ($rows->groupBy('campaign_name') as $campaign => $issues) {
            $reasons = $issues->pluck('reason')->filter()->unique()->values();
            $reasonText = $reasons->isEmpty() ? 'sebep belirtilmedi' : $reasons->implode('; ');
            $out[] = $this->alert(
                $date,
                'ad_disapproved',
                'critical',
                $campaign,
                "{$campaign}: reklam reddedildi — {$reasonText}.",
                ['reasons' => $reasons->all()],
            );
        }

        return $out;
    }

    /**
     * 7. negative_candidate (warning): son 14 gün toplamında tıklama >= 5,
     * dönüşüm 0 ve harcama >= 50 ₺ olan arama terimleri. En pahalı 5 terim
     * tek alarmda toplanır (her terim için ayrı alarm açılmaz).
     */
    private function negativeCandidate(CarbonImmutable $date): array
    {
        $start = $date->subDays(self::NEGATIVE_DAYS - 1)->toDateString();

        $rows = AdsSearchTerm::query()
            ->whereDate('date', '>=', $start)->whereDate('date', '<=', $date->toDateString())
            ->groupBy('search_term')
            ->selectRaw('search_term, COALESCE(SUM(cost), 0) as cost, COALESCE(SUM(clicks), 0) as clicks, COALESCE(SUM(conversions), 0) as conversions')
            ->havingRaw('SUM(clicks) >= '.self::NEGATIVE_MIN_CLICKS)
            ->havingRaw('SUM(conversions) = 0')
            ->havingRaw('SUM(cost) >= '.self::NEGATIVE_MIN_COST)
            ->orderByDesc('cost')
            ->limit(self::NEGATIVE_TOP)
            ->get();

        if ($rows->isEmpty()) {
            return [];
        }

        $parts = $rows->map(fn ($r) => "\"{$r->search_term}\" ({$this->money((float) $r->cost)} ₺, ".((int) $r->clicks)." tıklama)");
        $terms = $rows->map(fn ($r) => [
            'search_term' => $r->search_term,
            'cost' => (float) $r->cost,
            'clicks' => (int) $r->clicks,
        ])->all();

        return [$this->alert(
            $date,
            'negative_candidate',
            'warning',
            null,
            'Negatif kelime adayları (0 dönüşüm, boşa harcama): '.$parts->implode(', ').'.',
            ['terms' => $terms],
        )];
    }

    /**
     * 8. capacity_exceeded (warning): son 7 gün toplam dönüşüm >
     * ads.weekly_capacity. Bütçe artırma yerine fiyat/kapasite konuşulmalı.
     */
    private function capacityExceeded(CarbonImmutable $date): array
    {
        $capacity = (float) config('ads.weekly_capacity');
        $start = $date->subDays(self::WEEK_DAYS - 1)->toDateString();

        $conversions = (float) AdsDailyCampaign::query()
            ->whereDate('date', '>=', $start)->whereDate('date', '<=', $date->toDateString())
            ->sum('conversions');

        if ($conversions > $capacity) {
            return [$this->alert(
                $date,
                'capacity_exceeded',
                'warning',
                null,
                'Son '.self::WEEK_DAYS." günde {$this->money($conversions)} yeni randevu — haftalık kapasite ({$this->money($capacity)}) aşılıyor; bütçe artırma, fiyat/kapasite konuş.",
                ['conversions' => $conversions, 'capacity' => $capacity],
            )];
        }

        return [];
    }

    /**
     * 9. ingest_missing (critical): o gün için hiç ingest kaydı yok.
     *
     * Boş kampanya listesi geçerli bir rapordur (lansman öncesi, ya da hepsi
     * duraklatılmış). Bu kural onu DEĞİL, toplayıcının hiç konuşmamasını
     * yakalar: Ads Script devre dışı kalmış, yetkisi düşmüş veya zamanlaması
     * silinmiş olabilir. Bunu yakalamazsak her sabah "veri yok" özeti gelir ve
     * kimse betiğin öldüğünü fark etmez.
     */
    private function ingestMissing(CarbonImmutable $date): array
    {
        $reported = AdsIngestRun::query()
            ->whereDate('date', $date->toDateString())
            ->exists();

        if ($reported) {
            return [];
        }

        // Kayıt yok ama kampanya verisi var: toplayıcı konuşmuş, yalnızca bu
        // tablo ondan sonra eklenmiş. Yanlış alarm vermeyiz.
        $hasData = AdsDailyCampaign::query()
            ->whereDate('date', $date->toDateString())
            ->exists();

        if ($hasData) {
            return [];
        }


        return [$this->alert(
            $date,
            'ingest_missing',
            'critical',
            null,
            'Google Ads toplayıcısı bu gün için hiç rapor göndermedi — Ads Script durmuş olabilir (Tools > Bulk actions > Scripts, son çalışma ve yetki durumuna bak).',
        )];
    }

    /**
     * 10. keyword_gap (warning): son ads.gap_days günde DÖNÜŞÜM GETİREN
     * arama terimlerinden, anahtar kelimelerimizde karşılığı OLMAYANLARI bulur.
     * Bunlar karşılıksız talep = yeni reklam grubu veya kampanya adayı. En çok
     * dönüşüm getiren ilk ads.gap_top terim tek alarmda toplanır.
     */
    private function keywordGap(CarbonImmutable $date): array
    {
        $start = $date->subDays((int) config('ads.gap_days') - 1)->toDateString();
        $end = $date->toDateString();
        $minConversions = (float) config('ads.gap_min_conversions');
        $top = (int) config('ads.gap_top');

        // Aday havuzu: pencerede dönüşüm getiren arama terimleri (terim bazında topla).
        $candidates = AdsSearchTerm::query()
            ->whereDate('date', '>=', $start)->whereDate('date', '<=', $end)
            ->groupBy('search_term')
            ->selectRaw('search_term, COALESCE(SUM(cost), 0) as cost, COALESCE(SUM(conversions), 0) as conversions')
            ->havingRaw('SUM(conversions) >= '.$minConversions)
            ->get();

        if ($candidates->isEmpty()) {
            return [];
        }

        // Hesap genelindeki (tüm kampanyalar) anahtar kelimeleri normalize edilmiş
        // kümeye topla; erişim sözdizimi ("tam", [sıralı]) farkı eşleşmeyi bozmasın.
        $keywords = AdsDailyKeyword::query()
            ->whereDate('date', '>=', $start)->whereDate('date', '<=', $end)
            ->distinct()
            ->pluck('keyword')
            ->map(fn ($k) => $this->normalizeTerm((string) $k))
            ->flip();

        // Karşılığı olan terimleri ele; kalanları dönüşüme (eşitlikte maliyete)
        // göre azalan sırala ve ilk $top tanesini al.
        $gap = $candidates
            ->filter(fn ($r) => ! $keywords->has($this->normalizeTerm((string) $r->search_term)))
            ->map(fn ($r) => [
                'search_term' => $r->search_term,
                'conversions' => (float) $r->conversions,
                'cost' => (float) $r->cost,
            ])
            ->sortByDesc(fn ($t) => [$t['conversions'], $t['cost']])
            ->values()
            ->take($top);

        if ($gap->isEmpty()) {
            return [];
        }

        $parts = $gap->map(fn ($t) => "\"{$t['search_term']}\" ({$this->money($t['conversions'])} dönüşüm, {$this->money($t['cost'])} ₺)");

        return [$this->alert(
            $date,
            'keyword_gap',
            'warning',
            null,
            'Hedeflenmeyen ama dönüşüm getiren aramalar (yeni reklam grubu/kampanya adayı): '.$parts->implode(', ').'. CSV paketi üretilmeli.',
            ['terms' => $gap->all(), 'days' => (int) config('ads.gap_days')],
        )];
    }

    /**
     * Arama terimi ve anahtar kelimeyi karşılaştırmadan önce ortak biçime indirir:
     * eşleşme sözdizimi işaretlerini ("[]) soyar, küçük harfe çevirir, baş/son
     * boşluğu kırpar ve çoklu boşluğu teke indirir. İki tarafa da aynı işlev
     * uygulanmalı; yoksa sessiz yanlış pozitif üretir.
     */
    private function normalizeTerm(string $t): string
    {
        $t = str_replace(['"', '[', ']'], '', $t);
        // Türkçe büyük 'İ' küçüğe inince 'i' + birleşik nokta (U+0307) üretir;
        // onu at ki 'İPEK' ile 'ipek' aynı normalize değere insin.
        $t = mb_strtolower($t, 'UTF-8');
        $t = str_replace("\u{0307}", '', $t);
        $t = preg_replace('/\s+/u', ' ', trim($t));

        return $t;
    }

    /**
     * Tek bir alarm adayını normalize eder.
     *
     * @param  array<string, mixed>|null  $context
     * @return array<string, mixed>
     */
    private function alert(
        CarbonImmutable $date,
        string $code,
        string $severity,
        ?string $campaignName,
        string $message,
        ?array $context = null,
    ): array {
        return [
            'detected_on' => $date->toDateString(),
            'code' => $code,
            'severity' => $severity,
            'campaign_name' => $campaignName,
            'message' => $message,
            'context' => $context,
        ];
    }

    /** Para/sayı biçimi: sade "1234.56" (nokta ondalık, gruplama yok). */
    private function money(float $value): string
    {
        return number_format($value, 2, '.', '');
    }
}
