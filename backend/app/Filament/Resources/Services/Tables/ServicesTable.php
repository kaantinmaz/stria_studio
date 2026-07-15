<?php

namespace App\Filament\Resources\Services\Tables;

use App\Models\Visit;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Contracts\Database\Query\Expression;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ServicesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query): Builder => self::withVisitCounts($query))
            ->columns([
                // Cover first. Resolve to an absolute URL so both uploaded
                // (storage/…) and seeded root-relative (/images/…) covers render.
                ImageColumn::make('image')
                    ->label('Görsel')
                    ->getStateUsing(fn ($record) => self::imageUrl($record->image)),
                TextColumn::make('name_tr')
                    ->label('Hizmet')
                    ->searchable(),
                TextColumn::make('tag_tr')
                    ->label('Etiket')
                    ->badge(),
                // How many gallery images are uploaded for this service.
                TextColumn::make('gallery')
                    ->label('Galeri')
                    ->badge()
                    ->color('gray')
                    ->getStateUsing(fn ($record) => count($record->gallery ?? []).' görsel'),
                IconColumn::make('is_active')
                    ->label('Aktif')
                    ->boolean(),
                TextColumn::make('readers_count')
                    ->label('Okuyan (tekil)')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('views_count')
                    ->label('Görüntülenme')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('sort_order')
                    ->label('Sıra')
                    ->sortable(),
            ])
            ->filters([
                //
            ])
            ->defaultSort('sort_order')
            ->reorderable('sort_order')
            ->recordActions([
                // One click to the live site page (opens in a new tab).
                Action::make('view_site')
                    ->label('Sitede Gör')
                    ->icon(Heroicon::OutlinedArrowTopRightOnSquare)
                    ->color('gray')
                    ->url(fn ($record) => rtrim(config('app.frontend_url'), '/').'/hizmetler/'.$record->slug)
                    ->openUrlInNewTab(),
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
        $path = self::servicePathExpression();

        return $query->addSelect([
            'views_count' => Visit::query()
                ->selectRaw('COUNT(*)')
                ->whereColumn('visits.path', '=', $path)
                ->whereNull('visits.site'),
            'readers_count' => Visit::query()
                ->selectRaw('COUNT(DISTINCT visits.visitor_id)')
                ->whereColumn('visits.path', '=', $path)
                ->whereNull('visits.site'),
        ]);
    }

    private static function servicePathExpression(): Expression
    {
        return DB::raw(match (DB::connection()->getDriverName()) {
            'mysql', 'mariadb' => "CONCAT('/hizmetler/', services.slug)",
            default => "'/hizmetler/' || services.slug",
        });
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
