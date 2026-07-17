<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'nth',
        'discount_percent',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'nth' => 'integer',
            'discount_percent' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
