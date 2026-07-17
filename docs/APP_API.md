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

### DELETE /account  (auth)
`204`. Oturum sahibinin uygulama hesabını **kalıcı** siler: kullanıcının tüm token'ları ve `app_users` kaydı silinir. **Geri döndürülemez** — Apple 5.1.1(v) gereği uygulama içi hesap silme.
İşletme kayıtları (randevu geçmişi, müşteri kartı) yasal saklama yükümlülüğü gereği korunur; ilişkili `customers.app_user_id` ve `appointments.app_user_id` FK'ları `nullOnDelete` ile otomatik `NULL`'a çekilerek kayıtlar kişisel hesaptan koparılıp **anonimleştirilir**. Yeni token gerektirmez; silinmiş token'la sonraki istekler `401` döner.

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
`200` → `{ "data": [ { "id", "service_name": string|null, "starts_at": ISO8601, "duration_min": int, "status": "requested"|"confirmed"|"cancelled"|"no_show", "photos": string[] (mutlak URL listesi, boşsa []), "campaign": { "title": string, "new_price": string|null }|null } ] }`
Kapsam: bağlı müşteri kartının TÜM randevuları + kullanıcının uygulamadan açtığı talepler (`appointments.app_user_id`). `starts_at` azalan. `campaign` yalnız randevu bir promo kampanyaya kilitlendiyse dolu, aksi halde null.

### GET /slots?date=YYYY-MM-DD  (auth)
`200` → `{ "data": { "date": "2026-07-20", "slots": ["10:00","11:00","12:00"] } }`
Kaynak: `settings.hours` çalışma saatleri (ana site), 60 dk ızgara; o güne çakışan `confirmed` randevular düşülür. Kapalı gün → boş liste. Geçmiş tarih → `422`.

### POST /appointments  (auth)
Gövde: `{ "service_slug": string (aktif hizmet), "date": "YYYY-MM-DD", "time": "HH:MM", "note": string≤500 (ops.), "campaign_id": int (ops.) }`
`201` → `{ "data": { "id", "status": "requested" } }`
Kayıt: `status=requested`, `app_user_id`=kullanıcı, `customer_id`=bağlıysa müşteri kartı yoksa null. Dolu slota talep → `422`.
`campaign_id` verilirse kampanya randevuya kilitlenir. Doğrulama randevu OLUŞTURMA GÜNÜNE göre yapılır (randevu tarihine göre değil): kampanya var + `is_active` + `kind='promo'` + BUGÜN tarih penceresi içinde (`starts_at` null|≤bugün, `ends_at` null|≥bugün) + hizmet kapsamda (`service_ids` null/boş → her hizmet kapsamda). İhlal → `422`:
- Kampanya yok/pasif/promo değil/pencere dışı → `campaign_id`: "Kampanya artık geçerli değil."
- Hizmet kapsam dışı → `campaign_id`: "Kampanya bu hizmet için geçerli değil."

### POST /appointments/{id}/cancel  (auth)
Kullanıcının randevusunu iptal eder (kapsam GET /appointments ile aynı: bağlı müşteri kartı VEYA `app_user_id`).
`200` → `{ "data": { "id", "status": "cancelled" } }`
- Randevu kullanıcıya ait değilse → `404`.
- `status` `requested` veya `confirmed` değilse → `422` (`status`: "Bu randevu iptal edilemez.").
- Başlangıcına 12 saatten az kaldıysa (`starts_at <= now()+12h`) → `422` (`starts_at`: "Randevu başlangıcına 12 saatten az kaldığı için uygulamadan iptal edilemiyor. Lütfen bizi arayın.").

## Kampanyalar

### GET /campaigns  (auth)
`200` → `{ "data": [ Campaign, ... ] }` — yalnız `is_active=true` VE tarih penceresi bugünü kapsayan (`starts_at` null|≤bugün, `ends_at` null|≥bugün) kampanyalar. Sıralama: önce `promo`, sonra `id`.

