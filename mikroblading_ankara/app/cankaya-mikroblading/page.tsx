import type { Metadata } from "next";
import Link from "next/link";
import { getSettings, SETTINGS_FALLBACK } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/Section";
import { StudioMap } from "@/components/StudioMap";
import { CTAButtons, CTABanner } from "@/components/CTA";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { serviceSchema, faqSchema } from "@/lib/schema";
import { ArrowIcon } from "@/components/Icons";

export const metadata: Metadata = buildMetadata({
  title: "Çankaya Mikroblading | Stria Studio Ankara",
  description:
    "Çankaya mikroblading hizmeti: kişiye özel kıl tekniği, stüdyo konumu, ulaşım ve rötuş ziyaretlerini kolaylaştıran yerel planlama. Stria Studio Ankara.",
  path: "/cankaya-mikroblading",
});

const faqs = [
  {
    q: "Çankaya mikroblading randevusu nasıl alınır?",
    a: "WhatsApp veya telefonla iletişime geçerek ön görüşme ve uygun randevu saatlerini sorabilirsiniz. Güncel adres, ulaşım ayrıntıları ve hazırlık bilgileri randevu onayında paylaşılır.",
  },
  {
    q: "Rötuş için yeniden stüdyoya gelmek gerekir mi?",
    a: "Rötuş gereksinimi uygulama sonrası iyileşme ve pigment tutulumuna göre değerlendirilir. Gerekli görülürse takip ziyareti stüdyoda planlanır; paket kapsamını fiyat sayfasından kontrol edebilirsiniz.",
  },
  {
    q: "Çankaya dışından mikroblading için gelinebilir mi?",
    a: "Evet. Ankara'nın farklı ilçelerinden randevu alınabilir. Yolculuğunuzu planlarken haritadaki güncel rotayı kullanmanız ve randevu öncesinde stüdyo adresini doğrulamanız yeterlidir.",
  },
  {
    q: "Stüdyonun tam adresini nereden görebilirim?",
    a: "Bu sayfadaki harita ve iletişim sayfası güncel stüdyo konumunu gösterir. Randevunuz kesinleştiğinde doğrudan yol tarifi bağlantısı da isteyebilirsiniz.",
  },
];

export default async function CankayaMicrobladingPage() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Çankaya Mikroblading",
          description:
            "Ankara Çankaya'daki Stria Studio'da yüz ve kaş yapısına göre planlanan kıl tekniği mikroblading hizmeti.",
          path: "/cankaya-mikroblading",
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Çankaya Mikroblading", path: "/cankaya-mikroblading" }]} />

      <Section>
        <h1 className="max-w-[820px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">
          Çankaya mikroblading — Stria Studio
        </h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-relaxed text-muted2">
          Çankaya mikroblading arayanlar, Stria Studio&apos;da yüz ve mevcut kaş yapısına göre
          planlanan kıl tekniği uygulaması için randevu alabilir. Stüdyonun Çankaya&apos;da olması;
          ön görüşme, uygulama ve gerekirse rötuş ziyaretlerini aynı bilinen konumda planlamayı
          kolaylaştırır. Güncel adres ile yol tarifi aşağıdadır; randevu öncesinde konumu yeniden
          doğrulamanız önerilir.
        </p>
        <div className="mt-8"><CTAButtons settings={s} /></div>
      </Section>

      <Section eyebrow="Yerel hizmet" heading="Çankaya'da mikroblading neden yerel olarak planlanmalı?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Mikroblading tek bir ziyaret olarak düşünülmemelidir; ön görüşme, ilk uygulama ve
          iyileşme sonrasında gerekebilecek kontrol veya rötuş ayrı zamanlarda planlanabilir.
          Çankaya&apos;da bir stüdyo seçmek, özellikle aynı ilçede yaşayan ya da çalışan kişiler
          için bu takip ziyaretlerinin ulaşımını önceden öngörülebilir hâle getirir.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Uygulamanın aşamalarını <Link href="/mikroblading-nasil-yapilir" className="text-accent-dark hover:underline">mikroblading nasıl yapılır</Link> rehberinde inceleyebilirsiniz.
        </p>
      </Section>

      <Section eyebrow="Konum" heading="Çankaya'daki stüdyoya nasıl ulaşılır?">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Stüdyonun güncel konumunu aşağıdaki haritada açarak bulunduğunuz noktadan araç veya
          toplu taşıma rotası oluşturabilirsiniz. Hatlar ve trafik koşulları değişebildiği için
          randevu günü canlı yol tarifini kontrol edin; açık adresi doğrulamak veya erişilebilirlik
          ihtiyacınızı iletmek için doğrudan iletişim kurun. Böylece varış ayrıntıları önceden
          netleşir.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Adres ve iletişim kanalları için <Link href="/iletisim" className="text-accent-dark hover:underline">iletişim sayfasına</Link> bakabilirsiniz.
        </p>
        <div className="mt-6"><StudioMap settings={s} /></div>
      </Section>

      <Section eyebrow="Planlama" heading="Rötuş ziyaretinde yakın konum neden önemlidir?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Rötuş kararı, kaşların iyileşme sonrasındaki görünümüne göre verilir ve gerektiğinde
          stüdyoya yeniden gelmeyi içerir. Yakın veya kolay ulaşılabilen bir konum, bu kontrolü
          ertelememeyi ve uygulayıcının sonucu yüz yüze değerlendirmesini kolaylaştırır; kesin
          zamanlama kişisel iyileşme sürecine göre paylaşılır. Her danışanın takip planı aynı
          olmayabilir.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Paket ve rötuş kapsamı için yalnızca güncel <Link href="/mikroblading-fiyatlari" className="text-accent-dark hover:underline">mikroblading fiyatları</Link> sayfasını esas alın.
        </p>
      </Section>

      <Section eyebrow="S.S.S." heading="Çankaya mikroblading hakkında neler merak ediliyor?" narrow>
        <p className="mb-8 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Çankaya&apos;da randevu planlayanların en sık sorduğu konular stüdyonun güncel adresi,
          ulaşım, takip ziyareti ve rötuş kapsamıdır. Aşağıdaki kısa yanıtlar planlama için temel
          bilgiyi verir; kişisel uygunluk, kesin seans akışı ve adres teyidi için stüdyoyla
          doğrudan görüşmek gerekir. Randevu ayrıntıları kişiye göre netleştirilir.
        </p>
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Mikroblading Ankara <ArrowIcon className="h-4 w-4" /></Link>
          <Link href="/iletisim" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">İletişim <ArrowIcon className="h-4 w-4" /></Link>
        </div>
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
