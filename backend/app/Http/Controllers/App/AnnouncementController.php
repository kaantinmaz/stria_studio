<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;

class AnnouncementController extends Controller
{
    public function index(): JsonResponse
    {
        $today = now()->toDateString();

        $announcements = Announcement::query()
            ->where('is_active', true)
            ->where(function ($query) use ($today): void {
                $query->whereNull('starts_at')->orWhereDate('starts_at', '<=', $today);
            })
            ->where(function ($query) use ($today): void {
                $query->whereNull('ends_at')->orWhereDate('ends_at', '>=', $today);
            })
            ->orderByDesc('id')
            ->get()
            ->map(fn (Announcement $announcement): array => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'body' => $announcement->body,
                'starts_at' => $announcement->starts_at?->toDateString(),
                'ends_at' => $announcement->ends_at?->toDateString(),
                'created_at' => $announcement->created_at?->toIso8601String(),
            ]);

        return response()->json(['data' => $announcements]);
    }
}
