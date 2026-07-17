<?php

namespace App\Filament\Resources\Announcements\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class AnnouncementForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('title')
                    ->label('Başlık')
                    ->required()
                    ->maxLength(255),
                Textarea::make('body')
                    ->label('İçerik')
                    ->required()
                    ->rows(4)
                    ->columnSpanFull(),
                DatePicker::make('starts_at')
                    ->label('Başlangıç')
                    ->helperText('Boş bırakılırsa süresiz'),
                DatePicker::make('ends_at')
                    ->label('Bitiş')
                    ->helperText('Boş bırakılırsa süresiz')
                    ->afterOrEqual('starts_at'),
                Toggle::make('is_active')
                    ->label('Aktif')
                    ->default(true),
            ]);
    }
}
