<?php

namespace App\Filament\Resources\Campaigns\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;

class CampaignForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('kind')
                    ->label('Kampanya türü')
                    ->options([
                        'loyalty' => 'Sadakat (her N. işleme indirim)',
                        'promo' => 'Promosyon (app kampanyası)',
                    ])
                    ->default('loyalty')
                    ->required()
                    ->native(false)
                    ->live(),
                TextInput::make('title')
                    ->label('Başlık')
                    ->required()
                    ->maxLength(255),
                TextInput::make('nth')
                    ->label('Kaçıncı işlem')
                    ->integer()
                    ->minValue(1)
                    ->maxValue(255)
                    ->visible(fn (Get $get): bool => $get('kind') === 'loyalty')
                    ->required(fn (Get $get): bool => $get('kind') === 'loyalty'),
                TextInput::make('discount_percent')
                    ->label('İndirim yüzdesi')
                    ->suffix('%')
                    ->integer()
                    ->minValue(0)
                    ->maxValue(100)
                    ->visible(fn (Get $get): bool => $get('kind') === 'loyalty')
                    ->required(fn (Get $get): bool => $get('kind') === 'loyalty'),
                Textarea::make('description')
                    ->label('Açıklama')
                    ->rows(4)
                    ->columnSpanFull()
                    ->visible(fn (Get $get): bool => $get('kind') === 'promo'),
                FileUpload::make('image')
                    ->label('Görsel')
                    ->image()
                    ->disk('public')
                    ->directory('campaigns')
                    ->visible(fn (Get $get): bool => $get('kind') === 'promo'),
                DatePicker::make('starts_at')
                    ->label('Başlangıç')
                    ->helperText('Boş bırakılırsa süresiz')
                    ->visible(fn (Get $get): bool => $get('kind') === 'promo'),
                DatePicker::make('ends_at')
                    ->label('Bitiş')
                    ->helperText('Boş bırakılırsa süresiz')
                    ->afterOrEqual('starts_at')
                    ->visible(fn (Get $get): bool => $get('kind') === 'promo'),
                TextInput::make('old_price')
                    ->label('Eski Fiyat')
                    ->numeric()
                    ->minValue(0)
                    ->visible(fn (Get $get): bool => $get('kind') === 'promo'),
                TextInput::make('new_price')
                    ->label('Kampanya Fiyatı')
                    ->numeric()
                    ->minValue(0)
                    ->visible(fn (Get $get): bool => $get('kind') === 'promo'),
                Toggle::make('is_active')
                    ->label('Aktif')
                    ->default(true),
            ]);
    }
}
