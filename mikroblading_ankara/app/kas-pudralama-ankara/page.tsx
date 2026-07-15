import type { Metadata } from "next";
import Link from "next/link";
import { getSettings, SETTINGS_FALLBACK } from "@/lib/content";
import { LAST_UPDATED } from "@/lib/copy";
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
  title: "Kaş Pudralama Ankara (Powder Brows) | Stria Studio",
  description:
    "Kaş pudralama (powder brows) Ankara: pudralı, makyajlı gölge efekti veren kalıcı kaş tekniği. Özellikle yağlı ciltler için ideal, 1–3 yıl kalıcılık, 5.000–7.500 ₺.",
  path: "/kas-pudralama-ankara",
});

const faqs = [
  {
    q: "Kaş pudralama acıtır mı?",
    a: "İşlem öncesi sürülen anestezik krem sayesinde çoğu danışan yalnızca hafif bir baskı hisseder. Cilt hassasiyeti kişiye göre değişir; rahatsızlık ihtimali ve hassasiyetiniz ön görüşmede değerlendirilir ve krem etki süresi buna göre ayarlanır.",
  },
  {
    q: "Kaş pudralama ne kadar kalıcıdır?",
    a: "Kaş pudralama genellikle 1–3 yıl arasında kalıcıdır. Cilt tipi, gözenek yapısı, güneşe maruz kalma ve bakım alışkanlıkları süreyi etkiler. Renk canlılığını korumak için zamanla yenileme seansı önerilebilir; kesin süre kişisel iyileşmeye göre değişir.",
  },
  {
    q: "Yağlı ciltte neden mikroblading yerine pudralama tercih edilir?",
    a: "Yağlı ve geniş gözenekli ciltlerde mikrobladingin ince kıl çizgileri zamanla yayılıp bulanıklaşabilir. Kaş pudralama noktasal gölge tekniğiyle uygulandığından bu ciltlerde daha net ve uzun ömürlü durur. Cilt tipiniz ön görüşmede incelenerek en uygun teknik önerilir.",
  },
  {
    q: "Ombre brows ile kaş pudralama aynı şey mi?",
    a: "Büyük ölçüde aynı ailedendir; ikisi de cihazla noktasal pigment uygulanan pudralı gölge tekniğidir. Ombre brows terimi genellikle kaş başından ucuna açıktan koyuya geçişli bir efekti vurgular. Pudralama ise tüm kaşta dengeli, makyajlı bir dolgunluk sağlar.",
  },
  {
    q: "Kaş pudralama iyileşmesi kaç gün sürer?",
    a: "Yüzeysel iyileşme ilk 7–10 günde tamamlanır; bu sürede hafif kabuklanma ve renkte koyulaşma normaldir. Rengin gerçek tonuna oturması birkaç haftayı bulur. 4–6 hafta sonra rötuş seansıyla nihai sonuç netleştirilir.",
  },
];

