<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Touchpoint;
use App\Support\Attribution;
use Illuminate\Http\Response;

/**
 * Google Ads çevrimdışı dönüşüm dosyası (CSV): son 90 günde ödemesi alınan
 * randevular. Ads › Veri yöneticisi › HTTPS bağlantısı bu adresi her gün çeker;
 * Veri yöneticisi ilk satırı sütun başlığı sayar, bu yüzden "Parameters:"
 * satırı yok ve saat dilimi her zamanın içinde (+03:00).
 * Satırda gclid varsa kesin eşleşme; yoksa SHA-256 telefon/e-posta ile
 * "potansiyel müşteriler için gelişmiş dönüşümler" eşleşmesi. Google aynı
 * gclid + ad + zaman satırını yinelenen sayıp tekrar saymaz.
 */
class GoogleOfflineConversionsController extends Controller
{
    public function __invoke(string $token): Response
    {
        $expected = (string) config('services.google_ads.offline_token');
        abort_if($expected === '' || ! hash_equals($expected, $token), 404);

        $name = (string) config('services.google_ads.conversion_name');
        $default = (float) config('services.meta.default_purchase_value', 2500);

        $rows = Appointment::query()
            ->with('customer.touchpoint')
            ->where('is_paid', true)
            ->whereNull('parent_id')
            ->where('paid_at', '>=', now()->subDays(Attribution::WINDOW_DAYS))
            ->whereNotNull('customer_id')
            ->orderBy('paid_at')
            ->get();

        $out = fopen('php://temp', 'r+');
        fputcsv($out, ['Google Click ID', 'Conversion Name', 'Conversion Time', 'Conversion Value', 'Conversion Currency', 'Email', 'Phone Number']);

        foreach ($rows as $a) {
            $c = $a->customer;
            $gclid = $c->touchpoint?->gclid;
            $phone = Touchpoint::normalizePhone($c->phone);
            $email = strtolower(trim((string) $c->email));
            if (! $gclid && $phone === null && $email === '') {
                continue;
            }
            fputcsv($out, [
                $gclid ?? '',
                $name,
                $a->paid_at->timezone('Europe/Istanbul')->format('Y-m-d H:i:sP'),
                number_format($a->price !== null ? (float) $a->price : $default, 2, '.', ''),
                'TRY',
                $email !== '' ? hash('sha256', $email) : '',
                $phone !== null ? hash('sha256', '+'.$phone) : '',
            ]);
        }

        rewind($out);
        $csv = stream_get_contents($out);
        fclose($out);

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store',
            'X-Robots-Tag' => 'noindex',
        ]);
    }
}
