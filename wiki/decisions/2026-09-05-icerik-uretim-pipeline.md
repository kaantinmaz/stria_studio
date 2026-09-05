# Decision: İçerik üretim pipeline'ı — Laravel + Claude CLI (abonelik kimliği)

**Date:** 2026-09-05
**Status:** Accepted (owner directive, this session).

## Context

Sahibi düzenli olarak Google Search Console (GSC) sorgu dışa aktarımları
alıyor; bunları düşük emekle yayına dönüştürecek bir üretim hattı gerekiyor.
İki ihtiyaç var:

1. Kapsanmamış (`new`) sorgulardan, yoğun ve **doğrulanmış iç linklerle** örülü
   Türkçe blog yazıları üretmek.
2. Mevcut hizmet sayfalarının kopyasını arama talebine göre yeniden yazmak.

Ana site organik görünürlük teşhisi (bkz.
[striastudio-organik-gorunurluk-teshisi](../issues/2026-08-10-striastudio-organik-gorunurluk-teshisi.md))
ince gövdeler ve kapsam boşluklarını, domain konsolidasyonu
([domain-konsolidasyonu](2026-08-10-domain-konsolidasyonu.md)) ise yeni içerikle
doldurulacak boşlukları ortaya koymuştu. Bu pipeline o boşluğu sistematik
kapatıyor.

Doğrulanmış ortam: `claude` CLI v2.1.252, abonelik ile oturum açık; Laravel
13.19 / PHP 8.5, MAMP MySQL. Zamanlama `routes/console.php`'te; ancak bu komutlar
**manuel** çalıştırılıyor, zamanlanmıyor.

## Decision

1. **Laravel artisan komutları** pipeline'ı sürüyor:
   `gsc:import` → `content:plan` → `content:write` / `content:service-copy`.
   Sorgular `search_queries` tablosunda tutuluyor; `QueryCoverage` her sorguyu
   canlı envantere göre `covered` / `service` / `new` sınıflandırıyor.
2. **Metin üretimi `claude -p` (Claude Code CLI) ile, abonelik/OAuth kimliği**
   kullanılarak yapılıyor. `--tools ""`, `--json-schema`, `--output-format json`;
   `.structured_output` okunuyor. **`ANTHROPIC_API_KEY` / Anthropic HTTP API
   kullanılmıyor**; `--bare` ve `--dangerously-skip-permissions` asla geçilmiyor.
3. **Blog yazıları anında yayımlanıyor** (`is_published=true`,
   `published_at=now()`) ve ana sitede IndexNow ping'i atılıyor.
4. **Hizmet kopyası bir öneri**: alan alan fark basılıyor, DB'ye yazmak için
   `--apply` gerekiyor. `_en` alanları ve yapısal alanlar (`is_active`,
   `gallery`, `related`, `sort_order`, `duration_min`) korunuyor.
5. **Sert iç link doğrulaması**: `ContentGuard`, üretilen her URL'yi
   `ContentInventory`'nin döndürdüğü izinli yollara karşı denetliyor; uydurma
   link, eksik minimum link, sınır dışı uzunluk/etiket reddediliyor. Doğrulama
   geçmeden hiçbir şey yazılmıyor; ihlaller numaralı geri bildirimle modele
   geri veriliyor (`--retries`).
6. **Niyet duyarlı kapsam sınıflandırması**: bir sorgu bilgi amaçlı niyet
   işareti taşıyorsa (`nedir`, `nasıl`, `kaç gün`, `sonrası`, `bakım`,
   `iyileşme`, `fark`, `zararlı mı`, …) hizmet adını içerse bile hedefi hizmet
   sayfası değil, yazıdır — "kaş pudralama sonrası bakım" hizmet sayfasına
   değil bloga gider. Mevcut yazı ancak aynı niyet işaretini başlığında
   taşıyorsa sorguyu kapsamış sayılır. Böylece "kaş pudralama nedir" sorgusu
   "kaş pudralama kaç yıl kalıcı" yazısıyla kapatılmış görünmüyor
   (bkz. [keyword-cannibalization](../concepts/keyword-cannibalization.md)).
7. **`ANTHROPIC_API_KEY` alt süreç ortamından silinir**: chatbot için `.env`'de
   tanımlı olan anahtar `claude` CLI'ye sızarsa CLI abonelik oturumunu
   reddediyor ("claude.ai connectors are disabled…"). `ClaudeCli` bu ve ilgili
   sağlayıcı değişkenlerini alt süreçte kaldırıyor; chatbot etkilenmiyor.

## Reddedilen alternatifler

- **Anthropic HTTP API (`ANTHROPIC_API_KEY`)** — kullanım başına maliyet ve
  sahibinin mevcut aboneliğini boşa çıkarması; owner politikası API anahtarını
  yasaklıyor. Abonelik kimliği zaten var ve ek ücret doğurmuyor.
- **n8n / harici SaaS otomasyonu** — ekstra altyapı, ayrı kimlik yönetimi ve
  canlı envantere doğrudan erişimin olmaması; iç link doğrulaması DB'ye yakın
  olmalı.
- **Elle yazım** — ölçeklenmiyor; GSC fırsatları birikiyor, kapsam boşlukları
  kapanmıyor.

## Consequences

- Sunucuda (Plesk/AlmaLinux) **abonelik kullanıcısı olarak oturum açmış bir
  Claude CLI** bulunmalı; kimlik `~/.claude`'a yazıldığından `CLAUDE_HOME` o
  kullanıcının ev dizinini göstermeli. Kurulum ve sorun giderme
  [`docs/CONTENT_PIPELINE.md`](../../docs/CONTENT_PIPELINE.md)'de.
- Guard, envanterde olmayan iç linkleri reddettiği için üretilen yazılar yalnızca
  gerçekten var olan sayfalara link veriyor (uydurma yok).
- Yayın/güncellemeler **Next.js ISR penceresi (300 sn)** içinde canlıya
  yansıyor; IndexNow bunu tamamlar ama yerine geçmez.
- Blog otomatik yayımlandığından üretim kalitesi tamamen guard doğrulamasına
  bağlı; hizmet kopyasında `--apply` insan onayı katmanı bırakıyor.
- SEO mimarisiyle uyumlu ([seo-architecture](2026-07-08-seo-architecture.md)):
  TR-öncelikli, hizmet başına sayfa, JSON-LD. Model kullanımı proje
  yönlendirmesiyle tutarlı ([model-routing](2026-07-12-model-routing.md)):
  `claude -p` abonelik kimliğiyle.

## Sources

Owner directive (session 2026-09-05); doğrulanmış ortam (`claude --version` =
2.1.252, abonelik oturumu; Laravel 13.19.0 / PHP 8.5.3; MAMP MySQL
`stria_studio`); uygulanan kod: `app/Console/Commands/{ImportSearchQueries,
PlanContent,WriteBlogPost,RewriteServiceCopy}.php`, `app/Support/{ClaudeCli,
ContentInventory,ContentGuard,QueryCoverage,PromptTemplate,PostWriter}.php`,
`config/content.php`, `resources/prompts/{blog-post,service-copy}.md`;
operatör kılavuzu [`docs/CONTENT_PIPELINE.md`](../../docs/CONTENT_PIPELINE.md).
