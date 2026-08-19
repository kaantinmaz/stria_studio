<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdsIngestRun extends Model
{
    protected $fillable = [
        'date',
        'campaigns',
        'keywords',
        'search_terms',
        'ad_issues',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'campaigns' => 'integer',
            'keywords' => 'integer',
            'search_terms' => 'integer',
            'ad_issues' => 'integer',
        ];
    }
}
