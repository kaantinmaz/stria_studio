<?php

namespace App\Filament\Resources\GalleryImages\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class GalleryImageForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('site')
                    ->label('Site')
                    ->placeholder('Ana site (Stria Studio)')
                    ->options(collect(config('microsites'))->mapWithKeys(fn ($c, $k) => [$k => $c['name']])->all())
                    ->native(false),
                FileUpload::make('image')
                    ->image()
                    ->disk('public')
                    ->directory('gallery'),
                TextInput::make('alt_tr')
                    ->required(),
                TextInput::make('alt_en'),
                TextInput::make('sort_order')
                    ->numeric()
                    ->default(0),
                Toggle::make('is_active')
                    ->default(true),
            ]);
    }
}
