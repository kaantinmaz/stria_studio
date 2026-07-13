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
  title: "Erkek Mikroblading Ankara | Doğal Kıl Tekniği",
  description:
    "Erkek mikroblading Ankara: düz ve doğal kaş formu, boşluklara uygun kıl yönü, abartısız sonuç ve mahrem beklentilere saygılı randevu planlaması.",
  path: "/erkek-mikroblading-ankara",
});

const faqs = [
  {
    q: "Erkek mikroblading kadın uygulamasından farklı mı?",
    a: "Temel teknik aynı olsa da tasarım hedefi kişiye göre değişir. Erkek kaşında çoğunlukla mevcut kalınlığı ve daha düz hattı koruyan, belirgin kavis oluşturmayan bir plan tercih edilir.",
  },
  {
    q: "Erkeklerde mikroblading doğal görünür mü?",
    a: "Doğallık; çizgilerin mevcut kılların yönü, kalınlığı ve dağılımıyla uyumuna bağlıdır. Amaç kaşı tek renk doldurmak değil, ihtiyaç görülen boşlukları kontrollü kıl çizgileriyle tamamlamaktır.",
  },
  {
    q: "Çok yağlı ciltte kıl tekniği uygun mudur?",
    a: "Cilt özellikleri pigmentin iyileşmiş görünümünü etkileyebilir. Teknik uygunluğu ve alternatifleri uygulama öncesi görüşmede değerlendirmek gerekir; herkes için aynı yöntem otomatik olarak seçilmez.",
  },
  {
    q: "Randevuda mahremiyet beklentimi belirtebilir miyim?",
    a: "Evet. İletişim tercihinizi ve randevu planlamasına ilişkin mahremiyet beklentinizi görüşme sırasında açıkça iletebilirsiniz. Stüdyo, karşılayabileceği koşulları randevu öncesinde netleştirir.",
  },
];

export default async function ErkekMicrobladingPage() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd data={serviceSchema({
        name: "Erkek Mikroblading Ankara",
        description: "Erkeklerin mevcut kaş yönü ve doğal yüz ifadesi korunarak kişiye özel planlanan kıl tekniği mikroblading hizmeti.",
        path: "/erkek-mikroblading-ankara",
      })} />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Erkek Mikroblading Ankara", path: "/erkek-mikroblading-ankara" }]} />

      <Section>
        <h1 className="max-w-[820px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">Erkek mikroblading Ankara</h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-relaxed text-muted2">
          Erkek mikroblading, kaşı makyajlı göstermek yerine mevcut kıl yönünü ve doğal kalınlığı
          koruyarak boşlukları azaltmayı hedefler. Ankara Çankaya&apos;daki Stria Studio&apos;da form;
          yüz oranları, kaş yoğunluğu ve kişisel beklenti birlikte değerlendirilerek çizilir.
          Kıl tekniğinin uygunluğu cilt ve kaş yapısına göre belirlenir.
        </p>
        <div className="mt-8"><CTAButtons settings={s} /></div>
      </Section>

      <Section eyebrow="Tasarım" heading="Erkeklerde doğal ve maskülen kaş formu nasıl oluşturulur?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Doğal erkek kaş tasarımında mevcut kalınlık gereksiz yere inceltilmez, yüksek ve keskin
          bir kavis zorlanmaz. Başlangıç, gövde ve uç bölümü yüzün oranlarına göre dengelenirken
          yeni çizgiler kaşın kendi çıkış yönünü izler. Hedef belirgin bir şekil değişimi değil,
          daha düzenli bir bütündür.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Genel hizmet yaklaşımı için <Link href="/" className="text-accent-dark hover:underline">Mikroblading Ankara ana sayfasını</Link> inceleyin.
        </p>
      </Section>

      <Section eyebrow="Kıl tekniği" heading="Kıl tekniği erkek kaşındaki boşluklara uygun mu?">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kıl tekniği, mevcut kılların arasında sınırlı boşluklar bulunan ve tek tek çizgilerle
          bütünlük hedeflenen kaşlarda değerlendirilebilir. Ancak uygunluk yalnızca cinsiyete göre
          belirlenmez; cilt tipi, önceki işlemler, boşluğun dağılımı ve iyileşme beklentisi birlikte
          incelenerek teknik seçimi yapılır. Ön görüşme bu nedenle önemlidir.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Uygulamanın nasıl ilerlediğini <Link href="/mikroblading-nasil-yapilir" className="text-accent-dark hover:underline">adım adım işlem rehberinde</Link> okuyabilirsiniz.
        </p>
      </Section>

      <Section eyebrow="Mahremiyet" heading="Abartısız sonuç ve mahrem randevu nasıl planlanır?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Abartısız görünüm için beklentinizi örnek kelimelerle değil, istemediğiniz kavis, koyuluk
          ve sınır belirginliği üzerinden açıkça anlatın; tasarımı onaylamadan uygulamaya geçmeyin.
          Mahremiyet sizin için önemliyse tercih ettiğiniz iletişim kanalını ve randevu koşullarını
          önceden sorun. Karşılanabilecek düzen ve iletişim biçimi böylece baştan netleşir.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Görüşme ve randevu için <Link href="/iletisim" className="text-accent-dark hover:underline">iletişim kanallarını</Link>, güncel paketler için <Link href="/mikroblading-fiyatlari" className="text-accent-dark hover:underline">fiyat sayfasını</Link> kullanın.
        </p>
      </Section>

      <Section eyebrow="S.S.S." heading="Erkek mikroblading hakkında neler soruluyor?" narrow>
        <p className="mb-8 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Erkek danışanların soruları çoğunlukla sonucun yapay görünme ihtimali, kavis ve kalınlık
          seçimi, kıl tekniğinin uygunluğu ile randevu mahremiyetine odaklanır. Tasarımın kişiye
          özel yapılması bu başlıkların ortak yanıtıdır; teknik ve koşullar ön görüşmede açıkça
          konuşulup onaylanmalıdır. Her kaş için aynı şablon kullanılmaz.
        </p>
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/mikroblading-nasil-yapilir" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Nasıl yapılır? <ArrowIcon className="h-4 w-4" /></Link>
          <Link href="/iletisim" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Randevu <ArrowIcon className="h-4 w-4" /></Link>
        </div>
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
