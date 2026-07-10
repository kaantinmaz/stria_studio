import type { Metadata } from "next";
import { getSettings, SETTINGS_FALLBACK } from "@/lib/content";
import { process, whatIs, LAST_UPDATED } from "@/lib/copy";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/Section";
import { ProcessSteps } from "@/components/ProcessSteps";
import { CTABanner } from "@/components/CTA";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { howToSchema, faqSchema } from "@/lib/schema";

export const metadata: Metadata = buildMetadata({
  title: "Kaş Tasarımı Nasıl Yapılır? Adım Adım Süreç",
  description:
    "Kaş tasarımı nasıl yapılır? Kaş analizinden haritalama, şekillendirme (iplik/ağda) ve boyamaya kadar adım adım süreç, süresi ve dikkat edilecekler. Ankara Stria Studio rehberi.",
  path: "/kas-tasarimi-nasil-yapilir",
});

const howFaqs = [
  {
    q: "Kaş tasarımı işlemi ne kadar sürer?",
    a: "Analiz, haritalama ve şekillendirme dahil yaklaşık 30–45 dakika sürer. Boyama eklenirse birkaç dakika uzar.",
  },
  {
    q: "İşlemden sonra hemen dışarı çıkabilir miyim?",
    a: "Evet, aynı anda günlük hayatınıza dönersiniz. İplik/ağda sonrası hafif kızarıklık olabilir, kısa sürede geçer.",
  },
  {
    q: "İşlemden sonra nelere dikkat etmeliyim?",
    a: "İlk birkaç saat sıcak su ve makyajdan kaçının. Boyama yaptıysanız ilk 24 saat suyla temizlemeyin; formun korunması için 3–4 haftada bir bakım önerilir.",
  },
];

export default async function HowItWorksPage() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  const steps = process.steps;
  return (
    <>
      <JsonLd
        data={howToSchema({
          name: "Kaş Tasarımı nasıl yapılır?",
          description: process.intro,
          steps: steps.map((st) => st.text),
        })}
      />
      <JsonLd data={faqSchema(howFaqs)} />
      <Breadcrumbs items={[{ name: "Nasıl Yapılır", path: "/kas-tasarimi-nasil-yapilir" }]} />

      <Section narrow>
        <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-accent">Son güncelleme: {LAST_UPDATED}</p>
        <h1 className="text-[clamp(28px,4vw,42px)] leading-tight text-ink">{process.heading}</h1>
        <p className="mt-5 text-[19px] leading-relaxed text-muted2">{whatIs.answer}</p>
        <p className="mt-4 text-[17px] leading-relaxed text-muted2">{process.intro}</p>
      </Section>

      <Section>
        <ProcessSteps steps={steps} />
      </Section>

      <Section eyebrow="S.S.S." heading="İşlem hakkında sık sorulanlar" narrow className="bg-blush/40">
        <Faq items={howFaqs} />
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
