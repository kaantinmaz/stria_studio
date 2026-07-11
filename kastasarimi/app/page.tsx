import Link from "next/link";
import { getSettings, getFaqs, getGallery, getPosts, SETTINGS_FALLBACK } from "@/lib/content";
import { hero, whatIs, benefits, process, pricing, about, faqFallback } from "@/lib/copy";
import { Container, Section } from "@/components/Section";
import { CTAButtons, CTABanner } from "@/components/CTA";
import { TrustBar } from "@/components/TrustBar";
import { ProcessSteps } from "@/components/ProcessSteps";
import { PricingTable } from "@/components/PricingTable";
import { Gallery } from "@/components/Gallery";
import { Reviews } from "@/components/Reviews";
import { Faq } from "@/components/Faq";
import { BlogList } from "@/components/BlogList";
import { StudioMap } from "@/components/StudioMap";
import { BrowFlourish } from "@/components/BrowFlourish";
import { ArrowIcon } from "@/components/Icons";
import { JsonLd } from "@/components/JsonLd";
import { serviceSchema, faqSchema } from "@/lib/schema";

export default async function HomePage() {
  const [settings, faqsApi, gallery, postsRes] = await Promise.all([
    getSettings(),
    getFaqs(),
    getGallery(),
    getPosts(1),
  ]);
  const s = settings ?? SETTINGS_FALLBACK;
  const faqs = (faqsApi.length ? faqsApi : faqFallback.map((f) => ({ q_tr: f.q, a_tr: f.a })))
    .slice(0, 6)
    .map((f) => ({ q: f.q_tr, a: f.a_tr }));
  const posts = postsRes.data.slice(0, 3);

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Kaş Tasarımı",
          description: whatIs.answer,
          path: "/",
        })}
      />
      <JsonLd data={faqSchema(faqs)} />

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

      {/* Trust */}
      <section className="py-12">
        <Container>
          <TrustBar />
        </Container>
      </section>

      {/* What is (answer-first) */}
      <Section id="kas-tasarimi-nedir" narrow>
        <div className="flex items-baseline gap-4 sm:gap-6">
          <span className="section-index shrink-0" aria-hidden="true">01</span>
          <h2 className="text-[clamp(27px,3.8vw,46px)] leading-[1.06] text-ink">{whatIs.heading}</h2>
        </div>
        <p className="mt-5 text-[19px] leading-relaxed text-muted2">{whatIs.answer}</p>
      </Section>

      {/* Benefits */}
      <Section index="02" eyebrow="Avantajlar" heading={benefits.heading} intro={benefits.intro} className="bg-blush/40">
        <ul className="mt-12 border-t border-line">
          {benefits.items.map((b, i) => (
            <li key={b.title} className="grid grid-cols-[auto_1fr] gap-x-6 border-b border-line py-7 sm:grid-cols-[64px_1fr]">
              <span className="font-display text-[22px] leading-none text-accent" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-display text-[20px] font-medium text-ink">{b.title}</h3>
                <p className="mt-2 max-w-[560px] text-[15px] leading-relaxed text-muted2">{b.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* Process */}
      <Section index="03" eyebrow="Süreç" heading={process.heading} intro={process.intro}>
        <ProcessSteps steps={process.steps} />
        <Link href="/kas-tasarimi-nasil-yapilir" className="mt-6 inline-flex items-center gap-1.5 text-[15px] text-accent-dark">
          Adım adım detaylı anlatım <ArrowIcon className="h-4 w-4" />
        </Link>
      </Section>

      {/* Pricing */}
      <Section index="04" eyebrow="Fiyatlar" heading={pricing.heading} intro={pricing.intro} className="bg-blush/40">
        <PricingTable rows={pricing.rows} />
        <p className="mt-4 text-[13px] text-muted">{pricing.note}</p>
        <Link href="/kas-tasarimi-fiyatlari" className="mt-4 inline-flex items-center gap-1.5 text-[15px] text-accent-dark">
          Detaylı fiyat bilgisi <ArrowIcon className="h-4 w-4" />
        </Link>
      </Section>

      {/* Gallery */}
      <Section index="05" eyebrow="Galeri" heading="Öncesi & sonrası çalışmalarımız">
        <Gallery items={gallery} limit={6} />
        <Link href="/galeri" className="mt-6 inline-flex items-center gap-1.5 text-[15px] text-accent-dark">
          Tüm galeriyi gör <ArrowIcon className="h-4 w-4" />
        </Link>
      </Section>

      {/* Reviews */}
      <Section index="06" eyebrow="Yorumlar" heading="Ankara'dan danışan yorumları" className="bg-blush/40">
        <Reviews />
      </Section>

      {/* FAQ */}
      <Section id="sss" index="07" eyebrow="S.S.S." heading="Sıkça sorulan sorular" narrow>
        <Faq items={faqs} />
        <Link href="/sss" className="mt-6 inline-flex items-center gap-1.5 text-[15px] text-accent-dark">
          Tüm soruları gör <ArrowIcon className="h-4 w-4" />
        </Link>
        <div className="mt-10">
          <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-muted">İlgili konular</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-accent-dark">
            <li><Link href="/kas-tasarimi-nedir" className="hover:underline">Kaş tasarımı nedir?</Link></li>
            <li><Link href="/kas-tasarimi-kalici-mi" className="hover:underline">Kalıcı mı?</Link></li>
            <li><Link href="/kas-tasarimi-iyilesme-sureci" className="hover:underline">Acır mı & iyileşme</Link></li>
            <li><Link href="/kas-tasarimi-bakimi" className="hover:underline">Bakım</Link></li>
            <li><Link href="/erkek-kas-tasarimi-ankara" className="hover:underline">Erkek kaş tasarımı</Link></li>
            <li><Link href="/seyrek-kaslar-kas-tasarimi" className="hover:underline">Seyrek kaşlar</Link></li>
            <li><Link href="/cankaya-kas-tasarimi" className="hover:underline">Çankaya</Link></li>
            <li><Link href="/kizilay-kas-tasarimi" className="hover:underline">Kızılay</Link></li>
          </ul>
        </div>
      </Section>

      {/* Blog */}
      <Section index="08" eyebrow="Blog" heading="Kaş Tasarımı rehberi">
        <BlogList posts={posts} />
        <Link href="/blog" className="mt-6 inline-flex items-center gap-1.5 text-[15px] text-accent-dark">
          Tüm yazılar <ArrowIcon className="h-4 w-4" />
        </Link>
      </Section>

      {/* Location */}
      <Section index="09" eyebrow="Konum" heading="Ankara Çankaya'dayız" className="bg-blush/40">
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-[16px] leading-relaxed text-muted2">{about.paragraphs[0]}</p>
            <ul className="mt-6 space-y-2 text-[15px] text-muted2">
              <li><strong className="text-ink">Adres:</strong> {s.street_address}, {s.locality} / {s.region}</li>
              <li><strong className="text-ink">Telefon:</strong> {s.phone_local}</li>
            </ul>
            <div className="mt-6">
              <CTAButtons settings={s} />
            </div>
          </div>
          <StudioMap settings={s} />
        </div>
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
