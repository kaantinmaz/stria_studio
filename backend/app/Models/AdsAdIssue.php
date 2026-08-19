<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdsAdIssue extends Model
{
    protected $fillable = [
        'date',
        'campaign_name',
        'ad_group_name',
        'policy_status',
        'reason',
        'issue_hash',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }
}
