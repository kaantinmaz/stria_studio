<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Filament\Facades\Filament;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Müşteri paneline yalnızca Filament admin paneline erişebilen kullanıcılar
 * (User::canAccessPanel) web oturum guard'ıyla girebilir. Giriş yapmamış
 * ziyaretçi /giris'e yönlendirilir; yetkisi olmayan kullanıcı oturumdan atılır.
 */
class MusteriAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::guard('web')->user();

        if (! $user instanceof User || ! $user->canAccessPanel(Filament::getPanel('admin'))) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('musteri.login');
        }

        return $next($request);
    }
}
