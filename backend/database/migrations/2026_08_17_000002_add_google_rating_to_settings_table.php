<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->string('google_place_id')->nullable();
            $table->decimal('google_rating', 2, 1)->nullable();
            $table->unsignedInteger('google_review_count')->nullable();
            $table->string('google_maps_url')->nullable();
            $table->timestamp('google_reviews_synced_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn([
                'google_place_id',
                'google_rating',
                'google_review_count',
                'google_maps_url',
                'google_reviews_synced_at',
            ]);
        });
    }
};
