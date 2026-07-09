<?php

namespace App\Filament\Resources\Faqs\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class FaqForm
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
                TextInput::make('q_tr')
                    ->required(),
                TextInput::make('q_en'),
                Textarea::make('a_tr')
                    ->required(),
                Textarea::make('a_en'),
                TextInput::make('sort_order')
                    ->numeric()
                    ->default(0),
                Toggle::make('is_active')
                    ->default(true),
            ]);
    }
}
