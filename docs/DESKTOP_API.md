# Stria Studio — Masaüstü API Sözleşmesi

Stria Studio macOS yönetim uygulaması ile Laravel backend arasındaki JSON
sözleşmesi. API kökü `{SERVER}/api/desktop`; yerel entegrasyon QA adresi
`http://127.0.0.1:8017/api/desktop`, üretim için hedef adres
`https://admin.striastudio.com.tr/api/desktop`.

> **Dağıtım durumu (2026-09-13):** Masaüstü API canlı `admin.striastudio.com.tr` sunucusuna aktarıldı. Sekiz rota etkin. Dışarıdan oturumsuz `/state` isteği 401, eksik alanlı `/login` isteği 422, mevcut panel giriş sayfası ve hizmet API’si 200 döndü. Gerçek müşteri/randevu kayıtları değiştirilmedi.

## Genel kurallar

- Tüm istek ve cevaplar JSON'dur. İstemci `Accept: application/json`, gövdeli
  isteklerde ayrıca `Content-Type: application/json` gönderir.
- Login dışındaki tüm uçlar `Authorization: Bearer <token>` ister. Token yalnız
  `desktop:manage` yetkisine sahip bir Sanctum personal access token olabilir.
- Masaüstü token'ı 7 gün geçerlidir. Logout yalnız kullanılan token'ı iptal eder.
- Tarihler ISO 8601 ve açık saat dilimiyle gönderilir. Backend tarihleri
  `Europe/Istanbul` saat dilimine çevirir.
- Doğrulama hataları Laravel'in `422` biçimindedir:

```json
{
  "message": "The given data was invalid.",
  "errors": { "field": ["Hata mesajı."] }
}
```

- `401` eksik, geçersiz veya süresi dolmuş token; `403` masaüstü yetkisi olmayan
  kullanıcı; `404` bulunamayan kayıt; `409` eşzamanlı değişiklik;
  `429` hız sınırı anlamına gelir.

## Kimlik

### `POST /login`

Gövde:

```json
{ "email": "desktop-qa@example.test", "password": "..." }
```

`email` ve `password` zorunlu, en fazla 255 karakterdir. Kullanıcı Filament admin
paneline erişebilmelidir. Başarılı cevap `200`:

```json
{
  "token": "1|plain-text-token",
  "user": { "id": 1, "name": "Desktop QA Admin", "email": "desktop-qa@example.test" }
}
```

Hatalı kimlik bilgisi `422` döndürür. Login hız sınırı dakikada 5 istektir.

### `POST /logout`

Bearer token zorunludur. Başarılı cevap gövdesiz `204`; kullanılan token silinir.

## Başlangıç durumu

### `GET /state`

Masaüstünün tek seferde gereksindiği müşteri, randevu, hizmet ve çalışma saati
verisini döndürür:

```json
{
  "customers": [
    {
      "id": 1,
      "name": "Deniz Deneme",
      "phone": "0500 000 00 01",
      "email": "deniz.deneme@example.test",
      "notes": "Hayali masaüstü QA müşterisi.",
      "updated_at": "2026-09-13T12:31:52+00:00",
      "revision": "64-character opaque value"
    }
  ],
  "appointments": [
    {
      "id": 1,
      "customer_id": 1,
      "service_id": 1,
      "starts_at": "2026-09-14T15:00:00+03:00",
      "duration_min": 60,
      "status": "confirmed",
      "note": "Disposable desktop QA appointment.",
      "updated_at": "2026-09-13T15:31:52+03:00",
      "revision": "64-character opaque value",
      "parent_id": null,
      "session_no": null,
      "session_total": null
    }
  ],
  "services": [
    { "id": 1, "title": "Masaüstü QA Hizmeti", "duration_min": 60 }
  ],
  "hours": [
    { "id": 1, "enabled": false, "open": 540, "close": 1140 },
    { "id": 2, "enabled": true, "open": 540, "close": 1140 }
  ],
  "timezone": "Europe/Istanbul"
}
```

Müşteriler ada, randevular başlangıç zamanına göre sıralanır. Hizmet listesi tüm
aktif hizmetleri ve geçmiş randevuların referans verdiği pasif hizmetleri içerir.
`title`, hizmetin Türkçe adıdır.

Çalışma günü kimlikleri Foundation `Calendar` düzenindedir: `1=Pazar`,
`2=Pazartesi`, ..., `7=Cumartesi`. `open` ve `close`, gece yarısından sonraki
dakika sayısıdır. Kapalı günlerde `open=540`, `close=1140` varsayılanları gönderilir; `enabled=false` günü kapalı tutar. Backend'deki mevcut
saatler yinelenen ya da bölünmüş günler içeriyorsa masaüstü veri kaybetmeden bu
şekle çeviremez; `/state` `409` ve `code=hours_not_roundtrippable` döndürür.

