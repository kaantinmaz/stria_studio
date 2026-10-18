<?php

namespace Tests\Feature;

use App\Models\SearchPage;
use App\Models\SearchQuery;
use App\Support\SearchConsole;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SearchConsoleSyncTest extends TestCase
{
    use RefreshDatabase;

    private string $publicKey;

    private string $credentials;

    protected function setUp(): void
    {
        parent::setUp();

        CarbonImmutable::setTestNow('2026-10-18 09:00:00');

        // Testlik RSA anahtarı + geçici servis hesabı JSON'u.
        $key = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
        openssl_pkey_export($key, $privatePem);
        $this->publicKey = openssl_pkey_get_details($key)['key'];

        $this->credentials = tempnam(sys_get_temp_dir(), 'gsc').'.json';
        file_put_contents($this->credentials, json_encode([
            'client_email' => 'bot@stria.iam.gserviceaccount.com',
            'private_key' => $privatePem,
            'token_uri' => 'https://oauth2.googleapis.com/token',
        ]));

        config([
            'seo.gsc.credentials' => $this->credentials,
            'seo.gsc.site_url' => 'sc-domain:striastudio.com.tr',
            'seo.gsc.window_days' => 28,
            'seo.gsc.lag_days' => 3,
            'cache.default' => 'array',
        ]);
    }

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();
        @unlink($this->credentials);

        parent::tearDown();
    }

    /**
     * @param  array<string, list<array<string, mixed>>>  $rowsByDimensions  "query", "query,page", "page"
     */
    private function fakeGoogle(array $rowsByDimensions): void
    {
        Http::fake(function (Request $request) use ($rowsByDimensions) {
            if (str_contains($request->url(), 'oauth2.googleapis.com/token')) {
                return Http::response(['access_token' => 'tok-123', 'expires_in' => 3600]);
            }

            $dims = implode(',', $request->data()['dimensions']);

            return Http::response(['rows' => $request->data()['startRow'] === 0 ? ($rowsByDimensions[$dims] ?? []) : []]);
        });
    }

    private function row(array $keys, int $clicks, int $impressions, float $ctr = 0.1, float $position = 5.5): array
    {
        return compact('keys', 'clicks', 'impressions', 'ctr', 'position');
    }

    public function test_period_id_for_fixed_date(): void
    {
        $window = SearchConsole::window();

        $this->assertSame('2026-10-15', $window['end']->format('Y-m-d'));
        $this->assertSame('2026-09-18', $window['start']->format('Y-m-d'));
        $this->assertSame('2026W42', SearchConsole::currentPeriod());
    }

    public function test_jwt_assertion_is_signed_and_token_is_cached(): void
    {
        $this->fakeGoogle([]);

        $this->artisan('gsc:sync')->assertSuccessful();
        $this->artisan('gsc:sync')->assertSuccessful();

        $tokenCalls = Http::recorded(fn (Request $r) => str_contains($r->url(), '/token'));
        $this->assertCount(1, $tokenCalls);

        $request = $tokenCalls[0][0];
        $this->assertSame('urn:ietf:params:oauth:grant-type:jwt-bearer', $request['grant_type']);

        $parts = explode('.', $request['assertion']);
        $this->assertCount(3, $parts);

        $decode = fn (string $s) => base64_decode(strtr($s, '-_', '+/'));
        $this->assertSame(1, openssl_verify("{$parts[0]}.{$parts[1]}", $decode($parts[2]), $this->publicKey, OPENSSL_ALGO_SHA256));

        $this->assertSame(['alg' => 'RS256', 'typ' => 'JWT'], json_decode($decode($parts[0]), true));
        $claims = json_decode($decode($parts[1]), true);
        $this->assertSame('bot@stria.iam.gserviceaccount.com', $claims['iss']);
        $this->assertSame('https://www.googleapis.com/auth/webmasters.readonly', $claims['scope']);
        $this->assertSame('https://oauth2.googleapis.com/token', $claims['aud']);
        $this->assertSame(3600, $claims['exp'] - $claims['iat']);

        Http::assertSent(fn (Request $r) => str_contains($r->url(), '/sites/sc-domain%3Astriastudio.com.tr/searchAnalytics/query')
            && $r->hasHeader('Authorization', 'Bearer tok-123')
            && $r['startDate'] === '2026-09-18'
            && $r['endDate'] === '2026-10-15'
            && $r['dataState'] === 'final');
    }

    public function test_pages_through_full_result_sets(): void
    {
        // [query,page] satırları DB'ye yazılmaz; 25000 satır hızlı kalır ama
        // sahte yanıtın JSON kopyaları tam süitte 128M sınırını aşabiliyor.
        ini_set('memory_limit', '512M');
        $full = array_fill(0, 25000, $this->row(['x', 'https://striastudio.com.tr/'], 0, 1));
        $this->fakeGoogle(['query,page' => $full]);

        $this->artisan('gsc:sync')->assertSuccessful();

        Http::assertSent(fn (Request $r) => ($r['dimensions'] ?? null) === ['query', 'page'] && $r['startRow'] === 25000);
        Http::assertNotSent(fn (Request $r) => ($r['dimensions'] ?? null) === ['query'] && $r['startRow'] === 25000);
    }

    public function test_upserts_queries_with_top_page_and_pages(): void
    {
        SearchQuery::create(['query' => 'kaş tasarımı', 'period' => '2026W42', 'clicks' => 1, 'impressions' => 1]);

        $this->fakeGoogle([
            'query' => [
                $this->row(['kaş  tasarımı '], 12, 300, 0.04, 6.2),
                $this->row(['dudak renklendirme'], 0, 50),
                $this->row(['   '], 1, 1),
            ],
            'query,page' => [
                $this->row(['kaş tasarımı', 'https://striastudio.com.tr/a'], 5, 100),
                $this->row(['kaş tasarımı', 'https://striastudio.com.tr/b'], 7, 90),
                $this->row(['kaş tasarımı', 'https://striastudio.com.tr/c'], 7, 120),
            ],
            'page' => [
                $this->row(['https://striastudio.com.tr/c'], 20, 400, 0.05, 4.1),
            ],
        ]);

        $this->artisan('gsc:sync')->assertSuccessful();

        $this->assertSame(2, SearchQuery::count());

        $q = SearchQuery::where('query', 'kaş tasarımı')->first();
        $this->assertSame('2026W42', $q->period);
        $this->assertSame(12, $q->clicks);
        $this->assertSame(300, $q->impressions);
        $this->assertSame('gsc', $q->source);
        $this->assertSame('https://striastudio.com.tr/c', $q->top_page);
        $this->assertEquals(6.2, (float) $q->position);

        $this->assertNull(SearchQuery::where('query', 'dudak renklendirme')->first()->top_page);

        $page = SearchPage::sole();
        $this->assertSame('https://striastudio.com.tr/c', $page->page);
        $this->assertSame('2026W42', $page->period);
        $this->assertSame(20, $page->clicks);
    }

    public function test_period_option_overrides(): void
    {
        $this->fakeGoogle(['query' => [$this->row(['kirpik lifting'], 1, 10)]]);

        $this->artisan('gsc:sync', ['--period' => '2026W40'])->assertSuccessful();

        $this->assertSame('2026W40', SearchQuery::sole()->period);
    }

    public function test_fails_without_config(): void
    {
        Http::fake();
        config(['seo.gsc.credentials' => null]);

        $this->artisan('gsc:sync')->assertFailed();
        Http::assertNothingSent();
    }

    public function test_fails_on_unreadable_key(): void
    {
        Http::fake();
        config(['seo.gsc.credentials' => '/nope/missing.json']);

        $this->artisan('gsc:sync')->assertFailed();
        Http::assertNothingSent();
    }
}
