<?php

namespace App\Console\Commands;

use App\Models\SearchPage;
use App\Models\SearchQuery;
use App\Support\SearchConsole;
use Illuminate\Console\Command;

/**
 * Search Console API'den son tam pencerenin (SearchConsole::window) sorgu ve
 * sayfa performansını çeker. Sorgular search_queries'e (source='gsc', en çok
 * tıklanan sayfa top_page), sayfalar search_pages'e (sorgu/sayfa, dönem)
 * çiftine göre updateOrCreate edilir; yeniden çalıştırmak güvenlidir.
 */
class SyncSearchConsole extends Command
{
    protected $signature = 'gsc:sync {--period= : Dönem kimliği; verilmezse pencere bitişinin ISO haftası (ör. 2026W42)}';

    protected $description = 'Google Search Console sorgu/sayfa verisini API ile search_queries ve search_pages tablolarına senkronlar';

    public function handle(SearchConsole $console): int
    {
        if (blank(config('seo.gsc.credentials')) || blank(config('seo.gsc.site_url'))) {
            $this->error('GSC_CREDENTIALS veya GSC_SITE_URL tanımlı değil. .env dosyasına servis hesabı anahtar yolunu ve mülk kimliğini ekleyin.');

            return self::FAILURE;
        }

        ['start' => $start, 'end' => $end] = SearchConsole::window();
        $period = (string) ($this->option('period') ?: SearchConsole::periodFor($end));

        try {
            $queryRows = $console->query($start, $end, ['query']);
            $queryPageRows = $console->query($start, $end, ['query', 'page']);
            $pageRows = $console->query($start, $end, ['page']);
        } catch (\Exception $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }

        // Sorgu başına en çok tıklanan sayfa (eşitlikte gösterim).
        $topPages = [];
        foreach ($queryPageRows as $row) {
            $query = $this->normalizeQuery((string) ($row['keys'][0] ?? ''));
            $best = $topPages[$query] ?? null;
            if ($best === null
                || $row['clicks'] > $best['clicks']
                || ($row['clicks'] == $best['clicks'] && $row['impressions'] > $best['impressions'])) {
                $topPages[$query] = $row;
            }
        }

        $queries = 0;
        foreach ($queryRows as $row) {
            $query = $this->normalizeQuery((string) ($row['keys'][0] ?? ''));
            if ($query === '') {
                continue;
            }

            $topPage = $topPages[$query]['keys'][1] ?? null;

            SearchQuery::updateOrCreate(['query' => $query, 'period' => $period], [
                'clicks' => (int) $row['clicks'],
                'impressions' => (int) $row['impressions'],
                'ctr' => $row['ctr'] ?? null,
                'position' => $row['position'] ?? null,
                'source' => 'gsc',
                'top_page' => $topPage === null ? null : mb_substr((string) $topPage, 0, 255, 'UTF-8'),
            ]);
            $queries++;
        }

        $pages = 0;
        foreach ($pageRows as $row) {
            $page = mb_substr((string) ($row['keys'][0] ?? ''), 0, 255, 'UTF-8');
            if ($page === '') {
                continue;
            }

            SearchPage::updateOrCreate(['page' => $page, 'period' => $period], [
                'clicks' => (int) $row['clicks'],
                'impressions' => (int) $row['impressions'],
                'ctr' => $row['ctr'] ?? null,
                'position' => $row['position'] ?? null,
            ]);
            $pages++;
        }

        $this->info('Search Console senkronu tamamlandı.');
        $this->table(
            ['Dönem', 'Pencere', 'Sorgu satırı', 'Sayfa satırı'],
            [[$period, $start->format('Y-m-d').' → '.$end->format('Y-m-d'), $queries, $pages]]
        );

        return self::SUCCESS;
    }

    /**
     * ImportSearchQueries::normalizeQuery ile aynı: iç boşlukları teker
     * boşluğa indirger, kırpar, 190 karakterle sınırlar.
     */
    private function normalizeQuery(string $query): string
    {
        $collapsed = trim((string) preg_replace('/\s+/u', ' ', $query));

        return mb_substr($collapsed, 0, 190, 'UTF-8');
    }
}
