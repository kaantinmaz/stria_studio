<?php

namespace App\Filament\Resources\Customers\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class AppointmentsRelationManager extends RelationManager
{
    protected static string $relationship = 'appointments';

    protected static ?string $title = 'Randevu Geçmişi';

    protected static ?string $modelLabel = 'Randevu';

    protected static ?string $pluralModelLabel = 'Randevular';

    private const STATUS_LABELS = [
        'requested' => 'Talep Edildi',
        'confirmed' => 'Onaylandı',
        'cancelled' => 'İptal',
        'no_show' => 'Gelmedi',
    ];

    private const STATUS_COLORS = [
        'requested' => 'warning',
        'confirmed' => 'success',
        'cancelled' => 'gray',
        'no_show' => 'danger',
    ];

    public function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn ($query) => $query->with('service'))
            ->columns([
                TextColumn::make('starts_at')
                    ->label('Tarih')
                    ->dateTime('d.m.Y H:i')
                    ->sortable(),
                TextColumn::make('service.name_tr')
                    ->label('Hizmet')
                    ->placeholder('—'),
                TextColumn::make('status')
                    ->label('Durum')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => self::STATUS_LABELS[$state] ?? $state)
                    ->color(fn (string $state): string => self::STATUS_COLORS[$state] ?? 'gray'),
                TextColumn::make('duration_min')
                    ->label('Süre')
                    ->formatStateUsing(fn ($state): string => $state ? $state.' dk' : '—'),
                TextColumn::make('price')
                    ->label('Fiyat')
                    ->money('TRY')
                    ->placeholder('—'),
                IconColumn::make('is_paid')
                    ->label('Ödendi')
                    ->boolean(),
                TextColumn::make('payment_method')
                    ->label('Ödeme')
                    ->placeholder('—'),
                TextColumn::make('photos')
                    ->label('Fotoğraf')
                    ->badge()
                    ->color('gray')
                    ->getStateUsing(function ($record): string {
                        $count = count($record->photos ?? []);

                        return $count > 0 ? (string) $count : '—';
                    }),
                TextColumn::make('note')
                    ->label('Not')
                    ->limit(40)
                    ->placeholder('—')
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('starts_at', 'desc')
            ->paginated([10, 25, 50]);
    }

    public function isReadOnly(): bool
    {
        // Randevular takvimden yönetilir; burada yalnız geçmiş görüntülenir.
        return true;
    }
}
