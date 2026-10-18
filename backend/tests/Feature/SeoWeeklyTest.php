<?php

namespace Tests\Feature;

use App\Models\ContentRevision;
use App\Models\Post;
use App\Models\SearchPage;
use App\Models\SearchQuery;
use App\Models\SerpResult;
use App\Models\Service;
use App\Support\SeoPlanner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SeoWeeklyTest extends TestCase
{
    use RefreshDatabase;

    /** 2026-10-19 → pencere bitişi 2026-10-16 → ISO hafta 42. */
    private const PERIOD = '2026W42';

    private const PREV = '2026W41';

    /** @var list<string> */
    private array $tempFiles = [];

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-10-19 09:00:00');
        Http::fake();

        config([
            'seo.gsc.credentials' => null,
            'seo.gsc.site_url' => null,
            'seo.serper.key' => null,
            'services.telegram.bot_token' => null,
            'services.telegram.chat_id' => null,
            'services.indexnow.key' => null,
            'services.indexnow.host' => 'striastudio.com.tr',
            // Gerçek claude CLI asla çağrılmasın; testler fakeClaude() ile değiştirir.
            'content.claude.binary' => '/nonexistent/claude',
        ]);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        @unlink(storage_path('app/seo-reports/'.self::PERIOD.'.md'));
        foreach ($this->tempFiles as $file) {
            @unlink($file);
        }

        parent::tearDown();
    }

    // --- yardımcılar --------------------------------------------------------

    /**
     * Argümanları/stdin'i yok sayıp sabit bir başarılı zarf basan sahte claude.
     *
     * @param  array<string, mixed>  $structured
     */
    private function fakeClaude(array $structured): void
    {
        $json = tempnam(sys_get_temp_dir(), 'seo-claude-').'.json';
        file_put_contents($json, json_encode([
            'is_error' => false,
            'subtype' => 'success',
            'structured_output' => $structured,
        ], JSON_UNESCAPED_UNICODE));

        $bin = tempnam(sys_get_temp_dir(), 'seo-claude-bin-');
        file_put_contents($bin, "#!/bin/sh\ncat > /dev/null\ncat '{$json}'\n");
        chmod($bin, 0755);

        $this->tempFiles[] = $json;
        $this->tempFiles[] = $bin;

        config(['content.claude.binary' => $bin]);
    }

    private function planner(): SeoPlanner
    {
        return app(SeoPlanner::class);
    }

    /**
     * @param  list<string>  $questions
     * @param  list<string>  $related
     */
    private function serp(string $query, array $questions, array $related = [], string $period = self::PERIOD): SerpResult
    {
        return SerpResult::create([
            'query' => $query,
            'period' => $period,
            'top_results' => [],
            'people_also_ask' => array_map(fn (string $q): array => ['question' => $q], $questions),
            'related_searches' => array_map(fn (string $q): array => ['query' => $q], $related),
            'credits' => 1,
        ]);
    }

    private function page(string $url, float $position, int $impressions, string $period = self::PERIOD, float $ctr = 0.01): SearchPage
    {
        return SearchPage::create([
            'page' => $url,
            'clicks' => 0,
            'impressions' => $impressions,
            'ctr' => $ctr,
            'position' => $position,
            'period' => $period,
        ]);
    }

    private function revisionAt(Post|Service $model, string $reason, int $daysAgo): void
    {
        $revision = new ContentRevision([
            'revisable_type' => $model->getMorphClass(),
            'revisable_id' => $model->getKey(),
            'reason' => $reason,
            'before' => [],
        ]);
        $revision->created_at = now()->subDays($daysAgo);
        $revision->save();
    }

    /** @return list<array{q: string, a: string}> */
    private function faqs(int $n): array
    {
        return array_map(fn (int $i): array => ['q' => "Soru numarası {$i} nedir?", 'a' => 'Cevap.'], range(1, $n));
    }

    private function microblading(array $attrs = []): Service
    {
        return Service::factory()->create(array_merge([
            'slug' => 'microblading',
            'name_tr' => 'Microblading',
            'keywords_tr' => ['microblading ankara'],
            'desc_tr' => 'Kıl tekniğiyle doğal kaş görünümü.',
            'faq_tr' => [['q' => 'Microblading ne kadar sürer?', 'a' => 'Uygulama yaklaşık iki saat sürer.']],
        ], $attrs));
    }

    // --- planner ------------------------------------------------------------

    public function test_previous_period_ignores_monthly_and_later_periods(): void
    {
        SearchQuery::create(['query' => 'a', 'period' => '2026-12', 'impressions' => 1]);
        SearchPage::create(['page' => 'https://striastudio.com.tr/', 'period' => self::PREV]);
        $this->serp('x', [], [], '2026W40');
        $this->serp('y', [], [], self::PERIOD);

        $this->assertSame(self::PREV, $this->planner()->previousPeriod(self::PERIOD));
        $this->assertNull($this->planner()->previousPeriod('2026W40'));
    }

    public function test_topics_filter_brand_english_covered_duplicate_length_and_cap(): void
    {
        Post::factory()->create([
            'title_tr' => 'Kaş pudralama sonrası bakım nasıl yapılır',
            'excerpt_tr' => 'Bakım rehberi.',
        ]);
        SearchQuery::create(['query' => 'microblading iyileşme süreci', 'period' => self::PERIOD, 'impressions' => 40]);

        $this->serp('microblading ankara', [
            'Microblading ne kadar kalıcı olur?',
            'Stria Studio nerede?',
            'How long does microblading last?',
            'Kaş mı?',
            'microblading ne kadar  kalıcı olur',
            'Kaş pudralama sonrası bakım nasıl yapılır?',
            'Microblading iyileşme süreci',
        ], ['kalıcı kaş makyajı kaç gün sürer', 'striastudio com tr']);

        $this->assertSame(
            ['Microblading ne kadar kalıcı olur?', 'kalıcı kaş makyajı kaç gün sürer'],
            $this->planner()->topics(self::PERIOD),
        );

        config(['seo.topics_per_week' => 1]);
        $this->assertSame(['Microblading ne kadar kalıcı olur?'], $this->planner()->topics(self::PERIOD));
    }

    public function test_refresh_targets_order_drops_then_striking_with_cap_and_cooldown(): void
    {
        $post = fn (string $slug): Post => Post::factory()->create(['slug' => $slug, 'title_tr' => "Başlık {$slug}"]);
        $url = fn (string $slug): string => "https://striastudio.com.tr/blog/{$slug}";

        $a = $post('a');
        $post('b');
        $post('c');
        $post('d');
        $post('e');
        $f = $post('f');
        $g = $post('g');
        $post('other');

        $this->page($url('a'), 9, 10);
        $this->page($url('a'), 5, 10, self::PREV);   // -4 → drop
        $this->page($url('b'), 12, 10);
        $this->page($url('b'), 2, 10, self::PREV);   // -10 → drop (ilk)
        $this->page($url('c'), 10, 500);             // striking
        $this->page($url('d'), 15, 200);             // striking
        $this->page($url('e'), 30, 900);             // menzil dışı
        $this->page($url('f'), 11, 800);             // striking ama 10 gün önce tazelendi
        $this->page($url('g').'/', 12, 100);         // striking, 40 gün önceki tazeleme engel değil
        $this->page('https://microbladingankara.com/blog/other', 10, 900);
        $this->revisionAt($f, 'blog-refresh', 10);
        $this->revisionAt($g, 'blog-refresh', 40);
        $this->revisionAt($a, 'service-faq', 1);     // başka neden: engel değil

        SearchQuery::create(['query' => 'b sorgu az', 'period' => self::PERIOD, 'impressions' => 50, 'top_page' => $url('b')]);
        SearchQuery::create(['query' => 'b sorgu çok', 'period' => self::PERIOD, 'impressions' => 80, 'top_page' => $url('b')]);

        config(['seo.refresh.max_per_week' => 3]);
        $targets = $this->planner()->refreshTargets(self::PERIOD, self::PREV);

        $this->assertSame(['b', 'a', 'c'], array_column($targets, 'slug'));
        $this->assertSame(['drop', 'drop', 'striking'], array_column($targets, 'reason'));
        $this->assertSame(['b sorgu çok', 'Başlık a', 'Başlık c'], array_column($targets, 'query'));

        config(['seo.refresh.max_per_week' => 10]);
        $this->assertSame(['b', 'a', 'c', 'd', 'g'], array_column($this->planner()->refreshTargets(self::PERIOD, self::PREV), 'slug'));
    }

    public function test_faq_candidates_fuzzy_dedupe_weekly_cap_and_total_cap(): void
    {
        $service = $this->microblading();

        $this->serp('Microblading Ankara', [
            'Microblading ne kadar sürer',          // mevcut SSS'nin bulanık tekrarı
            'Microblading acıtır mı?',
            'Microblading acıtır mı',               // kabul edilenin tekrarı
            'Kaş pudralama nedir?',                 // bu hizmete denk düşmüyor
            'Does microblading hurt?',              // İngilizce
            'Microblading sonrası duş alınır mı?',
            'Microblading kimlere uygulanmaz?',     // haftalık sınır (2) dışında
        ]);
        $this->serp('dudak renklendirme', ['Microblading kaç yıl kalır?']);

        $this->assertSame(
            ['Microblading acıtır mı?', 'Microblading sonrası duş alınır mı?'],
            $this->planner()->faqCandidates($service, self::PERIOD),
        );

        $service->faq_tr = $this->faqs(15);
        $this->assertSame(['Microblading ne kadar sürer'], $this->planner()->faqCandidates($service, self::PERIOD));

        $service->faq_tr = $this->faqs(16);
        $this->assertSame([], $this->planner()->faqCandidates($service, self::PERIOD));
    }

    public function test_faq_candidates_skip_price_questions_and_duration_synonyms(): void
    {
        // Real PAA from the first live run: price questions always failed ContentGuard ("tl").
        $service = $this->microblading();
        $service->faq_tr = [['q' => 'Microblading ne kadar kalıcı?', 'a' => 'x']];

        $this->serp('Microblading Ankara', [
            'Microblading kaç TL?',
            'Microblading fiyatları 2026',
            'Microblading etkisi ne kadar sürer?',   // same question as "ne kadar kalıcı?"
            'Microblading acıtır mı?',
        ]);

        $this->assertSame(['Microblading acıtır mı?'], $this->planner()->faqCandidates($service, self::PERIOD));
    }

    public function test_copy_target_picks_single_highest_impression_service(): void
    {
        $a = Service::factory()->create(['slug' => 'a']);
        $b = Service::factory()->create(['slug' => 'b']);
        Service::factory()->create(['slug' => 'c']);
        Service::factory()->create(['slug' => 'd']);
        Service::factory()->create(['slug' => 'e', 'is_active' => false]);

        $this->page('https://striastudio.com.tr/hizmetler/a', 6, 300);
        $this->page('https://www.striastudio.com.tr/hizmetler/b', 7, 500);
        $this->page('https://striastudio.com.tr/hizmetler/c', 7, 900, self::PERIOD, 0.05); // TO yeterli
        $this->page('https://striastudio.com.tr/hizmetler/d', 30, 1000);                  // menzil dışı
        $this->page('https://striastudio.com.tr/hizmetler/e', 6, 2000);                   // pasif

        $this->assertTrue($b->is($this->planner()->copyTarget(self::PERIOD)));

        $this->revisionAt($b, 'service-meta', 5);
        $this->assertTrue($a->is($this->planner()->copyTarget(self::PERIOD)));

        $this->revisionAt($a, 'service-meta', 5);
        $this->assertNull($this->planner()->copyTarget(self::PERIOD));
    }

    // --- komut --------------------------------------------------------------

    public function test_missing_credentials_skip_syncs_and_topics_are_inserted_after_gsc_rows(): void
    {
        SearchQuery::create(['query' => 'kalıcı makyaj ankara', 'period' => self::PERIOD, 'impressions' => 25]);
        $this->serp('microblading ankara', ['Microblading ne kadar kalıcı olur?']);

        $this->artisan('seo:weekly')
            ->expectsOutputToContain('GSC kimliği yok, gsc:sync atlandı')
            ->expectsOutputToContain('serp:sync atlandı')
            ->assertSuccessful();

        $topic = SearchQuery::where('query', 'Microblading ne kadar kalıcı olur?')->firstOrFail();
        $this->assertSame('serp', $topic->source);
        $this->assertSame(0, $topic->impressions);
        $this->assertSame(self::PERIOD, $topic->period);

        // content:write gösterime göre sıralar: gerçek GSC sorgusu önce.
        $this->assertSame(
            ['kalıcı makyaj ankara', 'Microblading ne kadar kalıcı olur?'],
            SearchQuery::where('period', self::PERIOD)->opportunity()->pluck('query')->all(),
        );

        $report = (string) file_get_contents(storage_path('app/seo-reports/'.self::PERIOD.'.md'));
        $this->assertStringContainsString('Haftalık SEO raporu — '.self::PERIOD, $report);
        $this->assertStringContainsString('- Microblading ne kadar kalıcı olur?', $report);
        $this->assertStringContainsString('Serper kredisi: 1', $report);
    }

    public function test_topics_join_latest_gsc_period_so_csv_queries_stay_visible(): void
    {
        // GSC API henüz kurulmamış: yalnızca eski aylık CSV dönemi var.
        SearchQuery::create(['query' => 'kalıcı makyaj ankara', 'period' => '2026-09', 'impressions' => 25]);
        $this->serp('microblading ankara', ['Microblading ne kadar kalıcı olur?']);

        $this->artisan('seo:weekly')->assertSuccessful();

        $topic = SearchQuery::where('query', 'Microblading ne kadar kalıcı olur?')->firstOrFail();
        $this->assertSame('2026-09', $topic->period);
        // content:write'ın max('period')'u CSV dönemi olarak kalmalı.
        $this->assertSame('2026-09', SearchQuery::max('period'));
    }

    public function test_dry_run_writes_report_but_nothing_else(): void
    {
        $this->serp('microblading ankara', ['Microblading ne kadar kalıcı olur?']);

        $this->artisan('seo:weekly', ['--dry-run' => true])->assertSuccessful();

        $this->assertSame(0, SearchQuery::count());
        $this->assertFileExists(storage_path('app/seo-reports/'.self::PERIOD.'.md'));
    }

    public function test_failed_refresh_records_no_revision_and_is_reported(): void
    {
        $post = Post::factory()->create(['slug' => 'zayif-yazi']);
        $this->page('https://striastudio.com.tr/blog/zayif-yazi', 12, 100);
        // content:write'ın doğrulaması bu çıktıyı reddeder → başarısız tazeleme.
        $this->fakeClaude(['faqs' => []]);

        $this->artisan('seo:weekly')->assertSuccessful();

        $this->assertSame(0, ContentRevision::count());
        $this->assertSame($post->body_tr, $post->fresh()->body_tr);
        $this->assertStringContainsString(
            '/blog/zayif-yazi (striking',
            (string) file_get_contents(storage_path('app/seo-reports/'.self::PERIOD.'.md')),
        );
        $this->assertStringContainsString('başarısız', (string) file_get_contents(storage_path('app/seo-reports/'.self::PERIOD.'.md')));
    }

    public function test_service_faq_is_appended_with_revision_and_reverted(): void
    {
        $service = $this->microblading();
        $old = $service->faq_tr;
        $this->serp('microblading ankara', ['Microblading acıtır mı?', 'Microblading sonrası duş alınır mı?']);

        $answer = 'Uygulama öncesinde bölgeye uyuşturucu krem uygulanır; çoğu kişi işlem sırasında yalnızca hafif bir his tarif eder.';
        $this->fakeClaude(['faqs' => [
            ['q' => 'Microblading acıtır mı?', 'a' => $answer],
            ['q' => 'Microblading sonrası duş alınır mı?', 'a' => ''],
        ]]);

        $this->artisan('seo:weekly')->assertSuccessful();

        $service->refresh();
        $this->assertSame([...$old, ['q' => 'Microblading acıtır mı?', 'a' => $answer]], $service->faq_tr);

        $revision = ContentRevision::where('reason', 'service-faq')->firstOrFail();
        $this->assertSame(['faq_tr' => $old], $revision->before);
        $this->assertSame(['faq_tr' => $service->faq_tr], $revision->after);
        $this->assertSame(self::PERIOD, $revision->period);

        $this->artisan('seo:revert', ['id' => $revision->id])->assertSuccessful();
        $this->assertSame($old, $service->fresh()->faq_tr);
        $this->assertNotNull($revision->fresh()->reverted_at);

        $this->artisan('seo:revert', ['id' => $revision->id])->assertFailed();
        $this->artisan('seo:revert', ['--list' => true])->expectsOutputToContain('service-faq')->assertSuccessful();
    }

    public function test_forbidden_faq_answer_is_rejected(): void
    {
        $service = $this->microblading();
        $old = $service->faq_tr;
        $this->serp('microblading ankara', ['Microblading acıtır mı?']);

        $this->fakeClaude(['faqs' => [
            ['q' => 'Microblading acıtır mı?', 'a' => 'Hiç acı hissetmezsiniz, bunu garanti ediyoruz; uygulama tamamen konforlu ve sakin bir ortamda yapılır.'],
        ]]);

        $this->artisan('seo:weekly')->assertSuccessful();

        $this->assertSame($old, $service->fresh()->faq_tr);
        $this->assertSame(0, ContentRevision::count());
    }

    public function test_service_copy_seo_only_writes_only_meta_fields(): void
    {
        $service = Service::factory()->create([
            'slug' => 'kas-laminasyon',
            'name_tr' => 'Kaş Laminasyon',
            'desc_tr' => 'Eski açıklama',
            'seo_title_tr' => 'Eski başlık',
            'seo_desc_tr' => 'Eski açıklama',
        ]);

        $this->fakeClaude([
            'desc_tr' => str_repeat('Yeni açıklama metni. ', 6),
            'intro_tr' => str_repeat('Yeni giriş metni burada yer alır. ', 8),
            'aftercare_tr' => 'Bakım.',
            'benefits_tr' => ['a', 'b', 'c'],
            'process_tr' => ['a', 'b', 'c'],
            'faq_tr' => [['q' => 'q1', 'a' => 'a1'], ['q' => 'q2', 'a' => 'a2'], ['q' => 'q3', 'a' => 'a3']],
            'keywords_tr' => ['a', 'b', 'c', 'd'],
            'seo_title_tr' => 'Kaş Laminasyon Ankara',
            'seo_desc_tr' => str_repeat('Kaş laminasyon ile doğal ve düzenli kaşlar. ', 3),
        ]);

        $this->artisan('content:service-copy', ['slug' => 'kas-laminasyon', '--apply' => true, '--seo-only' => true])
            ->assertSuccessful();

        $service->refresh();
        $this->assertSame('Kaş Laminasyon Ankara', $service->seo_title_tr);
        $this->assertStringStartsWith('Kaş laminasyon ile', $service->seo_desc_tr);
        $this->assertSame('Eski açıklama', $service->desc_tr);
    }
}
