<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Sitede bir iletişim anının (WhatsApp/arama/harita/form) geliş bilgisi. */
class Touchpoint extends Model
{
    protected $fillable = [
        'ref_code', 'channel', 'site', 'path', 'landing_url', 'referrer',
        'gclid', 'gbraid', 'wbraid', 'fbclid', 'fbc', 'fbp',
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
        'phone', 'ip', 'user_agent',
    ];

    /** Yerel/uluslararası yazımları tek biçime indirir: yalnız rakam, 90… */
    public static function normalizePhone(?string $phone): ?string
    {
        $digits = preg_replace('/\D+/', '', (string) $phone);
        if ($digits === '') {
            return null;
        }
        if (str_starts_with($digits, '00')) {
            $digits = substr($digits, 2);
        }
        if (str_starts_with($digits, '0')) {
            $digits = '90'.substr($digits, 1);
        } elseif (strlen($digits) === 10) {
            $digits = '90'.$digits;
        }

        return $digits;
    }

    public function source(): string
    {
        if ($this->gclid || $this->gbraid || $this->wbraid
            || ($this->utm_source === 'google' && $this->utm_medium === 'cpc')) {
            return 'Google Ads';
        }
        if ($this->fbclid || in_array($this->utm_source, ['facebook', 'instagram', 'meta', 'fb', 'ig'], true)) {
            return 'Meta';
        }
        if ($this->utm_source) {
            return $this->utm_source;
        }

        return 'Organik / doğrudan';
    }

    public function label(): string
    {
        $channel = ['whatsapp' => 'WhatsApp', 'call' => 'Arama', 'maps' => 'Harita', 'form' => 'Form'][$this->channel] ?? $this->channel;
        $parts = array_filter([
            $this->ref_code,
            $channel,
            $this->source(),
            $this->utm_campaign,
            $this->path,
            $this->created_at?->timezone('Europe/Istanbul')->format('d.m H:i'),
        ]);

        return implode(' · ', $parts);
    }
}
