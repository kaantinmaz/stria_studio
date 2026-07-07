# Stria Studio Website — Design Spec

**Date:** 2026-07-07 · **Status:** approved (lean process)

## What it is
Single-page marketing site for **Stria Studio**, an Ankara permanent-makeup / beauty studio (microblading, brows, lashes, lips). **Bilingual TR/EN** with a runtime toggle (TR default). Faithful port of the Claude Design `Stria Studio - Minimal.dc.html` to Next.js + Tailwind, plus an appointment form backed by Laravel + MySQL.

## Stack & layout
- **Frontend:** Next.js (App Router, TypeScript) + Tailwind CSS. Static page.
- **Backend:** Laravel (API-only). MySQL `stria_studio` on MAMP :8889.
- Monorepo:
  ```
  frontend/   Next.js + Tailwind
  backend/    Laravel API
  ```

## Design tokens (exact, from source)
- Font: **Jost** 300–600 (Google Fonts).
- Colors: bg `#FBF4F1`, text `#42302E`, accent `#C57C69` / `#D89A8A`, soft-pink `#F3DED7`, section `#F5E6E0`, dark `#42302E`.
- Motifs: arch hero image (`border-radius:200px 200px 32px 32px`), floating cards, `striaUp` scroll-reveal (IntersectionObserver, threshold .12), rounded pills/cards, blurred sticky nav.

## Sections (order)
1. **Nav** — fixed. Dark contact-bar (phone, hours, Instagram, location) + main nav (logo `stria.`, links Services/Gallery/About/Contact, TR/EN toggle, Call button, WhatsApp CTA).
2. **Hero** — kicker badge, 2-line title, lead text, WhatsApp + Call CTAs, 3 feature checks, arch image + floating featured-service card + floating 5.0 rating chip.
3. **Services** — 7 cards (Microblading, Powder Brows, Eyeliner, Lash-line, Lip Blush, Brow Lamination, Lash Lift): image, tag, name, desc, price note, WhatsApp link.
4. **Gallery** — 6-image responsive grid (before/after).
5. **About/Trust** — image + copy + 4 stat tiles.
6. **Contact** — copy + WhatsApp/phone CTAs **+ appointment form** (new) + info card + map placeholder.
7. **Footer** — logo, tagline, social links, copyright.

## i18n
TR/EN dictionaries ported verbatim from the design's `C` object into `lib/i18n.ts`. Client-side language context + toggle button. Content: nav, hero, services (7, bilingual), gallery labels, trust (4), about, contact, footer, info rows.

## Appointment form (addition to design)
Contact section gets a form. Keep existing WhatsApp/phone CTAs.
- **Fields:** name (req), phone (req), email (opt), service (select of the 7 + "Other"), preferred_date (opt, `<input type=date>`), message (opt).
- **Flow:** client POST → `POST /api/contact` (Laravel) → validate → insert into `leads` → JSON `{ok:true}`. Inline success/error, no page reload.
- **Validation:** name ≤120, phone ≤40 required; email nullable email; service nullable ≤80; message ≤2000. Server-side authoritative; light client-side required checks.

## Data model
`leads` table:
| col | type |
|---|---|
| id | bigint PK |
| name | varchar(120) |
| phone | varchar(40) |
| email | varchar(160) null |
| service | varchar(80) null |
| preferred_date | date null |
| message | text null |
| locale | varchar(5) (tr/en) |
| created_at / updated_at | timestamp |

No admin UI (YAGNI) — view leads directly in MySQL. Add admin later if needed.

## Config / placeholders
Phone `+90 500 000 00 00`, `wa.me/905000000000`, IG `@striastudio`, address `Çankaya, Ankara` are **placeholders** from the design. Centralize in `frontend/lib/site.ts` (or env) so the owner swaps real values in one place. Map is a styled placeholder box (no live map key yet).

## Images
5 studio images referenced via CloudFront in the design. Download into `frontend/public/images/` (self-hosted; source URLs may expire). Empty slots (some services/gallery) render a soft-pink placeholder like the design's `image-slot` empty state.

## Non-goals
Booking/calendar integration, payments, blog/CMS, user accounts, live map, email delivery of leads (leads persist to DB only for now), admin panel.

## Verification
- `backend`: `php artisan migrate` creates `leads`; `curl POST /api/contact` inserts a row (visible via MySQL).
- `frontend`: page renders all 7 sections matching tokens; TR/EN toggle switches all copy; form submit creates a lead and shows success.
