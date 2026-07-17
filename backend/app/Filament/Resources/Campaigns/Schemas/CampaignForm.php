<?php

namespace App\Filament\Resources\Campaigns\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class CampaignForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('title')
                    ->label('Başlık')
                    ->required()
                    ->maxLength(255),
                TextInput::make('nth')
                    ->label('Kaçıncı işlem')
                    ->required()
                    ->integer()
                    ->minValue(1)
                    ->maxValue(255),
                TextInput::make('discount_percent')
                    ->label('İndirim yüzdesi')
                    ->suffix('%')
                    ->required()
                    ->integer()
                    ->minValue(0)
                    ->maxValue(100),
                Toggle::make('is_active')
                    ->label('Aktif')
                    ->default(true),
            ]);
    }
}
