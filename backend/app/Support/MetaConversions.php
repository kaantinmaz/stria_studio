<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Meta Dönüşümler API'si (CAPI). Tarayıcıdaki Pixel olayının sunucu kopyasını
 * gönderir; ikisi aynı `event_id`'yi taşıdığı için Meta tek dönüşüm sayar.
 *
 * Kurallar (Pixel ile aynı): yalnız çerez onayı veren ziyaretçi için ve kamuflaj
 * (sağlığa yakın) sayfalarından HİÇBİR şey gönderilmez. Kişisel veri yalnız
 * SHA-256 özetiyle gider (Meta'nın zorunlu kıldığı biçim).
 */
final class MetaConversions
{
    private const GRAPH = 'https://graph.facebook.com/v23.0';

    private const KAMUFLAJ_PREFIX = '/hizmetler/kamuflaj-makyaj';

    /** İstemciden gelen `meta` bloğunun doğrulama kuralları. */
    public static function rules(): array
    {
        return [
            'meta' => ['nullable', 'array'],
            'meta.event_id' => ['nullable', 'string', 'max:64'],
            'meta.consent' => ['nullable', 'boolean'],
            'meta.fbp' => ['nullable', 'string', 'max:255'],
            'meta.fbc' => ['nullable', 'string', 'max:255'],
            'meta.url' => ['nullable', 'string', 'max:1024'],
        ];
    }

    /**
     * Gönderilecekse olayı yanıt döndükten sonra yollar (ziyaretçi beklemez).
     *
     * @param  array<string, mixed>|null  $meta  İstemci bloğu (event_id, consent, fbp, fbc, url)
     * @param  array{email?: ?string, phone?: ?string}  $person
     * @param  array<string, mixed>  $custom
     */
    public function dispatch(string $eventName, ?array $meta, Request $request, array $person = [], array $custom = []): bool
    {
        $payload = $this->payload($eventName, $meta, $request->ip(), (string) $request->userAgent(), $person, $custom);
        if ($payload === null) {
            return false;
        }

        \Illuminate\Support\defer(fn () => $this->post($payload));

        return true;
    }

    /**
     * Olay gövdesi; gönderilmemesi gerekiyorsa null.
     *
     * @return array<string, mixed>|null
     */
    public function payload(string $eventName, ?array $meta, ?string $ip, string $userAgent, array $person = [], array $custom = []): ?array
    {
        if (empty(config('services.meta.capi_token')) || empty(config('services.meta.pixel_id'))) {
            return null;
        }
        if (! ($meta['consent'] ?? false) || empty($meta['event_id'])) {
            return null;
        }
        $url = (string) ($meta['url'] ?? '');
        $path = (string) parse_url($url, PHP_URL_PATH);
        if (str_starts_with($path, self::KAMUFLAJ_PREFIX)) {
            return null;
        }

        $userData = array_filter([
            'client_ip_address' => $ip,
            'client_user_agent' => $userAgent,
            'fbp' => $meta['fbp'] ?? null,
            'fbc' => $meta['fbc'] ?? null,
            'em' => self::hashEmail($person['email'] ?? null),
            'ph' => self::hashPhone($person['phone'] ?? null),
        ]);

        $event = array_filter([
            'event_name' => $eventName,
            'event_time' => time(),
            'event_id' => $meta['event_id'],
            'action_source' => 'website',
            'event_source_url' => $url ?: null,
            'user_data' => $userData,
            'custom_data' => $custom ?: null,
        ]);

        return array_filter([
            'data' => [$event],
            'test_event_code' => config('services.meta.test_event_code') ?: null,
        ]);
    }

    /** @param  array<string, mixed>  $payload */
    private function post(array $payload): void
    {
        $pixel = config('services.meta.pixel_id');
        try {
            $response = Http::timeout(10)->post(self::GRAPH."/{$pixel}/events", $payload + [
                'access_token' => config('services.meta.capi_token'),
            ]);
        } catch (Throwable $e) {
            Log::error('meta-capi: gönderim hata verdi.', ['exception' => $e->getMessage()]);

            return;
        }
        if (! $response->successful()) {
            Log::error('meta-capi: gönderim reddedildi.', [
                'status' => $response->status(),
                'error' => $response->json('error.message'),
            ]);
        }
    }

    private static function hashEmail(?string $email): ?array
    {
        $email = strtolower(trim((string) $email));

        return $email === '' ? null : [hash('sha256', $email)];
    }

    /** Meta biçimi: yalnız rakam, ülke koduyla. Yerel TR numarası (0…) 90'la başlatılır. */
    private static function hashPhone(?string $phone): ?array
    {
        $digits = preg_replace('/\D+/', '', (string) $phone);
        if ($digits === '') {
            return null;
        }
        if (str_starts_with($digits, '0')) {
            $digits = '90'.substr($digits, 1);
        } elseif (strlen($digits) === 10) {
            $digits = '90'.$digits;
        }

        return [hash('sha256', $digits)];
    }
}
