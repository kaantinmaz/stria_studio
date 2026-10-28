<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Reklam dönüşümlerine (WhatsApp/arama/form/ödeme) gönderilen değer (₺). Boşsa değer gönderilmez. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->unsignedInteger('conversion_value')->nullable()->after('session_price');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('conversion_value');
        });
    }
};
