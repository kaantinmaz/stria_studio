<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Reklam tıklaması → ödeme yapan müşteri eşleştirmesi.
 * touchpoints: sitede WhatsApp/arama/harita tıklaması veya form anındaki geliş
 * bilgisi (tıklama kimlikleri, UTM). WhatsApp tıklamasında mesaja eklenen kısa
 * `ref_code` panelde müşteriye bağlanır; form, telefonla doğrudan bağlanır.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('touchpoints', function (Blueprint $table) {
            $table->id();
            $table->string('ref_code', 8)->nullable()->index();
            $table->string('channel', 16)->index();
            $table->string('site', 40)->nullable();
            $table->string('path', 512)->nullable();
            $table->string('landing_url', 1024)->nullable();
            $table->string('referrer', 512)->nullable();
            $table->string('gclid', 255)->nullable();
            $table->string('gbraid', 255)->nullable();
            $table->string('wbraid', 255)->nullable();
            $table->string('fbclid', 255)->nullable();
            $table->string('fbc', 255)->nullable();
            $table->string('fbp', 255)->nullable();
            $table->string('utm_source', 255)->nullable();
            $table->string('utm_medium', 255)->nullable();
            $table->string('utm_campaign', 255)->nullable();
            $table->string('utm_term', 255)->nullable();
            $table->string('utm_content', 255)->nullable();
            $table->string('phone', 20)->nullable()->index();
            $table->string('ip', 45)->nullable();
            $table->string('user_agent', 512)->nullable();
            $table->timestamps();
            $table->index('created_at');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->foreignId('touchpoint_id')->nullable()->after('app_user_id')
                ->constrained()->nullOnDelete();
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->timestamp('paid_at')->nullable()->after('is_paid');
            $table->timestamp('meta_purchase_sent_at')->nullable()->after('paid_at');
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn(['paid_at', 'meta_purchase_sent_at']);
        });
        Schema::table('customers', function (Blueprint $table) {
            $table->dropConstrainedForeignId('touchpoint_id');
        });
        Schema::dropIfExists('touchpoints');
    }
};