export default async function KasPudralamaAnkaraPage() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Kaş Pudralama (Powder Brows) Ankara",
          description:
            "Ankara Çankaya'daki Stria Studio'da cihazla pigment uygulanan, pudralı gölge efekti veren kalıcı kaş pudralama (powder brows) hizmeti. Özellikle yağlı ciltler için uygundur.",
          path: "/kas-pudralama-ankara",
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Kaş Pudralama Ankara", path: "/kas-pudralama-ankara" }]} />

      <Section>
        <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-accent">Son güncelleme: {LAST_UPDATED}</p>
        <h1 className="max-w-[820px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">
          Kaş pudralama Ankara — powder brows tekniği
        </h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-relaxed text-muted2">
          Kaş pudralama (powder brows), cihazla cildin üst katmanına noktasal pigment işlenerek
          pudralı, hafif makyajlı bir gölge efekti oluşturan kalıcı kaş tekniğidir. Kıl kıl çizim
          yerine dengeli bir dolgunluk verir; sonuç doğal ama belirgin, sanki kaş kaleminle
          tamamlanmış gibi görünür. Ankara Çankaya&apos;daki Stria Studio&apos;da uygulanır.
        </p>
        <ImageSlot
          src="/images/topics/kas-pudralama-ankara.png"
          alt="Kaş pudralama Ankara — yumuşak gölge etkili powder brows"
          ratio="aspect-[16/9]"
          className="mt-8 max-w-[920px] rounded-[24px] border border-line bg-blush"
        />
        <div className="mt-8"><CTAButtons settings={s} /></div>
      </Section>

      <Section eyebrow="Uygunluk" heading="Kaş pudralama kimlere uygundur?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kaş pudralama özellikle yağlı ve geniş gözenekli ciltler için idealdir; bu ciltlerde
          mikrobladingin ince kıl çizgileri zamanla yayılabildiğinden pudralı teknik daha net ve
          uzun ömürlü durur. Makyajlı, dolgun bir kaş görünümü sevenler, kaşları seyrek olanlar ve
          günlük kaş makyajıyla uğraşmak istemeyenler için de uygundur.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Hamilelik, emzirme, kan sulandırıcı kullanımı, keloid eğilimi, kontrolsüz diyabet ve aktif
          cilt hastalığı gibi durumlar uygunluğu etkileyebilir; bu başlıklar işlem öncesi
          ön görüşmede tek tek değerlendirilir.
        </p>
      </Section>

      <Section eyebrow="Karşılaştırma" heading="Kaş pudralamanın mikrobladingten farkı nedir?">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Temel fark uygulama tekniğindedir: mikroblading elle, ince bir uçla kıl kıl çizgiler
          oluşturur ve daha doğal bir kıl efekti verir; kaş pudralama ise cihazla noktasal pigment
          uygulayarak pudralı, makyajlı bir gölge sağlar. Cilt tipiniz hangi tekniğin daha iyi
          tutacağını belirleyen en önemli etkendir.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Hangisinin size uygun olduğuna karar vermek için ayrıntılı{" "}
          <Link href="/mikroblading-mi-kas-pudralama-mi" className="text-accent-dark hover:underline">mikroblading mi kaş pudralama mı</Link>{" "}
          karşılaştırmasını inceleyebilir; uzun ömürlü kaş seçenekleri için{" "}
          <Link href="/kalici-kas-ankara" className="text-accent-dark hover:underline">kalıcı kaş Ankara</Link>{" "}
          sayfasına bakabilirsiniz.
        </p>
      </Section>

      <Section eyebrow="Süreç" heading="Kaş pudralama işlemi nasıl yapılır?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          İşlem, yüz hatlarınıza ve mevcut kaş yapınıza göre yapılan tasarımla başlar. Onaylanan
          form üzerine anestezik krem sürülür ve etkisi beklenir. Ardından cihazla pigment noktasal
          olarak uygulanır; tüm işlem yaklaşık 90 dakika sürer. 4–6 hafta sonra planlanan rötuş
          seansıyla renk ve şekil nihai hâline getirilir.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kaş pudralama sonucu genellikle 1–3 yıl kalıcıdır; süre cilt tipine ve bakıma göre değişir.
          İyileşen sonuç örneklerini <Link href="/galeri" className="text-accent-dark hover:underline">galeri</Link> sayfasından görebilirsiniz.
        </p>
      </Section>

      <Section eyebrow="Fiyat" heading="Kaş pudralama Ankara fiyatı ne kadar?">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Ankara&apos;da kaş pudralama uygulaması 5.000–7.500 ₺ aralığındadır. Fiyat; kaş yapınıza,
          istenen yoğunluğa ve seans kapsamına göre ön görüşmede netleştirilir. Rötuş ve yenileme
          seçenekleriyle birlikte güncel tüm kalemleri{" "}
          <Link href="/mikroblading-fiyatlari" className="text-accent-dark hover:underline">mikroblading fiyatları</Link>{" "}
          sayfasından kontrol edebilirsiniz.
        </p>
      </Section>

      <Section eyebrow="S.S.S." heading="Kaş pudralama hakkında sık sorulanlar" narrow>
        <p className="mb-8 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kaş pudralama planlayanların en çok merak ettiği konular işlemin ağrı düzeyi, kalıcılık
          süresi, yağlı ciltteki avantajı ve iyileşme sürecidir. Aşağıdaki kısa yanıtlar temel
          bilgiyi verir; kişisel uygunluk ve kesin seans akışı için stüdyoyla doğrudan görüşmek
          gerekir.
        </p>
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/mikroblading-mi-kas-pudralama-mi" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Mikroblading mi Pudralama mı <ArrowIcon className="h-4 w-4" /></Link>
          <Link href="/kalici-kas-ankara" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Kalıcı Kaş Ankara <ArrowIcon className="h-4 w-4" /></Link>
          <Link href="/iletisim" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">İletişim <ArrowIcon className="h-4 w-4" /></Link>
        </div>
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
