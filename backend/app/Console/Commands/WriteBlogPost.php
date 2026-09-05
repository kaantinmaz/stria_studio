<?php

namespace App\Console\Commands;

use App\Models\Post;
use App\Models\SearchQuery;
use App\Support\ClaudeCli;
use App\Support\ClaudeCliException;
use App\Support\ContentGuard;
use App\Support\ContentInventory;
use App\Support\PostWriter;
use App\Support\PromptTemplate;
use App\Support\QueryCoverage;
use Illuminate\Console\Command;

/**
 * GSC sorgusundan yayına hazır bir Türkçe blog yazısı üretir. Metin Claude
 * Code CLI (abonelik/OAuth kimliği, API anahtarı YOK) ile üretilir; iç linkler
 * canlı envantere karşı doğrulanır. Doğrulama geçmeden hiçbir şey yazılmaz.
 * Yazı varsayılan olarak anında yayımlanır (--draft ile taslak kalır).
 */
class WriteBlogPost extends Command
{
    protected $signature = 'content:write {query? : Hedef sorgu (verilmezse en yüksek gösterimli "yeni" sorgu seçilir)}
        {--period= : GSC dönemi (YYYY-MM); varsayılan en yeni dönem}
        {--slug= : Üretilen içeriği bu slug ile yaz (mevcut zayıf yazıyı yerinde tazeler)}
        {--force : Aynı niyeti taşıyan mevcut yazı olsa da üret}
        {--dry-run : Hiçbir şey yazma; üretilen yazıyı ekrana bas}
        {--draft : is_published=false olarak kaydet (IndexNow ping atılmaz)}
        {--retries=2 : Doğrulama başarısız olursa yeniden deneme sayısı}';

    protected $description = 'GSC sorgusundan Claude CLI ile doğrulanmış, iç linklerle örülü Türkçe blog yazısı üretir';

