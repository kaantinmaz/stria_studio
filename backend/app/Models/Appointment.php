<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'app_user_id',
        'service_id',
        'campaign_id',
        'starts_at',
        'duration_min',
        'price',
        'is_paid',
        'payment_method',
        'note',
        'status',
        'photos',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'price' => 'decimal:2',
            'is_paid' => 'boolean',
            'photos' => 'array',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function appUser(): BelongsTo
    {
        return $this->belongsTo(AppUser::class);
    }
}
