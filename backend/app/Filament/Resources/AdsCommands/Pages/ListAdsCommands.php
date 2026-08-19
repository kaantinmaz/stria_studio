<?php

namespace App\Filament\Resources\AdsCommands\Pages;

use App\Filament\Resources\AdsCommands\AdsCommandResource;
use Filament\Resources\Pages\ListRecords;

class ListAdsCommands extends ListRecords
{
    protected static string $resource = AdsCommandResource::class;

    protected function getHeaderActions(): array
    {
        // Komut oluşturma yok: kuyruğu ajan/kural motoru doldurur.
        return [];
    }
}
