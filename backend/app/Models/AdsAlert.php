<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdsAlert extends Model
{
    protected $fillable = [
        'detected_on',
        'code',
        'severity',
        'campaign_name',
        'message',
        'context',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            // date:Y-m-d: kolonu saat kısmı olmadan saklar; watchdog'un
            // updateOrCreate(detected_on, ...) eşleşmesi sqlite'ta da idempotent kalır.
            'detected_on' => 'date:Y-m-d',
            'context' => 'array',
            'resolved_at' => 'datetime',
        ];
    }
}
