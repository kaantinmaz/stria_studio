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
        Schema::create('instagram_posts', function (Blueprint $table) {
            $table->id();
            $table->string('ig_id')->unique();
            $table->string('permalink');
            $table->string('media_type', 32);
            $table->text('caption')->nullable();
            // public disk'teki göreli yol, ör. instagram/<ig_id>.jpg
            $table->string('image')->nullable();
            $table->timestamp('posted_at')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('instagram_posts');
    }
};
