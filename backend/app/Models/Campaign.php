<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'kind',
        'description',
        'image',
        'nth',
        'discount_percent',
        'is_active',
        'starts_at',
        'ends_at',
        'old_price',
        'new_price',
        'service_ids',
    ];

    protected function casts(): array
    {
        return [
            'nth' => 'integer',
            'discount_percent' => 'integer',
            'is_active' => 'boolean',
            'starts_at' => 'date',
            'ends_at' => 'date',
            'old_price' => 'decimal:2',
            'new_price' => 'decimal:2',
            'service_ids' => 'array',
        ];
    }
}
