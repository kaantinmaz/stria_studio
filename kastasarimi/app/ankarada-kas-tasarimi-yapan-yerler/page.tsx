import type { Metadata } from "next";
import Link from "next/link";
import { getSettings, SETTINGS_FALLBACK } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/Section";
import { CTAButtons, CTABanner } from "@/components/CTA";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { serviceSchema, faqSchema } from "@/lib/schema";
import { ArrowIcon } from "@/components/Icons";

export const metadata: Metadata = buildMetadata({
  title: "Ankara'da Kaş Tasarımı Yapan Yerler | Seçim Rehberi",
  description:
    "Ankara'da kaş tasarımı yapan yerleri 7 ölçütle değerlendirin; semtleri, kırmızı bayrakları, fiyat yaklaşımını ve ön görüşmenin önemini öğrenin.",
  path: "/ankarada-kas-tasarimi-yapan-yerler",
});

const criteria = [
  {
    title: "Sertifika ve eğitim",
    text: "Uygulayıcının kaş tasarımı ve hijyen eğitimi aldığını gösteren güncel belgeleri sorun; yalnızca sözlü beyanla yetinmeyin.",
  },
  {
    title: "Öncesi-sonrası portfolyo",
    text: "Farklı yüz ve kaş yapılarına ait, mümkünse iyileşmiş sonuçları da gösteren gerçek çalışmaları birlikte inceleyin.",
  },
  {
    title: "Hijyen ve tek kullanımlık ekipman",
    text: "İğne ve sarf malzemelerinin tek kullanımlık, steril paketli ve sizin yanınızda açılıyor olmasını bekleyin.",
  },
  {
    title: "Pigment kalitesi",
    text: "Kullanılan pigmentin markasını, içeriğini ve cildinize uygunluğunun nasıl değerlendirildiğini işlemden önce sorun.",
  },
  {
    title: "Altın oran ölçümü ve ön çizim onayı",
    text: "Kaş formu yüz simetrinize göre ölçülmeli; şekil, kalınlık ve başlangıç noktaları siz onaylamadan kalıcı uygulamaya geçilmemelidir.",
  },
  {
    title: "Şeffaf fiyat",
    text: "İlk seans, olası ek işlemler ve rötuşun ücrete dahil olup olmadığı randevu öncesinde açıkça paylaşılmalıdır.",
  },
  {
    title: "Rötuş ve kontrol politikası",
    text: "İyileşme sonrasında ne zaman kontrol yapılacağını, rötuş koşullarını ve bakım desteğinin kapsamını baştan öğrenin.",
  },
];

const redFlags = [
  "Benzer hizmetlere göre açıklanamayan ölçüde düşük fiyat verilmesi",
  "Tasarım ve onay aşamaları dahil işlemin bir saatten kısa sürede biteceğinin vaat edilmesi",
  "Uygulayıcının sertifika veya eğitim belgesini gösterememesi",
  "Çalışma yüzeylerinin temiz olmadığı, steril paketlerin görünmediği bir ortam",
  "Ön çizim gösterilmeden veya açık onayınız alınmadan işleme başlanması",
];

const faqs = [
  {
    q: "Ankara'da kaş tasarımı yapan yerler hangi semtlerde yoğun?",
    a: "Seçenekler özellikle Çankaya, Tunalı, Kızılay, Çayyolu ve Ümitköy hattında yoğunlaşır; Keçiören ile Yenimahalle'de de stüdyolar bulunur. Semtten önce uygulayıcının eğitimi, hijyen düzeni, portfolyosu ve rötuş politikası değerlendirilmelidir.",
  },
  {
    q: "En iyi kaş tasarım salonu nasıl bulunur?",
    a: "Tek bir sıralamaya güvenmek yerine sertifika, iyileşmiş sonuçları içeren portfolyo, steril ve tek kullanımlık ekipman, pigment bilgisi, altın oran ölçümü, onaylı ön çizim, şeffaf fiyat ve rötuş desteğini birlikte karşılaştırın.",
  },
  {
    q: "Kaş tasarımını kimler yapabilir ve kimler yapmalı?",
    a: "Kaş tasarımı, ilgili uygulama ve hijyen eğitimlerini tamamlamış, sertifikasını gösterebilen deneyimli profesyoneller tarafından yapılmalıdır. Cilt sorunu, düzenli ilaç kullanımı veya özel bir sağlık durumu varsa uygunluk ayrıca değerlendirilmeli ve gerektiğinde doktor görüşü istenmelidir.",
  },
  {
    q: "Çok ucuz kaş tasarımı yapan yerler güvenilir mi?",
    a: "Düşük fiyat tek başına güvensizlik kanıtı değildir; ancak kullanılan pigment, steril sarf malzemeleri, tasarıma ayrılan süre veya rötuş desteği açıklanamıyorsa önemli bir uyarıdır. Karar vermeden önce nelerin fiyata dahil olduğunu yazılı ve ayrıntılı biçimde sorun.",
  },
  {
    q: "Kaş tasarımında ön görüşme neden önemli?",
    a: "Ön görüşme, cilt ve kaş yapısının değerlendirilmesini, beklentinin gerçekçi biçimde konuşulmasını, pigment ile form kararının açıklanmasını ve fiyat-rötuş koşullarının netleşmesini sağlar. Uygulayıcıya soru sormak ve kendinizi rahat hissetmediğinizde işlemi ertelemek için de alan açar.",
  },
];

