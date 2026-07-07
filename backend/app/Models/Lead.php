<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    protected $fillable = [
        'name', 'phone', 'email', 'service', 'preferred_date', 'message', 'locale',
    ];

    protected $casts = [
        'preferred_date' => 'date',
    ];
}
