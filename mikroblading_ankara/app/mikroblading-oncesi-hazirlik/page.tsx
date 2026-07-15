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
import { serviceSchema, faqSchema, howToSchema } from "@/lib/schema";
import { ArrowIcon } from "@/components/Icons";

export const metadata: Metadata = buildMetadata({
  title: "Mikroblading Öncesi Hazırlık: Yapılması Gerekenler",
  description:
    "Mikroblading öncesi hazırlık rehberi: alkol ve kafein, kan sulandırıcılar, güneş, kaş bakımı ve randevu günü. 1 hafta ve 48 saat öncesi yapılacaklar. Ankara.",
  path: "/mikroblading-oncesi-hazirlik",
});

const prepSteps = [
  "İşlemden 1 hafta önce güneşlenmeyi, solaryumu ve kaş bölgesine peeling/lazer uygulamalarını bırakın.",
  "Retinol, AHA/BHA, roaccutane (izotretinoin) kullanıyorsanız durumu mutlaka hekiminize danışın.",
  "İşlemden 48 saat önce alkol tüketimini tamamen kesin.",
  "Aspirin, omega-3, E vitamini gibi kan sulandırıcı takviyelere yalnızca hekim onayıyla ara verin.",
  "Randevu günü kahve ve enerji içeceği gibi kafeini sınırlayın.",
  "Kaş bölgesine makyaj yapmadan, tok karnına ve dinlenmiş şekilde gelin.",
  "İşleme yaklaşık 90 dakikalık bir zaman ayırın; acele etmeyin.",
  "Kaşlarınızı önceden almayın veya ağartmayın; mevcut kıllar tasarımda kullanılır.",
];

const faqs = [
  {
    q: "Mikroblading öncesi kahve içilir mi?",
    a: "Randevu günü kahve ve enerji içeceği gibi kafeini sınırlamak gerekir. Kafein, kan dolaşımını hızlandırıp işlem sırasında sızıntı ve hassasiyeti artırabilir. Bir gün önceden azaltmak, pigmentin daha rahat tutunmasına yardımcı olur.",
  },
  {
    q: "Mikroblading öncesi alkol neden yasak?",
    a: "Alkol kanı sulandırıcı etki yaptığı için işlem sırasında kanama ve sızıntıyı artırır; bu da pigment tutulumunu düşürür. Bu nedenle randevudan en az 48 saat önce alkol tüketimini tamamen kesmeniz önerilir.",
  },
  {
    q: "Mikroblading öncesi kaşları alayım mı?",
    a: "Hayır, kaşlarınızı önceden almayın veya ağartmayın. Uygulayıcı mevcut doğal kılları tasarımda referans olarak kullanır. Şekillendirme işlem sırasında yapılır; erken alınan kıllar simetriyi planlamayı zorlaştırabilir.",
  },
  {
    q: "Mikroblading randevusuna makyajla gidilir mi?",
    a: "Kaş bölgesine makyaj yapmadan gelmeniz gerekir. Yüzün geri kalanında hafif makyaj sorun değildir, ancak kaş çevresi temiz olmalıdır. Böylece uygulayıcı doğal kaş yapısını net görüp tasarımı doğru planlar.",
  },
  {
    q: "Adet döneminde mikroblading yaptırılır mı?",
    a: "Adet döneminde işlem yapılabilir, ancak bu günlerde ağrı eşiği düşebilir ve hassasiyet artabilir. Rahatınız için randevuyu bu dönemin dışına almak tercih edilebilir; kesin karar için ön görüşmede durumunuz değerlendirilir.",
  },
  {
    q: "Roaccutane (izotretinoin) kullanıyorum, ne yapmalıyım?",
    a: "Roaccutane cilt yenilenmesini ve iyileşmeyi etkilediği için işlem öncesi mutlaka hekiminize danışmalısınız. Genellikle ilaç bırakıldıktan sonra belirli bir bekleme süresi önerilir. Uygunluğunuz ön görüşmede değerlendirilir.",
  },
];

const timeline = [
  {
    when: "1 hafta önce",
    text: "Retinol, AHA/BHA ve roaccutane kullanımı için hekiminize danışın. Güneşlenmeyi ve solaryumu bırakın; kaş bölgesine peeling, lazer veya asitli bakım uygulamayın. Cildinizin sakin ve tahrişsiz olması pigment tutulumunu artırır.",
  },
  {
    when: "48 saat önce",
    text: "Alkolü tamamen kesin. Aspirin, omega-3, E vitamini gibi kan sulandırıcı takviyelere yalnızca hekim onayıyla ara verin. Bu, işlem sırasında kanama ve sızıntıyı azaltarak rengin daha iyi yerleşmesini sağlar.",
  },
  {
    when: "Randevu günü",
    text: "Kahve ve enerji içeceği gibi kafeini sınırlayın. Kaş bölgesine makyaj yapmadan, tok karnına ve dinlenmiş gelin. İşleme yaklaşık 90 dakika ayırın; acele etmeyeceğiniz bir gün seçmek konforunuzu artırır.",
  },
  {
    when: "Randevuya gelirken",
    text: "İstediğiniz kaş şekline dair fotolı referanslar getirebilirsiniz. Kaşlarınızı önceden ALMAYIN veya ağartmayın; mevcut kıllar tasarımda kullanılır ve şekillendirme işlem sırasında yapılır.",
  },
];

const consult = [
  "Kan sulandırıcı ilaç kullananlar (aspirin, antikoagülanlar vb.).",
  "Roaccutane (izotretinoin) veya güçlü retinoid tedavisi görenler.",
  "Diyabet, otoimmün hastalık veya iyileşmeyi etkileyen kronik rahatsızlığı olanlar.",
  "Gebelik veya emzirme dönemindekiler.",
  "Kaş bölgesinde aktif cilt problemi, egzama veya alerji öyküsü olanlar.",
];

