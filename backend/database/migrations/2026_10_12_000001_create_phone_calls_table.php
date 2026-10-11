<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Netgsm Netsantral çağrı kayıtları (CDR). Webhook ve saatlik rapor çekimi
 * aynı `unique_id` ile yazar; tekrar gelen kayıt güncellenir.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('phone_calls', function (Blueprint $table) {
            $table->id();
            $table->string('unique_id', 64)->unique();
            $table->string('direction', 3)->index(); // in | out
            $table->string('customer_phone', 20)->nullable()->index();
            $table->string('line', 40)->nullable();
            $table->string('destination', 120)->nullable();
            $table->timestamp('started_at')->index();
            $table->unsignedInteger('duration')->default(0);
            $table->unsignedSmallInteger('status')->nullable();
            $table->text('recording_url')->nullable();
            $table->foreignId('touchpoint_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phone_calls');
    }
};
