<?php

namespace App\Filament\Resources\Services\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class ServiceForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Tabs::make()
                    ->tabs([
                        Tab::make('Türkçe')
                            ->schema([
                                TextInput::make('name_tr')
                                    ->required()
                                    ->maxLength(180)
                                    ->live(onBlur: true)
                                    ->afterStateUpdated(function (?string $state, Set $set, string $operation) {
                                        if ($operation === 'create') {
                                            $set('slug', Str::slug((string) $state));
                                        }
                                    }),
                                TextInput::make('tag_tr')
                                    ->required()
                                    ->maxLength(120),
                                Textarea::make('desc_tr')
                                    ->required()
                                    ->rows(3),
                                Textarea::make('intro_tr')
                                    ->rows(4),
                                Textarea::make('aftercare_tr')
                                    ->rows(3),
                                Repeater::make('benefits_tr')
                                    ->simple(TextInput::make('value')),
                                Repeater::make('process_tr')
                                    ->simple(TextInput::make('value')),
                                Repeater::make('faq_tr')
                                    ->schema([
                                        TextInput::make('q')
                                            ->label('Soru'),
                                        Textarea::make('a')
                                            ->label('Cevap')
                                            ->rows(2),
                                    ]),
                                Repeater::make('subservices_tr')
                                    ->schema([
                                        TextInput::make('slug')
                                            ->label('Slug (URL)')
                                            ->helperText("Alt sayfa URL'i /hizmetler/<hizmet>/<slug>"),
                                        TextInput::make('name')
                                            ->label('Alt hizmet adı'),
                                        Textarea::make('desc')
                                            ->label('Kısa açıklama')
                                            ->rows(2),
                                        TextInput::make('seo_title')
                                            ->label('SEO başlık'),
                                        Textarea::make('seo_desc')
                                            ->label('SEO açıklama')
                                            ->rows(2),
                                        Textarea::make('intro')
                                            ->label('Giriş metni')
                                            ->rows(4),
                                        FileUpload::make('gallery')
                                            ->image()
                                            ->multiple()
                                            ->disk('public')
                                            ->directory('subservices')
                                            ->label('Çalışma fotoğrafları')
                                            ->helperText('Alt uygulama sayfasında kare kare listelenir; tıklanınca büyür.'),
                                        Repeater::make('benefits')
                                            ->label('Faydalar')
                                            ->simple(TextInput::make('value')),
                                        Repeater::make('faq')
                                            ->schema([
                                                TextInput::make('q')
                                                    ->label('Soru'),
                                                Textarea::make('a')
                                                    ->label('Cevap')
                                                    ->rows(2),
                                            ]),
                                    ])
                                    ->collapsible()
                                    ->addActionLabel('Alt hizmet ekle')
                                    ->helperText('Bu hizmetin altında listelenen alt uygulamalar (ör. Kamuflaj Makyaj → Çatlak Gizleme).'),
                            ]),
                        Tab::make('English')
                            ->schema([
                                TextInput::make('name_en')
                                    ->maxLength(180),
                                TextInput::make('tag_en')
                                    ->maxLength(120),
                                Textarea::make('desc_en')
                                    ->rows(3),
                                Textarea::make('intro_en')
                                    ->rows(4),
                                Textarea::make('aftercare_en')
                                    ->rows(3),
                                Repeater::make('benefits_en')
                                    ->simple(TextInput::make('value')),
                                Repeater::make('process_en')
                                    ->simple(TextInput::make('value')),
                                Repeater::make('faq_en')
                                    ->schema([
                                        TextInput::make('q')
                                            ->label('Question'),
                                        Textarea::make('a')
                                            ->label('Answer')
                                            ->rows(2),
                                    ]),
                            ]),
                        Tab::make('SEO')
                            ->schema([
                                TextInput::make('slug')
                                    ->required()
                                    ->maxLength(180)
                                    ->unique(ignoreRecord: true),
                                TextInput::make('seo_title_tr')
                                    ->maxLength(60),
                                TextInput::make('seo_title_en')
                                    ->maxLength(60),
                                Textarea::make('seo_desc_tr')
                                    ->rows(2)
                                    ->maxLength(160),
                                Textarea::make('seo_desc_en')
                                    ->rows(2)
                                    ->maxLength(160),
                                TagsInput::make('keywords_tr'),
                                TagsInput::make('keywords_en'),
                            ]),
                        Tab::make('Görseller & Diğer')
                            ->schema([
                                FileUpload::make('image')
                                    ->image()
                                    ->disk('public')
                                    ->directory('services'),
                                FileUpload::make('hero_images')
                                    ->image()
                                    ->multiple()
                                    ->reorderable()
                                    ->disk('public')
                                    ->directory('services')
                                    ->maxFiles(8)
                                    ->helperText('Hizmet detay sayfasının üst görsel alanı; birden fazla görsel otomatik kayan slayta dönüşür. Boşsa tekli görsel kullanılır.'),
                                FileUpload::make('gallery')
                                    ->image()
                                    ->multiple()
                                    ->reorderable()
                                    ->disk('public')
                                    ->directory('services')
                                    // Öncesi/Sonrası rozeti dosya adından okunur → ad korunmalı.
                                    ->preserveFilenames()
                                    ->helperText('Çalışma fotoğrafları. Öncesi/sonrası rozeti DOSYA ADINDAN okunur: yüklemeden önce adı "kirpik-lifting-oncesi-1.jpg" / "kirpik-lifting-sonrasi-1.jpg" biçiminde verin (Türkçe karakter kullanmayın). Ad eşleşmezse görsel rozetsiz görünür.'),
                                TagsInput::make('related'),
                                TextInput::make('sort_order')
                                    ->numeric()
                                    ->default(0),
                                TextInput::make('duration_min')
                                    ->label('Ortalama süre (dakika)')
                                    ->numeric()
                                    ->required()
                                    ->minValue(5)
                                    ->maxValue(600)
                                    ->step(5)
                                    ->default(60)
                                    ->helperText('Randevu saatleri buna göre açılır. 100 dk girilirse 10:00 alınan randevu 11:00 slotunu da kapatır.'),
                                Toggle::make('is_active')
                                    ->default(true),
                            ]),
                    ])
                    ->columnSpanFull(),
            ]);
    }
}
