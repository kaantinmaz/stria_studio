# Mikroblading Ankara — Microsite API

Public, read-only content API served by the shared Stria Studio Laravel backend.
All content is scoped by the `site` slug. Machine-readable spec: [`openapi.yaml`](../public/openapi.yaml) · rendered: [`/api-docs`](https://mikrobladingankara.com/api-docs).

**Base URL:** `{API_URL}/api/microsites/{site}` — e.g. `http://127.0.0.1:8002/api/microsites/mikroblading-ankara`
Unknown `{site}` (not in `backend/config/microsites.php`) → `404`. All responses are JSON.

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/service` | Pinned service detail (e.g. microblading) |
| GET | `/posts?page=1&tag=` | Paginated published blog posts (9/page) |
| GET | `/posts/{slug}` | Single post with HTML body |
| GET | `/faqs` | Active FAQs |
| GET | `/gallery` | Active gallery images (before/after) |
| GET | `/settings` | Studio NAP, socials, hours (shared with main site) |
| POST | `/contact` | Create a lead tagged with the site (rate limited 30/min) |

### GET /service
```json
{ "data": { "slug": "microblading", "name_tr": "Microblading", "intro_tr": "…",
  "benefits_tr": ["…"], "process_tr": ["…"], "faq_tr": [{"q":"…","a":"…"}], "gallery": [] } }
```

### GET /posts
```json
{ "data": [ { "id": 1, "slug": "mikroblading-nedir", "title_tr": "…", "excerpt_tr": "…",
  "cover_url": null, "published_at": "2026-07-04T…", "category": null } ],
  "meta": { "current_page": 1, "last_page": 1, "total": 6 } }
```

### GET /posts/{slug}
```json
{ "data": { "slug": "mikroblading-nedir", "title_tr": "…", "body_tr": "<p>…</p>",
  "meta_title_tr": "…", "meta_desc_tr": "…" } }
```

### GET /faqs
```json
{ "data": [ { "q_tr": "Mikroblading nedir?", "a_tr": "…" } ] }
```

### GET /gallery
```json
{ "data": [ { "image": "https://…/storage/…jpg", "alt_tr": "…" } ] }
```

### GET /settings
```json
{ "data": { "phone": "+90 …", "whatsapp": "https://wa.me/…", "street_address": "…",
  "locality": "Çankaya", "region": "Ankara", "lat": 39.9208, "lng": 32.8541,
  "hours": [ { "days": ["Monday"], "open": "10:00", "close": "19:00" } ] } }
```

### POST /contact
Request:
```json
{ "name": "Ad Soyad", "phone": "05xx…", "email": null, "preferred_date": "2026-07-20", "message": "…" }
```
Response `201`:
```json
{ "ok": true, "id": 42 }
```
Validation errors → `422`; rate limit → `429`.

## Notes
- Main-site endpoints (`/api/posts`, `/api/faqs`, `/api/gallery`) return **only** rows with `site IS NULL`; microsite rows never leak into the main site and vice-versa.
- Backend implementation: `backend/app/Http/Controllers/MicrositeController.php`, routes in `backend/routes/api.php`, config in `backend/config/microsites.php`.
