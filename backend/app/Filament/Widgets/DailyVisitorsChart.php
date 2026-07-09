<?php

namespace App\Filament\Widgets;

use App\Models\Visit;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class DailyVisitorsChart extends ChartWidget
{
    protected ?string $heading = 'Günlük Ziyaretçi (son 30 gün)';

    protected static ?int $sort = -2;

    protected int|string|array $columnSpan = 'full';

    protected function getData(): array
    {
        $labels = [];
        $counts = [];
        for ($i = 29; $i >= 0; $i--) {
            $day = Carbon::today()->subDays($i);
            $labels[] = $day->format('d.m');
            $counts[] = Visit::whereDate('created_at', $day)
                ->distinct('visitor_id')->count('visitor_id');
        }

        return [
            'datasets' => [[
                'label' => 'Tekil ziyaretçi',
                'data' => $counts,
                'borderColor' => '#c57c69',
                'backgroundColor' => 'rgba(197,124,105,0.15)',
                'fill' => true,
                'tension' => 0.3,
            ]],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
