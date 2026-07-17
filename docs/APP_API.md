# Stria Studio — Mobil Uygulama API Sözleşmesi (v1)

Müşteri mobil uygulaması (Expo) ile Laravel backend arasındaki sözleşme.
Base: `{API}/api/app` (dev: `http://127.0.0.1:8002/api/app`, prod: `https://admin.striastudio.com.tr/api/app`).
Auth: Laravel Sanctum personal access token — `Authorization: Bearer <token>`.
Tüm istek/cevaplar JSON. Doğrulama hatası `422` (Laravel formatı), yetkisiz `401`.

## Kimlik

### POST /register
Gövde: `{ "name": string≤120, "email": email≤160 (unique), "password": string≥8, "phone": string≤40 (ops.) }`
`201` → `{ "data": { "token": "...", "user": User } }`

### POST /login
Gövde: `{ "email", "password" }`
`200` → `{ "data": { "token": "...", "user": User } }` — hatalı bilgi: `422` (`email` alanında mesaj).

### POST /logout  (auth)
`204`. Aktif token iptal edilir.

## User nesnesi
```json
{
  "id": 7,
  "code": "S-1007",          // müşteri ID — kayıt anında üretilir, panelde eşleştirme anahtarı
  "name": "Ayşe Yılmaz",
  "email": "ayse@example.com",
  "phone": "0555 111 22 33",
  "customer_linked": true     // panelden müşteri kartına bağlandı mı
}
```

### GET /me  (auth)
`200` →
```json
{
  "data": {
    "user": User,
    "loyalty": {               // aktif every_nth kampanyası yoksa veya customer_linked=false ise null
      "campaign_title": "5. İşleme %40",
      "nth": 5,
      "discount_percent": 40,
      "completed_count": 9,    // bağlı müşterinin geçmiş confirmed randevu sayısı
      "progress": 4,           // completed_count % nth
      "remaining": 1,          // nth - progress
      "reward_next": true      // bir sonraki işlem indirimli mi
    }
  }
}
```

## Randevular

### GET /appointments  (auth)
`200` → `{ "data": [ { "id", "service_name": string|null, "starts_at": ISO8601, "duration_min": int, "status": "requested"|"confirmed"|"cancelled", "photos": string[] (mutlak URL listesi, boşsa []) } ] }`
Kapsam: bağlı müşteri kartının TÜM randevuları + kullanıcının uygulamadan açtığı talepler (`appointments.app_user_id`). `starts_at` azalan.

### GET /slots?date=YYYY-MM-DD  (auth)
`200` → `{ "data": { "date": "2026-07-20", "slots": ["10:00","11:00","12:00"] } }`
Kaynak: `settings.hours` çalışma saatleri (ana site), 60 dk ızgara; o güne çakışan `confirmed` randevular düşülür. Kapalı gün → boş liste. Geçmiş tarih → `422`.

### POST /appointments  (auth)
Gövde: `{ "service_slug": string (aktif hizmet), "date": "YYYY-MM-DD", "time": "HH:MM", "note": string≤500 (ops.) }`
`201` → `{ "data": { "id", "status": "requested" } }`
Kayıt: `status=requested`, `app_user_id`=kullanıcı, `customer_id`=bağlıysa müşteri kartı yoksa null. Dolu slota talep → `422`.

## Kampanyalar

### GET /campaigns  (auth)
`200` → `{ "data": [ { "title": "5. İşleme %40", "nth": 5, "discount_percent": 40 } ] }` — yalnız aktif olanlar.

## Hizmet listesi
Mevcut public `GET /api/services` kullanılır (auth yok) — `name_tr/name_en`, `slug`, `image`.

## Panel tarafı (Filament) — mobil sözleşmenin karşılığı
- Müşteri kartında "Uygulama kullanıcısı" bağlama alanı (code/e-posta ile arama). `customers.app_user_id` unique.
- Takvimde ve müşteri listesinde 📱 rozeti (bağlı app kullanıcısı varsa).
- "Randevu Talepleri": `status=requested` kayıtları onayla (→confirmed) / reddet (→cancelled).
- Kampanyalar CRUD: `title, nth, discount_percent, is_active`.
