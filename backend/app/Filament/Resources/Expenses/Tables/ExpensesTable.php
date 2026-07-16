<?php

namespace App\Filament\Resources\Expenses\Tables;

use App\Models\Expense;
use Carbon\CarbonImmutable;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\Summarizers\Sum;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ExpensesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title')
                    ->label('Başlık')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('category')
                    ->label('Kategori')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => Expense::categoryOptions()[$state] ?? $state)
                    ->color(fn (string $state): string => match ($state) {
                        'kira' => 'warning',
                        'malzeme' => 'info',
                        'maas' => 'success',
                        'pazarlama' => 'primary',
                        'fatura' => 'danger',
                        default => 'gray',
                    }),
                TextColumn::make('amount')
                    ->label('Tutar')
                    ->numeric(decimalPlaces: 2, decimalSeparator: ',', thousandsSeparator: '.')
                    ->suffix(' ₺')
                    ->sortable()
                    ->summarize(
                        Sum::make()
                            ->label('Toplam')
                            ->numeric(decimalPlaces: 2, decimalSeparator: ',', thousandsSeparator: '.')
                            ->suffix(' ₺'),
                    ),
                TextColumn::make('spent_at')
                    ->label('Tarih')
                    ->date('d.m.Y')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('category')
                    ->label('Kategori')
                    ->options(Expense::categoryOptions())
                    ->native(false),
                SelectFilter::make('month')
                    ->label('Ay')
                    ->options(self::monthOptions())
                    ->native(false)
                    ->query(function (Builder $query, array $data): Builder {
                        if (blank($data['value'] ?? null)) {
                            return $query;
                        }

                        $month = CarbonImmutable::createFromFormat('!Y-m', $data['value']);

                        return $query->whereBetween('spent_at', [
                            $month->startOfMonth()->toDateString(),
                            $month->endOfMonth()->toDateString(),
                        ]);
                    }),
            ])
            ->defaultSort('spent_at', 'desc')
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }

    /**
     * @return array<string, string>
     */
    private static function monthOptions(): array
    {
        $options = [];
        $month = CarbonImmutable::now()->startOfMonth();

        for ($index = 0; $index < 24; $index++) {
            $options[$month->format('Y-m')] = self::turkishMonthName($month->month).' '.$month->year;
            $month = $month->subMonth();
        }

        return $options;
    }

    private static function turkishMonthName(int $month): string
    {
        return [
            1 => 'Ocak',
            2 => 'Şubat',
            3 => 'Mart',
            4 => 'Nisan',
            5 => 'Mayıs',
            6 => 'Haziran',
            7 => 'Temmuz',
            8 => 'Ağustos',
            9 => 'Eylül',
            10 => 'Ekim',
            11 => 'Kasım',
            12 => 'Aralık',
        ][$month];
    }
}
