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
  title: "Erkek Kaş Tasarımı Ankara | Doğal, Kalıcı | Stria Studio",
  description:
    "Erkek kaş tasarımı: kavisi az, düz ve dolgun, abartısız doğal form. Kıl tekniğiyle tek tek işlenir, 12–18 ay kalıcıdır. Ankara Çankaya, Stria Studio.",
  path: "/erkek-kas-tasarimi-ankara",
});

const faqs = [
  {
    q: "Erkek kaş tasarımı kadın kaş tasarımından nasıl farklıdır?",
    a: "Kavis oranı belirgin şekilde düşük tutulur; çizgi daha düz ve yataya yakın ilerler, keskin bir kemer noktası oluşturulmaz. Yoğunluk kadın formuna göre daha kalın bırakılır, sonuç sade ve erkeksi durur.",
  },
  {
    q: "Sonuç fark edilir mi, yapay durur mu?",
    a: "Hayır. Her kıl tek tek işlendiği için blok dolgu görünümü oluşmaz. İş ve sosyal ortamda kimse bir işlem yaptırdığınızı fark etmez; yalnızca daha toplu ve bakımlı bir kaş görünümü dikkat çeker.",
  },
  {
    q: "İşlem sırasında mahremiyet nasıl sağlanır?",
    a: "Randevular tek danışanlık kapalı bir odada, önceden belirlenen saatte yapılır. Bekleme alanında karşılaşma olmadan giriş çıkış planlanabilir.",
  },
  {
    q: "Erkeklerde kalıcılık süresi kadınlarla aynı mı?",
    a: "Evet, kalıcılık öncelikle cilt tipine bağlıdır; ortalama 12–18 aydır. Ayrıntı için kaş tasarımı kalıcı mı sayfasına bakabilirsiniz.",
  },
];

export default async function Page() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Erkek Kaş Tasarımı",
          description: faqs[0].a,
          path: "/erkek-kas-tasarimi-ankara",
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Erkek Kaş Tasarımı", path: "/erkek-kas-tasarimi-ankara" }]} />

      <Section>
        <h1 className="max-w-[820px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">
          Erkek kaş tasarımı — Ankara
        </h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-relaxed text-muted2">
          Erkek kaş tasarımı, kadın kaş formundan farklı olarak kavisi az, düz ve dolgun bir çizgi
          hedefler; sonuç abartısız ve doğal görünür. Ankara Çankaya&apos;daki Stria Studio&apos;da
          form yüz hatlarınıza göre belirlenir, kıl tekniğiyle tek tek işlenir ve 12–18 ay
          kalıcıdır.
        </p>
        <ImageSlot
          src="/images/topics/erkek-kas-tasarimi-ankara.png"
          alt="Erkek yüz hatlarına uygun doğal ve düz kaş tasarımı"
          ratio="aspect-[16/9]"
          className="mt-8 rounded-[2px] border border-line"
        />
        <div className="mt-8">
          <CTAButtons settings={s} />
        </div>
      </Section>

      <Section eyebrow="Form" heading="Erkek kaş formu nasıl farklılaşır?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kadın kaş tasarımında aranan yüksek kemer ve incelen uç, erkek formunda tercih edilmez.
          Çizgi daha düz ilerler, kalınlık baştan sona daha homojen bırakılır ve kaşın doğal
          kalınlığı korunur. Amaç yüzü çerçevelemek, dikkat çeken bir kaş formu yaratmak değildir.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Form, ölçü ve tasarım mantığının genel işleyişi için{" "}
          <Link href="/kas-tasarimi-nedir" className="text-accent-dark hover:underline">
            kaş tasarımı nedir
          </Link>{" "}
          sayfasına bakabilirsiniz.
        </p>
      </Section>

      <Section eyebrow="Süreç" heading="Süreç ve gizlilik">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Ön görüşmede form kalemle yüzünüze çizilir ve onayınız alınmadan uygulamaya
          geçilmez. Randevular tek danışanlık kapalı bir odada yapılır; işlem günlük hayatınızı
          aksatmadan, dikkat çekmeden tamamlanır.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Uygulama adımlarının tamamı için{" "}
          <Link href="/kas-tasarimi-nasil-yapilir" className="text-accent-dark hover:underline">
            kaş tasarımı nasıl yapılır
          </Link>{" "}
          sayfasında ayrıntılı anlatım bulabilirsiniz.
        </p>
      </Section>

      <Section eyebrow="Kimler için" heading="Kimler için uygun?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kaşları seyrek, asimetrik veya yıllar içinde incelmiş erkekler; günlük olarak kaş
          kalemiyle uğraşmak istemeyenler ve fotoğrafta/kamerada daha toplu bir kaş görünümü
          isteyenler için uygundur. Uygunluk, ücretsiz ön görüşmede değerlendirilir.
        </p>
      </Section>

      <Section eyebrow="S.S.S." heading="Erkek kaş tasarımı hakkında sık sorulanlar" narrow>
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/kas-tasarimi-nasil-yapilir" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            Nasıl yapılır? <ArrowIcon className="h-4 w-4" />
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
