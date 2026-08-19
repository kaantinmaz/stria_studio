<?php

namespace Tests\Feature;

use App\Models\AdsAdIssue;
use App\Models\AdsAlert;
use App\Models\AdsDailyCampaign;
use App\Models\AdsDailyKeyword;
use App\Models\AdsSearchTerm;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdsIngestTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Ingest ucu ayrı kapsam kullanıyor; blog token'ı burada geçmez.
        config(['services.admin_api.ads_token' => 'test-token']);
    }

    public function test_request_without_token_is_unauthorized(): void
    {
        $this->postJson('/api/admin/ads/ingest', $this->payload())
            ->assertStatus(401)
            ->assertExactJson(['message' => 'Unauthorized.']);
    }

    public function test_request_with_wrong_token_is_unauthorized(): void
    {
        $this->withToken('wrong-token')
            ->postJson('/api/admin/ads/ingest', $this->payload())
            ->assertStatus(401);
    }

    public function test_blog_publishing_token_cannot_reach_the_ingest_endpoint(): void
    {
        // Ads betiği panelde açıkta duruyor; blog yazma token'ı buraya sızmamalı.
        config(['services.admin_api.token' => 'blog-token']);

        $this->withToken('blog-token')
            ->postJson('/api/admin/ads/ingest', $this->payload())
            ->assertStatus(401);
    }

    public function test_valid_payload_writes_all_tables_and_returns_counts(): void
    {
        $response = $this->withToken('test-token')
            ->postJson('/api/admin/ads/ingest', $this->payload())
            ->assertStatus(200)
            ->assertJsonPath('data.date', '2026-08-16')
            ->assertJsonPath('data.campaigns', 1)
            ->assertJsonPath('data.keywords', 1)
            ->assertJsonPath('data.search_terms', 1)
            ->assertJsonPath('data.ad_issues', 1);

        // alerts, AdsWatchdog kural motorunun o gün yazdığı alarm sayısını yansıtır.
        $response->assertJsonPath('data.alerts', AdsAlert::whereDate('detected_on', '2026-08-16')->count());

        $this->assertDatabaseCount('ads_daily_campaigns', 1);
        $this->assertDatabaseCount('ads_daily_keywords', 1);
        $this->assertDatabaseCount('ads_search_terms', 1);
        $this->assertDatabaseCount('ads_ad_issues', 1);

        $this->assertDatabaseHas('ads_daily_campaigns', [
            'date' => '2026-08-16',
            'campaign_name' => 'Stria | Search | Kaş & Kirpik',
            'status' => 'ENABLED',
            'campaign_type' => 'SEARCH',
        ]);
    }

    public function test_empty_campaign_list_is_accepted_and_recorded_as_a_run(): void
    {
        // Lansman öncesi gerçek durum: hesapta hiç kampanya yok. Bunu reddetmek
        // toplayıcıyı her sabah hataya düşürürdü.
        $this->withToken('test-token')
            ->postJson('/api/admin/ads/ingest', [
                'date' => '2026-08-16',
                'account' => '123-456-7890',
                'currency' => 'TRY',
                'campaigns' => [],
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.campaigns', 0);

        $this->assertDatabaseCount('ads_daily_campaigns', 0);

        // Boş gün de bir rapordur: kaydı olmalı, yoksa sessizlikten ayrılamaz.
        // date kolonu cast'li: sqlite "2026-08-16 00:00:00" saklar, ham string
        // eşleşmez. whereDate ile normalize ediyoruz.
        $run = \App\Models\AdsIngestRun::query()->whereDate('date', '2026-08-16')->first();
        $this->assertNotNull($run, 'Boş gün de bir rapordur: kaydı olmalı.');
        $this->assertSame(0, $run->campaigns);
    }


    public function test_missing_campaigns_key_is_still_rejected(): void
    {
        // Boş dizi geçerli; anahtarın hiç olmaması bozuk gövde demektir.
        $this->withToken('test-token')
            ->postJson('/api/admin/ads/ingest', ['date' => '2026-08-16'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('campaigns');
    }

    public function test_run_row_is_idempotent_and_reflects_latest_counts(): void
    {
        $this->withToken('test-token')->postJson('/api/admin/ads/ingest', $this->payload())->assertStatus(200);
        $this->withToken('test-token')->postJson('/api/admin/ads/ingest', $this->payload())->assertStatus(200);

        $this->assertDatabaseCount('ads_ingest_runs', 1);
        $run = \App\Models\AdsIngestRun::query()->whereDate('date', '2026-08-16')->first();
        $this->assertSame(1, $run->campaigns);
    }

    public function test_watchdog_is_wired_and_disapproved_ad_produces_alert(): void
    {
        // Onaylanmamış reklam içeren gövde en az bir alarm üretmeli ve bu sayı
        // yanıttaki data.alerts ile ads_alerts tablosuna yansımalı.
        $response = $this->withToken('test-token')
            ->postJson('/api/admin/ads/ingest', $this->payload())
            ->assertStatus(200);

        $written = AdsAlert::whereDate('detected_on', '2026-08-16')->count();
        $this->assertGreaterThanOrEqual(1, $written);
        $response->assertJsonPath('data.alerts', $written);
        $this->assertDatabaseHas('ads_alerts', ['code' => 'ad_disapproved']);
    }

    public function test_ingest_is_idempotent_and_updates_values(): void
    {
        $this->withToken('test-token')
            ->postJson('/api/admin/ads/ingest', $this->payload())
            ->assertStatus(200);

        // Aynı gün, aynı doğal anahtarlar; sadece cost değişiyor.
        $second = $this->payload();
        $second['campaigns'][0]['cost'] = 250.00;
        $second['keywords'][0]['cost'] = 20.00;
        $second['search_terms'][0]['cost'] = 15.00;

        $this->withToken('test-token')
            ->postJson('/api/admin/ads/ingest', $second)
            ->assertStatus(200);

        // Satırlar çoğalmadı.
        $this->assertDatabaseCount('ads_daily_campaigns', 1);
        $this->assertDatabaseCount('ads_daily_keywords', 1);
        $this->assertDatabaseCount('ads_search_terms', 1);
        $this->assertDatabaseCount('ads_ad_issues', 1);

        // Değerler güncellendi.
        $this->assertSame('250.00', AdsDailyCampaign::first()->cost);
        $this->assertSame('20.00', AdsDailyKeyword::first()->cost);
        $this->assertSame('15.00', AdsSearchTerm::first()->cost);
    }

    public function test_malformed_campaign_row_is_still_rejected(): void
    {
        // Boş liste artık geçerli (bkz. test_empty_campaign_list...), ama liste
        // içindeki bozuk satır kabul edilmez - eksik veri sessizce yazılmasın.
        $payload = $this->payload();
        unset($payload['campaigns'][0]['cost']);

        $this->withToken('test-token')
            ->postJson('/api/admin/ads/ingest', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors('campaigns.0.cost');
    }

    public function test_malformed_date_is_rejected(): void
    {
        $payload = $this->payload();
        $payload['date'] = '16-08-2026';

        $this->withToken('test-token')
            ->postJson('/api/admin/ads/ingest', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors('date');
    }

    public function test_optional_arrays_may_be_omitted(): void
    {
        $payload = [
            'date' => '2026-08-16',
            'campaigns' => $this->payload()['campaigns'],
        ];

        $this->withToken('test-token')
            ->postJson('/api/admin/ads/ingest', $payload)
            ->assertStatus(200)
            ->assertJsonPath('data.campaigns', 1)
            ->assertJsonPath('data.keywords', 0)
            ->assertJsonPath('data.search_terms', 0)
            ->assertJsonPath('data.ad_issues', 0);

        $this->assertDatabaseCount('ads_daily_keywords', 0);
    }

    public function test_fractional_values_are_stored_precisely(): void
    {
        $payload = $this->payload();
        $payload['campaigns'][0]['conversions'] = 1.5;
        $payload['campaigns'][0]['search_impression_share'] = 0.4231;

        $this->withToken('test-token')
            ->postJson('/api/admin/ads/ingest', $payload)
            ->assertStatus(200);

        $campaign = AdsDailyCampaign::first();
        $this->assertSame('1.50', $campaign->conversions);
        $this->assertSame('0.4231', $campaign->search_impression_share);
    }

    /**
     * Sözleşmeye uygun tam bir gövde.
     *
     * @return array<string, mixed>
     */
    private function payload(): array
    {
        return [
            'date' => '2026-08-16',
            'account' => '123-456-7890',
            'currency' => 'TRY',
            'campaigns' => [[
                'campaign' => 'Stria | Search | Kaş & Kirpik',
                'status' => 'ENABLED',
                'type' => 'SEARCH',
                'cost' => 178.42,
                'impressions' => 1240,
                'clicks' => 63,
                'conversions' => 2,
                'conversion_value' => 0,
                'average_cpc' => 2.83,
                'search_impression_share' => 0.42,
                'budget_lost_impression_share' => 0.28,
            ]],
            'keywords' => [[
                'campaign' => 'Stria | Search | Kaş & Kirpik',
                'ad_group' => 'Kaş Laminasyon',
                'keyword' => 'kaş laminasyon ankara',
                'match_type' => 'PHRASE',
                'cost' => 12.4,
                'impressions' => 90,
                'clicks' => 5,
                'conversions' => 0,
            ]],
            'search_terms' => [[
                'campaign' => 'Stria | Search | Kaş & Kirpik',
                'ad_group' => 'Kaş Laminasyon',
                'search_term' => 'kaş laminasyonu kaç para',
                'cost' => 8.1,
                'impressions' => 40,
                'clicks' => 3,
                'conversions' => 0,
            ]],
            'ad_issues' => [[
                'campaign' => 'Stria | Search | Kaş & Kirpik',
                'ad_group' => 'Kaş Laminasyon',
                'policy_status' => 'DISAPPROVED',
                'reason' => 'Healthcare and medicines',
            ]],
        ];
    }
}
