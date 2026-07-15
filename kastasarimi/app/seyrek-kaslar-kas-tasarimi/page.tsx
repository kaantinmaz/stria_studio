import type { Metadata } from "next";
import Link from "next/link";
import { getSettings, SETTINGS_FALLBACK } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/Section";
import { ImageSlot } from "@/components/ImageSlot";
import { CTAButtons, CTABanner } from "@/components/CTA";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { serviceSchema, faqSchema } from "@/lib/schema";
import { ArrowIcon } from "@/components/Icons";

export const metadata: Metadata = buildMetadata({
  title: "Seyrek ve Dökük Kaşlar İçin Kaş Tasarımı | Ankara",
  description:
    "Seyrek, boşluklu veya açık renkli kaşlarda her kıl tek tek işlenerek boşluklar doğal biçimde doldurulur. Ankara Çankaya, Stria Studio.",
  path: "/seyrek-kaslar-kas-tasarimi",
});

const faqs = [
  {
    q: "Kaşlarım çok seyrekse kaş tasarımı yapılabilir mi?",
    a: "Evet. Seyreklik derecesi ne olursa olsun, ücretsiz ön görüşmede mevcut kıllarınız değerlendirilir ve form buna göre planlanır. Seyreklik işlemi engellemez, tasarımı şekillendirir.",
  },
  {
    q: "Kaşımda kıl hiç olmayan boş bölgeler var, sonuç doğal olur mu?",
    a: "Evet. Boş bölgelerde her kıl tek tek, kaşın doğal büyüme yönü ve açısı taklit edilerek çizilir. Amaç mevcut kılları tamamlamak, üzerine yapay bir form bindirmek değildir.",
  },
  {
    q: "Açık renkli (sarışın, kumral) kaşlarda ton nasıl belirlenir?",
    a: "Renk; saç ve ten tonunuza göre seçilir, genellikle mevcut kaş renginden bir ton açık tutulur. Amaç, açık renkli kılların arasındaki boşluğu belirginleştirmeden doldurmaktır.",
  },
  {
    q: "Seyrek kaşlarda kalıcılık süresi farklı mıdır?",
    a: "Hayır, süreç aynıdır: cilt tipine bağlı olarak ortalama 12–18 ay kalıcıdır. Ayrıntı için kaş tasarımı kalıcı mı sayfasına bakabilirsiniz.",
  },
];

export default async function Page() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Seyrek Kaşlar İçin Kaş Tasarımı",
          description: faqs[1].a,
          path: "/seyrek-kaslar-kas-tasarimi",
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Seyrek Kaşlar İçin Kaş Tasarımı", path: "/seyrek-kaslar-kas-tasarimi" }]} />

      <Section>
        <h1 className="max-w-[820px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">
          Seyrek ve dökük kaşlar için kaş tasarımı
        </h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-relaxed text-muted2">
          Seyrek, boşluklu veya açık renkli kaşlarda her kıl tek tek işlenerek boşluklar doğal
          biçimde doldurulur. Ankara Çankaya&apos;daki Stria Studio&apos;da form mevcut kıllarınıza
          uyumlu çizilir; sonuç makyajsız da dolgun görünür ve kıl tekniğiyle 12–18 ay kalıcıdır.
        </p>
        <ImageSlot
          src="/images/topics/seyrek-kaslar-kas-tasarimi.png"
          alt="Seyrek kaş boşluklarının doğal kıl çizgileriyle tamamlanması"
          ratio="aspect-[16/9]"
          className="mt-8 rounded-[2px] border border-line"
        />
        <div className="mt-8">
          <CTAButtons settings={s} />
        </div>
      </Section>

      <Section eyebrow="Uygunluk" heading="Kimler için uygun?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Doğuştan seyrek kaşlı olanlar, yaşla birlikte kaşları incelenler ya da bir bölgesi hiç
          kıl taşımayan boşluklu kaşlara sahip olanlar için uygundur. Uygunluk, ücretsiz ön
          görüşmede mevcut kıl yoğunluğunuza göre değerlendirilir.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Tasarımın genel mantığı için{" "}
          <Link href="/kas-tasarimi-nedir" className="text-accent-dark hover:underline">
            kaş tasarımı nedir
          </Link>{" "}
          sayfasına bakabilirsiniz.
        </p>
      </Section>

      <Section eyebrow="Teknik" heading="Boşluklar nasıl doldurulur?">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Öncelikle mevcut kıllarınızın yönü ve açısı incelenir. Boş kalan bölgelere, bu yönü takip
          eden yeni kıl çizgileri tek tek eklenir; mevcut kıllarla yeni çizgiler arasında görünür
          bir sınır kalmaz. Sonuç, blok bir dolgu değil, kaşın kendi devamı gibi görünür.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Uygulama adımlarının tamamı için{" "}
          <Link href="/kas-tasarimi-nasil-yapilir" className="text-accent-dark hover:underline">
            kaş tasarımı nasıl yapılır
          </Link>{" "}
          sayfasına bakabilirsiniz.
        </p>
      </Section>

      <Section eyebrow="Renk" heading="Açık renkli / az kıllı kaşlar" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Açık renkli veya çok az kıllı kaşlarda, kıl azlığı kadar rengin görünürlüğü de önemlidir.
          Ton; saç ve ten renginize göre seçilir, genellikle kaşın kendi renginden hafif açık
          tutularak sert bir kontrast oluşması engellenir.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          İşlem sonrası bölgeyi korumak için{" "}
          <Link href="/kas-tasarimi-bakimi" className="text-accent-dark hover:underline">
            kaş tasarımı bakımı
          </Link>{" "}
          rehberini takip edin.
        </p>
      </Section>

      <Section eyebrow="S.S.S." heading="Seyrek kaşlar hakkında sık sorulanlar" narrow>
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/kas-tasarimi-nasil-yapilir" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            Nasıl yapılır? <ArrowIcon className="h-4 w-4" />
          </Link>
          <Link href="/kas-tasarimi-bakimi" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            Bakım rehberi <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
