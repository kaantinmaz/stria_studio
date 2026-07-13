import type { Metadata } from "next";
import Link from "next/link";
import { getSettings, SETTINGS_FALLBACK } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/Section";
import { CTAButtons, CTABanner } from "@/components/CTA";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { serviceSchema, faqSchema } from "@/lib/schema";
import { ArrowIcon } from "@/components/Icons";

export const metadata: Metadata = buildMetadata({
  title: "Kaş Tasarımı Nedir? Kıl Tekniği ve Altın Oran | Ankara",
  description:
    "Kaş tasarımı nedir? Yüz simetrisi ve altın oranla belirlenen kaş formunun kıl tekniğiyle uygulanmasını, doğal görünümü ve kalıcılığını öğrenin.",
  path: "/kas-tasarimi-nedir",
});

const faqs = [
  {
    q: "Kaş tasarımı nedir?",
    a: "Kaş tasarımı, yüz simetrisi ve altın oran ölçümüne göre kişiye özel belirlenen kaş formunun, kıl tekniğiyle tek tek işlenerek kalıcı hale getirilmesidir. Sonuç doğal görünür ve 12–18 ay kalıcıdır.",
  },
  {
    q: "Kaş tasarımı kimler için uygundur?",
    a: "Kaşları seyrek, açık renkli, asimetrik veya şekilsiz olan; makyajsız da dolgun ve bakımlı kaş isteyen herkes için uygundur. Uygunluk ücretsiz ön görüşmede değerlendirilir.",
  },
  {
    q: "Kaş tasarımı doğal görünür mü?",
    a: "Evet. Blok dolgu yerine her kıl tek tek çizildiği için, gerçek kaştan ayırt edilemeyecek kadar doğal bir görünüm elde edilir.",
  },
  {
    q: "Kaş formu nasıl belirlenir?",
    a: "Form; yüz hatlarınıza ve altın oran ölçümüne göre çizilir, başlangıç, kemer ve bitiş noktaları yüzünüze göre işaretlenir. Onayınız olmadan işleme geçilmez.",
  },
  {
    q: "Kaş tasarımı ne kadar kalıcıdır?",
    a: "Cilt tipine bağlı olarak 12–18 ay kalıcıdır. Yıllık yenileme seansıyla görünüm korunur.",
  },
];

export default async function Page() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Kaş Tasarımı Ankara",
          description: faqs[0].a,
          path: "/kas-tasarimi-nedir",
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Kaş Tasarımı Nedir", path: "/kas-tasarimi-nedir" }]} />

      <Section>
        <h1 className="max-w-[820px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">
          Kaş tasarımı nedir?
        </h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-relaxed text-muted2">
          Kaş tasarımı, yüz simetrisi ve altın oran ölçümüne göre kişiye özel belirlenen kaş
          formunun, kıl tekniğiyle tek tek işlenerek kalıcı hale getirilmesidir. Ankara
          Çankaya&apos;daki Stria Studio&apos;da her kıl gerçek kaştan ayırt edilemeyecek kadar
          doğal çizilir; sonuç 12–18 ay kalıcıdır ve günlük kaş makyajına gerek bırakmaz.
        </p>
        <div className="mt-8">
          <CTAButtons settings={s} />
        </div>
      </Section>

      <Section eyebrow="Form" heading="Kaş formu nasıl belirlenir?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Tasarım, ölçüyle başlar. Yüz simetriniz ve altın oran referans alınarak kaşın başlangıç,
          kemer (en yüksek nokta) ve bitiş noktaları yüzünüze göre işaretlenir. Renk; saç ve ten
          tonunuza göre seçilir. Form ve renk onayınız alınmadan uygulamaya geçilmez.
        </p>
      </Section>

      <Section eyebrow="Kimler için" heading="Kaş tasarımı kimler için uygundur?">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kaşları seyrek, boşluklu, açık renkli, asimetrik ya da şekilsiz olan; makyajsız da dolgun
          ve bakımlı bir kaş isteyen herkes için uygundur.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kaşlarınız çok seyrekse{" "}
          <Link href="/seyrek-kaslar-kas-tasarimi" className="text-accent-dark hover:underline">
            seyrek kaşlar için kaş tasarımı
          </Link>
          , erkekseniz{" "}
          <Link href="/erkek-kas-tasarimi-ankara" className="text-accent-dark hover:underline">
            erkek kaş tasarımı
          </Link>{" "}
          sayfasına da göz atabilirsiniz.
        </p>
      </Section>

      <Section eyebrow="Kalıcılık" heading="Sonuç ne kadar kalıcı?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kaş tasarımı cilt tipine bağlı olarak 12–18 ay kalıcıdır; yıllık yenileme ile görünüm
          korunur. Ayrıntı için{" "}
          <Link href="/kas-tasarimi-kalici-mi" className="text-accent-dark hover:underline">
            kaş tasarımı kalıcı mı
          </Link>{" "}
          sayfasına bakın.
        </p>
      </Section>

      <Section eyebrow="S.S.S." heading="Kaş tasarımı hakkında sık sorulanlar" narrow>
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/kas-tasarimi-nasil-yapilir" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            Nasıl yapılır? <ArrowIcon className="h-4 w-4" />
          </Link>
          <Link href="/kas-tasarimi-fiyatlari" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            Fiyatlar <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
