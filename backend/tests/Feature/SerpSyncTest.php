<?php

namespace Tests\Feature;

use App\Models\SearchQuery;
use App\Models\SerpResult;
use App\Models\Service;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SerpSyncTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        CarbonImmutable::setTestNow('2026-10-18 09:00:00');

        config([
            'seo.serper.key' => 'serper-test',
            'seo.serper.delay_ms' => 0,
            'seo.serper.weekly_limit' => 60,
            'seo.own_hosts' => ['striastudio.com.tr', 'microbladingankara.com'],
        ]);
    }

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();

        parent::tearDown();
    }

    private function serp(array $organic = []): array
    {
        return [
            'organic' => $organic,
            'peopleAlsoAsk' => [['question' => 'Microblading kaç gün sürer?', 'snippet' => 'Genelde 2 saat.', 'title' => 'T', 'link' => 'https://ornek.com/a']],
            'relatedSearches' => [['query' => 'microblading fiyat'], ['query' => 'microblading ankara']],
            'credits' => 1,
        ];
    }

    /** Sorgu → yanıt; tanımsız sorgular boş SERP döner. */
    private function fakeSerper(array $byQuery = []): void
    {
        Http::fake(function (Request $request) use ($byQuery) {
            return $byQuery[$request['q']] ?? Http::response($this->serp());
        });
    }

    private function gscQuery(string $query, int $impressions, string $period = '2026W42', ?string $source = 'gsc'): void
    {
        SearchQuery::create(compact('query', 'impressions', 'period', 'source') + ['clicks' => 0]);
    }

    /** @return list<string> */
    private function sentQueries(): array
    {
        return array_map(fn ($pair) => $pair[0]['q'], Http::recorded()->all());
    }

    public function test_stores_top10_paa_related_and_detects_own_position(): void
    {
        $this->gscQuery('microblading', 100);

        $organic = [];
        for ($i = 1; $i <= 12; $i++) {
            $organic[] = ['title' => "Sonuç {$i}", 'link' => "https://rakip{$i}.com/x", 'snippet' => 's', 'position' => $i];
        }
        $organic[3]['link'] = 'https://www.MicrobladingAnkara.com/'; // position 4

        $this->fakeSerper(['microblading' => Http::response($this->serp($organic))]);

        $this->artisan('serp:sync')->assertSuccessful();

        Http::assertSent(fn (Request $r) => $r->url() === 'https://google.serper.dev/search'
            && $r->hasHeader('X-API-KEY', 'serper-test')
            && $r['gl'] === 'tr' && $r['location'] === 'Ankara, Ankara, Turkey');

        $row = SerpResult::sole();
        $this->assertSame('microblading', $row->query);
        $this->assertSame('2026W42', $row->period);
        $this->assertSame(4, $row->own_position);
        $this->assertSame('https://www.MicrobladingAnkara.com/', $row->own_url);
        $this->assertCount(10, $row->top_results);
        $this->assertSame(['position' => 4, 'title' => 'Sonuç 4', 'link' => 'https://www.MicrobladingAnkara.com/', 'host' => 'microbladingankara.com'], $row->top_results[3]);
        $this->assertSame([['question' => 'Microblading kaç gün sürer?', 'snippet' => 'Genelde 2 saat.', 'link' => 'https://ornek.com/a']], $row->people_also_ask);
        $this->assertSame(['microblading fiyat', 'microblading ankara'], $row->related_searches);
        $this->assertNull($row->answer_box);
        $this->assertSame(1, $row->credits);
    }

    public function test_subdomain_of_own_host_counts_and_lookalike_does_not(): void
    {
        $this->gscQuery('kaş tasarımı', 10);
        $this->fakeSerper(['kaş tasarımı' => Http::response($this->serp([
            ['title' => 'a', 'link' => 'https://notstriastudio.com.tr/', 'position' => 1],
            ['title' => 'b', 'link' => 'https://www.striastudio.com.tr/hizmetler/kas', 'position' => 2],
        ]))]);

        $this->artisan('serp:sync')->assertSuccessful();

        $this->assertSame(2, SerpResult::sole()->own_position);
    }

    public function test_one_failure_does_not_stop_others(): void
    {
        $this->gscQuery('a sorgu', 30);
        $this->gscQuery('b sorgu', 20);
        $this->gscQuery('c sorgu', 10);
        $this->fakeSerper(['b sorgu' => Http::response('boom', 500)]);

        $this->artisan('serp:sync')->assertSuccessful();

        $this->assertEqualsCanonicalizing(['a sorgu', 'c sorgu'], SerpResult::pluck('query')->all());
    }

    public function test_service_keywords_first_cap_brand_exclusion_and_dedupe(): void
    {
        Service::factory()->create(['keywords_tr' => ['Kaş Laminasyonu', 'kirpik lifting']]);
        Service::factory()->create(['is_active' => false, 'keywords_tr' => ['pasif hizmet']]);

        $this->gscQuery('Stria Studio', 9000);
        $this->gscQuery('kas laminasyonu', 5000);  // hizmet kelimesiyle aynı (normalize)
        $this->gscQuery('microblading', 400);
        $this->gscQuery('dudak renklendirme', 300);
        $this->gscQuery('kaş kontür', 200);
        $this->gscQuery('eski dönem', 99999, '2026W41');
        $this->gscQuery('serp fikri', 99999, '2026W42', 'serp');

        $this->fakeSerper();

        $this->artisan('serp:sync', ['--limit' => 4])->assertSuccessful();

        $this->assertSame(['Kaş Laminasyonu', 'kirpik lifting', 'microblading', 'dudak renklendirme'], $this->sentQueries());
    }

    public function test_rerun_skips_already_fetched_queries(): void
    {
        $this->gscQuery('microblading', 100);
        $this->fakeSerper();

        $this->artisan('serp:sync')->assertSuccessful();
        $this->artisan('serp:sync')->assertSuccessful();

        Http::assertSentCount(1);
        $this->assertSame(1, SerpResult::count());
    }

    public function test_fails_without_key(): void
    {
        config(['seo.serper.key' => null]);
        Http::fake();

        $this->artisan('serp:sync')->assertFailed();
        Http::assertNothingSent();
    }
}
