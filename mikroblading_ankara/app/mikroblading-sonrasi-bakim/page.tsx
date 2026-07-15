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
import { serviceSchema, faqSchema, howToSchema } from "@/lib/schema";
import { ArrowIcon } from "@/components/Icons";

export const metadata: Metadata = buildMetadata({
  title: "Mikroblading Sonrası Bakım ve İyileşme Süreci",
  description:
    "Mikroblading sonrası bakım rehberi: gün gün iyileşme süreci, kabuklanma dönemi, yüz yıkama zamanı, yapılacaklar ve yapılmayacaklar. Ankara Stria Studio.",
  path: "/mikroblading-sonrasi-bakim",
});

const careSteps = [
  "İlk gün işlem bölgesini elinizle veya kirli bezlerle temas ettirmeyin; hafif hassasiyet ve koyu görünüm normaldir.",
  "Uygulayıcının verdiği bakım kremini temiz parmakla, çok ince bir tabaka hâlinde günde önerilen sayıda sürün.",
  "İlk 10 gün boyunca kaşları ıslatmaktan kaçının; yüzünüzü kaş bölgesine su değdirmeden yıkayın.",
  "5–10. günlerdeki kabuklanmayı asla koparmayın; kabukların kendiliğinden dökülmesini bekleyin.",
  "Sauna, havuz, deniz, yoğun spor ve terleme gibi nem/ısı kaynaklarından ilk 10 gün uzak durun.",
  "Güneş, solaryum ve makyajdan ilk 10 gün kaçının; iyileşme sonrası kaş bölgesine güneş koruyucu uygulayın.",
  "Retinol, AHA/BHA ve asit içeren cilt bakım ürünlerini kaş bölgesinde 30 gün kullanmayın.",
  "4–6. haftada rengin oturmasının ardından uygulayıcının önerdiği rötuş kontrolüne gidin.",
];

const faqs = [
  {
    q: "Mikroblading kabukları ne zaman döküler?",
    a: "Kabuklanma genellikle 5. gün başlar ve 10. güne kadar tamamlanır. Bu dönemde ince kabuklar kendiliğinden dökülür. Kabukları koparmak pigmentin lekeli çıkmasına neden olabilir; dökülmeyi beklemek en doğru yaklaşımdır.",
  },
  {
    q: "Mikroblading rengi çok açıldı, normal mi?",
    a: "Evet, normaldir. Kabuklar döküldükten sonra 2–4. haftada renk belirgin şekilde açılır; buna 'ghosting' denir. Renk cilt yenilendikçe geri gelir ve 4–6. haftada nihai tonuna oturur. Bu geçici solukluk kalıcı bir sorun değildir.",
  },
  {
    q: "Mikroblading sonrası yüz ne zaman yıkanır?",
    a: "Yüzünüzü ilk günden itibaren yıkayabilirsiniz, ancak kaş bölgesine ilk 10 gün su, sabun ve buhar değdirmeyin. Bu sürede yüzü kaş çevresinden kaçınarak temizleyin; iyileşme tamamlanınca normal yüz yıkama rutininize dönebilirsiniz.",
  },
  {
    q: "Mikroblading sonrası ne zaman spor yapılır?",
    a: "Terleme kabukları yumuşatıp pigment tutulumunu bozabildiği için yoğun spor ve terlemeden ilk 10 gün kaçınmak önerilir. Kabuklar tamamen döküldükten sonra egzersize kademeli olarak dönebilirsiniz.",
  },
  {
    q: "Mikroblading sonrası denize ne zaman girilir?",
    a: "Deniz, havuz ve sauna gibi ortamlardan iyileşme tamamlanana kadar, yani en az 10–14 gün uzak durun. Tuzlu su, klor ve nem hem enfeksiyon riskini hem de pigment kaybını artırabilir. Kesin süreyi uygulayıcınızla teyit edin.",
  },
  {
    q: "Mikroblading rötuşu şart mı?",
    a: "Rötuş, ilk uygulamadan 4–6 hafta sonra rengi ve simetriyi tamamlamak için genellikle önerilir. Pigment tutulumu kişiden kişiye değişir; gereksinim iyileşme sonrası değerlendirilir. Rötuş kapsamını güncel fiyat sayfasından kontrol edebilirsiniz.",
  },
];

