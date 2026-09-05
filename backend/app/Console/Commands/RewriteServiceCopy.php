<?php

namespace App\Console\Commands;

use App\Models\SearchQuery;
use App\Models\Service;
use App\Support\ClaudeCli;
use App\Support\ClaudeCliException;
use App\Support\ContentGuard;
use App\Support\ContentInventory;
use App\Support\PromptTemplate;
use App\Support\QueryCoverage;
use Illuminate\Console\Command;

/**
 * Bir hizmet sayfasının Türkçe kopyası için Claude Code CLI (abonelik kimliği,
 * API anahtarı YOK) ile yeni metin önerir. Varsayılan davranış ÖNERİdir:
 * alan alan fark basılır, hiçbir şey yazılmaz. Yalnızca --apply ile değişen
 * alanlar DB'ye kaydedilir. _en alanlarına ve yapısal alanlara dokunulmaz.
 */
class RewriteServiceCopy extends Command
{
    protected $signature = 'content:service-copy {slug : Hizmet slug\'ı}
        {--apply : Değişen alanları veritabanına yaz (varsayılan: yalnızca öneri)}
        {--retries=2 : Doğrulama başarısız olursa yeniden deneme sayısı}';

    protected $description = 'Bir hizmet sayfasının Türkçe kopyası için Claude CLI ile doğrulanmış yeni metin önerir (--apply ile yazar)';

    /** Öneri/yazma kapsamındaki TR alanları (yapısal ve _en alanları hariç). */
    private const FIELDS = [
        'desc_tr', 'intro_tr', 'aftercare_tr',
        'benefits_tr', 'process_tr', 'faq_tr', 'keywords_tr',
        'seo_title_tr', 'seo_desc_tr',
    ];

