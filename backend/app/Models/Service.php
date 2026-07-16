<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'is_active' => 'boolean',
        'keywords_tr' => 'array',
        'keywords_en' => 'array',
        'benefits_tr' => 'array',
        'benefits_en' => 'array',
        'process_tr' => 'array',
        'process_en' => 'array',
        'faq_tr' => 'array',
        'faq_en' => 'array',
        'subservices_tr' => 'array',
        'hero_images' => 'array',
        'gallery' => 'array',
        'related' => 'array',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}
