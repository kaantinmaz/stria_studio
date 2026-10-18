<?php

namespace App\Support;

use App\Models\ContentRevision;
use App\Models\Post;
use App\Models\SearchPage;
use App\Models\SearchQuery;
use App\Models\SerpResult;
use App\Models\Service;
use Illuminate\Support\Collection;

/**
 * seo:weekly'nin seçim mantığı: hangi SERP konusu eklenir, hangi yazı
 * tazelenir, hangi hizmete SSS eklenir ve hangisinin meta'sı yeniden yazılır.
 * Yalnızca okur; hiçbir şey yazmaz (komut uygular, testler doğrudan çağırır).
 */
final class SeoPlanner
{
    /** Marka/gezinme işaretleri (normalize edilmiş, kelime sınırlı). */
    private const NAVIGATION = ['stria', 'instagram', 'adres', 'telefon', 'iletisim', 'yol tarifi', 'nerede', 'com', 'www'];

    /**
     * Türkçe-dışı (İngilizce) soru işaretleri. SERP tr/tr çekilse de PAA
     * kutusuna İngilizce sorular düşebiliyor; bunlar Türkçe yazı/SSS olmaz.
     */
    private const ENGLISH = ['the', 'how', 'what', 'does', 'is', 'are', 'of', 'for', 'and', 'to', 'with', 'can', 'you', 'your', 'much', 'long', 'do'];

    /** Aynı içeriğe otomatik dokunuşlar arası en kısa aralık (gün). */
    private const COOLDOWN_DAYS = 28;

    public function __construct(private QueryCoverage $coverage) {}

    public function currentPeriod(): string
    {
        return SearchConsole::currentPeriod();
    }

    /**
     * $period'dan önceki en yeni haftalık dönem (eski "YYYY-MM" CSV dönemleri hariç).
     */
    public function previousPeriod(string $period): ?string
    {
        $max = null;

        foreach ([SearchQuery::class, SearchPage::class, SerpResult::class] as $model) {
            $candidate = $model::where('period', 'like', '____W__')->where('period', '<', $period)->max('period');
            if ($candidate !== null && ($max === null || $candidate > $max)) {
                $max = $candidate;
            }
        }

        return $max;
    }

    /**
     * SERP'teki "Diğer sorular" ve "İlgili aramalar"dan yeni blog konuları.
     * $queryPeriod: konuların ekleneceği search_queries dönemi (tekrar kontrolü).
     *
     * @return list<string>
     */
    public function topics(string $period, ?string $queryPeriod = null): array
    {
        $queryPeriod ??= $period;
        $rows = SerpResult::where('period', $period)->orderBy('id')->get();

        $raw = [];
        foreach ($rows as $row) {
            foreach ((array) $row->people_also_ask as $item) {
                $raw[] = is_array($item) ? (string) ($item['question'] ?? '') : (string) $item;
            }
        }
        foreach ($rows as $row) {
            foreach ((array) $row->related_searches as $item) {
                $raw[] = is_array($item) ? (string) ($item['query'] ?? '') : (string) $item;
            }
        }

        $seen = SearchQuery::where('period', $queryPeriod)->pluck('query')
            ->mapWithKeys(fn (string $q): array => [QueryCoverage::normalize($q) => true])
            ->all();

        $limit = (int) config('seo.topics_per_week');
        $out = [];

        foreach ($raw as $text) {
            if (count($out) >= $limit) {
                break;
            }

            $text = trim(preg_replace('/\s+/u', ' ', $text) ?? '');
            $norm = QueryCoverage::normalize($text);
            $words = count(explode(' ', $text));
            $len = mb_strlen($text);

            if ($len < 10 || $len > 120 || $words < 2 || $words > 12 || $norm === '' || isset($seen[$norm])) {
                continue;
            }

            if ($this->isNavigational($norm) || ! $this->isTurkish($norm)) {
                continue;
            }

            if ($this->coverage->classify($text)['status'] !== 'new' || $this->coverage->sameIntentPosts($text) !== []) {
                continue;
            }

            $seen[$norm] = true;
            $out[] = mb_substr($text, 0, 190);
        }

        return $out;
    }

