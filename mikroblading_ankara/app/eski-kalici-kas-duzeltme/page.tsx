import type { Metadata } from "next";
import Link from "next/link";
import { getSettings, SETTINGS_FALLBACK } from "@/lib/content";
import { LAST_UPDATED } from "@/lib/copy";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/Section";
import { CTAButtons, CTABanner } from "@/components/CTA";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { serviceSchema, faqSchema } from "@/lib/schema";
import { ArrowIcon } from "@/components/Icons";

export const metadata: Metadata = buildMetadata({
  title: "Eski Kalıcı Kaş Düzeltme Ankara | Eski Pigment Üzerine",
  description:
    "Eski kalıcı makyaj üzerine mikroblading olur mu? Kaş dövmesi düzeltme, renk nötralizasyonu ve kalıcı kaş silme yönlendirmesi — Ankara Stria Studio ön görüşme.",
  path: "/eski-kalici-kas-duzeltme",
});

const cases = [
  {
    title: "Solmuş eski mikroblading → yenileme",
    text: "Zamanla açılmış, soluk veya kırık çizgiler hâline gelmiş eski mikroblading çoğu zaman yenilenebilir. Kalan pigment açıksa üzerine yeni tel tel çizim uygulanarak form ve yoğunluk tazelenir.",
  },
  {
    title: "Hafif renk kayması (kırmızımsı/mavimsi ton) → renk nötralizasyonu",
    text: "Eski pigment kırmızıya, turuncuya veya maviye/gri-yeşile dönmüşse, tamamlayıcı ton uygulamalarıyla renk dengelenmeye çalışılır. Nötralizasyonun kapsamı, mevcut tonun yoğunluğuna göre ön değerlendirmede belirlenir.",
  },
  {
    title: "Form bozukluğu / asimetri → sınırları yeniden çerçeveleme",
    text: "Yanlış çizilmiş, çok kalın ya da asimetrik eski kaşlarda, yüz oranlarına göre yeni bir tasarımla sınırlar yeniden çerçevelenir. Eski pigmentin taştığı alanlarda kapatma her zaman tam olmayabilir; sınır dürüstçe paylaşılır.",
  },
  {
    title: "Çok koyu blok dövme → önce açma gerekir",
    text: "Koyu, doygun ve blok hâlinde eski dövmelerde doğrudan üzerine çalışmak doğal sonuç vermez. Bu durumlarda önce lazer/removal ile açma gerekebilir; gerçekçi olmayan sonuç yerine dürüst bir yönlendirme yapılır.",
  },
];

const steps = [
  {
    step: "1. WhatsApp'tan fotoğraf",
    text: "Mevcut kaşlarınızın gün ışığında, makyajsız ve net çekilmiş fotoğrafını WhatsApp üzerinden gönderirsiniz. Farklı açılardan birkaç kare, ilk değerlendirmeyi kolaylaştırır.",
  },
  {
    step: "2. Ön değerlendirme",
    text: "Fotoğraflar üzerinden eski pigmentin rengi, yoğunluğu ve dağılımı hakkında ilk izlenim paylaşılır. Bu aşama, sürecin üzerine çalışma mı yoksa önce açma yönlendirmesi mi gerektirdiğine dair fikir verir.",
  },
  {
    step: "3. Yüz yüze analiz",
    text: "Kesin karar, yüz yüze görüşmede verilir. Pigmentin cilt altındaki derinliği, ton ve deri yapısı yakından incelenir; fotoğrafta görünmeyen ayrıntılar bu aşamada netleşir.",
  },
  {
    step: "4. Plan: yenileme / nötralizasyon / açma yönlendirmesi",
    text: "İncelemenin ardından size özel bir yol haritası sunulur: doğrudan yenileme, renk nötralizasyonu ya da önce açma (removal) yönlendirmesi. Her seçeneğin beklentisi ve kapsamı açıkça anlatılır.",
  },
];

