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
  title: "Çayyolu Mikroblading | Ümitköy'den Çankaya Stüdyo Ulaşım",
  description:
    "Çayyolu ve Ümitköy'den mikroblading için Çankaya'daki Stria Studio'ya M2 metro ve Eskişehir Yolu ile ulaşım; kaş uygulaması, saat seçimi ve rötuş planı.",
  path: "/cayyolu-mikroblading",
});

const faqs = [
  {
    q: "Çayyolu'ndan mikroblading stüdyosuna metro ile nasıl gelinir?",
    a: "Çayyolu, M2 Koru–Kızılay metro hattı üzerindedir; batı yönünden gelirken hat sizi doğrudan Çankaya koridoruna taşır. İneceğiniz durak stüdyoya en yakın noktaya göre seçilir; randevu günü canlı metro rotasını harita üzerinden doğrulayın.",
  },
  {
    q: "Ümitköy'den araçla ne kadar sürede gelinir?",
    a: "Ümitköy ile Çankaya arası Eskişehir Yolu koridoru üzerindendir ve süre büyük ölçüde trafiğe bağlıdır. Kesin bir dakika vermek yerine, çıkış saatinize göre haritadan canlı rota süresini kontrol edip küçük bir zaman payı bırakmanızı öneririz.",
  },
  {
    q: "Mikroblading uygulaması ne kadar sürer?",
    a: "Kaş uygulaması genellikle ön görüşme ve form tasarımıyla birlikte yaklaşık 90 dakika sürer. Batı hattından geleceğiniz için randevu saatini, gidiş-dönüş yolculuğunu da hesaba katarak seçmeniz süreci daha rahat planlamanızı sağlar.",
  },
  {
    q: "Çayyolu'ndan gelenler için rötuş gerekir mi?",
    a: "Rötuş, ilk uygulamadan 4–6 hafta sonra iyileşme ve pigment tutulumuna göre değerlendirilir ve ayrı bir ziyaret olarak planlanır. Ümitköy–Çayyolu hattından geleceklerin ön görüşme, uygulama ve rötuşu ayrı günler olarak öngörmesi yararlıdır.",
  },
  {
    q: "Çayyolu veya Ümitköy'den randevu nasıl alınır?",
    a: "WhatsApp veya telefonla iletişime geçip batı hattından geleceğinizi belirtebilirsiniz. Uygun saatler, güncel adres ve ulaşım ayrıntıları randevu onayında paylaşılır; hafta içi ve hafta sonu için farklı saat seçenekleri sorulabilir.",
  },
];

export default async function CayyoluMicrobladingPage() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd data={serviceSchema({
        name: "Çayyolu & Ümitköy Mikroblading (Çankaya Stüdyo)",
        description: "Çayyolu ve Ümitköy'den M2 metro veya Eskişehir Yolu ile ulaşım planlanabilen, Stria Studio'nun Çankaya adresindeki kıl tekniği mikroblading hizmeti.",
        path: "/cayyolu-mikroblading",
      })} />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Çayyolu Mikroblading", path: "/cayyolu-mikroblading" }]} />

      <Section>
        <h1 className="max-w-[820px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">Çayyolu &amp; Ümitköy mikroblading — ulaşım rehberi</h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-relaxed text-muted2">
          Çayyolu ve Ümitköy&apos;den mikroblading arayanlar için Stria Studio&apos;nun uygulama
          adresi Çankaya&apos;dadır. Ankara&apos;nın batısındaki bu hat, M2 Koru–Kızılay metrosu ve
          Eskişehir Yolu koridoruyla stüdyoya rahat bağlanır. En uygun rota, kalkış noktanıza ve
          saate göre değişir; randevu öncesinde haritadan canlı güzergâhı açıp adresi doğrulayın.
        </p>
        <div className="mt-8"><CTAButtons settings={s} /></div>
      </Section>

      <Section eyebrow="Metro" heading="Çayyolu'ndan metroyla stüdyoya nasıl ulaşılır?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Çayyolu ve Ümitköy, M2 Koru–Kızılay metro hattı üzerindedir; batı yönünden gelirken hat
          sizi doğrudan Çankaya koridoruna taşır ve çoğu güzergâhta aktarma ihtiyacını azaltır.
          İneceğiniz durak stüdyoya en yakın noktaya göre belirlenir. Sefer saatleri zamanla
          değişebildiği için, randevu günü başlangıç durağınızı ve stüdyo adresini haritaya girin.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Tam konum ve adres teyidi için <Link href="/iletisim" className="text-accent-dark hover:underline">iletişim sayfasını</Link> kullanın.
        </p>
      </Section>

      <Section eyebrow="Araç" heading="Ümitköy'den Eskişehir Yolu ile gelirken ne planlanmalı?">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Araçla gelecekseniz Ümitköy–Çayyolu hattı Eskişehir Yolu koridoru üzerinden Çankaya&apos;ya
          bağlanır; süre büyük ölçüde trafiğe bağlıdır. Hafta içi yoğun saatlerle hafta sonu farklı
          seyreder, bu yüzden çıkış saatinize göre canlı rota süresini kontrol edip küçük bir zaman
          payı bırakın. İlk kez geliyorsanız harita bağlantısını randevudan önce kaydedin.
        </p>
        <div className="mt-6"><StudioMap settings={s} /></div>
      </Section>

      <Section eyebrow="Planlama" heading="Ön görüşme, uygulama ve rötuş nasıl ayrı planlanır?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Batı hattından gelenler için süreç genellikle üç ziyarete yayılır: ön görüşme, yaklaşık 90
          dakikalık uygulama ve 4–6 hafta sonraki rötuş. Uygulama gününde kaş formu yüz üzerinde
          tasarlanır; rötuş ise iyileşme ve pigment tutulumuna göre değerlendirilir. Ziyaretleri
          ayrı günler olarak öngörmek, Çayyolu–Ümitköy yolculuğunu daha rahat planlamanızı sağlar.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Güncel kapsam ve paketleri <Link href="/mikroblading-fiyatlari" className="text-accent-dark hover:underline">fiyatlar</Link> sayfasında inceleyin.
        </p>
      </Section>

      <Section eyebrow="S.S.S." heading="Çayyolu ve Ümitköy mikroblading hakkında neler soruluyor?" narrow>
        <p className="mb-8 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Batı hattından gelecek kişiler çoğunlukla metroyla rota kurmayı, araç trafiğine göre saat
          seçimini ve rötuşun ne zaman gerektiğini sorar. Yanıtların ortak noktası güncel harita ve
          sefer verisidir; güzergâhlar değişebildiği için yolculuk öncesi canlı rota bilgisini kontrol
          etmek en güvenilir yaklaşımdır. Kesin adres ayrıca randevu öncesinde doğrulanmalıdır.
        </p>
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Mikroblading Ankara <ArrowIcon className="h-4 w-4" /></Link>
          <Link href="/cankaya-mikroblading" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Çankaya stüdyo bilgisi <ArrowIcon className="h-4 w-4" /></Link>
          <Link href="/kecioren-mikroblading" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Keçiören ulaşım rehberi <ArrowIcon className="h-4 w-4" /></Link>
        </div>
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
