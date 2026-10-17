<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Kamuflaj makyajı vücut bölgeleri (App\Support\BodyRegions anahtarları). Paket düzeyinde, kökten yayılır. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->json('body_regions')->nullable()->after('subservices');
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn('body_regions');
        });
    }
};
