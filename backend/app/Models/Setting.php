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
        'campaign_enabled' => 'boolean',
        'popup_enabled' => 'boolean',
    ];

    // Settings row for a given site slug; NULL = the main site. Each microsite has
    // its own row (see the add_site_to_settings migration).
    public static function forSite(?string $site = null): self
    {
        return static::firstOrCreate(['site' => $site]);
    }

    public static function current(): self
    {
        return static::forSite(null);
    }
}