const faqs = [
  {
    q: "Eski dövme kaşım var, üzerine mikroblading olur mu?",
    a: "Bu, eski pigmentin rengine, yoğunluğuna ve derinliğine bağlıdır. Açılmış ve soluk kalıntı üzerine çoğu zaman çalışılabilir; koyu ve doygun eski dövmelerde ise önce açma (lazer/removal) gerekebilir. Karar, fotoğraf ön değerlendirmesi ve yüz yüze görüşmeyle birlikte verilir.",
  },
  {
    q: "Başka yerde yapılan başarısız mikroblading düzeltilir mi?",
    a: "Birçok durumda düzeltme mümkündür; solmuş çizimler yenilenebilir, hafif renk kaymaları nötralize edilmeye çalışılır, form bozuklukları yeniden çerçevelenebilir. Ancak sonucun sınırı mevcut pigmentin durumuna bağlıdır ve bazı vakalarda önce açma gerekebilir; bu ön değerlendirmede netleşir.",
  },
  {
    q: "Düzeltme için kaç seans gerekir?",
    a: "Tek seansta mükemmel sonuç vaadi verilmez. Yenileme genellikle uygulama ve rötuşla ilerlerken, renk kayması veya yoğun eski pigment içeren durumlar 2 veya daha fazla seans gerektirebilir. Gerçekçi seans sayısı, kaşınız incelendikten sonra paylaşılır.",
  },
  {
    q: "Lazerle silme gerekir mi, nasıl anlaşılır?",
    a: "Eski pigment çok koyu, doygun veya blok hâlindeyse doğrudan üzerine çalışmak doğal sonuç vermez; bu durumlarda önce lazer/removal ile açma önerilebilir. Gerekliliği fotoğraf ve yüz yüze inceleme belirler. Uygun olmayan bir vakada zorlamak yerine dürüst yönlendirme yapılır.",
  },
  {
    q: "Rengi kızarıyor veya morarıyor, neden?",
    a: "Eski kalıcı makyaj pigmentleri zamanla ve cilt altındaki tepkilere bağlı olarak kırmızımsı-turuncu veya mavimsi-gri tonlara kayabilir. Bu, kullanılan boyanın içeriği ve derinliğiyle ilgilidir. Tamamlayıcı ton uygulamalarıyla dengelenmesi çoğu durumda mümkündür; kapsamı ön değerlendirmede konuşulur.",
  },
  {
    q: "Düzeltme fiyatı nasıl belirlenir?",
    a: "Fiyat tek bir standart değildir; işin kapsamına, eski pigmentin durumuna ve gereken seans sayısına göre belirlenir. Bu nedenle ön değerlendirme ücretsizdir. Kaşınız incelenmeden kesin fiyat verilmez; size en uygun planla birlikte net bir bilgi paylaşılır.",
  },
];

