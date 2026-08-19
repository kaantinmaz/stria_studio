<?php

namespace App\Filament\Resources\ServiceReviews\Pages;

use App\Filament\Resources\ServiceReviews\ServiceReviewResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditServiceReview extends EditRecord
{
    protected static string $resource = ServiceReviewResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
