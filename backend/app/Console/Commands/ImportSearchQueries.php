<?php

namespace App\Console\Commands;

use App\Models\SearchQuery;
use Illuminate\Console\Command;

/**
 * Google Search Console sorgu dışa aktarımını (CSV/TSV) search_queries
 * tablosuna alır. İki biçim desteklenir: 3 sütun (sorgu, tıklama, gösterim)
 * ve 5 sütun (ek olarak TO yüzdesi ve Pozisyon). Ayraç (virgül/sekme) ilk
 * satırdan otomatik algılanır, Türkçe ondalık virgülleri ("27,04") ayrıştırılır
 * ve başlık satırı ikinci sütun sayısal değilse atlanır. Her satır
 * (sorgu, dönem) çiftine göre updateOrCreate edilir.
 */
class ImportSearchQueries extends Command
{
    protected $signature = 'gsc:import {file : CSV/TSV dosya yolu (repo köküne göre veya mutlak)} {--period= : Dönem YYYY-MM; verilmezse dosya adından çıkarılır}';

    protected $description = 'Google Search Console sorgu dışa aktarımını search_queries tablosuna alır';

    public function handle(): int
    {
        $path = $this->resolvePath((string) $this->argument('file'));

        if ($path === null) {
            $this->error('Dosya okunamadı: '.$this->argument('file'));

            return self::FAILURE;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false || $lines === []) {
            $this->error('Dosya boş veya okunamadı: '.$path);

            return self::FAILURE;
        }

        // BOM'u ilk satırdan temizle.
        $lines[0] = preg_replace('/^\x{FEFF}/u', '', $lines[0]);

        $delimiter = substr_count($lines[0], "\t") > 0 ? "\t" : ',';
        $period = $this->resolvePeriod($path);

        $created = 0;
        $updated = 0;
        $skipped = 0;

        foreach ($lines as $line) {
            $cols = str_getcsv($line, $delimiter, '"', '');

            $query = isset($cols[0]) ? $this->normalizeQuery((string) $cols[0]) : '';
            $clicksRaw = $cols[1] ?? '';

            // Başlık satırı: ikinci sütun sayısal değil.
            if (! is_numeric(preg_replace('/\D/', '', (string) $clicksRaw)) || $clicksRaw === '') {
                $skipped++;
                continue;
            }

            if ($query === '') {
                $skipped++;

                continue;
            }

            $attributes = [
                'clicks' => $this->parseInt((string) ($cols[1] ?? '')),
                'impressions' => $this->parseInt((string) ($cols[2] ?? '')),
                'ctr' => null,
                'position' => null,
            ];

            // 5 sütunlu biçim: TO yüzdesi ve Pozisyon.
            if (count($cols) >= 5) {
                $attributes['ctr'] = $this->parseCtr((string) $cols[3]);
                $attributes['position'] = $this->parseDecimal((string) $cols[4]);
            }

            $model = SearchQuery::updateOrCreate(
                ['query' => $query, 'period' => $period],
                $attributes
            );

            if ($model->wasRecentlyCreated) {
                $created++;
            } else {
                $updated++;
            }
        }

        $this->info('Search Console içe aktarımı tamamlandı.');
        $this->table(
            ['Dosya', 'Dönem', 'Eklenen', 'Güncellenen', 'Atlanan'],
            [[$path, $period, $created, $updated, $skipped]]
        );

        return self::SUCCESS;
    }

    /**
     * Dosyayı mutlak yol, çalışma dizini, Laravel kökü ve repo kökü sırasıyla
     * çözer. Okunabilir ilk aday döner, hiçbiri yoksa null.
     */
    private function resolvePath(string $file): ?string
    {
        $candidates = [
            $file,
            getcwd().DIRECTORY_SEPARATOR.$file,
            base_path($file),
            dirname(base_path()).DIRECTORY_SEPARATOR.$file,
        ];

        foreach ($candidates as $candidate) {
            if (is_file($candidate) && is_readable($candidate)) {
                return $candidate;
            }
        }

        return null;
    }

    /**
     * --period seçeneği > dosya adındaki YYYY-MM > şimdiki ay.
     */
    private function resolvePeriod(string $path): string
    {
        $option = $this->option('period');
        if (filled($option)) {
            return (string) $option;
        }

        if (preg_match('/(\d{4}-\d{2})/', basename($path), $m) === 1) {
            return $m[1];
        }

        return now()->format('Y-m');
    }

    /**
     * İç boşlukları teker boşluğa indirger, kırpar; büyük/küçük harf ve
     * aksanları korur. 190 karakterle sınırlar (sütun genişliği).
     */
    private function normalizeQuery(string $query): string
    {
        $collapsed = trim((string) preg_replace('/\s+/u', ' ', $query));

        return mb_substr($collapsed, 0, 190, 'UTF-8');
    }

    private function parseInt(string $value): int
    {
        return (int) preg_replace('/\D/', '', $value);
    }

    /**
     * "15.38%" veya "15,38%" → 0.1538.
     */
    private function parseCtr(string $value): ?float
    {
        $value = trim(str_replace('%', '', $value));
        if ($value === '') {
            return null;
        }

        return $this->parseDecimal($value) / 100;
    }

    /**
     * Türkçe ondalık virgülü de kabul eder: "27,04" → 27.04.
     */
    private function parseDecimal(string $value): ?float
    {
        $value = trim($value);
        if ($value === '') {
            return null;
        }

        return (float) str_replace(',', '.', $value);
    }
}
