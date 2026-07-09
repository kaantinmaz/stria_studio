<?php

namespace App\Filament\Resources\Posts\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class PostsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title_tr')
                    ->searchable()
                    ->limit(40),
                TextColumn::make('site')
                    ->label('Site')
                    ->badge()
                    ->placeholder('Ana site')
                    ->formatStateUsing(fn (?string $state) => $state ? (config("microsites.$state.name") ?? $state) : 'Ana site'),
                TextColumn::make('category.name_tr')
                    ->badge(),
                IconColumn::make('is_published')
                    ->boolean(),
                TextColumn::make('published_at')
                    ->dateTime('d.m.Y')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('site')
                    ->label('Site')
                    ->options(collect(config('microsites'))->mapWithKeys(fn ($c, $k) => [$k => $c['name']])->all()),
                SelectFilter::make('category')
                    ->relationship('category', 'name_tr'),
                TernaryFilter::make('is_published'),
            ])
            ->defaultSort('published_at', 'desc')
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