export default async function Page() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Ankara'da Kaş Tasarımı Yapan Yerler Seçim Rehberi",
          description:
            "Ankara'da kaş tasarımı yaptırılacak adresi sertifika, portfolyo, hijyen, pigment, ön çizim, fiyat ve rötuş ölçütleriyle değerlendirme rehberi.",
          path: "/ankarada-kas-tasarimi-yapan-yerler",
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs
        items={[
          {
            name: "Ankara'da Kaş Tasarımı Yapan Yerler",
            path: "/ankarada-kas-tasarimi-yapan-yerler",
          },
        ]}
      />

      <Section>
        <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-accent-dark">
          Son güncelleme: 15 Temmuz 2026
        </p>
        <h1 className="max-w-[900px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">
          Ankara&apos;da Kaş Tasarımı Yapan Yerler: Doğru Adres Nasıl Seçilir?
        </h1>
        <p className="mt-5 max-w-[760px] text-[19px] leading-relaxed text-muted2">
          Ankara&apos;da kaş tasarımı; eğitimli ve sertifikasını gösterebilen uygulayıcılar
          tarafından, özellikle Çankaya, Tunalı, Kızılay, Çayyolu, Ümitköy ve Keçiören
          çevresindeki stüdyolarda yapılır. Seçimde hijyen, gerçek öncesi-sonrası portfolyo,
          pigment bilgisi, altın oran ölçümü, onaylı ön çizim ve rötuş politikası birlikte
          değerlendirilmelidir. Stria Studio, Çankaya&apos;da bu ölçütlerle hizmet verir.
        </p>
        <div className="mt-8">
          <CTAButtons settings={s} />
        </div>
      </Section>

      <Section
        index="01"
        eyebrow="Seçim ölçütleri"
        heading="Ankara'da kaş tasarımı yapan yer seçerken nelere bakılmalı?"
        className="bg-blush/40"
      >
        <p className="mt-5 max-w-[760px] text-[17px] leading-relaxed text-muted2">
          Doğru adres, yalnızca güzel görünen bir sosyal medya hesabıyla değil; eğitim belgesi,
          iyileşmiş sonuçları içeren portfolyo, steril çalışma düzeni ve açık süreç bilgisi birlikte
          incelenerek seçilir. Uygulayıcı, yüz ölçümünü açıklamalı, ön çizimi siz onayladıktan sonra
          başlamalı ve fiyat ile rötuş koşullarını işlem öncesinde yazılı ya da net biçimde
          paylaşmalıdır.
        </p>
        <ol className="mt-10 border-t border-line">
          {criteria.map((criterion, index) => (
            <li
              key={criterion.title}
              className="grid grid-cols-[48px_1fr] gap-x-4 border-b border-line py-7 sm:grid-cols-[72px_1fr] sm:gap-x-6"
            >
              <span className="font-display text-[22px] leading-none text-accent" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-[20px] font-medium text-ink">
                  {criterion.title}
                </h3>
                <p className="mt-2 max-w-[680px] text-[15px] leading-relaxed text-muted2">
                  {criterion.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        index="02"
        eyebrow="Uyarılar"
        heading="Hangi kırmızı bayraklardan uzak durulmalı?"
      >
        <p className="mt-5 max-w-[760px] text-[17px] leading-relaxed text-muted2">
          Kaş tasarımında en ciddi kırmızı bayraklar, piyasanın çok altında fiyatla acele karar
          baskısı kurulması, işlemin bir saatten kısa sürede biteceğinin garanti edilmesi ve
          uygulayıcının eğitim belgesini gösterememesidir. Steril paketlerin danışanın yanında
          açılmadığı bir ortam veya ön çizim onayı alınmadan başlama ısrarı varsa randevuyu
          ertelemek daha güvenlidir.
        </p>
        <ul className="mt-10 border-y border-line">
          {redFlags.map((flag, index) => (
            <li
              key={flag}
              className="grid grid-cols-[48px_1fr] gap-x-4 border-b border-line py-5 last:border-b-0 sm:grid-cols-[72px_1fr] sm:gap-x-6"
            >
              <span className="text-[12px] uppercase tracking-[0.16em] text-accent-dark">
                0{index + 1}
              </span>
              <p className="max-w-[680px] text-[15px] leading-relaxed text-muted2">{flag}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        index="03"
        eyebrow="Semtler"
        heading="Ankara'da kaş tasarımı hangi semtlerde yoğunlaşır?"
        className="bg-blush/40"
      >
        <p className="mt-5 max-w-[760px] text-[17px] leading-relaxed text-muted2">
          Ankara&apos;da kaş tasarımı stüdyoları en çok Çankaya hattında; Tunalı, Kızılay,
          Çayyolu ve Ümitköy gibi ulaşımı kolay merkezlerde yoğunlaşır. Keçiören ve
          Yenimahalle&apos;de de seçenekler bulunur. Semt, tek başına kalite göstergesi değildir;
          ulaşım kolaylığını değerlendirirken aynı yedi seçim ölçütünü her adres için ayrı ayrı
          doğrulamak gerekir.
        </p>
        <div className="mt-10 border-t border-line">
          <div className="grid gap-3 border-b border-line py-6 sm:grid-cols-[180px_1fr]">
            <h3 className="font-display text-[20px] font-medium text-ink">
              <Link href="/cankaya-kas-tasarimi" className="hover:text-accent-dark">
                Çankaya
              </Link>
            </h3>
            <p className="max-w-[680px] text-[15px] leading-relaxed text-muted2">
              Merkezi konumu ve farklı ulaşım seçenekleri nedeniyle geniş bir stüdyo seçeneği
              sunar; Stria Studio da Çankaya&apos;da hizmet verir.
            </p>
          </div>
          <div className="grid gap-3 border-b border-line py-6 sm:grid-cols-[180px_1fr]">
            <h3 className="font-display text-[20px] font-medium text-ink">Tunalı</h3>
            <p className="max-w-[680px] text-[15px] leading-relaxed text-muted2">
              Çankaya merkezine yakınlığıyla seçeneklerin yoğunlaştığı bölgelerden biridir;
              randevu öncesi park ve toplu taşıma koşullarını ayrıca kontrol etmek yararlı olur.
            </p>
          </div>
          <div className="grid gap-3 border-b border-line py-6 sm:grid-cols-[180px_1fr]">
            <h3 className="font-display text-[20px] font-medium text-ink">
              <Link href="/kizilay-kas-tasarimi" className="hover:text-accent-dark">
                Kızılay
              </Link>
            </h3>
            <p className="max-w-[680px] text-[15px] leading-relaxed text-muted2">
              Metro ve otobüs bağlantıları sayesinde farklı ilçelerden gelenlerin öncelik verdiği
              merkezlerden biridir; yoğun saatlerde randevu ve ulaşım süresini birlikte planlayın.
            </p>
          </div>
          <div className="grid gap-3 border-b border-line py-6 sm:grid-cols-[180px_1fr]">
            <h3 className="font-display text-[20px] font-medium text-ink">Çayyolu</h3>
            <p className="max-w-[680px] text-[15px] leading-relaxed text-muted2">
              Ankara&apos;nın batısında yaşayanlar için yakın seçenekler sunar; merkezi konuma göre
              daha kısa yolculuk sağlasa da portfolyo ve hijyen değerlendirmesi değişmemelidir.
            </p>
          </div>
          <div className="grid gap-3 border-b border-line py-6 sm:grid-cols-[180px_1fr]">
            <h3 className="font-display text-[20px] font-medium text-ink">Ümitköy</h3>
            <p className="max-w-[680px] text-[15px] leading-relaxed text-muted2">
              Çayyolu hattına benzer biçimde batı aksında alternatif oluşturur; işlem sonrası
              kontrol ve rötuş için aynı adrese yeniden ulaşacağınızı da hesaba katın.
            </p>
          </div>
          <div className="grid gap-3 border-b border-line py-6 sm:grid-cols-[180px_1fr]">
            <h3 className="font-display text-[20px] font-medium text-ink">
              <Link href="/kecioren-kas-tasarimi" className="hover:text-accent-dark">
                Keçiören
              </Link>
            </h3>
            <p className="max-w-[680px] text-[15px] leading-relaxed text-muted2">
              İlçe içinde seçenekler bulunur; Çankaya&apos;daki bir stüdyoyu değerlendiriyorsanız
              gidiş-dönüş süresiyle 4–6 hafta sonraki rötuş ziyaretini beraber planlayın.
            </p>
          </div>
          <div className="grid gap-3 border-b border-line py-6 sm:grid-cols-[180px_1fr]">
            <h3 className="font-display text-[20px] font-medium text-ink">
              <Link href="/yenimahalle-kas-tasarimi" className="hover:text-accent-dark">
                Yenimahalle
              </Link>
            </h3>
            <p className="max-w-[680px] text-[15px] leading-relaxed text-muted2">
              Batıkent ve çevresinden erişim arayanlar için yerel alternatifler vardır; kararınızı
              yalnızca yakınlığa değil, yedi temel ölçütün tamamına göre verin.
            </p>
          </div>
        </div>
      </Section>

      <Section
        index="04"
        eyebrow="Fiyat yaklaşımı"
        heading="Ankara'da kaş tasarımı fiyatı seçimi nasıl etkilemeli?"
      >
        <p className="mt-5 max-w-[760px] text-[17px] leading-relaxed text-muted2">
          Fiyat, uygulayıcının eğitimi, harcadığı tasarım süresi, pigment niteliği, hijyen standardı
          ve rötuş desteğiyle birlikte değerlendirilmelidir; tek başına düşük rakam güvenli bir
          seçim ölçütü değildir. Stria Studio&apos;nun güncel aralıklarını ve pakete dahil hizmetleri
          fiyat tablosunu burada tekrarlamadan{" "}
          <Link href="/kas-tasarimi-fiyatlari" className="text-accent-dark hover:underline">
            kaş tasarımı fiyatları
          </Link>{" "}
          sayfasında inceleyebilirsiniz.
        </p>
      </Section>

      <Section
        index="05"
        eyebrow="Öz-değerlendirme"
        heading="Stria Studio bu kriterlere göre nasıl?"
        className="bg-blush/40"
      >
        <p className="mt-5 max-w-[760px] text-[17px] leading-relaxed text-muted2">
          Stria Studio bu ölçütlerin tamamını çalışma sürecine dahil eder: uygulamalar sertifikalı
          profesyonellerce yapılır, tek kullanımlık steril ekipman ve dermatolojik pigment
          kullanılır, altın oran ölçümünden sonra ön çizim onayı alınır.{" "}
          <Link href="/galeri" className="text-accent-dark hover:underline">
            Portfolyo
          </Link>{" "}
          incelenebilir; ücret ve 4–6 haftalık rötuş planı ön görüşmede açıklanır. Yine de karar
          vermeden önce sorularınızı doğrudan sormanızı öneririz.
        </p>
        <p className="mt-5 max-w-[760px] text-[15px] leading-relaxed text-muted2">
          WhatsApp ön görüşmesinde kaş ve cilt yapınızı, geçmiş işlemleri ve beklentinizi paylaşın;
          uygunluk konusunda belirsizlik varsa randevu vermeden önce bunu açıkça konuşalım.
        </p>
        <div className="mt-8">
          <CTAButtons settings={s} />
        </div>
      </Section>

      <Section
        index="06"
        eyebrow="S.S.S."
        heading="Ankara'da kaş tasarımı hakkında neler merak ediliyor?"
        narrow
      >
        <p className="mt-5 text-[17px] leading-relaxed text-muted2">
          Kısa cevaplar, semt seçiminin kaliteyi tek başına belirlemediğini; en iyi salonun belge,
          hijyen, portfolyo ve şeffaf süreç karşılaştırmasıyla bulunduğunu gösterir. Uygulamayı
          eğitimli profesyoneller yapmalı, olağan dışı ucuz teklifler sorgulanmalı ve ön görüşme
          cilt uygunluğu ile beklentileri işlem başlamadan netleştirmek için kullanılmalıdır.
        </p>
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link
            href="/kas-tasarimi-nasil-yapilir"
            className="inline-flex items-center gap-1.5 text-accent-dark hover:underline"
          >
            Kaş tasarımı nasıl yapılır? <ArrowIcon className="h-4 w-4" />
          </Link>
          <Link
            href="/iletisim"
            className="inline-flex items-center gap-1.5 text-accent-dark hover:underline"
          >
            İletişim <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
