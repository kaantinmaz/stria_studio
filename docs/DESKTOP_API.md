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
      "price": 1500.5,
      "subservices": ["Çatlak Gizleme"],
      "body_regions": ["forehead", "cheek_r"],
      "photos": ["https://striastudio.com/storage/appointments/abc.jpg"],
      "updated_at": "2026-09-13T15:31:52+03:00",
      "revision": "64-character opaque value",
      "parent_id": null,
      "session_no": null,
      "session_total": null
    }
  ],
  "services": [
    { "id": 1, "slug": "kamuflaj-makyaj", "title": "Masaüstü QA Hizmeti", "duration_min": 60, "subservices": ["Çatlak Gizleme", "Yanık İzi"] }
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
`slug`, hizmetin sabit kimliğidir (ör. `kamuflaj-makyaj`; istemci bölge
seçiciyi buna göre gösterir). `title`, hizmetin Türkçe adıdır. `subservices`, hizmetin alt uygulama adlarıdır
(`services.subservices_tr[*].name`, tanım sırasıyla); alt uygulaması olmayan
hizmette `[]`.

Randevudaki `subservices`, randevunun kapsadığı alt uygulama adlarıdır (yoksa
`[]`). `body_regions`, kamuflaj vücut bölgesi anahtarlarıdır (yoksa `[]`, asla
`null` değil; aşağıdaki kanonik sırayla). `photos`, randevu fotoğraflarının URL'leridir (yükleme sırasıyla; yoksa
`[]`); fotoğraflar seans başınadır, pakette yayılmaz.

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
  "note": "Not",
  "price": 1500,
  "subservices": ["Çatlak Gizleme"],
  "body_regions": ["forehead", "cheek_r"]
}
```

`customer_id`, `starts_at`, `duration_min` ve `status` zorunludur. `service_id`
ve `note` `null` olabilir. Süre 5–1440 dakika aralığındadır. `price` opsiyonel
TL tutarıdır: `null` ya da 0–99999999.99 arası sayı (iki ondalık basamakla
saklanır); negatif değerde `422` `errors.price` döner. Cevaptaki `price` JSON
sayısı (`1500`, `1500.5`) ya da `null`'dır. Create isteğinde
`revision` yasaktır. Başarılı cevap `201`:

```json
{ "appointment": { "id": 2, "customer_id": 1, "service_id": 1, "starts_at": "...", "duration_min": 60, "status": "confirmed", "note": null, "price": null, "subservices": [], "body_regions": [], "photos": [], "updated_at": "...", "revision": "...", "parent_id": null, "session_no": null, "session_total": null }, "appointments": ["paketin tüm seansları, starts_at ARTAN"] }
```

`confirmed` randevu ana sitenin çalışma saatleri içinde olmalı ve başka bir
`confirmed` randevuyla çakışmamalıdır. Bu iki kural ihlalinde `422` döner.
Diğer durumlar bu takvim kontrolüne tabi değildir.

Opsiyonel olarak seans paketi oluşturulabilir:

- `session_total` 1–12 arası tam sayı (1 veya gönderilmezse tek randevu,
  mevcut davranış).
- `interval_days` 1–365 arası tam sayı, varsayılan 28; yalnız `session_total >= 2`
  iken anlamlıdır. Her seans bir öncekinden `interval_days` gün sonra, aynı
  saat/süre/müşteri/hizmetle oluşturulur.
- `session_starts` opsiyonel dizi: 2..N. seansların başlangıç zamanları, sırayla.
  Her eleman `starts_at` ile aynı biçimdedir (saat dilimi içeren ISO 8601).
  Yalnız `session_total >= 2` iken gönderilebilir; uzunluğu tam olarak
  `session_total - 1` olmalı ve her eleman hem `starts_at`'ten hem bir önceki
  elemandan kesinlikle sonra olmalıdır. Gönderildiğinde `interval_days` yok
  sayılır ve seanslar tam bu zamanlarda oluşturulur. İhlallerde `422`
  `errors.session_starts` döner. `PATCH` isteğinde yasaktır.

`session_total >= 2` iken oluşturulan randevu 1. seans (kök) olur ve kalan
seanslar aynı işlemle eklenir. Durum `confirmed` ise üretilen her seans çalışma
saati ve çakışma denetiminden geçer; herhangi biri başarısız olursa işlem bütün
olarak geri alınır ve `422` seansı adlandıran bir mesaj döndürür:
`errors.starts_at = ["3. seans (12.12.2026 10:00): ..."]`.

Cevabın `appointments` alanı paketin tüm seanslarını `starts_at` ARTAN sırayla
içerir; tek randevuda yalnız o randevuyu içerir.

Pakette `price` yalnız köke (1. seans, `parent_id = null`) yazılır; çocuk
seansların `price` değeri `null`'dır. Paket fiyatı istemcide kökten okunur.

`subservices` opsiyonel: en çok 30 elemanlı string dizisi ya da `null`. Her
eleman, randevunun hizmetinin (`service_id`) `/state` `subservices` listesinde
olmalıdır; alt uygulaması olmayan veya seçilmemiş hizmette yalnız `[]`/`null`
kabul edilir. İhlalde `422` `errors.subservices` döner. Sunucu listeyi hizmetteki
sırayla ve tekrarsız saklar; `[]` ile `null` aynıdır. Alt uygulamalar hizmet gibi
paket düzeyindedir: köke yazılır ve tüm seanslara kopyalanır.

`body_regions` opsiyonel: en çok 34 elemanlı anahtar dizisi ya da `null`. Her
eleman aşağıdaki listeden olmalıdır; bilinmeyen anahtarda `422`
`errors.body_regions = ["Bölgeler geçerli bölge anahtarları olmalı."]` döner.
Hizmete göre kısıtlanmaz (seçiciyi ne zaman göstereceğine istemci karar verir).
Sunucu listeyi kanonik sırayla ve tekrarsız saklar; `[]` ile `null` aynıdır
(`null` saklanır, `[]` döner). Bölgeler `subservices` gibi paket düzeyindedir:
köke yazılır ve tüm seanslara kopyalanır.

Anahtarlar (kanonik sıra; `_r`/`_l` müşterinin kendi sağı/solu; tek kaynak
`backend/app/Support/BodyRegions.php`):

| Anahtar | Ad | Anahtar | Ad |
|---|---|---|---|
| `forehead` | Alın | `nose` | Burun |
| `cheek_r` | Sağ yanak | `cheek_l` | Sol yanak |
| `lips_chin` | Dudak ve çene | `scalp` | Saçlı deri / baş arkası |
| `neck_front` | Boyun ön | `neck_back` | Ense |
| `chest_r` | Sağ göğüs | `chest_l` | Sol göğüs |
| `abdomen_r` | Karın sağ | `abdomen_l` | Karın sol |
| `upper_back_r` | Sırt üst sağ | `upper_back_l` | Sırt üst sol |
| `lower_back_r` | Bel sağ | `lower_back_l` | Bel sol |
| `buttock_r` | Sağ kalça | `buttock_l` | Sol kalça |
| `upper_arm_r` | Sağ üst kol | `upper_arm_l` | Sol üst kol |
| `forearm_r` | Sağ ön kol | `forearm_l` | Sol ön kol |
| `hand_r` | Sağ el | `hand_l` | Sol el |
| `thigh_front_r` | Sağ uyluk ön | `thigh_front_l` | Sol uyluk ön |
| `thigh_back_r` | Sağ uyluk arka | `thigh_back_l` | Sol uyluk arka |
| `shin_r` | Sağ bacak ön (kaval) | `shin_l` | Sol bacak ön (kaval) |
| `calf_r` | Sağ baldır | `calf_l` | Sol baldır |
| `foot_r` | Sağ ayak | `foot_l` | Sol ayak |

Panel takvimi bölgeleri randevu penceresinde salt okunur "Bölgeler" satırı olarak
gösterir (çocukta kökünkiler); panelden düzenlenmez.

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

`price` create ile aynı kurallarla gönderilebilir; `null` fiyatı temizler. Fiyat
değişikliği tek başına çalışma saati/çakışma denetimini tetiklemez. Paketin çocuk
seansına `price` gönderilirse `422` döner:
`errors.price = ["Paket fiyatı 1. seansta düzenlenir."]`.

`subservices` create ile aynı kurallarla, değişiklik sonrası hizmete göre
doğrulanır. `service_id` değişip `subservices` gönderilmezse alt uygulamalar
temizlenir. Kökte değişen alt uygulamalar tüm seanslara yayılır. Paketin çocuk
seansına `subservices` gönderilirse `422` döner:
`errors.subservices = ["Alt uygulamalar 1. seansta düzenlenir."]`.

`body_regions` create ile aynı kurallarla gönderilir; `[]`/`null` temizler.
`service_id` değişmesi bölgeleri temizlemez. Kökte değişen bölgeler tüm
seanslara yayılır. Paketin çocuk seansına `body_regions` gönderilirse `422`
döner: `errors.body_regions = ["Bölgeler 1. seansta düzenlenir."]`.

### `POST /appointments/{id}/photos`

`multipart/form-data`; alan `photos[]`, 1–10 dosya, her biri resim ve en çok
10 MB. Dosyalar mevcut fotoğrafların sonuna eklenir; `revision` gerekmez.
Geçersiz dosyada `422` (`errors.photos` / `errors["photos.N"]`), bilinmeyen
randevuda `404`. Başarılı cevap `201`:

```json
{ "appointment": { "id": 2, "photos": ["https://.../storage/appointments/abc.jpg"], "revision": "new revision", "...": "..." } }
```

Yükleme `revision`'ı değiştirir; istemci cevaptaki nesneyi kullanmalıdır.

### `DELETE /appointments/{id}/photos/{index}`

`index`, `photos` dizisindeki 0 tabanlı sıradır.

```json
{ "revision": "revision from the last response" }
```

`revision` zorunludur; kayıt arada değiştiyse `409` güncel nesneyi döndürür.
`index` aralık dışındaysa `404`. Fotoğraf listeden çıkarılır, kalanlar yeniden
sıralanır ve panelin yüklediği dosya (`appointments/...`) diskten silinir.
Başarılı cevap `200`: `{ "appointment": { "...": "..." } }`.

### `POST /appointments/{id}/sessions`

Pakete bir seans ekler (tek randevuysa 2 seanslı pakete dönüştürür):

```json
{ "revision": "revision from the last response", "interval_days": 28 }
```

`revision` zorunludur; `interval_days` 1–365 arası tam sayı olup gönderilmezse
28 kullanılır. Yeni seans son seanstan `interval_days` gün sonra, aynı
saat/süre/müşteri/hizmetle oluşturulur. Kayıt arada değiştiyse `409` güncel
nesneyi döndürür (yukarıdaki biçim). Yeni seans `confirmed` ise çalışma saati ve
çakışma denetimine tabidir; başarısızlıkta işlem geri alınır ve seansı adlandıran
`422` döner. Başarılı cevap `201`:

```json
{ "appointment": { "id": 6, "parent_id": 2, "session_no": 2, "session_total": 2, "...": "..." }, "appointments": ["paketin tüm seansları, starts_at ARTAN"] }
```

### `DELETE /appointments/{id}`

Randevuyu siler; paket üyesiyse seansı paketten çıkarır:

```json
{ "revision": "revision from the last response" }
```

`revision` zorunludur. Kayıt arada değiştiyse `409` güncel nesneyi döndürür.
Paket üyesi silinince para alanları (`price`/`is_paid`/`payment_method`) gerekirse
yeni köke taşınır, kalan seanslar yeniden numaralandırılır ve geriye tek seans
kalınca paket çözülür; tek başına randevu doğrudan silinir. Başarılı cevap `200`:

```json
{ "deleted_id": 5, "appointments": ["kalan paket seansları, starts_at ARTAN; boş olabilir"] }
```

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
  `subservices` ve `body_regions` yazılabilir (paket kökünde); `photos` yalnız fotoğraf uçlarıyla
  değişir. `is_paid`, `payment_method`, `paid_at`, `campaign_id` ve
  `app_user_id` görünmez ve korunur. Ödeme alanları Meta/Google
  dönüşüm yüklemesini tetiklediği için bilerek kapsam dışıdır.
- `parent_id`, `session_no`, `session_total` istemci tarafından yazılamayan,
  sunucunun ürettiği salt okunur alanlardır. Masaüstü API bunları doğrudan
  değiştiremez; seans paketleri yalnız `POST /appointments` (`session_total >= 2`),
  `POST /appointments/{id}/sessions` ve `DELETE /appointments/{id}` uçlarıyla
  oluşturulur, büyütülür, küçültülür ve `AppointmentSessions` kurallarıyla
  numaralandırılarak senkronize edilir.
- `DELETE /appointments/{id}` randevu veya seans siler; kök seans silinince para
  alanları yeni köke taşınır. Ödeme yönetimi, kampanya bağlama ve mobil hesap
  eşleme ucu bu sürümde yoktur.
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
