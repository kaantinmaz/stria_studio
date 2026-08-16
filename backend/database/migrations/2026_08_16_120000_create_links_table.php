<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Bio-link ("linktree") page rows, rendered at /linkler on the main site.
     */
    public function up(): void
    {
        Schema::create('links', function (Blueprint $table) {
            $table->id();
            $table->string('label_tr');
            $table->string('label_en')->nullable();
            $table->string('subtitle_tr')->nullable();
            $table->string('subtitle_en')->nullable();
            $table->string('url');
            // Frontend icon key: whatsapp | instagram | phone | map | calendar |
            // mail | tiktok | youtube | web. Unknown values fall back to web.
            $table->string('icon', 20)->default('web');
            $table->boolean('is_featured')->default(false);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('links');
    }
};
