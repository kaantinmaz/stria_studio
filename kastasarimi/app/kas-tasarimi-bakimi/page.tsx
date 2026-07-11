import type { Metadata } from "next";
import Link from "next/link";
import { getSettings, SETTINGS_FALLBACK } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/Section";
import { ProcessSteps } from "@/components/ProcessSteps";
import { CTAButtons, CTABanner } from "@/components/CTA";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { faqSchema, howToSchema } from "@/lib/schema";
import { ArrowIcon } from "@/components/Icons";

export const metadata: Metadata = buildMetadata({
  title: "Kaş Tasarımı Bakımı: Öncesi ve Sonrası | Ankara",
  description:
    "Kaş tasarımı öncesi ve sonrası bakım rehberi: kafein ve güneşten kaçının, ilk 10 gün ıslatmayın ve kabuk koparmayın, önerilen kremi uygulayın. Ankara Stria Studio.",
  path: "/kas-tasarimi-bakimi",
});

const preSteps = [
  {
    title: "Kafeinden uzak durun",
    text: "İşlemden önceki gün kafein tüketimini azaltın; kan akışını dengede tutmak konforu artırır.",
  },
  {
    title: "Kan sulandırıcı kullanmayın",
    text: "Doktorunuza danışmadan aspirin veya benzeri kan sulandırıcı ilaç almayın; morarma ve kanama riskini artırabilir.",
  },
  {
    title: "Güneşten koruyun",
    text: "Kaş bölgesinde güneş yanığı veya taze bronzlaşma varsa randevunuzu erteleriz; cilt öncelikle iyileşmelidir.",
  },
];

const postSteps = [
  {
    title: "Suyla temastan kaçının",
    text: "İlk 10 gün bölgeyi doğrudan suyla ıslatmayın; yüzünüzü yıkarken kaş bölgesini nemli bir bezle koruyun.",
  },
  {
    title: "Kabukları koparmayın",
    text: "Oluşan ince kabuklar kendiliğinden döker; koparmak rengin düzensiz açılmasına yol açabilir.",
  },
  {
    title: "Güneş, havuz ve saunadan uzak durun",
    text: "Bu dönemde güneş ışığı, klorlu su ve yüksek nem iyileşmeyi geciktirip rengin tutunmasını olumsuz etkileyebilir.",
  },
  {
    title: "Nemlendirin",
    text: "Önerilen bakım kremini ince bir tabaka halinde, düzenli aralıklarla uygulayın.",
  },
];

const faqs = [
  {
    q: "İşlemden önce nelere dikkat etmeliyim?",
    a: "Kafeinden mümkünse uzak durun, doktor onayı olmadan kan sulandırıcı kullanmayın ve kaş bölgesinde güneş yanığı varsa randevunuzu erteleyin.",
  },
  {
    q: "İşlem sonrası kaşları ne zaman ıslatabilirim?",
    a: "İlk 10 gün bölgeyi doğrudan suyla ıslatmaktan kaçının. Yüzünüzü yıkarken kaş bölgesini nemli bir bezle koruyabilirsiniz.",
  },
  {
    q: "Kabuklar kaşınırsa ne yapmalıyım?",
    a: "Kaşımayın ve koparmayın; önerilen bakım kremini uygulamaya devam edin. Kabuklar zamanı geldiğinde kendiliğinden, iz bırakmadan döker.",
  },
  {
    q: "Havuza veya saunaya girebilir miyim?",
    a: "İlk 10 gün havuz, deniz ve saunadan uzak durun; nem ve klor kabuklanmayı ve rengin tutunmasını olumsuz etkileyebilir.",
  },
];

export default async function Page() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd
        data={howToSchema({
          name: "Kaş tasarımı bakımı: öncesi ve sonrası",
          description:
            "Kaş tasarımı öncesi ve sonrası bakım adımları: hazırlık, ilk 10 gün ve uzun vadeli koruma.",
          steps: [...preSteps.map((st) => st.text), ...postSteps.map((st) => st.text)],
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Kaş Tasarımı Bakımı", path: "/kas-tasarimi-bakimi" }]} />

      <Section>
        <h1 className="max-w-[820px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">
          Kaş tasarımı bakımı: öncesi ve sonrası
        </h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-relaxed text-muted2">
          İşlem öncesinde kafein tüketimini azaltmanızı, kan sulandırıcı ilaçlardan ve güneş
          yanığından kaçınmanızı öneririz. İşlem sonrasında ilk 10 gün kaşları suyla ıslatmayın,
          oluşan kabukları koparmayın; güneşten, havuzdan ve saunadan uzak durup önerilen
          nemlendiriciyi düzenli uygulayın. Bu kurallara uymak sonucun netliğini ve kalıcılığını
          doğrudan etkiler.
        </p>
        <div className="mt-8">
          <CTAButtons settings={s} />
        </div>
      </Section>

      <Section eyebrow="Öncesi" heading="İşlem öncesi hazırlık" className="bg-blush/40">
        <ProcessSteps steps={preSteps} />
      </Section>

      <Section eyebrow="Sonrası" heading="Sonrası ilk 10 gün">
        <ProcessSteps steps={postSteps} />
      </Section>

      <Section eyebrow="Uzun Vade" heading="Uzun vadede koruma (güneş)" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          İlk 10 günün ardından da güneş kaş tasarımının en büyük düşmanıdır. Bölgeye güneş kremi
          uygulamak rengin daha uzun süre canlı kalmasını sağlar.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kalıcılığı etkileyen diğer etkenler ve yenileme zamanlaması için{" "}
          <Link href="/kas-tasarimi-kalici-mi" className="text-accent-dark hover:underline">
            kaş tasarımı kalıcı mı
          </Link>{" "}
          sayfasına göz atabilirsiniz.
        </p>
      </Section>

      <Section eyebrow="S.S.S." heading="Bakım hakkında sık sorulanlar" narrow>
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/kas-tasarimi-iyilesme-sureci" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            İyileşme süreci <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
