<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SerpResult extends Model
{
    protected $fillable = [
        'query', 'period', 'own_position', 'own_url', 'top_results',
        'people_also_ask', 'related_searches', 'answer_box', 'places', 'credits',
    ];

    protected $casts = [
        'own_position' => 'integer',
        'top_results' => 'array',
        'people_also_ask' => 'array',
        'related_searches' => 'array',
        'answer_box' => 'array',
        'places' => 'array',
        'credits' => 'integer',
    ];
}
