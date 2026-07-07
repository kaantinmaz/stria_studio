# Stria Studio

Bilingual (TR/EN) marketing site for **Stria Studio** — a permanent-makeup & beauty studio in Çankaya, Ankara. Next.js frontend + Laravel API, ported from the "Minimal" Claude Design.

## Stack
- **frontend/** — Next.js 16 (App Router, TS) · Tailwind CSS v4 · Jost
- **backend/** — Laravel 13 (API-only) · MySQL
- Contact/appointment form → `POST /api/contact` → `leads` table

## Run locally

Requires PHP 8.2+, Composer, Node 18+, and MySQL (MAMP `:8889` in dev).

```bash
# backend
cd backend
composer install
cp .env.example .env            # set DB_* (dev: 127.0.0.1:8889 / stria_studio / root / root)
php artisan key:generate
php artisan migrate
php artisan serve --port=8002

# frontend
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8002" > .env.local
npm run dev -- --port 3001
```

Open http://localhost:3001.

## Notes
- Contact details (phone, WhatsApp, Instagram, address) are placeholders in `frontend/lib/site.ts` and `frontend/lib/i18n.ts` — replace with real values.
- Studio images are self-hosted in `frontend/public/images/`.
- Project knowledge base + agent config: see [`CLAUDE.md`](CLAUDE.md) and [`wiki/`](wiki/README.md).
