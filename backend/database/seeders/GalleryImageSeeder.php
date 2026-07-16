<?php

namespace Database\Seeders;

use App\Models\GalleryImage;
use Illuminate\Database\Seeder;

class GalleryImageSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['image' => '/images/gallery-1.png', 'alt_tr' => 'Microblading öncesi ve sonrası — kıl tekniği kaş', 'alt_en' => 'Microblading before and after — hair-stroke brows'],
            ['image' => '/images/gallery-2.png', 'alt_tr' => 'Kaş pudralama öncesi ve sonrası', 'alt_en' => 'Powder brows before and after'],
            ['image' => '/images/gallery-3.png', 'alt_tr' => 'Dudak renklendirme öncesi ve sonrası', 'alt_en' => 'Lip blush before and after'],
            ['image' => '/images/gallery-4.png', 'alt_tr' => 'Kalıcı eyeliner öncesi ve sonrası', 'alt_en' => 'Permanent eyeliner before and after'],
            ['image' => '/images/gallery-5.png', 'alt_tr' => 'Kirpik lifting öncesi ve sonrası', 'alt_en' => 'Lash lift before and after'],
            ['image' => '/images/gallery-6.png', 'alt_tr' => 'Çatlak kamuflajı öncesi ve sonrası', 'alt_en' => 'Stretch mark camouflage before and after'],
        ];
        GalleryImage::query()->delete();
        foreach ($items as $i => $it) {
            GalleryImage::create($it + ['sort_order' => $i, 'is_active' => true]);
        }
    }
}
