<?php

namespace App\Filament\Resources\Posts\Tables;

use App\Models\Visit;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Contracts\Database\Query\Expression;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class PostsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query): Builder => self::withVisitCounts($query))
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
                TextColumn::make('readers_count')
                    ->label('Okuyan (tekil)')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('views_count')
                    ->label('Görüntülenme')
                    ->numeric()
                    ->sortable(),
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

    public static function withVisitCounts(Builder $query): Builder
    {
        $path = self::postPathExpression();
        $matchingSite = fn (Builder $visits): Builder => $visits
            ->whereColumn('visits.site', 'posts.site')
            ->orWhere(fn (Builder $visits): Builder => $visits
                ->whereNull('visits.site')
                ->whereNull('posts.site'));

        return $query->addSelect([
            'views_count' => Visit::query()
                ->selectRaw('COUNT(*)')
                ->whereColumn('visits.path', '=', $path)
                ->where($matchingSite),
            'readers_count' => Visit::query()
                ->selectRaw('COUNT(DISTINCT visits.visitor_id)')
                ->whereColumn('visits.path', '=', $path)
                ->where($matchingSite),
        ]);
    }

    private static function postPathExpression(): Expression
    {
        return DB::raw(match (DB::connection()->getDriverName()) {
            'mysql', 'mariadb' => "CONCAT('/blog/', posts.slug)",
            default => "'/blog/' || posts.slug",
        });
    }
}
