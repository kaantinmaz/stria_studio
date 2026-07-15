import type { Metadata } from "next";
import { getSettings, SETTINGS_FALLBACK } from "@/lib/content";
import { pricing, LAST_UPDATED } from "@/lib/copy";
import { buildMetadata } from "@/lib/seo";
import { Container, Section } from "@/components/Section";
import { ImageSlot } from "@/components/ImageSlot";
import { PricingTable } from "@/components/PricingTable";
import { CTAButtons, CTABanner } from "@/components/CTA";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { serviceSchema, faqSchema } from "@/lib/schema";

export const metadata: Metadata = buildMetadata({
  title: "Kaş Tasarımı Fiyatları 2026 (Ankara) | Güncel Fiyat Listesi",
  description:
    "Ankara'da kaş tasarımı fiyatları 2026: tek seans, rötuş dahil paket ve yıllık yenileme fiyat aralıkları. Stria Studio güncel fiyat listesi ve neyi kapsadığı.",
  path: "/kas-tasarimi-fiyatlari",
});

const priceFaqs = [
  {
    q: "Kaş tasarımı fiyatına neler dahil?",
    a: "Ücretsiz ön görüşme, yüz analizi, altın oran ile form tasarımı, steril tek kullanımlık ekipman ve kıl tekniğiyle uygulama fiyata dahildir. Rötuş, seçtiğiniz pakete göre dahildir.",
  },
  {
    q: "Rötuş ayrı ücretlendirilir mi?",
    a: "Rötuş dahil pakette ilk rötuş ücretsizdir. Tek seans seçilirse rötuş ayrı, indirimli ücretlendirilir.",
  },
  {
    q: "Neden fiyatlar arasında fark var?",
    a: "Fiyat; uygulayıcının deneyimine, kullanılan pigment kalitesine ve kaş yapısının gerektirdiği çalışma süresine göre değişir.",
  },
];

export default async function PricingPage() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Kaş Tasarımı Ankara",
          description: pricing.intro,
          path: "/kas-tasarimi-fiyatlari",
        })}
      />
      <JsonLd data={faqSchema(priceFaqs)} />
      <Breadcrumbs items={[{ name: "Kaş Tasarımı Fiyatları", path: "/kas-tasarimi-fiyatlari" }]} />

      <Section>
        <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-accent-dark">Son güncelleme: {LAST_UPDATED}</p>
        <h1 className="max-w-[760px] text-[clamp(28px,4vw,42px)] leading-tight text-ink">{pricing.heading}</h1>
        <p className="mt-5 max-w-[680px] text-[18px] leading-relaxed text-muted2">{pricing.intro}</p>
        <ImageSlot
          src="/images/topics/kas-tasarimi-fiyatlari.png"
          alt="Kişiye özel kaş tasarımı için ölçüm ve fiyat planlaması"
          ratio="aspect-[16/9]"
          className="mt-8 rounded-[2px] border border-line"
        />
        <PricingTable rows={pricing.rows} />
        <p className="mt-4 text-[13px] text-muted">{pricing.note}</p>
        <div className="mt-8">
          <CTAButtons settings={s} />
        </div>
      </Section>

      <Section eyebrow="S.S.S." heading="Fiyatlar hakkında sık sorulanlar" narrow className="bg-blush/40">
        <Faq items={priceFaqs} />
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
