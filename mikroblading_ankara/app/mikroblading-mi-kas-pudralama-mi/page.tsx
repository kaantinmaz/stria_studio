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
import { LAST_UPDATED } from "@/lib/copy";

export const metadata: Metadata = buildMetadata({
  title: "Mikroblading mi Kaş Pudralama mı? | Karşılaştırma",
  description:
    "Mikroblading mi kaş pudralama mı? Cilt tipi, görünüm, kalıcılık (12–18 ay vs 1–3 yıl) ve fiyata göre karşılaştırma tablosu ile 2026 karar rehberi. Stria Studio Ankara.",
  path: "/mikroblading-mi-kas-pudralama-mi",
});

const faqs = [
  {
    q: "Mikroblading mi kaş pudralama mı daha az acır?",
    a: "İkisi de yüzeysel işlemdir ve öncesinde topikal anestezi kremi uygulanır; çoğu danışan hafif çizilme veya basınç hissi tarif eder. Kaş pudralama daha çok noktasal titreşimle çalıştığından bazı kişilere biraz daha konforlu gelir. Ağrı eşiği kişiye göre değişir.",
  },
  {
    q: "Hangisi daha doğal görünür?",
    a: "Doğal, kıl kıl görünüm için mikroblading öne çıkar; her tel tek tek çizildiği için gerçek kaştan ayırt edilmesi zordur. Kaş pudralama ise pudra/makyaj etkisiyle dolgun ve yumuşak bir görünüm verir. Tercihiniz doğal mı, dolgun mu istediğinize göre belirlenir.",
  },
  {
    q: "Yağlı ciltte mikroblading neden iyi tutmaz?",
    a: "Yağlı ciltte fazla sebum, çizilen ince kıl hatlarının kenarlarını zamanla bulanıklaştırabilir ve pigmentin daha çabuk açılmasına yol açabilir. Bu yüzden yağlı ve gözenekli ciltlerde daha kararlı sonuç veren kaş pudralama genellikle önerilir. Uygunluk ön görüşmede değerlendirilir.",
  },
  {
    q: "Mikroblading ve kaş pudralama arasındaki fiyat farkı nedir?",
    a: "Ankara Stria Studio'da mikroblading tek seans 4.500–6.500 ₺, kaş pudralama 5.000–7.500 ₺ aralığındadır. Fiyat; kaş yapısı, seans kapsamı ve rötuş dahil olup olmamasına göre değişir. Güncel tutarlar için fiyat sayfasını esas alın.",
  },
  {
    q: "Sonradan teknikten diğerine geçilebilir mi?",
    a: "Genellikle evet; mevcut kaşların rengi, doygunluğu ve iyileşmiş durumuna göre bir teknikten diğerine geçiş planlanabilir. Ancak önceki pigmentin yoğunluğu sonucu etkilediğinden geçiş, ön görüşmede kaşlar yerinde değerlendirilerek kararlaştırılır.",
  },
];

const compareRows = [
  {
    label: "Teknik",
    mb: "Kıl tekniği — el aletiyle kıl kıl çizim",
    pb: "Pudralama — cihazla noktasal gölgeleme",
  },
  {
    label: "Görünüm",
    mb: "Doğal, kıl kıl; gerçek kaş etkisi",
    pb: "Dolgun, pudralı; makyajlı yumuşak etki",
  },
  {
    label: "Uygun cilt tipi",
    mb: "Normal ve kuru cilt",
    pb: "Yağlı, karma ve gözenekli cilt",
  },
  {
    label: "Kalıcılık",
    mb: "12–18 ay",
    pb: "1–3 yıl",
  },
  {
    label: "Seans süresi",
    mb: "≈ 90 dakika",
    pb: "≈ 90 dakika",
  },
  {
    label: "Fiyat aralığı",
    mb: "4.500–6.500 ₺",
    pb: "5.000–7.500 ₺",
  },
  {
    label: "İyileşme",
    mb: "Rötuş 4–6 hafta sonra; çizgiler önce koyulaşıp açılır",
    pb: "Rötuş 4–6 hafta sonra; ton kabuklanma sonrası oturur",
  },
  {
    label: "Kimlere önerilir",
    mb: "Seyrek ama var olan kaşta doğal dolgunluk isteyenler",
    pb: "Uzun kalıcılık ve makyajlı dolgun görünüm isteyenler",
  },
];

