<?php

namespace App\Filament\Resources\Faqs\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class FaqsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('q_tr')
                    ->limit(50)
                    ->searchable(),
                TextColumn::make('site')
                    ->label('Site')
                    ->badge()
                    ->placeholder('Ana site')
                    ->formatStateUsing(fn (?string $state) => $state ? (config("microsites.$state.name") ?? $state) : 'Ana site'),
                IconColumn::make('is_active')
                    ->boolean(),
                TextColumn::make('sort_order')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('site')
                    ->label('Site')
                    ->options(collect(config('microsites'))->mapWithKeys(fn ($c, $k) => [$k => $c['name']])->all()),
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
