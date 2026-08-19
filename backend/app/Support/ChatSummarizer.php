<?php

namespace App\Support;

use App\Models\ChatConversation;

class ChatSummarizer
{
    private const SYSTEM = <<<'PROMPT'
    Sen bir kalıcı makyaj stüdyosunun yönetim panelinde çalışan özetleyicisin.
    Sana site ziyaretçisi ile yapay zeka asistanı arasındaki sohbetin dökümü verilir.
    Stüdyo sahibinin tek bakışta anlaması için Türkçe, düz metin bir özet yaz:

    1) İlk satır: ziyaretçinin ne istediği ve hangi hizmetlerle ilgilendiği (tek cümle).
    2) Varsa endişesi, itirazı veya kararsızlığı (tek cümle).
    3) Son satır "Aşama: " ile başlasın ve şunlardan biri olsun:
       bilgi almak istiyor | ilgili | randevuya yakın | randevu istedi | ilgisiz.

    Kurallar: en fazla 4 kısa cümle, madde işareti ve markdown yok, yorum katma,
    dökümde olmayan bilgi uydurma, fiyat yazma.
    PROMPT;

    public function __construct(private readonly AnthropicChat $anthropic) {}

    /** Özeti üretip kaydeder; upstream başarısızsa false döner ve satır dokunulmaz kalır. */
    public function summarize(ChatConversation $conversation): bool
    {
        $transcript = $conversation->transcript();

        if (blank($transcript)) {
            return false;
        }

        $summary = $this->anthropic->reply(self::SYSTEM, [
            ['role' => 'user', 'content' => $transcript],
        ]);

        if ($summary === null) {
            return false;
        }

        $conversation->update([
            'summary' => $summary,
            'summarized_at' => now(),
        ]);

        return true;
    }
}
