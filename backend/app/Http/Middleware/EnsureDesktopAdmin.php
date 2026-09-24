<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Filament\Facades\Filament;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class EnsureDesktopAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $token = $user?->currentAccessToken();

        // Sanctum also accepts the web guard and supplies a TransientToken. The
        // desktop API deliberately requires a revocable bearer token instead.
        if (! $user instanceof User || ! $token instanceof PersonalAccessToken) {
            return $this->unauthorized();
        }

        if ($token->expires_at?->isPast()) {
            return $this->unauthorized();
        }

        if (! $token->can('desktop:manage') || ! $user->canAccessPanel(Filament::getPanel('admin'))) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return $next($request);
    }

    private function unauthorized(): JsonResponse
    {
        return response()->json(['message' => 'Unauthenticated.'], 401);
    }
}
