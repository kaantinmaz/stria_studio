<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Google Ads performans eşikleri
    |--------------------------------------------------------------------------
    |
    | Anomali/uygunluk alarmlarını üretirken kullanılan iş eşikleri. Hepsi env
    | ile override edilebilir. Dayanak: ortalama hizmet bedeli ~1.000 ₺; aylık
    | 20.000 ₺ reklam bütçesiyle başabaş ≈ 20 randevu, sağlıklı hedef 40+.
    |
    */

    // Randevu başına hedef maliyet (₺/randevu). Bunun altı sağlıklı.
    'cpa_target' => env('ADS_CPA_TARGET', 300),

    // Randevu başına maliyet üst sınırı (₺/randevu). Başabaşa yakın; aşılırsa alarm.
    'cpa_ceiling' => env('ADS_CPA_CEILING', 500),

    // WhatsApp lead başına maliyet üst sınırı (₺/lead).
    'lead_cost_ceiling' => env('ADS_LEAD_COST_CEILING', 105),

    // Tek uygulayıcı kapasitesi: haftalık alınabilecek yeni randevu tavanı.
    'weekly_capacity' => env('ADS_WEEKLY_CAPACITY', 11),

    // Aylık reklam bütçesi (₺). Başabaş ~20 randevuya denk gelir.
    'monthly_budget' => env('ADS_MONTHLY_BUDGET', 20000),

    /*
    |--------------------------------------------------------------------------
    | keyword_gap kuralı: karşılıksız talep eşikleri
    |--------------------------------------------------------------------------
    |
    | Dönüşüm getiren ama anahtar kelimelerimizde karşılığı olmayan arama
    | terimlerini yeni reklam grubu/kampanya adayı olarak işaretler.
    |
    */

    // Adayları ararken bakılan geçmiş pencere (gün).
    'gap_days' => env('ADS_GAP_DAYS', 14),

    // Terimin aday sayılması için pencerede toplam minimum dönüşüm.
    'gap_min_conversions' => env('ADS_GAP_MIN_CONVERSIONS', 1),

    // Tek alarmda toplanacak en fazla aday terim sayısı.
    'gap_top' => env('ADS_GAP_TOP', 5),

    /*
    |--------------------------------------------------------------------------
    | Kademeli yetkili komut kuyruğu
    |--------------------------------------------------------------------------
    |
    | Ajan ve watchdog kural motoru hesap değişikliklerini "komut" olarak yazar;
    | Ads Script saatlik çeker ve uygular. Güvenli/geri alınabilir/harcama düşüren
    | işlemler otomatik uygulanır, para artıran/yayına çıkan işlemler onay ister.
    |
    */
    'commands' => [
        // Kapatılırsa GET ucu boş liste döner: Ads Script hiçbir komut uygulamaz.
        'enabled' => env('ADS_COMMANDS_ENABLED', true),

        // Ads Script tek çekişte en fazla bu kadar komut uygular.
        'daily_apply_limit' => env('ADS_COMMANDS_DAILY_LIMIT', 20),

        // set_budget indirimi bu yüzdeyi aşmıyorsa otomatik; aşarsa onay ister.
        'max_budget_change_pct' => env('ADS_COMMANDS_MAX_BUDGET_CHANGE_PCT', 30),
    ],

];