const scenarios = [
  "Kaşlarınız seyrek ama mevcut ve mümkün olan en doğal kıl görünümünü istiyorsanız → mikroblading.",
  "Cildiniz yağlı veya gözenekliyse ve pigmentin daha kararlı tutmasını istiyorsanız → kaş pudralama.",
  "Her gün kaş makyajı yapıyorsanız ve dolgun, makyajlı bir etki hedefliyorsanız → kaş pudralama.",
  "Daha kısa taahhüt ve daha kolay yenilenen yarı kalıcı sonuç istiyorsanız → mikroblading.",
  "Daha uzun kalıcılık (1–3 yıl) öncelikliyse → kaş pudralama.",
];

export default async function CompareMicrobladingPowderPage() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Mikroblading ve Kaş Pudralama Karşılaştırması",
          description:
            "Ankara Stria Studio'da mikroblading (kıl tekniği) ile kaş pudralama (powder brows) arasındaki farkları cilt tipi, görünüm, kalıcılık ve fiyata göre karşılaştıran karar rehberi.",
          path: "/mikroblading-mi-kas-pudralama-mi",
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs
        items={[{ name: "Mikroblading mi Kaş Pudralama mı?", path: "/mikroblading-mi-kas-pudralama-mi" }]}
      />

      <Section>
        <h1 className="max-w-[820px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">
          Mikroblading mi, Kaş Pudralama mı? (2026 Karşılaştırma)
        </h1>
        <div className="mt-5 max-w-[760px] rounded-[20px] border border-line bg-blush/50 px-6 py-5">
          <p className="text-[18px] leading-relaxed text-ink">
            Doğal, kıl kıl bir görünüm istiyor ve cildiniz normal ya da kuruysa{" "}
            <strong>mikroblading</strong> daha uygundur. Cildiniz yağlıysa, makyajlı dolgun bir etki
            ve daha uzun kalıcılık (1–3 yıl) arıyorsanız <strong>kaş pudralama</strong> öne çıkar.
            Kesin karar, kaş yapınız ve cilt tipiniz ön görüşmede değerlendirilerek verilir.
          </p>
        </div>
        <ImageSlot
          src="/images/topics/mikroblading-mi-kas-pudralama-mi.png"
          alt="Mikroblading ve kaş pudralama karşılaştırması — doğal kıl ve gölge etkisi"
          ratio="aspect-[16/9]"
          className="mt-8 max-w-[920px] rounded-[24px] border border-line bg-blush"
        />
        <p className="mt-4 text-[14px] text-muted2">Son güncelleme: {LAST_UPDATED}</p>
        <div className="mt-8">
          <CTAButtons settings={s} />
        </div>
      </Section>

      <Section
        eyebrow="Karşılaştırma"
        heading="Mikroblading ve kaş pudralama arasındaki farklar nelerdir?"
      >
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          İki işlem de kalıcı makyaj kapsamındadır ancak uygulama tekniği, uygun cilt tipi ve
          kalıcılık açısından farklılaşır. Aşağıdaki tablo, kararınızı görünüm beklentisi, cilt
          tipi ve bütçeye göre kolaylaştırmak için hazırlanmıştır.
        </p>
        <div className="mt-8 overflow-x-auto rounded-[20px] border border-line bg-white">
          <table className="w-full border-collapse text-left text-[15px]">
            <thead>
              <tr className="bg-blush text-ink">
                <th className="px-5 py-4 font-medium">Kriter</th>
                <th className="px-5 py-4 font-medium">Mikroblading (kıl tekniği)</th>
                <th className="px-5 py-4 font-medium">Kaş Pudralama (powder brows)</th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map((r, i) => (
                <tr key={i} className="border-t border-line align-top">
                  <td className="px-5 py-4 font-medium text-ink">{r.label}</td>
                  <td className="px-5 py-4 text-muted2">{r.mb}</td>
                  <td className="px-5 py-4 text-muted2">{r.pb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 max-w-[720px] text-[15px] leading-relaxed text-muted2">
          Her iki tekniği ayrı ayrı daha ayrıntılı incelemek için{" "}
          <Link href="/kalici-kas-ankara" className="text-accent-dark hover:underline">
            kalıcı kaş
          </Link>{" "}
          ve{" "}
          <Link href="/kas-pudralama-ankara" className="text-accent-dark hover:underline">
            kaş pudralama
          </Link>{" "}
          sayfalarına bakabilirsiniz.
        </p>
      </Section>

      <Section
        eyebrow="Karar rehberi"
        heading="Hangi durumda hangisi?"
        className="bg-blush/40"
      >
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Doğru teknik, tek bir “en iyi” değil size uygun olandır. Aşağıdaki senaryolar, en sık
          rastlanan beklentilere göre hangi işlemin öne çıktığını özetler; kesin uygunluk cilt
          yapınıza göre ön görüşmede netleşir.
        </p>
        <ul className="mt-6 max-w-[760px] space-y-3">
          {scenarios.map((line, i) => (
            <li key={i} className="flex gap-3 text-[17px] leading-relaxed text-muted2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Uygulamanın aşamalarını{" "}
          <Link href="/mikroblading-nasil-yapilir" className="text-accent-dark hover:underline">
            mikroblading nasıl yapılır
          </Link>{" "}
          rehberinde inceleyebilirsiniz.
        </p>
      </Section>

      <Section eyebrow="Kombine seçenek" heading="İkisi birlikte olur mu? (kombine / hybrid brows)">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Evet. Hybrid (kombine) kaş, mikroblading&apos;in kıl kıl çizimini kaş pudralamanın
          gölgeleme dolgunluğuyla birleştirir. Kaş başında doğal kıl efekti, kuyruğa doğru pudralı
          dolgunluk verildiğinde hem doğal hem tanımlı bir sonuç elde edilir. Bu yaklaşım özellikle
          bazı bölgeleri seyrek, bazı bölgeleri belirgin olan kaşlarda tercih edilir; uygunluk cilt
          tipi ve mevcut kaş yoğunluğuna göre ön görüşmede değerlendirilir.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Hamilelik, emzirme, kan sulandırıcı kullanımı, keloid eğilimi, kontrolsüz diyabet ve
          aktif cilt hastalığı gibi durumlar her iki teknik için de ön görüşmede ayrıca
          değerlendirilir.
        </p>
      </Section>

      <Section
        eyebrow="S.S.S."
        heading="Mikroblading ve kaş pudralama hakkında sık sorulanlar"
        narrow
      >
        <p className="mb-8 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          İki teknik arasında seçim yaparken en çok ağrı, doğallık, cilt tipi uyumu ve fiyat farkı
          merak edilir. Aşağıdaki kısa yanıtlar karar için temel bilgiyi verir; kişisel uygunluk ve
          kesin planlama için stüdyoyla doğrudan görüşmek gerekir.
        </p>
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link
            href="/mikroblading-fiyatlari"
            className="inline-flex items-center gap-1.5 text-accent-dark hover:underline"
          >
            Mikroblading Fiyatları <ArrowIcon className="h-4 w-4" />
          </Link>
          <Link
            href="/kas-pudralama-ankara"
            className="inline-flex items-center gap-1.5 text-accent-dark hover:underline"
          >
            Kaş Pudralama Ankara <ArrowIcon className="h-4 w-4" />
          </Link>
          <Link
            href="/kalici-kas-ankara"
            className="inline-flex items-center gap-1.5 text-accent-dark hover:underline"
          >
            Kalıcı Kaş Ankara <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
