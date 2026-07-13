<?php

namespace App\Filament\Widgets;

use App\Filament\Widgets\Concerns\ScopesBySite;
use App\Models\Visit;
use Filament\Widgets\ChartWidget;

class TopPagesChart extends ChartWidget
{
    use ScopesBySite;

    protected ?string $heading = 'En Çok Görüntülenen Sayfalar';

    protected static ?int $sort = 0;

    protected int|string|array $columnSpan = 'full';

    protected function getData(): array
    {
        $counts = $this->scopeSite(Visit::query())
            ->selectRaw('path, count(*) c')
            ->groupBy('path')
            ->orderByDesc('c')
            ->limit(8)
            ->pluck('c', 'path');

        return [
            'datasets' => [[
                'data' => array_values($counts->all()),
                'backgroundColor' => '#c57c69',
            ]],
            'labels' => array_keys($counts->all()),
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getOptions(): array
    {
        return [
            'indexAxis' => 'y',
        ];
    }
}
