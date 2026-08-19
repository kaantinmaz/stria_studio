<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class ChatConversation extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'messages' => 'array',
        'summarized_at' => 'datetime',
        'last_message_at' => 'datetime',
    ];

    /** Sohbeti bitmiş sayıp özetlenecek konuşmalar: son mesajdan beri sessiz ve özeti güncel değil. */
    public function scopeAwaitingSummary(Builder $query, int $idleMinutes = 15): Builder
    {
        return $query
            ->whereNull('summarized_at')
            ->where('last_message_at', '<=', now()->subMinutes($idleMinutes))
            ->orderBy('last_message_at');
    }

    /** Listede tek satırda gösterilecek ilk ziyaretçi mesajı. */
    public function firstUserMessage(): ?string
    {
        foreach ($this->messages ?? [] as $message) {
            if (($message['role'] ?? null) === 'user' && filled($message['content'] ?? null)) {
                return (string) $message['content'];
            }
        }

        return null;
    }

    /** Kaynağın panelde gösterilen adı. */
    public function sourceLabel(): string
    {
        return match ($this->source) {
            'engage' => 'Etkileşim paneli',
            default => 'Site sohbeti',
        };
    }

    /** Dökümü panelde okunur düz metne çevirir. */
    public function transcript(): string
    {
        return collect($this->messages ?? [])
            ->map(fn (array $message): string => sprintf(
                '%s: %s',
                ($message['role'] ?? null) === 'user' ? 'Ziyaretçi' : 'Asistan',
                trim((string) ($message['content'] ?? '')),
            ))
            ->implode("\n\n");
    }
}
