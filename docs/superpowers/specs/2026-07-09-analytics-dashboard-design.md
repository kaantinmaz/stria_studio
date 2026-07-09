# Design: Analytics Dashboard (first-party, cookieless)

**Date:** 2026-07-09
**Status:** Approved (design).

## Goal

A detailed analytics dashboard on the Filament admin (`/admin`): daily visitors
(line chart), traffic sources (AI vs search vs social vs direct), most-viewed
pages, and interaction events (WhatsApp / call clicks) — all first-party,
cookieless, stored in our DB, charted with Chart.js (Filament's native
ChartWidget). Heatmap deferred to a later phase.

## Decisions (locked)

- **Custom first-party** collection → our DB → Filament widgets.
- **Cookieless / anonymous:** no cookie; `visitor_id = sha256(ip + user_agent +
  YYYY-MM-DD + APP_KEY)` (daily-rotating, server-side). Raw IP never stored. No
  PII. KVKK-light, no consent banner.
- **Heatmap deferred.**

## Non-goals
- Heatmap / session recording (later). No third-party analytics. No per-user identity.

---

## Data collection

Next client `Analytics` component (site-wide, in layout):
- **Pageview** on every route change (App Router `usePathname`): `POST
  {apiUrl}/api/track` `{ type:"pageview", path, referrer: document.referrer, utm_source, utm_medium, utm_campaign }` via `fetch(..., { keepalive:true })`.
- **Events** via a single delegated `document` click listener (no per-component
  edits): a click whose `closest('a[href^="tel:"]')` → `track("call_click")`; a
  click whose `closest('a[href*="wa.me"], a[href*="whatsapp"]')` →
  `track("whatsapp_click")`. `track(name)` POSTs `{ type:"event", name, path }`.
- UTM parsed from `window.location.search` on first load.

## Backend (Laravel)

`visits` — `id, visitor_id (char 64, indexed), path (indexed), source (indexed),
referrer_host (nullable), utm_source/utm_medium/utm_campaign (nullable),
timestamps` (created_at indexed for daily grouping).

`events` — `id, visitor_id, name (indexed), path, timestamps`.

`App\Support\TrafficSource::classify(?string $referrer, ?string $utmSource): string`
→ one of `ai | search | social | direct | referral`. Server-side host lists:
- **ai:** chatgpt.com, chat.openai.com, perplexity.ai, gemini.google.com,
  bard.google.com, claude.ai, copilot.microsoft.com, you.com, poe.com (+ utm_source containing "chatgpt"/"openai"/"perplexity"/"gemini"/"claude"/"copilot").
- **search:** google., bing., yandex., duckduckgo., search.brave., ecosia.
- **social:** instagram., facebook., fb., t.co, x.com, twitter., tiktok.,
  youtube., youtu.be, linkedin., pinterest.
- **direct:** empty/missing referrer.
- **referral:** anything else with a referrer.

`POST /api/track` (`TrackController@store`):
- Validate: `type` in [pageview,event]; `path` required string ≤512; `referrer`
  nullable ≤512; `name` required-with type=event, string ≤64; utm_* nullable ≤255.
- `visitor_id = hash('sha256', $request->ip() . $ua . now()->toDateString() . config('app.key'))`.
- **Bot filter:** skip storing if UA matches `/bot|crawl|spider|slurp|headless|preview/i` (return 204 anyway).
- pageview → classify source (from referrer host + utm_source) → insert `visits`.
- event → insert `events`.
- Return **204** (no body; fire-and-forget beacon).
- Route throttled: `throttle:120,1` (per IP/min).

## Filament dashboard (`/admin`)

Widgets auto-discovered from `app/Filament/Widgets` (panel already discovers them).
All use Filament's Chart.js-backed widgets — no new dependency.

1. `AnalyticsStatsOverview extends StatsOverviewWidget` — cards: **Bugün** (distinct
   visitor_id where created_at::date = today), **Bu hafta** (last 7 days distinct),
   **Toplam görüntüleme** (visits count), **WhatsApp tık** + **Ara tık** (events by name).
2. `DailyVisitorsChart extends ChartWidget` (type `line`) — last 30 days: distinct
   visitor_id per day. `columnSpan='full'`.
3. `TrafficSourcesChart extends ChartWidget` (type `doughnut`) — visits grouped by
   `source` (AI/Arama/Sosyal/Direkt/Referans, TR labels).
4. `TopPagesChart extends ChartWidget` (type `bar`, horizontal) — top 8 paths by
   view count. `columnSpan='full'`.

`$sort` on each so they order sensibly above the default Account/Info widgets.

**Demo data:** an `AnalyticsDemoSeeder` (NOT in DatabaseSeeder; run manually in dev)
generates ~30 days of random visits (varied sources/paths) + some events, so the
dashboard renders with data during development and verification. Real data comes
from the live tracker.

## Privacy / security
- No cookie, no PII, raw IP discarded after hashing. Daily-rotating visitor_id.
- Ingest is public but validated, bot-filtered, and rate-limited.
- CORS already allows `api/*`.

## Risks
1. **Public write endpoint** — mitigated by validation + throttle + bot filter +
   204 (no data leak). Not auth'd by design (anonymous ingest).
2. **Daily-rotating visitor_id** — "unique visitors" is per-day accurate; a person
   across N days counts N times in the 30-day line (acceptable for a daily-visitors
   trend). Documented.
3. **Chart widget queries** — group-by on `visits`; keep indexed columns
   (created_at, source, path) to stay fast at small scale.

## Decomposition (tasks)
1. Migrations (visits + events) + models + TDD.
2. `TrafficSource` classifier + `TrackController` ingest + route (throttle) + bot filter + TDD.
3. Frontend `Analytics` component (pageview beacon + delegated click events + UTM) + wire into layout.
4. Filament widgets (stats + line + doughnut + bar) + `AnalyticsDemoSeeder`.
5. End-to-end verification (live beacon → stored → widget reflects) + final review.
