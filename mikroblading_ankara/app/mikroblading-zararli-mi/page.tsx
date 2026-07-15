import type { Metadata } from "next";
import Link from "next/link";
import { getSettings, SETTINGS_FALLBACK } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { LAST_UPDATED } from "@/lib/copy";
import { Section } from "@/components/Section";
import { ImageSlot } from "@/components/ImageSlot";
import { CTAButtons, CTABanner } from "@/components/CTA";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { serviceSchema, faqSchema } from "@/lib/schema";
import { ArrowIcon } from "@/components/Icons";

export const metadata: Metadata = buildMetadata({
  title: "Mikroblading Zararlı mı? Riskler ve Güvenlik | Stria",
  description:
    "Mikroblading zararlı mı, güvenli mi? Olası riskler, nasıl önlendiği, kimlerin yaptıramayacağı ve güvenli stüdyo seçimi. Ankara Stria Studio uzman rehberi.",
  path: "/mikroblading-zararli-mi",
});

const faqs = [
  {
    q: "Mikroblading kanser yapar mı, zararlı kimyasal içerir mi?",
    a: "Mikroblading kanserle ilişkilendirilen bir işlem değildir. Belirleyici olan pigment kalitesidir; dermatolojik test edilmiş, içeriği belgeli pigmentler kullanılır. Onaysız veya bilinmeyen kaynaklı boyalardan kaçınılır. Endişeniz varsa ön görüşmede kullanılan pigmentin içeriğini isteyebilirsiniz.",
  },
  {
    q: "Mikroblading yaptırdıktan sonra MR (MRI) çektirebilir miyim?",
    a: "Çoğu kişi mikroblading sonrası sorunsuz MR çektirir. Bazı pigmentler nadiren geçici bir sıcaklık veya karıncalanma hissi bildirmiştir. MR öncesi radyoloji ekibini kalıcı makyajınız konusunda bilgilendirmeniz yeterli bir önlemdir.",
  },
  {
    q: "Hamileyken mikroblading olur mu?",
    a: "Hamilelik ve emzirme döneminde mikroblading önerilmez; bu bir kontrendikasyondur. Kesin bir risk kanıtı olmasa da, ölçülü yaklaşım gereği bu dönem geçene kadar işlem ertelenir. Uygunluğunuz her zaman ön görüşmede değerlendirilir.",
  },
  {
    q: "Mikroblading cilde kalıcı zarar verir mi?",
    a: "Mikroblading cildin yalnızca üst katmanına uygulanan yüzeysel ve yarı kalıcı bir işlemdir; steril tek kullanımlık ekipmanla yapıldığında kalıcı hasar beklenmez. Pigment zamanla açılır. En önemli koruyucu etken hijyen ve uygulayıcı deneyimidir.",
  },
  {
    q: "Kötü yapılmış mikroblading düzeltilebilir mi?",
    a: "İstenmeyen form veya renk çoğunlukla düzeltilebilir. Hafif durumlarda rötuşla iyileştirme, belirgin durumlarda pigment açma veya lazerle silme sonrası yeniden tasarım seçenekleri değerlendirilir. Kesin yol, kaşın mevcut durumuna göre ön görüşmede belirlenir.",
  },
];

