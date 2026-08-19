<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Support\AppNotifications;
use App\Support\Loyalty;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeController extends Controller
{
    public function __invoke(Request $request, Loyalty $loyalty, AppNotifications $notifications): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data' => [
                'user' => $user->toAppApiArray(),
                'loyalty' => $loyalty->for($user),
                // Rozet uygulama açılışında ve her yenilemede buradan besleniyor.
                'unread_notifications' => $notifications->unreadCount($user),
            ],
        ]);
    }
}