```jsonc
Campaign {
  "id": 12,
  "kind": "promo",              // "loyalty" | "promo"
  "title": "Haftaya Özel",
  "description": "Bu haftaya özel indirim",  // null olabilir
  "image": "https://.../storage/campaigns/promo.jpg",  // mutlak URL veya null
  "nth": null,                  // loyalty'de int, promo'da null
  "discount_percent": null,     // loyalty'de int, promo'da null
  "old_price": "1000.00",       // promo'da string, yoksa null
  "new_price": "750.00",        // promo'da string, yoksa null
  "starts_at": "2026-07-13",    // "YYYY-MM-DD" veya null (süresiz)
  "ends_at": "2026-07-20",      // "YYYY-MM-DD" veya null (süresiz)
  "service_slugs": ["microblading"]  // kapsamdaki hizmet slug'ları; null → tüm hizmetler kapsamda
}
```

- `loyalty` kampanyaları damga kartı / sadakat mantığında kullanılır (`GET /me` → `loyalty`). Sadakat hesabı yalnız `kind='loyalty'` kampanyaları dikkate alır.
- `promo` kampanyaları app ana sayfasındaki görselli kampanya slider'ında gösterilir.

## Duyurular

### GET /announcements  (auth)
`200` → `{ "data": [ Announcement, ... ] }` — yalnız `is_active=true` VE tarih penceresi bugünü kapsayan (`starts_at` null|≤bugün, `ends_at` null|≥bugün) duyurular. Sıralama: en yeni önce (`id` azalan).

```jsonc
Announcement {
  "id": 12,
  "title": "Bayram Tatili",
  "body": "20 Temmuz kapalıyız.",
  "starts_at": "2026-07-13",    // "YYYY-MM-DD" veya null (süresiz)
  "ends_at": "2026-07-20",      // "YYYY-MM-DD" veya null (süresiz)
  "created_at": "2026-07-17T09:00:00+00:00"  // ISO8601
}
```

- Stüdyo bilgilendirmeleri (tatil, kapalı gün, çalışma saati değişikliği vb.) için kullanılır; kampanyalardan ayrı bir Duyurular alanında gösterilir.

## Sohbet (Asistan)

### POST /chat  (auth, throttle 20/dk)
Gövde: `{ "messages": [ { "role": "user"|"assistant", "content": string(1-1000) } ] }` — en fazla 12 mesaj, son mesajın rolü `user` olmalı.
`200` → `{ "data": { "reply": string } }`
`502` → `{ "message": "assistant_unavailable" }` (yapay zekâ sağlayıcısına ulaşılamadı).
Doğrulama hatası `422`, yetkisiz `401`.

Asistan sunucu tarafında Anthropic'e proxy'lenir (API anahtarı istemciye asla gönderilmez). Sistem promptuna, sitedeki asistanın ortak kuralları + oturum sahibinin KENDİ bağlamı eklenir: adı ve müşteri kodu, son 10 randevusu (bağlı müşteri kartı VEYA `app_user_id` kapsamı), sadakat özeti, aktif kampanyalar ve aktif duyurular. Kişisel veriler yalnız oturum sahibine aittir; asistan başka kullanıcı/müşteri hakkında bilgi vermez.

## Hizmet listesi
Mevcut public `GET /api/services` kullanılır (auth yok) — `name_tr/name_en`, `slug`, `image`.

## Panel tarafı (Filament) — mobil sözleşmenin karşılığı
- Müşteri kartında "Uygulama kullanıcısı" bağlama alanı (code/e-posta ile arama). `customers.app_user_id` unique.
- Takvimde ve müşteri listesinde 📱 rozeti (bağlı app kullanıcısı varsa).
- "Randevu Talepleri": `status=requested` kayıtları onayla (→confirmed) / reddet (→cancelled).
- Kampanyalar CRUD: `kind` (loyalty/promo), `title`, `is_active`; loyalty → `nth`, `discount_percent`; promo → `description`, `image`, `starts_at`, `ends_at`, `old_price`, `new_price`, `service_ids` (Kapsam Hizmetler — boş bırakılırsa tüm hizmetlerde geçerli).
- Duyurular CRUD: `title`, `body`, `is_active`, `starts_at`, `ends_at` (Duyurular navigasyonu, kampanyaların hemen ardından).
