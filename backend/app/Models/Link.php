<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Link extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}
