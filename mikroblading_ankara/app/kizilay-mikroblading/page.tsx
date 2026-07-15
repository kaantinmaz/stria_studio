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
  title: "Kızılay Mikroblading | Çankaya Stria Studio'ya Ulaşım",
  description:
    "Kızılay mikroblading arayanlar için Çankaya'daki Stria Studio'ya metro, otobüs ve dolmuş bağlantılarıyla ulaşım planı; uygulama ve randevu bilgileri.",
  path: "/kizilay-mikroblading",
});

const faqs = [
  {
    q: "Kızılay'dan mikroblading stüdyosuna nasıl gidilir?",
    a: "Başlangıç noktanıza göre metro, otobüs veya dolmuş bağlantılarından uygun olanı seçebilirsiniz. Hat ve aktarma bilgileri değişebildiğinden, randevu günü haritadaki canlı toplu taşıma rotasını kullanın.",
  },
  {
    q: "Kızılay'da mı, Çankaya'da mı hizmet veriliyor?",
    a: "Uygulama Stria Studio'nun Çankaya'daki stüdyo adresinde yapılır. Bu sayfa, Kızılay'ı ulaşım başlangıç noktası olarak kullananların rotasını planlamasına yardımcı olur.",
  },
  {
    q: "Toplu taşımaya göre randevu saati seçilebilir mi?",
    a: "Uygun randevu seçeneklerini sorarken Kızılay yönünden geleceğinizi belirtebilirsiniz. Seçtiğiniz saat için yolculuk ve olası aktarma süresini güncel rota üzerinden ayrıca hesaplayın.",
  },
  {
    q: "Fiyat ulaşım bölgesine göre değişir mi?",
    a: "Güncel hizmet ve paket bilgileri konum sayfalarında değil, mikroblading fiyatları sayfasında yayımlanır. Kesin kapsam için o sayfayı ve randevu görüşmesini esas alın.",
  },
];

export default async function KizilayMicrobladingPage() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd data={serviceSchema({
        name: "Kızılay Mikroblading",
        description: "Kızılay'dan toplu taşıma bağlantılarıyla ulaşım planlanabilen, Stria Studio'nun Çankaya adresindeki kıl tekniği mikroblading hizmeti.",
        path: "/kizilay-mikroblading",
      })} />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Kızılay Mikroblading", path: "/kizilay-mikroblading" }]} />

      <Section>
        <h1 className="max-w-[820px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">Kızılay mikroblading — ulaşım rehberi</h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-relaxed text-muted2">
          Kızılay mikroblading aramasında Stria Studio&apos;nun uygulama adresi Çankaya&apos;dadır;
          Kızılay ise metro, otobüs ve dolmuş bağlantılarını birleştiren pratik bir başlangıç
          noktasıdır. En uygun rota bulunduğunuz durak ve saate göre değişir. Randevu öncesinde
          haritadan canlı güzergâhı açabilir, güncel adresi stüdyodan doğrudan doğrulayabilirsiniz.
        </p>
        <ImageSlot
          src="/images/topics/kizilay-mikroblading.png"
          alt="Kızılay'dan mikroblading randevusuna ulaşım — Çankaya stüdyo rotası"
          ratio="aspect-[16/9]"
          className="mt-8 max-w-[920px] rounded-[24px] border border-line bg-blush"
        />
        <div className="mt-8"><CTAButtons settings={s} /></div>
      </Section>

      <Section eyebrow="Toplu taşıma" heading="Kızılay'dan stüdyoya hangi yollarla ulaşılır?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kızılay&apos;dan Çankaya yönüne giderken metro bağlantısı, belediye otobüsü veya dolmuş
          seçenekleri değerlendirilebilir; bazı rotalarda kısa bir aktarma gerekebilir. Belirli
          bir hat numarası zamanla değişebileceğinden, randevu günü başlangıç durağınızı ve stüdyo
          adresini harita uygulamasına girerek güncel seferi ve aktarma seçeneklerini kontrol edin.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Tam konum ve adres teyidi için <Link href="/iletisim" className="text-accent-dark hover:underline">iletişim sayfasını</Link> kullanın.
        </p>
      </Section>

      <Section eyebrow="Rota" heading="Metro veya dolmuşla gelirken ne planlanmalı?">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Metro veya dolmuşla gelirken yalnızca araç içi süreyi değil, aktarma ve duraktan stüdyoya
          yürüyüş bölümünü de hesaba katın. İlk kez geliyorsanız randevudan önce harita bağlantısını
          kaydedin ve küçük bir zaman payı bırakın. Erişilebilirlik gereksiniminiz varsa bunu
          randevu görüşmesinde önceden belirtin.
        </p>
        <div className="mt-6"><StudioMap settings={s} /></div>
      </Section>

      <Section eyebrow="Uygulama" heading="Ulaşım dışında mikroblading süreci nasıl planlanır?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Randevu planında önce kişisel uygunluk ve beklenti konuşulur; kaş formu uygulama öncesinde
          yüz üzerinde değerlendirilir. İşlem adımları, bakım ve olası takip ziyareti hakkında
          önceden bilgi edinmek yolculuk gününü daha rahat planlamanızı sağlar. Sürecin ayrıntıları
          ayrı uygulama rehberinde adım adım açıklanır. Takip gereksinimi kişiye göre değişebilir.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Adımları <Link href="/mikroblading-nasil-yapilir" className="text-accent-dark hover:underline">mikroblading nasıl yapılır</Link>, güncel kapsamı <Link href="/mikroblading-fiyatlari" className="text-accent-dark hover:underline">fiyatlar</Link> sayfasında inceleyin.
        </p>
      </Section>

      <Section eyebrow="S.S.S." heading="Kızılay mikroblading hakkında neler soruluyor?" narrow>
        <p className="mb-8 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kızılay yönünden gelecek kişiler çoğunlukla stüdyonun hangi bölgede olduğunu, metro veya
          dolmuşla rota kurmayı ve randevu saatini sorar. Yanıtların ortak noktası güncel harita
          verisidir: güzergâhlar değişebileceği için yolculuk öncesi canlı sefer bilgisini kontrol
          etmek en güvenilir yaklaşımdır. Kesin adres ayrıca randevu öncesinde doğrulanmalıdır.
        </p>
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Mikroblading Ankara <ArrowIcon className="h-4 w-4" /></Link>
          <Link href="/cankaya-mikroblading" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Çankaya stüdyo bilgisi <ArrowIcon className="h-4 w-4" /></Link>
        </div>
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
