# İçerik Üretim Pipeline'ı

Google Search Console (GSC) sorgu dışa aktarımlarını, yoğun ve **doğrulanmış iç
linklerle** örülü Türkçe blog yazılarına dönüştüren ve hizmet sayfası
kopyalarına yeniden yazım önerileri üreten, sunucu tarafı bir Laravel
pipeline'ı. Metin üretimi tamamen **Claude Code CLI (`claude -p`) abonelik /
OAuth kimliği** ile yapılır — **Anthropic HTTP API'si ve `ANTHROPIC_API_KEY`
bu özellikte hiçbir yerde kullanılmaz.**

## Döngü

```
GSC dışa aktarımı (CSV)
        │
        ▼
  php artisan gsc:import <dosya> [--period=YYYY-MM]      # sorguları içe al
        │
        ▼
  php artisan content:plan [--limit=15] [--status=new]   # fırsatları listele
        │
        ├──► php artisan content:write [sorgu]            # blog yazısı üret + yayımla
        │
        └──► php artisan content:service-copy <slug>      # hizmet kopyası önerisi
```

Sahibi periyodik olarak GSC'den yeni bir sorgu dışa aktarımı alır (`query`,
`clicks`, `impressions` sütunları; eski aktarımlarda ek `TO` yüzdesi ve
`Pozisyon`). İçe aktarım ve hizmet metni güncellemeleri **manuel**; blog üretimi
**otomatiktir**.

## Otomatik günlük üretim (15:00)

`backend/routes/console.php`:

```php
Schedule::command('content:write')
    ->dailyAt('15:00')
    ->timezone('Europe/Istanbul')
    ->withoutOverlapping(30)
    ->appendOutputTo(storage_path('logs/content-write.log'));
```

Her gün **15:00 (Europe/Istanbul)** bir içerik yayımlanır. Argümansız çalışan
`content:write` şu sırayı izler:

1. En yeni GSC döneminde, gösterimi en yüksek, sınıfı `new` **ve** aynı niyeti
   taşıyan yayınlanmış yazısı olmayan sorguyu seçer.
2. Böyle bir sorgu kalmadıysa **en zayıf (en kısa) mevcut yazıyı tazeler**
   (`--slug` ile aynı URL'ye yazar; yeni URL açılmaz, ilk yayın tarihi korunur,
   aynı yazı gün içinde iki kez tazelenmez).
3. İkisi de yoksa hata koduyla döner ve o gün yazı üretilmez.

Marka/gezinme sorguları (`stria studio`) ana sayfaya `covered` sayılır; onlar
için yazı üretilmez.

Log: `backend/storage/logs/content-write.log`. Cron (Plesk, dakikalık):

```
* * * * * runuser -u striastudio.com.tr_xn8csnuygii -- /opt/plesk/php/8.4/bin/php \
  /var/www/vhosts/striastudio.com.tr/admin.striastudio.com.tr/artisan schedule:run >/dev/null 2>&1
```

Zamanlanmış çalışmayı beklemeden denemek için:
`php artisan schedule:test --name="content:write"`.

## Kapak görselleri

Yazı kapakları `posts.cover_path` → `https://admin.striastudio.com.tr/storage/covers/...`
olarak servis edilir ve frontend'de yazı başında, blog listesinde, ilgili yazı
kartlarında ve `BlogPosting` JSON-LD `image` alanında kullanılır.

### Özgün görsel bağlama

```
php artisan content:cover <slug> --url=<görsel-url>
php artisan content:cover <slug> --file=/tmp/kapak.jpg
```

Tip Content-Type'a değil imza baytlarına göre doğrulanır (JPG/PNG/WebP, ≤5 MB),
dosya `covers/<slug>-<ts>.<ext>` olarak yazılır, artık kullanılmayan eski kapak
silinir ve yayındaki yazı için IndexNow ping'i atılır.

### Otomatik yazının kapağı: havuz

Görseller **Higgsfield MCP ile üretilir ve MCP istemci taraflıdır** — sunucudaki
cron Higgsfield'ı çağıramaz. Bu yüzden `content:write` kapaksız kalan yazıya
konu bazlı bir **havuz görseli** bağlar:

- Havuz: `storage/app/public/covers/pool/<hizmet-slug>.jpg` + `genel.jpg`
  (mevcut: microblading, kas-pudralama, eyeliner, dipliner, dudak-renklendirme,
  kas-laminasyon, kirpik-lifting, kamuflaj-makyaj, genel).
