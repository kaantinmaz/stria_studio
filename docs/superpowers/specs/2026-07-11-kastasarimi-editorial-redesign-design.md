# Design: Kaş Tasarımı Ankara microsite — "Atelier" editorial redesign

**Date:** 2026-07-11
**App:** `kastasarimi/` (Next.js, port 3002, SSG+ISR) — the `kas-tasarimi-ankara` SEO microsite.
**Status:** Design — pending user review.

## Goal

Replace the microsite's visual identity with a distinct **editorial-luxe** system
("Atelier") — the page should read like a print fashion editorial: oversized
serif display, generous negative space, hairline rules, numbered sections,
restrained warm palette. Full-depth change: **visual + layout + Turkish copy voice.**

This supersedes both prior looks (committed "clinical minimal", uncommitted
"rose-gold feminine"). The uncommitted rose-gold WIP is preserved via `git stash`
as step 0 of implementation (recoverable), then overwritten.

## Decisions (locked with user)

| Axis | Choice |
|---|---|
| Direction | Editorial luxe — "Atelier" |
| Scope | Full: visual + layout + copy voice |
| Accent | Cognac / caramel `#8A6A4F` (single accent) |
| Display font | Fraunces (variable serif) |
| Body font | Inter (kept — already loaded) |

## Non-negotiable SEO/AEO guardrails (do NOT break)

The redesign is visual + voice only. The following must survive intact
(source: `wiki/decisions/2026-07-09-microsite-architecture.md`, `lib/copy.ts` header):

1. **Answer-first blocks stay factual & keyworded** — `whatIs.answer` (the
   "kaş tasarımı nedir" 40–60w definition), `pricing.rows`, `faqFallback`
   keep their facts, numbers, and keywords. Voice may tighten; substance stays.
2. **Question-form headings stay** — "Kaş tasarımı nedir?", "Kaş tasarımı nasıl
   yapılır?", "Kaş tasarımı fiyatları…" etc. (targets AEO/featured-snippets).
3. **H1 keeps the primary keyword** — the hero H1 must still contain
   "Kaş Tasarımı Ankara". Editorial feel comes from typography + spacing, not
   from dropping the keyword.
4. **Keyword targets in `site.ts` unchanged**; pricing stays mirrored in
   `/llms.txt` (`app/llms.txt/route.ts`).
5. **House rule** — never name any other technique or the brand-term for the
   technique. The site stands out purely as "kaş tasarımı".
6. **JSON-LD, metadata, robots, sitemap, geo meta untouched.**

## Design system

### Palette — remap existing token *values* (names unchanged → cascades to every component & sub-page)

`globals.css` `@theme` block. Names are fixed API; only values change.

| Token | Old (rose-gold) | New (Atelier) | Role |
|---|---|---|---|
| `--color-cream` | `#f7f0f3` | `#F5F1E8` | warm paper base |
| `--color-ink` | `#3a2432` | `#171412` | text + dark sections |
| `--color-accent` | `#b76e79` | `#8A6A4F` | cognac — buttons, marks |
| `--color-accent-dark` | `#98505f` | `#6E5038` | deeper cognac — links on light, hover |
| `--color-rose` | `#cb9aa8` | `#B79A7E` | muted tan (light-accent tint) |
| `--color-pink` | `#ecd7df` | `#EAE0D2` | selection tint |
| `--color-blush` | `#efe1e9` | `#EFE7DA` | alternating section bg (warm paper) |
| `--color-muted` | `#927d88` | `#8A8178` | muted warm-grey label text |
| `--color-muted2` | `#6c5460` | `#5C554E` | stronger body/muted text |
| `--color-line` | `#e9dae1` | `#E4DCCB` | hairline |
| `--color-line2` | `#e1cfd8` | `#D9CFBB` | stronger hairline |

**Accessibility:** body/paragraph text uses `ink`/`muted2` on `cream` (high
contrast). `accent` (cognac) is reserved for button fills (white text on
cognac), marks, and numerals; text-links on light use `accent-dark` `#6E5038`
(~5:1 on paper). No accent-colored body copy.

### Typography

- **Display:** Fraunces via `next/font/google` — replaces Cormorant. Weights
  `400/500/600/700`, `italic` enabled (editorial italic accents). New CSS var
  `--font-fraunces`; `--font-display` points to it. High optical contrast at
  large sizes is the whole point — headline clamp up to ~84px.
- **Body:** Inter, unchanged.
- `layout.tsx`: swap the `Cormorant_Garamond` import for `Fraunces`; keep Inter.

### Editorial primitives (globals.css utility classes)

- `.eyebrow` — restyled: tracked small-caps label, `muted`, preceded by a short
  ink hairline (remove the rose gradient flourish). Used as section/gutter label.
- `.rule-tick` → `.rule` — plain full-width hairline (`line2`), drop the rose dot.
- `.section-index` — big Fraunces numeral ("01", "02"…) in `accent`, sits left of
  or above section headings.
- `.plate` / `.plate-caption` — framed figure container + `Fig. NN — …` caption
  (small-caps, `muted`) for the hero brow line-art.
- `.pull-quote` — large Fraunces italic quote styling for reviews.
- `::selection` → `pink` tint on `ink`.
- `.prose` (blog/CMS body) — recolors automatically (uses token vars); Fraunces
  already flows via `--font-display`. No structural change.

