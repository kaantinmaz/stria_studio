# Stria Studio — API Dökümanı

Halka açık (public), salt-okunur içerik API'si + iletişim formu. Blog **yazma**
(ekleme/düzenleme) API'den değil, **admin panelinden** yapılır (bkz. son bölüm).

## Base URL'ler

| Ortam | Blog · Kategori · Etiket · İletişim (Laravel) | Hizmetler (Next) |
|---|---|---|
| **Geliştirme** | `http://127.0.0.1:8002/api` | `http://127.0.0.1:3001/api` |
| **Prod** | `https://<api-domaini>/api` | `https://<site-domaini>/api` |

> Blog/iletişim dinamik veri → Laravel backend'de. Hizmetler statik site içeriği
> → Next uygulamasında. İki ayrı base URL bu yüzden.

## Genel kurallar

- Tüm cevaplar **JSON**. İstek gövdesi (POST) `application/json`.
- İçerik **çift dil**: her kayıt hem `_tr` hem `_en` alanlarını döner. İstemci
  aktif dile göre seçer (ayrı `?lang=` yok).
- Okuma uçları **auth istemez** (public). CORS açık.
- Blog listesi Laravel paginator formatı döner (`data` + `links` + `meta`).
- Yalnızca **yayınlanmış** (published) yazılar döner (taslak/ileri tarihli gizli).

---

## 1. Blog — Listeleme

```
GET /api/posts
```

**Query parametreleri** (hepsi opsiyonel):

| Param | Tip | Açıklama |
|---|---|---|
| `category` | string (slug) | Kategoriye göre filtrele |
| `tag` | string (slug) | Etikete göre filtrele |
| `page` | int | Sayfa no (sayfa başına 9, `published_at` azalan) |

**Örnek**
```bash
curl "http://127.0.0.1:8002/api/posts?category=studio-updates&page=1"
```

**Cevap `200`**
```json
{
  "data": [
    {
      "id": 1,
      "slug": "stria-studio-launches",
      "title_tr": "Stria Studio Yayında",
      "title_en": "Stria Studio Launches",
      "excerpt_tr": "Stria Studio yeni web sitesiyle yayında...",
      "excerpt_en": "Stria Studio is live with a new website...",
      "cover_url": null,
      "published_at": "2026-07-07T07:30:43+00:00",
      "category": { "slug": "studio-updates", "name_tr": "Stüdyo Güncellemeleri", "name_en": "Studio Updates" },
      "tags": [ { "slug": "launch", "name_tr": "Lansman", "name_en": "Launch" } ]
    }
  ],
  "links": { "first": "...page=1", "last": "...page=1", "prev": null, "next": null },
  "meta": { "current_page": 1, "last_page": 1, "total": 1, "per_page": 9 }
}
```

- `cover_url`: kapak görselinin tam URL'i, yoksa `null`.
- `category`: kategori yoksa `null`.
- Sayfalama için `meta.last_page` / `meta.current_page` kullan.

---

## 2. Blog — Tek Yazı

```
GET /api/posts/{slug}
```

Listeye ek olarak gövde ve SEO alanlarını döner.

**Örnek**
```bash
curl "http://127.0.0.1:8002/api/posts/stria-studio-launches"
```

**Cevap `200`**
```json
{
  "data": {
    "id": 1,
    "slug": "stria-studio-launches",
    "title_tr": "...", "title_en": "...",
    "excerpt_tr": "...", "excerpt_en": "...",
    "cover_url": null,
    "published_at": "2026-07-07T07:30:43+00:00",
    "category": { "slug": "...", "name_tr": "...", "name_en": "..." },
    "tags": [ { "slug": "...", "name_tr": "...", "name_en": "..." } ],
    "body_tr": "<p>HTML içerik…</p>",
    "body_en": "<p>HTML content…</p>",
    "meta_title_tr": null, "meta_title_en": null,
    "meta_desc_tr": null, "meta_desc_en": null
  }
}
```

- `body_*`: admin editöründen gelen **HTML**. SEO `meta_*` boşsa istemci
  `title`/`excerpt`'e düşer.