## Müşteriler

### `POST /customers`

```json
{
  "name": "Ada Örnek",
  "phone": "0500 000 00 03",
  "email": "ada@example.test",
  "notes": "Not"
}
```

`name` zorunlu ve en fazla 255 karakterdir. `phone` ve `email` en fazla 255,
`notes` en fazla 10.000 karakterdir; boş opsiyonel metinler `null` olarak
kaydedilir. Create isteğinde `revision` yasaktır. Başarılı cevap `201`:

```json
{ "customer": { "id": 3, "name": "Ada Örnek", "phone": "...", "email": "...", "notes": "...", "updated_at": "...", "revision": "..." } }
```

### `PATCH /customers/{id}`

Yalnız gönderilen alanları değiştirir; `revision` zorunludur:

```json
{ "phone": "0500 000 00 04", "revision": "revision from the last response" }
```

Başarılı cevap `200` ve create ile aynı `customer` zarfıdır. Kayıt arada
değiştiyse `409` güncel nesneyi döndürür:

```json
{
  "message": "Müşteri başka bir yerde güncellendi.",
  "customer": { "id": 3, "name": "...", "revision": "current revision" }
}
```

## Randevular

Geçerli durumlar: `confirmed`, `requested`, `cancelled`, `no_show`.

### `POST /appointments`

```json
{
  "customer_id": 1,
  "service_id": 1,
  "starts_at": "2026-09-14T15:00:00+03:00",
  "duration_min": 60,
  "status": "confirmed",
  "note": "Not"
}
```

`customer_id`, `starts_at`, `duration_min` ve `status` zorunludur. `service_id`
ve `note` `null` olabilir. Süre 5–1440 dakika aralığındadır. Create isteğinde
`revision` yasaktır. Başarılı cevap `201`:

```json
{ "appointment": { "id": 2, "customer_id": 1, "service_id": 1, "starts_at": "...", "duration_min": 60, "status": "confirmed", "note": null, "updated_at": "...", "revision": "...", "parent_id": null, "session_no": null, "session_total": null } }
```

`confirmed` randevu ana sitenin çalışma saatleri içinde olmalı ve başka bir
`confirmed` randevuyla çakışmamalıdır. Bu iki kural ihlalinde `422` döner.
Diğer durumlar bu takvim kontrolüne tabi değildir.

### `PATCH /appointments/{id}`

Yalnız gönderilen alanları değiştirir; `revision` zorunludur. Değişiklik
sonucunda randevu `confirmed` ise ve zaman, süre, hizmet veya durum değişiyorsa
çalışma saati ve çakışma denetimi yeniden yapılır. Başarılı cevap `200` ve create
ile aynı `appointment` zarfıdır.

Kayıt arada değiştiyse `409` güncel nesneyi döndürür:

```json
{
  "message": "Randevu başka bir yerde güncellendi.",
  "appointment": { "id": 2, "revision": "current revision" }
}
```

Bir seans paketinin çocuk randevusunda `customer_id` ve `service_id` paketin
kökünden alınır; çocuk bu alanlarla başka müşteriye veya hizmete taşınamaz.
Paket üyesi düzenlenince mevcut `AppointmentSessions` kurallarıyla paket yeniden
senkronize edilir.

## Çalışma saatleri

### `PUT /hours`

```json
{
  "hours": [
    { "id": 1, "enabled": false, "open": 540, "close": 1140 },
    { "id": 2, "enabled": true, "open": 540, "close": 1140 },
    { "id": 3, "enabled": true, "open": 540, "close": 1140 },
    { "id": 4, "enabled": true, "open": 540, "close": 1140 },
    { "id": 5, "enabled": true, "open": 540, "close": 1140 },
    { "id": 6, "enabled": true, "open": 540, "close": 1140 },
    { "id": 7, "enabled": true, "open": 540, "close": 1140 }
  ],
  "expected_hours": [
    { "id": 1, "enabled": false, "open": 540, "close": 1140 },
    { "id": 2, "enabled": true, "open": 540, "close": 1140 },
    { "id": 3, "enabled": true, "open": 540, "close": 1140 },
    { "id": 4, "enabled": true, "open": 540, "close": 1140 },
    { "id": 5, "enabled": true, "open": 540, "close": 1140 },
    { "id": 6, "enabled": true, "open": 540, "close": 1140 },
    { "id": 7, "enabled": true, "open": 540, "close": 1140 }
  ]
}
```

