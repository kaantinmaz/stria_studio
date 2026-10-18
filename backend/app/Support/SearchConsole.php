<?php

namespace App\Support;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Google Search Console Search Analytics istemcisi (servis hesabı JWT, ek
 * composer bağımlılığı yok). Dönem kimliği: pencere bitiş gününün ISO haftası,
 * "YYYYWww" (7 karakter, search_queries.period'a sığar).
 *
 * NOT: Eski CSV dönemleri "YYYY-MM". '-' (0x2D) < 'W' (0x57) olduğundan aynı
 * yıl içinde max('period') haftalık dönemi seçer; PlanContent/WriteBlogPost
 * değişmeden en yeni haftalık veriyle çalışır.
 */
final class SearchConsole
{
    /**
     * Son tam pencere: bitiş = bugün - lag_days, başlangıç = bitiş - (window_days - 1).
     *
     * @return array{start: CarbonImmutable, end: CarbonImmutable}
     */
    public static function window(?CarbonInterface $now = null): array
    {
        $end = CarbonImmutable::parse($now ?? now())->startOfDay()->subDays((int) config('seo.gsc.lag_days', 3));
        $start = $end->subDays((int) config('seo.gsc.window_days', 28) - 1);

        return ['start' => $start, 'end' => $end];
    }

    /** Pencere bitişinin ISO haftası, ör. "2026W42". */
    public static function periodFor(CarbonInterface $end): string
    {
        return $end->format('o\WW');
    }

    public static function currentPeriod(?CarbonInterface $now = null): string
    {
        return self::periodFor(self::window($now)['end']);
    }

    /** Search Analytics API'nin istek başına en fazla satır sayısı. */
    private const ROW_LIMIT = 25000;

    /**
     * Search Analytics satırları; ROW_LIMIT dolu döndükçe startRow ilerletilir.
     *
     * @param  list<string>  $dimensions
     * @return list<array{keys: list<string>, clicks: int|float, impressions: int|float, ctr: float, position: float}>
     */
    public function query(CarbonInterface $start, CarbonInterface $end, array $dimensions): array
    {
        $url = 'https://searchconsole.googleapis.com/webmasters/v3/sites/'
            .rawurlencode((string) config('seo.gsc.site_url')).'/searchAnalytics/query';
        $token = $this->accessToken();
        $rows = [];
        $startRow = 0;

        do {
            $response = Http::withToken($token)->timeout(60)->post($url, [
                'startDate' => $start->format('Y-m-d'),
                'endDate' => $end->format('Y-m-d'),
                'dimensions' => $dimensions,
                'rowLimit' => self::ROW_LIMIT,
                'startRow' => $startRow,
                'dataState' => 'final',
            ]);

            if (! $response->successful()) {
                throw new RuntimeException('Search Console sorgusu başarısız (HTTP '.$response->status().'): '.$response->body());
            }

            $page = (array) $response->json('rows', []);
            array_push($rows, ...$page);
            $startRow += self::ROW_LIMIT;
        } while (count($page) === self::ROW_LIMIT);

        return $rows;
    }

    /**
     * Servis hesabı JWT'si (RS256) ile OAuth erişim belirteci alır; süresi
     * dolmadan 60 sn önceye kadar önbellekte tutulur.
     */
    private function accessToken(): string
    {
        $path = (string) config('seo.gsc.credentials');
        $json = is_file($path) && is_readable($path) ? json_decode((string) file_get_contents($path), true) : null;

        if (! is_array($json) || blank($json['client_email'] ?? null) || blank($json['private_key'] ?? null)) {
            throw new RuntimeException('Search Console servis hesabı anahtarı okunamadı veya eksik: '.$path);
        }

        $cacheKey = 'seo.gsc.token.'.md5($json['client_email']);
        if (is_string($cached = Cache::get($cacheKey))) {
            return $cached;
        }

        $tokenUri = $json['token_uri'] ?? 'https://oauth2.googleapis.com/token';
        $now = time();
        $segments = [
            self::base64url(json_encode(['alg' => 'RS256', 'typ' => 'JWT'])),
            self::base64url(json_encode([
                'iss' => $json['client_email'],
                'scope' => 'https://www.googleapis.com/auth/webmasters.readonly',
                'aud' => $tokenUri,
                'iat' => $now,
                'exp' => $now + 3600,
            ])),
        ];

        $key = openssl_pkey_get_private($json['private_key']);
        if ($key === false || ! openssl_sign(implode('.', $segments), $signature, $key, OPENSSL_ALGO_SHA256)) {
            throw new RuntimeException('Search Console servis hesabı özel anahtarı geçersiz.');
        }
        $segments[] = self::base64url($signature);

        $response = Http::asForm()->timeout(20)->post($tokenUri, [
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => implode('.', $segments),
        ]);

        if (! $response->successful() || blank($response->json('access_token'))) {
            throw new RuntimeException('Search Console erişim belirteci alınamadı (HTTP '.$response->status().'): '.$response->body());
        }

        $token = (string) $response->json('access_token');
        Cache::put($cacheKey, $token, max(1, (int) $response->json('expires_in', 3600) - 60));

        return $token;
    }

    private static function base64url(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
