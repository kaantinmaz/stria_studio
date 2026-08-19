# App Store Gönderim — Stria Studio

_Son güncelleme: 2026-08-12 · Sürüm 1.0.0 (build 3)_

Bu dosya, uygulama tarafında **tamamlanan** işleri ve App Store Connect'te **senin yapman gereken** adımları ayırır.

## 1. Kodda tamamlandı (doğrulanmış)

| Konu | Ne yapıldı | Kanıt |
|---|---|---|
| Hesap silme (Guideline 5.1.1(v)) | `DELETE /api/app/account` tek transaction'da app_user + token'ları siler, bağlı müşteri kaydını anonimleştirir (ad → "Silinmiş Müşteri"; telefon/e-posta/Instagram/not → boş; fotoğraflar diskten silinir), randevular kimliksiz kalır | `backend/app/Support/CustomerAnonymizer.php`, `AuthController@destroy`, `backend/tests/Feature/AppApiTest.php`; canlı API testi: 204 + anonimleşmiş kayıt |
| AI sohbet onayı (Guideline 5.1.2) | Sohbet ilk açılışta tam ekran onay: gönderilen veri, alıcı (Anthropic), amaç; onay olmadan `/api/app/chat` çağrılmıyor; onay SecureStore `chat_consent_v1`; Profil'den geri çekilebiliyor ve sonraki açılışta yeniden soruluyor | `mobile/components/chat-widget.tsx`, `mobile/lib/storage.ts`, `mobile/app/(tabs)/profil.tsx`; canlı akış testi (sor → kabul → kalıcı → geri çek → yeniden sor) |
| Export compliance | `app.json` → `ios.config.usesNonExemptEncryption: false`; `Info.plist` → `ITSAppUsesNonExemptEncryption = false` | `plutil -p Info.plist` |
| Privacy manifest | `PrivacyInfo.xcprivacy` gerçek toplamayı bildiriyor: Name, Email, Phone, User ID, Purchase History, Other User Content, Product Interaction — hepsi Linked=true, Tracking=false, amaç App Functionality | `plutil -lint` OK |
| Sürüm hizalaması | app.json 1.0.0 / build 3; Info.plist `$(MARKETING_VERSION)` / `$(CURRENT_PROJECT_VERSION)`; pbxproj 1.0.0 / 3 | Release build |
| Gizlilik politikası erişimi | Giriş ve kayıt ekranlarına politika bağlantısı eklendi (kayıtta "hesap oluşturarak kabul" ifadesiyle); Profil'de zaten vardı | Canlı ekran doğrulaması |
| Kullanılmayan izin metni | `NSFaceIDUsageDescription` kaldırıldı (biyometrik akış yok) | `Info.plist` |
| Politika metni | `frontend/app/gizlilik-politikasi/page.tsx` gerçek davranışa hizalandı: silme/anonimleştirme, AI sohbeti + onay, QR/kamera, toplanan veri tipleri | `npx tsc --noEmit` OK |
| Mağaza görselleri | 6.9" (1290×2796) 5 screenshot + 6.5" (1242×2688) kopyaları | `screenshots/render/` |
| Mağaza metinleri | TR + EN tüm ASC alanları, limit içinde | `metadata-tr.md` |

## 2. App Store Connect'te senin yapacakların

1. **İnceleme hesabı**: production'da uygulamadan "Hesap oluştur" ile bir hesap aç (ör. `review@striastudio.com.tr`), Filament panelinden bir müşteri kaydına eşle, hesaba 1 gelecek + 1 geçmiş onaylı randevu ekle. Kimlik bilgilerini `metadata-tr.md` → App Review Notes içindeki iki yer tutucunun yerine yaz ve ASC → App Review Information alanına gir. İnceleme bitene kadar hesabı silme.
2. **Metinler**: `metadata-tr.md` içindeki Name / Subtitle / Promotional Text / Description / Keywords / What's New alanlarını TR ve EN yerelleştirmelerine kopyala.
3. **URL'ler**: Support `https://striastudio.com.tr/iletisim` · Marketing `https://striastudio.com.tr` · Privacy Policy `https://striastudio.com.tr/gizlilik-politikasi`.
4. **App Privacy anketi**: `metadata-tr.md` → "App Privacy — Nutrition Label" tablosunu birebir gir. Tracking: **No**.
5. **Kategori / yaş**: Lifestyle (birincil) + Health & Fitness; yaş derecelendirme cevapları `metadata-tr.md` içinde.
6. **Screenshot yükleme**: `screenshots/render/*.png` (6.9"). 6.5" istenirse `screenshots/render/6_5/`.
7. **Export compliance sorusu**: "Yalnızca muaf şifreleme (HTTPS/platform)" → evet; plist anahtarı zaten `false` olduğu için genelde tekrar sorulmaz.
8. **Build**: Xcode 26.6 ile Release arşivi al (`mobile/ios/StriaStudio.xcworkspace`, scheme `StriaStudio`), Organizer'dan yükle. Aynı build numarası ikinci kez yüklenemez — tekrar gerekiyorsa `app.json` `ios.buildNumber` ve pbxproj `CURRENT_PROJECT_VERSION` birlikte artırılmalı.
9. **Prod API kontrolü**: uygulama `https://admin.striastudio.com.tr` adresine bağlanıyor; gönderim öncesi login/randevu/kampanya uçlarının canlıda çalıştığını doğrula.

## 3. Bilinçli olarak yapılmayanlar

- **Push bildirimi yok** — uygulama içi bildirim listesi var; mağaza metinleri bunu doğru anlatıyor.
- **Sign in with Apple yok** — yalnız first-party e-posta/şifre + QR eşleşmesi var; 4.8 tetiklenmiyor. Sosyal login eklenirse tekrar değerlendirilmeli.
- **iPad desteği yok** (`supportsTablet: false`, `TARGETED_DEVICE_FAMILY=1`) — iPad screenshot gerekmiyor.
- **EAS yapılandırması yok** — build yerel Xcode üzerinden alınıyor.