- Konu, gövdede **en çok geçen** `/hizmetler/<slug>` linkinden belirlenir; eşleşme
  yoksa `genel.jpg`.
- Havuz dosyaları paylaşımlıdır (kopyalanmaz); `content:cover` eski kapağı
  yalnızca başka yazı kullanmıyorsa siler, yani havuz dosyaları korunur.
- Havuz `storage/` altındadır, git deploy'u ile gelmez. Sunucu storage'ı
  sıfırlanırsa görseller yeniden üretilip yüklenmelidir.

### Üretim notları (Higgsfield)

- Model: **`gpt_image_2`** (`resolution: 2k`, `quality: medium`, `aspect_ratio: 16:9`).
- **`soul_2` kullanılmamalı:** çıktıya uydurma tipografi/logo/marka basıyor.
- Prompt'ta zorunlu kısıtlar: tek kare (`no collage, no split screen`), yazısız
  (`no text, no watermark, no logo, unbranded packaging`), sonucu kötü gösteren
  ayrıntı yok (`no flaking, no crust, no redness`), klinik görünüm yok.
- Yükleme öncesi 1600px genişliğe/JPEG q82'ye indirilir (~200-350 KB).

## Komutlar

Tüm komutlar `backend/` dizininden `php artisan …` ile çalıştırılır.

### `gsc:import {file} {--period=}`

GSC CSV dışa aktarımını `search_queries` tablosuna içe aktarır. Hem 3 sütunlu
(query, clicks, impressions) hem de 5 sütunlu (ek TO + Pozisyon) formatı okur.
`(query, period)` üzerinde tekildir; aynı dönem tekrar içe aktarılırsa satırlar
güncellenir.

```
php artisan gsc:import marketing-research/gsc-sorgular-2026-09.csv --period=2026-09
```

`--period` verilmezse dosya adından/çalışma zamanından türetilir.

### `content:plan {--limit=15} {--period=} {--status=}`

En son dönemin sorgularını fırsata göre (gösterim azalan) sıralar ve her birini
`covered` (mevcut bir sayfa zaten kapsıyor), `service` (bir hizmet sayfasına
denk düşüyor) veya `new` (kapsanmamış — yeni içerik fırsatı) olarak
sınıflandırır.

```
php artisan content:plan --status=new --limit=20
```

### `content:write {query?} {--period=} {--slug=} {--force} {--dry-run} {--draft} {--retries=2}`

Bir sorgudan yayına hazır Türkçe blog yazısı üretir.

- `query` verilmezse `--period` (varsayılan en yeni dönem) içindeki en yüksek
  gösterimli, sınıfı `new` olan sorgu seçilir.
- İlgili sorgular (aynı dönemde ortak anlamlı token paylaşan ilk 8) ve hedef
  sorgunun istatistikleri prompt'a enjekte edilir.
- Model çıktısı `ContentGuard` ile doğrulanır; ihlal varsa numaralı geri
  bildirimle `--retries` kez yeniden denenir. Son denemeden sonra da ihlal
  varsa **hiçbir şey yazılmaz** ve komut hata koduyla döner.
- Yazı varsayılan olarak **anında yayımlanır** (`is_published=true`,
  `published_at=now()`) ve ana sitede IndexNow ping'i atılır.
- **Yamyamlık (cannibalization) freni:** sorgunun anlamlı token'larının (≥3)
  tamamını başlığında taşıyan yayınlanmış bir yazı varsa komut **üretmeyi
  reddeder**, rakip yazıyı listeler ve tazeleme komutunu önerir. Bilinçli
  olarak yeni sayfa açmak için `--force`.
