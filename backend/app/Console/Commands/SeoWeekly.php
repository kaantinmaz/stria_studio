<?php

namespace App\Console\Commands;

use App\Models\ContentRevision;
use App\Models\Post;
use App\Models\SearchQuery;
use App\Models\SerpResult;
use App\Models\Service;
use App\Support\ClaudeCli;
use App\Support\ClaudeCliException;
use App\Support\ContentGuard;
use App\Support\PromptTemplate;
use App\Support\SearchConsole;
use App\Support\SeoPlanner;
use App\Support\TelegramNotifier;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Support\Arr;
use Throwable;

/**
 * Haftalık SEO döngüsü: GSC + SERP verisini tazeler, SERP'ten yeni blog
 * konuları ekler, pozisyon kaybeden/vurucu mesafedeki yazıları content:write
 * ile tazeler, hizmet sayfalarına SSS ekler ve düşük TO'lu tek hizmetin
 * meta'sını yeniden yazdırır. Onay adımı YOK (sahibinin kararı); her otomatik
 * değişikliğin önce/sonra kopyası content_revisions'a düşer (seo:revert).
 */
class SeoWeekly extends Command
{
    protected $signature = 'seo:weekly {--dry-run : Planı hesapla ve raporu yaz; senkron, DB yazımı ve Claude çağrısı yok}';

    protected $description = 'Haftalık SEO döngüsü: veri senkronu, yeni konular, yazı tazeleme, hizmet SSS/meta güncellemesi ve rapor';

    /** Tazelenen yazının önce/sonra kopyasına giren alanlar. */
    private const POST_FIELDS = ['title_tr', 'excerpt_tr', 'body_tr', 'meta_title_tr', 'meta_desc_tr'];

    public function handle(SeoPlanner $planner, ClaudeCli $claude, ContentGuard $guard): int
    {
        $dry = (bool) $this->option('dry-run');
        $period = $planner->currentPeriod();
        $window = SearchConsole::window();

        if ($dry) {
            $this->line('Kuru çalışma: senkron, DB yazımı ve Claude çağrısı yapılmayacak.');
        } else {
            $this->sync();
        }

        $prev = $planner->previousPeriod($period);
        $this->info("Dönem: {$period} (önceki: ".($prev ?? '—').')');

        $topics = $this->topics($planner, $period, $dry);
        $refreshed = $this->refresh($planner, $period, $prev, $dry);
        $faqs = $this->serviceFaqs($planner, $claude, $guard, $period, $dry);
        $meta = $this->serviceMeta($planner, $period, $dry);

        $path = $this->writeReport($period, $prev, $window, $topics, $refreshed, $faqs, $meta, $dry);
        $this->info('Rapor: '.$path);

        $this->notify($period, $topics, $refreshed, $faqs, $meta, $dry);

        return self::SUCCESS;
    }

    /**
     * Alt senkronlar: kimlik yoksa atlanır, hata verirse uyarı olur — haftalık
     * döngü eldeki (önceki) veriyle devam eder.
     */
    private function sync(): void
    {
        $jobs = [
            'gsc:sync' => filled(config('seo.gsc.credentials')) && filled(config('seo.gsc.site_url')),
            'serp:sync' => filled(config('seo.serper.key')),
        ];

        foreach ($jobs as $command => $configured) {
            if (! $configured) {
                $this->warn($command === 'gsc:sync'
                    ? 'GSC kimliği yok, gsc:sync atlandı.'
                    : 'Serper anahtarı yok, serp:sync atlandı.');

                continue;
            }

            try {
                $code = $this->call($command);
            } catch (Throwable $e) {
                $this->warn("{$command} hata verdi: ".$e->getMessage());

                continue;
            }

            if ($code !== self::SUCCESS) {
                $this->warn("{$command} başarısız oldu (kod {$code}); eldeki veriyle devam ediliyor.");
            }
        }
    }

    /**
     * SERP konuları gösterimi 0 olan 'serp' satırları olarak eklenir; günlük
     * content:write gösterime göre sıraladığı için önce gerçek GSC sorgularını
     * tüketir, sonra bunlara geçer.
     *
     * @return list<string>
     */
    private function topics(SeoPlanner $planner, string $period, bool $dry): array
    {
        // Konular en son GSC dönemine eklenir: kendi haftalık dönemlerine
        // yazılsalar, GSC senkronu yokken/başarısızken max('period') o döneme
        // kayar ve content:write gerçek GSC sorgularını görmez olurdu.
        $queryPeriod = SearchQuery::where(fn ($q) => $q->where('source', 'gsc')->orWhereNull('source'))->max('period') ?? $period;
        $topics = $planner->topics($period, $queryPeriod);

        foreach ($topics as $topic) {
            $this->line('Yeni konu: '.$topic);

            if (! $dry) {
                SearchQuery::firstOrCreate(
                    ['query' => $topic, 'period' => $queryPeriod],
                    ['impressions' => 0, 'clicks' => 0, 'source' => 'serp'],
                );
            }
        }

        return $topics;
    }

