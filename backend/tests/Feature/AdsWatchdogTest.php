<?php

namespace Tests\Feature;

use App\Models\AdsAdIssue;
use App\Models\AdsAlert;
use App\Models\AdsDailyCampaign;
use App\Models\AdsSearchTerm;
use App\Support\AdsWatchdog;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AdsWatchdogTest extends TestCase
{
    use RefreshDatabase;

    /** İşlenecek referans gün. */
    private CarbonImmutable $date;

    protected function setUp(): void
    {
        parent::setUp();

        CarbonImmutable::setTestNow('2026-08-17 09:00:00');
        $this->date = CarbonImmutable::parse('2026-08-16');

        // Eşikleri deterministik sabitle (env override'lardan bağımsız olsun).
        config([
            'ads.cpa_target' => 300,
            'ads.cpa_ceiling' => 500,
            'ads.lead_cost_ceiling' => 105,
            'ads.weekly_capacity' => 11,
            'ads.monthly_budget' => 20000,
        ]);
    }

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();

        parent::tearDown();
    }

    // --- yardımcılar --------------------------------------------------------

    /**
     * @param  array<string, mixed>  $attrs
     */
    private function campaign(string $date, string $name, array $attrs = []): AdsDailyCampaign
    {
        return AdsDailyCampaign::query()->create(array_merge([
            'date' => $date,
            'campaign_name' => $name,
            'status' => 'ENABLED',
            'campaign_type' => 'SEARCH',
            'cost' => 0,
            'impressions' => 0,
            'clicks' => 0,
            'conversions' => 0,
            'conversion_value' => 0,
            'average_cpc' => 0,
            'search_impression_share' => 0,
            'budget_lost_impression_share' => 0,
        ], $attrs));
    }

    private function watchdog(): AdsWatchdog
    {
        return app(AdsWatchdog::class);
    }

    private function alert(string $code, ?string $campaign = null): ?AdsAlert
    {
        return AdsAlert::query()
            ->where('code', $code)
            ->when($campaign !== null, fn ($q) => $q->where('campaign_name', $campaign))
            ->first();
    }

    private function ingestRun(string $date, int $campaigns = 0): void
    {
        \App\Models\AdsIngestRun::query()->create([
            'date' => $date, 'campaigns' => $campaigns,
            'keywords' => 0, 'search_terms' => 0, 'ad_issues' => 0,
        ]);
    }

    private function searchTerm(string $term, array $attrs = []): AdsSearchTerm
    {
        return AdsSearchTerm::query()->create(array_merge([
            'date' => $this->date->toDateString(),
            'campaign_name' => 'A',
            'ad_group_name' => 'Kaş Laminasyon',
            'search_term' => $term,
            'term_hash' => hash('sha256', $term),
            'cost' => 100,
            'impressions' => 100,
            'clicks' => 10,
            'conversions' => 1,
        ], $attrs));
    }

    private function keyword(string $keyword, array $attrs = []): \App\Models\AdsDailyKeyword
    {
        return \App\Models\AdsDailyKeyword::query()->create(array_merge([
            'date' => $this->date->toDateString(),
            'campaign_name' => 'A',
            'ad_group_name' => 'Kaş Laminasyon',
            'keyword' => $keyword,
            'match_type' => 'EXACT',
            'keyword_hash' => hash('sha256', $keyword),
            'cost' => 0,
            'impressions' => 0,
            'clicks' => 0,
            'conversions' => 0,
        ], $attrs));
    }

    /** keyword_gap eşiklerini deterministik sabitle. */
    private function gapConfig(): void
    {
        config([
            'ads.gap_days' => 14,
            'ads.gap_min_conversions' => 1,
            'ads.gap_top' => 5,
        ]);
    }

    // --- 9. ingest_missing --------------------------------------------------

    public function test_ingest_missing_tetiklenir_hic_rapor_yoksa(): void
    {
        // Ne rapor kaydı ne veri: toplayıcı susmuş. En kritik sessiz arıza.
        $this->watchdog()->evaluate($this->date);

        $alert = $this->alert('ingest_missing');
        $this->assertNotNull($alert);
        $this->assertSame('critical', $alert->severity);
    }

    public function test_ingest_missing_tetiklenmez_bos_gun_raporlandiysa(): void
    {
        // Hesapta kampanya yok ama betik çalıştı ve bunu bildirdi -> alarm yok.
        $this->ingestRun($this->date->toDateString(), 0);

        $this->watchdog()->evaluate($this->date);

        $this->assertNull($this->alert('ingest_missing'));
    }

    public function test_ingest_missing_tetiklenmez_kampanya_verisi_varsa(): void
    {
        // Rapor kaydı bu tablodan önce yazılmış günler için yok; veri varsa
        // toplayıcı konuşmuş demektir, yanlış alarm vermemeli.
        $this->campaign($this->date->toDateString(), 'A', ['clicks' => 3, 'cost' => 12]);

        $this->watchdog()->evaluate($this->date);

        $this->assertNull($this->alert('ingest_missing'));
    }

    // --- 1. tracking_dead ---------------------------------------------------

    public function test_tracking_dead_tetiklenir(): void
    {
        $this->campaign($this->date->toDateString(), 'A', ['clicks' => 25, 'conversions' => 0, 'cost' => 60]);

        $this->watchdog()->evaluate($this->date);

        $alert = $this->alert('tracking_dead');
        $this->assertNotNull($alert);
        $this->assertSame('critical', $alert->severity);
        $this->assertNull($alert->campaign_name);
        $this->assertStringContainsString('25 tıklama, 0 dönüşüm', $alert->message);
    }

    public function test_tracking_dead_tetiklenmez_donusum_varsa(): void
    {
        $this->campaign($this->date->toDateString(), 'A', ['clicks' => 25, 'conversions' => 1, 'cost' => 60]);

        $this->watchdog()->evaluate($this->date);

        $this->assertNull($this->alert('tracking_dead'));
    }

    // --- 2. zero_conversion_streak ------------------------------------------

    public function test_zero_conversion_streak_tetiklenir_uc_gun(): void
    {
        foreach ([2, 1, 0] as $offset) {
            $this->campaign($this->date->subDays($offset)->toDateString(), 'A', [
                'clicks' => 5, 'conversions' => 0, 'cost' => 140,
            ]);
        }

        $this->watchdog()->evaluate($this->date);

        $this->assertNotNull($this->alert('zero_conversion_streak', 'A'));
    }

    public function test_zero_conversion_streak_tetiklenmez_iki_gun(): void
    {
        foreach ([1, 0] as $offset) {
            $this->campaign($this->date->subDays($offset)->toDateString(), 'A', [
                'clicks' => 5, 'conversions' => 0, 'cost' => 200,
            ]);
        }

        $this->watchdog()->evaluate($this->date);

        $this->assertNull($this->alert('zero_conversion_streak', 'A'));
    }

    // --- 3. cpa_over_ceiling ------------------------------------------------

    public function test_cpa_over_ceiling_tetiklenir(): void
    {
        // 7 günde 1200 ₺ / 2 dönüşüm = 600 CPA > 500 tavan.
        for ($offset = 6; $offset >= 0; $offset--) {
            $this->campaign($this->date->subDays($offset)->toDateString(), 'A', [
                'clicks' => 3,
                'cost' => $offset === 0 ? 1200 : 0,
                'conversions' => $offset === 0 ? 2 : 0,
            ]);
        }

        $this->watchdog()->evaluate($this->date);

        $alert = $this->alert('cpa_over_ceiling', 'A');
        $this->assertNotNull($alert);
        $this->assertSame('warning', $alert->severity);
    }

    public function test_cpa_over_ceiling_tetiklenmez_dusuk_cpa(): void
    {
        // 7 günde 600 ₺ / 2 dönüşüm = 300 CPA < 500 tavan.
        for ($offset = 6; $offset >= 0; $offset--) {
            $this->campaign($this->date->subDays($offset)->toDateString(), 'A', [
                'clicks' => 3,
                'cost' => $offset === 0 ? 600 : 0,
                'conversions' => $offset === 0 ? 2 : 0,
            ]);
        }

        $this->watchdog()->evaluate($this->date);

        $this->assertNull($this->alert('cpa_over_ceiling', 'A'));
    }

    // --- 4. budget_limited --------------------------------------------------

    public function test_budget_limited_tetiklenir(): void
    {
        foreach ([2, 1, 0] as $offset) {
            $this->campaign($this->date->subDays($offset)->toDateString(), 'A', [
                'clicks' => 5, 'conversions' => 1, 'cost' => 50,
                'budget_lost_impression_share' => 0.25,
            ]);
        }

        $this->watchdog()->evaluate($this->date);

        $alert = $this->alert('budget_limited', 'A');
        $this->assertNotNull($alert);
        $this->assertSame('info', $alert->severity);
        $this->assertStringContainsString('ölçekleme sinyali', $alert->message);
    }

    public function test_budget_limited_tetiklenmez_dusuk_pay(): void
    {
        foreach ([2, 1, 0] as $offset) {
            $this->campaign($this->date->subDays($offset)->toDateString(), 'A', [
                'clicks' => 5, 'conversions' => 1, 'cost' => 50,
                'budget_lost_impression_share' => 0.10,
            ]);
        }

        $this->watchdog()->evaluate($this->date);

        $this->assertNull($this->alert('budget_limited', 'A'));
    }

    // --- 5. spend_anomaly ---------------------------------------------------

    public function test_spend_anomaly_tetiklenir(): void
    {
        // Önceki 7 gün ort. 100 ₺, bugün 200 ₺ (%100 sapma).
        for ($offset = 7; $offset >= 1; $offset--) {
            $this->campaign($this->date->subDays($offset)->toDateString(), 'A', [
                'clicks' => 5, 'conversions' => 1, 'cost' => 100,
            ]);
        }
        $this->campaign($this->date->toDateString(), 'A', ['clicks' => 5, 'conversions' => 1, 'cost' => 200]);

        $this->watchdog()->evaluate($this->date);

        $alert = $this->alert('spend_anomaly', 'A');
        $this->assertNotNull($alert);
        $this->assertSame('info', $alert->severity);
    }

    public function test_spend_anomaly_tetiklenmez_kucuk_sapma(): void
    {
        for ($offset = 7; $offset >= 1; $offset--) {
            $this->campaign($this->date->subDays($offset)->toDateString(), 'A', [
                'clicks' => 5, 'conversions' => 1, 'cost' => 100,
            ]);
        }
        $this->campaign($this->date->toDateString(), 'A', ['clicks' => 5, 'conversions' => 1, 'cost' => 110]);

        $this->watchdog()->evaluate($this->date);

        $this->assertNull($this->alert('spend_anomaly', 'A'));
    }

    // --- 6. ad_disapproved --------------------------------------------------

    public function test_ad_disapproved_tetiklenir(): void
    {
        $this->campaign($this->date->toDateString(), 'A', ['clicks' => 3, 'conversions' => 1, 'cost' => 20]);
        AdsAdIssue::query()->create([
            'date' => $this->date->toDateString(),
            'campaign_name' => 'A',
            'ad_group_name' => 'Kaş Laminasyon',
            'policy_status' => 'DISAPPROVED',
            'reason' => 'Healthcare and medicines',
            'issue_hash' => hash('sha256', 'A|Kaş Laminasyon|DISAPPROVED|Healthcare'),
        ]);

        $this->watchdog()->evaluate($this->date);

        $alert = $this->alert('ad_disapproved', 'A');
        $this->assertNotNull($alert);
        $this->assertSame('critical', $alert->severity);
        $this->assertStringContainsString('Healthcare and medicines', $alert->message);
    }

    public function test_ad_disapproved_tetiklenmez_onayli(): void
    {
        $this->campaign($this->date->toDateString(), 'A', ['clicks' => 3, 'conversions' => 1, 'cost' => 20]);
        AdsAdIssue::query()->create([
            'date' => $this->date->toDateString(),
            'campaign_name' => 'A',
            'ad_group_name' => 'Kaş Laminasyon',
            'policy_status' => 'APPROVED',
            'reason' => null,
            'issue_hash' => hash('sha256', 'A|Kaş Laminasyon|APPROVED'),
        ]);

        $this->watchdog()->evaluate($this->date);

        $this->assertNull($this->alert('ad_disapproved'));
    }

    // --- 7. negative_candidate ----------------------------------------------

    public function test_negative_candidate_tek_alarmda_toplanir(): void
    {
        // 6 uygun terim: hepsi 6 tıklama, 0 dönüşüm, cost farklı. En pahalı 5 alınır.
        foreach (range(1, 6) as $i) {
            AdsSearchTerm::query()->create([
                'date' => $this->date->toDateString(),
                'campaign_name' => 'A',
                'ad_group_name' => 'Kaş Laminasyon',
                'search_term' => "terim {$i}",
                'term_hash' => hash('sha256', "terim {$i}"),
                'cost' => 50 + $i * 10,
                'impressions' => 100,
                'clicks' => 6,
                'conversions' => 0,
            ]);
        }

        $this->watchdog()->evaluate($this->date);

        $alerts = AdsAlert::query()->where('code', 'negative_candidate')->get();
        $this->assertCount(1, $alerts, 'Negatif kelime adayları tek alarmda toplanmalı.');

        $alert = $alerts->first();
        $this->assertSame('warning', $alert->severity);
        $this->assertNull($alert->campaign_name);
        // En pahalı 5 terim: terim 6..2 (cost 110..70). En ucuz "terim 1" (60₺) hariç.
        $this->assertCount(5, $alert->context['terms']);
        $this->assertStringContainsString('terim 6', $alert->message);
        $this->assertStringNotContainsString('terim 1"', $alert->message);
    }

    public function test_negative_candidate_tetiklenmez_esik_alti(): void
    {
        // 4 tıklama (< 5) — eşik altı.
        AdsSearchTerm::query()->create([
            'date' => $this->date->toDateString(),
            'campaign_name' => 'A',
            'ad_group_name' => 'Kaş Laminasyon',
            'search_term' => 'az tıklama',
            'term_hash' => hash('sha256', 'az tıklama'),
            'cost' => 80,
            'impressions' => 100,
            'clicks' => 4,
            'conversions' => 0,
        ]);

        $this->watchdog()->evaluate($this->date);

        $this->assertNull($this->alert('negative_candidate'));
    }

    // --- 8. capacity_exceeded -----------------------------------------------

    public function test_capacity_exceeded_tetiklenir(): void
    {
        // 7 günde toplam 15 dönüşüm > 11 kapasite.
        for ($offset = 6; $offset >= 0; $offset--) {
            $this->campaign($this->date->subDays($offset)->toDateString(), 'A', [
                'clicks' => 10, 'conversions' => $offset === 0 ? 15 : 0, 'cost' => 100,
            ]);
        }

        $this->watchdog()->evaluate($this->date);

        $alert = $this->alert('capacity_exceeded');
        $this->assertNotNull($alert);
        $this->assertSame('warning', $alert->severity);
        $this->assertStringContainsString('kapasite', $alert->message);
    }

    public function test_capacity_exceeded_tetiklenmez_kapasite_altinda(): void
    {
        for ($offset = 6; $offset >= 0; $offset--) {
            $this->campaign($this->date->subDays($offset)->toDateString(), 'A', [
                'clicks' => 10, 'conversions' => $offset === 0 ? 5 : 0, 'cost' => 100,
            ]);
        }

        $this->watchdog()->evaluate($this->date);

        $this->assertNull($this->alert('capacity_exceeded'));
    }

    // --- 10. keyword_gap ----------------------------------------------------

    public function test_keyword_gap_tetiklenir_karsiligi_olmayan_donusum(): void
    {
        $this->gapConfig();
        // Dönüşüm getiren ama anahtar kelimede karşılığı olmayan arama.
        $this->searchTerm('ipek kirpik ankara', ['conversions' => 2, 'cost' => 145]);

        $this->watchdog()->evaluate($this->date);

        $alert = $this->alert('keyword_gap');
        $this->assertNotNull($alert);
        $this->assertSame('warning', $alert->severity);
        $this->assertNull($alert->campaign_name);
        $this->assertStringContainsString('ipek kirpik ankara', $alert->message);
        $this->assertStringContainsString('yeni reklam grubu/kampanya adayı', $alert->message);
        $this->assertCount(1, $alert->context['terms']);
        $this->assertSame(14, $alert->context['days']);
    }

    public function test_keyword_gap_tetiklenmez_tam_eslesme_sozdizimi(): void
    {
        $this->gapConfig();
        // Kelime tam eşleşme tırnağıyla saklı; terim düz metin -> normalize eşleşir.
        $this->keyword('"ipek kirpik ankara"');
        $this->searchTerm('ipek kirpik ankara', ['conversions' => 2, 'cost' => 145]);

        $this->watchdog()->evaluate($this->date);

        $this->assertNull($this->alert('keyword_gap'));
    }

    public function test_keyword_gap_tetiklenmez_sirali_eslesme_sozdizimi(): void
    {
        $this->gapConfig();
        // Sıralı eşleşme köşeli parantezle saklı; normalize edilip eşleşmeli.
        $this->keyword('[kirpik perması]');
        $this->searchTerm('kirpik perması', ['conversions' => 1, 'cost' => 90]);

        $this->watchdog()->evaluate($this->date);

        $this->assertNull($this->alert('keyword_gap'));
    }

    public function test_keyword_gap_tetiklenmez_donusum_sifir(): void
    {
        $this->gapConfig();
        // Dönüşüm 0 -> eşiğin altı, karşılıksız talep sinyali sayılmaz.
        $this->searchTerm('bedava kirpik', ['conversions' => 0, 'cost' => 40]);

        $this->watchdog()->evaluate($this->date);

        $this->assertNull($this->alert('keyword_gap'));
    }

    public function test_keyword_gap_tetiklenmez_baska_kampanyada_anahtar(): void
    {
        $this->gapConfig();
        // Terim, BAŞKA bir kampanyanın anahtar kelimesi olarak var -> hesap
        // genelinde bakıldığı için aday değil.
        $this->keyword('ipek kirpik ankara', ['campaign_name' => 'B', 'ad_group_name' => 'Diğer']);
        $this->searchTerm('ipek kirpik ankara', ['conversions' => 2, 'cost' => 145]);

        $this->watchdog()->evaluate($this->date);

        $this->assertNull($this->alert('keyword_gap'));
    }

    public function test_keyword_gap_buyuk_kucuk_harf_ve_bosluk_farki_eslesir(): void
    {
        $this->gapConfig();
        // Kelimede büyük 'İ' ve çift boşluk; terim küçük harf tek boşluk.
        // Normalizasyon iki tarafı da aynı biçime indirmeli -> alarm YOK.
        $this->keyword('İPEK  Kirpik Ankara');
        $this->searchTerm('ipek kirpik ankara', ['conversions' => 2, 'cost' => 145]);

        $this->watchdog()->evaluate($this->date);

        $this->assertNull($this->alert('keyword_gap'));
    }

    public function test_keyword_gap_top_siniri_tek_alarmda_besi_alir(): void
    {
        $this->gapConfig();
        // 7 aday: hepsi dönüşümlü, karşılıksız. En çok dönüşüm getiren 5 alınmalı.
        foreach (range(1, 7) as $i) {
            $this->searchTerm("aday {$i}", ['conversions' => $i, 'cost' => 10 * $i]);
        }

        $this->watchdog()->evaluate($this->date);

        $alerts = AdsAlert::query()->where('code', 'keyword_gap')->get();
        $this->assertCount(1, $alerts, 'Adaylar tek alarmda toplanmalı.');

        $alert = $alerts->first();
        $this->assertCount(5, $alert->context['terms']);
        // En çok dönüşümlü 5: aday 7..3. En düşük ikisi (aday 1,2) hariç.
        $this->assertStringContainsString('aday 7', $alert->message);
        $this->assertStringNotContainsString('aday 1"', $alert->message);
        $this->assertStringNotContainsString('aday 2"', $alert->message);
    }

    public function test_keyword_gap_siralama_yuksek_donusum_once(): void
    {
        $this->gapConfig();
        $this->searchTerm('az dönüşüm', ['conversions' => 1, 'cost' => 500]);
        $this->searchTerm('çok dönüşüm', ['conversions' => 5, 'cost' => 50]);

        $this->watchdog()->evaluate($this->date);

        $alert = $this->alert('keyword_gap');
        $this->assertNotNull($alert);
        // Dönüşümü yüksek olan (maliyet düşük olsa da) mesajda önce gelmeli.
        $this->assertLessThan(
            strpos($alert->message, 'az dönüşüm'),
            strpos($alert->message, 'çok dönüşüm'),
        );
        $this->assertSame('çok dönüşüm', $alert->context['terms'][0]['search_term']);
    }

    public function test_keyword_gap_idempotent_iki_cagri_alarm_cogaltmaz(): void
    {
        $this->gapConfig();
        $this->searchTerm('ipek kirpik ankara', ['conversions' => 2, 'cost' => 145]);

        $this->watchdog()->evaluate($this->date);
        $this->watchdog()->evaluate($this->date);

        $this->assertCount(1, AdsAlert::query()->where('code', 'keyword_gap')->get());
    }

    // --- idempotans ---------------------------------------------------------

    public function test_evaluate_idempotent_iki_cagri_alarm_cogaltmaz(): void
    {
        $this->campaign($this->date->toDateString(), 'A', ['clicks' => 25, 'conversions' => 0, 'cost' => 60]);

        $first = $this->watchdog()->evaluate($this->date);
        $afterFirst = AdsAlert::query()->count();

        $second = $this->watchdog()->evaluate($this->date);
        $afterSecond = AdsAlert::query()->count();

        $this->assertSame($first, $second);
        $this->assertSame($afterFirst, $afterSecond);
    }

    // --- ads:digest komutu --------------------------------------------------

    public function test_digest_komutu_telegram_bos_iken_hatasiz_calisir(): void
    {
        config(['services.telegram.bot_token' => null, 'services.telegram.chat_id' => null]);
        Http::fake();

        $this->campaign($this->date->toDateString(), 'A', ['clicks' => 25, 'conversions' => 0, 'cost' => 178.42]);

        $this->artisan('ads:digest', ['--date' => $this->date->toDateString()])
            ->assertExitCode(0);

        // Telegram yapılandırılmadığı için hiçbir istek atılmamalı.
        Http::assertNothingSent();
    }

    public function test_digest_komutu_telegram_dolu_iken_istek_atar(): void
    {
        config([
            'services.telegram.bot_token' => 'test-token',
            'services.telegram.chat_id' => '12345',
        ]);
        Http::fake(['api.telegram.org/*' => Http::response(
            ['ok' => true, 'result' => ['message_id' => 4242]], 200
        )]);

        // Kampanya adı reklamveren kaynaklı: '<' ve '&' HTML modunda kaçırılmalı,
        // yoksa Telegram tüm gönderimi 400 ile reddeder.
        $this->campaign($this->date->toDateString(), 'Kaş & Kirpik <yeni>', ['clicks' => 25, 'conversions' => 0, 'cost' => 178.42]);

        $this->artisan('ads:digest', ['--date' => $this->date->toDateString()])
            ->expectsOutputToContain('message_id=4242')
            ->assertExitCode(0);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'api.telegram.org/bottest-token/sendMessage')
                && $request['chat_id'] === '12345'
                && $request['parse_mode'] === 'HTML'
                // Başlıklarımız etiket olarak kalır...
                && str_contains($request['text'], '<b>Kampanyalar</b>')
                // ...ama dinamik ad kaçırılır, ham '<yeni>' geçmez.
                && str_contains($request['text'], 'Kaş &amp; Kirpik &lt;yeni&gt;')
                && ! str_contains($request['text'], '<yeni>');
        });
    }

    public function test_digest_telegram_reddederse_hata_koduyla_doner(): void
    {
        config([
            'services.telegram.bot_token' => 'test-token',
            'services.telegram.chat_id' => '12345',
        ]);
        // Gerçek senaryo: yanlış chat_id veya bot engellenmiş.
        Http::fake(['api.telegram.org/*' => Http::response(
            ['ok' => false, 'description' => 'Bad Request: chat not found'], 400
        )]);

        $this->campaign($this->date->toDateString(), 'A', ['clicks' => 25, 'conversions' => 0, 'cost' => 178.42]);

        // Sessizce başarılı dönmek en kötüsü olurdu: özet hesaplanır, kimse görmez.
        $this->artisan('ads:digest', ['--date' => $this->date->toDateString()])
            ->assertExitCode(1);
    }

    public function test_digest_telegram_ulasilamazsa_hata_koduyla_doner(): void
    {
        config([
            'services.telegram.bot_token' => 'test-token',
            'services.telegram.chat_id' => '12345',
        ]);
        // Ağ/güvenlik duvarı kesintisi - istisna sızmadan hata koduna dönmeli.
        Http::fake(fn () => throw new \Illuminate\Http\Client\ConnectionException('timeout'));

        $this->campaign($this->date->toDateString(), 'A', ['clicks' => 25, 'conversions' => 0, 'cost' => 178.42]);

        $this->artisan('ads:digest', ['--date' => $this->date->toDateString()])
            ->assertExitCode(1);
    }

    public function test_digest_alarm_varken_de_basarili_doner(): void
    {
        config(['services.telegram.bot_token' => null, 'services.telegram.chat_id' => null]);
        Http::fake();

        // 25 tıklama / 0 dönüşüm -> critical alarm. Alarm bir arıza değil.
        $this->campaign($this->date->toDateString(), 'A', ['clicks' => 25, 'conversions' => 0, 'cost' => 178.42]);

        $this->artisan('ads:digest', ['--date' => $this->date->toDateString()])
            ->assertExitCode(0);

        $this->assertGreaterThan(0, AdsAlert::query()->count());
    }
}
