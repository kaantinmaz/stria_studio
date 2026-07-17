<?php

namespace App\Filament\Resources\Campaigns\Tables;

use App\Models\Campaign;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class CampaignsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('image')
                    ->label('Görsel')
                    ->getStateUsing(fn (Campaign $record) => self::imageUrl($record->image)),
                TextColumn::make('kind')
                    ->label('Tür')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => $state === 'promo' ? 'Promosyon' : 'Sadakat')
                    ->color(fn (string $state): string => $state === 'promo' ? 'success' : 'gray'),
                TextColumn::make('title')
                    ->label('Başlık')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('nth')
                    ->label('Kaçıncı işlem')
                    ->placeholder('—')
                    ->sortable(),
                TextColumn::make('discount_percent')
                    ->label('İndirim')
                    ->suffix('%')
                    ->placeholder('—')
                    ->sortable(),
                TextColumn::make('validity')
                    ->label('Geçerlilik')
                    ->getStateUsing(fn (Campaign $record): string => self::validityLabel($record)),
                ToggleColumn::make('is_active')
                    ->label('Aktif'),
            ])
            ->defaultSort('created_at', 'desc')
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }

    private static function validityLabel(Campaign $record): string
    {
        $start = $record->starts_at?->format('d.m');
        $end = $record->ends_at?->format('d.m');

        if ($start === null && $end === null) {
            return 'Süresiz';
        }
        if ($start !== null && $end !== null) {
            return $start === $end ? $start : $start.' - '.$end;
        }

        return $start ?? $end;
    }

    private static function imageUrl(?string $img): ?string
    {
        if (! $img) {
            return null;
        }
        if (Str::startsWith($img, ['http://', 'https://'])) {
            return $img;
        }

        return Str::startsWith($img, '/') ? url($img) : url('storage/'.$img);
    }
}