const timeline = [
  {
    day: "1. gün",
    text: "Kaşlar olması gerekenden koyu ve belirgin görünür; hafif hassasiyet, kızarıklık ve dolgunluk normaldir. Bölgeyi kuru ve temiz tutun, verilen kremi ince sürün.",
  },
  {
    day: "2–4. gün",
    text: "Renk daha da koyulaşır ve yüzey kurumaya başlar. Hafif gerginlik hissedilebilir. Kaşları ıslatmayın; kremi düzenli ve ince tabaka hâlinde uygulamaya devam edin.",
  },
  {
    day: "5–10. gün",
    text: "Kabuklanma ve dökülme dönemidir. İnce kabuklar ve pullanma görülür. Kaşınsa bile kabukları KOPARMAYIN; kendiliğinden dökülmelerini bekleyin, aksi hâlde renk lekeli çıkar.",
  },
  {
    day: "2–4. hafta",
    text: "Kabuklar döküldükten sonra renk beklenenden açık görünür ('ghosting' dönemi). Bu geçicidir; cilt yenilendikçe pigment yüzeye geri döner ve ton dengelenmeye başlar.",
  },
  {
    day: "4–6. hafta",
    text: "Renk nihai tonuna oturur ve gerçek sonuç ortaya çıkar. Bu, simetriyi ve tutulumu tamamlamak için rötuş kontrolünün planlandığı zamandır.",
  },
];

const dos = [
  "Verilen bakım kremini temiz parmakla ince tabaka hâlinde sürün.",
  "Kaş bölgesini kuru ve temiz tutun.",
  "Uyurken kaşların yastığa sürtünmesini engellemek için sırtüstü yatmaya çalışın.",
  "4–6. haftada önerilen rötuş kontrolüne gidin.",
];

const donts = [
  "Kaşları ıslatmayın; sauna, havuz ve denizden kaçının.",
  "Yoğun spor ve terlemeden ilk 10 gün uzak durun.",
  "Güneş ve solaryuma çıkmayın.",
  "Kabukları koparmayın veya kaşımayın.",
  "İlk 10 gün kaş bölgesine makyaj uygulamayın.",
  "Retinol ve asitli ürünleri 30 gün kaş bölgesinde kullanmayın.",
];

