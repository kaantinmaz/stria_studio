<?php

namespace App\Console\Commands;

use App\Models\Setting;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

/**
 * İlgili settings satırındaki google_place_id'yi kullanarak Google Places API
 * (New) üzerinden işletmenin GERÇEK puanını ve yorum sayısını çeker ve settings
 * satırını günceller. API anahtarı veya Place ID yoksa sessizce geçmek yerine
 * açıklayıcı bir hatayla döner - eksik yapılandırma fark edilmeden kalmamalı.
 */
class SyncGoogleReviews extends Command
{
    protected $signature = 'reviews:sync-google {--site= : Hedef site slug\'ı; verilmezse ana site}';

    protected $description = 'Google İşletme Profili puanını Places API (New) ile settings satırına senkronlar';

    public function handle(): int
    {
        $key = config('services.google.places_key');

        if (blank($key)) {
            $this->warn('GOOGLE_PLACES_API_KEY tanımlı değil. .env dosyasına Google Places API (New) anahtarınızı ekleyin.');

            return Command::FAILURE;
        }

        $site = $this->option('site') ?: null;
        $setting = Setting::forSite($site);

        if (blank($setting->google_place_id)) {
            $label = $site ?? 'ana site';
            $this->warn("'{$label}' için google_place_id ayarlanmamış. Site Ayarları > Google Puanı sekmesinden Place ID girin.");

            return Command::FAILURE;
        }

        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'X-Goog-Api-Key' => $key,
                    'X-Goog-FieldMask' => 'rating,userRatingCount,googleMapsUri',
                ])
                ->get('https://places.googleapis.com/v1/places/'.$setting->google_place_id);
        } catch (\Throwable $e) {
            $this->error('Google Places API isteği başarısız: '.$e->getMessage());

            return Command::FAILURE;
        }

        if ($response->failed()) {
            $this->error('Google Places API hatası (HTTP '.$response->status().'): '.$response->body());

            return Command::FAILURE;
        }

        $data = $response->json();

        $setting->google_rating = $data['rating'] ?? $setting->google_rating;
        $setting->google_review_count = $data['userRatingCount'] ?? $setting->google_review_count;
        if (blank($setting->google_maps_url) && filled($data['googleMapsUri'] ?? null)) {
            $setting->google_maps_url = $data['googleMapsUri'];
        }
        $setting->google_reviews_synced_at = now();
        $setting->save();

        $this->info(sprintf(
            'Google puanı güncellendi: %s yıldız, %s yorum.',
            $setting->google_rating ?? '-',
            $setting->google_review_count ?? '-'
        ));

        return Command::SUCCESS;
    }
}