export default async function MikrobladingZararliMiPage() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Mikroblading Güvenlik Rehberi",
          description:
            "Mikroblading risklerini, güvenlik önlemlerini, kontrendikasyonları ve güvenli stüdyo seçimini açıklayan uzman rehberi.",
          path: "/mikroblading-zararli-mi",
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Mikroblading Zararlı mı?", path: "/mikroblading-zararli-mi" }]} />

      <Section>
        <h1 className="max-w-[820px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">
          Mikroblading Zararlı mı? Riskler, Güvenlik ve Kimler Yaptırmamalı
        </h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-relaxed text-muted2">
          Mikroblading; steril tek kullanımlık ekipman, sertifikalı bir uygulayıcı ve doğru
          pigmentle yapıldığında güvenli kabul edilen, cildin üst katmanına uygulanan yarı kalıcı
          ve yüzeysel bir işlemdir. Olası riskler büyük ölçüde hijyen koşulları ve uygulayıcı
          deneyimiyle ilgilidir; doğru koşullar sağlandığında bu riskler önemli ölçüde azalır.
        </p>
        <p className="mt-4 text-[14px] text-muted2">Son güncelleme: {LAST_UPDATED}</p>
        <ImageSlot
          src="/images/topics/mikroblading-zararli-mi.png"
          alt="Güvenli mikroblading uygulaması — steril ekipman ve hijyen hazırlığı"
          ratio="aspect-[16/9]"
          className="mt-8 max-w-[920px] rounded-[24px] border border-line bg-blush"
        />
        <div className="mt-8"><CTAButtons settings={s} /></div>
      </Section>

      <Section eyebrow="Riskler" heading="Mikroblading'in olası riskleri nelerdir ve nasıl önlenir?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Mikroblading riskleri nadirdir ve çoğu doğru uygulama koşullarıyla önlenebilir. Aşağıda
          en sık merak edilen başlıklar ve bunlara karşı alınan somut önlemler yer alır.
        </p>
        <ul className="mt-6 max-w-[720px] space-y-4 text-[17px] leading-relaxed text-muted2">
          <li>
            <strong className="text-ink">Enfeksiyon:</strong> Steril, tek kullanımlık iğne ve
            uçlar kullanılır; paket işlem öncesinde önünüzde açılır. İşlem alanı hijyeniyle ve
            doğru sonrası bakım yönlendirmesiyle risk en aza indirilir.
          </li>
          <li>
            <strong className="text-ink">Alerjik reaksiyon:</strong> Dermatolojik test edilmiş,
            içeriği belgeli pigmentler tercih edilir. Hassasiyeti bilinen danışanlarda gerektiğinde
            patch (yama) testi uygulanarak reaksiyon olasılığı önceden değerlendirilir.
          </li>
          <li>
            <strong className="text-ink">İstenmeyen renk veya form:</strong> Kaş tasarımı altın
            oran ölçümüyle planlanır ve sizin onayınız alınmadan hiçbir işlem başlatılmaz. Renk,
            ten tonunuza ve kıl yapınıza göre seçilir.
          </li>
          <li>
            <strong className="text-ink">MRI ve pigment söylentileri:</strong> Kalıcı makyajın MR
            çekimini engellediği yönündeki iddialar çoğunlukla abartılıdır. Nadiren geçici his
            bildirilse de, radyoloji ekibini bilgilendirmek yeterli bir önlemdir.
          </li>
        </ul>
        <p className="mt-6 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          İşlemin adım adım nasıl yapıldığını <Link href="/mikroblading-nasil-yapilir" className="text-accent-dark hover:underline">mikroblading nasıl yapılır</Link> rehberinde inceleyebilirsiniz.
        </p>
      </Section>

      <Section eyebrow="Kontrendikasyon" heading="Kimler mikroblading yaptırmamalı?">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Bazı durumlarda mikroblading ertelenir veya önerilmez. Aşağıdaki başlıklar mutlak engel
          değil, dikkatle değerlendirilmesi gereken durumlardır; uygunluğunuz her zaman ön
          görüşmede ve gerektiğinde hekim onayıyla belirlenir.
        </p>
        <ul className="mt-6 max-w-[720px] space-y-2 text-[17px] leading-relaxed text-muted2">
          <li>• Hamilelik ve emzirme dönemi</li>
          <li>• Kan sulandırıcı ilaç kullanımı</li>
          <li>• Keloid (aşırı iz) oluşumuna eğilim</li>
          <li>• Kontrolsüz diyabet</li>
          <li>• İşlem bölgesinde aktif cilt hastalığı (egzama, sedef, aktif akne)</li>
          <li>• Kemoterapi ve benzeri aktif tedavi süreçleri</li>
        </ul>
        <p className="mt-6 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Bu durumların herhangi biri sizde varsa lütfen randevu öncesinde belirtin. Gerekli
          görülürse ilgili hekiminizin onayı istenir ve işlem güvenli koşullar sağlanana kadar
          ertelenir. Uygulayıcı deneyimimiz hakkında <Link href="/hakkimizda" className="text-accent-dark hover:underline">hakkımızda</Link> sayfasından bilgi alabilirsiniz.
        </p>
      </Section>

      <Section eyebrow="Kontrol listesi" heading="Güvenli bir mikroblading stüdyosu nasıl seçilir?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Güvenli bir uygulamanın en belirleyici etkeni stüdyo ve uygulayıcı seçimidir. Randevu
          öncesinde aşağıdaki maddeleri kontrol etmeniz, riskleri baştan azaltmanın en pratik
          yoludur.
        </p>
        <ul className="mt-6 max-w-[720px] space-y-2 text-[17px] leading-relaxed text-muted2">
          <li>• Steril, tek kullanımlık paket işlem öncesinde önünüzde açılıyor mu?</li>
          <li>• Uygulayıcının kalıcı makyaj sertifikası ve deneyimi var mı?</li>
          <li>• Gerçek danışanlara ait öncesi–sonrası galeri gösteriliyor mu?</li>
          <li>• Stüdyonun ruhsatı ve hijyen koşulları uygun mu?</li>
          <li>• Ön görüşmede sağlık geçmişiniz ve kontrendikasyonlar soruluyor mu?</li>
        </ul>
        <p className="mt-6 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          İşlem sonrasında iyileşmeyi güvenle tamamlamak için <Link href="/mikroblading-sonrasi-bakim" className="text-accent-dark hover:underline">mikroblading sonrası bakım</Link> rehberini takip etmeniz önerilir.
        </p>
      </Section>

      <Section eyebrow="S.S.S." heading="Mikroblading güvenliği hakkında sık sorulanlar" narrow>
        <p className="mb-8 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Danışanların en sık sorduğu güvenlik soruları pigment içeriği, MR çekimi, hamilelik ve
          düzeltme olanaklarıyla ilgilidir. Aşağıdaki kısa yanıtlar temel bilgiyi verir; kişisel
          uygunluğunuz ve sağlık durumunuz her zaman ön görüşmede değerlendirilir.
        </p>
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/sss" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Tüm Sorular <ArrowIcon className="h-4 w-4" /></Link>
          <Link href="/mikroblading-nasil-yapilir" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Nasıl Yapılır <ArrowIcon className="h-4 w-4" /></Link>
          <Link href="/hakkimizda" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Hakkımızda <ArrowIcon className="h-4 w-4" /></Link>
        </div>
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
