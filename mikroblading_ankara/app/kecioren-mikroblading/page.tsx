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
  title: "Keçiören Mikroblading | Çankaya Stria Studio Ulaşım",
  description:
    "Keçiören mikroblading ve kalıcı kaş arayanlar için Çankaya'daki Stria Studio'ya M4 metro ve Kızılay aktarmasıyla yol planı; işlem ve rötuş ziyareti rehberi.",
  path: "/kecioren-mikroblading",
});

const faqs = [
  {
    q: "Keçiören'den mikroblading stüdyosuna nasıl gelinir?",
    a: "En pratik hat, Keçiören M4 metrosuyla güneye inip Kızılay'da Çankaya yönüne aktarma yapmaktır. Araçla gelecekseniz Ankara trafiğini hesaba katın. Randevu günü başlangıç durağınızı ve stüdyo adresini harita uygulamasına girerek güncel seferi doğrulayın.",
  },
  {
    q: "İşlem ve yol aynı günde biter mi?",
    a: "Mikroblading uygulaması yaklaşık 90 dakika sürer; buna Keçiören–Çankaya gidiş-dönüş yolculuğunu ekleyin. Aynı gün içinde rahatça tamamlanır, ancak yoğun trafik dışı bir randevu saati seçmek yolculuğu kısaltır ve gününüzü rahatlatır.",
  },
  {
    q: "Rötuş için tekrar gelmek gerekir mi?",
    a: "Evet, kalıcı kaş süreci genelde iki ziyarettir: ilk uygulama ve 4–6 hafta sonrası rötuş. Rötuş, Keçiören'den stüdyoya aynı yolculuğu tekrar gerektirir; bu ikinci ziyareti baştan planlamanız süreci öngörülebilir kılar.",
  },
  {
    q: "Keçiören'de mi, Çankaya'da mı hizmet veriliyor?",
    a: "Uygulama Stria Studio'nun Çankaya'daki stüdyo adresinde yapılır; Keçiören'de şube bulunmaz. Bu sayfa, Ankara'nın kuzeyinden gelenlerin metro ve aktarma rotasını önceden planlamasına yardımcı olur.",
  },
  {
    q: "Randevu nasıl alınır?",
    a: "Randevu için iletişim sayfasındaki kanallardan ulaşabilirsiniz. Keçiören yönünden geleceğinizi ve tercih ettiğiniz saati belirtin; böylece hem uygulama hem de olası rötuş ziyareti için uygun bir program birlikte oluşturulur.",
  },
];

export default async function KeciorenMicrobladingPage() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd data={serviceSchema({
        name: "Keçiören Mikroblading (Çankaya Stüdyo)",
        description: "Keçiören'den M4 metro ve Kızılay aktarmasıyla ulaşılan, Stria Studio'nun Çankaya adresindeki kıl tekniği mikroblading ve kalıcı kaş hizmeti.",
        path: "/kecioren-mikroblading",
      })} />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Keçiören Mikroblading", path: "/kecioren-mikroblading" }]} />

      <Section>
        <h1 className="max-w-[820px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">Keçiören mikroblading — kuzeyden Çankaya&apos;ya ulaşım rehberi</h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-relaxed text-muted2">
          Keçiören mikroblading ve kalıcı kaş aramasında Stria Studio&apos;nun uygulama adresi
          Çankaya&apos;dadır; Keçiören&apos;de şube yoktur. Ankara&apos;nın kuzeyinden güneyine
          yapılacak bu yolculuk, M4 metro hattı ve Kızılay aktarmasıyla planlanabilir. Randevu
          öncesinde haritadan canlı güzergâhı açabilir, güncel adresi stüdyodan doğrudan
          doğrulayabilirsiniz.
        </p>
        <ImageSlot
          src="/images/topics/kecioren-mikroblading.png"
          alt="Keçiören'den mikroblading randevusuna ulaşım — Çankaya stüdyo rotası"
          ratio="aspect-[16/9]"
          className="mt-8 max-w-[920px] rounded-[24px] border border-line bg-blush"
        />
        <div className="mt-8"><CTAButtons settings={s} /></div>
      </Section>

      <Section eyebrow="Metro hattı" heading="Keçiören'den stüdyoya M4 ile nasıl gelinir?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          En pratik güzergâh, Keçiören M4 metrosuyla güneye inip Kızılay&apos;da Çankaya yönüne
          aktarma yapmaktır. Kızılay aktarma noktasından stüdyoya devam ederken kısa bir yürüyüş
          veya kısa bir bağlantı gerekebilir. Hat ve sefer bilgileri zamanla değişebileceğinden,
          randevu günü başlangıç durağınızı ve stüdyo adresini harita uygulamasına girerek güncel
          aktarma seçeneklerini kontrol edin.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Tam konum ve adres teyidi için <Link href="/iletisim" className="text-accent-dark hover:underline">iletişim sayfasını</Link> kullanın.
        </p>
      </Section>

      <Section eyebrow="Zaman planı" heading="Araçla gelirken Ankara trafiğine ne kadar pay bırakmalı?">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Keçiören ile Çankaya arası, sabah ve akşam saatlerinde Ankara trafiğinde belirgin şekilde
          uzayabilir. Araçla gelecekseniz randevu saatinizi yoğun trafik dışına almak hem yolculuğu
          kısaltır hem de acele etmeden varmanızı sağlar. Metroyu tercih ederseniz aktarma ve
          duraktan yürüyüş süresini de hesaba katarak küçük bir zaman payı bırakın.
        </p>
        <div className="mt-6"><StudioMap settings={s} /></div>
      </Section>

      <Section eyebrow="İki ziyaret" heading="Neden tek seferlik değil, iki ziyaretlik bir plan gerekir?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kalıcı kaş süreci genellikle iki aşamadır: ilk uygulama yaklaşık 90 dakika sürer, ardından
          4–6 hafta sonra bir rötuş ziyareti gelir. Keçiören&apos;den gelenler için bu, aynı
          kuzey-güney yolculuğunun ikinci kez tekrarlanması anlamına gelir. Rötuş ziyaretini baştan
          takviminize eklemek, ulaşımı ve iş-özel program çakışmalarını önceden çözmenizi sağlar.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Uygulama adımlarını <Link href="/mikroblading-nasil-yapilir" className="text-accent-dark hover:underline">mikroblading nasıl yapılır</Link> sayfasında, stüdyonun bulunduğu bölgeyi <Link href="/cankaya-mikroblading" className="text-accent-dark hover:underline">Çankaya mikroblading</Link> sayfasında inceleyin.
        </p>
      </Section>

      <Section eyebrow="S.S.S." heading="Keçiören mikroblading hakkında neler soruluyor?" narrow>
        <p className="mb-8 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Keçiören yönünden gelecek kişiler çoğunlukla metro ve aktarma rotasını, işlemin ve yolun
          aynı güne sığıp sığmadığını ve rötuş için tekrar gelmek gerekip gerekmediğini sorar.
          Yanıtların ortak noktası önceden planlamadır: güzergâhlar değişebileceği için yolculuk
          öncesi canlı sefer bilgisini kontrol etmek en güvenilir yaklaşımdır.
        </p>
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Mikroblading Ankara <ArrowIcon className="h-4 w-4" /></Link>
          <Link href="/cankaya-mikroblading" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Çankaya stüdyo bilgisi <ArrowIcon className="h-4 w-4" /></Link>
          <Link href="/kizilay-mikroblading" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Kızılay ulaşım rehberi <ArrowIcon className="h-4 w-4" /></Link>
        </div>
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
