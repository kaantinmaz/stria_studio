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
  title: "Yenimahalle Kaş Tasarımı | Stria Studio Ankara",
  description:
    "Yenimahalle ve Batıkent'ten kaş tasarımı mı arıyorsunuz? Stria Studio, Çankaya'da kişiye özel, kalıcı kaş tasarımı uygular. Metro ile kolay ulaşım.",
  path: "/yenimahalle-kas-tasarimi",
});

const faqs = [
  {
    q: "Yenimahalle'de kaş tasarımı stüdyonuz var mı?",
    a: "Stüdyomuz Ankara Çankaya'dadır; Yenimahalle, Batıkent ve Demetevler çevresinden gelen danışanlarımıza aynı stüdyoda hizmet veriyoruz. Batıkent–Kızılay metro hattıyla aktarmasız Kızılay'a ulaşıp kısa bir yolculukla stüdyoya gelebilirsiniz.",
  },
  {
    q: "Batıkent'ten ulaşım ne kadar sürer?",
    a: "Batıkent–Kızılay metro hattıyla Kızılay'a yaklaşık 25–30 dakikada ulaşılır; oradan stüdyomuza kısa bir yolculuk kalır. Araçla ulaşım trafiğe bağlı olarak 30–45 dakika sürebilir.",
  },
  {
    q: "İlk seansta işlem biter mi?",
    a: "İlk seans yaklaşık 90 dakika sürer ve kaşlarınız aynı gün şekillenmiş olarak ayrılırsınız. Kalıcılık için 4–6 hafta sonra bir rötuş seansı yapılır; rötuş paketlere dahildir.",
  },
  {
    q: "Randevu nasıl alınır?",
    a: "WhatsApp veya telefonla ulaşıp ücretsiz ön görüşme talep edin. Yenimahalle tarafından geleceğinizi belirtirseniz randevunuzu ulaşımınıza uygun saate planlarız.",
  },
];

export default async function Page() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Yenimahalle Kaş Tasarımı",
          description:
            "Yenimahalle ve Batıkent çevresinden gelen danışanlara, Stria Studio'nun Çankaya'daki stüdyosunda kıl tekniğiyle uygulanan kişiye özel kaş tasarımı hizmeti.",
          path: "/yenimahalle-kas-tasarimi",
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Yenimahalle Kaş Tasarımı", path: "/yenimahalle-kas-tasarimi" }]} />

      <Section>
        <h1 className="max-w-[820px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">
          Yenimahalle kaş tasarımı — Stria Studio
        </h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-relaxed text-muted2">
          Yenimahalle, Batıkent veya Demetevler&apos;de kaş tasarımı arıyorsanız, Stria Studio
          Çankaya&apos;daki stüdyosunda bu bölgeden gelen danışanlarına kişiye özel kaş tasarımı
          uygular. Form, yüz simetriniz ve altın oran ölçümüne göre belirlenir; her kıl tek tek
          işlenir ve sonuç 12–18 ay kalıcıdır.
        </p>
        <div className="mt-8">
          <CTAButtons settings={s} />
        </div>
      </Section>

      <Section eyebrow="Ulaşım" heading="Yenimahalle ve Batıkent'ten stüdyoya ulaşım" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Batıkent–Kızılay metro hattı, Yenimahalle tarafından gelen danışanlarımız için en pratik
          yoldur: Kızılay&apos;a aktarmasız ulaşır, oradan kısa bir yolculukla stüdyoya
          gelirsiniz. Araçla gelecekler için çevrede otopark seçenekleri bulunur; randevu
          onayında adım adım yol tarifi paylaşırız. Açık adres için{" "}
          <Link href="/iletisim" className="text-accent-dark hover:underline">
            iletişim
          </Link>{" "}
          sayfasına bakabilirsiniz.
        </p>
        <div className="mt-6">
          <StudioMap settings={s} />
        </div>
      </Section>

      <Section eyebrow="Kişiye özel" heading="Neden Stria Studio?">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kaş tasarımında sonucu belirleyen, uygulayıcının deneyimi ve tasarım titizliğidir. Stria
          Studio&apos;da hazır şablon uygulanmaz: her danışan için form yeniden ölçülür, renk ten
          ve saç tonuna göre seçilir, onayınız alınmadan işleme geçilmez. Tek kullanımlık steril
          ekipman ve dermatolojik pigment kullanılır.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Güncel fiyatlar için{" "}
          <Link href="/kas-tasarimi-fiyatlari" className="text-accent-dark hover:underline">
            kaş tasarımı fiyatları
          </Link>
          , uygunluk koşulları için{" "}
          <Link href="/kas-tasarimi-kimlere-yapilmaz" className="text-accent-dark hover:underline">
            kimlere yapılmaz
          </Link>{" "}
          sayfalarına göz atabilirsiniz.
        </p>
      </Section>

      <Section eyebrow="S.S.S." heading="Yenimahalle kaş tasarımı hakkında sık sorulanlar" narrow className="bg-blush/40">
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/cankaya-kas-tasarimi" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            Çankaya kaş tasarımı <ArrowIcon className="h-4 w-4" />
          </Link>
          <Link href="/kizilay-kas-tasarimi" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            Kızılay kaş tasarımı <ArrowIcon className="h-4 w-4" />
          </Link>
          <Link href="/kecioren-kas-tasarimi" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            Keçiören kaş tasarımı <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
