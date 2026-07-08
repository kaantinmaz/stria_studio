<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PostFactory extends Factory
{
    public function definition(): array
    {
        $title = $this->faker->sentence(4);
        return [
            'title_tr' => $title,
            'title_en' => $title,
            'slug' => Str::slug($title).'-'.$this->faker->unique()->numberBetween(1, 99999),
            'excerpt_tr' => $this->faker->sentence(),
            'excerpt_en' => $this->faker->sentence(),
            'body_tr' => '<p>'.$this->faker->paragraph().'</p>',
            'body_en' => '<p>'.$this->faker->paragraph().'</p>',
            'cover_path' => null,
            'category_id' => null,
            'is_published' => true,
            'published_at' => now()->subDay(),
        ];
    }
}
