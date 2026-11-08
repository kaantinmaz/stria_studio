<?php

namespace App\Support;

use App\Models\Appointment;

/**
 * Müşteri paneli (musteri.striastudio.com.tr) için paylaşılan etiketler,
 * biçimlendirme ve küçük yardımcılar. Durum/ödeme değerleri desktop API ve
 * Filament ile AYNIdır; burada yalnızca Türkçe etiketleri verilir.
 */
final class MusteriPanel
{
    /** Geçerli randevu durumları (DesktopApi/StudioController ile aynı). */
    public const STATUS_LABELS = [
        'confirmed' => 'Onaylandı',
        'requested' => 'Talep',
        'cancelled' => 'İptal',
        'no_show' => 'Gelmedi',
    ];

    /** Durum rozet renk sınıfı (panel.css). */
    public const STATUS_CLASS = [
        'confirmed' => 'chip-ok',
        'requested' => 'chip-warn',
        'cancelled' => 'chip-off',
        'no_show' => 'chip-danger',
    ];

    /** Geçerli ödeme yöntemleri (Filament Reports paymentBreakdown ile aynı). */
    public const PAYMENT_LABELS = [
        'nakit' => 'Nakit',
        'kart' => 'Kart',
        'havale' => 'Havale',
    ];

    public static function statusLabel(?string $status): string
    {
        return self::STATUS_LABELS[$status] ?? ($status ?? '—');
    }

    public static function statusClass(?string $status): string
    {
        return self::STATUS_CLASS[$status] ?? 'chip-off';
    }

    public static function paymentLabel(?string $method): string
    {
        return $method === null ? '—' : (self::PAYMENT_LABELS[$method] ?? $method);
    }

    /** Randevunun kaynağı: mobil uygulama mı, panel/iOS mı. */
    public static function sourceLabel(Appointment $appointment): string
    {
        return $appointment->app_user_id !== null ? 'Mobil uygulama' : 'Panel / iOS';
    }

    /** ₺1.250,50 biçiminde Türk Lirası. */
    public static function money(int|float|string|null $value): string
    {
        return number_format((float) ($value ?? 0), 2, ',', '.').' ₺';
    }

    /** Ad baş harf(ler)inden avatar metni. */
    public static function initials(?string $name): string
    {
        $name = trim((string) $name);

        if ($name === '') {
            return '—';
        }

        $parts = preg_split('/\s+/', $name) ?: [];
        $first = mb_substr($parts[0] ?? '', 0, 1);
        $last = count($parts) > 1 ? mb_substr(end($parts), 0, 1) : '';

        return mb_strtoupper($first.$last);
    }
}
