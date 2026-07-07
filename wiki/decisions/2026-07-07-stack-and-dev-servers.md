# Decision: stack, dev servers, contact form

**Date:** 2026-07-07

## Context
Building the Stria Studio marketing site from the imported Minimal design. Stack chosen by owner: Next.js frontend, Laravel backend, MySQL, Tailwind.

## Decisions
- **Monorepo:** `frontend/` (Next.js 16, App Router, TS, Tailwind v4) + `backend/` (Laravel 13, API-only).
- **DB:** MySQL 5.7.39 on MAMP `127.0.0.1:8889`, database `stria_studio`. No `defaultStringLength(191)` needed — 5.7.39 migrated clean.
- **Dev ports (this machine):** Laravel on **:8002** and Next on **:3001**, because 8000/8001/3000 were taken by other MAMP projects (e.g. `cortemilano`). Frontend targets the API via `frontend/.env.local` → `NEXT_PUBLIC_API_URL`. Change both if ports differ elsewhere.
- **Contact form (added, not in original design):** the design's contact section had only WhatsApp/phone CTAs. Owner asked for a form → MySQL, so an appointment form (name, phone, email, service, preferred_date, message, locale) was added, POSTing to `POST /api/contact` → `leads` table. WhatsApp/phone CTAs kept alongside.
- **No admin UI** (YAGNI). Leads viewed directly in MySQL. Add later if needed.
- **CORS:** relies on Laravel's default `api/*` CORS (allow-origin `*`). Verified preflight + POST from the Next origin. Lock down origins before production.

## Consequences
- Placeholder contacts (phone `+90 500…`, `wa.me/905…`, `@striastudio`, address) live in `frontend/lib/site.ts` — owner replaces in one place.
- Studio images are self-hosted in `frontend/public/images/` (source CloudFront URLs may expire).

## Sources
[[stria-studio-design]] · docs/superpowers/specs/2026-07-07-stria-studio-website-design.md
