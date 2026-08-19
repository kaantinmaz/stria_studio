<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Hizmetin ortalama süresi. Randevu saatleri buna göre açılır: 100 dakikalık
     * bir işlem 10:00'a alındığında 11:00 artık boş sayılmaz.
     */
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->unsignedSmallInteger('duration_min')->default(60)->after('sort_order');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('duration_min');
        });
    }
};
