<?php

namespace App\Filament\Resources\PhoneCalls\Tables;

use App\Models\PhoneCall;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class PhoneCallsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('started_at')
                    ->label('Zaman')
                    ->dateTime('d.m.Y H:i', 'Europe/Istanbul')
                    ->sortable(),
                TextColumn::make('direction')
                    ->label('Yön')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => $state === 'in' ? 'Gelen' : 'Giden')
                    ->color(fn (string $state): string => $state === 'in' ? 'info' : 'gray'),
                TextColumn::make('customer_phone')
                    ->label('Numara')
                    ->formatStateUsing(fn (?string $state): string => $state && str_starts_with($state, '90') ? '0'.substr($state, 2) : (string) $state)
                    ->placeholder('Gizli numara')
                    ->searchable()
                    ->copyable(),
                TextColumn::make('customer.name')
                    ->label('Müşteri')
                    ->placeholder('Kayıtlı değil'),
                TextColumn::make('duration')
                    ->label('Süre')
                    ->formatStateUsing(fn (int $state): string => sprintf('%d:%02d', intdiv($state, 60), $state % 60)),
                TextColumn::make('source')
                    ->label('Kaynak')
                    ->badge()
                    ->getStateUsing(fn (PhoneCall $record): ?string => $record->touchpoint?->source())
                    ->tooltip(fn (PhoneCall $record): ?string => $record->touchpoint?->label())
                    ->placeholder('—'),
                TextColumn::make('status')
                    ->label('Durum kodu')
                    ->placeholder('—')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('recording_url')
                    ->label('Ses kaydı')
                    ->formatStateUsing(fn (): string => 'Dinle')
                    ->url(fn (PhoneCall $record): ?string => $record->recording_url, shouldOpenInNewTab: true)
                    ->placeholder('—'),
            ])
            ->defaultSort('started_at', 'desc')
            ->filters([
                SelectFilter::make('direction')
                    ->label('Yön')
                    ->options(['in' => 'Gelen', 'out' => 'Giden']),
            ]);
    }
}
