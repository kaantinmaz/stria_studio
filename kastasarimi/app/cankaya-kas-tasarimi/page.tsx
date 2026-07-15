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
  title: "Çankaya Kaş Tasarımı | Stria Studio Ankara",
  description:
    "Stria Studio, Ankara Çankaya'da kaş tasarımı hizmeti verir. Kişiye özel form, kıl tekniğiyle tek tek işleme, 12–18 ay kalıcı sonuç. Konum, ulaşım ve randevu bilgisi.",
  path: "/cankaya-kas-tasarimi",
});

const faqs = [
  {
    q: "Stria Studio Çankaya'nın neresinde yer alıyor?",
    a: "Stüdyomuz Ankara Çankaya sınırları içinde, kolay ulaşılabilir bir konumdadır. Tam adres ve harita üzerinden yol tarifi için aşağıdaki konum bölümünü veya iletişim sayfamızı kullanabilirsiniz.",
  },
  {
    q: "Otopark imkanı var mı?",
    a: "Evet, stüdyo çevresinde araçla gelen danışanlarımız için otopark seçenekleri bulunur. Randevunuzu onaylarken size en uygun park alanını da paylaşırız.",
  },
  {
    q: "Randevu almadan stüdyoya gelebilir miyim?",
    a: "Uygulamalar tek danışanlık olarak, önceden belirlenen saatte planlanır. Bu yüzden önce WhatsApp veya telefonla ulaşıp ücretsiz ön görüşme talep etmeniz gerekir.",
  },
  {
    q: "Çankaya dışından gelen danışanlar kabul ediliyor mu?",
    a: "Evet, Ankara'nın her semtinden danışan kabul ediyoruz. Kızılay çevresinden geliyorsanız ulaşım bilgisi için Kızılay kaş tasarımı sayfasına bakabilirsiniz.",
  },
];

export default async function Page() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Çankaya Kaş Tasarımı",
          description:
            "Ankara Çankaya'da, Stria Studio'nun kendi stüdyosunda verilen, kıl tekniğiyle uygulanan kişiye özel kaş tasarımı hizmeti.",
          path: "/cankaya-kas-tasarimi",
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Çankaya Kaş Tasarımı", path: "/cankaya-kas-tasarimi" }]} />

      <Section>
        <h1 className="max-w-[820px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">
          Çankaya kaş tasarımı — Stria Studio
        </h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-relaxed text-muted2">
          Stria Studio, Ankara Çankaya&apos;da kaş tasarımı hizmeti sunar. Danışanlarımızı kendi
          stüdyomuzda karşılıyor, yüz hatlarınıza göre belirlenen formu kıl tekniğiyle tek tek
          işleyerek 12–18 ay kalıcı, doğal bir sonuç elde ediyoruz. Aşağıda konum, ulaşım ve
          randevu bilgilerini bulabilirsiniz.
        </p>
        <ImageSlot
          src="/images/topics/cankaya-kas-tasarimi.png"
          alt="Çankaya Stria Studio'da yüz hatlarına özel kaş tasarımı"
          ratio="aspect-[16/9]"
          className="mt-8 rounded-[2px] border border-line"
        />
        <div className="mt-8">
          <CTAButtons settings={s} />
        </div>
      </Section>

      <Section eyebrow="Konum" heading="Konum ve ulaşım" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Stüdyomuz Ankara Çankaya&apos;da, kolay ulaşılabilir bir noktada yer alır. Aşağıdaki
          haritadan konumu inceleyebilir, yol tarifi alabilirsiniz; açık adres ve detaylı yol
          tarifi için{" "}
          <Link href="/iletisim" className="text-accent-dark hover:underline">
            iletişim
          </Link>{" "}
          sayfamıza da göz atabilirsiniz. Araçla gelecek danışanlarımız için çevrede otopark
          seçenekleri bulunur; randevunuzu onaylarken size en uygun park alanını da paylaşırız.
        </p>
        <div className="mt-6">
          <StudioMap settings={s} />
        </div>
      </Section>

      <Section eyebrow="Kişiye özel" heading="Çankaya'da kişiye özel kaş tasarımı">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Her danışan için kaş formu, yüz simetrisi ve altın oran ölçümüne göre yeniden çizilir;
          hazır bir şablon uygulanmaz. Çankaya&apos;daki stüdyomuzda ön görüşme, ölçüm ve onay
          adımlarının tamamı yüz yüze yapılır; uygulamaya yalnızca siz onayladıktan sonra geçilir.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Fiyat aralığı ve seans süresi için{" "}
          <Link href="/kas-tasarimi-fiyatlari" className="text-accent-dark hover:underline">
            kaş tasarımı fiyatları
          </Link>{" "}
          sayfasına bakabilirsiniz.
        </p>
      </Section>

      <Section eyebrow="Randevu" heading="Randevu" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Randevular WhatsApp veya telefonla, ücretsiz ön görüşme şeklinde planlanır. Ön
          görüşmede uygunluğunuz değerlendirilir, form birlikte belirlenir; uygulama günü ayrıca
          planlanır. Kızılay çevresinden geliyorsanız, ulaşım bilgisi için{" "}
          <Link href="/kizilay-kas-tasarimi" className="text-accent-dark hover:underline">
            Kızılay kaş tasarımı
          </Link>{" "}
          sayfasına bakabilirsiniz.
        </p>
      </Section>

      <Section eyebrow="S.S.S." heading="Çankaya kaş tasarımı hakkında sık sorulanlar" narrow>
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/iletisim" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            İletişim <ArrowIcon className="h-4 w-4" />
          </Link>
          <Link href="/kas-tasarimi-fiyatlari" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            Fiyatlar <ArrowIcon className="h-4 w-4" />
          </Link>
          <Link href="/kizilay-kas-tasarimi" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            Kızılay kaş tasarımı <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
