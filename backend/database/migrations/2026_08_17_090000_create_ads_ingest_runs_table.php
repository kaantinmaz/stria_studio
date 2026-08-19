<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Toplayıcının o gün RAPOR VERDİĞİNİ kaydeder.
 *
 * Neden gerekli: boş gün artık geçerli (hesapta hiç kampanya olmayabilir, ya da
 * hepsi duraklatılmış olabilir). Bu durumda "kampanya verisi yok" ile "Ads
 * Script hiç çalışmadı" veritabanından ayırt edilemez hale gelir. Bu tablo
 * ikisini ayırır: satır yoksa toplayıcı sessizce ölmüş demektir.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ads_ingest_runs', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->unsignedInteger('campaigns');
            $table->unsignedInteger('keywords');
            $table->unsignedInteger('search_terms');
            $table->unsignedInteger('ad_issues');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ads_ingest_runs');
    }
};
