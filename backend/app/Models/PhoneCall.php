<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Santralden (Netgsm Netsantral) gelen tek bir çağrı kaydı. */
class PhoneCall extends Model
{
    protected $fillable = [
        'unique_id', 'direction', 'customer_phone', 'line', 'destination',
        'started_at', 'duration', 'status', 'recording_url', 'touchpoint_id', 'customer_id',
    ];

    protected function casts(): array
    {
        return ['started_at' => 'datetime'];
    }

    public function touchpoint(): BelongsTo
    {
        return $this->belongsTo(Touchpoint::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
