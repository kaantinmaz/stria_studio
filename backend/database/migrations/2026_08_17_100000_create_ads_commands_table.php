<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Kademeli yetkili komut kuyruğu: ajan ve watchdog kural motoru hesapta
        // yapılacak değişiklikleri "komut" olarak buraya yazar; Ads Script saatlik
        // çeker, uygular ve sonucu geri bildirir.
        //
        // Idempotans command_hash (kind + kampanya + reklam grubu + kanonik payload
        // sha256) üzerinden kurulur: aynı mantıksal komut ikinci kez üretilmez.
        // char(64) hash kolonu kullanıyoruz çünkü bileşenlerin (191*4 byte kampanya
        // adı + serbest payload) doğrudan bileşik unique'i utf8mb4'te InnoDB'nin
        // 3072 byte index sınırını aşar (ads_daily_keywords desenindeki gibi).
        Schema::create('ads_commands', function (Blueprint $table) {
            $table->id();
            $table->string('kind', 32);
            $table->string('tier', 16);
            $table->string('status', 16)->default('pending');
            $table->string('campaign_name', 191)->nullable();
            $table->string('ad_group_name', 191)->nullable();
            $table->json('payload');
            $table->text('reason');
            $table->char('command_hash', 64)->unique();
            $table->string('source', 16);
            $table->timestamp('applied_at')->nullable();
            $table->text('result')->nullable();
            $table->text('error')->nullable();
            $table->timestamps();

            // GET ucu (auto+pending) veya approved satırları id sırasıyla çeker.
            $table->index(['status', 'tier']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ads_commands');
    }
};
