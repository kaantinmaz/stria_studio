# Müşteri Takip Paneli (musteri.striastudio.com.tr)

Stria Studio'nun müşteri ve randevu takip paneli. Mevcut Laravel uygulamasının
içinde yaşar; estebella panelinin akışları Stria veri modeline uyarlanmıştır.
Yalnızca `config('musteri.domain')` alan adında yayınlanır; admin (Filament)
alan adının davranışı değişmez.

## Amaç

Stüdyo sahibinin telefon/masaüstünden:

- Bugünün ve önümüzdeki 7 günün ajandasını görmesi,
- iOS personel uygulaması ve mobil müşteri uygulamasından gelen randevuları
  (tüm detaylarıyla) görüp mobil **talepleri** onaylaması/iptal etmesi,
- randevu ve müşteri oluşturup düzenlemesi, paket (seans) yönetmesi,
- raporları (Filament Raporlar ile **aynı** sayılar) ve KVKK dışa aktarımını
  tek bir sade panelden yürütmesi.

## Alan adı ve yönlendirme

- Alan adı `config/musteri.php` → `MUSTERI_DOMAIN` (`.env`).
  - Canlı: `musteri.striastudio.com.tr`
  - Yerel: `musteri.localhost`
- Tüm route'lar `routes/web.php` içinde `Route::domain(config('musteri.domain'))`
  grubundadır, `musteri.*` adıyla. Grup, `Route::redirect('/', '/admin')`
  satırından **önce** tanımlıdır; böylece admin alan adının kökü hâlâ
  `/admin`'e gider, panel alan adının kökü ise Özet'i açar.
- Türkçe yollar: `/`, `/giris`, `/randevular`, `/musteriler`, `/raporlar`,
  `/disa-aktar` …
- Controller'lar `App\Http\Controllers\Musteri\*`, Blade'ler
  `resources/views/musteri/*`, statik dosyalar `public/musteri-assets/*`.
- Tüm panel yanıtlarına `X-Robots-Tag: noindex, nofollow` eklenir
  (`App\Http\Middleware\MusteriNoindex`).

## Kimlik doğrulama

- Yalnızca sahip. Mevcut `App\Models\User` hesapları (Filament `/admin`'e
  girenler) standart `web` oturum guard'ıyla giriş yapar.
- Panele erişim izni Filament ile **aynı** kontrolden geçer:
  `User::canAccessPanel(Filament::getPanel('admin'))`
  (`App\Http\Middleware\MusteriAuth`).
- `/giris` özel giriş sayfası, `/cikis` çıkış. CSRF korumalı, oturum yenileme
  (`session()->regenerate()`), e-posta+IP başına **5 deneme/dakika** hız sınırı.
- Kullanıcı yönetimi ekranı yoktur.

## Veri kuralları (kopya yok)

Panel, mevcut tabloları mevcut modellerle okur/yazar: `Customer`,
`Appointment`, `Service`, `Campaign`. Yeni randevu/müşteri tablosu yoktur.

- **Para yalnızca paketin kökünde.** `price`, `is_paid`, `payment_method`
  yalnızca en erken seansta tutulur; çocuk seanslarda boştur. Ciro çift
  sayılmaz. Çocuk seansta fiyat düzenlemesi reddedilir:
  _"Paket fiyatı 1. seansta düzenlenir."_
- **Seans paketleri yalnızca `App\Support\AppointmentSessions` ile** oluşturulur/
  büyütülür/küçültülür (`split`/`resync`/`remove`). Silme, desktop API ile aynı
  kuralı izler (kök silinince para en erken kalan seansa taşınır).
- Geçerli durumlar: `confirmed`, `requested`, `cancelled`, `no_show`
  (desktop API ile aynı). Ödeme yöntemleri: `nakit`, `kart`, `havale`.
- Mobil uygulama kaynaklı satırlar (`app_user_id` dolu) **"Mobil uygulama"**
  rozetiyle işaretlenir; `requested` olarak gelir.
- **Rapor sayıları `App\Filament\Pages\Reports` hesaplamalarını paylaşır**
  (ayrı kopya yok): `ReportController` doğrudan `Reports`'un
  `calculateMonthSummary`, `calculateKpis`, `serviceBreakdown`, `topCustomers`,
  `weekdayLoad` metotlarını çağırır. Panel ayrıca kaynak (`heard_from`)
  dağılımı ekler.

## Sayfalar

| Yol | İçerik |
|---|---|
| `/` (Özet) | Bugün + 7 günlük ajanda, onay bekleyen mobil talepler (Onayla/İptal), ay KPI'ları (ciro, randevu, yeni müşteri) |
| `/randevular` | Filtreli liste (tarih, durum, hizmet, kaynak, arama), CSV, detay (tüm alanlar + paketin tüm seansları + fotoğraflar), oluştur/düzenle/sil |
| `/musteriler` | Arama/liste (son & sonraki randevu, toplam ödenen), profil + geçmiş, oluştur/düzenle/sil |
| `/raporlar` | Ay seçici; aylık özet, KPI, hizmet dağılımı, en çok gelen müşteriler, gün yoğunluğu, kaynak dağılımı |
| `/disa-aktar` | Müşteri ve randevu CSV'si (UTF-8 BOM, `;` ayraç) |

Tüm arayüz Türkçe, mobil uyumludur. Marka rengi `#c57c69`, yazı tipi Jost,
logo `public/logo.png`.

## Yerelde çalıştırma

```bash
cd backend
# musteri.localhost yerelde 127.0.0.1'e çözülmeli:
#   /etc/hosts →  127.0.0.1  musteri.localhost
MUSTERI_DOMAIN=musteri.localhost php artisan serve --port=8002
# Tarayıcıda:  http://musteri.localhost:8002
```

`/etc/hosts`'a ekleyemiyorsanız curl ile test:

```bash
curl --resolve musteri.localhost:8002:127.0.0.1 http://musteri.localhost:8002/giris
```

## Üretim kurulumu (Plesk)

1. **DNS**: `musteri.striastudio.com.tr` için A kaydını admin ile aynı sunucuya
   yönlendirin.
2. **Plesk**: paneli admin ile aynı docroot'a (`backend/public/`) bağlayan bir
   alt alan/alan takma adı ekleyin (admin ile aynı Laravel kurulumu servis
   eder; ayrı kopya gerekmez).
3. **SSL**: Let's Encrypt ile sertifika alın.
4. **.env**: üretimde `MUSTERI_DOMAIN=musteri.striastudio.com.tr` ayarlayın.
   `SESSION_SECURE_COOKIE=true` olduğundan https üzerinden çalışır.
5. Dağıtım sonrası önbelleği temizleyin:

   ```bash
   php artisan optimize:clear
   ```

## Testler

`tests/Feature/MusteriPanelTest.php` kullanıcı davranışını kapsar: misafir
`/giris`'e yönlenir; hatalı parola reddedilir; sahip giriş yapar; mobil
`requested` randevu Özet'te görünür ve onaylanır; panelden 3 seanslı paket
oluşur (para yalnızca kökte); çocukta fiyat düzenlemesi reddedilir; raporda
paket cirosu bir kez sayılır; route'lar admin alan adında yanıt vermez ve admin
kökü hâlâ `/admin`'e yönlenir.

Test alan adı `phpunit.xml`'de `MUSTERI_DOMAIN=musteri.localhost` ile sabittir
(route'lar yüklenmeden okunur).
