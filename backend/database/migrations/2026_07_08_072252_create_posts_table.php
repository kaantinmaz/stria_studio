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
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('title_tr');
            $table->string('title_en');
            $table->string('slug')->unique();
            $table->text('excerpt_tr');
            $table->text('excerpt_en');
            $table->longText('body_tr');
            $table->longText('body_en');
            $table->string('cover_path')->nullable();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('meta_title_tr')->nullable();
            $table->string('meta_title_en')->nullable();
            $table->string('meta_desc_tr')->nullable();
            $table->string('meta_desc_en')->nullable();
            $table->boolean('is_published')->default(false)->index();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
