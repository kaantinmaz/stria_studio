<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * QR ile bağlanan müşteri e-posta/şifre girmeden hesap sahibi oluyor;
     * bu alanları sonradan profilden belirliyor. MySQL'de NULL değerler
     * unique index'i çakıştırmaz, o yüzden unique korunuyor.
     */
    public function up(): void
    {
        Schema::table('app_users', function (Blueprint $table) {
            $table->string('email', 160)->nullable()->change();
            $table->string('password')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('app_users', function (Blueprint $table) {
            $table->string('email', 160)->nullable(false)->change();
            $table->string('password')->nullable(false)->change();
        });
    }
};
