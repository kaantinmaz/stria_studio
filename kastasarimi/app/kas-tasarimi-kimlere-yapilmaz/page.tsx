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

export const metadata: Metadata = buildMetadata({
  title: "Kaş Tasarımı Kimlere Yapılmaz? Uygunluk Rehberi | Ankara",
  description:
    "Kaş tasarımı kimlere yapılmaz? Hamilelik, kan sulandırıcı kullanımı, aktif cilt sorunları ve diğer durumlarda uygulama kararı. Ücretsiz ön görüşmede uygunluk kontrolü.",
  path: "/kas-tasarimi-kimlere-yapilmaz",
});

// Answer-first: durum listesi hem görünür içerik hem FAQ schema olarak sunulur.
const notSuitable = [
  {
    title: "Hamilelik ve emzirme dönemi",
    text: "Pigment uygulaması hamilelik ve emzirme döneminde önerilmez. Bu dönemin bitmesini bekleyip sonrasında randevu planlamak en güvenli yoldur.",
  },
  {
    title: "Kan sulandırıcı ilaç kullanımı ve pıhtılaşma bozuklukları",
    text: "Kan sulandırıcı kullananlar ve pıhtılaşma bozukluğu olanlar, işlem öncesi mutlaka doktor onayı almalıdır; onaysız uygulama yapılmaz.",
  },
  {
    title: "Kontrolsüz diyabet",
    text: "Kontrol altında olmayan diyabette iyileşme yavaşlar ve enfeksiyon riski artar. Değerleri düzenli olan danışanlarda doktor onayıyla uygulanabilir.",
  },
  {
    title: "Kaş bölgesinde aktif cilt sorunu",
    text: "Uygulama alanında egzama, sedef, aktif akne ya da açık yara varsa bölge iyileşmeden işlem yapılmaz.",
  },
  {
    title: "Keloid (aşırı yara izi) eğilimi",
    text: "Keloid öyküsü olan ciltlerde pigment uygulaması iz riskini artırabilir; ön görüşmede birlikte değerlendirilir.",
  },
  {
    title: "Kemoterapi / radyoterapi süreci",
    text: "Aktif onkolojik tedavi sırasında uygulama yapılmaz. Tedavi sonrası dönemde doktorunuzun yazılı onayıyla planlanabilir.",
  },
  {
    title: "Yakın zamanda cilt tedavisi veya güçlü akne ilacı",
    text: "Ağır akne ilacı (izotretinoin) kullanımının bitiminden sonra en az 6 ay beklenmesi önerilir. Kaş çevresine yakın botoks/dolgu sonrası 2 hafta ara verilmelidir.",
  },
  {
    title: "18 yaş altı",
    text: "Kalıcı pigment uygulamaları 18 yaş altına yapılmaz.",
  },
];

const faqs = [
  {
    q: "Kaş tasarımı kimlere yapılmaz?",
    a: "Hamile ve emziren kadınlara, kan sulandırıcı kullanan ve doktor onayı olmayanlara, kontrolsüz diyabeti olanlara, kaş bölgesinde aktif cilt sorunu bulunanlara, keloid eğilimi olanlara, aktif kemoterapi/radyoterapi sürecindekilere ve 18 yaş altına kaş tasarımı uygulanmaz.",
  },
  {
    q: "Hamilelikte kaş tasarımı yaptırılır mı?",
    a: "Hayır. Hamilelik ve emzirme döneminde pigment uygulaması önerilmez. Bu dönem bittikten sonra güvenle yaptırabilirsiniz.",
  },
  {
    q: "Kronik hastalığım var, kaş tasarımı yaptırabilir miyim?",
    a: "Duruma göre değişir. Diyabet, kalp rahatsızlığı veya düzenli ilaç kullanımı varsa önce doktorunuzdan onay istenir; uygunluk ücretsiz ön görüşmede birlikte değerlendirilir.",
  },
  {
    q: "Uygun olup olmadığımı nasıl öğrenirim?",
    a: "Stria Studio'da her uygulama ücretsiz ön görüşmeyle başlar. Cilt tipiniz, sağlık geçmişiniz ve beklentileriniz değerlendirilir; uygun değilseniz işlem yapılmaz ve alternatif zamanlama önerilir.",
  },
  {
    q: "Botoks veya dolgu sonrası ne kadar beklemeliyim?",
    a: "Kaş çevresine yakın botoks veya dolgu uygulamasından sonra en az 2 hafta beklenmesi önerilir.",
  },
];

