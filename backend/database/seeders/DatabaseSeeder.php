<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        $this->call(OwnerUserSeeder::class);
        $this->call(ServiceSeeder::class);
        $this->call(SettingSeeder::class);
        $this->call(GalleryImageSeeder::class);
        $this->call(FaqSeeder::class);
        $this->call(MicrositeSeeder::class);
        $this->call(MainPostSeeder::class);
    }
}
