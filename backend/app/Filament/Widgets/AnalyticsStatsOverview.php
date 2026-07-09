<?php

namespace App\Filament\Widgets;

use App\Models\Event;
use App\Models\Visit;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class AnalyticsStatsOverview extends StatsOverviewWidget
{
    protected static ?int $sort = -3;

    protected function getStats(): array
    {
        $today = Visit::whereDate('created_at', today())->distinct('visitor_id')->count('visitor_id');
        $week = Visit::where('created_at', '>=', now()->subDays(7))->distinct('visitor_id')->count('visitor_id');
        $views = Visit::count();
        $wa = Event::where('name', 'whatsapp_click')->count();
        $call = Event::where('name', 'call_click')->count();

        return [
            Stat::make('Bugün tekil ziyaretçi', (string) $today),
            Stat::make('Son 7 gün tekil', (string) $week),
            Stat::make('Toplam görüntüleme', (string) $views),
            Stat::make('WhatsApp tıklama', (string) $wa),
            Stat::make('Ara tıklama', (string) $call),
        ];
    }
}
