<?php

namespace App\Filament\Resources\ServiceReviews\Pages;

use App\Filament\Resources\ServiceReviews\ServiceReviewResource;
use Filament\Resources\Pages\CreateRecord;

class CreateServiceReview extends CreateRecord
{
    protected static string $resource = ServiceReviewResource::class;
}
