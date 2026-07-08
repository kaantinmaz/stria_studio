<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SettingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'phone' => '+90 500 000 00 00',
            'phone_local' => '0500 000 00 00',
            'whatsapp' => 'https://wa.me/900000000000',
            'instagram' => 'https://instagram.com/x',
            'instagram_handle' => '@x',
            'address' => 'Çankaya, Ankara',
            'street_address' => 'St 1',
            'locality' => 'Çankaya',
            'region' => 'Ankara',
            'postal_code' => '06000',
            'country' => 'TR',
            'lat' => 39.9208,
            'lng' => 32.8541,
            'hours' => [['days' => ['Monday'], 'open' => '10:00', 'close' => '19:00']],
        ];
    }
}
