<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Sitedeki ve uygulamadaki chatbot konuşmalarının tam dökümü. Yönetim
     * panelinde özet olarak listelenir; özet metni chat:summarize komutu
     * tarafından üretilir.
     */
    public function up(): void
    {
        Schema::create('chat_conversations', function (Blueprint $table) {
            $table->id();
            // İstemcinin ürettiği oturum kimliği — aynı konuşmanın ardışık
            // isteklerini tek satırda birleştirir.
            $table->string('session_id', 64)->unique();
            // web = site sohbet balonu, engage = mini etkileşim paneli.
            $table->string('source', 10)->default('web')->index();
            // Mikrosite anahtarı (config/microsites.php); ana site için null.
            $table->string('site')->nullable()->index();
            // [{role: user|assistant, content: string}, ...]
            $table->json('messages');
            $table->unsignedSmallInteger('message_count')->default(0);
            $table->text('summary')->nullable();
            // Null + yeni mesaj gelmiş = özet güncel değil, komut yeniden özetler.
            $table->timestamp('summarized_at')->nullable();
            $table->timestamp('last_message_at')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_conversations');
    }
};
