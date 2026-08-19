<?php

namespace App\Console\Commands;

use App\Models\ChatConversation;
use App\Support\ChatSummarizer;
use Illuminate\Console\Command;

/**
 * Sessize düşmüş chatbot konuşmalarının özetini üretir. Sohbet sürerken
 * özetlemek boşa maliyet: her yeni mesaj summarized_at'i sıfırlıyor, bu yüzden
 * yalnızca --idle dakikadır mesaj almamış konuşmalar özetlenir.
 */
class SummarizeChatConversations extends Command
{
    protected $signature = 'chat:summarize
        {--idle=15 : Konuşmanın özetlenmesi için gereken sessizlik süresi (dakika)}
        {--limit=25 : Tek çalıştırmada özetlenecek en fazla konuşma}';

    protected $description = 'Sessize düşmüş chatbot konuşmalarını özetler (yönetim paneli listesi için)';

    public function handle(ChatSummarizer $summarizer): int
    {
        if (blank(config('services.anthropic.key'))) {
            $this->warn('ANTHROPIC_API_KEY tanımlı değil; özet üretilemez.');

            return Command::FAILURE;
        }

        $conversations = ChatConversation::query()
            ->awaitingSummary((int) $this->option('idle'))
            ->limit((int) $this->option('limit'))
            ->get();

        if ($conversations->isEmpty()) {
            $this->info('Özetlenecek konuşma yok.');

            return Command::SUCCESS;
        }

        $failed = 0;

        foreach ($conversations as $conversation) {
            if (! $summarizer->summarize($conversation)) {
                $failed++;
                $this->warn("Konuşma #{$conversation->id} özetlenemedi.");
            }
        }

        $this->info(sprintf('%d konuşma özetlendi, %d başarısız.', $conversations->count() - $failed, $failed));

        return $failed === $conversations->count() ? Command::FAILURE : Command::SUCCESS;
    }
}
