<?php

namespace App\Filament\Resources\ChatConversations\Schemas;

use App\Models\ChatConversation;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;
use Illuminate\Support\HtmlString;

class ChatConversationInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            TextEntry::make('summary')
                ->label('Özet')
                ->placeholder('Henüz özetlenmedi')
                ->formatStateUsing(fn (string $state): HtmlString => self::asLines($state))
                ->html()
                ->columnSpanFull(),
            TextEntry::make('source')
                ->label('Kaynak')
                ->badge()
                ->state(fn (ChatConversation $record): string => $record->sourceLabel()),
            TextEntry::make('site')
                ->label('Site')
                ->placeholder('Ana site'),
            TextEntry::make('message_count')
                ->label('Mesaj sayısı'),
            TextEntry::make('last_message_at')
                ->label('Son mesaj')
                ->dateTime('d.m.Y H:i'),
            TextEntry::make('transcript')
                ->label('Döküm')
                ->state(fn (ChatConversation $record): HtmlString => self::asLines($record->transcript()))
                ->html()
                ->columnSpanFull(),
        ]);
    }

    /** Satır sonlarını panelde koruyarak güvenli HTML'e çevirir. */
    private static function asLines(string $text): HtmlString
    {
        return new HtmlString(nl2br(e($text)));
    }
}
