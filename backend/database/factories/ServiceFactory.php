<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ServiceFactory extends Factory
{
    public function definition(): array
    {
        $name = $this->faker->unique()->words(2, true);
        return [
            'slug' => Str::slug($name).'-'.$this->faker->unique()->numberBetween(1, 99999),
            'sort_order' => 0,
            'is_active' => true,
            'name_tr' => $name,
            'name_en' => $name,
            'tag_tr' => 'Kaş',
            'tag_en' => 'Brows',
            'desc_tr' => $this->faker->sentence(),
            'desc_en' => $this->faker->sentence(),
            'image' => '/images/micro.png',
            'benefits_tr' => ['a', 'b'],
            'process_tr' => ['step1'],
            'faq_tr' => [['q' => 'q', 'a' => 'a']],
            'gallery' => [],
            'related' => [],
        ];
    }
}
