<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        Setting::updateOrCreate(['id' => 1], [
            'phone' => '+90 507 732 30 26',
            'phone_local' => '0507 732 30 26',
            'whatsapp' => 'https://wa.me/905077323026',
            'instagram' => 'https://instagram.com/striabeautystudio',
            'instagram_handle' => '@striabeautystudio',
            'address' => 'Çankaya, Ankara',
            'street_address' => '[Mahalle] Cd. No: 00',
            'locality' => 'Çankaya',
            'region' => 'Ankara',
            'postal_code' => '06000',
            'country' => 'TR',
            'lat' => 39.9208,
            'lng' => 32.8541,
            'hours' => [[
                'days' => ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                'open' => '09:00',
                'close' => '20:00',
            ]],
        ]);
    }
}
