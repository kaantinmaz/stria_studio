<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Randevunun kapsadığı alt uygulamalar (services.subservices_tr[*].name). Paket düzeyinde, kökten yayılır. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->json('subservices')->nullable()->after('photos');
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn('subservices');
        });
    }
};
