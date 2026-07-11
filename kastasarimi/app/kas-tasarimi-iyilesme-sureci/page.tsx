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
  title: "Kaş Tasarımı Acır mı? İyileşme Süreci Nasıl İşler? | Ankara",
  description:
    "Kaş tasarımı acır mı, iyileşme süreci nasıl işler? Anestezik krem sonrası hafif çizilme hissi, 7–10 günde yüzeysel iyileşme, 4–6 haftada son renk. Ankara Stria Studio.",
  path: "/kas-tasarimi-iyilesme-sureci",
});

const healingSteps = [
  {
    title: "Gün 1–3",
    text: "Renk ve çizgiler ilk günlerde daha koyu ve belirgin görünür; hafif kızarıklık olağandır ve birkaç saat içinde azalır.",
  },
  {
    title: "Gün 3–7",
    text: "Bölgede ince bir kabuklanma başlar. Kaşınma hissi olabilir; kabukları koparmadan önerilen bakım kremini uygulamaya devam edin.",
  },
  {
    title: "Gün 7–10",
    text: "Yüzeysel kabuklar kendiliğinden dökülür ve cilt yenilenir. Bu sırada renk gerçek tonundan daha açık görünebilir; bu geçicidir.",
  },
  {
    title: "4–6. hafta",
    text: "Cilt altına yerleşen renk son ve doğal tonuna oturur. Bu noktada rötuş ihtiyacı değerlendirilir.",
  },
];

const faqs = [
  {
    q: "Kaş tasarımı sırasında acı hisseder miyim?",
    a: "İşlemden önce bölgeye anestezik krem uygulanır. Bu sayede çoğu danışan acı değil, hafif bir çizilme veya karıncalanma hissi tarif eder.",
  },
  {
    q: "İyileşme sürecinde kaşıntı normal midir?",
    a: "Evet, kabuklanma döneminde hafif kaşıntı görülebilir. Kaşımak veya kabukları koparmak rengin düzensiz açılmasına yol açabileceğinden dokunmamak önemlidir.",
  },
  {
    q: "Renk ilk günlerde neden daha koyu görünür?",
    a: "Taze renk ve mikro kabuklanma ilk günlerde tonu daha yoğun gösterir. 7–10 gün içinde ton belirgin şekilde açılır.",
  },
  {
    q: "İyileşme kaç günde tamamlanır?",
    a: "Yüzeysel iyileşme, yani kabukların dökülmesi 7–10 gün sürer. Rengin son haline oturması ise 4–6 haftayı bulur.",
  },
  {
    q: "Rötuşa neden ihtiyaç duyulur?",
    a: "İyileşme sırasında bazı bölgelerde renk beklenenden açık kalabilir. 4–6 hafta sonraki rötuş bu boşlukları tamamlayarak sonucu netleştirir.",
  },
];

export default async function Page() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd
        data={howToSchema({
          name: "Kaş tasarımı sonrası iyileşme süreci",
          description:
            "Kaş tasarımı sonrası gün gün iyileşme: ilk kızarıklıktan kabuklanmaya, rengin son tonuna oturmasına kadar geçen süreç.",
          steps: healingSteps.map((st) => st.text),
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "İyileşme Süreci", path: "/kas-tasarimi-iyilesme-sureci" }]} />

      <Section>
        <h1 className="max-w-[820px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">
          Kaş tasarımı acır mı? İyileşme süreci nasıl?
        </h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-relaxed text-muted2">
          İşlem öncesinde bölgeye anestezik krem uygulanır; bu sayede kıl tekniğiyle uygulama
          sırasında çoğu danışan acı değil, hafif bir çizilme hissi tarif eder. İşlem sonrası
          yüzeysel iyileşme 7–10 gün sürer ve ince bir kabuklanma görülebilir. Rengin son ve doğal
          tonuna oturması ise 4–6 haftayı bulur.
        </p>
        <div className="mt-8">
          <CTAButtons settings={s} />
        </div>
      </Section>

      <Section eyebrow="Konfor" heading="Acıtır mı, konfor nasıl?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Anestezik krem, işlemden yaklaşık 20–30 dakika önce bölgeye sürülür ve cildi hafifçe
          uyuşturur. Kıl kıl uygulama boyunca (~90 dakika) hissedilen şey genellikle acı değil,
          hafif bir çizilme veya karıncalanmadır.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Hassasiyet kişiden kişiye değişir; adet dönemi, yorgunluk veya cilt hassasiyeti konforu
          etkileyebilir. Uygulayıcınız işlem boyunca konforunuzu kontrol eder, gerekirse anestezik
          krem tekrar uygulanır.
        </p>
      </Section>

      <Section eyebrow="Zaman Çizelgesi" heading="Gün gün iyileşme">
        <ProcessSteps steps={healingSteps} />
      </Section>

      <Section eyebrow="Rötuş" heading="Rötuş neden gerekli?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          İyileşme sürecinde bazı kıllar arasında renk beklenenden az tutabilir; bu, cilt
          yenilenmesinin doğal bir sonucudur, uygulama hatası değildir.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          4–6 hafta sonra yapılan rötuş seansı bu boşlukları tamamlar, çizgileri netleştirir ve
          nihai sonucu pekiştirir. İyileşme sürecinde nelere dikkat etmeniz gerektiğini{" "}
          <Link href="/kas-tasarimi-bakimi" className="text-accent-dark hover:underline">
            kaş tasarımı bakımı
          </Link>{" "}
          sayfasında bulabilirsiniz.
        </p>
      </Section>

      <Section eyebrow="S.S.S." heading="İyileşme süreci hakkında sık sorulanlar" narrow>
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/kas-tasarimi-nasil-yapilir" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            Süreç nasıl işler? <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
