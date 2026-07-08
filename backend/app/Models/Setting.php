<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'hours' => 'array',
        'lat' => 'decimal:7',
        'lng' => 'decimal:7',
    ];

    public static function current(): self
    {
        return static::firstOrCreate(['id' => 1]);
    }
}
