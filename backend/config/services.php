<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'admin_api' => [
        // Blog yayınlama API'si (POST/DELETE /api/admin/posts).
        'token' => env('ADMIN_API_TOKEN'),
        // Google Ads betiğinin ingest ucu. Ayrı tutuluyor: betik Ads
        // arayüzünde açıkta durduğu için blog yazma yetkisi taşımamalı.
        'ads_token' => env('ADS_INGEST_TOKEN'),
    ],

    'indexnow' => [
        'key' => env('INDEXNOW_KEY'),
        'host' => env('INDEXNOW_HOST', 'striastudio.com.tr'),
    ],

    'anthropic' => [
        'key' => env('ANTHROPIC_API_KEY'),
        'model' => env('ANTHROPIC_MODEL', 'claude-haiku-4-5'),
    ],

    'telegram' => [
        'bot_token' => env('TELEGRAM_BOT_TOKEN'),
        'chat_id' => env('TELEGRAM_CHAT_ID'),
    ],

    'google' => [
        'places_key' => env('GOOGLE_PLACES_API_KEY'),
    ],

    'instagram' => [
        // Instagram Graph API: Business/Creator hesabına ait uzun ömürlü access
        // token ve IG kullanıcı kimliği. `php artisan instagram:sync` bunları kullanır.
        'token' => env('INSTAGRAM_ACCESS_TOKEN'),
        'user_id' => env('INSTAGRAM_USER_ID'),
        'limit' => (int) env('INSTAGRAM_LIMIT', 12),
    ],

    'meta' => [
        // Meta Dönüşümler API'si (sunucu tarafı). Pixel/veri seti kimliği
        // kamusal; token gizli. Token yoksa gönderim sessizce atlanır.
        'pixel_id' => env('META_PIXEL_ID', '2933007867083958'),
        'capi_token' => env('META_CAPI_TOKEN'),
        // Olay Yöneticisi › Olayları test et kodu; yalnız doğrulama sırasında doldurulur.
        'test_event_code' => env('META_TEST_EVENT_CODE'),
        // Randevuda fiyat girilmemişse Purchase değeri (ortalama sepet).
        'default_purchase_value' => (float) env('META_DEFAULT_PURCHASE_VALUE', 2500),
    ],

    // Google Ads çevrimdışı dönüşüm beslemesi: Ads › Yüklemeler › Zaman planlaması
    // (HTTPS kaynağı) her gün GET /api/conversions/google/{token}.csv çeker.
    // Token yoksa uç nokta 404 döner.
    'google_ads' => [
        'offline_token' => env('GOOGLE_ADS_OFFLINE_TOKEN'),
        'conversion_name' => env('GOOGLE_ADS_PURCHASE_CONVERSION', 'Stria Müşteri (ödeme)'),
    ],

    // Netgsm Netsantral: webhook (santral dinleme) /api/netgsm/{webhook_token};
    // rapor çekimi API yetkili alt kullanıcıyla. Boşsa ikisi de kapalı.
    'netgsm' => [
        'usercode' => env('NETGSM_USERCODE'),
        'password' => env('NETGSM_PASSWORD'),
        'webhook_token' => env('NETGSM_WEBHOOK_TOKEN'),
    ],

];
