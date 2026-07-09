<?php

namespace App\Filament\Widgets;

use App\Models\Visit;
use Filament\Widgets\ChartWidget;

class TrafficSourcesChart extends ChartWidget
{
    protected ?string $heading = 'Trafik Kaynağı';

    protected static ?int $sort = -1;

    protected function getData(): array
    {
        $counts = Visit::selectRaw('source, count(*) c')->groupBy('source')->pluck('c', 'source');

        $labels = [
            'ai' => 'Yapay Zeka',
            'search' => 'Arama',
            'social' => 'Sosyal',
            'direct' => 'Direkt',
            'referral' => 'Referans',
        ];

        return [
            'datasets' => [[
                'data' => array_map(fn (string $key) => (int) ($counts[$key] ?? 0), array_keys($labels)),
                'backgroundColor' => ['#c57c69', '#8a6f6a', '#d89a8a', '#42302e', '#f3ded7'],
            ]],
            'labels' => array_values($labels),
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }
}
