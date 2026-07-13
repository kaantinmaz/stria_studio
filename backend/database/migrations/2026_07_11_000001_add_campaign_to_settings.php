<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->boolean('campaign_enabled')->default(false);
            $table->string('campaign_text_tr')->nullable();
            $table->string('campaign_text_en')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn(['campaign_enabled', 'campaign_text_tr', 'campaign_text_en']);
        });
    }
};
