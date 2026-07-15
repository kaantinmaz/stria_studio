import type { Metadata } from "next";
import Link from "next/link";
import { getSettings, SETTINGS_FALLBACK } from "@/lib/content";
import { LAST_UPDATED } from "@/lib/copy";
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
  title: "Kalıcı Kaş Ankara | Teknikler ve Fiyatlar",
  description:
    "Kalıcı kaş Ankara rehberi: mikroblading kıl tekniği ve kaş pudralama karşılaştırması, kalıcılık süreleri, güncel fiyat aralıkları ve doğru teknik seçimi. Stria Studio.",
  path: "/kalici-kas-ankara",
});

const faqs = [
  {
    q: "Kalıcı kaş gerçekten kalıcı mıdır?",
    a: "Tam anlamıyla kalıcı değil, uzun süre kalıcıdır. Pigment cildin üst katmanına işlendiği için zamanla açılır: mikroblading 12–18 ay, kaş pudralama 1–3 yıl korunur. Rengi ve dolgunluğu sürdürmek için periyodik yenileme önerilir; bu yönüyle daimi bir dövmeden farklıdır.",
  },
  {
    q: "Hangi kalıcı kaş tekniği daha doğal görünür?",
    a: "En doğal sonucu mikroblading (kıl tekniği) verir; her tel tek tek çizildiği için gerçek kaştan ayırt edilmesi zordur. Kaş pudralama ise hafif makyajlı, dolgun bir görünüm sunar. Doğru teknik cilt tipinize ve beklentinize göre ön görüşmede belirlenir.",
  },
  {
    q: "Teknikler arasındaki fiyat farkı neden var?",
    a: "Fiyat farkı uygulama süresine, kullanılan pigmente ve tekniğin gerektirdiği uzmanlığa bağlıdır. Mikroblading tek seans 4.500–6.500 ₺, kaş pudralama 5.000–7.500 ₺ aralığındadır. Kesin tutar kaş yapınız ve seans planınıza göre ücretsiz ön görüşmede netleşir.",
  },
  {
    q: "Kalıcı kaş kaç yıl gider?",
    a: "Kalıcılık tekniğe ve cilt yapısına göre değişir. Mikroblading ortalama 12–18 ay, kaş pudralama 1–3 yıl korunur. Yağlı ciltlerde ve güneşe çok maruz kalan kişilerde açılma daha hızlıdır; düzenli yenileme süreyi uzatır.",
  },
  {
    q: "Kalıcı kaş ile dövme kaşın farkı nedir?",
    a: "Dövme kaş pigmenti cildin derin katmanına işler; kalıcıdır, zamanla maviye/griye döner ve doğal görünmez. Kalıcı kaş teknikleri (mikroblading, pudralama) yüzeye işlenir; yarı kalıcıdır, doğal tonda açılır ve zamanla güncellenebilir. Bu yüzden bugün dövme yerine tercih edilir.",
  },
];

