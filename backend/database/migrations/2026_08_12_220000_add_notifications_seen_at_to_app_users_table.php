<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Bildirim listesi duyuru + kampanya kayıtlarından türetiliyor; okunma
     * durumu için tek bir zaman damgası yeterli: bundan sonra oluşan her şey
     * "yeni". Satır başına okundu tablosu tutmaya gerek yok.
     */
    public function up(): void
    {
        Schema::table('app_users', function (Blueprint $table) {
            $table->timestamp('notifications_seen_at')->nullable()->after('phone');
        });
    }

    public function down(): void
    {
        Schema::table('app_users', function (Blueprint $table) {
            $table->dropColumn('notifications_seen_at');
        });
    }
};
