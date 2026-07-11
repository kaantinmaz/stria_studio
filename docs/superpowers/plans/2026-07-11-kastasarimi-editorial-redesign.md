# Kaş Tasarımı Ankara — "Atelier" Editorial Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `kastasarimi/` microsite's visual identity with a distinct editorial-luxe system ("Atelier") — cognac/paper palette, Fraunces display, numbered sections, hairline-ruled lists, editorial copy voice — without breaking any SEO/AEO structure.

**Architecture:** Design tokens in `app/globals.css` use fixed names (`cream/ink/accent/…`) that every component references, so remapping token *values* recolors the whole site + sub-pages for free. On top of that: swap the display font (Cormorant→Fraunces), add editorial utility classes, restructure the home page + primary shared components (Nav, hero, TrustBar, ProcessSteps, PricingTable, Reviews, CTA, Footer, BrowFlourish), rewrite copy voice, and run a mechanical "sharp corners / no shadow" pass over secondary surfaces & sub-pages.

**Tech Stack:** Next.js 16 (App Router, SSG+ISR), React 19, Tailwind CSS v4 (`@theme` in `globals.css`), `next/font/google`. TypeScript. No test framework in this app — verification is `npm run build` + `npm run lint` + browser visual + grep guardrails.

## Global Constraints

Every task's requirements implicitly include these. Values verbatim from the spec (`docs/superpowers/specs/2026-07-11-kastasarimi-editorial-redesign-design.md`):

- **No new dependencies.** Fraunces loads via `next/font/google` (no package). Next 16.2.10 / React 19.2.4 / Tailwind v4 stay.
- **Accent =** cognac `#8A6A4F`; **accent-dark =** `#6E5038`; **paper (cream) =** `#F5F1E8`; **ink =** `#171412`. Full token table in Task 1.
- **Display font =** Fraunces; **body =** Inter (kept).
- **H1 keeps the primary keyword** "Kaş Tasarımı Ankara".
- **Question-form headings stay** ("Kaş tasarımı nedir?", "…nasıl yapılır?", "…fiyatları…").
- **Answer-first blocks keep facts+keywords:** `whatIs.answer`, `pricing.rows`, `faqFallback`, `about.paragraphs`. Voice may tighten; substance/numbers/keywords stay.
- **Keyword targets in `lib/site.ts` unchanged.** `/llms.txt` pricing data unchanged.
- **House rule:** never name any other technique or the brand-term for the technique. Site stands out purely as "kaş tasarımı".
- **Do not touch:** JSON-LD (`lib/schema.ts`, `JsonLd`), metadata, `robots.ts`, `sitemap.ts`, geo meta, backend/API/DB.
- **`accent` never used on body text.** Body/paragraph text = `ink`/`muted2` on paper. Cognac only for button fills (white text), numerals, marks; text-links on light = `accent-dark`.
- Working dir for all commands: `kastasarimi/`.

---

### Task 1: Foundation — stash WIP, remap tokens, swap font

Recolors the entire site and switches the display font. After this task alone the site is cognac/paper + Fraunces (layout still old).

**Files:**
- Modify: `kastasarimi/app/globals.css` (`@theme` block + base + utilities)
- Modify: `kastasarimi/app/layout.tsx` (font import)

**Interfaces:**
- Produces: CSS token vars (`--color-*` names unchanged, new values), `--font-fraunces` / `--font-display`, and editorial utility classes `.eyebrow` (restyled), `.rule`, `.section-index`, `.plate`, `.plate-caption`, `.pull-quote` — consumed by all later tasks.

- [ ] **Step 1: Stash the uncommitted rose-gold WIP (recoverable)**

```bash
cd kastasarimi
git stash push -m "rose-gold WIP (superseded by Atelier redesign)" -- \
  app components lib
git stash list   # confirm one entry exists
```
Expected: working tree for `kastasarimi/` matches last commit (clinical minimal); one stash entry listed. (The design/plan docs live outside these paths and are already committed.)

- [ ] **Step 2: Rewrite `app/globals.css`** — replace the whole file with:

