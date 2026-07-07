# Stria Studio SEO Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Content-writing steps additionally use the `copywriting` and `ai-seo` skills.

**Goal:** Make Stria Studio rank in Google and AI search for every service group by turning the single-page site into a TR-first, server-rendered, multi-page site with per-service pages, structured data, sitemap/robots, and AI-extractable content.

**Architecture:** TR is the SEO target (Ankara locals search in Turkish); EN stays a cosmetic client toggle, not indexed. Each of the 7 services gets its own indexable page under `/hizmetler/<slug>` (rendered from a single dynamic route + a data file), plus a `/hizmetler` hub. TR content is server-rendered so it lands in the HTML. Structured data (BeautySalon, Service, FAQPage, BreadcrumbList) + `sitemap.ts`/`robots.ts` + per-page metadata make it crawlable and rich-result-eligible. `llms.txt` + FAQ content make it AI-citable.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind v4, next/font, native App Router `metadata`/`sitemap`/`robots` APIs. No new dependencies.

## Global Constraints
- **No new npm dependencies.** Use native Next.js App Router APIs only.
- **TR is canonical/indexed. EN is client-only and never indexed** (no `/en` routes, no hreflang).
- **Canonical base URL** from `site.siteUrl` (placeholder `https://striastudio.com` — owner replaces). All canonical/OG/sitemap URLs derive from it.
- **NAP is placeholder** (`site.ts` / `i18n.ts`) — schema must read from one source so the owner edits once.
- **Service slugs (fixed, TR, keyword-friendly):** `microblading`, `kas-pudralama`, `eyeliner`, `dipliner`, `dudak-renklendirme`, `kas-laminasyon`, `kirpik-lifting`.
- Every service page: unique `<title>` (≤60 chars), meta description (≤160), self-referencing canonical, one `<h1>` with the service + "Ankara", primary keyword in first 100 words, FAQ (≥3 Q/A), `Service` + `FAQPage` + `BreadcrumbList` JSON-LD.
- Verification per page = `npm run build` passes + `curl` of the rendered route contains the expected `<title>`, `rel="canonical"`, and `application/ld+json`. (JSON-LD is server-rendered here, so curl CAN see it.)
- Copy follows the `copywriting` + `ai-seo` skills: no AI-tell phrases (see seo-audit/references/ai-writing-detection.md), answer-first paragraphs, concrete specifics.

---

## File Structure

```
frontend/
  lib/
    site.ts                 MODIFY  add siteUrl, geo, NAP, GBP, hours (schema source of truth)
    services.ts             CREATE  service SEO data: slug, seo{title,desc,keywords}, intro, benefits[], process[], aftercare, faq[{q,a}], related[]
    seo.ts                  CREATE  helpers: absUrl(path), buildMetadata(...)
  components/
    JsonLd.tsx              CREATE  <JsonLd data={...}/> — renders <script type="application/ld+json">
    schema.ts               CREATE  builders: beautySalonSchema(), serviceSchema(svc), faqSchema(faq), breadcrumbSchema(items)
    Breadcrumbs.tsx         CREATE  visual breadcrumb trail (server component)
    ServicePage.tsx         CREATE  presentational service-page body (server component, TR)
    Nav.tsx / NavServices   MODIFY  service links → /hizmetler/<slug>
    Footer.tsx              MODIFY  service links → /hizmetler/<slug>
    Services.tsx            MODIFY  home cards link → /hizmetler/<slug>
  app/
    layout.tsx              MODIFY  metadataBase, default OG/twitter, site-wide BeautySalon JSON-LD
    page.tsx                MODIFY  home metadata + home FAQ + FAQPage schema
    sitemap.ts              CREATE  home + /hizmetler + 7 service URLs
    robots.ts               CREATE  allow all + sitemap ref
    hizmetler/
      page.tsx              CREATE  hub: lists 7 services, metadata, breadcrumb schema
      [slug]/page.tsx       CREATE  dynamic service page: generateStaticParams, generateMetadata, renders ServicePage + all schema
  public/
    llms.txt                CREATE  AI-crawler summary (business, services, NAP, key URLs)
    images/hero.webp        CREATE  optimized hero (from hero.png)
```

---

## Task 1: Site config + service SEO data (content backbone)

**Files:**
- Modify: `frontend/lib/site.ts`
- Create: `frontend/lib/services.ts`
- Create: `frontend/lib/seo.ts`

