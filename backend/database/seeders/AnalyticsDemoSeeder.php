<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Visit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Dev-only demo data for the analytics dashboard. NOT registered in
 * DatabaseSeeder — run explicitly: php artisan db:seed --class=AnalyticsDemoSeeder
 */
class AnalyticsDemoSeeder extends Seeder
{
    public function run(): void
    {
        Visit::truncate();
        Event::truncate();

        $sources = ['ai', 'search', 'social', 'direct', 'referral'];
        $paths = ['/', '/hizmetler', '/hizmetler/microblading', '/galeri', '/iletisim', '/blog'];

        $visits = [];
        for ($i = 0; $i < 300; $i++) {
            $createdAt = now()->subDays(rand(0, 29))->subMinutes(rand(0, 1439));
            $visits[] = [
                'visitor_id' => Str::random(64),
                'path' => $paths[array_rand($paths)],
                'source' => $sources[array_rand($sources)],
                'referrer_host' => null,
                'utm_source' => null,
                'utm_medium' => null,
                'utm_campaign' => null,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ];
        }
        Visit::insert($visits);

        $eventNames = ['whatsapp_click', 'call_click'];
        $events = [];
        for ($i = 0; $i < 40; $i++) {
            $createdAt = now()->subDays(rand(0, 29))->subMinutes(rand(0, 1439));
            $events[] = [
                'visitor_id' => Str::random(64),
                'name' => $eventNames[array_rand($eventNames)],
                'path' => $paths[array_rand($paths)],
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ];
        }
        Event::insert($events);
    }
}
