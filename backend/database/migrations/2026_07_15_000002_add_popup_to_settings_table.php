<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->boolean('popup_enabled')->default(false);
            $table->string('popup_title_tr')->nullable();
            $table->string('popup_title_en')->nullable();
            $table->text('popup_text_tr')->nullable();
            $table->text('popup_text_en')->nullable();
            $table->string('popup_image')->nullable();
            $table->string('popup_cta_text_tr')->nullable();
            $table->string('popup_cta_text_en')->nullable();
            $table->string('popup_cta_url')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn([
                'popup_enabled',
                'popup_title_tr',
                'popup_title_en',
                'popup_text_tr',
                'popup_text_en',
                'popup_image',
                'popup_cta_text_tr',
                'popup_cta_text_en',
                'popup_cta_url',
            ]);
        });
    }
};
