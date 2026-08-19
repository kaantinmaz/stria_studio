<?php

namespace App\Filament\Resources\ChatConversations;

use App\Filament\Resources\ChatConversations\Pages\ListChatConversations;
use App\Filament\Resources\ChatConversations\Schemas\ChatConversationInfolist;
use App\Filament\Resources\ChatConversations\Tables\ChatConversationsTable;
use App\Models\ChatConversation;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

/**
 * Sitedeki chatbot konuşmalarının kaydı. CRUD değil: satırlar ziyaretçi
 * sohbetlerinden oluşur, panelde özet olarak listelenir ve tam döküm
 * görüntülenir. Özet metni chat:summarize komutu üretir.
 */
class ChatConversationResource extends Resource
{
    protected static ?string $model = ChatConversation::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedChatBubbleLeftRight;

    protected static ?string $navigationLabel = 'Sohbetler';

    protected static ?int $navigationSort = 5;

    protected static ?string $modelLabel = 'sohbet';

    protected static ?string $pluralModelLabel = 'Sohbetler';

    public static function table(Table $table): Table
    {
        return ChatConversationsTable::configure($table);
    }

    public static function infolist(Schema $schema): Schema
    {
        return ChatConversationInfolist::configure($schema);
    }

    /** Bugün gelen sohbet sayısı — panelde gözden kaçmasın. */
    public static function getNavigationBadge(): ?string
    {
        $count = ChatConversation::query()
            ->whereDate('last_message_at', today())
            ->count();

        return $count > 0 ? (string) $count : null;
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function getPages(): array
    {
        return [
            'index' => ListChatConversations::route('/'),
        ];
    }
}
