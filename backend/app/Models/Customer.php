<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Support\Attribution;

class Customer extends Model
{
    use HasFactory;

    /** "Bizi nereden buldunuz?" seçenekleri (anahtar → panel etiketi). */
    public const HEARD_FROM = [
        'google' => 'Google arama / Haritalar',
        'instagram' => 'Instagram',
        'facebook' => 'Facebook',
        'tavsiye' => 'Tavsiye / arkadaş',
        'yoldan' => 'Yoldan geçerken',
        'eski_musteri' => 'Eski müşteri',
        'diger' => 'Diğer',
    ];

    protected $fillable = [
        'name',
        'app_user_id',
        'touchpoint_id',
        'heard_from',
        'phone',
        'email',
        'instagram',
        'notes',
        'photos',
    ];

    protected function casts(): array
    {
        return [
            'photos' => 'array',
        ];
    }

    protected static function booted(): void
    {
        // Formdan aynı telefonla gelmiş bir reklam tıklaması varsa otomatik bağla.
        static::saving(fn (Customer $customer) => Attribution::autoLink($customer));
    }

    public function touchpoint(): BelongsTo
    {
        return $this->belongsTo(Touchpoint::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function appUser(): BelongsTo
    {
        return $this->belongsTo(AppUser::class);
    }
}