export default async function EskiKaliciKasDuzeltmePage() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Eski Kalıcı Kaş Düzeltme",
          description:
            "Eski kalıcı makyaj ve kaş dövmesi düzeltme: solmuş mikroblading yenileme, renk nötralizasyonu, form yeniden çerçeveleme ve kalıcı kaş silme yönlendirmesi.",
          path: "/eski-kalici-kas-duzeltme",
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Eski Kalıcı Kaş Düzeltme", path: "/eski-kalici-kas-duzeltme" }]} />

      <Section>
        <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-accent">Son güncelleme: {LAST_UPDATED}</p>
        <h1 className="max-w-[860px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">
          Eski Kalıcı Kaş Düzeltme — Eski Pigment Üzerine Mikroblading Olur mu?
        </h1>
        <p className="mt-5 max-w-[740px] text-[19px] leading-relaxed text-muted2">
          Cevap eski pigmentin rengine, yoğunluğuna ve derinliğine bağlıdır. Açılmış ve soluk kalıntı
          üzerine çoğu zaman çalışılabilir; koyu ve doygun eski dövmelerde ise önce açma (lazer/removal)
          gerekebilir. Karar, fotoğraf ön değerlendirmesi ve yüz yüze görüşmeyle birlikte verilir.
        </p>
        <div className="mt-8"><CTAButtons settings={s} /></div>
      </Section>

      <Section eyebrow="Hangi durumlar" heading="Eski kalıcı kaş hangi durumlarda düzeltilebilir?">
        <p className="max-w-[740px] text-[17px] leading-relaxed text-muted2">
          Eski kaş dövmesi düzeltme, tek bir yönteme indirgenmez; mevcut pigmentin durumu hangi
          yaklaşımın uygun olduğunu belirler. Aşağıdaki dört senaryo, en sık karşılaşılan durumları ve
          gerçekçi çözüm yollarını özetler. Sizinki için kesin değerlendirme yüz yüze yapılır.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {cases.map((c) => (
            <div key={c.title} className="rounded-2xl border border-line bg-white/60 p-5">
              <p className="text-[15px] font-semibold text-ink">{c.title}</p>
              <p className="mt-1.5 text-[16px] leading-relaxed text-muted2">{c.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-[740px] text-[17px] leading-relaxed text-muted2">
          Yapılmış çalışmalara{" "}
          <Link href="/galeri" className="text-accent-dark hover:underline">galeri</Link>{" "}
          sayfasından, uygulama tekniğine ise{" "}
          <Link href="/mikroblading-nasil-yapilir" className="text-accent-dark hover:underline">mikroblading nasıl yapılır</Link>{" "}
          rehberinden göz atabilirsiniz.
        </p>
      </Section>

      <Section eyebrow="Süreç" heading="Düzeltme süreci nasıl işler?" className="bg-blush/40">
        <p className="max-w-[740px] text-[17px] leading-relaxed text-muted2">
          Süreç, fotoğrafla başlayan ve yüz yüze analizle netleşen adımlardan oluşur. Amaç, kaşınıza
          uygun olmayan bir işlemi zorlamak değil; size en doğru ve gerçekçi planı sunmaktır.
        </p>
        <ol className="mt-6 max-w-[780px] space-y-4">
          {steps.map((t) => (
            <li key={t.step} className="rounded-2xl border border-line bg-white/60 p-5">
              <p className="text-[15px] font-semibold text-ink">{t.step}</p>
              <p className="mt-1.5 text-[16px] leading-relaxed text-muted2">{t.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section eyebrow="Beklenti yönetimi" heading="Düzeltmede gerçekçi beklenti nasıl olmalı?">
        <p className="max-w-[740px] text-[17px] leading-relaxed text-muted2">
          Düzeltme çalışmalarında dürüstlük esastır. Tek seansta mükemmel sonuç sözü verilmez; kimi
          durumda 2 veya daha fazla seans gerekir, kimi durumda ise önce lazer/removal gibi başka bir
          işlem gerekir. Eski pigment kapatmanın da bir sınırı vardır: koyu ve doygun kalıntılar her
          zaman tam örtülemez. Size, sonucun ne olacağı kadar ne olamayacağı da açıkça anlatılır; böylece
          kararınızı gerçekçi bir zemin üzerinde verirsiniz. İşlemin güvenlik yönlerini{" "}
          <Link href="/mikroblading-zararli-mi" className="text-accent-dark hover:underline">mikroblading zararlı mı</Link>{" "}
          sayfasından inceleyebilirsiniz.
        </p>
      </Section>

      <Section eyebrow="Deneyim" heading="Düzeltmede deneyim neden önemli?" className="bg-blush/40">
        <p className="max-w-[740px] text-[17px] leading-relaxed text-muted2">
          Düzeltme, sıfırdan uygulamadan daha zordur; çünkü eski pigmentin rengiyle, derinliğiyle ve
          bıraktığı formla çalışmak gerekir. Doğru teşhis, hangi durumun yenilemeye, hangisinin
          nötralizasyona, hangisinin açmaya uygun olduğunu ayırt edebilmeyi ister. Deneyim, gerçekçi
          olmayan bir sonucu zorlamak yerine sizi doğru işleme yönlendirmeyi de kapsar. Standart{" "}
          <Link href="/kalici-kas-ankara" className="text-accent-dark hover:underline">kalıcı kaş Ankara</Link>{" "}
          uygulamaları hakkında daha fazla bilgi alabilirsiniz.
        </p>
      </Section>

      <Section eyebrow="S.S.S." heading="Eski kalıcı kaş düzeltme hakkında sık sorulanlar" narrow>
        <p className="mb-8 max-w-[740px] text-[17px] leading-relaxed text-muted2">
          Danışanların düzeltme öncesi en çok merak ettiği konular; eski dövmenin üzerine çalışılıp
          çalışılamayacağı, seans sayısı, lazer gerekliliği ve fiyatlandırmadır. Aşağıdaki yanıtlar
          genel bir rehberdir; kesin değerlendirme ön görüşmede yapılır.
        </p>
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/galeri" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Galeri <ArrowIcon className="h-4 w-4" /></Link>
          <Link href="/kalici-kas-ankara" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Kalıcı Kaş Ankara <ArrowIcon className="h-4 w-4" /></Link>
          <Link href="/mikroblading-zararli-mi" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Mikroblading Zararlı mı <ArrowIcon className="h-4 w-4" /></Link>
          <Link href="/iletisim" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">İletişim <ArrowIcon className="h-4 w-4" /></Link>
        </div>
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