    public function handle(
        ClaudeCli $claude,
        ContentInventory $inventory,
        ContentGuard $guard,
        QueryCoverage $coverage,
        PostWriter $writer
    ): int {
        $period = $this->option('period') ?: SearchQuery::max('period');

        $query = $this->argument('query');
        $targetRow = null;

        if ($query !== null) {
            if ($period !== null) {
                $targetRow = SearchQuery::where('query', $query)->where('period', $period)->first();
            }
        } else {
            if ($period === null) {
                $this->error('İçe aktarılmış sorgu yok. Önce "php artisan gsc:import" çalıştırın.');

                return self::FAILURE;
            }

            foreach (SearchQuery::where('period', $period)->opportunity()->get() as $row) {
                if ($coverage->classify($row->query)['status'] === 'new') {
                    $targetRow = $row;
                    $query = $row->query;
                    break;
                }
            }

            if ($query === null) {
                $this->error("'{$period}' döneminde yazılacak yeni (kapsanmamış) sorgu bulunamadı.");

                return self::FAILURE;
            }
        }

        $this->info("Hedef sorgu: {$query}");

        // Yamyamlık (cannibalization) önlemi: aynı anlamlı token kümesini
        // başlığında taşıyan yayınlanmış bir yazı varsa yeni sayfa açmak yerine
        // onu tazelemek gerekir. --slug ile hedef verildiyse zaten tazeliyoruz.
        $forcedSlug = $this->option('slug') ?: null;
        if ($forcedSlug === null && ! $this->option('force')) {
            $rivals = $coverage->sameIntentPosts($query);
            if ($rivals !== []) {
                $this->error('Bu sorgunun niyetini zaten karşılayan yazı(lar) var:');
                foreach ($rivals as $rival) {
                    $this->line("  - {$rival['url']} — {$rival['title']}");
                }
                $this->line('');
                $this->line('Mevcut yazıyı tazelemek için (önerilen):');
                $this->line('  php artisan content:write "'.$query.'" --slug='.basename($rivals[0]['url']));
                $this->line('Yine de yeni sayfa açmak için: --force');

                return self::FAILURE;
            }
        }

        $queryStats = $targetRow !== null
            ? sprintf(
                '%d gösterim, %d tıklama, pozisyon %s',
                $targetRow->impressions,
                $targetRow->clicks,
                $targetRow->position !== null ? number_format((float) $targetRow->position, 1) : '—'
            )
            : 'veri yok';

        $vars = [
            'QUERY' => $query,
            'QUERY_STATS' => $queryStats,
            'RELATED_QUERIES' => $this->relatedQueries($query, $period, $coverage),
            'INVENTORY' => $inventory->promptMarkdown(),
            'RULES' => $this->rules().($forcedSlug !== null
                ? "\n- Bu yazının kendi URL'si /blog/{$forcedSlug}; kendine link VERME."
                : ''),
            'FEEDBACK' => 'yok',
        ];

        $attempts = max(0, (int) $this->option('retries')) + 1;
        $allowSlug = $forcedSlug;
        $post = null;
        $violations = [];

        try {
            for ($i = 1; $i <= $attempts; $i++) {
                $this->line("Üretim denemesi {$i}/{$attempts}...");
                $prompt = PromptTemplate::render('blog-post', $vars);
                $post = $claude->json($prompt, ContentGuard::postSchema());

                // --slug ile hedef verildiyse modelin ürettiği slug yok sayılır;
                // doğrulama (tekillik, kendine link) gerçek slug'la yapılmalı.
                if ($forcedSlug !== null) {
                    $post['slug'] = $forcedSlug;
                }

                $violations = $guard->postViolations($post, $allowSlug);
                if ($violations === []) {
                    break;
                }

                $allowSlug = $forcedSlug ?? ($post['slug'] ?? null);
                $vars['FEEDBACK'] = $this->numbered($violations);
                $this->warn('Doğrulama başarısız, düzeltme isteniyor:');
                foreach ($violations as $violation) {
                    $this->line('  - '.$violation);
                }
            }
        } catch (ClaudeCliException $exception) {
            $this->error('Claude CLI üretimi başarısız: '.$exception->getMessage());

            return self::FAILURE;
        }

        if ($violations !== [] || $post === null) {
            $this->error('Doğrulama tüm denemelerden sonra geçmedi. Yazı yazılmadı. İhlaller:');
            foreach ($violations as $violation) {
                $this->line('  - '.$violation);
            }

            return self::FAILURE;
        }

        if ($this->option('dry-run')) {
            $this->preview($post);

            return self::SUCCESS;
        }

        $published = ! $this->option('draft');
        $slug = $forcedSlug ?? $post['slug'];

        // Mevcut bir yazı tazeleniyorsa ilk yayın tarihi korunur; tazelik
        // sinyalini updated_at taşır.
        $existing = Post::whereNull('site')->where('slug', $slug)->first();

        $saved = $writer->upsert([
            'site' => null,
            'slug' => $slug,
            'title_tr' => $post['title_tr'],
            'excerpt_tr' => $post['excerpt_tr'] ?? '',
            'body_tr' => $post['body_tr'],
            'meta_title_tr' => $post['meta_title_tr'] ?? null,
            'meta_desc_tr' => $post['meta_desc_tr'] ?? null,
            'category' => $post['category'] ?? null,
            'tags' => $post['tags'] ?? [],
            'is_published' => $published,
            'published_at' => $existing?->published_at ?? now(),
        ]);

        if ($existing !== null) {
            $this->line("Mevcut yazı tazelendi (ilk yayın: {$existing->published_at}).");
        }

        $this->info("Yazı kaydedildi: /blog/{$saved->slug}");
        if (! $published) {
            $this->line('IndexNow: ping gönderilmedi (taslak).');
        } elseif (config('services.indexnow.key')) {
            $this->line('IndexNow: ping gönderildi (ana site, yayında).');
        } else {
            $this->line('IndexNow: atlandı — INDEXNOW_KEY tanımlı değil.');
        }
        $this->line('Not: Next.js ISR penceresi 300 sn; değişiklik en geç 5 dakika içinde canlıda görünür.');

        return self::SUCCESS;
    }

    private function relatedQueries(string $query, ?string $period, QueryCoverage $coverage): string
    {
        if ($period === null) {
            return 'yok';
        }

        $targetTokens = $this->significantTokens($query);
        if ($targetTokens === []) {
            return 'yok';
        }

        $lines = SearchQuery::where('period', $period)
            ->where('query', '!=', $query)
            ->opportunity()
            ->get()
            ->filter(fn (SearchQuery $row): bool => array_intersect($targetTokens, $this->significantTokens($row->query)) !== [])
            ->take(8)
            ->map(fn (SearchQuery $row): string => sprintf('- %s (%d gösterim, %d tıklama)', $row->query, $row->impressions, $row->clicks))
            ->all();

        return $lines === [] ? 'yok' : implode("\n", $lines);
    }

