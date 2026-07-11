# Kaş Tasarımı Ankara — SEO/AEO Landing-Page Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 8 static topical landing pages + 3 CMS blog posts to the `kastasarimi/` microsite, each with unique Turkish content, answer-first structure, JSON-LD, breadcrumbs, FAQ, appointment CTA, and internal links — wired into sitemap, llms.txt, and the footer.

**Architecture:** Each landing page is a self-contained Next.js App Router page under `kastasarimi/app/<slug>/page.tsx`, composing existing components (`Section`, `Faq`, `CTAButtons`, `CTABanner`, `Breadcrumbs`, `JsonLd`, `StudioMap`) and schema builders (`serviceSchema`, `faqSchema`, `howToSchema` from `lib/schema.ts`). Copy lives inline per page. Pages are created first (independent files), then wired into shared files in one task. Blog posts append to the backend seed JSON.

**Tech Stack:** Next.js 16 (App Router, SSG+ISR), React 19, Tailwind v4, `next/font`. Backend: Laravel seeder for blog. No test framework — verification is `npm run build` + grep + curl guardrails.

## Global Constraints

Every task's requirements implicitly include these (verbatim from the spec `docs/superpowers/specs/2026-07-11-kastasarimi-seo-landing-pages-design.md`):

- **House rule:** never name any other technique or the brand-term for the technique. Only "kaş tasarımı" + "kıl tekniği". Applies to page copy AND blog bodies.
- **Unique content per page** — no templated near-duplicate copy. Pages 7 & 8 (locality) MUST differ in intro + FAQ (studio-in-Çankaya vs transit-from-Kızılay).
- **Every page:** self-canonical via `buildMetadata({...path})`; exactly one `<h1>` containing the page's target keyword; answer-first opening (answer in first ~40–60 words); ≥1 `<JsonLd>`; `<Breadcrumbs items={[{name, path}]}/>` (it emits BreadcrumbList JSON-LD itself — do NOT also emit `breadcrumbSchema`); an appointment CTA (`<CTAButtons>`/`<CTABanner>`); ≥2 internal links to related pages.
- **Design:** reuse the existing "Atelier" system — no new colors/fonts. Body text uses `ink`/`muted2`; `accent` only for fills/marks; links use `text-accent-dark`.
- **No backend/API/schema changes** except appending rows to `backend/database/seeders/data/kas-tasarimi-ankara.json` `posts[]` + reseed (Task 10).
- **Do not modify** existing pages' content except the wiring edits in Task 9 (Footer column, home related-links, sitemap, llms.txt).
- Working dir for frontend commands: `kastasarimi/`.
- Target keyword per page (H1 must contain it):
  | Route | H1 keyword |
  |---|---|
  | `/kas-tasarimi-nedir` | Kaş tasarımı nedir |
  | `/kas-tasarimi-kalici-mi` | Kaş tasarımı kalıcı mı |
  | `/kas-tasarimi-iyilesme-sureci` | Kaş tasarımı … iyileşme süreci (H1 also "acır mı") |
  | `/kas-tasarimi-bakimi` | Kaş tasarımı bakımı |
  | `/erkek-kas-tasarimi-ankara` | Erkek kaş tasarımı |
  | `/seyrek-kaslar-kas-tasarimi` | Seyrek … kaşlar … kaş tasarımı |
  | `/cankaya-kas-tasarimi` | Çankaya kaş tasarımı |
  | `/kizilay-kas-tasarimi` | Kızılay kaş tasarımı |

---

### Task 1: `/kas-tasarimi-nedir` — reference page (full copy)

This is the canonical template. Tasks 2–8 follow this file's structure but author their OWN unique copy.

**Files:**
- Create: `kastasarimi/app/kas-tasarimi-nedir/page.tsx`

**Interfaces:**
- Consumes: `buildMetadata` (`lib/seo`), `getSettings`/`SETTINGS_FALLBACK` (`lib/content`), `Section` (`components/Section`), `CTAButtons`/`CTABanner` (`components/CTA`), `Breadcrumbs`, `Faq`, `JsonLd`, `serviceSchema`/`faqSchema` (`lib/schema`), `ArrowIcon` (`components/Icons`), `Link` (next/link).
- Produces: route `/kas-tasarimi-nedir`.

