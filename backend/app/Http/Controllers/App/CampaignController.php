<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use Illuminate\Http\JsonResponse;

class CampaignController extends Controller
{
    public function index(): JsonResponse
    {
        $campaigns = Campaign::query()
            ->where('is_active', true)
            ->orderBy('id')
            ->get(['title', 'nth', 'discount_percent'])
            ->map(fn (Campaign $campaign): array => [
                'title' => $campaign->title,
                'nth' => $campaign->nth,
                'discount_percent' => $campaign->discount_percent,
            ]);

        return response()->json(['data' => $campaigns]);
    }
}
