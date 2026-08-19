<?php

namespace App\Filament\Resources\AdsCommands;

use App\Filament\Resources\AdsCommands\Pages\ListAdsCommands;
use App\Filament\Resources\AdsCommands\Tables\AdsCommandsTable;
use App\Models\AdsCommand;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

/**
 * Google Ads komut kuyruğunun onay ekranı.
 *
 * CRUD değil: komutları ajan veya kural motoru üretir, buradan yalnızca
 * onaylanır/reddedilir. Elle komut yazımı bilinçli olarak kapalı — payload
 * şeması kind'e göre değişiyor ve hatalı bir el girişi doğrudan reklam
 * hesabına gider.
 */
class AdsCommandResource extends Resource
{
    protected static ?string $model = AdsCommand::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBolt;

    protected static ?string $navigationLabel = 'Ads Komutları';

    protected static string|\UnitEnum|null $navigationGroup = 'Reklam';

    protected static ?int $navigationSort = 20;

    protected static ?string $modelLabel = 'Ads komutu';

    protected static ?string $pluralModelLabel = 'Ads Komutları';

    public static function table(Table $table): Table
    {
        return AdsCommandsTable::configure($table);
    }

    /** Kenar çubuğunda bekleyen onay sayısı — gözden kaçmasın. */
    public static function getNavigationBadge(): ?string
    {
        $count = AdsCommand::query()
            ->where('tier', 'approval')
            ->where('status', 'pending')
            ->count();

        return $count > 0 ? (string) $count : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function getPages(): array
    {
        return [
            'index' => ListAdsCommands::route('/'),
        ];
    }
}