export default async function KaliciKasAnkaraPage() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Kalıcı Kaş Ankara",
          description:
            "Ankara'da mikroblading kıl tekniği ve kaş pudralama gibi kalıcı kaş uygulamaları; teknik karşılaştırması, kalıcılık ve fiyat bilgisiyle doğru seçim.",
          path: "/kalici-kas-ankara",
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Kalıcı Kaş Ankara", path: "/kalici-kas-ankara" }]} />

      <Section>
        <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-accent">Son güncelleme: {LAST_UPDATED}</p>
        <h1 className="max-w-[860px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">
          Kalıcı Kaş Ankara — Teknikler, Fiyatlar ve Doğru Seçim
        </h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-relaxed text-muted2">
          Kalıcı kaş, pigmentin cildin üst katmanına işlenerek kaşların uzun süre dolgun ve
          simetrik göründüğü yarı kalıcı bir işlemdir. Ankara&apos;da en çok tercih edilen iki
          teknik mikroblading (kıl tekniği) ve kaş pudralamadır; her tel çizilir ya da yumuşak
          gölge verilir. Sonuç makyajsız, bakımlı kaşlardır ve tekniğe göre 12 ay–3 yıl kalır.
        </p>
        <ImageSlot
          src="/images/topics/kalici-kas-ankara.png"
          alt="Kalıcı kaş Ankara — mikroblading ve pudralama teknikleri"
          ratio="aspect-[16/9]"
          className="mt-8 max-w-[920px] rounded-[24px] border border-line bg-blush"
        />
        <div className="mt-8"><CTAButtons settings={s} /></div>
      </Section>

      <Section eyebrow="Teknikler" heading="Ankara'da hangi kalıcı kaş teknikleri var?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Stria Studio&apos;da iki temel teknik uygulanır. Doğru seçim cilt tipinize, kaş
          yoğunluğunuza ve istediğiniz görünüme bağlıdır; ikisi de ön görüşmede değerlendirilir.
        </p>
        <ul className="mt-6 max-w-[720px] space-y-4 text-[17px] leading-relaxed text-muted2">
          <li>
            <strong className="text-ink">Mikroblading (kıl tekniği):</strong> İnce kalem ucuyla
            her kıl tek tek çizilir; en doğal görünümü verir. Normal ve kuru ciltli, kaşları seyrek
            ya da düzensiz olan kişiler için idealdir. Kalıcılık 12–18 aydır.
          </li>
          <li>
            <strong className="text-ink">Kaş pudralama (powder brows):</strong> Cilde yumuşak,
            makyajlı gölge etkisi verilir. Yağlı ve geniş gözenekli ciltlerde mikroblading&apos;e
            göre daha iyi tutar; dolgun görünüm isteyenlere uygundur. Kalıcılık 1–3 yıldır.
          </li>
        </ul>
        <p className="mt-6 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          İki teknik arasındaki farkı ayrıntılı karşılaştıran{" "}
          <Link href="/mikroblading-mi-kas-pudralama-mi" className="text-accent-dark hover:underline">mikroblading mi kaş pudralama mı</Link>{" "}
          rehberini ve{" "}
          <Link href="/kas-pudralama-ankara" className="text-accent-dark hover:underline">kaş pudralama Ankara</Link>{" "}
          sayfasını inceleyebilirsiniz.
        </p>
      </Section>

      <Section eyebrow="Kalıcılık" heading="Kalıcı kaş ne kadar süre kalır?">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kalıcılık seçilen tekniğe ve cilt yapısına göre değişir. Mikroblading kıl tekniği
          ortalama 12–18 ay, kaş pudralama ise 1–3 yıl korunur. Pigment cildin üst katmanında
          olduğu için zamanla doğal tonda açılır; yağlı ciltlerde ve yoğun güneş maruziyetinde
          açılma daha hızlı olur. İlk uygulamadan 4–6 hafta sonra yapılan rötuşla renk sabitlenir.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Uygulamanın adımlarını ve iyileşme sürecini{" "}
          <Link href="/mikroblading-nasil-yapilir" className="text-accent-dark hover:underline">mikroblading nasıl yapılır</Link>{" "}
          rehberinde bulabilirsiniz.
        </p>
      </Section>

      <Section eyebrow="Fiyatlar" heading="Ankara'da kalıcı kaş fiyatları ne kadar?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Ankara&apos;da kalıcı kaş fiyatları tekniğe, kullanılan pigmente ve uygulayıcının
          deneyimine göre değişir. Stria Studio&apos;daki güncel aralıklar aşağıdadır; tüm
          paketlere yüz analizi, tasarım ve steril ekipman dahildir. Kesin tutar ücretsiz ön
          görüşmede netleşir.
        </p>
        <ul className="mt-6 max-w-[720px] space-y-3 text-[17px] leading-relaxed text-muted2">
          <li><strong className="text-ink">Mikroblading (tek seans):</strong> 4.500 – 6.500 ₺</li>
          <li><strong className="text-ink">Mikroblading + rötuş paketi:</strong> 6.000 – 8.500 ₺ (4–6 hafta sonra rötuş dahil)</li>
          <li><strong className="text-ink">Kaş pudralama (powder brows):</strong> 5.000 – 7.500 ₺</li>
          <li><strong className="text-ink">Yıllık yenileme:</strong> 2.500 – 4.000 ₺</li>
        </ul>
        <p className="mt-6 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Güncel ve tam liste için yalnızca{" "}
          <Link href="/mikroblading-fiyatlari" className="text-accent-dark hover:underline">mikroblading fiyatları</Link>{" "}
          sayfasını esas alın.
        </p>
      </Section>

      <Section eyebrow="Seçim" heading="Doğru kalıcı kaş tekniği nasıl seçilir?">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Doğru teknik cilt tipinize, mevcut kaş yoğunluğunuza ve istediğiniz görünüme göre
          belirlenir. Ücretsiz ön görüşmede cildiniz analiz edilir, yüz hatlarınıza uygun kaş
          tasarımı çizilir ve mikroblading ile pudralama arasından size en uygun yöntem birlikte
          seçilir. Sağlık geçmişiniz de bu görüşmede değerlendirilir.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Hamilelik, emzirme, kan sulandırıcı kullanımı, keloid eğilimi, kontrolsüz diyabet ve
          aktif cilt hastalığı gibi durumlar uygulamaya engel olabilir; bu koşullar güvenliğiniz
          için ön görüşmede ayrıntılı biçimde değerlendirilir.
        </p>
      </Section>

      <Section eyebrow="S.S.S." heading="Kalıcı kaş hakkında en çok sorulanlar" narrow>
        <p className="mb-8 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kalıcı kaş yaptırmayı düşünenlerin en sık sorduğu konular kalıcılık süresi, teknikler
          arasındaki fark, fiyat ve dövme kaştan ayrımıdır. Aşağıdaki kısa yanıtlar temel bilgiyi
          verir; kişisel uygunluk ve kesin plan için stüdyoyla doğrudan görüşmek gerekir.
        </p>
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Mikroblading Ankara <ArrowIcon className="h-4 w-4" /></Link>
          <Link href="/sss" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Tüm S.S.S. <ArrowIcon className="h-4 w-4" /></Link>
          <Link href="/iletisim" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">İletişim <ArrowIcon className="h-4 w-4" /></Link>
        </div>
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
