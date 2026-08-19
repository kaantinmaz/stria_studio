<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            // Bir randevunun bağlı olduğu paket kökü (en erken seans); tek randevuda null.
            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('appointments')
                ->nullOnDelete()
                ->index();
            // Seans sırası (1..N) ve paketteki toplam seans sayısı (N); tek randevuda ikisi de null.
            $table->unsignedTinyInteger('session_no')->nullable();
            $table->unsignedTinyInteger('session_total')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('parent_id');
            $table->dropColumn(['session_no', 'session_total']);
        });
    }
};
