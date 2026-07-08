<?php

namespace Database\Seeders;

use App\Models\GalleryImage;
use Illuminate\Database\Seeder;

class GalleryImageSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['image' => '/images/micro.png', 'alt_tr' => 'Microblading', 'alt_en' => 'Microblading'],
            ['image' => '/images/dipliner.png', 'alt_tr' => 'Kirpik / göz', 'alt_en' => 'Lashes / eye'],
            ['image' => '/images/hero.png', 'alt_tr' => 'Stüdyo', 'alt_en' => 'Studio'],
            ['image' => '/images/powder.png', 'alt_tr' => 'Kaş pudralama', 'alt_en' => 'Powder brows'],
            ['image' => '/images/eyeliner.png', 'alt_tr' => 'Eyeliner', 'alt_en' => 'Eyeliner'],
            ['image' => '', 'alt_tr' => 'Çalışmanızı ekleyin', 'alt_en' => 'Add your work'],
        ];
        GalleryImage::query()->delete();
        foreach ($items as $i => $it) {
            GalleryImage::create($it + ['sort_order' => $i, 'is_active' => true]);
        }
    }
}
