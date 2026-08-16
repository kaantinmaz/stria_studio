<?php

namespace App\Filament\Resources\Links\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class LinkForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('label_tr')
                    ->label('Başlık (TR)')
                    ->required(),
                TextInput::make('label_en')
                    ->label('Başlık (EN)'),
                TextInput::make('subtitle_tr')
                    ->label('Alt açıklama (TR)'),
                TextInput::make('subtitle_en')
                    ->label('Alt açıklama (EN)'),
                TextInput::make('url')
                    ->label('Adres')
                    ->helperText('Site içi için /hizmetler gibi, dış bağlantı için https://… yazın.')
                    ->required()
                    ->maxLength(255),
                Select::make('icon')
                    ->label('İkon')
                    ->options([
                        'web' => 'Bağlantı',
                        'whatsapp' => 'WhatsApp',
                        'instagram' => 'Instagram',
                        'phone' => 'Telefon',
                        'map' => 'Konum',
                        'calendar' => 'Randevu',
                        'mail' => 'E-posta',
                        'tiktok' => 'TikTok',
                        'youtube' => 'YouTube',
                    ])
                    ->default('web')
                    ->native(false)
                    ->required(),
                Toggle::make('is_featured')
                    ->label('Öne çıkar (dolgulu buton)'),
                TextInput::make('sort_order')
                    ->label('Sıra')
                    ->numeric()
                    ->default(0),
                Toggle::make('is_active')
                    ->label('Aktif')
                    ->default(true),
            ]);
    }
}