**Interfaces:**
- Produces: `site.siteUrl`, `site.geo`, `site.nap`, `site.hours`, `site.gbpUrl`
- Produces: `SERVICE_SEO: ServiceSeo[]` where `ServiceSeo = { slug: string; seoTitle: string; seoDesc: string; keywords: string[]; intro: string; benefits: string[]; process: string[]; aftercare: string; faq: {q:string;a:string}[]; related: string[] }` (all TR).
- Produces `SERVICE_SEO_BY_SLUG: Record<string, ServiceSeo>` and helper `getServiceSeo(slug)`.
- Produces `absUrl(path: string): string`, `buildMetadata({title, description, path, images?}): Metadata`.
- Consumes: existing `SERVICES` in `lib/i18n.ts` (matched to SEO data by slug, in fixed order).

- [ ] **Step 1: Extend `site.ts`** — add SEO/NAP fields the schema and metadata read from:

```ts
export const site = {
  // ...existing phone/wa/ig/address/apiUrl...
  siteUrl: "https://striastudio.com", // owner: set real domain
  gbpUrl: "", // owner: paste Google Business Profile URL when available
  nap: {
    name: "Stria Studio",
    streetAddress: "[Mahalle] Cd. No: 00", // owner: real address
    locality: "Çankaya",
    region: "Ankara",
    postalCode: "06000", // owner: real code
    country: "TR",
  },
  geo: { lat: 39.9208, lng: 32.8541 }, // owner: exact studio coords (Ankara center placeholder)
  hours: [
    { days: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], open: "10:00", close: "19:00" },
  ],
} as const;
```

- [ ] **Step 2: Create `lib/seo.ts`**:

```ts
import type { Metadata } from "next";
import { site } from "@/lib/site";

export function absUrl(path: string): string {
  return new URL(path, site.siteUrl).toString();
}

export function buildMetadata(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const url = absUrl(opts.path);
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: "Stria Studio",
      locale: "tr_TR",
      type: "website",
      images: [{ url: absUrl(opts.image ?? "/images/hero.png") }],
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description },
  };
}
```

- [ ] **Step 3: Create `lib/services.ts`** — TR SEO content for all 7 services. Write with the `copywriting` + `ai-seo` skills (answer-first, keyword in first sentence, concrete, no AI-tells). Full worked example for `microblading` below; author the remaining 6 (`kas-pudralama`, `eyeliner`, `dipliner`, `dudak-renklendirme`, `kas-laminasyon`, `kirpik-lifting`) to the same shape:

```ts
export type ServiceSeo = {
  slug: string;
  seoTitle: string;   // ≤60 chars, e.g. "Microblading Ankara | Stria Studio"
  seoDesc: string;    // ≤160 chars, keyword + value + location
  keywords: string[];
  intro: string;      // ~2-3 sentences, keyword in first sentence
  benefits: string[];
  process: string[];  // steps of the treatment
  aftercare: string;
  faq: { q: string; a: string }[]; // ≥3
  related: string[];  // other slugs
};

export const SERVICE_SEO: ServiceSeo[] = [
  {
    slug: "microblading",
    seoTitle: "Microblading Ankara | Stria Studio",
    seoDesc: "Ankara Çankaya'da microblading: kıl tekniğiyle doğal, kalıcı kaşlar. Steril ekipman, yüze özel tasarım. WhatsApp'tan randevu al.",
    keywords: ["microblading ankara", "ankara microblading", "kıl tekniği kaş", "kalıcı kaş ankara", "çankaya microblading"],
    intro: "Microblading, Ankara Çankaya'daki Stria Studio'da kıl tekniğiyle uygulanan yarı kalıcı bir kaş işlemidir. Her kıl tek tek çizilir; sonuç gerçek kaştan ayırt edilemeyecek kadar doğaldır ve 12–18 ay kalıcıdır.",
    benefits: [
      "Gerçekçi kıl görünümü — makyajsız da dolgun kaş",
      "Yüz simetrisine göre birebir tasarım ve ölçüm",
      "Steril, tek kullanımlık iğne ve kaliteli pigment",
      "12–18 ay kalıcılık, ücretsiz rötuş kontrolü",
    ],
    process: [
      "Ücretsiz ön görüşme ve yüz analizi",
      "Kaş tasarımı ve renk seçimi (onayınızla)",
      "Anestezik krem sonrası kıl kıl uygulama (~90 dk)",
      "4–6 hafta sonra rötuş seansı",
    ],
    aftercare: "İlk 7–10 gün kaşları ıslatmaktan, terlemekten ve güneşten kaçının; verilen bakım kremini uygulayın. Kabuklar kendiliğinden dökülür.",
    faq: [
      { q: "Microblading Ankara'da ne kadar kalıcı?", a: "Cilt tipine bağlı olarak 12–18 ay kalıcıdır. Yıllık rötuşla görünüm korunur." },
      { q: "İşlem acıtır mı?", a: "Uygulama öncesi anestezik krem sürülür; çoğu kişi yalnızca hafif bir kaşınma hisseder." },
      { q: "Kimler microblading yaptıramaz?", a: "Hamileler, emzirenler, kan sulandırıcı kullananlar ve bazı cilt hastalığı olanlar uygun değildir; ön görüşmede değerlendirilir." },
    ],
    related: ["kas-pudralama", "kas-laminasyon"],
  },
  // TODO(execution): author kas-pudralama, eyeliner, dipliner, dudak-renklendirme,
  // kas-laminasyon, kirpik-lifting with the same shape using the copywriting + ai-seo skills.
];

export const SERVICE_SEO_BY_SLUG: Record<string, ServiceSeo> =
  Object.fromEntries(SERVICE_SEO.map((s) => [s.slug, s]));

export function getServiceSeo(slug: string): ServiceSeo | undefined {
  return SERVICE_SEO_BY_SLUG[slug];
}
```

