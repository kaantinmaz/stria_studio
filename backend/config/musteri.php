<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Müşteri paneli alan adı
    |--------------------------------------------------------------------------
    |
    | Müşteri takip paneli yalnızca bu alan adında (host) yayınlanır. Tüm panel
    | route'ları Route::domain(config('musteri.domain')) grubundadır; admin
    | alan adının kök davranışı (/, /admin) değişmez.
    |
    | Yerelde: musteri.localhost  ·  Canlıda: musteri.striastudio.com.tr
    |
    */

    'domain' => env('MUSTERI_DOMAIN', 'musteri.striastudio.com.tr'),

];
