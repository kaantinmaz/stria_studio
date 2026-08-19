<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdsAdIssue;
use App\Models\AdsDailyCampaign;
use App\Models\AdsDailyKeyword;
use App\Models\AdsIngestRun;
use App\Models\AdsSearchTerm;
use App\Support\AdsWatchdog;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdsIngestController extends Controller
{
    /**
     * Google Ads Script'in her gün POST ettiği performans anlık görüntüsünü alır.
     * Idempotent: aynı gün iki kez gönderilirse satırlar çoğalmaz, güncellenir.
     */
    // Alarm sayısı tek noktadan yanıta besleniyor; upsert'lerden sonra
    // AdsWatchdog kural motoru bu değeri doldurur.
    private int $alertCount = 0;

    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
            'account' => ['sometimes', 'string'],
            'currency' => ['sometimes', 'string'],

            // 'present' ama 'min:1' DEĞİL: hesapta hiç kampanya olmayabilir
            // (lansman öncesi) veya hepsi duraklatılmış olabilir. Boş günü
            // reddetmek toplayıcıyı her sabah hataya düşürürdü. Toplayıcının
            // çalıştığı ads_ingest_runs'a yazılır; sessiz boşluk oluşmaz.
            'campaigns' => ['present', 'array'],
            'campaigns.*.campaign' => ['required', 'string'],
            'campaigns.*.status' => ['sometimes', 'string'],
            'campaigns.*.type' => ['sometimes', 'string'],
            'campaigns.*.cost' => ['required', 'numeric', 'min:0'],
            'campaigns.*.impressions' => ['required', 'numeric', 'min:0'],
            'campaigns.*.clicks' => ['required', 'numeric', 'min:0'],
            'campaigns.*.conversions' => ['required', 'numeric', 'min:0'],
            'campaigns.*.conversion_value' => ['sometimes', 'numeric', 'min:0'],
            'campaigns.*.average_cpc' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'campaigns.*.search_impression_share' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'campaigns.*.budget_lost_impression_share' => ['sometimes', 'nullable', 'numeric', 'min:0'],

            'keywords' => ['sometimes', 'array'],
            'keywords.*.campaign' => ['required', 'string'],
            'keywords.*.ad_group' => ['required', 'string'],
            'keywords.*.keyword' => ['required', 'string'],
            'keywords.*.match_type' => ['sometimes', 'string'],
            'keywords.*.cost' => ['required', 'numeric', 'min:0'],
            'keywords.*.impressions' => ['required', 'numeric', 'min:0'],
            'keywords.*.clicks' => ['required', 'numeric', 'min:0'],
            'keywords.*.conversions' => ['required', 'numeric', 'min:0'],

            'search_terms' => ['sometimes', 'array'],
            'search_terms.*.campaign' => ['required', 'string'],
            'search_terms.*.ad_group' => ['required', 'string'],
            'search_terms.*.search_term' => ['required', 'string'],
            'search_terms.*.cost' => ['required', 'numeric', 'min:0'],
            'search_terms.*.impressions' => ['required', 'numeric', 'min:0'],
            'search_terms.*.clicks' => ['required', 'numeric', 'min:0'],
            'search_terms.*.conversions' => ['required', 'numeric', 'min:0'],

            'ad_issues' => ['sometimes', 'array'],
            'ad_issues.*.campaign' => ['required', 'string'],
            'ad_issues.*.ad_group' => ['sometimes', 'nullable', 'string'],
            'ad_issues.*.policy_status' => ['required', 'string'],
            'ad_issues.*.reason' => ['sometimes', 'nullable', 'string'],
        ]);

        $date = $data['date'];

        $campaignRows = $this->campaignRows($date, $data['campaigns']);
        $keywordRows = $this->keywordRows($date, $data['keywords'] ?? []);
        $searchTermRows = $this->searchTermRows($date, $data['search_terms'] ?? []);
        $adIssueRows = $this->adIssueRows($date, $data['ad_issues'] ?? []);

        // Tek transaction: her tablo için tek toplu upsert (satır başına sorgu yok).
        DB::transaction(function () use ($date, $campaignRows, $keywordRows, $searchTermRows, $adIssueRows) {
            if ($campaignRows !== []) {
                AdsDailyCampaign::upsert(
                    $campaignRows,
                    ['date', 'campaign_name'],
                    ['status', 'campaign_type', 'cost', 'impressions', 'clicks', 'conversions',
                        'conversion_value', 'average_cpc', 'search_impression_share', 'budget_lost_impression_share'],
                );
            }

            if ($keywordRows !== []) {
                AdsDailyKeyword::upsert(
                    $keywordRows,
                    ['date', 'keyword_hash'],
                    ['campaign_name', 'ad_group_name', 'keyword', 'match_type', 'cost', 'impressions', 'clicks', 'conversions'],
                );
            }

            if ($searchTermRows !== []) {
                AdsSearchTerm::upsert(
                    $searchTermRows,
                    ['date', 'term_hash'],
                    ['campaign_name', 'ad_group_name', 'search_term', 'cost', 'impressions', 'clicks', 'conversions'],
                );
            }

            if ($adIssueRows !== []) {
                AdsAdIssue::upsert(
                    $adIssueRows,
                    ['date', 'issue_hash'],
                    ['campaign_name', 'ad_group_name', 'policy_status', 'reason'],
                );
            }

            // Toplayıcının bu gün için rapor verdiğinin kanıtı. Boş gün de bir
            // rapordur: "kampanya yok" ile "betik hiç çalışmadı" ancak bu
            // satırın varlığıyla ayrılır.
            //
            // updateOrCreate(['date' => ...]) KULLANILAMAZ: kolon date cast'li ve
            // sqlite'ta "2026-08-16 00:00:00" olarak saklanır; ham string eşleşmez,
            // eşleşmeyince insert denenir ve unique kısıtı patlar. Eşleşmeyi
            // whereDate ile normalize ediyoruz (ads_alerts'te de aynı desen).
            $counts = [
                'campaigns' => count($campaignRows),
                'keywords' => count($keywordRows),
                'search_terms' => count($searchTermRows),
                'ad_issues' => count($adIssueRows),
            ];

            $run = AdsIngestRun::query()->whereDate('date', $date)->first();

            if ($run !== null) {
                $run->update($counts);
            } else {
                AdsIngestRun::query()->create(array_merge(['date' => $date], $counts));
            }

            // Taze veri yazıldıktan sonra kural motorunu aynı transaction içinde
            // çalıştır; üretilen alarm sayısı yanıta gider.
            $this->alertCount = app(AdsWatchdog::class)->evaluate(CarbonImmutable::parse($date));
        });

        return response()->json([
            'data' => [
                'date' => $date,
                'campaigns' => count($campaignRows),
                'keywords' => count($keywordRows),
                'search_terms' => count($searchTermRows),
                'ad_issues' => count($adIssueRows),
                'alerts' => $this->alertCount,
            ],
        ]);
    }

    /**
     * @param  array<int, array<string, mixed>>  $campaigns
     * @return array<int, array<string, mixed>>
     */
    private function campaignRows(string $date, array $campaigns): array
    {
        return array_map(fn (array $row) => [
            'date' => $date,
            'campaign_name' => $row['campaign'],
            'status' => $row['status'] ?? 'UNKNOWN',
            'campaign_type' => $row['type'] ?? 'UNKNOWN',
            'cost' => $row['cost'],
            'impressions' => $row['impressions'],
            'clicks' => $row['clicks'],
            'conversions' => $row['conversions'],
            'conversion_value' => $row['conversion_value'] ?? 0,
            'average_cpc' => $row['average_cpc'] ?? null,
            'search_impression_share' => $row['search_impression_share'] ?? null,
            'budget_lost_impression_share' => $row['budget_lost_impression_share'] ?? null,
        ], $campaigns);
    }

    /**
     * @param  array<int, array<string, mixed>>  $keywords
     * @return array<int, array<string, mixed>>
     */
    private function keywordRows(string $date, array $keywords): array
    {
        return array_map(function (array $row) use ($date) {
            $matchType = $row['match_type'] ?? 'UNKNOWN';

            return [
                'date' => $date,
                'campaign_name' => $row['campaign'],
                'ad_group_name' => $row['ad_group'],
                'keyword' => $row['keyword'],
                'match_type' => $matchType,
                'keyword_hash' => $this->hash([$row['campaign'], $row['ad_group'], $row['keyword'], $matchType]),
                'cost' => $row['cost'],
                'impressions' => $row['impressions'],
                'clicks' => $row['clicks'],
                'conversions' => $row['conversions'],
            ];
        }, $keywords);
    }

    /**
     * @param  array<int, array<string, mixed>>  $terms
     * @return array<int, array<string, mixed>>
     */
    private function searchTermRows(string $date, array $terms): array
    {
        return array_map(fn (array $row) => [
            'date' => $date,
            'campaign_name' => $row['campaign'],
            'ad_group_name' => $row['ad_group'],
            'search_term' => $row['search_term'],
            'term_hash' => $this->hash([$row['campaign'], $row['ad_group'], $row['search_term']]),
            'cost' => $row['cost'],
            'impressions' => $row['impressions'],
            'clicks' => $row['clicks'],
            'conversions' => $row['conversions'],
        ], $terms);
    }

    /**
     * @param  array<int, array<string, mixed>>  $issues
     * @return array<int, array<string, mixed>>
     */
    private function adIssueRows(string $date, array $issues): array
    {
        return array_map(function (array $row) use ($date) {
            $adGroup = $row['ad_group'] ?? null;

            return [
                'date' => $date,
                'campaign_name' => $row['campaign'],
                'ad_group_name' => $adGroup,
                'policy_status' => $row['policy_status'],
                'reason' => $row['reason'] ?? null,
                // ad_group_name nullable olduğundan hash'te '' ile normalize ediyoruz.
                'issue_hash' => $this->hash([$row['campaign'], $adGroup ?? '', $row['policy_status']]),
            ];
        }, $issues);
    }

    /**
     * Bileşik doğal anahtarın sabit uzunlukta (char 64) sha256 özeti.
     *
     * @param  array<int, string>  $parts
     */
    private function hash(array $parts): string
    {
        return hash('sha256', implode('|', $parts));
    }
}
