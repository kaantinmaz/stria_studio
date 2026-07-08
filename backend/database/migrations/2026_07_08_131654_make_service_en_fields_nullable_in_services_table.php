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
        Schema::table('services', function (Blueprint $table) {
            $table->string('name_en')->nullable()->change();
            $table->string('tag_en')->nullable()->change();
            $table->text('desc_en')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->string('name_en')->nullable(false)->change();
            $table->string('tag_en')->nullable(false)->change();
            $table->text('desc_en')->nullable(false)->change();
        });
    }
};
