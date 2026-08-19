# Decision: Instagram gönderilerinin anasayfada gösterimi (sync + yerel görsel)

**Date:** 2026-08-19
**Status:** Accepted.

## Context

Sahip, Instagram'da paylaşılan gönderilerin `striastudio.com.tr` anasayfasında görünmesini istedi. O ana kadar Instagram sitede yalnızca **link** olarak vardı (`settings.instagram`, Nav/Footer/LinkTree).

Sunulan üç seçenek: (1) Graph API ile otomatik, (2) Filament'te elle yönetilen gönderi listesi, (3) ikisinin fallback'li birleşimi. Sahip **Graph API (otomatik)** dedi.

Kısıtlar:
- Instagram CDN URL'leri **imzalı ve süreli**; ham URL'i DB'ye yazmak birkaç gün sonra 403'e döner.
- Uzun ömürlü access token ~60 gün geçerli; süresi dolduğunda senkron durur.
- Sahte/örnek gönderi üretilmeyecek: veri yoksa bölüm hiç basılmayacak.

## Decision

1. **Desen: `reviews:sync-google` ile aynı** — harici API'den artisan komutuyla senkron, DB'ye yaz, `/api/*` ile servis et. Frontend Graph API'ye hiç dokunmaz; token tarayıcıya sızmaz.
2. **`instagram_posts` tablosu**: `ig_id` (unique), `permalink`, `media_type`, `caption` (nullable), `image` (public disk'teki göreli yol), `posted_at` (indexli). Model `InstagramPost`, `scopeLatestFirst` = `orderByDesc('posted_at')`.
3. **`php artisan instagram:sync`** → `GET https://graph.instagram.com/v23.0/{INSTAGRAM_USER_ID}/media` (`fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp`). Kimlik bilgileri `.env` → `config('services.instagram.{token,user_id,limit}')`; eksikse sessizce geçmez, açıklayıcı hata + exit 1.
4. **Görseller yerel indirilir** (`Storage::disk('public')` → `instagram/{ig_id}.jpg`), API kendi mutlak URL'imizi döner. Sebep: CDN URL'lerinin süreli olması. Zaten indirilmiş ve dosyası duran görsel tekrar indirilmez. VIDEO gönderilerinde kaynak `thumbnail_url`.
5. **Dayanıklılık kuralları**: API hatasında (exception veya `failed()`) mevcut kayıtlara **dokunulmaz** — site en son çekilen gönderileri göstermeye devam eder. Feed'de artık olmayan kayıtlar yalnızca **seen listesi boş değilken** silinir (kısmi/boş yanıtta toplu silme yok); silinen kaydın görseli de diskten kaldırılır.
6. **Zamanlama**: `routes/console.php`'de saatlik, `Europe/Istanbul`, çıktı `storage/logs/instagram-sync.log`'a eklenir (token süresi dolduğunda hata sessiz kalmasın).
7. **Frontend**: `GET /api/instagram` → `lib/content.ts::getInstagramPosts()` (hata/null → `[]`), `components/InstagramFeed.tsx` anasayfada `Gallery` ile `About` arasında. `Gallery.tsx` bölüm iskeletinin aynısı; kare kutucuklar gönderinin `permalink`'ine `target="_blank"` açılır, VIDEO kutucuklarında oynat rozeti, sağda `settings.instagram`'a giden CTA. `posts.length === 0` → bölüm hiç render edilmez.
8. **Filament kaynağı eklenmedi.** Liste Instagram'ın aynası; elle düzenlenecek bir şey yok. Tek gönderiyi gizleme ihtiyacı doğarsa `is_active` + kaynak o zaman eklenir.

## Consequences

- **Token ~60 günde bir yenilenmeli.** Süresi dolunca senkron saatlik hata verir ama **site kırılmaz**: indirilmiş gönderiler yerinde kalır, yalnızca güncellenmeyi bırakır. Otomatik `refresh_access_token` bilinçli olarak yazılmadı — yenilenen token'ı saklamak için token'ın DB'ye taşınması gerekirdi; süre dolduğunda `.env`'e yeni token yazmak yeterli.
- Token girilene kadar bölüm anasayfada **hiç görünmez** (boş liste → `null`). Sahte veri yok.
- `next.config.ts`'e `images.dangerouslyAllowLocalIP` (yalnız `NODE_ENV=development`) eklendi: Next 16'nın SSRF koruması private IP'ye çözülen uzak görselleri reddediyor, bu da yereldeki `127.0.0.1:8002` `/storage/**` remotePattern'lerini ölü bırakıyordu — Instagram görselleri değil, backend'in servis ettiği **tüm** görseller yerelde bundan etkileniyordu.
- Görseller diskte birikir (varsayılan 12 gönderi); feed'den düşen kayıtla birlikte dosyası da silindiği için sınırsız büyüme yok.

## Verification

- `php artisan migrate` → tablo oluştu. `php artisan route:list --path=instagram` → `GET api/instagram`.
- `php artisan instagram:sync` (token yok) → Türkçe uyarı + exit 1, HTTP isteği yok.
- Geçici 3 fixture kaydı (IMAGE/VIDEO/CAROUSEL_ALBUM) ile `curl /api/instagram` → kontrat birebir: `id`, `permalink`, `media_type`, `caption` (biri null), mutlak `image` URL'i, ISO8601 `posted_at`, `posted_at` azalan sıra. `/storage/instagram/*.jpg` → 200 `image/jpeg`.
- Tarayıcı (1280×900 ve 390×844): bölüm `Gallery`→`instagram`→`About` sırasında render oldu; 3 kare kutucuk (221×221 / 351×351), görseller yüklendi (`naturalWidth 279`), VIDEO kutucuğunda oynat rozeti, kutucuklar `permalink`'e `target="_blank"`, CTA `https://instagram.com/striastudio`. Fixture kayıtları ve dosyaları sonradan silindi.
- İlk render'da iki gerçek hata bulundu ve düzeltildi: kutucuk `<a>` inline olduğu için `aspect-square` etkisizdi (`block` eklendi); Next 16 private-IP koruması görselleri 0×0 bırakıyordu (dev-only config).
- `tsc --noEmit` temiz; `next build` başarılı (backend kapalıyken `getInstagramPosts` → `[]`, bölüm basılmıyor, build patlamıyor).
- `php artisan test --filter=InstagramFeedTest` yeşil (uç kontratı, limit, sync başarı/hata/temizlik senaryoları).

## Sources

Kod: `backend/database/migrations/2026_08_19_000001_create_instagram_posts_table.php`, `backend/app/Models/InstagramPost.php`, `backend/app/Console/Commands/SyncInstagramPosts.php`, `backend/app/Http/Controllers/InstagramController.php`, `backend/app/Http/Resources/InstagramPostResource.php`, `backend/config/services.php`, `backend/routes/{api,console}.php`, `backend/.env.example`, `backend/tests/Feature/InstagramFeedTest.php`, `frontend/components/InstagramFeed.tsx`, `frontend/lib/{content,i18n}.ts`, `frontend/app/page.tsx`, `frontend/next.config.ts`. Sahip isteği: 2026-08-19 oturumu.
