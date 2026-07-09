import type { Metadata } from "next";
import { getSettings, getFaqs, SETTINGS_FALLBACK } from "@/lib/content";
import { faqFallback } from "@/lib/copy";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/Section";
import { Faq } from "@/components/Faq";
import { CTABanner } from "@/components/CTA";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { faqSchema } from "@/lib/schema";

export const metadata: Metadata = buildMetadata({
  title: "Mikroblading Hakkında Sıkça Sorulan Sorular (Ankara)",
  description:
    "Mikroblading kalıcılığı, fiyatı, acı, iyileşme süreci ve kimlerin yaptıramayacağı gibi en çok sorulan soruların yanıtları. Ankara Stria Studio.",
  path: "/sss",
});

export default async function FaqPage() {
  const [settings, faqsApi] = await Promise.all([getSettings(), getFaqs()]);
  const s = settings ?? SETTINGS_FALLBACK;
  const faqs = (faqsApi.length ? faqsApi.map((f) => ({ q: f.q_tr, a: f.a_tr })) : faqFallback);

  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "S.S.S.", path: "/sss" }]} />
      <Section eyebrow="S.S.S." heading="Sıkça sorulan sorular" narrow
        intro="Mikroblading hakkında en çok merak edilenleri derledik. Yanıtını bulamadığınız bir soru varsa WhatsApp'tan yazabilirsiniz.">
        <Faq items={faqs} />
      </Section>
      <CTABanner settings={s} />
    </>
  );
}
