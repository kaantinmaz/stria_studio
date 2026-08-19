<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Support\AppNotifications;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request, AppNotifications $notifications): JsonResponse
    {
        $items = $notifications->forUser($request->user());

        return response()->json([
            'data' => [
                'unread' => collect($items)->where('is_new', true)->count(),
                'items' => $items,
            ],
        ]);
    }

    /**
     * Liste açıldığında çağrılır: bu andan öncesi okundu sayılır.
     */
    public function seen(Request $request): JsonResponse
    {
        $request->user()->forceFill(['notifications_seen_at' => now()])->save();

        return response()->json(['data' => ['unread' => 0]]);
    }
}
