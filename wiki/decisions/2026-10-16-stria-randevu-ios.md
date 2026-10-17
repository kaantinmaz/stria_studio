# Decision: Stria Randevu — stüdyoya özel iPhone randevu uygulaması

**Date:** 2026-10-16
**Status:** Accepted, canlı backend'e bağlı, sahibin iPhone'una (iPhone 13 Pro Max) kablo ile kuruldu.

## Context

Sahip, yalnız stüdyonun kullanacağı bir iPhone uygulaması istedi: gün gün randevular, seans sayısı seçimi (ör. kamuflaj makyaj 4 seans), işlem (hizmet) seçimi, müşteri bilgisi girişi; listede `2/4` gibi seans rozeti, dokununca önceki seansların tarihleri dahil tüm ayrıntı. Uygulamadan yapılan değişiklik admin panelinde (`admin.striastudio.com.tr`) de görünmeli.

## Decision

- **Yeni API yok; mevcut masaüstü API'si (`/api/desktop`, Sanctum `desktop:manage`) genişletildi** — macOS uygulamasıyla aynı sözleşme, aynı revision/409 eşzamanlılık kuralı, aynı çalışma saati/çakışma denetimi. Ayrıntı: [[decisions/2026-09-13-desktop-api-integration]], `docs/DESKTOP_API.md`.
- Masaüstü API'sine eklenenler (paket kuralları [[decisions/2026-08-19-randevu-seanslari]] ile aynı, `AppointmentSessions` yeniden kullanıldı):
  - `POST /appointments` opsiyonel `session_total` (1..12) + `interval_days` (1..365, vars. 28) → `split()`; onaylı pakette **her seans** saat/çakışma denetiminden geçer, biri bile tutmazsa 422 `"N. seans (d.m.Y H:i): …"` ve hiçbir kayıt yazılmaz.
  - `POST /appointments/{id}/sessions` {revision, interval_days?} → `add()` (tek randevu 2 seanslı pakete döner).
  - `DELETE /appointments/{id}` {revision} → `remove()` (para yeni köke devreder, yeniden numaralandırır; tek randevuda düz silme).
- iOS istemcisi `randevu-ios/` (SwiftUI, iOS 17+, XcodeGen `project.yml` kaynak; `.xcodeproj` üretilir, repoda yok). Bundle `com.striastudio.randevu`, takım `NYD2BQLQN5`. Token + e-posta/parola Keychain'de; 401'de bir kez sessiz yeniden giriş (token 7 gün). Her yazmadan sonra `GET /state` yeniden çekilir (veri küçük).
- Ekranlar: Randevular (gün başlığı, hafta şeridi + nokta, kaydırarak gün değiştirme, satırda saat/müşteri/hizmet/durum/`N/M`), Randevu detayı (müşteri kartı + Ara/WhatsApp, Seanslar listesi — geçmiş seanslar "geçti", müşterinin diğer randevuları, hızlı durum, Seans ekle, Seansı çıkar/Randevuyu sil), Yeni randevu (müşteri seç/yeni müşteri, hizmet → süre, seans sayısı + aralık + tarih önizlemesi), Müşteriler (arama, düzenleme, geçmiş), Ayarlar (çıkış).

## Kapsam dışı (bilinçli)

