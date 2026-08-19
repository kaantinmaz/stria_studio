<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ServiceReviewFactory extends Factory
{
    public function definition(): array
    {
        return [
            'author_name' => $this->faker->name(),
            'rating' => $this->faker->numberBetween(1, 5),
            'body' => $this->faker->sentence(),
            'body_en' => null,
            'source' => 'studio',
            'source_url' => null,
            'reviewed_at' => $this->faker->date(),
            'is_active' => true,
            'sort_order' => 0,
        ];
    }
}
