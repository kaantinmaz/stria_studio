# Decision: Randevuların seanslara bölünmesi (paket = kök randevu + alt seanslar)

**Date:** 2026-08-19
**Status:** Accepted.

## Context

Sahip, `/admin/calendar` randevu detayında bazı randevuların **seanslara bölünmesini** istedi: "Bazı randevular 3 ayrı seans olabilir." Örnek: 15.000₺'lik Kamuflaj Makyaj, aylara yayılan 3 seansta uygulanıyor.

O ana kadar `appointments` tek düzlemdi: bir randevu = bir tarih + bir fiyat. Çok seanslı işi modellemenin tek yolu 3 ayrı randevu açmaktı; o zaman da fiyat 3 kez girilir (ciro şişer) veya sadece birine girilir (diğerleri "ödenmedi" görünür).

Sahibin oturumdaki üç kararı:
1. **Her seans ayrı gün/saatte, takvimde ayrı kutucuk** (tek kutu içinde seans listesi değil) — kim ne zaman gelecek takvimden okunabilmeli.
2. **Toplam fiyat pakette, ödeme tek yerde** (seans başına fiyat/taksit değil).
3. **Şimdilik yalnızca yönetim paneli** — mobil uygulama kapsam dışı.

## Decision

Ayrı bir `packages` tablosu **yok**. Paket, `appointments` üzerinde tek seviyeli bir öz-ilişkiyle modellendi: **kök randevu = 1. seans**, diğer seanslar `parent_id` ile köke bağlanır.

Yeni kolonlar: `parent_id` (nullable self FK, `nullOnDelete`, index), `session_no`, `session_total` (nullable `tinyint`).

### Değişmezler (`App\Support\AppointmentSessions` docblock'unda da yazılı)
1. **Kök = en erken seans.** Kökün `parent_id` null; torun yok (tek seviye).
2. **Para yalnızca kökte.** `price`/`is_paid`/`payment_method` kökte; çocuklarda `price = null`, `is_paid = false`, `payment_method = null`. Ciro sorguları `whereNotNull('price')` kullandığı için **çift sayma imkânsız**.
3. **Müşteri ve hizmet paket boyunca aynı.** Kökten miras alınır, kökte değişirse tüm seanslara yayılır.
4. `session_no` = `starts_at` sırasına göre 1..N, `session_total` = N. Tek randevuda ikisi de null.
5. `starts_at`, `duration_min`, `status`, `note`, `photos` **her seansın kendisine** ait.

### `App\Support\AppointmentSessions`
`root()`, `all()`, `split($total, $intervalDays)`, `add($intervalDays)`, `remove()`, `resync()` — hepsi `DB::transaction` içinde.

- `split()` mevcut randevuyu 1. seans yapar, kalan seansları aynı saat/süre/müşteri/hizmetle `$intervalDays` aralıkla ekler (varsayılan 3 seans × 28 gün). Zaten paket üyesiyse `false` döner. `$total` 2..12, `$intervalDays` 1..365 dışında `InvalidArgumentException`.
- `remove()` **kökü silerken para alanlarını kalan en erken seansa devreder** — 15.000₺ silinmez. Geriye tek seans kalırsa paket çözülür (üç alan da null).
- `resync()` tarih değişince kökü ve numaralandırmayı yeniden kurar; kök değişirse para yeni köke taşınır. `Calendar::updateAppointment()` paket üyelerinde bunu çağırır.

### Panel (`Calendar.php` + `calendar.blade.php`)
- **Tek randevu**: modalda "Seanslar" bölümünde seans sayısı + aralık + `Seansa böl`.
- **Paket üyesi**: modal başlığı `Randevuyu Düzenle · 2/3. seans`; seans listesi (numara, tarih, saat, durum etiketi, `Aç`, `Çıkar`) + `+ Seans ekle`.
- **Çocuk seansta** `Fiyat`/`Ödeme`/`Ödeme yöntemi` alanları gizli; yerine paket toplamı + ödeme durumu + `1. seansa git`. `Müşteri` ve `Hizmet` disabled ("Paketin 1. seansında yönetilir"). Tarih/saat/süre/not/fotoğraf/durum aksiyonları seansa özel kalır.
- **Takvim kutucuğu**: pill metnine ` · 2/3` eklenir. Pill'in kırmızı "ödenmedi" rengi artık **paket kökünün** `is_paid` değerini kullanır (`->with('parent:id,is_paid')`) — yoksa çocuk seanslar her zaman kırmızı görünürdü.

