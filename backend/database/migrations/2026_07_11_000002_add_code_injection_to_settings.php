<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            // Raw HTML/JS injected into the site (analytics, pixels, custom CSS).
            // Admin-only; intentionally unescaped.
            $table->longText('header_code')->nullable();
            $table->longText('footer_code')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn(['header_code', 'footer_code']);
        });
    }
};