    /**
     * Pozisyon kaybeden ya da "vurucu mesafede" duran ana site blog yazıları.
     *
     * @return list<array{post: Post, slug: string, reason: string, query: string}>
     */
    public function refreshTargets(string $period, ?string $prev): array
    {
        $cfg = config('seo.refresh');
        $prevPages = $prev === null ? collect() : SearchPage::where('period', $prev)->get()->keyBy('page');

        $drops = [];
        $striking = [];

        foreach (SearchPage::where('period', $period)->get() as $page) {
            $slug = $this->slugFor($page->page, '/blog/');
            if ($slug === null || $page->position === null) {
                continue;
            }

            $post = Post::published()->whereNull('site')->where('slug', $slug)->first();
            if ($post === null || $this->recentlyRevised($post, 'blog-refresh')) {
                continue;
            }

            $position = (float) $page->position;
            $before = $prevPages->get($page->page);
            $delta = $before?->position !== null ? $position - (float) $before->position : null;

            if ($delta !== null && $delta >= (float) $cfg['position_drop']) {
                $drops[] = ['post' => $post, 'slug' => $slug, 'reason' => 'drop', 'sort' => $delta];
            } elseif ($position >= (float) $cfg['striking_min'] && $position <= (float) $cfg['striking_max']
                && $page->impressions >= (int) $cfg['min_impressions']) {
                $striking[] = ['post' => $post, 'slug' => $slug, 'reason' => 'striking', 'sort' => $page->impressions];
            }
        }

        usort($drops, fn (array $a, array $b): int => $b['sort'] <=> $a['sort']);
        usort($striking, fn (array $a, array $b): int => $b['sort'] <=> $a['sort']);

        $queries = SearchQuery::where('period', $period)->whereNotNull('top_page')->opportunity()->get();

        return array_map(function (array $t) use ($queries): array {
            $row = $queries->first(fn (SearchQuery $q): bool => $this->path((string) $q->top_page) === '/blog/'.$t['slug']);

            return [
                'post' => $t['post'],
                'slug' => $t['slug'],
                'reason' => $t['reason'],
                'query' => $row?->query ?? (string) $t['post']->title_tr,
            ];
        }, array_slice([...$drops, ...$striking], 0, (int) $cfg['max_per_week']));
    }

    /**
     * Hizmetin anahtar kelimeleri için SERP'te çıkan, sayfada henüz cevabı
     * olmayan sorular.
     *
     * @return list<string>
     */
    public function faqCandidates(Service $service, string $period): array
    {
        $existing = (array) ($service->faq_tr ?? []);
        $limit = max(0, min(
            (int) config('seo.service.faq_new_per_week'),
            (int) config('seo.service.faq_max') - count($existing),
        ));

        if ($limit === 0) {
            return [];
        }

        $keywords = array_map(fn ($k): string => QueryCoverage::normalize((string) $k), (array) ($service->keywords_tr ?? []));
        $serviceUrl = '/hizmetler/'.$service->slug;
        $normName = QueryCoverage::normalize((string) $service->name_tr);

        // Mevcut SSS soruları + kabul edilenler: bulanık tekrar kontrolü bunlara karşı.
        $known = array_map(fn ($x): string => QueryCoverage::normalize(is_array($x) ? (string) ($x['q'] ?? '') : ''), $existing);
        $out = [];

        foreach (SerpResult::where('period', $period)->orderBy('id')->get() as $row) {
            if (! in_array(QueryCoverage::normalize($row->query), $keywords, true)) {
                continue;
            }

            foreach ((array) $row->people_also_ask as $item) {
                if (count($out) >= $limit) {
                    return $out;
                }

                $question = trim(preg_replace('/\s+/u', ' ', is_array($item) ? (string) ($item['question'] ?? '') : (string) $item) ?? '');
                $norm = QueryCoverage::normalize($question);
                $len = mb_strlen($question);

                if ($len < 10 || $len > 160 || $norm === '' || ! $this->isTurkish($norm)) {
                    continue;
                }

                // Prices are never published on the site (ContentGuard bans "tl"), and each service
                // page already answers "fiyatı ne kadar?" — a price PAA can only fail validation.
                if (preg_match('/\b(fiyat\w*|ucret\w*|tl|lira|kaca|indirim\w*|kampanya\w*)\b/', $norm)) {
                    continue;
                }

                // RewriteServiceCopy::queries ile aynı eşleme kuralı.
                $maps = $this->coverage->classify($question)['target'] === $serviceUrl
                    || ($normName !== '' && str_contains($norm, $normName));
                if (! $maps) {
                    continue;
                }

                // "ne kadar sürer / kalır / kalıcı / gider" are one question; compare on a folded form.
                $folded = preg_replace('/\b(surer|kalir|kalici|kalicidir|gider|dayanir|etkisi)\b/', 'sure', $norm);
                foreach ($known as $k) {
                    similar_text($folded, preg_replace('/\b(surer|kalir|kalici|kalicidir|gider|dayanir|etkisi)\b/', 'sure', $k), $percent);
                    if ($percent >= 80) {
                        continue 2;
                    }
                }

                $known[] = $norm;
                $out[] = $question;
            }
        }

        return $out;
    }

