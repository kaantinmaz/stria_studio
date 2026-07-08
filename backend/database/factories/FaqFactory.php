<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class FaqFactory extends Factory
{
    public function definition(): array
    {
        return [
            'q_tr' => $this->faker->sentence(),
            'q_en' => $this->faker->sentence(),
            'a_tr' => $this->faker->paragraph(),
            'a_en' => $this->faker->paragraph(),
            'sort_order' => 0,
            'is_active' => true,
        ];
    }
}
