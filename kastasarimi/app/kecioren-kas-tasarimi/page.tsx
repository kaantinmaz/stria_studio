import type { Metadata } from "next";
import Link from "next/link";
import { getSettings, SETTINGS_FALLBACK } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/Section";
import { ImageSlot } from "@/components/ImageSlot";
import { StudioMap } from "@/components/StudioMap";
import { CTAButtons, CTABanner } from "@/components/CTA";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { serviceSchema, faqSchema } from "@/lib/schema";
import { ArrowIcon } from "@/components/Icons";

export const metadata: Metadata = buildMetadata({
  title: "Keçiören Kaş Tasarımı | Stria Studio Ankara",
  description:
    "Keçiören'den kaş tasarımı mı arıyorsunuz? Stria Studio, Çankaya'daki stüdyosunda kişiye özel, kalıcı kaş tasarımı uygular. Ulaşım ve randevu bilgisi.",
  path: "/kecioren-kas-tasarimi",
});

const faqs = [
  {
    q: "Keçiören'de kaş tasarımı stüdyonuz var mı?",
    a: "Stüdyomuz Ankara Çankaya'dadır; Keçiören'den gelen danışanlarımıza aynı stüdyoda hizmet veriyoruz. Keçiören'den metro ve ana ulaşım hatlarıyla Kızılay üzerinden stüdyomuza kolayca ulaşabilirsiniz.",
  },
  {
    q: "Keçiören'den ulaşım ne kadar sürer?",
    a: "Trafiğe bağlı olarak Keçiören merkezden stüdyomuza ulaşım genellikle 30–45 dakika sürer. Metroyla Kızılay'a inip kısa bir yolculukla stüdyoya ulaşmak en pratik yoldur.",
  },
  {
    q: "Tek seferde işlem tamamlanır mı, tekrar gelmem gerekir mi?",
    a: "İlk seans yaklaşık 90 dakika sürer. Kalıcılık ve netlik için 4–6 hafta sonra bir rötuş seansı önerilir; rötuş, paketlere dahildir.",
  },
  {
    q: "Randevuyu nasıl planlamalıyım?",
    a: "WhatsApp veya telefonla ulaşıp ücretsiz ön görüşme talep edin. Keçiören'den geleceğinizi belirtirseniz randevunuzu ulaşımınıza uygun bir saate planlarız.",
  },
];

export default async function Page() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Keçiören Kaş Tasarımı",
          description:
            "Keçiören'den gelen danışanlara, Stria Studio'nun Çankaya'daki stüdyosunda kıl tekniğiyle uygulanan kişiye özel kaş tasarımı hizmeti.",
          path: "/kecioren-kas-tasarimi",
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Keçiören Kaş Tasarımı", path: "/kecioren-kas-tasarimi" }]} />

      <Section>
        <h1 className="max-w-[820px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">
          Keçiören kaş tasarımı — Stria Studio
        </h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-relaxed text-muted2">
          Keçiören&apos;de kaş tasarımı arıyorsanız, Stria Studio Çankaya&apos;daki stüdyosunda
          Keçiören&apos;den gelen danışanlarına kişiye özel kaş tasarımı uygular. Form, yüz
          simetriniz ve altın oran ölçümüne göre belirlenir; her kıl tek tek işlenir ve sonuç
          12–18 ay kalıcıdır. Aşağıda ulaşım ve randevu bilgilerini bulabilirsiniz.
        </p>
        <ImageSlot
          src="/images/topics/kecioren-kas-tasarimi.png"
          alt="Keçiören'den gelen danışan için kişiye özel kaş ön çizimi"
          ratio="aspect-[16/9]"
          className="mt-8 rounded-[2px] border border-line"
        />
        <div className="mt-8">
          <CTAButtons settings={s} />
        </div>
      </Section>

      <Section eyebrow="Ulaşım" heading="Keçiören'den stüdyoya ulaşım" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Stüdyomuz Ankara Çankaya&apos;da, Kızılay&apos;a yakın ve kolay ulaşılabilir bir
          noktadadır. Keçiören&apos;den metroyla Kızılay&apos;a inip kısa bir yolculukla stüdyoya
          ulaşabilirsiniz; araçla gelenler için çevrede otopark seçenekleri bulunur. Randevunuzu
          onaylarken adım adım yol tarifini de paylaşırız. Açık adres için{" "}
          <Link href="/iletisim" className="text-accent-dark hover:underline">
            iletişim
          </Link>{" "}
          sayfasına bakabilirsiniz.
        </p>
        <div className="mt-6">
          <StudioMap settings={s} />
        </div>
      </Section>

      <Section eyebrow="Neden değer" heading="Keçiören'den gelmeye değer mi?">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kaş tasarımı 12–18 ay kalıcı bir uygulamadır; yılda bir kez yapılan bir yolculuk,
          uygulayıcı deneyimi ve hijyen standartları düşünüldüğünde sonucu belirleyen en önemli
          tercihtir. Stria Studio&apos;da her uygulama ücretsiz ön görüşme, altın oran ölçümü ve
          onayınızla başlar; tek kullanımlık steril ekipman kullanılır.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Güncel fiyat aralıkları için{" "}
          <Link href="/kas-tasarimi-fiyatlari" className="text-accent-dark hover:underline">
            kaş tasarımı fiyatları
          </Link>{" "}
          sayfasına, sürecin tamamı için{" "}
          <Link href="/kas-tasarimi-nasil-yapilir" className="text-accent-dark hover:underline">
            nasıl yapılır
          </Link>{" "}
          sayfasına göz atabilirsiniz.
        </p>
      </Section>

      <Section eyebrow="S.S.S." heading="Keçiören kaş tasarımı hakkında sık sorulanlar" narrow className="bg-blush/40">
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/cankaya-kas-tasarimi" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            Çankaya kaş tasarımı <ArrowIcon className="h-4 w-4" />
          </Link>
          <Link href="/kizilay-kas-tasarimi" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            Kızılay kaş tasarımı <ArrowIcon className="h-4 w-4" />
          </Link>
          <Link href="/yenimahalle-kas-tasarimi" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            Yenimahalle kaş tasarımı <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
