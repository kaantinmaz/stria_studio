<?php

namespace App\Console\Commands;

use App\Models\SearchQuery;
use App\Models\SerpResult;
use App\Models\Service;
use App\Support\QueryCoverage;
use App\Support\SearchConsole;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Haftalık sorgu listesini Serper.dev ile Google'da (Ankara, tr) arar ve
 * sonucu serp_results'a (sorgu, dönem) çiftine göre yazar: ilk 10 organik
 * sonuç, bizim pozisyonumuz (config('seo.own_hosts')), "Diğer sorular",
 * ilgili aramalar, yanıt kutusu ve yerel sonuçlar. Aday listesi: önce TÜM
 * aktif hizmet anahtar kelimeleri, sonra en çok gösterim alan marka dışı GSC
 * sorguları; toplam --limit ile sınırlı. Bu dönem zaten çekilmiş sorgular
 * atlanır (yeniden çalıştırmak kredi harcamaz). Tek sorgunun hatası komutu
 * düşürmez.
 */
class SyncSerp extends Command
{
    protected $signature = 'serp:sync {--period= : Dönem kimliği; verilmezse SearchConsole::currentPeriod()} {--limit= : En fazla sorgu (= kredi); verilmezse seo.serper.weekly_limit}';

    protected $description = 'Hizmet anahtar kelimeleri ve en iyi GSC sorguları için Google SERP verisini Serper.dev ile serp_results tablosuna alır';

    public function handle(): int
    {
        $key = config('seo.serper.key');
        if (blank($key)) {
            $this->error('SERPER_API_KEY tanımlı değil. .env dosyasına Serper.dev API anahtarınızı ekleyin.');

            return self::FAILURE;
        }

        $period = (string) ($this->option('period') ?: SearchConsole::currentPeriod());
        $limit = (int) ($this->option('limit') ?: config('seo.serper.weekly_limit'));
        $delay = (int) config('seo.serper.delay_ms', 0) * 1000;

        $done = 0;
        $failed = 0;
        $skipped = 0;
        $credits = 0;
        $first = true;

        foreach ($this->candidates($limit) as $query) {
            if (SerpResult::where('query', $query)->where('period', $period)->exists()) {
                $skipped++;

                continue;
            }

            if (! $first && $delay > 0) {
                usleep($delay);
            }
            $first = false;

            try {
                $response = Http::withHeaders(['X-API-KEY' => $key])->timeout(20)->post('https://google.serper.dev/search', [
                    'q' => $query,
                    'gl' => config('seo.serper.gl'),
                    'hl' => config('seo.serper.hl'),
                    'location' => config('seo.serper.location'),
                    'num' => config('seo.serper.num'),
                ]);

                if (! $response->successful()) {
                    throw new \RuntimeException('HTTP '.$response->status().': '.mb_substr($response->body(), 0, 300));
                }
            } catch (\Exception $e) {
                Log::warning('serp:sync: sorgu başarısız', ['query' => $query, 'error' => $e->getMessage()]);
                $this->warn("SERP alınamadı: {$query} ({$e->getMessage()})");
                $failed++;

                continue;
            }

            $this->store($query, $period, (array) $response->json());
            $credits += (int) $response->json('credits', 0);
            $done++;
        }

        $this->info('SERP senkronu tamamlandı.');
        $this->table(
            ['Dönem', 'Alınan', 'Başarısız', 'Atlanan', 'Kredi'],
            [[$period, $done, $failed, $skipped, $credits]]
        );

        return self::SUCCESS;
    }

    /**
     * Önce tüm aktif hizmet anahtar kelimeleri (kalabalıkta kaybolmasınlar),
     * sonra en son GSC döneminin marka dışı sorguları gösterime göre. Tekrar
     * QueryCoverage::normalize ile ayıklanır, ilk görülen yazım korunur.
     *
     * @return list<string>
     */
    private function candidates(int $limit): array
    {
        $keywords = [];
        foreach (Service::active()->get() as $service) {
            foreach ((array) $service->keywords_tr as $keyword) {
                $keywords[] = (string) $keyword;
            }
        }

        $gsc = fn () => SearchQuery::query()->where(fn ($q) => $q->where('source', 'gsc')->orWhereNull('source'));
        // ponytail: tüm dönem satırları belleğe alınıyor; birkaç bin satırda sorun değil.
        $queries = $gsc()->where('period', $gsc()->max('period'))
            ->orderByDesc('impressions')
            ->pluck('query')
            ->reject(fn ($q) => str_contains(QueryCoverage::normalize((string) $q), 'stria'));

        $picked = [];
        foreach ([...$keywords, ...$queries] as $text) {
            $text = mb_substr(trim((string) preg_replace('/\s+/u', ' ', $text)), 0, 190, 'UTF-8');
            $norm = QueryCoverage::normalize($text);
            if ($norm === '' || isset($picked[$norm])) {
                continue;
            }
            $picked[$norm] = $text;
            if (count($picked) >= $limit) {
                break;
            }
        }

        return array_values($picked);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function store(string $query, string $period, array $data): void
    {
        $organic = array_values((array) ($data['organic'] ?? []));

        $ownPosition = null;
        $ownUrl = null;
        foreach ($organic as $i => $result) {
            if ($this->isOwnHost($this->host((string) ($result['link'] ?? '')))) {
                $ownPosition = (int) ($result['position'] ?? $i + 1);
                $ownUrl = mb_substr((string) $result['link'], 0, 255, 'UTF-8');
                break;
            }
        }

        SerpResult::updateOrCreate(['query' => $query, 'period' => $period], [
            'own_position' => $ownPosition,
            'own_url' => $ownUrl,
            'top_results' => array_map(fn ($r, $i) => [
                'position' => (int) ($r['position'] ?? $i + 1),
                'title' => $r['title'] ?? null,
                'link' => $r['link'] ?? null,
                'host' => $this->host((string) ($r['link'] ?? '')),
            ], array_slice($organic, 0, 10), array_keys(array_slice($organic, 0, 10))),
            'people_also_ask' => array_map(fn ($p) => [
                'question' => $p['question'] ?? null,
                'snippet' => $p['snippet'] ?? null,
                'link' => $p['link'] ?? null,
            ], array_values((array) ($data['peopleAlsoAsk'] ?? []))),
            'related_searches' => array_values(array_filter(array_map(
                fn ($r) => $r['query'] ?? null,
                (array) ($data['relatedSearches'] ?? [])
            ))),
            'answer_box' => $data['answerBox'] ?? null,
            'places' => $data['places'] ?? null,
            'credits' => isset($data['credits']) ? (int) $data['credits'] : null,
        ]);
    }

    /** Küçük harf, baştaki "www." atılmış host; ayrıştırılamazsa ''. */
    private function host(string $url): string
    {
        $host = strtolower((string) parse_url($url, PHP_URL_HOST));

        return str_starts_with($host, 'www.') ? substr($host, 4) : $host;
    }

    private function isOwnHost(string $host): bool
    {
        if ($host === '') {
            return false;
        }

        foreach ((array) config('seo.own_hosts', []) as $own) {
            if ($host === $own || str_ends_with($host, '.'.$own)) {
                return true;
            }
        }

        return false;
    }
}
