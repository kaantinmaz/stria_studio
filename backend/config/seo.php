<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Google Search Console (gsc:sync)
    |--------------------------------------------------------------------------
    |
    | Servis hesabı JSON anahtarının MUTLAK yolu (repoda DEĞİL). Hesap, Search
    | Console mülküne "kısıtlı" kullanıcı olarak eklenmiş olmalı; kapsam
    | webmasters.readonly. site_url mülk kimliğidir:
    | "sc-domain:striastudio.com.tr" veya "https://striastudio.com.tr/".
    |
    */

    'gsc' => [
        'credentials' => env('GSC_CREDENTIALS'),
        'site_url' => env('GSC_SITE_URL'),
        // Son tam 28 günlük pencere; GSC verisi ~3 gün gecikmeli kesinleşir.
        'window_days' => 28,
        'lag_days' => 3,
    ],

    /*
    |--------------------------------------------------------------------------
    | Serper.dev (serp:sync)
    |--------------------------------------------------------------------------
    */

    'serper' => [
        'key' => env('SERPER_API_KEY'),
        // Haftalık sıralama sorgusu (= kredi) bütçesi.
        'weekly_limit' => (int) env('SERPER_WEEKLY_LIMIT', 60),
        // Bunlardan ilk N'i için ek "keşif" çağrısı (yalnız hl): Serper gl/location
        // verilince "Diğer sorular" ve ilgili aramaları döndürmüyor. Haftada en çok
        // weekly_limit + discovery_limit kredi harcanır.
        'discovery_limit' => (int) env('SERPER_DISCOVERY_LIMIT', 20),
        // İstekler arası bekleme (ms).
        'delay_ms' => 300,
        'gl' => 'tr',
        'hl' => 'tr',
        'location' => 'Ankara, Ankara, Turkey',
        'num' => 20,
    ],

    // SERP'te "bizim" sayılan alan adları (ana site + config/microsites.php).
    'own_hosts' => [
        'striastudio.com.tr',
        'microbladingankara.com',
        'kastasarimiankara.com',
    ],

    /*
    |--------------------------------------------------------------------------
    | seo:weekly — otomatik güncelleme sınırları
    |--------------------------------------------------------------------------
    */

    // Blog tazeleme: haftada en fazla N yazı.
    'refresh' => [
        'max_per_week' => 3,
        // Önceki haftaya göre bu kadar pozisyon kaybı → tazele.
        'position_drop' => 3.0,
        // "Vurucu mesafe": ortalama pozisyon bu aralıkta ve yeterli gösterim.
        'striking_min' => 8.0,
        'striking_max' => 20.0,
        'min_impressions' => 50,
    ],

    // Hizmet sayfaları: SSS ekleme + SEO başlık/açıklama yeniden yazımı.
    'service' => [
        'faq_new_per_week' => 2,
        'faq_max' => 16,
        // Haftada en fazla 1 hizmet için seo_title/seo_desc yeniden yazılır.
        'striking_min' => 4.0,
        'striking_max' => 15.0,
        'min_impressions' => 100,
        // TO bu değerin altındaysa (0.02 = %2) başlık/açıklama yeniden yazılır.
        'ctr_below' => 0.02,
    ],

    // Haftada eklenecek en fazla SERP kaynaklı yeni blog konusu.
    'topics_per_week' => 10,

];
