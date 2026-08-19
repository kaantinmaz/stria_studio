<?php

namespace App\Support;

use App\Models\Customer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\Fill;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Renderer\Color\Rgb;
use BaconQrCode\Writer;
use Illuminate\Validation\ValidationException;

/**
 * Panelde açılan QR ile müşteriyi uygulamaya bağlar.
 *
 * Token durumsuz: `{müşteri}.{bitiş}.{imza}`. Veritabanında tek kullanımlık
 * kayıt tutmaya gerek yok, çünkü eşleşme yalnızca `app_user_id` boş olan
 * müşteri için geçerli — ilk okutmadan sonra token kendiliğinden ölür.
 */
class CustomerPairing
{
    public const TTL_MINUTES = 15;

    private const SIGNATURE_LENGTH = 24;

    public function token(Customer $customer): string
    {
        $expiresAt = now()->addMinutes(self::TTL_MINUTES)->getTimestamp();
        $payload = $customer->id.'.'.$expiresAt;

        return $payload.'.'.$this->signature($payload);
    }

    /**
     * @throws ValidationException Token bozuk, süresi geçmiş ya da müşteri zaten bağlıysa.
     */
    public function resolve(string $token): Customer
    {
        $parts = explode('.', trim($token));

        if (count($parts) !== 3 || ! ctype_digit($parts[0]) || ! ctype_digit($parts[1])) {
            $this->fail('QR kodu okunamadı. Panelden yeni bir kod açtırın.');
        }

        [$customerId, $expiresAt, $signature] = $parts;

        if (! hash_equals($this->signature($customerId.'.'.$expiresAt), $signature)) {
            $this->fail('QR kodu okunamadı. Panelden yeni bir kod açtırın.');
        }

        if ((int) $expiresAt < now()->getTimestamp()) {
            $this->fail('QR kodunun süresi doldu. Panelden yeni bir kod açtırın.');
        }

        $customer = Customer::query()->find((int) $customerId);

        if ($customer === null) {
            $this->fail('QR kodu okunamadı. Panelden yeni bir kod açtırın.');
        }

        if ($customer->app_user_id !== null) {
            $this->fail('Bu müşteri kaydı zaten bir uygulama hesabına bağlı.');
        }

        return $customer;
    }

    /**
     * Inline SVG döner. Bacon sabit `width`/`height` yazdığı için bunları
     * kaldırıp `viewBox`'a bırakıyoruz: kod, içine konduğu kutu kadar büyüyor
     * ve dar modallarda taşmıyor.
     */
    public function qrSvg(string $token, int $size = 320): string
    {
        $writer = new Writer(new ImageRenderer(
            new RendererStyle($size, 1, null, null, Fill::uniformColor(
                new Rgb(253, 246, 245),
                new Rgb(76, 19, 19),
            )),
            new SvgImageBackEnd(),
        ));

        return str_replace(
            ' width="'.$size.'" height="'.$size.'"',
            ' style="width:100%;height:auto;display:block"',
            $writer->writeString($token),
        );
    }

    private function signature(string $payload): string
    {
        return substr(hash_hmac('sha256', $payload, (string) config('app.key')), 0, self::SIGNATURE_LENGTH);
    }

    /**
     * @throws ValidationException
     */
    private function fail(string $message): never
    {
        throw ValidationException::withMessages(['token' => [$message]]);
    }
}