- Yayınlanmamış / olmayan slug → **`404`**.

---

## 3. Kategoriler

```
GET /api/categories
```
```json
{ "data": [ { "id": 1, "slug": "studio-updates", "name_tr": "Stüdyo Güncellemeleri", "name_en": "Studio Updates" } ] }
```

## 4. Etiketler

```
GET /api/tags
```
```json
{ "data": [ { "id": 1, "slug": "launch", "name_tr": "Lansman", "name_en": "Launch" } ] }
```

---

## 5. Hizmetler — Listeleme

```
GET /api/services          (Next base: :3001/api)
```

7 hizmeti çift dil döner. Statik içerik; auth/filtre yok.

**Örnek**
```bash
curl "http://127.0.0.1:3001/api/services"
```

**Cevap `200`**
```json
{
  "data": [
    {
      "slug": "microblading",
      "name_tr": "Microblading",
      "name_en": "Microblading",
      "tag_tr": "Kaş",
      "tag_en": "Brows",
      "desc_tr": "Kıl tekniğiyle çizilen, gerçek kaşlardan ayırt edilemeyen...",
      "desc_en": "Hair-stroke technique that mimics natural brow hairs...",
      "image": "/images/micro.png",
      "url": "/hizmetler/microblading"
    }
  ]
}
```

- `url`: sitedeki hizmet detay sayfasının yolu.
- Tek hizmetin tam SEO içeriği (intro, benefits, process, FAQ) API'de değil;
  `/hizmetler/{slug}` sayfasında sunulur.

---

## 6. İletişim / Randevu Formu

```
POST /api/contact          (Laravel base: :8002/api)
```

**Gövde** (`application/json`)

| Alan | Zorunlu | Kural |
|---|---|---|
| `name` | ✓ | string, ≤120 |
| `phone` | ✓ | string, ≤40 |
| `email` | – | email, ≤160 |
| `service` | – | string, ≤80 |
| `preferred_date` | – | tarih (YYYY-MM-DD) |
| `message` | – | string, ≤2000 |
| `locale` | – | `tr` \| `en` |

**Örnek**
```bash
curl -X POST "http://127.0.0.1:8002/api/contact" \
  -H "Content-Type: application/json" \
  -d '{"name":"Ayşe","phone":"05551112233","service":"Microblading","locale":"tr"}'
```

**Cevap `201`**
```json
{ "ok": true, "id": 12 }
```

**Doğrulama hatası `422`**
```json
{ "message": "The name field is required.", "errors": { "name": ["The name field is required."] } }
```

---

## Blog Ekleme (yazı oluşturma)

Halka açık yazma API'si **yoktur** (bilinçli — güvenlik yüzeyini açmamak için).
Yazılar **admin panelinden** eklenir/düzenlenir:

1. **Panel:** `http://127.0.0.1:8002/admin` (prod: `https://<api-domaini>/admin`)
2. **Giriş:** `owner@striastudio.com` / `change-me-now`
   *(değiştir: `.env`'e `OWNER_EMAIL`/`OWNER_PASSWORD` ekle → `php artisan db:seed --class=OwnerUserSeeder`)*
3. **Posts → New** → TR/EN sekmelerinde başlık/özet/içerik doldur, kapak yükle,
   kategori & etiket seç, SEO sekmesinde (opsiyonel) meta override gir.
4. **is_published** aç + **published_at** ayarla → kaydet.

Yayınlanan yazı anında `GET /api/posts` ve `GET /api/posts/{slug}` uçlarında
görünür (frontend blogda ISR ile ~5 dk içinde).

> Programatik (dış sistemden) yazı ekleme gerekirse token korumalı
> `POST /api/posts` eklenebilir (Laravel Sanctum kurulumu gerekir) — şu an yok.

---

## Hata kodları özeti

| Kod | Anlam |
|---|---|
| `200` | Başarılı (okuma) |
| `201` | Oluşturuldu (iletişim formu) |
| `404` | Yazı bulunamadı / yayınlanmamış |
| `422` | Doğrulama hatası (iletişim formu alanları) |
