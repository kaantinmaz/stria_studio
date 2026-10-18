<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ContentRevision extends Model
{
    protected $fillable = ['revisable_type', 'revisable_id', 'period', 'reason', 'before', 'after', 'reverted_at'];

    protected $casts = [
        'before' => 'array',
        'after' => 'array',
        'reverted_at' => 'datetime',
    ];

    public function revisable(): MorphTo
    {
        return $this->morphTo();
    }
}
