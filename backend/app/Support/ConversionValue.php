<?php

namespace App\Support;

use App\Models\Appointment;
use App\Models\Service;

/**
 * Reklam dönüşümlerine (Google + Meta) gidecek değer (₺). Tek kaynak:
 * `services.conversion_value`. Hizmet bilinmiyorsa ya da değeri yoksa null →
 * olaya `value`/`currency` hiç eklenmez (owner kararı 2026-10-28).
 */
final class ConversionValue
{
    /** `/hizmetler/<slug>` (alt sayfalar dahil) yolundaki aktif hizmetin değeri. */
    public static function forPath(?string $path): ?int
    {
        if (! preg_match('~^/hizmetler/([^/?#]+)~', (string) $path, $m)) {
            return null;
        }

        return self::positive(Service::active()->where('slug', $m[1])->value('conversion_value'));
    }

    /** Formdaki hizmet seçimi yerelleştirilmiş AD taşır (name_tr ya da name_en). */
    public static function forServiceName(?string $name): ?int
    {
        if ($name === null || $name === '') {
            return null;
        }

        return self::positive(Service::active()
            ->where(fn ($q) => $q->where('name_tr', $name)->orWhere('name_en', $name))
            ->value('conversion_value'));
    }

    /** Ödeme: randevu fiyatı, yoksa hizmetin dönüşüm değeri, o da yoksa null. */
    public static function forAppointment(Appointment $appointment): ?float
    {
        if ($appointment->price !== null) {
            return (float) $appointment->price;
        }
        $value = self::positive($appointment->service?->conversion_value);

        return $value !== null ? (float) $value : null;
    }

    /** @return array{value: int|float, currency: string}|array{} custom_data'ya eklenecek alanlar. */
    public static function fields(int|float|null $value): array
    {
        return $value !== null ? ['value' => $value, 'currency' => 'TRY'] : [];
    }

    private static function positive(mixed $value): ?int
    {
        return $value !== null && (int) $value > 0 ? (int) $value : null;
    }
}