export default async function MikrobladingSonrasiBakimPage() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Mikroblading Sonrası Bakım",
          description:
            "Mikroblading sonrası iyileşme süreci ve bakım rehberi: gün gün zaman çizelgesi, kabuklanma dönemi ve dikkat edilmesi gerekenler.",
          path: "/mikroblading-sonrasi-bakim",
        })}
      />
      <JsonLd
        data={howToSchema({
          name: "Mikroblading sonrası bakım nasıl yapılır?",
          description:
            "Mikroblading sonrası iyileşme sürecini sorunsuz tamamlamak için adım adım bakım rehberi.",
          steps: careSteps,
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Mikroblading Sonrası Bakım", path: "/mikroblading-sonrasi-bakim" }]} />

      <Section>
        <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-accent">Son güncelleme: {LAST_UPDATED}</p>
        <h1 className="max-w-[820px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">
          Mikroblading Sonrası Bakım ve İyileşme Süreci (Gün Gün)
        </h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-relaxed text-muted2">
          Mikroblading sonrası yüzeysel iyileşme 7–10 gün sürer; nihai renk ise 4–6 haftada oturur.
          İlk 10 gün kaşları su, ter, güneş ve makyajdan koruyun, kabukları koparmayın. Doğru bakım,
          pigmentin düzgün tutunmasını ve sonucun doğal görünmesini sağlar.
        </p>
        <ImageSlot
          src="/images/topics/mikroblading-sonrasi-bakim.png"
          alt="Mikroblading sonrası bakım — iyileşme döneminde kaş koruma rutini"
          ratio="aspect-[16/9]"
          className="mt-8 max-w-[920px] rounded-[24px] border border-line bg-blush"
        />
        <div className="mt-8"><CTAButtons settings={s} /></div>
      </Section>

      <Section eyebrow="Zaman çizelgesi" heading="Mikroblading iyileşme süreci gün gün nasıl ilerler?">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          İyileşme, koyulaşma, kabuklanma ve renk oturması olmak üzere öngörülebilir aşamalardan
          geçer. Aşağıdaki zaman çizelgesi her dönemde neyin normal olduğunu ve ne yapmanız
          gerektiğini özetler; kişisel iyileşme hızı kişiden kişiye değişebilir.
        </p>
        <ol className="mt-6 max-w-[760px] space-y-4">
          {timeline.map((t) => (
            <li key={t.day} className="rounded-2xl border border-line bg-white/60 p-5">
              <p className="text-[15px] font-semibold text-ink">{t.day}</p>
              <p className="mt-1.5 text-[16px] leading-relaxed text-muted2">{t.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          İşlemin nasıl uygulandığını{" "}
          <Link href="/mikroblading-nasil-yapilir" className="text-accent-dark hover:underline">mikroblading nasıl yapılır</Link>{" "}
          rehberinden inceleyebilirsiniz.
        </p>
      </Section>

      <Section eyebrow="Kabuklanma" heading="Mikroblading kabuklanma döneminde ne yapılmalı?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kabuklanma 5–10. günlerde görülür ve iyileşmenin doğal bir parçasıdır. Bu dönemde ince
          kabuklar oluşur, hafif kaşıntı hissedilebilir. Kabukları koparmak yerine kendiliğinden
          dökülmelerini beklemek, pigmentin eşit tutunması için en önemli kuraldır. Bölgeyi kuru
          tutun ve yalnızca önerilen kremi ince sürün.
        </p>
      </Section>

      <Section eyebrow="Kurallar" heading="Mikroblading sonrası yapılacaklar ve yapılmayacaklar">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          İyileşme süresince aşağıdaki iki listeyi takip etmek, hem enfeksiyon riskini azaltır hem
          de renk tutulumunu artırır. İlk 10 gün en kritik dönemdir.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white/60 p-5">
            <p className="text-[15px] font-semibold text-ink">Yapılacaklar</p>
            <ul className="mt-3 space-y-2 text-[16px] leading-relaxed text-muted2">
              {dos.map((d) => (
                <li key={d} className="flex gap-2"><span aria-hidden className="text-accent-dark">✓</span><span>{d}</span></li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-line bg-white/60 p-5">
            <p className="text-[15px] font-semibold text-ink">Yapılmayacaklar</p>
            <ul className="mt-3 space-y-2 text-[16px] leading-relaxed text-muted2">
              {donts.map((d) => (
                <li key={d} className="flex gap-2"><span aria-hidden className="text-accent-dark">✕</span><span>{d}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section eyebrow="S.S.S." heading="Mikroblading sonrası bakım hakkında sık sorulanlar" narrow className="bg-blush/40">
        <p className="mb-8 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Danışanların iyileşme sürecinde en sık sorduğu konular kabuklanma, rengin açılması, yüz
          yıkama ve spor zamanıdır. Aşağıdaki kısa yanıtlar genel rehberdir; kişisel iyileşmeniz
          için uygulayıcınızın önerilerini esas alın.
        </p>
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/mikroblading-nasil-yapilir" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Mikroblading Nasıl Yapılır <ArrowIcon className="h-4 w-4" /></Link>
          <Link href="/sss" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Sık Sorulan Sorular <ArrowIcon className="h-4 w-4" /></Link>
          <Link href="/mikroblading-fiyatlari" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Mikroblading Fiyatları <ArrowIcon className="h-4 w-4" /></Link>
          <Link href="/iletisim" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">İletişim <ArrowIcon className="h-4 w-4" /></Link>
        </div>
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
