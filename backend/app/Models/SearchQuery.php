<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SearchQuery extends Model
{
    use HasFactory;

    protected $fillable = [
        'query',
        'clicks',
        'impressions',
        'ctr',
        'position',
        'period',
    ];

    protected $casts = [
        'clicks' => 'integer',
        'impressions' => 'integer',
        'ctr' => 'decimal:4',
        'position' => 'decimal:2',
    ];

    /**
     * En güncel dönemin (max period) satırları.
     */
    public function scopeLatestPeriod(Builder $query): Builder
    {
        return $query->where('period', static::max('period'));
    }

    /**
     * Fırsat sıralaması: en çok gösterim alan sorgular önce.
     */
    public function scopeOpportunity(Builder $query): Builder
    {
        return $query->orderByDesc('impressions');
    }
}
