import type { Metadata } from "next";
import Link from "next/link";
import { getSettings, SETTINGS_FALLBACK } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/Section";
import { StudioMap } from "@/components/StudioMap";
import { CTAButtons, CTABanner } from "@/components/CTA";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { serviceSchema, faqSchema } from "@/lib/schema";
import { ArrowIcon } from "@/components/Icons";

export const metadata: Metadata = buildMetadata({
  title: "Kızılay Kaş Tasarımı | Çankaya'da Stria Studio",
  description:
    "Kızılay'a yakın, Çankaya'daki Stria Studio'da kaş tasarımı. Metro ve otobüsle kolay ulaşım, kişiye özel form, kıl tekniğiyle 12–18 ay kalıcı sonuç.",
  path: "/kizilay-kas-tasarimi",
});

const faqs = [
  {
    q: "Kızılay'dan stüdyoya nasıl ulaşabilirim?",
    a: "Çankaya'daki stüdyomuza Kızılay'dan toplu taşımayla, metro veya otobüs hatlarını kullanarak kolayca ulaşabilirsiniz. Güncel hat ve durak bilgisi için randevu onayı sırasında yol tarifi de paylaşırız.",
  },
  {
    q: "Kızılay'a ne kadar yakın?",
    a: "Stüdyomuz Kızılay merkezine yakın, Çankaya sınırları içinde yer alır. Kesin mesafe güzergaha göre değişeceğinden, en güncel bilgiyi randevu sırasında veya iletişim sayfamızdan alabilirsiniz.",
  },
  {
    q: "Kızılay çevresinden gelenler için randevu saatleri esnek mi?",
    a: "Evet. İş çıkışı ya da toplu taşıma programınıza göre randevu saatini birlikte belirleyebiliriz; WhatsApp'tan yazarak uygun saatleri sorabilirsiniz.",
  },
];

export default async function Page() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Kızılay Kaş Tasarımı",
          description:
            "Kızılay'a yakın, Çankaya'daki Stria Studio'da toplu taşımayla kolay ulaşılan, kıl tekniğiyle uygulanan kişiye özel kaş tasarımı hizmeti.",
          path: "/kizilay-kas-tasarimi",
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Kızılay Kaş Tasarımı", path: "/kizilay-kas-tasarimi" }]} />

      <Section>
        <h1 className="max-w-[820px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">
          Kızılay kaş tasarımı (Çankaya)
        </h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-relaxed text-muted2">
          Kızılay&apos;a yakın, Çankaya&apos;daki Stria Studio&apos;da kaş tasarımı yaptırabilirsiniz.
          Stüdyomuza metro veya otobüsle kolayca ulaşılır; form yüz hatlarınıza göre belirlenir,
          kıl tekniğiyle tek tek işlenir ve 12–18 ay kalıcı, doğal bir sonuç elde edilir.
        </p>
        <div className="mt-8">
          <CTAButtons settings={s} />
        </div>
      </Section>

      <Section eyebrow="Ulaşım" heading="Kızılay'dan ulaşım" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kızılay çevresinden gelen danışanlarımızın çoğu stüdyomuza toplu taşımayla ulaşır: Ankara
          metrosu veya şehir içi otobüs hatlarıyla Çankaya&apos;ya kısa bir yolculukla
          gelebilirsiniz. Aracınızla gelmeyi tercih ederseniz de stüdyo çevresinde otopark
          seçenekleri bulunur.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Güncel hat, durak ve yol tarifi bilgisini randevunuzu onaylarken WhatsApp&apos;tan
          paylaşırız; böylece hangi hatla geleceğinizi önceden netleştirebilirsiniz.
        </p>
      </Section>

      <Section eyebrow="Konum" heading="Stüdyo konumu">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Stria Studio, Ankara Çankaya&apos;da yer alır. Konumu aşağıdaki haritadan
          inceleyebilirsiniz; stüdyonun Çankaya&apos;daki yeri ve otopark bilgisi için{" "}
          <Link href="/cankaya-kas-tasarimi" className="text-accent-dark hover:underline">
            Çankaya kaş tasarımı
          </Link>{" "}
          sayfasına da bakabilirsiniz.
        </p>
        <div className="mt-6">
          <StudioMap settings={s} />
        </div>
      </Section>

      <Section eyebrow="Randevu" heading="Randevu" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Randevular WhatsApp veya telefonla, ücretsiz ön görüşme şeklinde planlanır. Kızılay
          çevresinden geliyorsanız randevu saatini toplu taşıma programınıza göre birlikte
          ayarlayabiliriz. Tüm iletişim kanalları için{" "}
          <Link href="/iletisim" className="text-accent-dark hover:underline">
            iletişim
          </Link>{" "}
          sayfasına bakabilirsiniz.
        </p>
      </Section>

      <Section eyebrow="S.S.S." heading="Kızılay kaş tasarımı hakkında sık sorulanlar" narrow>
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/cankaya-kas-tasarimi" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            Çankaya kaş tasarımı <ArrowIcon className="h-4 w-4" />
          </Link>
          <Link href="/iletisim" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            İletişim <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
