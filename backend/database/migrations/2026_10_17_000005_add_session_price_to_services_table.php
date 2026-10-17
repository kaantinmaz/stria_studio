<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Randevu uygulaması için seans fiyatı (₺); kamuflaj makyajında bölge başına. Sitede gösterilmez. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->decimal('session_price', 10, 2)->nullable()->after('duration_min');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('session_price');
        });
    }
};