    /**
     * Yazı tazeleme content:write'a devredilir (üretim/doğrulama mantığı
     * orada); burada yalnızca önce/sonra kopyası tutulur.
     *
     * @return list<array{slug: string, reason: string, query: string, status: string}>
     */
    private function refresh(SeoPlanner $planner, string $period, ?string $prev, bool $dry): array
    {
        $out = [];

        foreach ($planner->refreshTargets($period, $prev) as $target) {
            $post = $target['post'];
            $this->line("Tazeleme ({$target['reason']}): /blog/{$target['slug']} — {$target['query']}");

            if ($dry) {
                $out[] = [...Arr::only($target, ['slug', 'reason', 'query']), 'status' => 'plan'];

                continue;
            }

            $before = $post->only(self::POST_FIELDS);

            $code = $this->call('content:write', [
                'query' => $target['query'],
                '--slug' => $target['slug'],
                '--force' => true,
                '--period' => $period,
                '--no-alert' => true,
            ]);

            if ($code === self::SUCCESS) {
                $this->revision($post, $period, 'blog-refresh', $before, $post->fresh()->only(self::POST_FIELDS));
            } else {
                $this->warn("Tazeleme başarısız: /blog/{$target['slug']}");
            }

            $out[] = [...Arr::only($target, ['slug', 'reason', 'query']), 'status' => $code === self::SUCCESS ? 'ok' : 'başarısız'];
        }

        return $out;
    }

    /**
     * @return list<array{slug: string, questions: list<string>, added: int, note: string}>
     */
    private function serviceFaqs(SeoPlanner $planner, ClaudeCli $claude, ContentGuard $guard, string $period, bool $dry): array
    {
        $out = [];

        foreach (Service::active()->get() as $service) {
            $questions = $planner->faqCandidates($service, $period);
            if ($questions === []) {
                continue;
            }

            $this->line("SSS adayları ({$service->slug}): ".implode(' · ', $questions));

            if ($dry) {
                $out[] = ['slug' => $service->slug, 'questions' => $questions, 'added' => 0, 'note' => 'plan'];

                continue;
            }

            try {
                $faqs = $this->generateFaqs($claude, $guard, $service, $questions);
            } catch (ClaudeCliException $e) {
                $this->warn("SSS üretimi başarısız ({$service->slug}): ".$e->getMessage());
                $out[] = ['slug' => $service->slug, 'questions' => $questions, 'added' => 0, 'note' => 'Claude CLI hatası'];

                continue;
            }

            if ($faqs === null) {
                $out[] = ['slug' => $service->slug, 'questions' => $questions, 'added' => 0, 'note' => 'doğrulama geçmedi'];

                continue;
            }

            $old = (array) ($service->faq_tr ?? []);
            $room = max(0, (int) config('seo.service.faq_max') - count($old));
            $faqs = array_slice($faqs, 0, min($room, count($questions)));

            if ($faqs === []) {
                $out[] = ['slug' => $service->slug, 'questions' => $questions, 'added' => 0, 'note' => 'içerikte cevap yok'];

                continue;
            }

            $new = [...$old, ...$faqs];
            $service->faq_tr = $new;
            $service->save();

            $this->revision($service, $period, 'service-faq', ['faq_tr' => $old], ['faq_tr' => $new]);
            $this->info("SSS eklendi ({$service->slug}): ".count($faqs));

            $out[] = ['slug' => $service->slug, 'questions' => array_column($faqs, 'q'), 'added' => count($faqs), 'note' => 'ok'];
        }

        return $out;
    }