```css
@import "tailwindcss";

/* ── Kaş Tasarımı Ankara — "Atelier" editorial design system ──
   Warm paper base, near-black ink, single cognac accent, Fraunces editorial
   serif display, hairline rules, numbered sections. Token NAMES are reused so
   shared components recolor globally. */
@theme {
  --color-cream: #f5f1e8; /* warm paper base */
  --color-ink: #171412; /* warm near-black: text + dark sections */
  --color-accent: #8a6a4f; /* cognac — primary accent */
  --color-accent-dark: #6e5038; /* deeper cognac — links on light, hover */
  --color-rose: #b79a7e; /* muted tan (light-accent tint) */
  --color-pink: #eae0d2; /* selection tint */
  --color-blush: #efe7da; /* warm paper — alternating section bg */
  --color-muted: #8a8178; /* muted warm-grey label text */
  --color-muted2: #5c554e; /* stronger body/muted text */
  --color-line: #e4dccb; /* hairline */
  --color-line2: #d9cfbb;

  --font-fraunces: var(--font-fraunces-src), Georgia, serif;
  --font-display: var(--font-fraunces-src), Georgia, serif;
  --font-body: var(--font-inter), system-ui, sans-serif;
  --font-sans: var(--font-inter), system-ui, sans-serif;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: var(--color-cream);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

h1,
h2,
h3 {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 500;
  letter-spacing: -0.015em;
}

.font-display {
  font-family: var(--font-display);
}

/* Editorial eyebrow — tracked small-caps label preceded by a short ink hairline. */
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--color-muted);
}
.eyebrow::before {
  content: "";
  width: 24px;
  height: 1px;
  background: var(--color-ink);
  opacity: 0.45;
}

/* Plain full-width hairline. */
.rule {
  height: 1px;
  background: var(--color-line2);
}

/* Big editorial section numeral (01, 02 …). */
.section-index {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(26px, 3.6vw, 40px);
  line-height: 1;
  color: var(--color-accent);
}

/* Framed figure + small-caps caption (hero brow plate). */
.plate {
  border: 1px solid var(--color-line2);
  background: var(--color-cream);
  padding: clamp(20px, 3vw, 40px);
}
.plate-caption {
  font-family: var(--font-body);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-muted);
}

/* Large italic editorial quote (reviews). */
.pull-quote {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(19px, 2.1vw, 25px);
  line-height: 1.42;
  color: var(--color-ink);
}

::selection {
  background: var(--color-pink);
  color: var(--color-ink);
}

/* Sticky WhatsApp button pulse ring (cognac) */
@keyframes waPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(138, 106, 79, 0.5);
  }
  70% {
    box-shadow: 0 0 0 16px rgba(138, 106, 79, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(138, 106, 79, 0);
  }
}

/* ── Blog / article body (server-rendered CMS HTML) ── */
.prose {
  color: var(--color-muted2);
  line-height: 1.8;
  font-size: 1.0625rem;
}
.prose > * + * {
  margin-top: 1.1em;
}
.prose h2 {
  font-family: var(--font-display);
  font-size: 1.85rem;
  font-weight: 500;
  color: var(--color-ink);
  margin-top: 2em;
  line-height: 1.2;
}
.prose h3 {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 500;
  color: var(--color-ink);
  margin-top: 1.6em;
}
.prose strong {
  color: var(--color-ink);
  font-weight: 600;
}
.prose ul,
.prose ol {
  padding-left: 1.3em;
}
.prose ul {
  list-style: disc;
}
.prose ol {
  list-style: decimal;
}
.prose li + li {
  margin-top: 0.4em;
}
.prose a {
  color: var(--color-accent-dark);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.prose table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  margin: 1.5em 0;
}
.prose th,
.prose td {
  border: 1px solid var(--color-line2);
  padding: 11px 15px;
  text-align: left;
}
.prose thead th {
  background: var(--color-blush);
  color: var(--color-ink);
  font-weight: 600;
  font-family: var(--font-display);
  font-size: 1.05rem;
}
.prose tbody tr:nth-child(even) {
  background: rgba(234, 224, 210, 0.5);
}
```

Note: `--font-fraunces-src` is the raw `next/font` CSS var set in Task 1 Step 3; `--font-fraunces`/`--font-display` wrap it with fallbacks.

- [ ] **Step 3: Swap the font in `app/layout.tsx`.** Replace the Cormorant import block (lines 2, 13–18) and the html `className`.

Replace line 2:
```tsx
import { Fraunces, Inter } from "next/font/google";
```
Replace the `cormorant` const (lines 13–18) with:
```tsx
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-fraunces-src",
  display: "swap",
});
```
Replace the `<html …>` opening tag (line 58):
```tsx
    <html lang="tr" className={`${fraunces.variable} ${inter.variable}`}>
```

