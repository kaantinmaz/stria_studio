<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Telegram'a HTML mesaj gönderir. Yapılandırma yoksa sessizce atlar; sessiz
 * arıza mesajın hiç ulaşmamasından daha kötü olduğu için başarısızlık
 * laravel.log'a yazılır.
 */
final class TelegramNotifier
{
    /** Telegram yapılandırılmamış — hata değil, atlanan gönderim. */
    public const NOT_CONFIGURED = 'not-configured';

    /**
     * @param  string  $context  Log kaydında görünecek çağıran adı
     * @return int|string|null Başarılıysa message_id, yapılandırma yoksa
     *                         self::NOT_CONFIGURED, başarısızsa null.
     */
    public function send(string $text, string $context = 'telegram'): int|string|null
    {
        $token = config('services.telegram.bot_token');
        $chatId = config('services.telegram.chat_id');

        if (empty($token) || empty($chatId)) {
            return self::NOT_CONFIGURED;
        }

        // parse_mode HTML: yalnızca çağıranın eklediği <b> etiketleri ham kalır,
        // dinamik değerler çağıran tarafında kaçırılmalıdır.
        try {
            $response = Http::timeout(15)->asForm()->post(
                "https://api.telegram.org/bot{$token}/sendMessage",
                [
                    'chat_id' => $chatId,
                    'text' => $text,
                    'parse_mode' => 'HTML',
                    'disable_web_page_preview' => true,
                ]
            );
        } catch (Throwable $e) {
            Log::error("{$context}: Telegram gönderimi hata verdi.", ['exception' => $e->getMessage()]);

            return null;
        }

        $messageId = $response->json('result.message_id');

        if (! $response->successful() || $response->json('ok') !== true || $messageId === null) {
            Log::error("{$context}: Telegram gönderimi reddedildi.", [
                'status' => $response->status(),
                // Telegram hata nedenini burada döndürür (ör. chat not found).
                'description' => $response->json('description'),
            ]);

            return null;
        }

        return $messageId;
    }
}