    /**
     * Doğrulanmış, cevabı boş olmayan SSS maddeleri; doğrulama tekrar
     * denemeden sonra da geçmezse null.
     *
     * @param  list<string>  $questions
     * @return list<array{q: string, a: string}>|null
     *
     * @throws ClaudeCliException
     */
    private function generateFaqs(ClaudeCli $claude, ContentGuard $guard, Service $service, array $questions): ?array
    {
        $vars = [
            'SERVICE_NAME' => (string) $service->name_tr,
            'CONTENT' => (string) json_encode([
                'desc_tr' => $service->desc_tr,
                'intro_tr' => $service->intro_tr,
                'aftercare_tr' => $service->aftercare_tr,
                'benefits_tr' => $service->benefits_tr,
                'process_tr' => $service->process_tr,
                'faq_tr' => $service->faq_tr,
            ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
            'QUESTIONS' => $this->numbered($questions),
            'FEEDBACK' => 'yok',
        ];

        for ($i = 1; $i <= 2; $i++) {
            $result = $claude->json(PromptTemplate::render('service-faq', $vars), self::faqSchema());

            // Boş cevap = "içerikte yok"; bu maddeler sessizce düşer.
            $faqs = array_values(array_filter(
                (array) ($result['faqs'] ?? []),
                fn ($x): bool => is_array($x) && trim((string) ($x['a'] ?? '')) !== '',
            ));
            $faqs = array_map(fn (array $x): array => ['q' => trim((string) ($x['q'] ?? '')), 'a' => trim((string) $x['a'])], $faqs);

            $violations = $guard->faqViolations($faqs);
            if ($violations === []) {
                return $faqs;
            }

            $vars['FEEDBACK'] = $this->numbered($violations);
            $this->warn("SSS doğrulaması başarısız ({$service->slug}):");
            foreach ($violations as $violation) {
                $this->line('  - '.$violation);
            }
        }

        return null;
    }

    /**
     * @return array{slug: string, status: string}|null
     */
    private function serviceMeta(SeoPlanner $planner, string $period, bool $dry): ?array
    {
        $service = $planner->copyTarget($period);
        if ($service === null) {
            return null;
        }

        $this->line("Meta yeniden yazımı: /hizmetler/{$service->slug}");

        if ($dry) {
            return ['slug' => $service->slug, 'status' => 'plan'];
        }

        $fields = ['seo_title_tr', 'seo_desc_tr'];
        $before = $service->only($fields);

        $code = $this->call('content:service-copy', [
            'slug' => $service->slug,
            '--apply' => true,
            '--seo-only' => true,
        ]);

        $after = $service->fresh()->only($fields);

        if ($code !== self::SUCCESS) {
            return ['slug' => $service->slug, 'status' => 'başarısız'];
        }

        if ($after === $before) {
            return ['slug' => $service->slug, 'status' => 'değişiklik yok'];
        }

        $this->revision($service, $period, 'service-meta', $before, $after);

        return ['slug' => $service->slug, 'status' => 'ok'];
    }

    /**
     * @param  list<string>  $topics
     * @param  list<array<string, mixed>>  $refreshed
     * @param  list<array<string, mixed>>  $faqs
     * @param  array<string, string>|null  $meta
     * @param  array{start: CarbonImmutable, end: CarbonImmutable}  $window
     */
    private function writeReport(string $period, ?string $prev, array $window, array $topics, array $refreshed, array $faqs, ?array $meta, bool $dry): string
    {
        $lines = [
            "# Haftalık SEO raporu — {$period}".($dry ? ' (kuru çalışma)' : ''),
            '',
            'Pencere: '.$window['start']->toDateString().' – '.$window['end']->toDateString().' · önceki dönem: '.($prev ?? '—'),
            '',
            '## Sorgu hareketleri (pozisyon, ≥10 gösterim)',
            '',
        ];

        [$up, $down] = $this->movers($period, $prev);
        $lines[] = '**Yükselenler**';
        $lines = [...$lines, ...($up === [] ? ['- —'] : $up), '', '**Düşenler**'];
        $lines = [...$lines, ...($down === [] ? ['- —'] : $down), ''];

        $lines[] = '## SERP\'te kendi pozisyonumuz (+n = yükseldi)';
        $lines[] = '';
        $lines = [...$lines, ...$this->ownPositions($period, $prev), ''];

        $lines[] = '## Eklenen yeni konular';
        $lines[] = '';
        $lines = [...$lines, ...($topics === [] ? ['- —'] : array_map(fn (string $t): string => '- '.$t, $topics)), ''];

        $lines[] = '## Tazelenen yazılar';
        $lines[] = '';
        $lines = [...$lines, ...($refreshed === [] ? ['- —'] : array_map(
            fn (array $r): string => "- /blog/{$r['slug']} ({$r['reason']}, sorgu: {$r['query']}) — {$r['status']}",
            $refreshed,
        )), ''];

        $lines[] = '## Hizmet SSS ve meta';
        $lines[] = '';
        foreach ($faqs as $f) {
            $lines[] = "- /hizmetler/{$f['slug']}: {$f['added']} SSS ({$f['note']}) — ".implode(' · ', $f['questions']);
        }
        $lines[] = $meta === null ? '- Meta: hedef yok' : "- Meta: /hizmetler/{$meta['slug']} — {$meta['status']}";
        $lines[] = '';

        $lines[] = 'Serper kredisi: '.(int) SerpResult::where('period', $period)->sum('credits');

        $dir = storage_path('app/seo-reports');
        if (! is_dir($dir)) {
            mkdir($dir, 0775, true);
        }

        $path = $dir."/{$period}.md";
        file_put_contents($path, implode("\n", $lines)."\n");

        return $path;
    }

    /**
     * @return array{0: list<string>, 1: list<string>}
     */
    private function movers(string $period, ?string $prev): array
    {
        if ($prev === null) {
            return [[], []];
        }

        $before = SearchQuery::where('period', $prev)->where('source', 'gsc')->whereNotNull('position')->get()->keyBy('query');
        $moves = [];

        foreach (SearchQuery::where('period', $period)->where('source', 'gsc')->where('impressions', '>=', 10)->whereNotNull('position')->get() as $row) {
            $old = $before->get($row->query);
            if ($old !== null) {
                $moves[] = ['query' => $row->query, 'from' => (float) $old->position, 'to' => (float) $row->position, 'delta' => (float) $old->position - (float) $row->position];
            }
        }

        $fmt = fn (array $m): string => sprintf('- %s: %.1f → %.1f (%+.1f)', $m['query'], $m['from'], $m['to'], $m['delta']);

        $up = array_filter($moves, fn (array $m): bool => $m['delta'] > 0);
        $down = array_filter($moves, fn (array $m): bool => $m['delta'] < 0);
        usort($up, fn (array $a, array $b): int => $b['delta'] <=> $a['delta']);
        usort($down, fn (array $a, array $b): int => $a['delta'] <=> $b['delta']);

        return [array_map($fmt, array_slice($up, 0, 5)), array_map($fmt, array_slice($down, 0, 5))];
    }

    /** @return list<string> */
    private function ownPositions(string $period, ?string $prev): array
    {
        $before = $prev === null ? collect() : SerpResult::where('period', $prev)->get()->keyBy('query');
        $lines = [];

        foreach (SerpResult::where('period', $period)->orderBy('query')->get() as $row) {
            $old = $before->get($row->query)?->own_position;
            $now = $row->own_position;

            $change = match (true) {
                $now !== null && $old === null => 'yeni',
                $now === null && $old !== null => 'kayıp',
                $now !== null => sprintf('%+d', $old - $now),
                default => '—',
            };

            $lines[] = sprintf('- %s: %s (%s)', $row->query, $now ?? 'yok', $change);
        }

        return $lines === [] ? ['- —'] : $lines;
    }

    /**
     * @param  list<string>  $topics
     * @param  list<array<string, mixed>>  $refreshed
     * @param  list<array<string, mixed>>  $faqs
     * @param  array<string, string>|null  $meta
     */
    private function notify(string $period, array $topics, array $refreshed, array $faqs, ?array $meta, bool $dry): void
    {
        $esc = fn (string $v): string => htmlspecialchars($v, ENT_QUOTES, 'UTF-8');
        $ok = count(array_filter($refreshed, fn (array $r): bool => $r['status'] === 'ok'));

        $summary = [
            'Yeni konu: '.count($topics),
            'Tazelenen yazı: '.$ok.'/'.count($refreshed),
            'Eklenen SSS: '.array_sum(array_column($faqs, 'added')),
            'Meta: '.($meta === null ? '—' : '/hizmetler/'.$meta['slug'].' ('.$meta['status'].')'),
        ];

        foreach ($summary as $line) {
            $this->line($line);
        }

        $text = '<b>Haftalık SEO raporu</b> '.$esc($period).($dry ? ' (kuru çalışma)' : '')."\n"
            .$esc(implode("\n", $summary));

        $result = app(TelegramNotifier::class)->send($text, 'seo:weekly');

        if ($result === TelegramNotifier::NOT_CONFIGURED) {
            $this->warn('Telegram yapılandırılmadı; rapor bildirimi gönderilmedi.');
        } elseif ($result === null) {
            $this->warn('Telegram bildirimi gönderilemedi (ayrıntı: laravel.log).');
        }
    }

    /**
     * @return array<string, mixed>
     */
    private static function faqSchema(): array
    {
        return [
            'type' => 'object',
            'additionalProperties' => false,
            'required' => ['faqs'],
            'properties' => [
                'faqs' => [
                    'type' => 'array',
                    'items' => [
                        'type' => 'object',
                        'additionalProperties' => false,
                        'required' => ['q', 'a'],
                        'properties' => [
                            'q' => ['type' => 'string'],
                            'a' => ['type' => 'string'],
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $before
     * @param  array<string, mixed>  $after
     */
    private function revision(Post|Service $model, string $period, string $reason, array $before, array $after): void
    {
        ContentRevision::create([
            'revisable_type' => $model->getMorphClass(),
            'revisable_id' => $model->getKey(),
            'period' => $period,
            'reason' => $reason,
            'before' => $before,
            'after' => $after,
        ]);
    }

    /**
     * @param  list<string>  $items
     */
    private function numbered(array $items): string
    {
        $lines = [];
        foreach (array_values($items) as $index => $item) {
            $lines[] = ($index + 1).'. '.$item;
        }

        return implode("\n", $lines);
    }
}
