<?php

namespace App\Support;

use App\Models\ChatConversation;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class ChatTranscript
{
    /** Tek satırda tutulan mesaj üst sınırı — uzun oturumlar row'u şişirmesin. */
    private const MAX_MESSAGES = 200;

    /**
     * Ziyaretçinin son mesajını ve asistanın yanıtını oturum satırına ekler.
     *
     * İstemci her istekte yalnızca son 12 mesajı gönderdiği için döküm
     * değiştirilmez, üzerine eklenir. Kayıt sohbeti bloklamaz: hata olursa
     * loglanır ve yanıt normal şekilde döner.
     *
     * @param  array<int, array{role: string, content: string}>  $messages  İstekle gelen pencere.
     */
    public function record(?string $sessionId, string $source, ?string $site, array $messages, string $reply): void
    {
        try {
            $conversation = filled($sessionId)
                ? ChatConversation::query()->firstWhere('session_id', $sessionId)
                : null;

            // Oturum kimliği yoksa (eski istemci) konuşma gruplanamaz; yine de
            // kaybetmemek için tek seferlik satır açılır.
            $stored = $conversation?->messages ?? [];

            $appended = $conversation === null
                ? $messages
                : array_slice($messages, -1);

            $stored = array_merge($stored, $this->normalize($appended), [
                ['role' => 'assistant', 'content' => $reply],
            ]);

            $stored = array_slice($stored, -self::MAX_MESSAGES);

            $attributes = [
                'source' => $source,
                'site' => $site,
                'messages' => $stored,
                'message_count' => count($stored),
                'last_message_at' => now(),
                // Yeni mesaj geldi: mevcut özet artık eksik, yeniden üretilecek.
                'summarized_at' => null,
            ];

            if ($conversation === null) {
                ChatConversation::query()->create([
                    'session_id' => $sessionId ?? (string) Str::uuid(),
                    ...$attributes,
                ]);

                return;
            }

            $conversation->update($attributes);
        } catch (Throwable $e) {
            Log::warning('chat transcript kaydedilemedi', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     * @return array<int, array{role: string, content: string}>
     */
    private function normalize(array $messages): array
    {
        return array_values(array_map(fn (array $message): array => [
            'role' => $message['role'],
            'content' => $message['content'],
        ], $messages));
    }
}
