<?php

namespace App\Console\Commands;

use App\Models\SearchQuery;
use App\Support\QueryCoverage;
use Illuminate\Console\Command;

/**
 * En çok gösterim alan arama sorgularını mevcut içerikle örtüşmelerine göre
 * (yeni yazı / mevcut yazı / hizmet sayfası) sınıflandırıp bir fırsat tablosu
 * basar ve altına doğrudan çalıştırılabilir üretim komutlarını yazar.
 * Sınıflandırma tamamen kural tabanlıdır (QueryCoverage), yapay zekâ çağırmaz.
 */
class PlanContent extends Command
{
    protected $signature = 'content:plan {--limit=15 : Gösterilecek sorgu sayısı} {--period= : Dönem YYYY-MM; verilmezse en yeni dönem} {--status= : Filtre: new|covered|service}';

    protected $description = 'Arama sorgularını içerik fırsatı olarak sınıflandırır ve üretim komutlarını önerir';

    /** @var array<string,string> */
    private const LABELS = [
        'new' => 'YENİ YAZI',
        'covered' => 'MEVCUT YAZI',
        'service' => 'HİZMET SAYFASI',
    ];

    public function handle(QueryCoverage $coverage): int
    {
        $period = $this->option('period') ?: SearchQuery::max('period');

        if (blank($period)) {
            $this->warn('Hiç arama sorgusu bulunamadı. Önce içe aktarın: php artisan gsc:import <dosya>');

            return self::SUCCESS;
        }

        $status = $this->option('status');
        if (filled($status) && ! array_key_exists($status, self::LABELS)) {
            $this->error('Geçersiz --status değeri. Beklenen: new, covered veya service.');

            return self::FAILURE;
        }

        $limit = max(1, (int) $this->option('limit'));

        $rows = SearchQuery::query()
            ->where('period', $period)
            ->opportunity()
            ->get();

        if ($rows->isEmpty()) {
            $this->warn("'{$period}' dönemi için sorgu yok. Önce içe aktarın: php artisan gsc:import <dosya>");

            return self::SUCCESS;
        }

        $tableRows = [];
        $writeCommands = [];
        $serviceCommands = [];

        foreach ($rows as $row) {
            $result = $coverage->classify($row->query);

            if (filled($status) && $result['status'] !== $status) {
                continue;
            }

            $tableRows[] = [
                $row->query,
                $row->impressions,
                $row->clicks,
                self::LABELS[$result['status']],
                $result['target'] ?? '-',
            ];

            if ($result['status'] === 'new') {
                $writeCommands[] = 'php artisan content:write "'.$row->query.'"';
            } elseif ($result['status'] === 'service') {
                $slug = $this->serviceSlug($result['target']);
                if ($slug !== null) {
                    $serviceCommands[$slug] = 'php artisan content:service-copy '.$slug;
                }
            }

            if (count($tableRows) >= $limit) {
                break;
            }
        }

        if ($tableRows === []) {
            $this->warn('Seçilen filtreyle eşleşen sorgu bulunamadı.');

            return self::SUCCESS;
        }

        $this->info("Dönem: {$period} — {$rows->count()} sorgu tarandı, ".count($tableRows).' tanesi gösteriliyor.');
        $this->table(
            ['Sorgu', 'Gösterim', 'Tıklama', 'Durum', 'Hedef'],
            $tableRows
        );

        if ($writeCommands !== []) {
            $this->newLine();
            $this->info('Yeni yazı üret:');
            foreach ($writeCommands as $command) {
                $this->line('  '.$command);
            }
        }

        if ($serviceCommands !== []) {
            $this->newLine();
            $this->info('Hizmet metnini güncelle:');
            foreach ($serviceCommands as $command) {
                $this->line('  '.$command);
            }
        }

        return self::SUCCESS;
    }

    /**
     * /hizmetler/{slug}[/{alt}] hedef URL'sinden ana hizmet slug'ını çıkarır.
     */
    private function serviceSlug(?string $url): ?string
    {
        if ($url === null) {
            return null;
        }

        $segments = array_values(array_filter(explode('/', $url), fn (string $s): bool => $s !== ''));
        $index = array_search('hizmetler', $segments, true);

        if ($index === false || ! isset($segments[$index + 1])) {
            return null;
        }

        return $segments[$index + 1];
    }
}
