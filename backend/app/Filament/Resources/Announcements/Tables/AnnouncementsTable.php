<?php

namespace App\Filament\Resources\Announcements\Tables;

use App\Models\Announcement;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class AnnouncementsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title')
                    ->label('Başlık')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('validity')
                    ->label('Geçerlilik')
                    ->getStateUsing(fn (Announcement $record): string => self::validityLabel($record)),
                IconColumn::make('is_active')
                    ->label('Aktif')
                    ->boolean(),
                TextColumn::make('created_at')
                    ->label('Oluşturuldu')
                    ->since(),
            ])
            ->defaultSort('id', 'desc')
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }

    private static function validityLabel(Announcement $record): string
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
}
