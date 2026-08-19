<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstagramPost extends Model
{
    use HasFactory;

    protected $guarded = ['id'];
    protected $casts = ['posted_at' => 'datetime'];

    public function scopeLatestFirst(Builder $query): Builder
    {
        return $query->orderByDesc('posted_at');
    }
}
