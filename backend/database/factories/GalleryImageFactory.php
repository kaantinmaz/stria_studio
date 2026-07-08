<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class GalleryImageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'image' => '/images/micro.png',
            'alt_tr' => $this->faker->words(2, true),
            'alt_en' => $this->faker->words(2, true),
            'sort_order' => 0,
            'is_active' => true,
        ];
    }
}
