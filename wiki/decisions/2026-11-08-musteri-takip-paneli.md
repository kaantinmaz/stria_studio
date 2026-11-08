# Müşteri takip paneli — musteri.striastudio.com.tr

**Tarih:** 2026-11-08 · **Durum:** canlıda (2026-11-09)

## Context

Sahip, Estebella için yapılan müşteri takip panelinin (`/Applications/MAMP/htdocs/estebella/panel/`, vanilla PHP, ayrı `panel_*` tabloları) bir benzerini Stria için istedi. Panel randevu tarihlerine odaklanacak, mobil uygulamadan gelen randevular burada da tüm detaylarıyla görünecek ve `musteri.striastudio.com.tr` adresinden açılacak.

Mevcut durum: iOS personel uygulaması (`/api/desktop`) ve Expo müşteri uygulaması (`/api/app/appointments`, `status=requested`) zaten aynı `appointments` tablosuna yazıyor. Bu randevular `admin.striastudio.com.tr` Filament panelinde de görünüyordu.

## Decision

Sahibe üç seçenek sunuldu: ikinci Filament paneli (önerilen), mevcut admin'e takma alan adı, Laravel içinde Estebella tarzı ayrı panel. Sahip **Estebella tarzı ayrı paneli** ve **yalnız sahip kullanımını** seçti.

- Panel Laravel backend'in içinde. Rotalar `Route::domain(config('musteri.domain'))` grubunda (`MUSTERI_DOMAIN`, varsayılan `musteri.striastudio.com.tr`), `routes/web.php`'deki `/ → /admin` yönlendirmesinden önce kayıtlı.
- Kod yerleri: kontrolcüler `App\Http\Controllers\Musteri\*`, görünümler `resources/views/musteri/`, CSS/JS `public/musteri-assets/` (build adımı yok). Estebella görsel dili Stria renkleriyle uyarlandı (`#c57c69`, Jost).
- **Veri kopyalanmadı:** `Customer`/`Appointment`/`Service` modelleri kullanılıyor, yeni tablo açılmadı. Seans paketleri yalnız `AppointmentSessions` ile kuruluyor. Para yalnız kök randevuda tutuluyor; çocuk seansta fiyat düzenlenirse "Paket fiyatı 1. seansta düzenlenir." hatası dönüyor. Bkz. [[decisions/2026-08-19-randevu-seanslari]].
- Rapor sayıları `App\Filament\Pages\Reports` metodlarından geliyor (hesap çatallanmadı). Bu yüzden admin ile birebir aynı.
- Giriş mevcut `User` hesaplarıyla, `web` guard üzerinden, `canAccessPanel` kontrolüyle yapılıyor (Filament ile aynı). Hız sınırı ve CSRF var. Tüm yanıtlar `X-Robots-Tag: noindex`.
- Sayfalar: Özet (bugün + 7 gün ajanda, onay bekleyen mobil talepler için Onayla/İptal, ay KPI'ları), Randevular (filtre, CSV, detay, yeni/düzenle/sil, "Mobil uygulama" rozeti = `app_user_id` dolu), Müşteriler (liste, profil, CRUD, aynı telefon uyarısı), Raporlar, KVKK dışa aktarma.

## Consequences

- iOS uygulamasıyla Filament'ten girilen randevular kaynak olarak ayırt edilemiyor; ikisi de "Panel / iOS" diye görünüyor. Yalnız müşteri uygulaması işaretlenebiliyor.
- `User::canAccessPanel()` şu an her kullanıcıya `true` döndürüyor. Bu yüzden admin'e girebilen her hesap bu panele de girebiliyor.
- Testler: `tests/Feature/MusteriPanelTest.php` (10 test), tam suite 336/336.
- **Canlı (2026-11-09):** Kod monorepo `0514d89` ile admin reposuna (`f951529`) gitti; `plesk ext git --fetch/--deploy`, prod `.env`'e `MUSTERI_DOMAIN=musteri.striastudio.com.tr` eklendi, `optimize:clear` + `package:discover` çalıştırıldı. Migration yok. SSH erişimi `root@185.169.55.113` üzerinden anahtarla (`~/.ssh/config`).
- **Plesk GOTCHA:** `domalias` ile admin sitesine eklenen takma ad DB'de "web on" görünüyor, ama nginx/httpd vhost'una hiç girmedi (`httpdmng --reconfigure-domain` de eklemedi). Çözüm: takma ad silindi, `striastudio.com.tr` aboneliğinde ayrı **site** açıldı (`plesk bin site --create musteri.striastudio.com.tr -webspace-name striastudio.com.tr -www-root admin.striastudio.com.tr/public -php_handler_id plesk-php84-fpm`). Site komutu, üst zonda aynı adda A kaydı varken reddediyor; önce kayıt silindi. Let's Encrypt kendi sertifikasını aldı (bitiş 2027-02-06). Kalan iz: admin sertifikasının SAN'ında da `musteri` var (zararsız). Admin'in süresi geçmiş askıdaki ACME siparişi `/root/le-stale-order-admin-20261108.json`'a taşındı.
- Canlı doğrulama: `/` 302 → `/giris`, `/giris` 200 + `X-Robots-Tag: noindex`, CSS 200, http → https 301; admin `/` 302 → `/admin`, `/admin/login` 200, `/api/services` 200, admin'de `/giris` 404.
- Filament `/admin` yolu domain'e bağlı olmadığından `musteri.*` üzerinden de açılıyor (giriş ister); bilinçli olarak bırakıldı.

## Sources

- `backend/docs/MUSTERI_PANEL.md`
- `/Applications/MAMP/htdocs/estebella/panel/README.md`