    /**
     * Vurucu mesafede ama tıklanma oranı düşük, gösterimi en yüksek TEK hizmet.
     */
    public function copyTarget(string $period): ?Service
    {
        $cfg = config('seo.service');
        $pages = $this->mainHostPages($period);
        $best = null;
        $bestImpressions = -1;

        foreach (Service::active()->get() as $service) {
            $page = $pages->get('/hizmetler/'.$service->slug);
            if ($page === null || $page->position === null || $page->ctr === null) {
                continue;
            }

            $position = (float) $page->position;
            if ($position < (float) $cfg['striking_min'] || $position > (float) $cfg['striking_max']
                || $page->impressions < (int) $cfg['min_impressions'] || (float) $page->ctr >= (float) $cfg['ctr_below']) {
                continue;
            }

            if ($page->impressions > $bestImpressions && ! $this->recentlyRevised($service, 'service-meta')) {
                $best = $service;
                $bestImpressions = $page->impressions;
            }
        }

        return $best;
    }

    /** @return Collection<string, SearchPage> path => satır (yalnızca ana site) */
    private function mainHostPages(string $period): Collection
    {
        return SearchPage::where('period', $period)->get()
            ->filter(fn (SearchPage $p): bool => $this->isMainHost($p->page))
            ->keyBy(fn (SearchPage $p): string => $this->path($p->page));
    }

    /** Ana site URL'si $prefix{slug} biçimindeyse slug, değilse null. */
    private function slugFor(string $url, string $prefix): ?string
    {
        if (! $this->isMainHost($url)) {
            return null;
        }

        return preg_match('#^'.preg_quote($prefix, '#').'([a-z0-9-]+)$#', $this->path($url), $m) ? $m[1] : null;
    }

    private function isMainHost(string $url): bool
    {
        $host = preg_replace('/^www\./', '', strtolower((string) parse_url($url, PHP_URL_HOST)));

        return $host === strtolower((string) config('services.indexnow.host'));
    }

    private function path(string $url): string
    {
        $path = rtrim((string) parse_url($url, PHP_URL_PATH), '/');

        return $path === '' ? '/' : $path;
    }

    private function recentlyRevised(Post|Service $model, string $reason): bool
    {
        return ContentRevision::where('revisable_type', $model->getMorphClass())
            ->where('revisable_id', $model->getKey())
            ->where('reason', $reason)
            ->where('created_at', '>=', now()->subDays(self::COOLDOWN_DAYS))
            ->exists();
    }

    private function isNavigational(string $norm): bool
    {
        $padded = ' '.$norm.' ';
        foreach (self::NAVIGATION as $needle) {
            if (str_contains($padded, ' '.$needle.' ')) {
                return true;
            }
        }

        return false;
    }

    private function isTurkish(string $norm): bool
    {
        return array_intersect(explode(' ', $norm), self::ENGLISH) === [];
    }
}