- `--slug=<mevcut-slug>` içeriği o slug'a yazar; **mevcut zayıf yazıyı yerinde
  tazelemenin** yolu budur. Yazı zaten varsa **ilk yayın tarihi korunur**
  (tazelik sinyali `updated_at`'te taşınır), yeni URL açılmaz, 301 gerekmez.

```
# En iyi yeni fırsattan yazı üret ve yayımla:
php artisan content:write

# Belirli bir sorgudan, önce kuru çalışma ile incele:
php artisan content:write "microblading kalıcı mı" --dry-run

# Taslak olarak kaydet (yayımlama, ping atma):
php artisan content:write "microblading kalıcı mı" --draft
```

```
# Aynı niyette zayıf bir yazı varsa onu yerinde tazele (yeni URL açma):
php artisan content:write "kaş pudralama ve microblading arasındaki fark" \
  --slug=microblading-vs-kas-pudralama
```

`--dry-run` slug, başlık, meta, kelime sayısı, türe göre gruplanmış iç linkler
ve tam `body_tr`'yi basar; hiçbir şey yazmaz.

### `content:service-copy {slug} {--apply} {--retries=2}`

Bir hizmet sayfasının Türkçe kopyası için yeniden yazım **önerir**.

- `{{CURRENT}}` mevcut TR alanlarının (yalnızca `desc_tr, intro_tr,
  aftercare_tr, benefits_tr, process_tr, faq_tr, keywords_tr, seo_title_tr,
  seo_desc_tr`) JSON dökümüdür.
- Hizmete denk düşen ve hizmet adını içeren en son dönem sorguları (ilk 12)
  prompt'a girer.
- Çıktı doğrulanır; aynı yeniden deneme döngüsü uygulanır.
- Alan alan fark basılır: skaler metinlerde `- eski` / `+ yeni` blokları,
  dizilerde çıkarılan/eklenen maddeler. Değişmeyen alanlar atlanır ve belirtilir.
- **Varsayılan davranış öneridir; hiçbir şey yazılmaz.** Yalnızca `--apply` ile
  değişen alanlar DB'ye kaydedilir. `is_active`, `gallery`, `related`,
  `sort_order`, `duration_min` ve tüm `_en` alanlarına dokunulmaz.

```
# Öneriyi (fark) gör:
php artisan content:service-copy microblading

# Onaylayıp uygula:
php artisan content:service-copy microblading --apply
```

## İç link + doğrulama garantileri

Üretilen her yazı/kopya, `ContentGuard` tarafından **canlı envantere** karşı
doğrulanır (`ContentInventory`: yayınlanmış ana site yazıları, aktif hizmetler,
alt hizmetler ve config'teki statik sayfalar). Guard şunları reddeder:

- Envanterde bulunmayan bir iç URL'ye verilen link (**uydurma link yok**).
- Yapılandırılan minimumun altında hizmet/blog linki
  (`config('content.post.min_service_links')`, `min_post_links`).
- Kelime aralığı (`min_words`–`max_words`), minimum `<h2>` sayısı (`min_h2`)
  dışına çıkan gövde.
- İzinli olmayan HTML etiketi (`allowed_tags`).
- Meta başlık/açıklama ve özet uzunluk sınırlarının aşılması
  (`meta_title_max`, `meta_desc_min/max`, `excerpt_max`).
- Hizmet kopyasında: `desc_tr` 80–320, `intro_tr` ≥200 karakter;
  benefits/process/faq 3–8 madde; keywords 4–12 adet; SEO başlık/açıklama
  meta sınırları içinde.

Doğrulama geçmeden **hiçbir kayıt yazılmaz**.

## Kimlik doğrulama: sadece abonelik, API anahtarı yok

Üretim `claude -p` (Claude Code CLI) ile yapılır ve **abonelik/OAuth kimliği**
kullanır. Çağrı şu biçimdedir:

```
claude -p --model sonnet --output-format json --tools "" \
  --strict-mcp-config --no-session-persistence \
  --json-schema '<şema>' '<prompt>'
```

- `.structured_output` (nesne) ve `.result` (JSON string) modelin yapılandırılmış
  çıktısını taşır; `.is_error=false`, `.subtype="success"` başarıyı gösterir.
- `--tools ""` tüm araçları kapatır (saf metin üretimi).
- **`--bare` ASLA geçilmez** (API-anahtarı kimliğine zorlar) ve
  **`--dangerously-skip-permissions` ASLA geçilmez.**

### `ANTHROPIC_API_KEY` alt süreçte silinir

Bu repoda `ANTHROPIC_API_KEY` **chatbot** için tanımlıdır
(`app/Support/AnthropicChat.php`). Laravel bu değişkeni alt süreçlere miras
verir ve `claude` CLI onu görürse abonelik oturumunu reddeder:

```
claude.ai connectors are disabled because ANTHROPIC_API_KEY or another auth
source is set and takes precedence over your claude.ai login
```

Bu yüzden `ClaudeCli`, alt süreç ortamından `ANTHROPIC_API_KEY`,
`ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_BASE_URL`, `ANTHROPIC_MODEL`,
`CLAUDE_CODE_USE_BEDROCK` ve `CLAUDE_CODE_USE_VERTEX` değişkenlerini siler.
`.env`'den bu anahtarları kaldırmanız **gerekmez**; chatbot çalışmaya devam
eder, üretim yine abonelik kimliğiyle yapılır.

### Ortam değişkenleri (`config/content.php` → `claude`)

| Değişken | Anlamı |
|----------|--------|
| `CLAUDE_BINARY` | `claude` çalıştırılabilirinin yolu. Üretimde: `/opt/plesk/node/24/bin/claude`. |
| `CLAUDE_MODEL` | Kullanılacak model (ör. `sonnet`). |
| `CLAUDE_TIMEOUT` | Tek çağrı zaman aşımı (saniye). |
| `CLAUDE_HOME` | CLI'nin `~/.claude`'unu arayacağı `HOME`. Üretimde: `/var/www/vhosts/striastudio.com.tr`. |
| `CLAUDE_CWD` | CLI'nin çalışacağı dizin. |
| `CLAUDE_CODE_OAUTH_TOKEN` | `claude setup-token` ile üretilen **1 yıl geçerli abonelik OAuth token'ı** (`sk-ant-oat01-…`). API anahtarı değildir. Üretimde bu kullanılır; boşsa CLI kendi interaktif oturumunu arar. |

## Üretim (production) kurulumu — Plesk / AlmaLinux

Sunucuda CLI'nin **abonelik kullanıcısı olarak** oturum açmış olması gerekir.

1. **Node'u PATH'e al** (Plesk Node 24):

   ```
   export PATH=/opt/plesk/node/24/bin:$PATH
   ```

2. **Claude Code CLI'yi kur:**

   ```
   npm i -g @anthropic-ai/claude-code
   ```

3. **Abonelik token'ını üret.** Sunucuda tarayıcı yok; interaktif oturum yerine
   uzun ömürlü token kullanılır. Abonelik kullanıcısı olarak çalıştır:

   ```
   sudo -u striastudio.com.tr_xn8csnuygii \
     env HOME=/var/www/vhosts/striastudio.com.tr \
         PATH=/opt/plesk/node/24/bin:/usr/bin:/bin \
     /opt/plesk/node/24/bin/claude setup-token
   ```

   Çıkan URL tarayıcıda açılır, dönen kod terminale yapıştırılır. Üretilen
   `sk-ant-oat01-…` token'ı **bir kez** gösterilir; `.env`'e
   `CLAUDE_CODE_OAUTH_TOKEN` olarak yazılır. Token 1 yıl sonra yenilenmeli.

4. **Doğrula:**

   ```
   claude -p --model sonnet --tools "" 'ping'
   ```

   Yanıt gelmeli, `.is_error=false` olmalı. `.env` içinde `CLAUDE_HOME` bu
   kullanıcının ev dizinini, `CLAUDE_BINARY` global npm binary yolunu
   göstermeli.

## Yayınlama davranışı (özet)

- **Blog yazıları anında yayımlanır.** `content:write` (`--draft` olmadan)
  `is_published=true`, `published_at=now()` yazar ve IndexNow ping'i atar.
- **Hizmet kopyası bir öneridir.** `content:service-copy` yalnızca fark basar;
  DB'ye yazmak için `--apply` gerekir.

## Sorun giderme

| Belirti | Neden / Çözüm |
|---------|---------------|
| `Claude CLI üretimi başarısız` / kimlik hatası | Oturum süresi dolmuş. Abonelik kullanıcısı olarak `claude auth login` (veya `claude setup-token`) tekrar çalıştırın; `CLAUDE_HOME`'un doğru ev dizinini gösterdiğini doğrulayın. |
| Zaman aşımı | `CLAUDE_TIMEOUT`'u artırın; sunucunun ağ çıkışını ve modelin (`CLAUDE_MODEL`) erişilebilirliğini kontrol edin. |
| Doğrulama döngüsü sürekli başarısız | `--dry-run` ile çıktıyı inceleyin; ihlaller ekrana basılır. Envanterin güncel olduğundan (yayınlanmış yazılar, aktif hizmetler) ve `config('content.post')` sınırlarının makul olduğundan emin olun. `--retries`'i geçici olarak artırabilirsiniz. |
| Yayın canlıda görünmüyor | Next.js **ISR penceresi 300 sn**'dir; değişiklik en geç ~5 dakikada yansır. IndexNow ayrı bir hızlandırmadır, ISR'nin yerini tutmaz. |
| IndexNow ping atılmıyor | `config('services.indexnow.key')` (ve `host`) tanımlı olmalı; anahtar boşsa `IndexNow::submit()` sessizce atlar. Yalnızca ana site (`site=null`) yayınlanan yazılar için ping atılır. |
