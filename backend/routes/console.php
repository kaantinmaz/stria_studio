<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Günlük Google Ads özeti + anomali taraması (veri bir gün gecikmeli gelir).
Schedule::command('ads:digest')
    ->dailyAt('08:30')
    ->timezone('Europe/Istanbul');

// Sessize düşmüş chatbot konuşmalarının özeti (yönetim panelindeki liste için).
Schedule::command('chat:summarize')
    ->everyThirtyMinutes()
    ->timezone('Europe/Istanbul');

// Netsantral çağrı kayıtları: webhook'un kaçırdıklarını tamamlar (kayıtlar unique_id ile tekilleşir).
Schedule::command('netgsm:sync-calls')
    ->everyThirtyMinutes()
    ->timezone('Europe/Istanbul')
    ->withoutOverlapping(10)
    ->appendOutputTo(storage_path('logs/netgsm-sync.log'));

// Instagram gönderilerini saatlik senkronla. Token süresi dolduğunda komut
// hata verir; çıktı log dosyasına yazılır ki sessiz kalmasın (site bu arada
// indirilmiş son gönderileri göstermeye devam eder).
Schedule::command('instagram:sync')
    ->hourly()
    ->timezone('Europe/Istanbul')
    ->appendOutputTo(storage_path('logs/instagram-sync.log'));

// Günde bir içerik: en yüksek gösterimli kapsanmamış GSC sorgusundan yazı üret
// ve anında yayımla (docs/CONTENT_PIPELINE.md). Üretim ~2 dk sürebildiği ve
// Claude CLI oturumu/doğrulama başarısız olabildiği için çıktı log'a yazılır;
// üst üste çalışma engellenir. Yazılacak yeni sorgu kalmadığında komut hata
// koduyla döner ve o gün yazı üretilmez (istenen davranış).
Schedule::command('content:write')
    ->dailyAt('15:00')
    ->timezone('Europe/Istanbul')
    ->withoutOverlapping(30)
    ->appendOutputTo(storage_path('logs/content-write.log'));

// Haftalık SEO döngüsü (Pazartesi sabahı): GSC + SERP senkronu, yeni konular,
// yazı tazeleme, hizmet SSS/meta güncellemesi ve rapor. Onay adımı yok; her
// değişikliğin önce/sonra kopyası content_revisions'ta (seo:revert ile geri alınır).
Schedule::command('seo:weekly')
    ->weeklyOn(1, '06:00')
    ->timezone('Europe/Istanbul')
    ->withoutOverlapping(120)
    ->appendOutputTo(storage_path('logs/seo-weekly.log'));
