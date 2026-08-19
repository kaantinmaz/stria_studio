# Decision: Chatbot konuşmalarının kaydı + panelde özet listesi

**Date:** 2026-08-18
**Status:** Accepted.

## Context

Sahip, sitedeki chatbot mesajlaşmalarını yönetim panelinde **özet** olarak görmek istedi. O ana kadar `POST /api/chat` tamamen durumsuzdu: istek Anthropic'e gidiyor, yanıt dönüyor, hiçbir yere yazılmıyordu — yani hangi ziyaretçinin ne sorduğu, hangi endişeyle geldiği kaybediliyordu.

Kısıtlar:
- İstemci her istekte yalnızca **son 12 mesajı** gönderiyor; sunucu tarafında döküm "değiştirilerek" tutulamaz, **eklenerek** tutulmalı.
- Kayıt, sohbeti bloklamamalı: DB hatası ziyaretçiye 502 döndürmemeli.
- Her mesajda özet üretmek boşa Anthropic maliyeti; sohbet sürerken üretilen özet zaten eskir.

## Decision

1. **Oturum kimliği istemciden gelir.** `POST /api/chat` gövdesine opsiyonel `session_id` (`[A-Za-z0-9-]{8,64}`) eklendi. Web widget'ları (`frontend/ChatWidget`, `frontend/EngageSurvey`, `kastasarimi/ChatWidget`, `mikroblading_ankara/ChatWidget`) `crypto.randomUUID()` ile üretip **sessionStorage**'da (`<storage-key>-sid`) tutuyor — döküm zaten sessionStorage'da olduğu için aynı ömür. `session_id` yoksa (eski istemci) konuşma tek seferlik satır olarak yine kaydedilir.
2. **`chat_conversations` tablosu**: `session_id` (unique), `source` (`web` | `engage`), `site` (mikrosite anahtarı, NULL = ana site), `messages` (JSON döküm), `message_count`, `summary`, `summarized_at`, `last_message_at`. Ayrı `messages` tablosu **yok** — döküm tek satırda, son 200 mesajla sınırlı.
3. **`App\Support\ChatTranscript`** her başarılı yanıttan sonra son kullanıcı mesajı + asistan yanıtını satıra ekler ve `summarized_at`'i **null**'a çeker (yeni mesaj = özet eskidi). Tamamı `try/catch`; hata `Log::warning` ile geçer, sohbet bozulmaz. Upstream başarısızsa (502) hiçbir şey yazılmaz.
4. **Özet, sohbet sessize düşünce üretilir.** `App\Support\ChatSummarizer` mevcut `AnthropicChat` istemcisini kullanır; sistem promptu Türkçe, en fazla 4 cümle + son satırda `Aşama: bilgi almak istiyor | ilgili | randevuya yakın | randevu istedi | ilgisiz`. `php artisan chat:summarize {--idle=15} {--limit=25}` yalnızca `summarized_at IS NULL` **ve** son mesajdan beri `idle` dakika sessiz konuşmaları özetler; `routes/console.php`'de `everyThirtyMinutes()`.
5. **Filament**: `ChatConversations` kaynağı (CRUD değil — `canCreate() = false`, edit yok). Liste kolonları: son mesaj, kaynak (badge), site, **özet**, ilk ziyaretçi mesajı (varsayılan gizli), mesaj sayısı. Filtreler: kaynak, site, özetlendi/bekliyor. Satır aksiyonları: `Döküm` (infolist modali, tam döküm `Ziyaretçi:`/`Asistan:` olarak), `Özetle` (zamanlanmış komutu beklemeden anında özet). Navigasyon badge'i = bugünün sohbet sayısı.

## Consequences

- **Mobil uygulama sohbeti (`/api/app/chat`) bilinçli olarak kapsam dışı.** Sahip "sitemizdeki" dedi; ayrıca App Store gizlilik beyanı (`mobile/store/SUBMISSION.md`) uygulama sohbetinin yalnızca Anthropic'e gittiğini taahhüt ediyor — sunucuda saklamak o beyanı değiştirir. Kaydetmek istenirse önce beyan + onay metni güncellenmeli.
- Döküm kişisel veri içerebilir (ziyaretçi serbest metin yazıyor). Şu an süresiz saklanıyor; ileride bir saklama süresi/temizleme komutu gerekebilir.
- `session_id` göndermeyen bir istemci hâlâ çalışır ama her istek ayrı satır açar — widget'ların hepsi gönderdiği için pratikte oluşmaz.
- Özet gecikmesi tasarım gereği ~15–45 dk (idle eşiği + zamanlama). Acele eden sahip `Özetle` aksiyonuyla anında üretir.

## Verification

- `php artisan test` → 214 test / 830 assertion yeşil. Yeni testler: `ChatApiTest` (döküm kaydı ve pencere tekrarında **eklenerek** büyüme, engage kaynağı + site, 502'de kayıt yok, geçersiz `session_id` → 422), `ChatConversationPanelTest` (komut yalnızca sessiz + özetsiz satırları özetler, upstream hatası satırı bozmaz, Filament listesi + `Özetle` aksiyonu, döküm modali).
- `tsc --noEmit`: `frontend`, `kastasarimi`, `mikroblading_ankara` temiz.
- Gerçek uçtan uca (MAMP + gerçek Anthropic anahtarı): `curl POST /api/chat` (session_id ile) → yanıt geldi, satır 3 mesajla oluştu; `php artisan chat:summarize --idle=0` → gerçek özet ("...kaşlarının dökülüp dökülmeyeceğinden endişeli. Aşama: ilgili").
- Tarayıcı (oturum açmış smoke kullanıcısı): `/admin/chat-conversations` listesi kolonlar + özet + `Döküm`/`Özetle` aksiyonlarıyla render oldu; `Döküm` modali özet, kaynak, site, mesaj sayısı ve satır sonları korunmuş tam dökümü gösterdi. Smoke kullanıcısı ve fixture satırı sonradan silindi.

## Sources

Kod: `backend/database/migrations/2026_08_18_090000_create_chat_conversations_table.php`, `backend/app/Models/ChatConversation.php`, `backend/app/Support/{ChatTranscript,ChatSummarizer}.php`, `backend/app/Console/Commands/SummarizeChatConversations.php`, `backend/app/Http/Controllers/ChatController.php`, `backend/routes/console.php`, `backend/app/Filament/Resources/ChatConversations/**`, `backend/tests/Feature/{ChatApiTest,ChatConversationPanelTest}.php`, `frontend/components/{ChatWidget,EngageSurvey}.tsx`, `kastasarimi/components/ChatWidget.tsx`, `mikroblading_ankara/components/ChatWidget.tsx`. Sahip isteği: 2026-08-18 oturumu.
