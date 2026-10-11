<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** "Bizi nereden buldunuz?" — eşleşmeyen müşteriler için beyana dayalı kaba kaynak. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('heard_from', 20)->nullable()->after('touchpoint_id')->index();
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex(['heard_from']);
            $table->dropColumn('heard_from');
        });
    }
};
