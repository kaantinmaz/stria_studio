<?php

namespace App\Filament\Resources\Customers\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Support\Icons\Heroicon;

class CustomersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label('Ad Soyad')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('phone')
                    ->label('Telefon')
                    ->placeholder('—'),
                TextColumn::make('instagram')
                    ->label('Instagram')
                    ->placeholder('—'),
                IconColumn::make('app_user_id')
                    ->label('Uygulama')
                    ->icon(fn ($state) => $state ? Heroicon::OutlinedDevicePhoneMobile : null)
                    ->color('success'),
                TextColumn::make('appointments_count')
                    ->label('Randevu Sayısı')
                    ->counts('appointments')
                    ->sortable(),
                TextColumn::make('photos')
                    ->label('Fotoğraflar')
                    ->badge()
                    ->color('gray')
                    ->getStateUsing(function ($record): string {
                        $count = count($record->photos ?? []);

                        return $count > 0 ? $count.' fotoğraf' : '—';
                    }),
                TextColumn::make('created_at')
                    ->label('Kayıt Tarihi')
                    ->since()
                    ->sortable(),
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
}
