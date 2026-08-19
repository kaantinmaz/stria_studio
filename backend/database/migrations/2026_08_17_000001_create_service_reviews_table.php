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
        Schema::create('service_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('author_name', 120);
            $table->unsignedTinyInteger('rating');
            $table->text('body');
            $table->text('body_en')->nullable();
            $table->string('source', 20)->default('studio');
            $table->string('source_url')->nullable();
            $table->date('reviewed_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['service_id', 'is_active']);
            $table->index(['is_active', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_reviews');
    }
};
