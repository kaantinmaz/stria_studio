<?php

namespace App\Filament\Resources\ServiceReviews\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class ServiceReviewForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('service_id')
                    ->label('Hizmet')
                    ->relationship('service', 'name_tr')
                    ->searchable()
                    ->preload()
                    ->helperText('Boş bırakılırsa işletme geneli yorum olarak görünür.'),
                TextInput::make('author_name')
                    ->label('Müşteri adı')
                    ->required()
                    ->maxLength(120),
                Select::make('rating')
                    ->label('Puan')
                    ->required()
                    ->options([
                        5 => '5 ★★★★★',
                        4 => '4 ★★★★',
                        3 => '3 ★★★',
                        2 => '2 ★★',
                        1 => '1 ★',
                    ]),
                Textarea::make('body')
                    ->label('Yorum (TR)')
                    ->required()
                    ->rows(3),
                Textarea::make('body_en')
                    ->label('Yorum (EN) — isteğe bağlı çeviri')
                    ->rows(3),
                Select::make('source')
                    ->label('Kaynak')
                    ->required()
                    ->default('studio')
                    ->options([
                        'studio' => 'Stüdyo (elle girildi)',
                        'google' => 'Google',
                        'instagram' => 'Instagram',
                        'whatsapp' => 'WhatsApp',
                    ]),
                TextInput::make('source_url')
                    ->label('Kaynak bağlantısı (kanıt)')
                    ->url(),
                DatePicker::make('reviewed_at')
                    ->label('Yorum tarihi'),
                Toggle::make('is_active')
                    ->label('Yayında')
                    ->default(true)
                    ->helperText('Yalnızca gerçek müşteri yorumları girin. Sahte veya uydurma yorum girmek 6502 sayılı Tüketicinin Korunması Hakkında Kanun\'a aykırıdır; yorumu yayınlamadan önce müşterinin rızasını alın.'),
                TextInput::make('sort_order')
                    ->label('Sıra')
                    ->numeric()
                    ->default(0),
            ]);
    }
}