export default async function Page() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Kaş Tasarımı Uygunluk Değerlendirmesi",
          description: faqs[0].a,
          path: "/kas-tasarimi-kimlere-yapilmaz",
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs
        items={[{ name: "Kimlere Yapılmaz", path: "/kas-tasarimi-kimlere-yapilmaz" }]}
      />

      <Section>
        <h1 className="max-w-[820px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">
          Kaş tasarımı kimlere yapılmaz?
        </h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-relaxed text-muted2">
          Kaş tasarımı çoğu kişi için güvenli bir uygulamadır; ancak hamilelik, kan sulandırıcı
          kullanımı, kontrolsüz diyabet, bölgede aktif cilt sorunu, keloid eğilimi, aktif
          kemoterapi/radyoterapi süreci ve 18 yaş altı gibi durumlarda uygulanmaz. Stria
          Studio&apos;da uygunluk, işlemden önce ücretsiz ön görüşmede birlikte değerlendirilir —
          uygun değilseniz işlem yapılmaz.
        </p>
        <ImageSlot
          src="/images/topics/kas-tasarimi-kimlere-yapilmaz.png"
          alt="Kaş tasarımı öncesi sağlık ve cilt uygunluğu değerlendirmesi"
          ratio="aspect-[16/9]"
          className="mt-8 rounded-[2px] border border-line"
        />
        <div className="mt-8">
          <CTAButtons settings={s} />
        </div>
      </Section>

      <Section
        eyebrow="Uygunluk"
        heading="Hangi durumlarda kaş tasarımı uygulanmaz?"
        className="bg-blush/40"
      >
        <div className="grid gap-px bg-line md:grid-cols-2">
          {notSuitable.map((item) => (
            <div key={item.title} className="bg-cream p-7">
              <h3 className="text-[17px] font-medium text-ink">{item.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted2">{item.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-[720px] text-[13px] leading-relaxed text-muted">
          Bu liste bilgilendirme amaçlıdır ve tıbbi tavsiye yerine geçmez. Kronik bir rahatsızlığınız
          veya düzenli ilaç kullanımınız varsa işlem öncesi doktorunuza danışın.
        </p>
      </Section>

      <Section eyebrow="Ön görüşme" heading="Uygunluk nasıl değerlendirilir?">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Her uygulama ücretsiz ön görüşmeyle başlar: cilt tipiniz, sağlık geçmişiniz ve
          beklentileriniz değerlendirilir. Şüpheli bir durum varsa işlem ertelenir veya doktor
          onayı istenir. Uygunsanız form, yüz simetriniz ve altın oran ölçümüne göre birlikte
          belirlenir — süreci adım adım görmek için{" "}
          <Link href="/kas-tasarimi-nasil-yapilir" className="text-accent-dark hover:underline">
            kaş tasarımı nasıl yapılır
          </Link>{" "}
          sayfasına bakabilirsiniz.
        </p>
      </Section>

      <Section eyebrow="S.S.S." heading="Uygunluk hakkında sık sorulanlar" narrow className="bg-blush/40">
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/kas-tasarimi-nedir" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            Kaş tasarımı nedir? <ArrowIcon className="h-4 w-4" />
          </Link>
          <Link href="/kas-tasarimi-iyilesme-sureci" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            İyileşme süreci <ArrowIcon className="h-4 w-4" />
          </Link>
          <Link href="/kas-tasarimi-fiyatlari" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            Fiyatlar <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
