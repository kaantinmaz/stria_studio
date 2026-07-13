<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminApiToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $configuredToken = config('services.admin_api.token');
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
