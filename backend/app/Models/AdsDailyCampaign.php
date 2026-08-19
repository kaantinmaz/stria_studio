<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdsDailyCampaign extends Model
{
    protected $fillable = [
        'date',
        'campaign_name',
        'status',
        'campaign_type',
        'cost',
        'impressions',
        'clicks',
        'conversions',
        'conversion_value',
        'average_cpc',
        'search_impression_share',
        'budget_lost_impression_share',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'cost' => 'decimal:2',
            'impressions' => 'integer',
            'clicks' => 'integer',
            'conversions' => 'decimal:2',
            'conversion_value' => 'decimal:2',
            'average_cpc' => 'decimal:2',
            'search_impression_share' => 'decimal:4',
            'budget_lost_impression_share' => 'decimal:4',
        ];
    }
}