## Layout & component changes

Editorial character lives in layout, not just color. Per component:

- **`Nav.tsx`** — minimal editorial bar: Fraunces wordmark left, thin bottom
  rule, tracked-caps links, primary action becomes a **text link "Randevu →"**
  (drop the pill). Keep sticky + mobile menu behavior.
- **`page.tsx` hero** — asymmetric two-column: oversized Fraunces H1 (keyword
  intact), tracked eyebrow `ANKARA · ÇANKAYA — STRIA STUDIO`, hairline, spare
  subtitle, text CTA + phone. Right column = `BrowFlourish` in a `.plate` with
  `Fig. 01 — Kıl tekniği` caption. Remove rounded card + rose shadow.
- **`page.tsx` sections** — each section gets a `.section-index` numeral + big
  left-aligned Fraunces heading; gutter small-caps label. Remove pill/box framing.
- **`Section.tsx`** — support an optional `index` prop for the numeral; heading
  scale up; tighten to editorial rhythm.
- **Benefits & Process → ruled lists** — flat rows separated by hairlines, big
  numerals, Fraunces titles; **no filled rounded cards, no shadows** (current
  `rounded-[16px] border bg-white` boxes removed). (`ProcessSteps.tsx`, and the
  benefits grid inline in `page.tsx`.)
- **`PricingTable.tsx`** — hairline editorial table: Fraunces prices, ruled rows,
  drop fills/zebra to at most a single subtle rule set.
- **`Reviews.tsx`** — large Fraunces italic pull-quotes, small-caps attribution.
- **`TrustBar.tsx`** — big Fraunces stat numerals + tracked small-caps labels,
  separated by hairlines.
- **`CTA.tsx`** — `CTAButtons`: keep WhatsApp as the one filled cognac button;
  phone becomes a bordered/underlined editorial link. `CTABanner`: full-width
  `ink` block, big Fraunces headline, text CTA.
- **`BrowFlourish.tsx`** — recolor strokes from rose (`#b76e79…`) to `ink` +
  `accent` (cognac); glow → warm paper tint. Same geometry.
- **`Footer.tsx`** — editorial columns, hairline rules, Fraunces headings.
- **Sub-pages** (`kas-tasarimi-fiyatlari`, `kas-tasarimi-nasil-yapilir`,
  `hakkimizda`, `galeri`, `sss`, `iletisim`, `blog`, `blog/[slug]`, `api-docs`)
  — inherit tokens/fonts automatically. Touch only where a hardcoded
  rounded/box/shadow style breaks the editorial look; no content restructure.

## Copy voice (Turkish)

Editorial voice = confident, spare, precise. Apply to `lib/copy.ts`:

- **Rewrite freely** (voice/framing): `hero.eyebrow`, section labels/eyebrows,
  `benefits.intro`, connective phrasing, review framing. Prefer short declarative
  editorial lines over marketing filler.
- **Rewrite carefully** (keep facts + keywords + answer-first shape):
  `hero.title` (must keep "Kaş Tasarımı Ankara"), `whatIs.answer`, `pricing.*`,
  `faqFallback`, `about.paragraphs`.
- Example hero direction:
  - `eyebrow`: `Ankara · Çankaya — Stria Studio`
  - `title`: `Kaş Tasarımı Ankara` (H1, dominant Fraunces) — keyword-exact
  - `subtitle`: `Yüz hatlarınıza göre çizilen, kıl kıl işlenen kalıcı kaşlar.
    Altın oran ölçümü, steril uygulama, 12–18 ay kalıcılık.` (tightened, keywords kept)
- House rule enforced throughout.

## Files touched

`app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `lib/copy.ts`,
`components/{Nav,CTA,Section,PricingTable,ProcessSteps,Reviews,TrustBar,BrowFlourish,Footer}.tsx`.
Sub-page `.tsx` only where hardcoded box/shadow styles clash. No backend, schema,
API, JSON-LD, metadata, or routing changes.

## Out of scope

- Backend / CMS / API / DB.
- New content sections, new routes, new imagery/photography.
- SEO structure (schema, metadata, robots, sitemap, llms.txt data) — untouched.
- The main Stria Studio site and the mikroblading microsite.

## Verification / success criteria

1. `npm run build` (in `kastasarimi/`) passes; `npm run dev` on :3002 renders.
2. Home + every sub-page render with the Atelier system (cognac/paper, Fraunces
   heads, ruled lists, numbered sections) — visually confirmed in browser.
3. H1 still contains "Kaş Tasarımı Ankara"; question-form headings intact;
   `whatIs.answer`, pricing rows, FAQ facts unchanged in substance.
4. `/llms.txt` still emits the same pricing data.
5. No rose-gold / rounded-card / drop-shadow remnants on any page.
6. House rule holds — no other technique or its brand-term named anywhere.

## Risks

- **Losing rose-gold WIP:** mitigated — `git stash` before starting (step 0),
  recoverable.
- **SEO regression via copy rewrite:** mitigated by the guardrails section;
  answer-first blocks keep facts+keywords, verified in criterion 3.
- **Contrast:** cognac accent kept off body text; verified against paper base.
