# Decision: Yorum & yıldızlı puan sistemi (gerçek veri, iki kaynak)

**Date:** 2026-08-17
**Status:** Accepted. [issues/2026-07-12-mikroblading-seo-geo-audit] içindeki "reviews→AggregateRating" sahibi blokerini kısmen kapatır (altyapı hazır; gerçek yorum girişi sahipte).

## Context

Sahip, hizmet listelerinde ve hizmet detayında yıldızlı puan istedi ("kullanıcıların güvenini sağlamalıyız"). O ana kadar sitede tek "puan" göstergesi `Hero.tsx` içinde **sabit kodlanmış** `5.0 ★★★★★` çipiydi — hiçbir veriye bağlı değildi. Hiçbir yorum/puan tablosu, modeli veya admin ekranı yoktu.

Kısıt: uydurma puan hem Google structured-data politikasını (self-serving / sahte içerik → manuel işlem) hem 6502 sayılı Tüketici Kanunu'nun tüketici değerlendirmeleri hükümlerini ihlal eder. Ayrıca `Service` tipi Google'ın review-snippet destekli tipleri arasında değil; yıldızların değeri **SERP rich result'ta değil, dönüşüm oranındadır**.

## Decision

İki **gerçek** kaynak, ayrı ayrı gösterilir; hiçbir yerde varsayılan/örnek değer yok — veri yoksa bileşen `null` döner (ne yıldız, ne "0 yorum").

1. **Hizmet bazlı müşteri yorumları** — yeni `service_reviews` tablosu (`service_id` nullable = işletme geneli, `author_name`, `rating` 1–5, `body`/`body_en`, `source` studio|google|instagram|whatsapp, `source_url` kanıt linki, `reviewed_at`, `is_active` moderasyon, `sort_order`). Filament `İçerik > Yorumlar` CRUD'u (Faqs/GalleryImages kalıbı) ile sahibi girer; form gerçeklik + KVKK rızası uyarısı taşır.
2. **Google İşletme Profili puanı** — `settings` tablosuna `google_place_id`, `google_rating`, `google_review_count`, `google_maps_url`, `google_reviews_synced_at`. `ManageSettings > Google Puanı` sekmesinden elle girilebilir **veya** `php artisan reviews:sync-google {--site=}` ile Places API (New) `places.googleapis.com/v1/places/{id}` (`X-Goog-FieldMask: rating,userRatingCount,googleMapsUri`, `config('services.google.places_key')`) üzerinden senkronlanır. Anahtar/Place ID yoksa komut açıklayıcı hata + `FAILURE` döner, hiçbir şey yazmaz.
3. **API** — `ServiceListResource` + `rating_avg` (aktif yorumlardan, 1 ondalık, yoksa `null`) ve `rating_count`; `ServiceApiResource` ayrıca `reviews[]`. Aggregate `withCount`/`withAvg` ile, N+1 yok. `SettingResource` 4 google alanını yayınlar.
4. **Frontend** — `Stars` (kesirli dolgu, `aria-hidden`), `RatingBadge` (kart rozeti; `value==null || count===0` → `null`), `GoogleRatingBadge` + `useGoogleRating()` (ortak metin/locale mantığı; Hero'nun koyu çipi aynı hook'u kullanır), `ServiceReviews` (detay bölümü). Bağlandığı yerler: `/hizmetler` kartları, anasayfa `Services` + `ServiceStrip`, `ServicePage`, `SubServicePage`, `Hero` çipi (sabit 5.0 kaldırıldı).
5. **JSON-LD** — `serviceSchema(..., rating)` yalnızca `rating_avg != null && rating_count > 0` iken `AggregateRating` + ilk 5 `Review` düğümünü basar. Veri yoksa çıktı birebir eskisi gibi. Alt hizmet şemasına rating **eklenmez** (yorumlar üst hizmete aittir); alt hizmet sayfası bunu görünür metinle de belirtir ("<Hizmet> hizmetimiz için bırakılan değerlendirmeler").

## Consequences

- Yıldız göstermek artık **içerik girişine** bağlı: sahip Filament'ten gerçek yorum girmezse hiçbir yüzeyde yıldız çıkmaz. Bu kasıtlı — boş durum, sahte veriden iyidir.
- Google puanı işletme geneli; hizmet kartlarında **hizmete özel** puan yalnızca `service_reviews`'tan gelir. İki kaynak görsel olarak ayrı (Google rozeti kaynağı açıkça yazar).
- Sayfalar ISR (`revalidate = 300`) olduğu için yeni yorum canlıda ~5 dk içinde görünür.
- Ziyaretçi yorum formu (self-servis + moderasyon) **kapsam dışı bırakıldı**; ileride `service_reviews` tablosu değişmeden üstüne eklenebilir (`is_active=false` ile giriş).

## Verification

- Backend: `php artisan test --filter='ServiceReviewApiTest|ServiceApiTest'` → 13 test / 51 assertion yeşil. Migration MAMP `stria_studio` üzerinde çalıştı. Filament ekranları (`/admin/service-reviews` index/create/edit, `/admin/manage-settings`) oturum açmış smoke ile 200.
- `reviews:sync-google`: anahtarsız → açıklayıcı uyarı + exit 1; Place ID'siz → uyarı; geçersiz anahtarla gerçek Places API'ye ulaşıp HTTP 400'ü yakalıyor (çökme yok).
- Frontend: `tsc --noEmit` temiz, `next build` başarılı, eslint temiz.
- Tarayıcı (gerçek veri girilip sonra silinerek): 3 yorumlu microblading → kart `4,5 (2)`, detay özeti, Google kaynaklı yorumda "Google'da görüntüle", `AggregateRating {4.5, 2}` + 2 `Review` düğümü; alt hizmet sayfası üst hizmet rozeti + atıf cümlesi; Hero'da `4,9 · 127 Google yorumu`; `google_review_count` null iken etiket "0 yorum" yerine "Google". **Veri silindikten sonra:** hiçbir sayfada yıldız/rozet/bölüm/AggregateRating yok. Doğrulama verisi DB'den temizlendi.

## Sources

Kod: `backend/database/migrations/2026_08_17_00000{1,2}_*.php`, `backend/app/Models/{ServiceReview,Service,Setting}.php`, `backend/app/Filament/Resources/ServiceReviews/**`, `backend/app/Filament/Pages/ManageSettings.php`, `backend/app/Http/Resources/{ServiceReview,ServiceList,ServiceApi,Setting}Resource.php`, `backend/app/Http/Controllers/ServiceController.php`, `backend/app/Console/Commands/SyncGoogleReviews.php`, `backend/tests/Feature/ServiceReviewApiTest.php`, `frontend/components/{Stars,RatingBadge,GoogleRatingBadge,ServiceReviews,Hero,Services,ServiceStrip,ServicePage,SubServicePage,schema}.{tsx,ts}`, `frontend/lib/{content,i18n}.ts`. Sahip kararı: 2026-08-17 oturumu (kaynak seçimi "ikisi birden", kapsam "alt hizmetler + Hero dahil").
