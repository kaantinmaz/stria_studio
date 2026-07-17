<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->json('service_ids')->nullable()->after('new_price');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->foreignId('campaign_id')
                ->nullable()
                ->after('service_id')
                ->constrained('campaigns')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('campaign_id');
        });

        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropColumn('service_ids');
        });
    }
};
