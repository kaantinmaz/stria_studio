<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class CampaignController extends Controller
{
    public function index(): JsonResponse
    {
        $today = now()->toDateString();

        $campaigns = Campaign::query()
            ->where('is_active', true)
            ->where(function ($query) use ($today): void {
                $query->whereNull('starts_at')->orWhereDate('starts_at', '<=', $today);
            })
            ->where(function ($query) use ($today): void {
                $query->whereNull('ends_at')->orWhereDate('ends_at', '>=', $today);
            })
            ->orderByRaw("CASE WHEN kind = 'promo' THEN 0 ELSE 1 END")
            ->orderBy('id')
            ->get()
            ->map(fn (Campaign $campaign): array => [
                'id' => $campaign->id,
                'kind' => $campaign->kind,
                'title' => $campaign->title,
                'description' => $campaign->description,
                'image' => self::imageUrl($campaign->image),
                'nth' => $campaign->nth,
                'discount_percent' => $campaign->discount_percent,
                'old_price' => $campaign->old_price !== null ? (string) $campaign->old_price : null,
                'new_price' => $campaign->new_price !== null ? (string) $campaign->new_price : null,
                'starts_at' => $campaign->starts_at?->toDateString(),
                'ends_at' => $campaign->ends_at?->toDateString(),
                'service_slugs' => self::serviceSlugs($campaign->service_ids),
            ]);

        return response()->json(['data' => $campaigns]);
    }

    private static function imageUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return Str::startsWith($path, ['http://', 'https://', '/'])
            ? $path
            : asset('storage/'.$path);
    }

    /**
     * @param  array<int, int>|null  $serviceIds
     * @return array<int, string>|null
     */
    private static function serviceSlugs(?array $serviceIds): ?array
    {
        if (empty($serviceIds)) {
            return null;
        }

        $slugs = Service::query()
            ->whereIn('id', $serviceIds)
            ->pluck('slug')
            ->values()
            ->all();

        return $slugs === [] ? null : $slugs;
    }
}
