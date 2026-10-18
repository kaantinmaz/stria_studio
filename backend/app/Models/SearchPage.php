<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SearchPage extends Model
{
    protected $fillable = ['page', 'clicks', 'impressions', 'ctr', 'position', 'period'];

    protected $casts = [
        'clicks' => 'integer',
        'impressions' => 'integer',
        'ctr' => 'decimal:4',
        'position' => 'decimal:2',
    ];
}
