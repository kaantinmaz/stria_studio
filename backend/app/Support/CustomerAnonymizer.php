<?php

namespace App\Support;

use App\Models\AppUser;
use Illuminate\Support\Facades\Storage;

class CustomerAnonymizer
{
    /**
     * Hesap silinirken bağlı müşteri kaydını kişiliksizleştirir: ad
     * "Silinmiş Müşteri" olur, iletişim ve not alanları temizlenir, fotoğraf
     * kayıtları ve disk dosyaları silinir. Randevular müşteriye bağlı kalır
     * ama artık kimliğe götüren hiçbir alan taşımaz.
     */
    public function anonymize(AppUser $user): void
    {
        $customer = $user->customer;

        if ($customer === null) {
            return;
        }

        // Panelden yüklenen fotoğraflar 'public' diskte 'customers/' altında
        // saklanıyor; http ile başlayan dış bağlantıları diskte aramayız.
        $paths = array_values(array_filter(
            $customer->photos ?? [],
            fn ($path): bool => is_string($path) && ! str_starts_with($path, 'http'),
        ));

        if ($paths !== []) {
            Storage::disk('public')->delete($paths);
        }

        $customer->name = 'Silinmiş Müşteri';
        $customer->phone = null;
        $customer->email = null;
        $customer->instagram = null;
        $customer->notes = null;
        $customer->photos = [];
        $customer->app_user_id = null;
        $customer->save();
    }
}
