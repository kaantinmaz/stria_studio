<?php

namespace App\Filament\Resources\Expenses\Schemas;

use App\Models\Expense;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class ExpenseForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('title')
                    ->label('Başlık')
                    ->required()
                    ->maxLength(255),
                TextInput::make('amount')
                    ->label('Tutar ₺')
                    ->prefix('₺')
                    ->required()
                    ->numeric()
                    ->minValue(0)
                    ->step(0.01),
                Select::make('category')
                    ->label('Kategori')
                    ->options(Expense::categoryOptions())
                    ->required()
                    ->native(false),
                DatePicker::make('spent_at')
                    ->label('Tarih')
                    ->required()
                    ->default(now()),
                Textarea::make('note')
                    ->label('Not')
                    ->rows(5)
                    ->columnSpanFull(),
            ]);
    }
}