    public function handle(
        ClaudeCli $claude,
        ContentInventory $inventory,
        ContentGuard $guard,
        QueryCoverage $coverage
    ): int {
        $slug = (string) $this->argument('slug');

        $service = Service::where('slug', $slug)->first();
        if ($service === null) {
            $this->error("'{$slug}' slug'lı hizmet bulunamadı.");

            return self::FAILURE;
        }

        $current = json_encode([
            'desc_tr' => $service->desc_tr,
            'intro_tr' => $service->intro_tr,
            'aftercare_tr' => $service->aftercare_tr,
            'benefits_tr' => $service->benefits_tr,
            'process_tr' => $service->process_tr,
            'faq_tr' => $service->faq_tr,
            'keywords_tr' => $service->keywords_tr,
            'seo_title_tr' => $service->seo_title_tr,
            'seo_desc_tr' => $service->seo_desc_tr,
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        $vars = [
            'SERVICE_NAME' => $service->name_tr,
            'SERVICE_SLUG' => $service->slug,
            'CURRENT' => (string) $current,
            'QUERIES' => $this->queries($service, $coverage),
            'INVENTORY' => $inventory->promptMarkdown(),
            'RULES' => $this->rules(),
            'FEEDBACK' => 'yok',
        ];

        $attempts = max(0, (int) $this->option('retries')) + 1;
        $copy = null;
        $violations = [];

        try {
            for ($i = 1; $i <= $attempts; $i++) {
                $this->line("Üretim denemesi {$i}/{$attempts}...");
                $prompt = PromptTemplate::render('service-copy', $vars);
                $copy = $claude->json($prompt, ContentGuard::serviceCopySchema());

                $violations = $guard->serviceCopyViolations($copy);
                if ($violations === []) {
                    break;
                }

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

        if ($violations !== [] || $copy === null) {
            $this->error('Doğrulama tüm denemelerden sonra geçmedi. Kopya önerilmedi. İhlaller:');
            foreach ($violations as $violation) {
                $this->line('  - '.$violation);
            }

            return self::FAILURE;
        }

        [$changed, $unchanged] = $this->diff($service, $copy);

        if ($changed === []) {
            $this->info('Öneri mevcut kopyayla aynı; değişiklik yok.');

            return self::SUCCESS;
        }

        if ($unchanged !== []) {
            $this->newLine();
            $this->line('Değişmeyen alanlar: '.implode(', ', $unchanged));
        }

        if (! $this->option('apply')) {
            $this->newLine();
            $this->line("Uygulamak için: php artisan content:service-copy {$slug} --apply");

            return self::SUCCESS;
        }

        foreach ($changed as $field => $value) {
            $service->{$field} = $value;
        }
        $service->save();

        $this->newLine();
        $this->info('Yazılan alanlar: '.implode(', ', array_keys($changed)));
        $this->line("Not: /hizmetler/{$slug} 300 sn ISR penceresi içinde güncellenir.");

        return self::SUCCESS;
    }

    /**
     * Değişen alanları (yeni tiplenmiş değerleriyle) hesaplar ve farkı basar.
     *
     * @param  array<string, mixed>  $copy
     * @return array{0: array<string, mixed>, 1: list<string>}
     */
    private function diff(Service $service, array $copy): array
    {
        $changed = [];
        $unchanged = [];

        foreach (self::FIELDS as $field) {
            if ($field === 'faq_tr') {
                $oldItems = array_map(
                    static fn (array $x): string => trim(($x['q'] ?? '').' — '.($x['a'] ?? '')),
                    $service->faq_tr ?? []
                );
                $newRaw = $copy['faq_tr'] ?? [];
                $newItems = array_map(
                    static fn (array $x): string => trim(($x['q'] ?? '').' — '.($x['a'] ?? '')),
                    $newRaw
                );

                if ($oldItems !== $newItems) {
                    $changed[$field] = $newRaw;
                    $this->printArrayDiff($field, $oldItems, $newItems);
                } else {
                    $unchanged[] = $field;
                }

                continue;
            }

            if (in_array($field, ['benefits_tr', 'process_tr', 'keywords_tr'], true)) {
                $old = array_values(array_map('strval', $service->{$field} ?? []));
                $new = array_values(array_map('strval', $copy[$field] ?? []));

                if ($old !== $new) {
                    $changed[$field] = $new;
                    $this->printArrayDiff($field, $old, $new);
                } else {
                    $unchanged[] = $field;
                }

                continue;
            }

            $old = (string) ($service->{$field} ?? '');
            $new = (string) ($copy[$field] ?? '');

            if ($old !== $new) {
                $changed[$field] = $new;
                $this->printScalarDiff($field, $old, $new);
            } else {
                $unchanged[] = $field;
            }
        }

        return [$changed, $unchanged];
    }

    private function printScalarDiff(string $field, string $old, string $new): void
    {
        $this->newLine();
        $this->line("~ {$field}:");
        foreach ($this->wrap($old) as $line) {
            $this->line('- '.$line);
        }
        foreach ($this->wrap($new) as $line) {
            $this->line('+ '.$line);
        }
    }

    /**
     * @param  list<string>  $old
     * @param  list<string>  $new
     */
    private function printArrayDiff(string $field, array $old, array $new): void
    {
        $this->newLine();
        $this->line("~ {$field}:");
        foreach (array_diff($old, $new) as $item) {
            $this->line('- '.$item);
        }
        foreach (array_diff($new, $old) as $item) {
            $this->line('+ '.$item);
        }
    }

    /**
     * @return list<string>
     */
    private function wrap(string $text): array
    {
        if (trim($text) === '') {
            return ['(boş)'];
        }

        return explode("\n", wordwrap($text, 76, "\n", true));
    }

    private function queries(Service $service, QueryCoverage $coverage): string
    {
        $period = SearchQuery::max('period');
        if ($period === null) {
            return 'yok';
        }

        $serviceUrl = '/hizmetler/'.$service->slug;
        $normName = QueryCoverage::normalize($service->name_tr);

        $lines = SearchQuery::where('period', $period)
            ->opportunity()
            ->get()
            ->filter(function (SearchQuery $row) use ($coverage, $serviceUrl, $normName): bool {
                if ($coverage->classify($row->query)['target'] === $serviceUrl) {
                    return true;
                }

                return $normName !== '' && str_contains(QueryCoverage::normalize($row->query), $normName);
            })
            ->take(12)
            ->map(fn (SearchQuery $row): string => sprintf('- %s (%d gösterim, %d tıklama)', $row->query, $row->impressions, $row->clicks))
            ->all();

        return $lines === [] ? 'yok' : implode("\n", $lines);
    }

    private function rules(): string
    {
        $cfg = config('content.post');

        return implode("\n", [
            '- Açıklama (desc_tr): 80-320 karakter.',
            '- Giriş (intro_tr): en az 200 karakter.',
            '- Faydalar (benefits_tr), süreç (process_tr) ve SSS (faq_tr): 3-8 madde.',
            '- Anahtar kelimeler (keywords_tr): 4-12 adet.',
            sprintf('- SEO başlık (seo_title_tr): en fazla %d karakter.', $cfg['meta_title_max']),
            sprintf('- SEO açıklama (seo_desc_tr): %d-%d karakter.', $cfg['meta_desc_min'], $cfg['meta_desc_max']),
            '- Metin düz yazıdır (HTML değil); SSS soru-cevap çiftlerinden oluşur.',
        ]);
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