export default async function MikrobladingOncesiHazirlikPage() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Mikroblading Öncesi Hazırlık",
          description:
            "Mikroblading öncesi hazırlık rehberi: alkol ve kafein, kan sulandırıcılar, güneş ve kaş bakımı ile randevu günü yapılması gerekenler.",
          path: "/mikroblading-oncesi-hazirlik",
        })}
      />
      <JsonLd
        data={howToSchema({
          name: "Mikroblading randevusuna nasıl hazırlanılır?",
          description:
            "Mikroblading öncesinde pigment tutulumunu artırmak ve kanamayı azaltmak için adım adım hazırlık rehberi.",
          steps: prepSteps,
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Mikroblading Öncesi Hazırlık", path: "/mikroblading-oncesi-hazirlik" }]} />

      <Section>
        <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-accent">Son güncelleme: {LAST_UPDATED}</p>
        <h1 className="max-w-[820px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">
          Mikroblading Öncesi Hazırlık: Yapılması ve Kaçınılması Gerekenler
        </h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-relaxed text-muted2">
          Randevudan 24–48 saat önce alkol ve kafeinden kaçının, kan sulandırıcılara hekiminize
          danışarak ara verin ve kaş bölgesine güneş ile peeling uygulamayın. Bu basit adımlar
          pigmentin daha iyi tutunmasını sağlar; kanamayı ve sızıntıyı azaltarak daha net bir sonuç
          elde etmenize yardımcı olur.
        </p>
        <div className="mt-8"><CTAButtons settings={s} /></div>
      </Section>

      <Section eyebrow="Zaman çizelgesi" heading="Mikroblading öncesi ne zaman ne yapılmalı?">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Hazırlık, işlemden bir hafta önce başlar ve randevu gününe kadar kademeli olarak ilerler.
          Aşağıdaki zaman çizelgesi, her dönemde yapmanız ve kaçınmanız gerekenleri özetler. Kişisel
          durumunuza göre öneriler ön görüşmede netleştirilir.
        </p>
        <ol className="mt-6 max-w-[760px] space-y-4">
          {timeline.map((t) => (
            <li key={t.when} className="rounded-2xl border border-line bg-white/60 p-5">
              <p className="text-[15px] font-semibold text-ink">{t.when}</p>
              <p className="mt-1.5 text-[16px] leading-relaxed text-muted2">{t.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          İşlemin nasıl uygulandığını{" "}
          <Link href="/mikroblading-nasil-yapilir" className="text-accent-dark hover:underline">mikroblading nasıl yapılır</Link>{" "}
          rehberinden, sonrasını ise{" "}
          <Link href="/mikroblading-sonrasi-bakim" className="text-accent-dark hover:underline">mikroblading sonrası bakım</Link>{" "}
          rehberinden inceleyebilirsiniz.
        </p>
      </Section>

      <Section eyebrow="Kafein ve alkol" heading="Mikroblading öncesi neden kahve ve alkol kısıtlanır?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Alkol ve kafein kan akışını hızlandırıp kanı sulandırıcı etki gösterir. Bu da işlem
          sırasında kanamayı ve sızıntıyı artırarak pigmentin cilde tutunmasını zorlaştırır. Bu
          nedenle alkolü randevudan en az 48 saat önce kesmeniz, kafeini ise işlem günü sınırlamanız
          önerilir. Bu küçük değişiklikler rengin daha düzgün oturmasına katkı sağlar.
        </p>
      </Section>

      <Section eyebrow="Ön görüşme" heading="Kimler randevudan önce hekime danışmalı?">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Bazı durumlarda işlem öncesi hekim onayı gerekir. Aşağıdaki gruplardaysanız, uygunluğunuz
          ve gerekli önlemler için önce hekiminize, ardından ön görüşmede uygulayıcınıza danışın.
          Güvenlik her zaman estetik beklentinin önündedir.
        </p>
        <ul className="mt-6 max-w-[760px] space-y-2 text-[16px] leading-relaxed text-muted2">
          {consult.map((c) => (
            <li key={c} className="flex gap-2"><span aria-hidden className="text-accent-dark">•</span><span>{c}</span></li>
          ))}
        </ul>
        <p className="mt-6 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          İşlemin riskleri ve kimlere uygun olmadığı hakkında ayrıntı için{" "}
          <Link href="/mikroblading-zararli-mi" className="text-accent-dark hover:underline">mikroblading zararlı mı</Link>{" "}
          sayfasını okuyabilirsiniz.
        </p>
      </Section>

      <Section eyebrow="S.S.S." heading="Mikroblading öncesi hazırlık hakkında sık sorulanlar" narrow className="bg-blush/40">
        <p className="mb-8 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Danışanların işlem öncesinde en sık sorduğu konular kahve ve alkol, kaş bakımı, makyaj ve
          ilaç kullanımıdır. Aşağıdaki kısa yanıtlar genel rehberdir; kişisel durumunuz ön görüşmede
          değerlendirilir.
        </p>
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/mikroblading-nasil-yapilir" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Mikroblading Nasıl Yapılır <ArrowIcon className="h-4 w-4" /></Link>
          <Link href="/mikroblading-sonrasi-bakim" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Mikroblading Sonrası Bakım <ArrowIcon className="h-4 w-4" /></Link>
          <Link href="/mikroblading-fiyatlari" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Mikroblading Fiyatları <ArrowIcon className="h-4 w-4" /></Link>
          <Link href="/iletisim" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">İletişim <ArrowIcon className="h-4 w-4" /></Link>
        </div>
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
