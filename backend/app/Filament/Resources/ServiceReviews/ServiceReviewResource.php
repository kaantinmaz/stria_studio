<?php

namespace App\Filament\Resources\ServiceReviews;

use App\Filament\Resources\ServiceReviews\Pages\CreateServiceReview;
use App\Filament\Resources\ServiceReviews\Pages\EditServiceReview;
use App\Filament\Resources\ServiceReviews\Pages\ListServiceReviews;
use App\Filament\Resources\ServiceReviews\Schemas\ServiceReviewForm;
use App\Filament\Resources\ServiceReviews\Tables\ServiceReviewsTable;
use App\Models\ServiceReview;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class ServiceReviewResource extends Resource
{
    protected static ?string $model = ServiceReview::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedStar;

    protected static string|\UnitEnum|null $navigationGroup = 'İçerik';

    protected static ?string $navigationLabel = 'Yorumlar';

    protected static ?int $navigationSort = 7;

    protected static ?string $modelLabel = 'Yorum';

    protected static ?string $pluralModelLabel = 'Yorumlar';

    public static function form(Schema $schema): Schema
    {
        return ServiceReviewForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ServiceReviewsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListServiceReviews::route('/'),
            'create' => CreateServiceReview::route('/create'),
            'edit' => EditServiceReview::route('/{record}/edit'),
        ];
    }
}
