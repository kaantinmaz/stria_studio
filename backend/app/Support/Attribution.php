<?php

namespace App\Support;

use App\Models\Customer;
use Carbon\CarbonInterface;
use App\Models\Touchpoint;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Reklam tıklamasını ödeme yapan müşteriye bağlar.
 *
 * - Site: WhatsApp/arama/harita tıklaması ve form anında istemcinin `attr`
 *   bloğu (ilk gelişteki gclid/fbclid/UTM, _fbc/_fbp) touchpoint olarak saklanır.
 *   WhatsApp tıklamasında mesaja "(Ref: K7F3)" eklenir.
 * - Panel: müşteriye ref kodu girilince (veya formdan gelen telefon eşleşince)
 *   müşteri o touchpoint'e bağlanır; ödeme işaretlenince Meta/Google'a bu
 *   bilgilerle dönüşüm gider.
 */
final class Attribution
{
    /** Eşleştirmede geriye bakılan süre — Google tıklama dönüşüm aralığı. */
    public const WINDOW_DAYS = 90;

    public static function rules(): array
    {
        $s = ['nullable', 'string', 'max:255'];

        return [
            'ref' => ['nullable', 'string', 'regex:/^[A-Z0-9]{4,8}$/'],
            'attr' => ['nullable', 'array'],
            'attr.gclid' => $s, 'attr.gbraid' => $s, 'attr.wbraid' => $s, 'attr.fbclid' => $s,
            'attr.utm_source' => $s, 'attr.utm_medium' => $s, 'attr.utm_campaign' => $s,
            'attr.utm_term' => $s, 'attr.utm_content' => $s,
            'attr.landing_url' => ['nullable', 'string', 'max:1024'],
            'attr.referrer' => ['nullable', 'string', 'max:512'],
        ];
    }

    /**
     * @param  array<string, mixed>  $data  doğrulanmış istek (attr, ref, meta, path, site)
     */
    public static function record(string $channel, array $data, Request $request, ?string $phone = null): Touchpoint
    {
        $attr = $data['attr'] ?? [];
        $meta = $data['meta'] ?? [];

        return Touchpoint::create([
            'ref_code' => $data['ref'] ?? null,
            'channel' => $channel,
            'site' => $data['site'] ?? null,
            'path' => isset($data['path']) ? Str::limit($data['path'], 500, '') : null,
            'landing_url' => $attr['landing_url'] ?? null,
            'referrer' => $attr['referrer'] ?? null,
            'gclid' => $attr['gclid'] ?? null,
            'gbraid' => $attr['gbraid'] ?? null,
            'wbraid' => $attr['wbraid'] ?? null,
            'fbclid' => $attr['fbclid'] ?? null,
            'fbc' => $meta['fbc'] ?? null,
            'fbp' => $meta['fbp'] ?? null,
            'utm_source' => $attr['utm_source'] ?? null,
            'utm_medium' => $attr['utm_medium'] ?? null,
            'utm_campaign' => $attr['utm_campaign'] ?? null,
            'utm_term' => $attr['utm_term'] ?? null,
            'utm_content' => $attr['utm_content'] ?? null,
            'phone' => Touchpoint::normalizePhone($phone),
            'ip' => $request->ip(),
            'user_agent' => Str::limit((string) $request->userAgent(), 500, ''),
        ]);
    }

    /** "…(Ref: K7F3)" gibi yapıştırılmış mesajdan veya çıplak koddan kodu çıkarır. */
    public static function parseRef(?string $input): ?string
    {
        $input = strtoupper(trim((string) $input));
        if ($input === '') {
            return null;
        }
        if (preg_match('/REF\s*[:#-]?\s*([A-Z0-9]{4,8})/', $input, $m)) {
            return $m[1];
        }
        if (preg_match('/^\(?([A-Z0-9]{4,8})\)?$/', $input, $m)) {
            return $m[1];
        }

        return null;
    }

    public static function findByRef(?string $input): ?Touchpoint
    {
        $code = self::parseRef($input);
        if ($code === null) {
            return null;
        }

        return Touchpoint::query()
            ->where('ref_code', $code)
            ->where('created_at', '>=', now()->subDays(self::WINDOW_DAYS))
            ->latest('id')
            ->first();
    }

    /** Formdan aynı telefonla gelmiş en son touchpoint. */
    public static function findByPhone(?string $phone): ?Touchpoint
    {
        $normalized = Touchpoint::normalizePhone($phone);
        if ($normalized === null) {
            return null;
        }

        return Touchpoint::query()
            ->where('phone', $normalized)
            ->where('created_at', '>=', now()->subDays(self::WINDOW_DAYS))
            ->latest('id')
            ->first();
    }

    /**
     * Sitedeki "Ara" tıklamaları, verilen arama saatinin ±$minutes dakikası içinde;
     * henüz bir müşteriye bağlanmamış olanlar, saate en yakın önce.
     *
     * @return \Illuminate\Support\Collection<int, Touchpoint>
     */
    public static function callCandidates(CarbonInterface $calledAt, int $minutes = 10): \Illuminate\Support\Collection
    {
        // Sorgu sınırları DB'nin yazıldığı uygulama saat dilimine çevrilir.
        $at = \Carbon\CarbonImmutable::instance($calledAt)->setTimezone(config('app.timezone'));

        return Touchpoint::query()
            ->where('channel', 'call')
            ->whereBetween('created_at', [$at->subMinutes($minutes), $at->addMinutes($minutes)])
            ->whereNotIn('id', Customer::query()->whereNotNull('touchpoint_id')->select('touchpoint_id'))
            ->get()
            ->sortBy(fn (Touchpoint $tp) => abs($tp->created_at->diffInSeconds($at)))
            ->values();
    }

    /** Müşteri henüz bağlı değilse formdan gelen telefonla otomatik bağlar. */
    public static function autoLink(Customer $customer): void
    {
        if ($customer->touchpoint_id !== null || blank($customer->phone)) {
            return;
        }
        $tp = self::findByPhone($customer->phone);
        if ($tp !== null) {
            $customer->touchpoint_id = $tp->id;
        }
    }
}