Her dizi 1–7 arasındaki yedi günü tam birer kez içermelidir. Açık günlerde
`0...1439` aralığında `open < close`; kapalı günlerde `open=540`, `close=1140` olmalıdır.
`expected_hours`, istemcinin son okuduğu değerdir. Backend'deki değer arada
değiştiyse `409` ve güncel `hours` döner. Başarılı cevap:

```json
{ "hours": ["seven canonical day objects"] }
```

## Eşzamanlı değişiklikler

Her müşteri ve randevu nesnesindeki `revision`, kaydın tüm ham alanlarından
üretilen 64 karakterli, opak bir değerdir. İstemci bu değeri üretmez veya
değiştirmez; son GET/POST/PATCH cevabından aynen geri gönderir. Böylece masaüstü,
Filament veya başka bir istemci arada görünmeyen bir alanı değiştirdiğinde eski
veriyle yapılan PATCH reddedilir. `409` alan istemci güncel nesneyi yükleyip
kullanıcının değişikliğini yeniden uygulatmalıdır. Saatlerde aynı görev
`expected_hours` tarafından görülür.

## Korunan veri ve kapsam sınırları

- Müşteri yazma uçları yalnız `name`, `phone`, `email`, `notes` alanlarını
  değiştirir. `photos`, `instagram` ve mobil uygulama kullanıcı bağlantısı
  cevapta görünmez ve korunur.
- Randevu yazma uçları yalnız sözleşmede görünen alanları değiştirir. `price`,
  `is_paid`, `payment_method`, `photos`, `campaign_id` ve `app_user_id` korunur.
- `parent_id`, `session_no`, `session_total` salt okunurdur. Masaüstü API seans
  paketi oluşturmaz, bölmez veya silmez; var olan paket kuralını koruyarak
  yeniden senkronize eder.
- Bu sürümde müşteri veya randevu silme, fotoğraf yönetimi, ödeme yönetimi,
  kampanya bağlama ve mobil hesap eşleme ucu yoktur.
- Masaüstü istemcisi yalnız bu API ile yapılan değişiklikleri yerel uygulama
  durumuna yansıtır. Filament'te yapılan değişiklikler yeni `/state` çağrısında
  alınır; canlı push/soket senkronizasyonu yoktur.

## Yerel entegrasyon QA fixture'ı

Fixture `/tmp/stria-desktop-qa.yREOLR` altındadır ve yalnız geçici SQLite verisi
kullanır. Repo `.env` dosyasını, MAMP MySQL'i ve gerçek müşteri kayıtlarını
okumaz veya değiştirmez. Hazırlık sırasında görülen güvenlik doğrulaması:

```text
environment: testing
connection: sqlite
database: /tmp/stria-desktop-qa.yREOLR/stria-desktop-qa.sqlite
cache: array
session: file
storage: /tmp/stria-desktop-qa.yREOLR/storage
```

Sunucuyu başlatmadan önce 8017 portunun boş olduğunu denetler ve kullanımda ise
hiçbir süreci sonlandırmadan çıkar:

```bash
/tmp/stria-desktop-qa.yREOLR/start.sh
```

Test girişi:

```text
Sunucu: http://127.0.0.1:8017
E-posta: desktop-qa@example.test
Parola: StriaDesktopQA!2026-local-only
```

Bu bilgiler yalnız disposable yerel fixture içindir.

## Canlı dağıtım kaydı — 2026-09-13

Yalnız yedi PHP dosyası aktarıldı; migration, bağımlılık güncellemesi veya gerçek veri yazma işlemi yapılmadı. Başlangıçtaki User.php ve routes/api.php SHA-256 değerleri yerel HEAD ile eşleşti. Mevcut dosya yedeği sunucuda `/root/stria-desktop-release.xBBhhO/backup` altındadır. PHP 8.4 sözdizimi denetimleri ve rota listesi geçti. Sunucudaki salt okunur durum üretimi 5 müşteri, 7 randevu, 10 hizmet ve 7 çalışma günü döndürdü. Native arayüzde giriş/müşteri notu/randevu notu/saat kaydı yalnız ayrı SQLite QA verisiyle doğrulandı. Gerçek uygulama oturumu kullanıcı tarafından mevcut yönetici hesabıyla açılır.

Kaynak doğrulama: `DesktopApiTest` ve mevcut müşteri/randevu/seans/mobil regresyon grubu 54 test, 341 assertion geçti. Mac tarafı 7 test geçti.
