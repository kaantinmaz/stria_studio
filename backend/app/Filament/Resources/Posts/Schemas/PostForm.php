<?php

namespace App\Filament\Resources\Posts\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class PostForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Tabs::make()
                    ->tabs([
                        Tab::make('Türkçe')
                            ->schema([
                                TextInput::make('title_tr')
                                    ->required()
                                    ->maxLength(180)
                                    ->live(onBlur: true)
                                    ->afterStateUpdated(function (?string $state, Set $set, string $operation) {
                                        if ($operation === 'create') {
                                            $set('slug', Str::slug((string) $state));
                                        }
                                    }),
                                Textarea::make('excerpt_tr')
                                    ->required()
                                    ->rows(2)
                                    ->maxLength(300),
                                RichEditor::make('body_tr')
                                    ->required()
                                    ->columnSpanFull(),
                            ]),
                        Tab::make('English')
                            ->schema([
                                TextInput::make('title_en')
                                    ->required()
                                    ->maxLength(180),
                                Textarea::make('excerpt_en')
                                    ->required()
                                    ->rows(2)
                                    ->maxLength(300),
                                RichEditor::make('body_en')
                                    ->required()
                                    ->columnSpanFull(),
                            ]),
                        Tab::make('SEO / Meta')
                            ->schema([
                                TextInput::make('slug')
                                    ->required()
                                    ->unique(ignoreRecord: true),
                                TextInput::make('meta_title_tr')
                                    ->maxLength(60),
                                TextInput::make('meta_title_en')
                                    ->maxLength(60),
                                Textarea::make('meta_desc_tr')
                                    ->rows(2)
                                    ->maxLength(160),
                                Textarea::make('meta_desc_en')
                                    ->rows(2)
                                    ->maxLength(160),
                            ]),
                    ])
                    ->columnSpanFull(),
                FileUpload::make('cover_path')
                    ->image()
                    ->directory('covers')
                    ->disk('public'),
                Select::make('category_id')
                    ->relationship('category', 'name_tr')
                    ->searchable()
                    ->preload(),
                Select::make('tags')
                    ->relationship('tags', 'name_tr')
                    ->multiple()
                    ->searchable()
                    ->preload(),
                Toggle::make('is_published'),
                DateTimePicker::make('published_at')
                    ->default(now()),
            ]);
    }
}