- [ ] **Step 1: Create the file** with exactly:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getSettings, SETTINGS_FALLBACK } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/Section";
import { CTAButtons, CTABanner } from "@/components/CTA";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { serviceSchema, faqSchema } from "@/lib/schema";
import { ArrowIcon } from "@/components/Icons";

export const metadata: Metadata = buildMetadata({
  title: "Kaş Tasarımı Nedir? Kıl Tekniği ve Altın Oran | Ankara",
  description:
    "Kaş tasarımı nedir? Yüz simetrisi ve altın oran ölçümüne göre belirlenen kaş formunun kıl tekniğiyle tek tek işlenerek 12–18 ay kalıcı hale getirilmesidir. Ankara Çankaya, Stria Studio.",
  path: "/kas-tasarimi-nedir",
});

const faqs = [
  {
    q: "Kaş tasarımı nedir?",
    a: "Kaş tasarımı, yüz simetrisi ve altın oran ölçümüne göre kişiye özel belirlenen kaş formunun, kıl tekniğiyle tek tek işlenerek kalıcı hale getirilmesidir. Sonuç doğal görünür ve 12–18 ay kalıcıdır.",
  },
  {
    q: "Kaş tasarımı kimler için uygundur?",
    a: "Kaşları seyrek, açık renkli, asimetrik veya şekilsiz olan; makyajsız da dolgun ve bakımlı kaş isteyen herkes için uygundur. Uygunluk ücretsiz ön görüşmede değerlendirilir.",
  },
  {
    q: "Kaş tasarımı doğal görünür mü?",
    a: "Evet. Blok dolgu yerine her kıl tek tek çizildiği için, gerçek kaştan ayırt edilemeyecek kadar doğal bir görünüm elde edilir.",
  },
  {
    q: "Kaş formu nasıl belirlenir?",
    a: "Form; yüz hatlarınıza ve altın oran ölçümüne göre çizilir, başlangıç, kemer ve bitiş noktaları yüzünüze göre işaretlenir. Onayınız olmadan işleme geçilmez.",
  },
  {
    q: "Kaş tasarımı ne kadar kalıcıdır?",
    a: "Cilt tipine bağlı olarak 12–18 ay kalıcıdır. Yıllık yenileme seansıyla görünüm korunur.",
  },
];

export default async function Page() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Kaş Tasarımı Ankara",
          description: faqs[0].a,
          path: "/kas-tasarimi-nedir",
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Kaş Tasarımı Nedir", path: "/kas-tasarimi-nedir" }]} />

      <Section>
        <h1 className="max-w-[820px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">
          Kaş tasarımı nedir?
        </h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-relaxed text-muted2">
          Kaş tasarımı, yüz simetrisi ve altın oran ölçümüne göre kişiye özel belirlenen kaş
          formunun, kıl tekniğiyle tek tek işlenerek kalıcı hale getirilmesidir. Ankara
          Çankaya&apos;daki Stria Studio&apos;da her kıl gerçek kaştan ayırt edilemeyecek kadar
          doğal çizilir; sonuç 12–18 ay kalıcıdır ve günlük kaş makyajına gerek bırakmaz.
        </p>
        <div className="mt-8">
          <CTAButtons settings={s} />
        </div>
      </Section>

      <Section eyebrow="Form" heading="Kaş formu nasıl belirlenir?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Tasarım, ölçüyle başlar. Yüz simetriniz ve altın oran referans alınarak kaşın başlangıç,
          kemer (en yüksek nokta) ve bitiş noktaları yüzünüze göre işaretlenir. Renk; saç ve ten
          tonunuza göre seçilir. Form ve renk onayınız alınmadan uygulamaya geçilmez.
        </p>
      </Section>

      <Section eyebrow="Kimler için" heading="Kaş tasarımı kimler için uygundur?">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kaşları seyrek, boşluklu, açık renkli, asimetrik ya da şekilsiz olan; makyajsız da dolgun
          ve bakımlı bir kaş isteyen herkes için uygundur.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kaşlarınız çok seyrekse{" "}
          <Link href="/seyrek-kaslar-kas-tasarimi" className="text-accent-dark hover:underline">
            seyrek kaşlar için kaş tasarımı
          </Link>
          , erkekseniz{" "}
          <Link href="/erkek-kas-tasarimi-ankara" className="text-accent-dark hover:underline">
            erkek kaş tasarımı
          </Link>{" "}
          sayfasına da göz atabilirsiniz.
        </p>
      </Section>

      <Section eyebrow="Kalıcılık" heading="Sonuç ne kadar kalıcı?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kaş tasarımı cilt tipine bağlı olarak 12–18 ay kalıcıdır; yıllık yenileme ile görünüm
          korunur. Ayrıntı için{" "}
          <Link href="/kas-tasarimi-kalici-mi" className="text-accent-dark hover:underline">
            kaş tasarımı kalıcı mı
          </Link>{" "}
          sayfasına bakın.
        </p>
      </Section>

      <Section eyebrow="S.S.S." heading="Kaş tasarımı hakkında sık sorulanlar" narrow>
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/kas-tasarimi-nasil-yapilir" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            Nasıl yapılır? <ArrowIcon className="h-4 w-4" />
          </Link>
          <Link href="/kas-tasarimi-fiyatlari" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            Fiyatlar <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
