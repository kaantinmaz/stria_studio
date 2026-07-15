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
  title: "Kaş Kontürü Ankara | Kalıcı Kaş Kontürü Rehberi",
  description:
    "Kaş kontürü Ankara rehberi: kalıcı kaş kontürü nedir, hangi teknikle (mikroblading/pudralama) yapılır, kaş laminasyonu ve boyamadan farkı, güncel fiyatlar. Stria Studio.",
  path: "/kas-konturu-ankara",
});

const faqs = [
  {
    q: "Kaş kontürü kalıcı mı?",
    a: "Kaş kontürü kalıcı makyaj teknikleriyle yapıldığında yarı kalıcıdır. Pigment cildin üst katmanına işlendiği için zamanla açılır: mikroblading ile 12–18 ay, kaş pudralama ile 1–3 yıl korunur. Rengi ve çerçeveyi sürdürmek için periyodik yenileme önerilir.",
  },
  {
    q: "Kaş kontürü mikroblading ile aynı şey mi?",
    a: "Tam olarak değil. Kaş kontürü, kaşın çerçevesini belirginleştirmenin genel adıdır; mikroblading ise bunu sağlayan bir tekniktir. Kontür mikroblading (kıl kıl) veya kaş pudralama (gölge) ile yapılabilir. Yani mikroblading kaş kontürünün yöntemlerinden biridir.",
  },
  {
    q: "Kaş kontürü ne kadar sürer?",
    a: "Tek seans uygulama tasarım dahil yaklaşık 90 dakika sürer. İlk seansta kaş çerçevesi çizilir ve pigment işlenir; 4–6 hafta sonra rengin oturması için kısa bir rötuş seansı yapılır. İyileşme genelde 7–10 günde tamamlanır.",
  },
  {
    q: "Kaş kontürü fiyatı ne kadar?",
    a: "Ankara'da kaş kontürü fiyatı seçilen tekniğe göre değişir. Mikroblading tek seans 4.500–6.500 ₺, rötuş dahil paket 6.000–8.500 ₺, kaş pudralama ise 5.000–7.500 ₺ aralığındadır. Kesin tutar kaş yapınıza göre ücretsiz ön görüşmede netleşir.",
  },
  {
    q: "Kaş kontürü kimlere uygun değildir?",
    a: "Hamilelik, emzirme, kan sulandırıcı kullanımı, keloid eğilimi, kontrolsüz diyabet ve uygulama bölgesinde aktif cilt hastalığı olanlar için kaş kontürü önerilmez. Bu durumlar güvenliğiniz için ön görüşmede ayrıntılı biçimde değerlendirilir.",
  },
];

