<?php

namespace Database\Seeders;

use App\Models\GalleryImage;
use Illuminate\Database\Seeder;

class GalleryImageSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['image' => '/images/gallery-1.png', 'alt_tr' => 'Kaş ve kirpik sonucu', 'alt_en' => 'Brow and lash result'],
            ['image' => '/images/gallery-2.png', 'alt_tr' => 'Microblading sonucu', 'alt_en' => 'Microblading result'],
            ['image' => '/images/gallery-3.png', 'alt_tr' => 'Dudak renklendirme', 'alt_en' => 'Lip blush'],
            ['image' => '/images/gallery-4.png', 'alt_tr' => 'Kirpik lifting', 'alt_en' => 'Lash lift'],
            ['image' => '/images/gallery-5.png', 'alt_tr' => 'Stüdyo uygulama anı', 'alt_en' => 'In-studio treatment'],
            ['image' => '/images/gallery-6.png', 'alt_tr' => 'Kaş tasarımı profili', 'alt_en' => 'Brow design profile'],
        ];
        GalleryImage::query()->delete();
        foreach ($items as $i => $it) {
            GalleryImage::create($it + ['sort_order' => $i, 'is_active' => true]);
        }
    }
}
