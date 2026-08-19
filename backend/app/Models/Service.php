<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'is_active' => 'boolean',
        'keywords_tr' => 'array',
        'keywords_en' => 'array',
        'benefits_tr' => 'array',
        'benefits_en' => 'array',
        'process_tr' => 'array',
        'process_en' => 'array',
        'faq_tr' => 'array',
        'faq_en' => 'array',
        'subservices_tr' => 'array',
        'hero_images' => 'array',
        'gallery' => 'array',
        'gallery_updated_at' => 'datetime',
        'related' => 'array',
    ];

    protected static function booted(): void
    {
        static::saving(function (Service $service): void {
            $service->keepStaticAssets();
        });

        static::saving(function (Service $service): void {
            $oldSubserviceGalleries = collect($service->getOriginal('subservices_tr') ?? [])
                ->pluck('gallery')
                ->filter()
                ->values()
                ->all();
            $newSubserviceGalleries = collect($service->subservices_tr ?? [])
                ->pluck('gallery')
                ->filter()
                ->values()
                ->all();

            if ($service->isDirty('gallery') || $oldSubserviceGalleries !== $newSubserviceGalleries) {
                $service->gallery_updated_at = now();
            }
        });
    }

    /**
     * `image`, `hero_images` ve `gallery` iki tür değer taşıyor: panelden
     * yüklenen dosyalar ("services/x.png") ve frontend'in statik varlıkları
     * ("/images/micro.png"). Filament FileUpload ikincisini public diskte
     * bulamadığı için alan boş hidratlanıyor ve form kaydedilince değer
     * sessizce siliniyordu. Boş gelen değer statik bir yolu eziyorsa eskisini
     * koruyoruz; yeni dosya yüklemek yine değiştiriyor.
     */
    private function keepStaticAssets(): void
    {
        foreach (['image', 'hero_images', 'gallery'] as $column) {
            if (filled($this->{$column})) {
                continue;
            }

            $original = $this->getOriginal($column);
            $first = is_array($original) ? ($original[0] ?? null) : $original;

            if (is_string($first) && str_starts_with($first, '/')) {
                $this->{$column} = $original;
            }
        }
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ServiceReview::class);
    }
}
