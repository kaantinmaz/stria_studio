<?php

namespace App\Support;

use App\Models\Customer;
use App\Models\PhoneCall;
use App\Models\Touchpoint;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Netgsm Netsantral çağrı kayıtları → panel.
 *
 * İki kaynak, aynı kayıt (`unique_id` = Asterisk kimliği):
 * - Webhook "santral dinleme" `scenario=cdr` olayı (Netsantral › Ayarlar ›
 *   Genel Ayarlar › API Talep Ayarları'na `/api/netgsm/{token}` girilir).
 * - `netgsm:sync-calls`: `api.netgsm.com.tr/netsantral/report` ile kaçan
 *   webhook'ları toplar.
 *
 * Gelen aramada, aramadan hemen önceki sitedeki "Ara" tıklaması arayan
 * numaraya bağlanır; müşteri o numarayla kaydedilince `Attribution::autoLink`
 * reklam kaynağını kendiliğinden bağlar.
 */
final class Netgsm
{
    /** Sitede "Ara"ya basıp numarayı çevirmeye kadar geçen en uzun süre. */
    public const CLICK_LOOKBACK_MINUTES = 15;

    private const REPORT_URL = 'https://api.netgsm.com.tr/netsantral/report';

    /** Webhook `scenario=cdr` gövdesi → kayıt. */
    public static function storeWebhookCdr(array $cdr): ?PhoneCall
    {
        $id = $cdr['asteriskId'] ?? $cdr['kimlik'] ?? null;
        if (blank($id) || blank($cdr['bas'] ?? null)) {
            return null;
        }
        $inbound = (int) ($cdr['yon'] ?? 0) === 1;

        return self::store([
            'unique_id' => (string) $id,
            'direction' => $inbound ? 'in' : 'out',
            'customer_phone' => Touchpoint::normalizePhone($inbound ? ($cdr['arayan'] ?? null) : ($cdr['aranan'] ?? null)),
            'line' => $cdr['trunk'] ?? $cdr['santral'] ?? null,
            'destination' => $inbound ? ($cdr['aranan'] ?? null) : ($cdr['arayan'] ?? null),
            'started_at' => CarbonImmutable::parse($cdr['bas'], 'Europe/Istanbul'),
            'duration' => (int) ($cdr['sure'] ?? 0),
            'status' => isset($cdr['sondurum']) ? (int) $cdr['sondurum'] : null,
            'recording_url' => $cdr['seskaydi'] ?? null,
        ]);
    }

    /** Rapor servisinin bir satırı (`uniqueid` + `values[]`) → kayıt. */
    public static function storeReportRow(array $row): ?PhoneCall
    {
        $v = $row['values'][0] ?? null;
        if (blank($row['uniqueid'] ?? null) || ! is_array($v) || blank($v['date'] ?? null)) {
            return null;
        }
        $inbound = (int) ($v['direction'] ?? 0) === 1;

        return self::store([
            'unique_id' => (string) $row['uniqueid'],
            'direction' => $inbound ? 'in' : 'out',
            'customer_phone' => Touchpoint::normalizePhone($inbound ? ($v['source'] ?? null) : ($v['destination'] ?? null)),
            'line' => $v['line'] ?? null,
            'destination' => $inbound ? ($v['destination'] ?? null) : ($v['source'] ?? null),
            'started_at' => CarbonImmutable::createFromFormat('d.m.Y H:i:s', $v['date'], 'Europe/Istanbul'),
            'duration' => (int) ($v['duration'] ?? 0),
            'recording_url' => $v['recording'] ?? null,
        ]);
    }

    /**
     * @return list<array<string, mixed>> rapor satırları
     */
    public static function fetchReport(CarbonInterface $from, CarbonInterface $to): array
    {
        $usercode = (string) config('services.netgsm.usercode');
        $password = (string) config('services.netgsm.password');
        if ($usercode === '' || $password === '') {
            throw new RuntimeException('NETGSM_USERCODE / NETGSM_PASSWORD tanımlı değil.');
        }
        $fmt = fn (CarbonInterface $t) => CarbonImmutable::instance($t)->setTimezone('Europe/Istanbul')->format('dmYHi');

        $response = Http::timeout(20)->asJson()->post(self::REPORT_URL, [
            'usercode' => $usercode, 'password' => $password,
            'startdate' => $fmt($from), 'stopdate' => $fmt($to),
        ])->throw();
        $json = $response->json();

        // Kayıt yoksa servis boş gövde/boş liste döner; hata gövdesi liste değildir.
        if ($json === null || $json === []) {
            return [];
        }
        if (! is_array($json) || ! array_is_list($json)) {
            throw new RuntimeException('Netgsm rapor hatası: '.$response->body());
        }

        return $json;
    }

    private static function store(array $attrs): PhoneCall
    {
        $call = PhoneCall::query()->firstOrNew(['unique_id' => $attrs['unique_id']]);
        // Webhook durum kodu taşır, rapor taşımaz; sonradan gelen rapor silmesin.
        $call->fill(array_filter($attrs, fn ($v) => $v !== null) + ['status' => $call->status]);

        if (! $call->exists && $call->customer_phone !== null) {
            $call->customer_id = self::customerFor($call->customer_phone)?->id;
            if ($call->direction === 'in') {
                $call->touchpoint_id = self::claimCallClick($call)?->id;
            }
        }
        $call->save();

        // Kayıtlı ama kaynağı bilinmeyen müşteri reklamdan arıyorsa bağla.
        if ($call->wasRecentlyCreated && $call->touchpoint_id && $call->customer && $call->customer->touchpoint_id === null) {
            $call->customer->save();
        }

        return $call;
    }

    /** Aramadan hemen önceki, sahiplenilmemiş en yakın "Ara" tıklamasını numaraya bağlar. */
    private static function claimCallClick(PhoneCall $call): ?Touchpoint
    {
        $at = CarbonImmutable::instance($call->started_at)->setTimezone(config('app.timezone'));
        $tp = Touchpoint::query()
            ->where('channel', 'call')
            ->whereNull('phone')
            ->whereBetween('created_at', [$at->subMinutes(self::CLICK_LOOKBACK_MINUTES), $at->addMinute()])
            ->whereNotIn('id', Customer::query()->whereNotNull('touchpoint_id')->select('touchpoint_id'))
            ->latest('created_at')
            ->first();
        $tp?->update(['phone' => $call->customer_phone]);

        return $tp;
    }

    private static function customerFor(string $phone): ?Customer
    {
        // Telefonlar serbest biçimli yazılıyor ("0555 111 22 33"); normalize ederek eşle.
        return Customer::query()
            ->whereNotNull('phone')
            ->latest('id')
            ->get()
            ->first(fn (Customer $c) => Touchpoint::normalizePhone($c->phone) === $phone);
    }
}
