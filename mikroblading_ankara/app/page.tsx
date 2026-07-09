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
import { ImageSlot } from "@/components/ImageSlot";
import { CheckIcon, ArrowIcon } from "@/components/Icons";
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
          name: "Mikroblading (Kıl Tekniği Kaş)",
          description: whatIs.answer,
          path: "/",
        })}
      />
      <JsonLd data={faqSchema(faqs)} />

      {/* Hero */}
      <section className="border-b border-line bg-gradient-to-b from-blush/60 to-cream">
        <Container className="grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-4 text-[12px] uppercase tracking-[0.2em] text-accent">{hero.eyebrow}</p>
            <h1 className="text-[clamp(32px,5vw,52px)] font-medium leading-[1.08] tracking-tight text-ink">
              {hero.title}
            </h1>
            <p className="mt-5 max-w-[540px] text-[18px] leading-relaxed text-muted2">{hero.subtitle}</p>
            <div className="mt-8">
              <CTAButtons settings={s} />
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-muted2">
              {["Steril, tek kullanımlık ekipman", "Yüze özel tasarım", "12–18 ay kalıcı"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-accent" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <ImageSlot src={null} alt="Mikroblading kaş tasarımı — Ankara Stria Studio" ratio="aspect-[4/5]" className="rounded-[28px]" />
        </Container>
      </section>

      {/* Trust */}
      <section className="py-12">
        <Container>
          <TrustBar />
        </Container>
      </section>

      {/* What is (answer-first) */}
      <Section id="mikroblading-nedir" narrow>
        <h2 className="text-[clamp(24px,3.4vw,34px)] leading-tight text-ink">{whatIs.heading}</h2>
        <p className="mt-5 text-[19px] leading-relaxed text-muted2">{whatIs.answer}</p>
      </Section>

      {/* Benefits */}
      <Section eyebrow="Avantajlar" heading={benefits.heading} intro={benefits.intro} className="bg-blush/40">
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {benefits.items.map((b) => (
            <div key={b.title} className="rounded-[20px] border border-line bg-white p-6">
              <h3 className="text-[18px] text-ink">{b.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted2">{b.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Process */}
      <Section eyebrow="Süreç" heading={process.heading} intro={process.intro}>
        <ProcessSteps steps={process.steps} />
        <Link href="/mikroblading-nasil-yapilir" className="mt-6 inline-flex items-center gap-1.5 text-[15px] text-accent-dark">
          Adım adım detaylı anlatım <ArrowIcon className="h-4 w-4" />
        </Link>
      </Section>

      {/* Pricing */}
      <Section eyebrow="Fiyatlar" heading={pricing.heading} intro={pricing.intro} className="bg-blush/40">
        <PricingTable rows={pricing.rows} />
        <p className="mt-4 text-[13px] text-muted">{pricing.note}</p>
        <Link href="/mikroblading-fiyatlari" className="mt-4 inline-flex items-center gap-1.5 text-[15px] text-accent-dark">
          Detaylı fiyat bilgisi <ArrowIcon className="h-4 w-4" />
        </Link>
      </Section>

      {/* Gallery */}
      <Section eyebrow="Galeri" heading="Öncesi & sonrası çalışmalarımız">
        <Gallery items={gallery} limit={6} />
        <Link href="/galeri" className="mt-6 inline-flex items-center gap-1.5 text-[15px] text-accent-dark">
          Tüm galeriyi gör <ArrowIcon className="h-4 w-4" />
        </Link>
      </Section>

      {/* Reviews */}
      <Section eyebrow="Yorumlar" heading="Ankara'dan danışan yorumları" className="bg-blush/40">
        <Reviews />
      </Section>

      {/* FAQ */}
      <Section id="sss" eyebrow="S.S.S." heading="Sıkça sorulan sorular" narrow>
        <Faq items={faqs} />
        <Link href="/sss" className="mt-6 inline-flex items-center gap-1.5 text-[15px] text-accent-dark">
          Tüm soruları gör <ArrowIcon className="h-4 w-4" />
        </Link>
      </Section>

      {/* Blog */}
      <Section eyebrow="Blog" heading="Mikroblading rehberi">
        <BlogList posts={posts} />
        <Link href="/blog" className="mt-6 inline-flex items-center gap-1.5 text-[15px] text-accent-dark">
          Tüm yazılar <ArrowIcon className="h-4 w-4" />
        </Link>
      </Section>

      {/* Location */}
      <Section eyebrow="Konum" heading="Ankara Çankaya'dayız" className="bg-blush/40">
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
