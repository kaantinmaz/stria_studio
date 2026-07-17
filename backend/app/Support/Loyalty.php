<?php

namespace App\Support;

use App\Models\AppUser;
use App\Models\Campaign;

class Loyalty
{
    /**
     * @return array<string, mixed>|null
     */
    public function for(AppUser $user): ?array
    {
        $campaign = Campaign::query()
            ->where('is_active', true)
            ->orderBy('id')
            ->first();
        $customer = $user->customer()->first();

        if (! $campaign || ! $customer || $campaign->nth < 1) {
            return null;
        }

        $completedCount = $customer->appointments()
            ->where('status', 'confirmed')
            ->where('starts_at', '<', now())
            ->count();
        $progress = $completedCount % $campaign->nth;

        return [
            'campaign_title' => $campaign->title,
            'nth' => $campaign->nth,
            'discount_percent' => $campaign->discount_percent,
            'completed_count' => $completedCount,
            'progress' => $progress,
            'remaining' => $campaign->nth - $progress,
            'reward_next' => $progress === $campaign->nth - 1,
        ];
    }
}
