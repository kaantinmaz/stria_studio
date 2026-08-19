<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdsDailyKeyword extends Model
{
    protected $fillable = [
        'date',
        'campaign_name',
        'ad_group_name',
        'keyword',
        'match_type',
        'keyword_hash',
        'cost',
        'impressions',
        'clicks',
        'conversions',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'cost' => 'decimal:2',
            'impressions' => 'integer',
            'clicks' => 'integer',
            'conversions' => 'decimal:2',
        ];
    }
}
