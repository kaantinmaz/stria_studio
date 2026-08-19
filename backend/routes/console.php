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

// Instagram gönderilerini saatlik senkronla. Token süresi dolduğunda komut
// hata verir; çıktı log dosyasına yazılır ki sessiz kalmasın (site bu arada
// indirilmiş son gönderileri göstermeye devam eder).
Schedule::command('instagram:sync')
    ->hourly()
    ->timezone('Europe/Istanbul')
    ->appendOutputTo(storage_path('logs/instagram-sync.log'));
