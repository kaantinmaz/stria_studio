<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

class AppUser extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
    ];

    protected $hidden = [
        'password',
    ];

    protected static function booted(): void
    {
        static::creating(function (AppUser $user): void {
            $user->code = 'pending-'.Str::uuid();
        });

        static::saved(function (AppUser $user): void {
            if (str_starts_with($user->code, 'pending-')) {
                $user->code = 'S-'.(1000 + $user->id);
                $user->saveQuietly();
            }
        });
    }

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'notifications_seen_at' => 'datetime',
        ];
    }

    /**
     * E-postayı ASCII güvenli biçimde küçültür.
     *
     * `Str::lower`/`mb_strtolower` Türkçe "İ" harfini "i + birleşen nokta"ya
     * çevirip adresi sessizce bozuyor (İkinci@X → i̇kinci@x). Geçerli e-posta
     * adresleri ASCII olduğu için düz `strtolower` doğru davranıştır.
     */
    public static function normalizeEmail(?string $email): string
    {
        return strtolower(trim((string) $email));
    }

    public function customer(): HasOne
    {
        return $this->hasOne(Customer::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function toAppApiArray(): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            // QR ile açılan hesapta şifre yok; uygulama hangi formu göstereceğini
            // e-postanın boşluğundan tahmin etmek zorunda kalmasın.
            'has_password' => filled($this->password),
            'customer_linked' => $this->customer()->exists(),
        ];
    }
}
