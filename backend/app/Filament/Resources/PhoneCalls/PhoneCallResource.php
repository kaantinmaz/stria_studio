<?php

namespace App\Filament\Resources\PhoneCalls;

use App\Filament\Resources\PhoneCalls\Pages\ListPhoneCalls;
use App\Filament\Resources\PhoneCalls\Tables\PhoneCallsTable;
use App\Models\PhoneCall;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

/** Santral çağrı listesi — yalnız okuma; kayıtları Netgsm yazar. */
class PhoneCallResource extends Resource
{
    protected static ?string $model = PhoneCall::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedPhone;

    protected static ?string $navigationLabel = 'Aramalar';

    protected static ?int $navigationSort = 3;

    protected static ?string $modelLabel = 'Arama';

    protected static ?string $pluralModelLabel = 'Aramalar';

    public static function table(Table $table): Table
    {
        return PhoneCallsTable::configure($table);
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function getPages(): array
    {
        return [
            'index' => ListPhoneCalls::route('/'),
        ];
    }
}