Ödeme durumu (`is_paid`/`payment_method`/`paid_at` — Meta/Google dönüşüm yüklemesini tetikler), kampanya bağlama — panelde kalıyor; API bunlara dokunmuyor. (Fiyat, fotoğraf ve alt uygulamalar 2026-10-17'de eklendi, aşağıya bkz.) Canlı push yok: panelde yapılan değişiklik uygulamada yenileyince/ön plana gelince görünür.

## Güncelleme 2026-10-17 — giriş ekranı kaldırıldı (owner kararı)

Owner: "giriş yapmamız gerekmesin, sadece biz kullanacağız". Seçenekler sunuldu (bir kez giriş + kalıcı oturum / gömülü anahtar); owner **gömülü anahtarı** seçti.

- Prod'da `owner@striastudio.com` (id 1) için `desktop:manage` yetkili, **süresiz** (`expires_at = null`) Sanctum token: ad `Stria Randevu iPhone (gomulu)`. Backend kodu değişmedi — `EnsureDesktopAdmin` yalnız dolu `expires_at`'i kontrol ediyor, `config/sanctum.php` yok (global expiration null).
- Token `randevu-ios/Sources/EmbeddedToken.swift` içinde (`enum EmbeddedToken { static let value }`), dosya **gitignored** — temiz klondan derlemek için bu dosya yeniden oluşturulmalı (yeni token: prod'da `artisan tinker` dosyası ile `User::find(1)->createToken("…", ["desktop:manage"])`).
- Kaldırılanlar: `LoginView`, `Keychain.swift`/`StoredCredentials`, `login`/`logout` uçları istemcide, `DesktopUser`/`LoginResponse`, sessiz yeniden giriş, Ayarlar'daki Çıkış. Uygulama açılışta doğrudan `/state` çeker; hata alert ile gösterilir.
- **Risk (kabul edildi):** uygulama paketini ele geçiren panel API'sine tam erişir. İptal: prod `personal_access_tokens` tablosunda o satırı silmek (uygulama 401 → "Uygulama anahtarı geçersiz…").
- Yeni cihaz (iPhone19,7 / iOS 27) için Xcode 27.1 gerekti (26.6'nın DDI'sinde bu çip yok: `PersonalizedBundleMissingVariantError`).

## Güncelleme 2026-10-17 — tüm randevular, özel seans tarihleri, fiyat (owner istekleri)

- **Randevular ekranı:** açılışta TÜM randevular, gün bölümleri halinde (artan; ilk açılışta bugün/sonrasına kaydırır). Filtre menüsü: Tümü / Bugün / Bu hafta / Bu ay / Özel aralık. Hafta şeridi ve gün kaydırma kaldırıldı.
- **Özel seans tarihleri:** API `POST /appointments` yeni `session_starts` (2..N. seanslar, ISO 8601+offset, uzunluk `session_total-1`, kesin artan ve kökten sonra; varsa `interval_days` yok sayılır). `AppointmentSessions::splitAt()` tek yol, `split()` ona delege eder. iOS: Yeni randevuda "Tarihleri tek tek seç"; mevcut pakette detayda "Seans tarihlerini düzenle" sayfası (değişen seanslar sırayla `PATCH starts_at`, her çağrıda güncel revision).
- **Fiyat:** API randevu nesnesinde `price` (sayı/null), POST/PATCH yazılabilir (0..99999999.99, null temizler). Paket fiyatı yalnız kökte — çocuk seansa `price` PATCH → 422 "Paket fiyatı 1. seansta düzenlenir." iOS: Yeni/Düzenle'de Fiyat alanı (çocukta salt okunur), detayda "Fiyat"/"Paket fiyatı", listede ve müşteri geçmişinde fiyat (paket yalnız kök satırında), müşteri geçmişinde "Toplam" (paket bir kez; iptal edilenler de dahil — owner'a soruldu).
- Testler: `DesktopApi|AppointmentSessions` 39/39, tam suite 281/281. Canlı: monorepo `95fde37`/`8e28f37` → admin `e153166`, plesk fetch/deploy + `optimize:clear` + `package:discover`. Canlı API E2E: 3 seanslı özel tarihli + 4500,5 fiyatlı TEST paketi oluşturuldu (fiyat yalnız kökte, çocukta fiyat PATCH 422), sonra 3 seans silindi (randevu sayısı 10 → 10). Telefona Release build kuruldu; simülatörde canlı veriyle liste ekranı doğrulandı.

## Güncelleme 2026-10-17 (2) — yalnız yaklaşan günler, gün başına +, fotoğraf, alt uygulamalar

- **Liste:** geçmiş günler hiçbir filtrede gösterilmez (owner: "geçmiş tarihleri görmemize gerek yok"); Özel aralık bugünden önce başlayamaz. Her gün başlığında `+` → o güne Yeni randevu. Paket "Seanslar" bölümü ve müşteri geçmişi geçmişi göstermeye devam eder.
- **Fotoğraf:** API `POST /appointments/{id}/photos` (multipart `photos[]`, ≤10 dosya, image ≤10 MB, 201) ve `DELETE /appointments/{id}/photos/{index}` {revision}; randevu nesnesinde `photos` (mutlak URL). Mevcut `appointments.photos` + `public` disk (`appointments/`), Calendar ile aynı model; seans başına (pakette paylaşılmaz). URL mantığı `Appointment::photoUrls()`'ta tek yerde. iOS: detayda Fotoğraflar (PhotosPicker, 2048 px/JPEG 0.8 küçültme, tam ekran, uzun bas → Sil), Yeni randevuda isteğe bağlı fotoğraf (oluşturma sonrası köke yüklenir).
- **Alt uygulamalar:** migration `2026_10_17_000001_add_subservices_to_appointments_table` (`appointments.subservices` JSON). `/state` hizmetlerinde `subservices` (ad listesi, `services.subservices_tr[*].name`). POST/PATCH `subservices` seçili hizmete ait olmalı (aksi 422); **paket düzeyi** — kökte, `createChild`/`resync` ile çocuklara yayılır (service_id gibi); çocukta PATCH 422. Hizmet değişip `subservices` gönderilmezse temizlenir. Panel takvim modalında da "Alt uygulamalar" checkbox listesi.
- Testler 286/286. Canlı: monorepo → admin `a4157b2`, plesk fetch/deploy + `migrate --force` + `optimize:clear` + `package:discover`. **GOTCHA:** deploy sonrası yeni rotalar CLI `route:list`'te görünürken web ~1 dk 404 verdi (FPM opcache yeniden doğrulama gecikmesi) — kendiliğinden düzeldi. Canlı E2E: Kamuflaj 2 seanslı TEST paketi (2 alt uygulama iki seansa yayıldı) → fotoğraf yükle (URL 200) → sil (dosya 404) → paket silindi (10 → 10).

## Kurulum / yeniden derleme

```bash
cd randevu-ios && xcodegen generate
xcodebuild -project StriaRandevu.xcodeproj -scheme StriaRandevu -configuration Release \
  -destination 'id=<UDID>' -derivedDataPath build/dd -allowProvisioningUpdates build
xcrun devicectl device install app --device <devicectl id> build/dd/Build/Products/Release-iphoneos/StriaRandevu.app
```

Geliştirme imzası (Apple Development) — profil süresi dolarsa aynı komutlarla yeniden kurulur.

## Verification

- Backend: `php artisan test --filter='DesktopApi|AppointmentSessions'` 33/33 (7 yeni test); tam suite 275/275.
- Canlı deploy 2026-10-16: commit `d2262c1` → `stria-admin` `ccf9257`, `plesk ext git --fetch/--deploy`, `optimize:clear` + `package:discover`; `route:list` yeni iki rota dahil 10 desktop rotası, oturumsuz `/state` ve `DELETE` 401, `/api/services` ve `/admin/login` 200. Yedek: sunucuda `/root/stria-randevu-backup-20261016222910`. Gerçek veri yazılmadı.
- iOS: simülatörde, geçici SQLite backend'e karşı XCUITest uçtan uca: giriş → Ayşe/Kamuflaj 4 seans oluştur (listede `1/4`) → detayda 4 seans → Seans ekle (5/5) → 2. seansı aç (`2/5`) → Seansı çıkar → DB'de 1..4/4, aralık 28 gün korunmuş. Release build cihaza kuruldu ve açıldı. Canlı hesapla giriş sahibin kendi admin hesabıyla yapılır (parola bizde yok).
