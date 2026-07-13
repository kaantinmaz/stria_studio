<?php

namespace App\Filament\Widgets;

use App\Filament\Widgets\Concerns\ScopesBySite;
use App\Models\Lead;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class LatestLeads extends BaseWidget
{
    use ScopesBySite;

    // Below AnalyticsStatsOverview (-3) puts leads at the very top of the dashboard.
    protected static ?int $sort = -4;

    protected int|string|array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query($this->scopeSite(Lead::query()->latest()))
            ->heading('Son Randevu Talepleri')
            ->columns([
                TextColumn::make('created_at')
                    ->label('Tarih')
                    ->dateTime('d.m.Y H:i')
                    ->sortable(),
                TextColumn::make('site')
                    ->label('Site')
                    ->formatStateUsing(fn (?string $state) => $state ? (config("microsites.$state.name") ?? $state) : 'Ana Site')
                    ->badge(),
                TextColumn::make('name')
                    ->label('Ad')
                    ->searchable(),
                TextColumn::make('phone')
                    ->label('Telefon')
                    ->copyable()
                    ->searchable(),
                TextColumn::make('service')
                    ->label('Hizmet')
                    ->placeholder('—'),
                TextColumn::make('preferred_date')
                    ->label('Tercih edilen tarih')
                    ->date('d.m.Y')
                    ->placeholder('—'),
                TextColumn::make('message')
                    ->label('Mesaj')
                    ->limit(60)
                    ->tooltip(fn (Lead $r) => $r->message)
                    ->placeholder('—'),
            ])
            ->paginated([10, 25, 50]);
    }
}
