import type { Metadata } from "next";
import { getSettings, SETTINGS_FALLBACK } from "@/lib/content";
import { process, whatIs, LAST_UPDATED } from "@/lib/copy";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/Section";
import { ImageSlot } from "@/components/ImageSlot";
import { ProcessSteps } from "@/components/ProcessSteps";
import { CTABanner } from "@/components/CTA";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { howToSchema, faqSchema } from "@/lib/schema";

export const metadata: Metadata = buildMetadata({
  title: "Kaş Tasarımı Nasıl Yapılır? Adım Adım Süreç",
  description:
    "Kaş tasarımı nasıl yapılır? Ön görüşme, altın oranla çizim, kıl tekniği uygulaması, rötuş süresi ve iyileşme adımlarını Stria Studio rehberinde öğrenin.",
  path: "/kas-tasarimi-nasil-yapilir",
});

const howFaqs = [
  {
    q: "Kaş tasarımı işlemi ne kadar sürer?",
    a: "Tasarım ve kıl kıl uygulama dahil ilk seans yaklaşık 90 dakika sürer. Rötuş seansı daha kısadır.",
  },
  {
    q: "İşlemden sonra ne zaman normale dönerim?",
    a: "Aynı gün günlük hayatınıza dönebilirsiniz. Kaşlar ilk birkaç gün bir ton koyu görünür, 7–10 günde doğal tonuna oturur.",
  },
  {
    q: "İyileşme sürecinde nelere dikkat etmeliyim?",
    a: "İlk 7–10 gün kaşları ıslatmaktan, terlemekten, güneşten ve makyajdan uzak tutun; verilen bakım kremini uygulayın.",
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
        <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-accent-dark">Son güncelleme: {LAST_UPDATED}</p>
        <h1 className="text-[clamp(28px,4vw,42px)] leading-tight text-ink">{process.heading}</h1>
        <p className="mt-5 text-[19px] leading-relaxed text-muted2">{whatIs.answer}</p>
        <p className="mt-4 text-[17px] leading-relaxed text-muted2">{process.intro}</p>
        <ImageSlot
          src="/images/topics/kas-tasarimi-nasil-yapilir.png"
          alt="Altın oran ölçümüyle kaş formunun adım adım çizilmesi"
          ratio="aspect-[16/9]"
          className="mt-8 rounded-[2px] border border-line"
        />
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
