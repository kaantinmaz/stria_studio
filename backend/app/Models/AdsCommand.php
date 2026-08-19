<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Kademeli yetkili komut kuyruğu satırı. tier/hash mantığı tek noktada burada
 * yaşar ki hem watchdog planner'ı hem ajan aynı kararı üretsin.
 */
class AdsCommand extends Model
{
    protected $fillable = [
        'kind',
        'tier',
        'status',
        'campaign_name',
        'ad_group_name',
        'payload',
        'reason',
        'command_hash',
        'source',
        'applied_at',
        'result',
        'error',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'applied_at' => 'datetime',
        ];
    }

    /**
     * Sözleşmedeki tier kuralı — TEK nokta.
     *
     * AUTO (güvenli/geri alınabilir/harcama düşüren): add_negative_keyword,
     * pause_keyword ve harcamayı düşüren küçük bütçe indirimi. Diğer her şey
     * (para artıran, yayına çıkan, tavanı aşan) onay ister.
     *
     * @param  array<string, mixed>  $payload
     */
    public static function tierFor(string $kind, array $payload): string
    {
        if ($kind === 'add_negative_keyword' || $kind === 'pause_keyword') {
            return 'auto';
        }

        if ($kind === 'set_budget') {
            $amount = isset($payload['amount']) ? (float) $payload['amount'] : null;
            $previous = isset($payload['previous']) ? (float) $payload['previous'] : null;

            // previous 0 veya yoksa yüzde hesaplanamaz; güvenli tarafta kal.
            if ($amount === null || $previous === null || $previous <= 0.0) {
                return 'approval';
            }

            // Yalnızca harcamayı düşüren VE tavan içindeki değişim otomatik.
            $changePct = abs($amount - $previous) / $previous * 100;
            $ceiling = (float) config('ads.commands.max_budget_change_pct');

            if ($amount < $previous && $changePct <= $ceiling) {
                return 'auto';
            }

            return 'approval';
        }

        // set_budget artışı, pause_campaign, enable_campaign, create_keyword,
        // create_ad ve bilinmeyen her şey onay ister.
        return 'approval';
    }

    /**
     * Aynı mantıksal komut her zaman aynı hash'i üretir: payload ksort'lu
     * kanonik JSON'a çevrilip kind + kampanya + reklam grubu ile birlikte
     * sha256'lanır. Böylece aynı komut ikinci kez üretilmez.
     *
     * @param  array<string, mixed>  $payload
     */
    public static function hashFor(string $kind, ?string $campaign, ?string $adGroup, array $payload): string
    {
        ksort($payload);

        $canonical = implode('|', [
            $kind,
            $campaign ?? '',
            $adGroup ?? '',
            json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);

        return hash('sha256', $canonical);
    }
}