    /** @return list<string> */
    private function significantTokens(string $text): array
    {
        $tokens = preg_split('/\s+/', QueryCoverage::normalize($text), -1, PREG_SPLIT_NO_EMPTY) ?: [];

        return array_values(array_unique(array_filter($tokens, static fn (string $token): bool => mb_strlen($token) >= 3)));
    }

    private function rules(): string
    {
        $cfg = config('content.post');

        return implode("\n", [
            // Model alt sınıra yaklaşıp altında kalıyordu; net bir hedef aralık
            // veriliyor ve sert sınır ayrıca hatırlatılıyor.
            sprintf(
                '- Gövde uzunluğu: HEDEF %d-%d kelime. %d kelimenin ALTI ve %d kelimenin ÜSTÜ reddedilir; kısa kalırsan yazı yayımlanmaz.',
                min($cfg['min_words'] + 200, $cfg['max_words']),
                min($cfg['min_words'] + 500, $cfg['max_words']),
                $cfg['min_words'],
                $cfg['max_words']
            ),
            sprintf('- En az %d adet <h2> alt başlık.', $cfg['min_h2']),
            // Kelime hedefi tek başına yetmiyor (model 650 civarında kalıyor);
            // uzunluk yapısal zorunluluklarla garanti altına alınır.
            '- Her <h2> bölümünde en az 2 paragraf; en az bir bölümde <ul> listesi.',
            '- "Sık Sorulan Sorular (SSS)" bölümünde en az 5 <h3> soru + <p> cevap çifti.',
            sprintf('- En az %d hizmet sayfası linki ve %d blog yazısı linki (yalnızca envanterdeki iç URL\'ler).', $cfg['min_service_links'], $cfg['min_post_links']),
            sprintf('- Meta başlık en fazla %d karakter.', $cfg['meta_title_max']),
            sprintf('- Meta açıklama %d-%d karakter.', $cfg['meta_desc_min'], $cfg['meta_desc_max']),
            sprintf('- Özet en fazla %d karakter.', $cfg['excerpt_max']),
            '- İzinli HTML etiketleri: '.implode(', ', $cfg['allowed_tags']).'.',
        ]);
    }

    /**
     * @param  array<string, mixed>  $post
     */
    private function preview(array $post): void
    {
        $body = (string) ($post['body_tr'] ?? '');
        $words = count(preg_split('/\s+/', trim(strip_tags($body)), -1, PREG_SPLIT_NO_EMPTY) ?: []);

        $this->newLine();
        $this->line('=== KURU ÇALIŞMA (yazılmadı) ===');
        $this->line('Slug        : '.($post['slug'] ?? ''));
        $this->line('Başlık      : '.($post['title_tr'] ?? ''));
        $this->line('Meta başlık : '.($post['meta_title_tr'] ?? ''));
        $this->line('Meta açıkl. : '.($post['meta_desc_tr'] ?? ''));
        $this->line('Özet        : '.($post['excerpt_tr'] ?? ''));
        $this->line('Kategori    : '.($post['category'] ?? ''));
        $this->line('Etiketler   : '.implode(', ', $post['tags'] ?? []));
        $this->line('Kelime      : '.$words);

        $links = $this->internalLinks($body);
        $this->line('İç linkler:');
        $this->line('  Hizmet : '.($links['hizmet'] === [] ? '—' : implode(', ', $links['hizmet'])));
        $this->line('  Blog   : '.($links['blog'] === [] ? '—' : implode(', ', $links['blog'])));
        $this->line('  Diğer  : '.($links['diğer'] === [] ? '—' : implode(', ', $links['diğer'])));

        $this->newLine();
        $this->line('=== GÖVDE (body_tr) ===');
        $this->line($body);
    }

    /**
     * @return array{hizmet: list<string>, blog: list<string>, diğer: list<string>}
     */
    private function internalLinks(string $html): array
    {
        preg_match_all('/href="([^"]+)"/i', $html, $matches);

        $links = ['hizmet' => [], 'blog' => [], 'diğer' => []];
        foreach ($matches[1] as $href) {
            if (str_starts_with($href, '/hizmetler/')) {
                $links['hizmet'][] = $href;
            } elseif (str_starts_with($href, '/blog/')) {
                $links['blog'][] = $href;
            } elseif (str_starts_with($href, '/')) {
                $links['diğer'][] = $href;
            }
        }

        return $links;
    }

    /**
     * @param  list<string>  $violations
     */
    private function numbered(array $violations): string
    {
        $lines = [];
        foreach (array_values($violations) as $index => $violation) {
            $lines[] = ($index + 1).'. '.$violation;
        }

        return implode("\n", $lines);
    }
}
