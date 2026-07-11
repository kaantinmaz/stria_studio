import type { Metadata } from "next";
import Link from "next/link";
import { getSettings, SETTINGS_FALLBACK } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/Section";
import { CTAButtons, CTABanner } from "@/components/CTA";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { faqSchema } from "@/lib/schema";
import { ArrowIcon } from "@/components/Icons";

export const metadata: Metadata = buildMetadata({
  title: "Kaş Tasarımı Kalıcı mı? Ne Kadar Kalıcı? | Ankara",
  description:
    "Kaş tasarımı kalıcı mıdır, ne kadar sürer? Kıl tekniğiyle işlenen kaş formu 12–18 ay kalıcıdır; cilt tipi, güneş ve bakıma göre değişir. Ankara Stria Studio.",
  path: "/kas-tasarimi-kalici-mi",
});

const faqs = [
  {
    q: "Kaş tasarımı kaç ay kalıcıdır?",
    a: "Ortalama 12–18 ay kalıcıdır. Kesin süre cilt tipinize, güneş maruziyetinize ve cilt bakım rutininize göre değişir.",
  },
  {
    q: "Cilt tipi kalıcılığı nasıl etkiler?",
    a: "Yağlı ve gözenekli ciltlerde hücre yenilenmesi daha hızlı olduğu için renk ortalamadan erken açılabilir. Kuru ve normal ciltlerde ise daha uzun süre canlı kalır.",
  },
  {
    q: "Güneş kaş tasarımının kalıcılığını azaltır mı?",
    a: "Evet, yoğun ve korunmasız güneş maruziyeti rengin solmasını hızlandırabilir. Bölgeye güneş kremi uygulamanızı öneririz.",
  },
  {
    q: "Renk zamanla tamamen kaybolur mu?",
    a: "Hayır, genellikle iz bırakmadan tamamen kaybolmaz; yıllar içinde tonu açılır ve netliği azalır. Görünümü korumak için yenileme seansı önerilir.",
  },
  {
    q: "Yıllık yenileme seansı şart mıdır?",
    a: "Zorunlu değildir. Kaşların ilk günkü netliğini ve rengini korumak isteyenler için önerilir; yaptırılmazsa kaş yalnızca doğal biçimde soluklaşmaya devam eder.",
  },
];

export default async function Page() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Kaş Tasarımı Kalıcı mı", path: "/kas-tasarimi-kalici-mi" }]} />

      <Section>
        <h1 className="max-w-[820px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">
          Kaş tasarımı kalıcı mı? Ne kadar dayanır?
        </h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-relaxed text-muted2">
          Evet, kaş tasarımı kalıcıdır. Kıl tekniğiyle tek tek işlenen renk cilde yerleşir ve cilt
          tipine bağlı olarak 12–18 ay boyunca canlılığını korur. Bu süre sabit değildir; güneşe
          maruziyet, cilt yenilenme hızı ve bakım alışkanlıkları kalıcılığı kısaltıp uzatabilir.
          Görünümü tazelemek için yılda bir yenileme seansı önerilir.
        </p>
        <div className="mt-8">
          <CTAButtons settings={s} />
        </div>
      </Section>

      <Section eyebrow="Kalıcılık" heading="Kalıcılığı ne etkiler?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kalıcılık süresi kişiden kişiye değişir; en belirleyici üç etken cilt tipi, güneşe
          maruziyet ve cilt bakım rutinidir. Yağlı ve gözenekli ciltlerde hücre yenilenmesi daha
          hızlı olduğu için renk ortalamadan erken açılabilir; kuru ve normal ciltlerde daha uzun
          süre canlı kalır.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Bölgeye yönelik peeling, kimyasal soyma ya da yoğun cilt bakım aktifleri de kalıcılığı
          kısaltabilir. Doğru bakım uygulandığında sonuç daha uzun süre korunur; ayrıntılar için{" "}
          <Link href="/kas-tasarimi-bakimi" className="text-accent-dark hover:underline">
            kaş tasarımı bakımı
          </Link>{" "}
          sayfasına bakabilirsiniz.
        </p>
      </Section>

      <Section eyebrow="Yenileme" heading="Yenileme ne zaman yapılır?">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          İlk uygulamadan 4–6 hafta sonra yapılan rötuş, renk ve çizgileri netleştirerek ilk seansı
          tamamlar; bu, kalıcılığı uzatan ayrı bir adım değil, sürecin bir parçasıdır.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Bunun dışında, kaşların ilk günkü canlılığını korumak isteyenler için yılda bir kez
          yenileme seansı yeterlidir. Yenileme yaptırmazsanız kaş tasarımı aniden kaybolmaz;
          yalnızca zamanla daha doğal ve soluk bir tona döner.
        </p>
      </Section>

      <Section eyebrow="Süreç" heading="Kaş tasarımı neden zamanla açılır?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kıl tekniğiyle işlenen renk cildin üst katmanına yerleşir. Cilt kendini sürekli yenileyen
          bir organdır; zamanla eski hücrelerle birlikte rengin bir kısmı da yüzeye taşınıp
          dökülür. Bu, beklenen ve normal bir süreçtir; bir hata ya da uygulama sorunu anlamına
          gelmez.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Süreç yavaş ilerlediği için açılma ilk aylarda fark edilmez, genellikle 12. aydan sonra
          belirginleşir. Kaş tasarımının ne olduğunu ve nasıl uygulandığını{" "}
          <Link href="/kas-tasarimi-nedir" className="text-accent-dark hover:underline">
            kaş tasarımı nedir
          </Link>{" "}
          sayfasında okuyabilirsiniz.
        </p>
      </Section>

      <Section eyebrow="S.S.S." heading="Kalıcılık hakkında sık sorulanlar" narrow>
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/kas-tasarimi-nedir" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            Kaş tasarımı nedir? <ArrowIcon className="h-4 w-4" />
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
