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
            'address' => 'Uğur Mumcu Cad. No:34 Kat:1 D:2, Gaziosmanpaşa, Çankaya/Ankara',
            'street_address' => 'Büyükesat Mah. Uğur Mumcu Cad. No:34 Kat:1 Daire:2, Gaziosmanpaşa',
            'locality' => 'Çankaya',
            'region' => 'Ankara',
            'postal_code' => '06700',
            'country' => 'TR',
            'lat' => 39.8913185,
            'lng' => 32.8737523,
            'google_maps_url' => 'https://www.google.com/maps/search/?api=1&query=39.8913185%2C32.8737523',
            'hours' => [[
                'days' => ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                'open' => '09:00',
                'close' => '20:00',
            ]],
        ]);
    }
}
