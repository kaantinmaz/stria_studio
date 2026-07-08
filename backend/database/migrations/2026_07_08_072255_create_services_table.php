<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->string('name_tr');
            $table->string('name_en');
            $table->string('tag_tr');
            $table->string('tag_en');
            $table->text('desc_tr');
            $table->text('desc_en');
            $table->string('image')->nullable();
            $table->string('seo_title_tr')->nullable();
            $table->string('seo_title_en')->nullable();
            $table->string('seo_desc_tr')->nullable();
            $table->string('seo_desc_en')->nullable();
            $table->json('keywords_tr')->nullable();
            $table->json('keywords_en')->nullable();
            $table->text('intro_tr')->nullable();
            $table->text('intro_en')->nullable();
            $table->text('aftercare_tr')->nullable();
            $table->text('aftercare_en')->nullable();
            $table->json('benefits_tr')->nullable();
            $table->json('benefits_en')->nullable();
            $table->json('process_tr')->nullable();
            $table->json('process_en')->nullable();
            $table->json('faq_tr')->nullable();
            $table->json('faq_en')->nullable();
            $table->json('gallery')->nullable();
            $table->json('related')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
