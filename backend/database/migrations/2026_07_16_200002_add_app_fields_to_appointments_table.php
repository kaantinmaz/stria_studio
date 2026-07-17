<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('status')->default('confirmed')->index();
            $table->foreignId('app_user_id')
                ->nullable()
                ->constrained('app_users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('app_user_id');
            $table->dropIndex(['status']);
            $table->dropColumn('status');
        });
    }
};
