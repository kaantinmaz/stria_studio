<?php

namespace Database\Seeders;

use App\Models\Link;
use Illuminate\Database\Seeder;

class LinkSeeder extends Seeder
{
    /**
     * Seeds the /linkler bio-link page once. Skipped when rows already exist so
     * re-seeding never wipes what the owner arranged in the admin panel.
     */
    public function run(): void
    {
        if (Link::query()->exists()) {
            return;
        }

        $items = [
            ['label_tr' => 'Randevu Al · WhatsApp', 'label_en' => 'Book on WhatsApp', 'subtitle_tr' => 'Ücretsiz ön görüşme ve fiyat bilgisi', 'url' => 'https://wa.me/905077323026', 'icon' => 'whatsapp', 'is_featured' => true],
            ['label_tr' => 'Tüm Hizmetler', 'label_en' => 'All Services', 'url' => '/hizmetler', 'icon' => 'web'],
            ['label_tr' => 'Altın Oran Kaş Alım', 'label_en' => 'Golden Ratio Brow Shaping', 'subtitle_tr' => 'Ölçümle şekillendirme · 30 dk', 'url' => '/hizmetler/altin-oran-kas-alim', 'icon' => 'web'],
            ['label_tr' => 'Kirpik Lifting', 'label_en' => 'Lash Lifting', 'url' => '/hizmetler/kirpik-lifting', 'icon' => 'web'],
            ['label_tr' => 'Kaş Laminasyon', 'label_en' => 'Brow Lamination', 'url' => '/hizmetler/kas-laminasyon', 'icon' => 'web'],
            ['label_tr' => 'Dudak Renklendirme', 'label_en' => 'Lip Blush', 'url' => '/hizmetler/dudak-renklendirme', 'icon' => 'web'],
            ['label_tr' => 'Kamuflaj Makyaj', 'label_en' => 'Camouflage Make-up', 'url' => '/hizmetler/kamuflaj-makyaj', 'icon' => 'web'],
            ['label_tr' => 'Çalışmalarımız', 'label_en' => 'Our Work', 'subtitle_tr' => 'Öncesi–sonrası galeri', 'url' => '/galeri', 'icon' => 'web'],
            ['label_tr' => 'Instagram', 'label_en' => 'Instagram', 'subtitle_tr' => '@striastudio', 'url' => 'https://instagram.com/striastudio', 'icon' => 'instagram'],
            ['label_tr' => 'Konum & Ulaşım', 'label_en' => 'Location', 'subtitle_tr' => 'Çankaya, Ankara · Pzt–Cmt 10:00–19:00', 'url' => '/iletisim', 'icon' => 'map'],
            ['label_tr' => 'My Lamination Ürünleri', 'label_en' => 'My Lamination Products', 'url' => '/mylamination', 'icon' => 'web'],
            ['label_tr' => 'Blog', 'label_en' => 'Blog', 'url' => '/blog', 'icon' => 'web'],
        ];

        foreach ($items as $i => $it) {
            Link::create($it + ['sort_order' => $i, 'is_active' => true]);
        }
    }
}
