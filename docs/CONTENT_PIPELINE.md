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
`Pozisyon`). Blog üretimi **günlük otomatiktir**. GSC kimliği tanımlıysa sorgu
verisi artık **haftalık otomatik** gelir (`gsc:sync`, CSV içe aktarımı yedek
olarak çalışmaya devam eder); hizmet SSS eklemeleri ve düşük TO'lu hizmetin
SEO başlık/açıklaması da **haftalık otomatik** güncellenir (bkz.
[Haftalık SEO döngüsü](#haftalık-seo-döngüsü)). Manuel
`content:service-copy` aynen çalışır.

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

## Haftalık SEO döngüsü

Her **Pazartesi 06:00 (Europe/Istanbul)** `seo:weekly` çalışır. **Onay adımı
yoktur** (sahibinin kararı); bunun yerine her otomatik değişikliğin önce/sonra
kopyası `content_revisions` tablosuna yazılır ve `seo:revert` ile geri alınır.

```
php artisan seo:weekly
        │
        ├──► gsc:sync      # GSC API → search_queries (+top_page) + search_pages   (kimlik yoksa atlanır)
        ├──► serp:sync     # Serper.dev → serp_results (PAA, ilgili aramalar, kendi pozisyonumuz)  (anahtar yoksa atlanır)
        │
        ├──► yeni konular  # PAA + ilgili aramalar → search_queries (source='serp', gösterim 0)
        │                  #   günlük content:write önce gerçek GSC sorgularını, sonra bunları yazar
        ├──► yazı tazeleme # pozisyon kaybı / vurucu mesafe → content:write --slug --force
        ├──► hizmet SSS    # hizmet anahtar kelimesinin PAA soruları → Claude (service-faq) → faq_tr'ye ekle
        ├──► hizmet meta   # vurucu mesafe + düşük TO, TEK hizmet → content:service-copy --apply --seo-only
        │
        └──► rapor         # storage/app/seo-reports/<dönem>.md + Telegram özeti
```

Alt senkronlardan biri hata verirse uyarı basılır, döngü eldeki (önceki) veriyle
devam eder. Hiçbir adım komutu durdurmaz; komut her zaman başarı koduyla biter.

### Zamanlama

```php
Schedule::command('seo:weekly')
    ->weeklyOn(1, '06:00')
    ->timezone('Europe/Istanbul')
    ->withoutOverlapping(120)
    ->appendOutputTo(storage_path('logs/seo-weekly.log'));
```

Log: `backend/storage/logs/seo-weekly.log`. Elle denemek için:
`php artisan schedule:test --name="seo:weekly"` veya önce
`php artisan seo:weekly --dry-run`.

### Dönem biçimi

Haftalık dönem kimliği **`YYYYWww`** (ör. `2026W42`): son tam 28 günlük GSC
penceresinin (bitiş = bugün − 3 gün) **bitiş gününün ISO haftası**. Eski CSV
dönemleri `YYYY-MM`'dir. `'-'` (0x2D) `'W'`'den (0x57) küçük olduğundan aynı yıl
içinde **sözlük sırasıyla `max('period')` haftalık dönemi seçer**; `content:plan`,
`content:write` ve `content:service-copy` değişmeden en yeni haftalık veriyle
çalışır. "Önceki dönem" karşılaştırmaları yalnızca `____W__` biçimli dönemlere
bakar.

### `gsc:sync {--period=}`

Search Console Search Analytics API'sinden son tam pencerenin verisini çeker
(servis hesabı JWT, ek bağımlılık yok, `dataState: final`): `query`,
`query+page` ve `page` boyutları. `search_queries` `(query, period)` üzerinde
güncellenir (`source='gsc'`, `top_page` = sorgunun en çok tıklanan sayfası);
`search_pages` `(page, period)` üzerinde güncellenir. Kimlik yoksa hata koduyla
döner (`seo:weekly` bu durumda hiç çağırmaz).

### `serp:sync {--period=} {--limit=}`

Serper.dev ile Google TR SERP'ini (Ankara konumu) çeker. Önce **tüm aktif
hizmetlerin `keywords_tr`'si**, sonra en yeni dönemin gösterimi en yüksek GSC
sorguları (marka sorguları hariç) alınır; toplam `--limit` /
`SERPER_WEEKLY_LIMIT` ile sınırlıdır (sorgu başına ~1 kredi). Dönemde zaten
satırı olan sorgu atlanır (yeniden çalıştırma kredi harcamaz). `serp_results`'a
ilk 10 organik sonuç, kendi pozisyonumuz (`config('seo.own_hosts')`: ana site +
mikrositeler), PAA soruları, ilgili aramalar, answer box ve yerel sonuçlar
yazılır. Tek sorgunun hatası diğerlerini durdurmaz.

**Serper kısıtı (2026-10-18'de doğrulandı):** `gl` veya `location` verilince
Serper "Diğer sorular" ve ilgili aramaları **hiç döndürmüyor**. Bu yüzden
konumlu sıralama çağrısı bunları içermezse, ilk `SERPER_DISCOVERY_LIMIT`
(varsayılan 20) sorgu için yalnız `hl=tr` ile ikinci bir "keşif" çağrısı
yapılır. Haftada en çok `SERPER_WEEKLY_LIMIT + SERPER_DISCOVERY_LIMIT` kredi
harcanır.

### `seo:weekly {--dry-run}`

Seçim mantığı `App\Support\SeoPlanner`'dadır (yalnızca okur):

- **Yeni konular:** dönemin PAA soruları + ilgili aramaları; 10–120 karakter,
  2–12 kelime; marka/gezinme (`stria`, `instagram`, `adres`, `telefon`,
  `iletisim`, `yol tarifi`, `nerede`, `com`, `www`) ve İngilizce sorular elenir;
  `QueryCoverage` sınıfı `new` olmalı ve aynı niyetli yazı olmamalı; dönemde
  zaten olan sorgular atlanır. Haftada en fazla `topics_per_week` (10).
  Konular **en son GSC dönemine** eklenir (GSC API yoksa son CSV dönemi, ör.
  `2026-09`): kendi haftalık dönemlerine yazılsalar `max('period')` o döneme
  kayar ve `content:write` gerçek GSC sorgularını görmezdi.
- **Yazı tazeleme:** ana sitenin `/blog/<slug>` sayfaları. Önceki haftaya göre
  ortalama pozisyon `refresh.position_drop` (3) veya daha fazla kötüleştiyse
  **`drop`**; değilse pozisyon `striking_min`–`striking_max` (8–20) ve gösterim
  ≥ `min_impressions` (50) ise **`striking`**. Önce düşüşler (büyükten küçüğe),
  sonra vurucu mesafedekiler (gösterime göre); haftada en fazla
  `refresh.max_per_week` (3). Son 28 günde tazelenmiş yazı atlanır. Hedef sorgu:
  `top_page`'i bu yazı olan en yüksek gösterimli sorgu, yoksa yazı başlığı.
  Üretim `content:write` ile yapılır (aynı doğrulama); başarısız tazelemede
  revizyon yazılmaz, raporda `başarısız` görünür.
- **Hizmet SSS:** hizmetin `keywords_tr`'sinden biriyle çekilmiş SERP'in PAA
  soruları; hizmete denk düşmeli (`content:service-copy` ile aynı kural), mevcut
  SSS'lerle bulanık tekrar (≥%80 benzerlik) olmamalı. Hizmet başına haftada en
  fazla `service.faq_new_per_week` (2), toplam en fazla `service.faq_max` (16)
  SSS. Cevaplar `resources/prompts/service-faq.md` ile **yalnızca sayfadaki
  olgulardan** üretilir; içerik cevabı taşımıyorsa model boş cevap döner ve
  soru eklenmez. `ContentGuard::faqViolations` (cevap 60–500 karakter, HTML yok,
  yasaklı ifade yok) geçmezse bir kez düzeltme istenir, yine geçmezse hiçbir şey
  eklenmez.
- **Hizmet meta:** ana sitedeki `/hizmetler/<slug>` sayfası pozisyon
  `service.striking_min`–`striking_max` (4–15), gösterim ≥ `min_impressions`
  (100) ve TO < `ctr_below` (%2) olan hizmetlerden gösterimi en yüksek **tek**
  hizmet (son 28 günde meta'sı yeniden yazılmış olan atlanır).
  `content:service-copy <slug> --apply --seo-only` çağrılır: tam kopya üretilip
  doğrulanır ama yalnızca `seo_title_tr` ve `seo_desc_tr` yazılır.
- **Rapor:** `storage/app/seo-reports/<dönem>.md` (aynı haftadaki sonraki gerçek çalışmalar sona eklenir; `--dry-run` → `<dönem>-dry-run.md`) — pencere, en çok
  yükselen/düşen 5 sorgu (≥10 gösterim), SERP'te kendi pozisyonumuz ve önceki
  haftaya göre değişim (`yeni` / `kayıp` / `+n` = n sıra yükseldi), eklenen
  konular, tazelenen yazılar, SSS/meta güncellemeleri, kullanılan Serper kredisi.
  Kısa özet Telegram'a gider.

`--dry-run`: senkron, DB yazımı ve Claude çağrısı yapmaz; planı basar ve raporu
yazar.

### `seo:revert {id?} {--list}`

```
php artisan seo:revert --list    # son 20 revizyon: id, tarih, neden, içerik#id
php artisan seo:revert 42        # revizyonun `before` alanlarını içeriğe geri yazar
```

Nedenler: `blog-refresh` (yazının başlık/özet/gövde/meta'sı), `service-faq`
(`faq_tr`), `service-meta` (`seo_title_tr`, `seo_desc_tr`). Bir revizyon yalnızca
bir kez geri alınır (`reverted_at`). Geri alma, sonraki otomatik değişiklikleri
de ezer; aynı içeriğe birden fazla revizyon varsa en yeniden eskiye doğru geri
alın.

### Ortam değişkenleri (`config/seo.php`)

| Değişken | Anlamı |
|----------|--------|
| `GSC_CREDENTIALS` | Servis hesabı JSON anahtarının **mutlak yolu** (webroot ve repo dışında). Boşsa `gsc:sync` atlanır. |
| `GSC_SITE_URL` | Search Console mülk kimliği: `sc-domain:striastudio.com.tr` veya `https://striastudio.com.tr/`. |
| `SERPER_API_KEY` | serper.dev API anahtarı. Boşsa `serp:sync` atlanır. |
| `SERPER_WEEKLY_LIMIT` | Haftalık en fazla SERP sıralama sorgusu (= kredi), varsayılan 60. |
| `SERPER_DISCOVERY_LIMIT` | Bunlardan PAA/ilgili aramalar için ek keşif çağrısı yapılacak en fazla sorgu, varsayılan 20. |

Sınırlar (`refresh.*`, `service.*`, `topics_per_week`) `config/seo.php`'dedir.

### Sunucu kurulumu (GSC servis hesabı)

1. Google Cloud Console'da bir proje seçin/oluşturun, **Google Search Console
   API**'yi etkinleştirin.
2. **IAM → Servis hesapları** altında bir servis hesabı oluşturun (rol
   gerekmez) ve **JSON anahtarı** indirin.
3. Search Console → mülk → **Ayarlar → Kullanıcılar ve izinler** → servis
   hesabının e-postasını (`…@….iam.gserviceaccount.com`) **kısıtlı** kullanıcı
   olarak ekleyin.
4. JSON'u **webroot ve repo dışına** koyun ve yalnızca abonelik kullanıcısının
   okuyabileceği şekilde izin verin:

   ```
   mkdir -p /var/www/vhosts/striastudio.com.tr/private
   mv gsc.json /var/www/vhosts/striastudio.com.tr/private/gsc.json
   chown striastudio.com.tr_xn8csnuygii /var/www/vhosts/striastudio.com.tr/private/gsc.json
   chmod 600 /var/www/vhosts/striastudio.com.tr/private/gsc.json
   ```

5. `.env`: `GSC_CREDENTIALS=/var/www/vhosts/striastudio.com.tr/private/gsc.json`,
   `GSC_SITE_URL=sc-domain:striastudio.com.tr`, `SERPER_API_KEY=…`; ardından
   `php artisan config:cache`.
6. Doğrulayın: `php artisan gsc:sync` ve `php artisan serp:sync --limit=1`.

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

### `content:service-copy {slug} {--apply} {--retries=2} {--seo-only}`

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
- `--seo-only`: fark ve yazma yalnızca `seo_title_tr` ve `seo_desc_tr` için
  yapılır (`seo:weekly`'nin otomatik meta yolu).

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
- **Hizmet kopyası (manuel) bir öneridir.** `content:service-copy` yalnızca fark
  basar; DB'ye yazmak için `--apply` gerekir.
- **Hizmet SSS ve SEO meta'sı haftalık otomatik güncellenir.** `seo:weekly`
  onay beklemeden SSS ekler ve tek bir hizmetin `seo_title_tr`/`seo_desc_tr`'sini
  yeniden yazar; her değişikliğin önce/sonra kopyası `content_revisions`'tadır
  (`seo:revert` ile geri alınır).
- **Dikkat:** manuel tam `content:service-copy --apply` şema gereği **en fazla 8
  SSS** döndürür; otomatik eklenmiş SSS'lerle 8'i aşan bir sayfada çalıştırılırsa
  fazlası **ezilir**. Gerekirse önce `seo:revert --list` ile kayıtları not edin.

## Sorun giderme

| Belirti | Neden / Çözüm |
|---------|---------------|
| `claude CLI bulunamadı (CLAUDE_BINARY)` / exit 127 | **Plesk'in Node güncellemesi** `/opt/plesk/node/<v>/lib/node_modules`'ü sıfırlıyor ve oraya global kurulmuş `claude` siliniyor (24 Eyl 2026'da yaşandı, 9 gün yazı çıkmadı). Bu yüzden kurulum artık **`/usr/local/claude-code`** altında ve `CLAUDE_BINARY=/usr/local/bin/claude`. Yeniden kurmak için: `npm i -g --prefix /usr/local/claude-code @anthropic-ai/claude-code && ln -sf /usr/local/claude-code/bin/claude /usr/local/bin/claude` |
| Günlerdir yazı çıkmıyor ama kimse fark etmiyor | Artık her başarısızlık **Telegram'a** bildiriliyor (`TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID`, ads digest ile aynı kanal). Bildirim gelmiyorsa `laravel.log`'a bakın. |
| Aynı sorgu her gün seçilip doğrulamaya takılıyor | Otomatik mod artık **3 adayı sırayla** dener, hepsi düşerse tazeleme moduna geçer. Sorgunun statik bir sayfası varsa (`/mylamination` gibi) `covered` sayılır ve hiç seçilmez. |
| `Claude CLI üretimi başarısız` / kimlik hatası | Oturum süresi dolmuş. Abonelik kullanıcısı olarak `claude auth login` (veya `claude setup-token`) tekrar çalıştırın; `CLAUDE_HOME`'un doğru ev dizinini gösterdiğini doğrulayın. |
| Zaman aşımı | `CLAUDE_TIMEOUT`'u artırın; sunucunun ağ çıkışını ve modelin (`CLAUDE_MODEL`) erişilebilirliğini kontrol edin. |
| Doğrulama döngüsü sürekli başarısız | `--dry-run` ile çıktıyı inceleyin; ihlaller ekrana basılır. Envanterin güncel olduğundan (yayınlanmış yazılar, aktif hizmetler) ve `config('content.post')` sınırlarının makul olduğundan emin olun. `--retries`'i geçici olarak artırabilirsiniz. |
| Yayın canlıda görünmüyor | Next.js **ISR penceresi 300 sn**'dir; değişiklik en geç ~5 dakikada yansır. IndexNow ayrı bir hızlandırmadır, ISR'nin yerini tutmaz. |
| IndexNow ping atılmıyor | `config('services.indexnow.key')` (ve `host`) tanımlı olmalı; anahtar boşsa `IndexNow::submit()` sessizce atlar. Yalnızca ana site (`site=null`) yayınlanan yazılar için ping atılır. |
