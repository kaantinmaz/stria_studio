<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Google Ads Script'in her gün POST ettiği performans verisi.
        // Kampanyalar: doğal anahtar kısa (date + campaign_name<=191) olduğu için
        // doğrudan unique kurulabilir.
        Schema::create('ads_daily_campaigns', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('campaign_name', 191);
            $table->string('status', 32);
            $table->string('campaign_type', 32);
            $table->decimal('cost', 10, 2);
            $table->unsignedInteger('impressions');
            $table->unsignedInteger('clicks');
            // Google kesirli dönüşüm raporlayabilir (ör. 1.5), bu yüzden decimal.
            $table->decimal('conversions', 10, 2);
            $table->decimal('conversion_value', 12, 2);
            $table->decimal('average_cpc', 10, 2)->nullable();
            $table->decimal('search_impression_share', 5, 4)->nullable();
            $table->decimal('budget_lost_impression_share', 5, 4)->nullable();
            $table->timestamps();

            $table->unique(['date', 'campaign_name']);
            $table->index('date');
        });

        // Anahtar kelimeler: doğal anahtar (date + campaign_name + ad_group_name +
        // keyword + match_type) utf8mb4'te 3072 byte'lık InnoDB index sınırını rahat
        // aşar (yalnızca campaign_name 191*4=764 byte). Bu yüzden bileşik alanların
        // sha256 özetini char(64) `keyword_hash` kolonunda tutup unique'i
        // (date, keyword_hash) üzerine kuruyoruz. Kaynak kolonlar okunabilirlik için
        // normal kolon olarak da saklanıyor.
        Schema::create('ads_daily_keywords', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('campaign_name', 191);
            $table->string('ad_group_name', 191);
            $table->string('keyword', 191);
            $table->string('match_type', 16);
            $table->char('keyword_hash', 64);
            $table->decimal('cost', 10, 2);
            $table->unsignedInteger('impressions');
            $table->unsignedInteger('clicks');
            $table->decimal('conversions', 10, 2);
            $table->timestamps();

            $table->unique(['date', 'keyword_hash']);
            $table->index('date');
        });

        // Arama terimleri: aynı gerekçe (uzun serbest metin) → sha256 `term_hash`.
        Schema::create('ads_search_terms', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('campaign_name', 191);
            $table->string('ad_group_name', 191);
            $table->string('search_term', 191);
            $table->char('term_hash', 64);
            $table->decimal('cost', 10, 2);
            $table->unsignedInteger('impressions');
            $table->unsignedInteger('clicks');
            $table->decimal('conversions', 10, 2);
            $table->timestamps();

            $table->unique(['date', 'term_hash']);
            $table->index('date');
        });

        // Reklam/politika sorunları: doğal anahtarın bir bileşeni (ad_group_name)
        // nullable. MySQL unique index'lerinde NULL'lar birbirinden farklı sayıldığı
        // için nullable kolonlu doğrudan unique, upsert idempotansını bozardı
        // (aynı satır tekrar tekrar eklenir). Hem bu sorunu hem de uzunluk sınırını
        // çözmek için bileşenlerin sha256 özetini `issue_hash`te tutup unique'i
        // (date, issue_hash) üzerine kuruyoruz.
        Schema::create('ads_ad_issues', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('campaign_name', 191);
            $table->string('ad_group_name', 191)->nullable();
            $table->string('policy_status', 32);
            $table->text('reason')->nullable();
            $table->char('issue_hash', 64);
            $table->timestamps();

            $table->unique(['date', 'issue_hash']);
            $table->index('date');
        });

        // Anomali alarmları: aynı gün + aynı kod + aynı kampanya için tek satır.
        // campaign_name nullable (hesap geneli alarmlar için). Sqlite/MySQL'de
        // upsert doğal anahtarı olarak kullanacağımız için kısa kolonlar yeterli.
        Schema::create('ads_alerts', function (Blueprint $table) {
            $table->id();
            $table->date('detected_on');
            $table->string('code', 48);
            $table->string('severity', 16);
            $table->string('campaign_name', 191)->nullable();
            $table->text('message');
            $table->json('context')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->unique(['detected_on', 'code', 'campaign_name']);
            $table->index('detected_on');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ads_alerts');
        Schema::dropIfExists('ads_ad_issues');
        Schema::dropIfExists('ads_search_terms');
        Schema::dropIfExists('ads_daily_keywords');
        Schema::dropIfExists('ads_daily_campaigns');
    }
};
