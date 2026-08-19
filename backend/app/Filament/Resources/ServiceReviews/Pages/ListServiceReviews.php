<?php

namespace App\Filament\Resources\ServiceReviews\Pages;

use App\Filament\Resources\ServiceReviews\ServiceReviewResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListServiceReviews extends ListRecords
{
    protected static string $resource = ServiceReviewResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