- [ ] **Step 4: Link SEO data to display data** — add matching `slug` to each entry in `SERVICES` (`lib/i18n.ts`) in the fixed order above, so a service page can pull both its visual (`SERVICES`) and SEO (`SERVICE_SEO`) records by slug.

- [ ] **Step 5: Verify build**

Run: `cd frontend && npx tsc --noEmit`
Expected: no type errors. (`SERVICE_SEO` may have 1 entry until content authored — that's fine.)

- [ ] **Step 6: Commit**

```bash
git add frontend/lib/site.ts frontend/lib/services.ts frontend/lib/seo.ts frontend/lib/i18n.ts
git commit -m "feat(seo): site config + service SEO data model"
```

---

## Task 2: robots.ts + sitemap.ts

**Files:**
- Create: `frontend/app/robots.ts`
- Create: `frontend/app/sitemap.ts`

**Interfaces:**
- Consumes: `absUrl`, `SERVICE_SEO` (slugs).

- [ ] **Step 1: `app/robots.ts`**

```ts
import type { MetadataRoute } from "next";
import { absUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absUrl("/sitemap.xml"),
  };
}
```

- [ ] **Step 2: `app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { absUrl } from "@/lib/seo";
import { SERVICE_SEO } from "@/lib/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: absUrl("/"), lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: absUrl("/hizmetler"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ...SERVICE_SEO.map((s) => ({
      url: absUrl(`/hizmetler/${s.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
```

- [ ] **Step 3: Verify** — `npm run build` then `curl -s localhost:3001/robots.txt` shows the sitemap line; `curl -s localhost:3001/sitemap.xml` lists the home + hizmetler URLs. Expected: both non-empty, URLs use `site.siteUrl`.

- [ ] **Step 4: Commit** — `git commit -am "feat(seo): robots + sitemap"`

---

## Task 3: Root + home metadata

**Files:**
- Modify: `frontend/app/layout.tsx`, `frontend/app/page.tsx`

**Interfaces:** Consumes `site.siteUrl`, `buildMetadata`.

- [ ] **Step 1: layout.tsx** — add `metadataBase` and default OG so every page inherits sane social/canonical defaults:

```ts
export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: {
    default: "Stria Studio · Kalıcı Makyaj & Güzellik Stüdyosu · Ankara",
    template: "%s · Stria Studio",
  },
  description: "Ankara Çankaya'da microblading, kalıcı makyaj ve kaş–kirpik bakımı. Doğal, steril ve tamamen size özel.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "tr_TR", siteName: "Stria Studio" },
};
```

- [ ] **Step 2: page.tsx (home)** — export `metadata` for `/` via `buildMetadata({ title: "...", description: "...", path: "/" })` (title without template suffix duplication — use a plain string for home).

- [ ] **Step 3: Verify** — `curl -s localhost:3001/ | grep -E 'rel="canonical"|og:title'` shows canonical=siteUrl and og:title. `npm run build` passes.

- [ ] **Step 4: Commit** — `git commit -am "feat(seo): metadataBase, canonical, OpenGraph defaults + home meta"`

---

## Task 4: Site-wide BeautySalon (LocalBusiness) JSON-LD

**Files:**
- Create: `frontend/components/JsonLd.tsx`, `frontend/components/schema.ts`
- Modify: `frontend/app/layout.tsx`

**Interfaces:**
- Produces: `<JsonLd data={obj}/>`; `beautySalonSchema()`, `serviceSchema()`, `faqSchema()`, `breadcrumbSchema()`.
- Consumes: `site.nap/geo/hours/siteUrl/phone/ig`.

- [ ] **Step 1: `components/JsonLd.tsx`**

```tsx
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

- [ ] **Step 2: `components/schema.ts` — `beautySalonSchema()`**

```ts
import { site } from "@/lib/site";
import { absUrl } from "@/lib/seo";

export function beautySalonSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": absUrl("/#business"),
    name: site.nap.name,
    url: site.siteUrl,
    telephone: site.phoneHref.replace("tel:", ""),
    image: absUrl("/images/hero.png"),
    address: {
      "@type": "PostalAddress",
      streetAddress: site.nap.streetAddress,
      addressLocality: site.nap.locality,
      addressRegion: site.nap.region,
      postalCode: site.nap.postalCode,
      addressCountry: site.nap.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    openingHoursSpecification: site.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.open,
      closes: h.close,
    })),
    sameAs: [site.ig, site.gbpUrl].filter(Boolean),
    priceRange: "₺₺",
  };
}
```

- [ ] **Step 3: layout.tsx** — render `<JsonLd data={beautySalonSchema()} />` inside `<body>` (before children).

- [ ] **Step 4: Verify** — `curl -s localhost:3001/ | grep -c 'application/ld+json'` ≥ 1; paste rendered JSON into https://search.google.com/test/rich-results — 0 errors for BeautySalon. `npm run build` passes.

- [ ] **Step 5: Commit** — `git commit -am "feat(seo): BeautySalon LocalBusiness JSON-LD"`

---

## Task 5: Service / FAQ / Breadcrumb schema builders

**Files:** Modify `frontend/components/schema.ts`

**Interfaces:** Produces `serviceSchema(svc, displayName)`, `faqSchema(faq)`, `breadcrumbSchema(items:{name,path}[])`.

- [ ] **Step 1: builders**

```ts
import type { ServiceSeo } from "@/lib/services";

export function serviceSchema(svc: ServiceSeo, name: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    serviceType: name,
    description: svc.intro,
    url: absUrl(`/hizmetler/${svc.slug}`),
    provider: { "@id": absUrl("/#business") },
    areaServed: { "@type": "City", name: "Ankara" },
  };
}

export function faqSchema(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absUrl(it.path),
    })),
  };
}
```

- [ ] **Step 2: Verify** — `npx tsc --noEmit` passes.
- [ ] **Step 3: Commit** — `git commit -am "feat(seo): Service/FAQ/Breadcrumb schema builders"`

---

## Task 6: /hizmetler hub page

**Files:** Create `frontend/app/hizmetler/page.tsx`, `frontend/components/Breadcrumbs.tsx`

**Interfaces:** Consumes `SERVICES`, `SERVICE_SEO`, `buildMetadata`, `breadcrumbSchema`, `JsonLd`.

- [ ] **Step 1: `Breadcrumbs.tsx`** (visual trail, server component)

```tsx
import Link from "next/link";
export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <nav aria-label="breadcrumb" className="mx-auto max-w-[1160px] px-[clamp(18px,5vw,56px)] pt-[120px] text-[12px] text-muted">
      {items.map((it, i) => (
        <span key={it.path}>
          {i > 0 && <span className="mx-2 opacity-50">/</span>}
          {i < items.length - 1 ? <Link href={it.path} className="hover:text-accent">{it.name}</Link> : <span className="text-ink">{it.name}</span>}
        </span>
      ))}
    </nav>
  );
}
```

- [ ] **Step 2: `app/hizmetler/page.tsx`** — server component: `<Nav/>`, breadcrumbs (Ana Sayfa / Hizmetler), H1 "Ankara Kalıcı Makyaj Hizmetleri", intro paragraph (keyword-rich), a grid of the 7 services each linking to `/hizmetler/<slug>` (reuse card markup, TR names), `<Footer/>`. Export `metadata = buildMetadata({title:"Hizmetler | Kalıcı Makyaj Ankara", description:"...", path:"/hizmetler"})`. Render `<JsonLd data={breadcrumbSchema([...])}/>`.

- [ ] **Step 3: Verify** — `curl -s localhost:3001/hizmetler | grep -E '<h1|/hizmetler/microblading|application/ld\+json'` all present. `npm run build` lists `/hizmetler` as a route.

- [ ] **Step 4: Commit** — `git commit -am "feat(seo): /hizmetler hub page + breadcrumbs"`

---

## Task 7: /hizmetler/[slug] dynamic service page

**Files:** Create `frontend/app/hizmetler/[slug]/page.tsx`, `frontend/components/ServicePage.tsx`

**Interfaces:** Consumes everything from Tasks 1,4,5,6. Produces the indexable service pages.

- [ ] **Step 1: `ServicePage.tsx`** — server component rendering TR: `<h1>{name} Ankara</h1>`, `intro` (first 100 words contain the keyword), benefits list, process (ordered list), aftercare, an FAQ `<section>` (visible `<details>` or headed Q/A), CTA row (WhatsApp/phone from `site`), and a "İlgili hizmetler" block linking `related` slugs. Uses the service image from `SERVICES`.

- [ ] **Step 2: `app/hizmetler/[slug]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { SERVICE_SEO, getServiceSeo } from "@/lib/services";
import { SERVICES } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { serviceSchema, faqSchema, breadcrumbSchema } from "@/components/schema";
// ...Nav, Breadcrumbs, ServicePage, Footer

export function generateStaticParams() {
  return SERVICE_SEO.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const svc = getServiceSeo(params.slug);
  if (!svc) return {};
  return buildMetadata({ title: svc.seoTitle, description: svc.seoDesc, path: `/hizmetler/${svc.slug}` });
}

export default function Page({ params }: { params: { slug: string } }) {
  const svc = getServiceSeo(params.slug);
  const display = SERVICES.find((s) => s.slug === params.slug);
  if (!svc || !display) notFound();
  const name = display.name.tr;
  const crumbs = [
    { name: "Ana Sayfa", path: "/" },
    { name: "Hizmetler", path: "/hizmetler" },
    { name, path: `/hizmetler/${svc.slug}` },
  ];
  return (
    <>
      <Nav />
      <JsonLd data={serviceSchema(svc, name)} />
      <JsonLd data={faqSchema(svc.faq)} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <ServicePage svc={svc} display={display} />
      <Footer />
    </>
  );
}
```

> Note (Next 16): if `params` is typed as a Promise in this version, `await` it in both functions. Confirm against the generated route types during build.

- [ ] **Step 3: Verify each service** — for slug `microblading`:

```bash
npm run build   # expect 7 static /hizmetler/[slug] pages generated
curl -s localhost:3001/hizmetler/microblading > /tmp/p.html
grep -c 'application/ld+json' /tmp/p.html   # expect 3 (Service, FAQ, Breadcrumb)
grep -oE '<title>[^<]+' /tmp/p.html          # expect "Microblading Ankara..."
grep -c 'rel="canonical"' /tmp/p.html        # expect 1
```
Then validate one page in Rich Results Test → Service + FAQ detected, 0 errors.

- [ ] **Step 4: Commit** — `git commit -am "feat(seo): dynamic /hizmetler/[slug] service pages + schema"`

---

## Task 8: Internal linking (nav, footer, home cards, related)

**Files:** Modify `frontend/components/NavServices.tsx`, `Footer.tsx`, `Services.tsx`

**Interfaces:** Consumes service `slug` on `SERVICES`.

- [ ] **Step 1** — NavServices dropdown: each service `href` → `/hizmetler/<slug>` (was `#services`); "Tüm hizmetler" link → `/hizmetler`. Featured service links to `/hizmetler/microblading`.
- [ ] **Step 2** — Footer services column: each → `/hizmetler/<slug>`; heading links to `/hizmetler`.
- [ ] **Step 3** — Home `Services.tsx` cards: the `→` link and card → `/hizmetler/<slug>` (keep WhatsApp CTA separate).
- [ ] **Step 4: Verify** — `curl -s localhost:3001/ | grep -oE '/hizmetler/[a-z-]+' | sort -u` lists all 7 slugs. `npm run build` passes, no broken links.
- [ ] **Step 5: Commit** — `git commit -am "feat(seo): internal linking to service pages"`

---

## Task 9: Hero/image performance (Core Web Vitals)

**Files:** Modify `frontend/components/Hero.tsx`, `ImageSlot.tsx`; add `frontend/public/images/hero.webp`

- [ ] **Step 1** — Convert hero to WebP: `cd frontend/public/images && sips -s format webp hero.png --out hero.webp` (macOS) or `cwebp`. Point hero `IMG.hero` usage at `.webp` (keep png as OG fallback via metadata).
- [ ] **Step 2** — Hero `ImageSlot`: pass `priority` (add optional `priority` prop to `ImageSlot`, set on the hero only) so LCP image preloads; keep `sizes`.
- [ ] **Step 3: Verify** — `npm run build`; `curl -s localhost:3001/ | grep -E 'rel="preload".*image|hero.webp'` (Next injects preload for priority image). Optionally PageSpeed Insights on the deployed URL: LCP < 2.5s.
- [ ] **Step 4: Commit** — `git commit -am "perf(seo): hero WebP + priority for LCP"`

---

## Task 10: AI search optimization (ai-seo skill)

**Files:** Create `frontend/public/llms.txt`; modify `frontend/app/page.tsx` (home FAQ)

- [ ] **Step 1** — `public/llms.txt` (plain text, per ai-seo skill): business one-liner, location, list of services each with its URL, NAP, hours. Makes the site agent-readable/citable.
- [ ] **Step 2** — Add a short **FAQ section** to the home page (3–4 TR Q/A covering "microblading nedir", "kalıcı makyaj ne kadar kalıcı", "Ankara'da nerede", "fiyatlar") + `faqSchema` JSON-LD. Answer-first, ≤ 3 sentences each (AI-extractable).
- [ ] **Step 3: Verify** — `curl -s localhost:3001/llms.txt` non-empty; home has a second `FAQPage` JSON-LD; run text through the AI-tell checklist (seo-audit/references/ai-writing-detection.md) — no em-dash/filler patterns.
- [ ] **Step 4: Commit** — `git commit -am "feat(seo): llms.txt + home FAQ for AI search"`

---

## Task 11: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Build** — `cd frontend && npm run build`. Expected: routes `/`, `/hizmetler`, `/hizmetler/[slug]` (7 static), `sitemap.xml`, `robots.txt` all listed; 0 errors.
- [ ] **Step 2: Per-route crawl checks** — script over `/`, `/hizmetler`, and 7 service URLs asserting each has: exactly one `<h1>`, a unique `<title>`, one `rel="canonical"`, ≥1 `application/ld+json`. All service pages have 3 JSON-LD blocks.
- [ ] **Step 3: Sitemap ↔ routes match** — every URL in `sitemap.xml` returns 200; no service page missing from sitemap.
- [ ] **Step 4: Rich Results Test** — validate home (BeautySalon+FAQ) and one service page (Service+FAQ+Breadcrumb): 0 errors.
- [ ] **Step 5: Update wiki** — append `wiki/log.md` (SEO overhaul) + add `wiki/decisions/2026-07-08-seo-architecture.md` (TR-first, per-service pages, why EN not indexed).
- [ ] **Step 6: Commit** — `git commit -am "docs(seo): verification + wiki update"`

---

## Self-Review notes
- **Spec coverage:** audit findings 1–7 map to tasks — #1 service pages (6,7,8), #2 TR-first server render (3,6,7), #3 schema (4,5), #4 sitemap/robots (2), #5 canonical/OG/titles (3,7), #6 image perf (9), #7 local schema/NAP (1,4). AI search → task 10.
- **Owner placeholders to replace** (flagged, not blockers): real domain (`siteUrl`), exact address/postal/geo, GBP URL, real phone/WhatsApp. Schema + sitemap read these from `site.ts` so it's a one-file edit.
- **Content debt:** Task 1 ships microblading copy fully; the other 6 services' TR copy is authored during execution with the copywriting/ai-seo skills (not a code placeholder — it's data written at build time).