export default async function KasKonturuAnkaraPage() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Kaş Kontürü Ankara",
          description:
            "Ankara'da kalıcı kaş kontürü uygulaması; mikroblading kıl tekniği ve kaş pudralama ile kaş çerçevesini belirginleştirme, teknik seçimi ve fiyat bilgisi.",
          path: "/kas-konturu-ankara",
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Kaş Kontürü Ankara", path: "/kas-konturu-ankara" }]} />

      <Section>
        <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-accent">Son güncelleme: {LAST_UPDATED}</p>
        <h1 className="max-w-[860px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">
          Kaş Kontürü Ankara — Kalıcı Kaş Kontürü Rehberi
        </h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-relaxed text-muted2">
          Halk arasında &quot;kaş kontürü&quot; denen işlem, kalıcı makyaj teknikleriyle kaşın
          çerçevesini belirginleştirmektir. Kontür, kıl kıl doğal çizgi veren mikrobladingle ya da
          dolgun gölge etkisi bırakan kaş pudralamayla yapılır. Amaç, boşlukları kapatıp kaşa
          simetrik ve bakımlı bir çerçeve kazandırmaktır.
        </p>
        <ImageSlot
          src="/images/topics/kas-konturu-ankara.png"
          alt="Kaş kontürü Ankara — yüz hatlarına uygun kalıcı kaş tasarımı"
          ratio="aspect-[16/9]"
          className="mt-8 max-w-[920px] rounded-[24px] border border-line bg-blush"
        />
        <div className="mt-8"><CTAButtons settings={s} /></div>
      </Section>

      <Section eyebrow="Teknik" heading="Kaş kontürü hangi teknikle yapılır?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kaş kontürü tek bir işlem değil, iki farklı teknikle elde edilebilen bir sonuçtur. Doğru
          yöntem cilt tipinize ve istediğiniz görünüme göre ön görüşmede seçilir.
        </p>
        <ul className="mt-6 max-w-[720px] space-y-4 text-[17px] leading-relaxed text-muted2">
          <li>
            <strong className="text-ink">Mikroblading (kıl kıl kontür):</strong> Her tel tek tek
            çizilerek doğal bir çerçeve oluşturulur. Kaşları seyrek veya düzensiz, normal ve kuru
            ciltli kişiler için idealdir; makyajsız, gerçekçi bir kontür verir. Kalıcılık 12–18 ay.
          </li>
          <li>
            <strong className="text-ink">Kaş pudralama (dolgun kontür):</strong> Cilde yumuşak,
            makyajlı gölge etkisiyle dolgun bir çerçeve kazandırır. Yağlı ve geniş gözenekli
            ciltlerde daha iyi tutar; belirgin görünüm isteyenlere uygundur. Kalıcılık 1–3 yıl.
          </li>
        </ul>
        <p className="mt-6 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          İki tekniği ayrıntılı karşılaştıran{" "}
          <Link href="/mikroblading-mi-kas-pudralama-mi" className="text-accent-dark hover:underline">mikroblading mi kaş pudralama mı</Link>{" "}
          rehberini ve kalıcı seçenekleri toplu ele alan{" "}
          <Link href="/kalici-kas-ankara" className="text-accent-dark hover:underline">kalıcı kaş Ankara</Link>{" "}
          sayfasını inceleyebilirsiniz.
        </p>
      </Section>

      <Section eyebrow="Fark" heading="Kalıcı kaş kontürü ile kaş laminasyonu ve boyamanın farkı nedir?">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kalıcı kaş kontürü pigmenti cilde işler ve aylarca kalır; kaş laminasyonu ve boyama ise
          yalnızca mevcut kılları düzenleyip renklendiren geçici işlemlerdir. Kalıcılık ve etki
          açısından temel farklar şöyledir:
        </p>
        <ul className="mt-6 max-w-[720px] space-y-3 text-[17px] leading-relaxed text-muted2">
          <li><strong className="text-ink">Kalıcı kaş kontürü:</strong> Pigment cilde işlenir, boşlukları kapatır ve çerçeve oluşturur. Kalıcılık 12 ay–3 yıl (yarı kalıcı).</li>
          <li><strong className="text-ink">Kaş laminasyonu:</strong> Kılları yukarı sabitleyip dolgun gösterir; boşluk kapatmaz. Kalıcılık 4–6 hafta (geçici).</li>
          <li><strong className="text-ink">Kaş boyama (henna/boya):</strong> Mevcut kılları ve teni geçici olarak renklendirir; şekil vermez. Kalıcılık 2–4 hafta (geçici).</li>
        </ul>
        <p className="mt-6 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kalıcı bir çerçeve isteyenler kontür tekniklerini, yalnızca kısa süreli bakım isteyenler
          laminasyon veya boyamayı tercih eder.
        </p>
      </Section>

      <Section eyebrow="Fiyatlar" heading="Ankara'da kaş kontürü fiyatları ne kadar?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kaş kontürü fiyatı seçilen tekniğe, kullanılan pigmente ve uygulayıcının deneyimine göre
          değişir. Stria Studio&apos;daki güncel aralıklar aşağıdadır; tüm paketlere yüz analizi,
          kaş tasarımı ve steril ekipman dahildir. Kesin tutar ücretsiz ön görüşmede netleşir.
        </p>
        <ul className="mt-6 max-w-[720px] space-y-3 text-[17px] leading-relaxed text-muted2">
          <li><strong className="text-ink">Mikroblading kontür (tek seans):</strong> 4.500 – 6.500 ₺</li>
          <li><strong className="text-ink">Mikroblading + rötuş paketi:</strong> 6.000 – 8.500 ₺ (4–6 hafta sonra rötuş dahil)</li>
          <li><strong className="text-ink">Kaş pudralama kontür:</strong> 5.000 – 7.500 ₺</li>
          <li><strong className="text-ink">Yıllık yenileme:</strong> 2.500 – 4.000 ₺</li>
        </ul>
        <p className="mt-6 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Güncel ve tam liste için yalnızca{" "}
          <Link href="/mikroblading-fiyatlari" className="text-accent-dark hover:underline">mikroblading fiyatları</Link>{" "}
          sayfasını esas alın.
        </p>
      </Section>

      <Section eyebrow="Süreç" heading="Kaş kontürü nasıl bir süreçle uygulanır?">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Süreç ücretsiz ön görüşme ve cilt analiziyle başlar. Yüz hatlarınıza uygun kaş çerçevesi
          çizilir, sizinle onaylanır ve seçilen teknikle pigment işlenir. Uygulama tasarım dahil
          yaklaşık 90 dakika sürer; 4–6 hafta sonra rengin oturması için kısa bir rötuş yapılır.
          İyileşme genelde 7–10 günde tamamlanır.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Uygulamanın adım adım nasıl yapıldığını{" "}
          <Link href="/mikroblading-nasil-yapilir" className="text-accent-dark hover:underline">mikroblading nasıl yapılır</Link>{" "}
          rehberinde, örnek çalışmaları ise{" "}
          <Link href="/galeri" className="text-accent-dark hover:underline">galeri</Link>{" "}
          sayfasında bulabilirsiniz.
        </p>
      </Section>

      <Section eyebrow="S.S.S." heading="Kaş kontürü hakkında en çok sorulanlar" narrow>
        <p className="mb-8 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kaş kontürü yaptırmayı düşünenlerin en sık sorduğu konular kalıcılık, mikrobladingle
          ilişkisi, süre, fiyat ve uygunluktur. Aşağıdaki kısa yanıtlar temel bilgiyi verir;
          kişisel uygunluk ve kesin plan için stüdyoyla doğrudan görüşmek gerekir.
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