## Consequences

- **Paket geliri 1. seansın ayına yazılır.** Peşin tahsilatta doğru; sahip aylara bölerek tahsil etmeye başlarsa "her seansın kendi fiyatı" modeline (oturumda reddedilen 2. seçenek) geçmek gerekir.
- `Reports` KPI'larında **randevu sayısı** artık seans sayısıdır (3 seans = 3 ziyaret). Para metrikleri `whereNotNull('price')` filtreli olduğu için etkilenmez; `average_ticket` yalnızca fiyatlı kayıtları böldüğü için bozulmaz.
- Mobil uygulama (`/api/app/appointments`) seansları ayrı randevu olarak listeler; payload'da fiyat alanı olmadığı için bir bozulma yok, sadece "2/3. seans" etiketi görünmez. İstenirse ayrı iş.
- Müşteri kartındaki "Bu randevu N. işlemi" sayacı seansları da sayar — çok seanslı işte "3. işlem" görünür. Ziyaret sayısı olarak doğru kabul edildi.
- `parent_id` FK'sı `nullOnDelete`; kardeşlerin yetim kalmaması silme sırasında **kodla** garanti ediliyor (`remove()` kalanları silmeden önce yeni köke bağlar). Randevu silme başka bir yerden yapılırsa (Filament kaynağı, doğrudan SQL) bu sıra korunmalı.

## Verification

- `php artisan test` → **233/233 yeşil, 942 assertion** (12 yeni `AppointmentSessionsTest`: bölme, geçersiz parametreler, ekleme, orta seans çıkarma + yeniden numaralandırma, kök silme + para devri, pakete çözülme, tarih değişince kök devri, müşteri/hizmet yayılımı, ciro tek sayım).
- Tarayıcıda gerçek panel (geçici admin + müşteri + 15.000₺ randevu, 1440×1000):
  - Tek randevuda bölme kutusu göründü → `Seansa böl` → başlık `1/3. seans`, seans listesi 22.08 / 19.09 / 17.10.
  - Takvimde her seans **kendi ayında** ayrı kutucuk: `10:00 SMOKE B. · 1/3`, `· 2/3`, `· 3/3`.
  - 2. seans modalinde `Fiyat`/`Ödeme` inputları YOK (`hasPriceInput: false`), müşteri+hizmet disabled, `15.000,00 ₺ · Ödeme bekliyor · 1. seansa git` bilgi satırı var.
  - Ortadaki seans `Çıkar` → kalanlar 1/2 ve 2/2 olarak yeniden numaralandı, modal açık kaldı, para kökte kaldı.
  - Kök `Sil` → kalan seans tek randevuya döndü ve **15.000₺ ona devredildi**; `sum('price')` = 15.000 (çift sayma yok).
  - Tek randevuda `Seansa böl` (2 seans) → `+ Seans ekle` → 3 seans (17.10 / 14.11 / 12.12).
  - Geçici admin kullanıcısı, müşteri ve randevular sonradan silindi.
- Düzeltilen tek bulgu: çocuk seans ödeme satırı `₺15000.00` basıyordu; proje konvansiyonuna (`reports.blade.php`) çekilerek `15.000,00 ₺` yapıldı.

## Sources

Kod: `backend/database/migrations/2026_08_19_100000_add_sessions_to_appointments_table.php`, `backend/app/Models/Appointment.php`, `backend/app/Support/AppointmentSessions.php`, `backend/app/Filament/Pages/Calendar.php`, `backend/resources/views/filament/pages/calendar.blade.php`, `backend/tests/Feature/AppointmentSessionsTest.php`. Sahip isteği ve üç ürün kararı: 2026-08-19 oturumu.
