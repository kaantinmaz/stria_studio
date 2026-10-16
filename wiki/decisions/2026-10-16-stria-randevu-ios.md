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

Fiyat/ödeme, fotoğraf, kampanya bağlama — panelde kalıyor; API bu alanlara dokunmuyor. Canlı push yok: panelde yapılan değişiklik uygulamada yenileyince/ön plana gelince görünür.

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