- [ ] **Step 4: Build to verify tokens + font compile**

Run: `cd kastasarimi && npm run build`
Expected: build succeeds (Fraunces fetched, no unresolved CSS var errors).

- [ ] **Step 5: Commit**

```bash
cd kastasarimi
git add app/globals.css app/layout.tsx
git commit -m "feat(kas-tasarimi): Atelier design tokens + Fraunces display font"
```

---

### Task 2: Editorial `Section` (numbered heads)

**Files:**
- Modify: `kastasarimi/components/Section.tsx`

**Interfaces:**
- Consumes: `.eyebrow`, `.section-index` (Task 1).
- Produces: `Section` now accepts optional `index?: string` prop (e.g. `"01"`). Existing callers omitting it render with no numeral (backward compatible). Larger heading scale.

- [ ] **Step 1: Replace `components/Section.tsx`** with:

```tsx
import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto max-w-[1180px] px-5 ${className}`}>{children}</div>;
}

// A page section with an optional numeral index + eyebrow + heading + intro.
export function Section({
  id,
  index,
  eyebrow,
  heading,
  intro,
  children,
  narrow = false,
  className = "",
}: {
  id?: string;
  index?: string;
  eyebrow?: string;
  heading?: string;
  intro?: string;
  children?: ReactNode;
  narrow?: boolean;
  className?: string;
}) {
  return (
    <section id={id} className={`py-16 sm:py-24 ${className}`}>
      <Container className={narrow ? "max-w-[820px]" : ""}>
        {eyebrow && <span className="eyebrow mb-5">{eyebrow}</span>}
        {heading && (
          <div className="flex items-baseline gap-4 sm:gap-6">
            {index && <span className="section-index shrink-0">{index}</span>}
            <h2 className="max-w-[760px] text-[clamp(27px,3.8vw,46px)] leading-[1.06] text-ink">
              {heading}
            </h2>
          </div>
        )}
        {intro && <p className="mt-5 max-w-[680px] text-[17px] leading-relaxed text-muted2">{intro}</p>}
        {children}
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Build**

Run: `cd kastasarimi && npm run build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
cd kastasarimi && git add components/Section.tsx
git commit -m "feat(kas-tasarimi): editorial Section with optional numeral index"
```

---

### Task 3: Editorial Nav

**Files:**
- Modify: `kastasarimi/components/Nav.tsx`

**Interfaces:**
- Consumes: token colors, `font-display`. No API change (`Nav({ whatsapp })`).

- [ ] **Step 1: Replace the desktop CTA + link styling.** In `components/Nav.tsx`:

Replace the desktop `<nav …>` block (lines 33–51) with:
```tsx
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Ana menü">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[12px] uppercase tracking-[0.12em] text-muted2 transition hover:text-accent-dark"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-b border-ink pb-0.5 text-[12px] uppercase tracking-[0.12em] text-ink transition hover:border-accent-dark hover:text-accent-dark"
          >
            <WhatsAppIcon className="h-4 w-4" /> Randevu
          </a>
        </nav>
```

Replace the mobile CTA (lines 76–83) with:
```tsx
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 bg-ink px-5 py-3 text-[13px] uppercase tracking-[0.1em] text-cream"
          >
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp'tan Randevu
          </a>
```

- [ ] **Step 2: Build** — `cd kastasarimi && npm run build` → succeeds.

- [ ] **Step 3: Commit**

```bash
cd kastasarimi && git add components/Nav.tsx
git commit -m "feat(kas-tasarimi): editorial nav (text CTA, tracked caps links)"
```

---

### Task 4: Editorial hero + numbered home sections + ruled benefits

**Files:**
- Modify: `kastasarimi/app/page.tsx`

**Interfaces:**
- Consumes: `Section` `index` prop (Task 2), `.plate`/`.plate-caption` (Task 1), `BrowFlourish` (recolored in Task 9 — no API change).

- [ ] **Step 1: Replace the hero `<section>`** (lines 44–67) with:

```tsx
      {/* Hero */}
      <section className="border-b border-line">
        <Container className="grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="eyebrow">{hero.eyebrow}</span>
            <h1 className="mt-7 text-[clamp(40px,7vw,84px)] font-medium leading-[0.98] tracking-[-0.02em] text-ink">
              {hero.title}
            </h1>
            <div className="rule mt-8 max-w-[420px]" />
            <p className="mt-8 max-w-[500px] text-[18px] leading-relaxed text-muted2">{hero.subtitle}</p>
            <div className="mt-9">
              <CTAButtons settings={s} />
            </div>
            <ul className="mt-11 flex flex-wrap gap-x-8 gap-y-3 text-[11px] uppercase tracking-[0.16em] text-muted">
              {["Kişiye özel tasarım", "Kıl kıl doğal", "12–18 ay kalıcı"].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <span className="h-1 w-1 rounded-full bg-accent" aria-hidden="true" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <figure className="plate">
            <BrowFlourish className="w-full" />
            <figcaption className="plate-caption mt-4">Fig. 01 — Kıl tekniği</figcaption>
          </figure>
        </Container>
      </section>
```

- [ ] **Step 2: Replace the benefits `<Section>`** (lines 82–92) with a ruled list + numeral, and add `index` to the other home sections. Benefits block:

```tsx
      {/* Benefits */}
      <Section index="02" eyebrow="Avantajlar" heading={benefits.heading} intro={benefits.intro} className="bg-blush/40">
        <ul className="mt-12 border-t border-line">
          {benefits.items.map((b, i) => (
            <li key={b.title} className="grid grid-cols-[auto_1fr] gap-x-6 border-b border-line py-7 sm:grid-cols-[64px_1fr]">
              <span className="font-display text-[22px] leading-none text-accent">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-display text-[20px] font-medium text-ink">{b.title}</h3>
                <p className="mt-2 max-w-[560px] text-[15px] leading-relaxed text-muted2">{b.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>
```

- [ ] **Step 3: Add `index` props** to the remaining home `<Section>` tags. Apply exactly:
  - line 77 `<Section id="kas-tasarimi-nedir" narrow>` → `<Section id="kas-tasarimi-nedir" index="01" narrow>`
  - Process (was line 95): add `index="03"`
  - Pricing (was line 103): add `index="04"`
  - Gallery (was line 112): add `index="05"`
  - Reviews (was line 120): add `index="06"`
  - FAQ (was line 125): add `index="07"`
  - Blog (was line 133): add `index="08"`
  - Location (was line 141): add `index="09"`

Also give the "nedir" section a heading-scale bump — it currently uses a raw `<h2>` (lines 78–79). Replace those two lines with:
```tsx
        <div className="flex items-baseline gap-4 sm:gap-6">
          <span className="section-index shrink-0">01</span>
          <h2 className="text-[clamp(27px,3.8vw,46px)] leading-[1.06] text-ink">{whatIs.heading}</h2>
        </div>
        <p className="mt-5 text-[19px] leading-relaxed text-muted2">{whatIs.answer}</p>
```
(and drop the now-redundant `index="01"` you added to that Section tag — the numeral is rendered inline here because this section has no `intro`/eyebrow. Keep `id` + `narrow` only: `<Section id="kas-tasarimi-nedir" narrow>`.)

- [ ] **Step 4: Update the inline "detaylı" link colors** — the section links already use `text-accent-dark` (lines 97–99, 106–108, 114–116, 127–129, 135–137); leave them (still valid on paper). No change needed.

- [ ] **Step 5: Build** — `cd kastasarimi && npm run build` → succeeds.

- [ ] **Step 6: Commit**

```bash
cd kastasarimi && git add app/page.tsx
git commit -m "feat(kas-tasarimi): editorial hero, numbered sections, ruled benefits"
```

---

### Task 5: Editorial TrustBar + ProcessSteps

**Files:**
- Modify: `kastasarimi/components/TrustBar.tsx`
- Modify: `kastasarimi/components/ProcessSteps.tsx`

- [ ] **Step 1: Replace `components/TrustBar.tsx`** with:

```tsx
import { trust } from "@/lib/copy";

export function TrustBar() {
  return (
    <div className="grid grid-cols-2 border-y border-line sm:grid-cols-4 sm:divide-x sm:divide-line">
      {trust.items.map((it) => (
        <div key={it.label} className="px-4 py-7 text-center">
          <p className="font-display text-[clamp(28px,3.4vw,40px)] font-medium leading-none text-ink">
            {it.stat}
          </p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-muted">{it.label}</p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Replace `components/ProcessSteps.tsx`** with:

```tsx
export function ProcessSteps({ steps }: { steps: { title: string; text: string }[] }) {
  return (
    <ol className="mt-10 border-t border-line">
      {steps.map((s, i) => (
        <li
          key={i}
          className="grid grid-cols-[auto_1fr] gap-x-6 border-b border-line py-7 sm:grid-cols-[80px_1fr]"
        >
          <span className="font-display text-[clamp(28px,4vw,44px)] leading-none text-accent">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <h3 className="font-display text-[20px] font-medium text-ink">{s.title}</h3>
            <p className="mt-2 max-w-[560px] text-[15px] leading-relaxed text-muted2">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
```

Note: this renders its own numerals, so Task 8 strips the leading `"1. "` from `process.steps[].title` in `copy.ts`.

- [ ] **Step 3: Build** — `cd kastasarimi && npm run build` → succeeds.

- [ ] **Step 4: Commit**

```bash
cd kastasarimi && git add components/TrustBar.tsx components/ProcessSteps.tsx
git commit -m "feat(kas-tasarimi): editorial trust stats + numbered process list"
```

---

### Task 6: Editorial PricingTable + Reviews

**Files:**
- Modify: `kastasarimi/components/PricingTable.tsx`
- Modify: `kastasarimi/components/Reviews.tsx`

**Interfaces:**
- PricingTable stays a real `<table>` (machine-extractable — SEO constraint). Reviews drops the star row (no rating schema depends on it) in favor of pull-quotes.

- [ ] **Step 1: Replace `components/PricingTable.tsx`** with:

```tsx
// Pricing table — machine-extractable (real <table>) for AI answer engines.
export function PricingTable({
  rows,
}: {
  rows: { name: string; detail: string; price: string }[];
}) {
  return (
    <div className="mt-10 overflow-x-auto border-t border-ink/80">
      <table className="w-full border-collapse text-left text-[15px]">
        <thead>
          <tr className="border-b border-line text-[11px] uppercase tracking-[0.14em] text-muted">
            <th className="py-4 pr-4 font-medium">Hizmet</th>
            <th className="py-4 pr-4 font-medium">Kapsam</th>
            <th className="py-4 font-medium">Fiyat aralığı</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line">
              <td className="py-5 pr-4 font-display text-[18px] text-ink">{r.name}</td>
              <td className="py-5 pr-4 text-muted2">{r.detail}</td>
              <td className="whitespace-nowrap py-5 font-display text-[18px] text-accent-dark">
                {r.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Replace `components/Reviews.tsx`** with:

```tsx
import { reviews } from "@/lib/copy";

export function Reviews() {
  return (
    <div className="mt-10 grid gap-px bg-line md:grid-cols-3">
      {reviews.items.map((r) => (
        <figure key={r.name} className="bg-cream p-8">
          <blockquote className="pull-quote">“{r.text}”</blockquote>
          <figcaption className="mt-6 text-[11px] uppercase tracking-[0.16em] text-muted">
            {r.name}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
```
(`StarIcon` import removed — no longer used.)

- [ ] **Step 3: Build** — `cd kastasarimi && npm run build` → succeeds (confirms no dangling `StarIcon` import elsewhere).

- [ ] **Step 4: Commit**

```bash
cd kastasarimi && git add components/PricingTable.tsx components/Reviews.tsx
git commit -m "feat(kas-tasarimi): hairline pricing table + pull-quote reviews"
```

---

### Task 7: Editorial CTA + Footer

**Files:**
- Modify: `kastasarimi/components/CTA.tsx`
- Modify: `kastasarimi/components/Footer.tsx`

- [ ] **Step 1: Replace `components/CTA.tsx`** with:

```tsx
import { phoneHref, type Settings } from "@/lib/content";
import { WhatsAppIcon, PhoneIcon } from "@/components/Icons";

// Reused call-to-action row: one filled WhatsApp button + a phone text link.
// `variant` toggles colors for light sections vs the dark banner.
export function CTAButtons({
  settings,
  variant = "light",
}: {
  settings: Settings;
  variant?: "light" | "dark";
}) {
  const wa =
    variant === "dark"
      ? "bg-cream text-ink hover:bg-pink"
      : "bg-accent text-white hover:bg-accent-dark";
  const call =
    variant === "dark" ? "text-cream/90 hover:text-cream" : "text-ink hover:text-accent-dark";
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
      <a
        href={settings.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2.5 px-7 py-[15px] text-[12px] uppercase tracking-[0.12em] transition ${wa}`}
      >
        <WhatsAppIcon className="h-[18px] w-[18px]" /> WhatsApp'tan Randevu
      </a>
      <a
        href={phoneHref(settings.phone)}
        className={`inline-flex items-center gap-2 border-b border-current pb-1 text-[14px] transition ${call}`}
      >
        <PhoneIcon className="h-[16px] w-[16px]" /> {settings.phone_local}
      </a>
    </div>
  );
}

// Full-width dark CTA banner used near the bottom of pages.
export function CTABanner({ settings }: { settings: Settings }) {
  return (
    <section className="py-4">
      <div className="mx-auto max-w-[1180px] px-5">
        <div className="bg-ink px-6 py-16 text-center sm:px-12">
          <h2 className="mx-auto max-w-[620px] font-display text-[clamp(26px,4vw,42px)] leading-[1.1] text-cream">
            Ankara'da doğal kaşlar için ücretsiz ön görüşme
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-[15px] text-cream/70">
            Uygunluğunuzu değerlendirelim, kaş tasarımınızı birlikte planlayalım. Randevu ücretsizdir.
          </p>
          <div className="mt-8 flex justify-center">
            <CTAButtons settings={settings} variant="dark" />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Restyle footer labels in `components/Footer.tsx`.** Change the three section-label lines (currently `text-accent`) to muted tracked caps. Replace each occurrence of:
```tsx
className="mb-3 text-[11px] uppercase tracking-[0.16em] text-accent"
```
with:
```tsx
className="mb-3 text-[11px] uppercase tracking-[0.18em] text-muted"
```
(3 occurrences: lines 33, 45, 59.) The cognac wordmark accent span (line 13) stays.

- [ ] **Step 3: Build** — `cd kastasarimi && npm run build` → succeeds.

- [ ] **Step 4: Commit**

```bash
cd kastasarimi && git add components/CTA.tsx components/Footer.tsx
git commit -m "feat(kas-tasarimi): editorial CTA buttons/banner + footer labels"
```

---

### Task 8: Recolor BrowFlourish (ink + cognac)

**Files:**
- Modify: `kastasarimi/components/BrowFlourish.tsx`

- [ ] **Step 1: Change the palette consts** (lines 5–7) from rose to ink/cognac:

```tsx
const ROSE = "#8a6a4f"; // cognac accent
const ROSE_DEEP = "#171412"; // ink
const ROSE_LIGHT = "#b79a7e"; // muted tan
```
(Const names kept to minimize diff; only values change.)

- [ ] **Step 2: Update the glow gradient stop color** (lines 38–39) from `#f6dde5` to warm paper. Replace both `stopColor="#f6dde5"` occurrences with `stopColor="#efe7da"`.

- [ ] **Step 3: Build** — `cd kastasarimi && npm run build` → succeeds.

- [ ] **Step 4: Commit**

```bash
cd kastasarimi && git add components/BrowFlourish.tsx
git commit -m "feat(kas-tasarimi): recolor brow flourish to ink + cognac"
```

---

### Task 9: Editorial copy voice pass (SEO-preserving)

**Files:**
- Modify: `kastasarimi/lib/copy.ts`

**Interfaces:**
- Consumes: nothing. Produces: same exported shape (`hero, whatIs, benefits, process, pricing, trust, reviews, about, faqFallback, LAST_UPDATED`) — no key renames, no type changes. Only string values change; process step titles lose the leading `"N. "` (numerals now come from `ProcessSteps`).

- [ ] **Step 1: Apply these exact edits in `lib/copy.ts`** (keep every other line, including the file header comment):

`hero` (lines 11–18):
```tsx
export const hero = {
  eyebrow: "Ankara · Çankaya · Stria Studio",
  title: "Kaş Tasarımı Ankara",
  subtitle:
    "Yüz hatlarınıza göre çizilen, kıl tekniğiyle tek tek işlenen kalıcı kaşlar. Altın oran ölçümü, steril uygulama, 12–18 ay kalıcılık.",
  primaryCta: "WhatsApp'tan Randevu Al",
  secondaryCta: "Fiyatları Gör",
};
```
(H1 keyword preserved; subtitle tightened, keywords "kıl tekniği / altın oran / kalıcı" kept.)

`benefits.intro` (lines 29–30):
```tsx
  intro:
    "Kaşları seyrek, açık renkli, asimetrik veya şekilsiz olan; makyajsız da dolgun, bakımlı kaş isteyen herkes için.",
```

`process.steps` titles — strip the leading `"N. "` (numerals now rendered by the component). Replace the four `title:` lines (57, 61, 65, 69) with:
```tsx
      title: "Ücretsiz ön görüşme ve analiz",
```
```tsx
      title: "Tasarım ve altın oran ölçümü",
```
```tsx
      title: "Kıl kıl uygulama",
```
```tsx
      title: "Rötuş seansı (4–6 hafta sonra)",
```
(Keep each step's `text` verbatim — the "~90 dk" / "4–6 hafta" facts stay.)

Leave `whatIs`, `pricing`, `trust`, `reviews`, `about`, `faqFallback`, `LAST_UPDATED` UNCHANGED — these carry the answer-first facts, keywords, pricing (mirrored in llms.txt), and question-form FAQ headings. (`reviews.items` text unchanged; pull-quote styling in Task 6 handles presentation.)

- [ ] **Step 2: Guardrail grep — SEO substance intact**

```bash
cd kastasarimi
grep -c "Kaş Tasarımı Ankara" lib/copy.ts          # >=1 (H1 keyword)
grep -c "nedir?\|nasıl yapılır\|fiyatları" lib/copy.ts   # >=3 (question headings)
grep -c "4.500\|6.500\|altın oran\|kıl tekniği\|12–18 ay" lib/copy.ts  # facts/keywords present
```
Expected: all counts ≥ their stated minimums (facts/keywords line ≥1).

- [ ] **Step 3: Build** — `cd kastasarimi && npm run build` → succeeds.

- [ ] **Step 4: Commit**

```bash
cd kastasarimi && git add lib/copy.ts
git commit -m "feat(kas-tasarimi): editorial copy voice (SEO facts/keywords preserved)"
```

---

### Task 10: Secondary surfaces & sub-pages — sharp corners / no shadow pass

Mechanical consistency pass so sub-pages and remaining components match the editorial system (sharp corners, no shadows). Card radii are hardcoded per-file, so each is edited directly.

**Files (all under `kastasarimi/`):**
- Modify: `components/ContactForm.tsx`, `components/BlogList.tsx`, `components/Faq.tsx`, `components/Gallery.tsx`, `components/StudioMap.tsx`
- Modify: `app/page.tsx` (any stray card radius — the hero card was already removed in Task 4; verify none remain), `app/hakkimizda/page.tsx`, `app/api-docs/page.tsx`, `app/blog/[slug]/page.tsx`

**Rule (apply to card/surface classes only):**
- `rounded-[16px]` and `rounded-[28px]` and `rounded-2xl`/`rounded-xl`/`rounded-lg` → `rounded-[2px]`
- Remove any `shadow-*` utility.
- Leave `rounded-full` on genuinely circular/pill controls (WhatsAppFab, Nav mobile toggle, blog pagination) — converting those is diminishing returns.
- Do NOT change colors (tokens already handle that) or `bg-*`/layout.

<!-- ponytail: mechanical radius sweep, ceiling = only the enumerated card surfaces; deeper per-page editorial restructure only if a page still reads "boxy" in the Task 11 visual check. -->

- [ ] **Step 1: Apply the rule.** Exact occurrences (from repo scan):
  - `components/ContactForm.tsx`: line 9 `rounded-[16px]`, line 42 `rounded-[16px]`, line 76 `rounded-[16px]` → `rounded-[2px]`.
  - `components/BlogList.tsx`: line 22 `rounded-[16px]`, line 30 `rounded-[16px]` → `rounded-[2px]`.
  - `components/Faq.tsx`: line 6 `rounded-[16px]` → `rounded-[2px]`.
  - `components/Gallery.tsx`: line 20 `rounded-[16px]` → `rounded-[2px]`.
  - `components/StudioMap.tsx`: line 10 `rounded-[16px]` → `rounded-[2px]`.
  - `app/hakkimizda/page.tsx`: line 32 `rounded-[16px]` → `rounded-[2px]`.
  - `app/api-docs/page.tsx`: lines 114, 117, 122, 130, 137 `rounded-[16px]` → `rounded-[2px]`.
  - `app/blog/[slug]/page.tsx`: line 77 `rounded-[16px]` → `rounded-[2px]`.

- [ ] **Step 2: Verify no card radius or shadow remnants** (excluding `rounded-full` controls):

```bash
cd kastasarimi
grep -rn "rounded-\[16px\]\|rounded-\[28px\]\|rounded-2xl\|rounded-xl\|rounded-lg\|shadow-\[" app components --include='*.tsx'
```
Expected: no output (empty).

- [ ] **Step 3: Build** — `cd kastasarimi && npm run build` → succeeds.

- [ ] **Step 4: Commit**

```bash
cd kastasarimi && git add app components
git commit -m "feat(kas-tasarimi): sharp editorial corners across secondary surfaces"
```

---

### Task 11: Final verification (build + lint + browser + guardrails)

**Files:** none (verification only).

- [ ] **Step 1: Full build + lint**

```bash
cd kastasarimi && npm run build && npm run lint
```
Expected: build succeeds; lint clean (or only pre-existing warnings unrelated to this change).

- [ ] **Step 2: No rose-gold / old-palette remnants anywhere**

```bash
cd kastasarimi
grep -rniE "#b76e79|#98505f|#cb9aa8|#ecd7df|#efe1e9|#3a2432|#f7f0f3|rose-gold|rgba\(152, ?80, ?95|cormorant" app components lib
```
Expected: no output. (Old rose hexes, old ink/cream, the rose shadow rgba, and Cormorant references all gone.)

- [ ] **Step 3: SEO guardrails still hold**

```bash
cd kastasarimi
grep -q "Kaş Tasarımı Ankara" lib/copy.ts && echo "H1 keyword OK"
curl -s localhost:3002/llms.txt | grep -qi "4.500" && echo "llms.txt pricing OK"   # after dev server starts (next step)
```

- [ ] **Step 4: Visual check in browser.** Start dev server and view every route.

```bash
cd kastasarimi && npm run dev   # serves :3002
```
Then load and eyeball: `/`, `/kas-tasarimi-fiyatlari`, `/kas-tasarimi-nasil-yapilir`, `/galeri`, `/blog`, `/blog/<any-slug>`, `/sss`, `/hakkimizda`, `/iletisim`, `/api-docs`.
Confirm on each: cognac/paper palette, Fraunces headings, numbered home sections, ruled lists (no filled rounded cards / no shadows), editorial nav text CTA, hero plate with `Fig. 01` caption. Re-run the `llms.txt` check from Step 3 now that :3002 is up.

- [ ] **Step 5: Update the wiki decision note.** Append to `wiki/decisions/2026-07-09-microsite-architecture.md` status line (or add a one-line log entry in `wiki/log.md`) that `kastasarimi` now uses the "Atelier" editorial design system (ref this plan). Commit:

```bash
cd /Applications/MAMP/htdocs/stria_studio
git add wiki/
git commit -m "docs(wiki): note kastasarimi Atelier editorial design system"
```

- [ ] **Step 6 (optional): drop the WIP stash** once the redesign is confirmed good, since it's superseded:

```bash
cd kastasarimi && git stash list
# if the only entry is the rose-gold WIP and you're happy with Atelier:
# git stash drop stash@{0}
```
Leave the stash in place if unsure — it's harmless.

---

## Self-Review

**Spec coverage:** palette remap → Task 1; Fraunces → Task 1; editorial utilities → Task 1; Section numerals → Task 2; Nav → Task 3; hero + numbered sections + ruled benefits → Task 4; TrustBar/ProcessSteps → Task 5; PricingTable/Reviews → Task 6; CTA/Footer → Task 7; BrowFlourish → Task 8; copy voice + SEO guardrails → Task 9; sub-pages/secondary sharp-corner pass → Task 10; verification (build/lint/browser/guardrails/no-remnants/wiki) → Task 11. Stash-WIP risk → Task 1 Step 1 + Task 11 Step 6. All spec sections covered.

**Placeholder scan:** every code step shows complete code or exact class-swap tokens; grep/build/commit commands are literal. No TBD/TODO.

**Type consistency:** `Section` gains `index?: string` (Task 2) consumed in Task 4; `CTAButtons`/`CTABanner`/`TrustBar`/`ProcessSteps`/`PricingTable`/`Reviews`/`BrowFlourish` keep their existing signatures (value-only changes). `copy.ts` exports keep identical shape — no consumer breaks. `StarIcon` import removed in Task 6 with a build check.
