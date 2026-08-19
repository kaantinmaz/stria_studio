<?php

namespace App\Filament\Resources\ServiceReviews\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class ServiceReviewsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('author_name')
                    ->label('Müşteri')
                    ->searchable(),
                TextColumn::make('service.name_tr')
                    ->label('Hizmet')
                    ->placeholder('İşletme geneli')
                    ->searchable(),
                TextColumn::make('rating')
                    ->label('Puan')
                    ->formatStateUsing(fn (int $state): string => str_repeat('★', $state).str_repeat('☆', 5 - $state)),
                TextColumn::make('source')
                    ->label('Kaynak')
                    ->badge()
                    ->formatStateUsing(fn (?string $state): string => match ($state) {
                        'google' => 'Google',
                        'instagram' => 'Instagram',
                        'whatsapp' => 'WhatsApp',
                        default => 'Stüdyo',
                    }),
                TextColumn::make('reviewed_at')
                    ->label('Tarih')
                    ->date(),
                IconColumn::make('is_active')
                    ->label('Yayında')
                    ->boolean(),
                TextColumn::make('sort_order')
                    ->label('Sıra')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('source')
                    ->label('Kaynak')
                    ->options([
                        'studio' => 'Stüdyo',
                        'google' => 'Google',
                        'instagram' => 'Instagram',
                        'whatsapp' => 'WhatsApp',
                    ]),
                TernaryFilter::make('is_active')
                    ->label('Yayında'),
            ])
            ->defaultSort('sort_order')
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
