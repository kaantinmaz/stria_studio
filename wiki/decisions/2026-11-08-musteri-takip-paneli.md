# Müşteri takip paneli — musteri.striastudio.com.tr

**Tarih:** 2026-11-08 · **Durum:** yerelde tamam, canlıya alınmadı

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
- **Canlıya alma bekliyor:** `musteri.striastudio.com.tr` için DNS kaydı yok (NS Plesk: ns1/ns2.striastudio.com.tr). Plesk'te alan adı takma adı veya alt alan adı tanımlanıp admin docroot'una (`public/`) yönlendirilmeli, Let's Encrypt kurulmalı, prod `.env`'e `MUSTERI_DOMAIN` eklenip `optimize:clear` çalıştırılmalı. SSH root parolası repoda tutulmuyor. Adımlar `backend/docs/MUSTERI_PANEL.md` dosyasında.

## Sources

- `backend/docs/MUSTERI_PANEL.md`
- `/Applications/MAMP/htdocs/estebella/panel/README.md`
