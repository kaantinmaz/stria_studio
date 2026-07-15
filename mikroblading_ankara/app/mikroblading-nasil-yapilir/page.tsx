import type { Metadata } from "next";
import Link from "next/link";
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
  title: "Mikroblading Nasıl Yapılır? Adım Adım İşlem ve İyileşme",
  description:
    "Mikroblading nasıl yapılır? Ön görüşmeden rötuşa kadar adım adım işlem süreci, süresi, iyileşme dönemi ve dikkat edilmesi gerekenler. Ankara Stria Studio rehberi.",
  path: "/mikroblading-nasil-yapilir",
});

const howFaqs = [
  {
    q: "Mikroblading işlemi ne kadar sürer?",
    a: "Tasarım ve uygulama dahil ilk seans yaklaşık 90 dakika sürer. Rötuş seansı daha kısadır.",
  },
  {
    q: "İşlemden sonra ne zaman normale dönerim?",
    a: "Aynı gün günlük hayatınıza dönebilirsiniz. Kaşlar ilk birkaç gün koyu görünür, 7–10 günde doğal tonuna oturur.",
  },
  {
    q: "İyileşme sürecinde nelere dikkat etmeliyim?",
    a: "İlk 10 gün kaşları ıslatmaktan, terlemekten, güneşten ve makyajdan uzak tutun; verilen bakım kremini uygulayın.",
  },
];

export default async function HowItWorksPage() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  const steps = process.steps;
  return (
    <>
      <JsonLd
        data={howToSchema({
          name: "Mikroblading nasıl yapılır?",
          description: process.intro,
          steps: steps.map((st) => st.text),
        })}
      />
      <JsonLd data={faqSchema(howFaqs)} />
      <Breadcrumbs items={[{ name: "Nasıl Yapılır", path: "/mikroblading-nasil-yapilir" }]} />

      <Section narrow>
        <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-accent">Son güncelleme: {LAST_UPDATED}</p>
        <h1 className="text-[clamp(28px,4vw,42px)] leading-tight text-ink">{process.heading}</h1>
        <p className="mt-5 text-[19px] leading-relaxed text-muted2">{whatIs.answer}</p>
        <p className="mt-4 text-[17px] leading-relaxed text-muted2">{process.intro}</p>
        <ImageSlot
          src="/images/topics/mikroblading-nasil-yapilir.png"
          alt="Mikroblading nasıl yapılır — ölçüm, tasarım ve kıl tekniği aşamaları"
          ratio="aspect-[16/9]"
          className="mt-8 rounded-[24px] border border-line bg-blush"
        />
      </Section>

      <Section>
        <ProcessSteps steps={steps} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/mikroblading-oncesi-hazirlik" className="text-accent-dark hover:underline">Randevu öncesi hazırlık rehberi</Link>
          <Link href="/mikroblading-sonrasi-bakim" className="text-accent-dark hover:underline">Sonrası bakım ve iyileşme (gün gün)</Link>
        </div>
      </Section>

      <Section eyebrow="S.S.S." heading="İşlem ve iyileşme hakkında" narrow className="bg-blush/40">
        <Faq items={howFaqs} />
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
