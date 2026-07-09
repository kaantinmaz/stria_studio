# Mikroblading Ankara — SEO Microsite

TR-only, single-service SEO/AEO microsite for **mikrobladingankara.com** (microblading / kıl tekniği kaş, Ankara Çankaya). Part of the Stria Studio project: a standalone Next.js app that reads content from the **shared Laravel backend** (`../backend`), scoped by the `site` slug `mikroblading-ankara`.

## Stack
- Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS 4 · TypeScript
- SSG + ISR (`revalidate: 3600`) — content edits in the shared admin appear within the hour, no redeploy.

## Setup
```bash
cp .env.local.example .env.local   # adjust if needed
npm install
npm run dev                        # http://localhost:3001
```
Requires the shared backend running (default `http://127.0.0.1:8002`). Pages fall back to built-in copy if the API is unreachable, so the build never fails when the backend is down.

### Environment
| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Shared Laravel API base (no trailing slash) |
| `NEXT_PUBLIC_SITE` | Microsite slug — must match a key in `backend/config/microsites.php` |
| `NEXT_PUBLIC_SITE_URL` | Public domain (canonical, sitemap, OpenGraph) |

## Build
```bash
npm run build && npm start   # prod on :3001
```

## Pages
`/` · `/mikroblading-fiyatlari` · `/mikroblading-nasil-yapilir` · `/galeri` · `/blog` + `/blog/[slug]` · `/sss` · `/hakkimizda` · `/iletisim` · `/api-docs`

## SEO / AI-search (AEO / GEO)
- **JSON-LD**: `BeautySalon` (NAP+geo+hours), `Service`, `FAQPage`, `HowTo`, `BlogPosting`, `BreadcrumbList`.
- **Answer-first** content with question-form headings; pricing/comparison **tables** and step lists (extractable by LLMs).
- `robots.ts` **allows AI bots** (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…), blocks training-only CCBot.
- `/llms.txt` manifest (overview + key links + machine-readable pricing).
- `sitemap.ts`, canonical URLs, OpenGraph/Twitter, geo meta, `lang="tr"`, generated `/og` share image.

## Content source
All dynamic content (blog, FAQ, gallery, service, settings) comes from the shared backend:
`GET {API_URL}/api/microsites/mikroblading-ankara/*` — see [`/api-docs`](/api-docs) and [`openapi.yaml`](public/openapi.yaml). Manage it in the Filament admin (Posts/FAQs/Gallery have a **Site** selector).

## Structure
```
app/            routes (pages + robots/sitemap/llms.txt/og)
components/      UI (Nav, Footer, Hero sections, Faq, Gallery, ContactForm…)
lib/            site config, API client (content.ts), seo.ts, schema.ts, copy.ts
public/         openapi.yaml
```

## Add another microsite
1. Add a key to `backend/config/microsites.php` (slug → service + name).
2. Copy this app, change `NEXT_PUBLIC_SITE` / `NEXT_PUBLIC_SITE_URL` + `lib/site.ts` + `lib/copy.ts`.
3. Tag content with the new `site` in the admin.
