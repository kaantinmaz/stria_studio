<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminApiToken
{
    /**
     * Kapsam → config anahtarı. Her entegrasyonun kendi token'ı var: blog
     * yayınlama token'ı yazı silebiliyor, bu yüzden Google Ads arayüzüne
     * yapıştırılan ingest token'ıyla aynı olamaz.
     *
     * @var array<string, string>
     */
    private const TOKEN_CONFIG = [
        'posts' => 'services.admin_api.token',
        'ads' => 'services.admin_api.ads_token',
    ];

    public function handle(Request $request, Closure $next, string $scope = 'posts'): Response
    {
        $configuredToken = config(self::TOKEN_CONFIG[$scope] ?? '');
        $providedToken = $request->bearerToken();

        if (! is_string($configuredToken)
            || trim($configuredToken) === ''
            || ! is_string($providedToken)
            || ! hash_equals($configuredToken, $providedToken)) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        return $next($request);
    }
}