```

- [ ] **Step 2: Build** — `cd kastasarimi && npm run build` → succeeds; route `/kas-tasarimi-nedir` prerenders.
- [ ] **Step 3: Guardrail** — `cd kastasarimi && grep -ciE "microblading|ombre|pudra|iplik|ağda|henna|kalıcı makyaj" app/kas-tasarimi-nedir/page.tsx` → expect `0`.
- [ ] **Step 4: Commit** — `git add kastasarimi/app/kas-tasarimi-nedir && git commit -m "feat(kas-tasarimi): /kas-tasarimi-nedir landing page"`

---

### Tasks 2–8: remaining landing pages (author unique copy)

For EACH task below: **invoke the `ai-seo` and `copywriting` skills** to write unique, high-quality Turkish copy. Follow the Task 1 file structure exactly (imports, `buildMetadata` export, inline `faqs` array, `<JsonLd>` + `<Breadcrumbs>` + `<Section>`s + `<CTABanner>`), but **do NOT copy Task 1's prose** — each page's answer, sections, and FAQ must be original and specific to its topic. Each page: one `<h1>` with the target keyword, answer-first intro, the schema listed, ≥2 internal links (listed), an appointment CTA. Escape apostrophes in JSX as `&apos;`.

Each task's steps: (1) create `app/<slug>/page.tsx`; (2) `cd kastasarimi && npm run build` succeeds; (3) `grep -ciE "microblading|ombre|pudra|iplik|ağda|henna|kalıcı makyaj" app/<slug>/page.tsx` → `0`; (4) commit `feat(kas-tasarimi): /<slug> landing page`.

**Task 2 — `/kas-tasarimi-kalici-mi`**
- H1: "Kaş tasarımı kalıcı mı? Ne kadar dayanır?" · title ≈ "Kaş Tasarımı Kalıcı mı? Ne Kadar Kalıcı? | Ankara"
- Answer-first: 12–18 ay; cilt tipine göre değişir; kalıcı ama kalıcı-makyaj değil vurgusu — yıllık yenileme ile korunur.
- Sections: "Kalıcılığı ne etkiler?" (cilt tipi, güneş, cilt bakımı/peeling), "Yenileme ne zaman?", "Kaş tasarımı neden zamanla açılır?".
- Schema: `faqSchema` (5 Q) + `<Breadcrumbs>`. (No serviceSchema needed; informational.)
- Links → `/kas-tasarimi-bakimi`, `/kas-tasarimi-nedir`, `/kas-tasarimi-fiyatlari`.

**Task 3 — `/kas-tasarimi-iyilesme-sureci`**
- H1: "Kaş tasarımı acır mı? İyileşme süreci nasıl?"
- Answer-first: anestezik krem sonrası çoğu kişi hafif çizilme hissi tarif eder; yüzeysel iyileşme 7–10 gün; nihai renk 4–6 haftada oturur.
- Sections: "Acıtır mı, konfor nasıl?", "Gün gün iyileşme" (use `howToSchema` with steps: Gün 1–3 / Gün 3–7 / Gün 7–10 / 4–6. hafta), "Rötuş neden gerekli?".
- Schema: `faqSchema` (4–5 Q) + `howToSchema` (iyileşme adımları) + `<Breadcrumbs>`.
- Links → `/kas-tasarimi-bakimi`, `/kas-tasarimi-nasil-yapilir`.

**Task 4 — `/kas-tasarimi-bakimi`**
- H1: "Kaş tasarımı bakımı: öncesi ve sonrası"
- Answer-first: öncesinde kafein/kan sulandırıcı/güneş yanığından kaçının; sonrasında ilk 10 gün suyla temizden kaçının, kabukları koparmayın, güneş/havuz/sauna yok, önerilen nemlendiriciyi uygulayın.
- Sections: "İşlem öncesi hazırlık" (`howToSchema` steps), "Sonrası ilk 10 gün" (`howToSchema` steps), "Uzun vadede koruma (güneş)".
- Schema: `howToSchema` (bakım adımları) + `faqSchema` (4 Q) + `<Breadcrumbs>`.
- Links → `/kas-tasarimi-iyilesme-sureci`, `/kas-tasarimi-kalici-mi`.

**Task 5 — `/erkek-kas-tasarimi-ankara`**
- H1: "Erkek kaş tasarımı — Ankara" · title ≈ "Erkek Kaş Tasarımı Ankara | Doğal, Kalıcı | Stria Studio"
- Answer-first: erkeklere özel, kavisi az, düz ve dolgun doğal form; abartısız; kıl tekniğiyle 12–18 ay kalıcı.
- Sections: "Erkek kaş formu farkı" (doğal, düz, yoğunluk), "Süreç ve gizlilik", "Kimler için uygun".
- Schema: `serviceSchema` (name "Erkek Kaş Tasarımı") + `faqSchema` (4 Q) + `<Breadcrumbs>`.
- Links → `/kas-tasarimi-nedir`, `/kas-tasarimi-nasil-yapilir`, `/kas-tasarimi-fiyatlari`.

**Task 6 — `/seyrek-kaslar-kas-tasarimi`**
- H1: "Seyrek ve dökük kaşlar için kaş tasarımı"
- Answer-first: seyrek, boşluklu veya açık renkli kaşlarda her kıl tek tek işlenerek boşluklar doğal biçimde doldurulur; makyajsız dolgun görünüm.
- Sections: "Uygunluk (kimler için)", "Boşluklar nasıl doldurulur", "Açık renkli / az kıllı kaşlar".
- Schema: `serviceSchema` + `faqSchema` (4 Q) + `<Breadcrumbs>`.
- Links → `/kas-tasarimi-nedir`, `/kas-tasarimi-nasil-yapilir`, `/kas-tasarimi-bakimi`.

**Task 7 — `/cankaya-kas-tasarimi`** (LOCALITY — must be distinct from Task 8)
- H1: "Çankaya kaş tasarımı — Stria Studio" · title ≈ "Çankaya Kaş Tasarımı | Stria Studio Ankara"
- Angle: studio IS in Çankaya. Answer-first names Çankaya location + service.
- Sections: "Konum ve ulaşım" (render `<StudioMap settings={s} />`), "Çankaya'da kişiye özel kaş tasarımı", "Randevu".
- Schema: `serviceSchema` (areaServed handled by builder = Ankara; keep) + `faqSchema` (3–4 Q, local: adres/park/randevu — DISTINCT from Task 8) + `<Breadcrumbs>`.
- Links → `/iletisim`, `/kas-tasarimi-fiyatlari`, `/kizilay-kas-tasarimi`.
- Import `StudioMap` from `@/components/StudioMap`.

**Task 8 — `/kizilay-kas-tasarimi`** (LOCALITY — must be distinct from Task 7)
- H1: "Kızılay kaş tasarımı (Çankaya)" · title ≈ "Kızılay Kaş Tasarımı | Çankaya'da Stria Studio"
- Angle: getting here FROM Kızılay (proximity/transit). Answer-first: Kızılay'a yakın, Çankaya'daki stüdyo; metro/otobüs ile kolay ulaşım.
- Sections: "Kızılay'dan ulaşım" (metro/otobüs, yaklaşık mesafe — original copy, NOT the same as Task 7), "Stüdyo konumu" (`<StudioMap settings={s} />`), "Randevu".
- Schema: `serviceSchema` + `faqSchema` (3 Q, DISTINCT from Task 7) + `<Breadcrumbs>`.
- Links → `/cankaya-kas-tasarimi`, `/iletisim`.
- Import `StudioMap`.

---

### Task 9: Wiring — sitemap, llms.txt, footer, home hub

Registers all 8 pages after they exist.

**Files:**
- Modify: `kastasarimi/app/sitemap.ts`
- Modify: `kastasarimi/app/llms.txt/route.ts`
- Modify: `kastasarimi/components/Footer.tsx`
- Modify: `kastasarimi/app/page.tsx`

- [ ] **Step 1: `sitemap.ts`** — inside `staticPages`, after the `/kas-tasarimi-nasil-yapilir` entry, insert:

```ts
    { url: absUrl("/kas-tasarimi-nedir"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absUrl("/kas-tasarimi-kalici-mi"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absUrl("/kas-tasarimi-iyilesme-sureci"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absUrl("/kas-tasarimi-bakimi"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absUrl("/erkek-kas-tasarimi-ankara"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absUrl("/seyrek-kaslar-kas-tasarimi"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absUrl("/cankaya-kas-tasarimi"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absUrl("/kizilay-kas-tasarimi"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
```

- [ ] **Step 2: `llms.txt/route.ts`** — insert a new section into the template string immediately BEFORE the `## API` line:

```ts
## Kaş tasarımı rehberi
- [Kaş tasarımı nedir](${u("/kas-tasarimi-nedir")}): tanım, altın oran, kıl tekniği
- [Kaş tasarımı kalıcı mı](${u("/kas-tasarimi-kalici-mi")}): 12–18 ay kalıcılık, yenileme
- [Acır mı & iyileşme süreci](${u("/kas-tasarimi-iyilesme-sureci")}): konfor, 7–10 gün iyileşme
- [Kaş tasarımı bakımı](${u("/kas-tasarimi-bakimi")}): öncesi & sonrası bakım
- [Erkek kaş tasarımı Ankara](${u("/erkek-kas-tasarimi-ankara")}): erkeklere özel doğal form
- [Seyrek kaşlar için kaş tasarımı](${u("/seyrek-kaslar-kas-tasarimi")}): seyrek/dökük kaş dolgusu
- [Çankaya kaş tasarımı](${u("/cankaya-kas-tasarimi")}): konum ve ulaşım
- [Kızılay kaş tasarımı](${u("/kizilay-kas-tasarimi")}): Kızılay'dan erişim

```
(Keep the blank line so `## API` stays separated.)

- [ ] **Step 3: `Footer.tsx`** — insert a full-width rehber strip between the closing `</div>` of the 4-column grid and the copyright `<div className="border-t border-line px-5 py-5 …">`:

```tsx
      <div className="border-t border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-6">
          <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-muted">Kaş Tasarımı Rehberi</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted2">
            <li><Link href="/kas-tasarimi-nedir" className="hover:text-accent-dark">Kaş tasarımı nedir</Link></li>
            <li><Link href="/kas-tasarimi-kalici-mi" className="hover:text-accent-dark">Kalıcı mı?</Link></li>
            <li><Link href="/kas-tasarimi-iyilesme-sureci" className="hover:text-accent-dark">İyileşme süreci</Link></li>
            <li><Link href="/kas-tasarimi-bakimi" className="hover:text-accent-dark">Bakım</Link></li>
            <li><Link href="/erkek-kas-tasarimi-ankara" className="hover:text-accent-dark">Erkek kaş tasarımı</Link></li>
            <li><Link href="/seyrek-kaslar-kas-tasarimi" className="hover:text-accent-dark">Seyrek kaşlar</Link></li>
            <li><Link href="/cankaya-kas-tasarimi" className="hover:text-accent-dark">Çankaya</Link></li>
            <li><Link href="/kizilay-kas-tasarimi" className="hover:text-accent-dark">Kızılay</Link></li>
          </ul>
        </div>
      </div>
```
(`Link` is already imported in Footer.tsx.)

- [ ] **Step 4: `app/page.tsx`** — inside the FAQ `<Section>` (the one with `heading="Sıkça sorulan sorular"`), after the existing "Tüm soruları gör" `<Link>`, append a related-links block:

```tsx
        <div className="mt-10">
          <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-muted">İlgili konular</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-accent-dark">
            <li><Link href="/kas-tasarimi-nedir" className="hover:underline">Kaş tasarımı nedir?</Link></li>
            <li><Link href="/kas-tasarimi-kalici-mi" className="hover:underline">Kalıcı mı?</Link></li>
            <li><Link href="/kas-tasarimi-iyilesme-sureci" className="hover:underline">Acır mı & iyileşme</Link></li>
            <li><Link href="/kas-tasarimi-bakimi" className="hover:underline">Bakım</Link></li>
            <li><Link href="/erkek-kas-tasarimi-ankara" className="hover:underline">Erkek kaş tasarımı</Link></li>
            <li><Link href="/seyrek-kaslar-kas-tasarimi" className="hover:underline">Seyrek kaşlar</Link></li>
          </ul>
        </div>
```
(`Link` is already imported in page.tsx.)

- [ ] **Step 5: Build** — `cd kastasarimi && npm run build` → succeeds.
- [ ] **Step 6: Verify wiring**
```bash
cd kastasarimi && npm run dev &   # or an already-running :3002
sleep 3
curl -s localhost:3002/sitemap.xml | grep -c "kas-tasarimi-nedir\|kas-tasarimi-kalici-mi\|kas-tasarimi-iyilesme-sureci\|kas-tasarimi-bakimi\|erkek-kas-tasarimi-ankara\|seyrek-kaslar-kas-tasarimi\|cankaya-kas-tasarimi\|kizilay-kas-tasarimi"   # expect 8
curl -s localhost:3002/llms.txt | grep -c "kas-tasarimi-rehberi\|Kaş tasarımı rehberi"   # >=1
```
- [ ] **Step 7: Commit** — `git add kastasarimi/app/sitemap.ts kastasarimi/app/llms.txt kastasarimi/components/Footer.tsx kastasarimi/app/page.tsx && git commit -m "feat(kas-tasarimi): wire landing pages into sitemap, llms.txt, footer, home hub"`

---

### Task 10: Blog posts (CMS seed) — phase 4

**Files:**
- Modify: `backend/database/seeders/data/kas-tasarimi-ankara.json` (append to `posts[]`)

- [ ] **Step 1: Inspect the seeder's post handling** to avoid duplicates/data loss on reseed:
```bash
cd /Applications/MAMP/htdocs/stria_studio/backend
grep -rn "posts\|updateOrCreate\|firstOrCreate\|create(" database/seeders/MicrositeSeeder.php | head
```
Confirm posts are **upserted by slug** (`updateOrCreate`). If they are blind-inserted, STOP and report — do not reseed (would duplicate the existing 6 posts).

- [ ] **Step 2: Append 3 posts** to the `posts` array in `kas-tasarimi-ankara.json`. Each object: `{ "slug", "title_tr", "excerpt_tr", "meta_title_tr", "meta_desc_tr", "body_tr" }`. `body_tr` = original HTML (`<h2>`, `<p>`, `<ul>`), unique per post, house-rule compliant, each linking to relevant landing pages with `<a href="/...">`. Slugs + topics:
  - `kas-tasariminda-altin-oran` — "Kaş tasarımında altın oran nedir?" → links `/kas-tasarimi-nedir`, `/kas-tasarimi-nasil-yapilir`.
  - `kas-tasarimi-karar-rehberi` — "Kaş tasarımı yaptırmalı mıyım? Karar rehberi" → links `/kas-tasarimi-kalici-mi`, `/seyrek-kaslar-kas-tasarimi`, `/kas-tasarimi-nedir`.
  - `kas-tasarimi-sonrasi-ilk-10-gun` — "Kaş tasarımı sonrası ilk 10 gün" → links `/kas-tasarimi-bakimi`, `/kas-tasarimi-iyilesme-sureci`.
  Write the copy with the `ai-seo`/`copywriting` skills. Validate JSON: `cd /Applications/MAMP/htdocs/stria_studio && python3 -m json.tool backend/database/seeders/data/kas-tasarimi-ankara.json > /dev/null && echo "valid JSON"`.

- [ ] **Step 3: Reseed** (only if Step 1 confirmed upsert-by-slug). Use the project's seeder command (from wiki: generalized MicrositeSeeder over `data/*.json`):
```bash
cd /Applications/MAMP/htdocs/stria_studio/backend
php artisan db:seed --class=Database\\Seeders\\MicrositeSeeder --force
```
- [ ] **Step 4: Verify** the 3 posts render and the existing 6 remain:
```bash
curl -s "http://127.0.0.1:8002/api/microsites/kas-tasarimi-ankara/posts" | python3 -c "import sys,json;d=json.load(sys.stdin);print('posts:',len(d.get('data',d)))"   # expect 9
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3002/blog/kas-tasariminda-altin-oran   # 200
```
- [ ] **Step 5: Commit** — `git add backend/database/seeders/data/kas-tasarimi-ankara.json && git commit -m "feat(kas-tasarimi): 3 supporting blog posts linking landing pages"`

---

### Task 11: Final verification

- [ ] **Step 1: Build + no house-rule violations across new pages**
```bash
cd kastasarimi && npm run build
grep -rniE "microblading|micro blading|ombre|pudra(lama)?|iplik|ağda|henna|kalıcı makyaj|dövme" \
  app/kas-tasarimi-nedir app/kas-tasarimi-kalici-mi app/kas-tasarimi-iyilesme-sureci \
  app/kas-tasarimi-bakimi app/erkek-kas-tasarimi-ankara app/seyrek-kaslar-kas-tasarimi \
  app/cankaya-kas-tasarimi app/kizilay-kas-tasarimi || echo "HOUSE RULE CLEAN"
```
- [ ] **Step 2: Each page has one H1 with its keyword + self-canonical + JSON-LD.** For each of the 8 routes (dev server on :3002):
```bash
for r in kas-tasarimi-nedir kas-tasarimi-kalici-mi kas-tasarimi-iyilesme-sureci kas-tasarimi-bakimi erkek-kas-tasarimi-ankara seyrek-kaslar-kas-tasarimi cankaya-kas-tasarimi kizilay-kas-tasarimi; do
  h1=$(curl -s "localhost:3002/$r" | grep -c "<h1")
  ld=$(curl -s "localhost:3002/$r" | grep -c "application/ld+json")
  can=$(curl -s "localhost:3002/$r" | grep -c "rel=\"canonical\"")
  echo "$r: h1=$h1 jsonld=$ld canonical=$can"
done
```
Expect each: `h1=1`, `jsonld>=2`, `canonical=1`.
- [ ] **Step 3: Locality pages distinct** — diff their intro paragraphs; confirm not identical:
```bash
cd kastasarimi && diff <(grep -A3 "<h1" app/cankaya-kas-tasarimi/page.tsx) <(grep -A3 "<h1" app/kizilay-kas-tasarimi/page.tsx) && echo "WARNING identical" || echo "distinct (good)"
```
- [ ] **Step 4: Update wiki** — append a `wiki/log.md` line noting the 8 landing pages + 3 blog posts (ref this plan). Commit.

---

## Self-Review

**Spec coverage:** 8 pages → Tasks 1–8 (page 1 full template; 2–8 briefed with keyword/H1/schema/links); wiring (sitemap/llms.txt/footer/home hub) → Task 9; 3 blog posts → Task 10; verification (build/house-rule/H1-canonical-JSONLD/locality-distinct/wiki) → Task 11. Internal-linking, breadcrumbs, CTA, unique-content, thin-content mitigation all in Global Constraints + per-task. All spec sections covered.

**Placeholder scan:** Task 1 + Task 9 contain complete code. Tasks 2–8 and 10 are copy-authoring tasks — they carry concrete content briefs (H1, keyword, answer, sections, schema, links) and require the `ai-seo`/`copywriting` skills; the prose is authored by the implementer by design (pre-writing 8 pages of Turkish here would be wasteful and lower-quality than skill-guided authoring). This is a concrete brief, not a vague TODO. Mechanical wiring is fully specified.

**Type/consistency:** all pages use the same imports/props as the Task 1 template and the existing `/kas-tasarimi-fiyatlari` page; schema builder signatures match `lib/schema.ts` (`serviceSchema({name,description,path})`, `faqSchema([{q,a}])`, `howToSchema({name,description,steps})`); `<Breadcrumbs items={[{name,path}]}/>` emits its own BreadcrumbList JSON-LD (no manual `breadcrumbSchema`). Routes referenced in wiring (Task 9) exactly match the slugs created in Tasks 1–8.
