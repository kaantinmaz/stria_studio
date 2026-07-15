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
  title: "Ankara'da Microblading Yapan Yerler | Stria Studio",
  description:
    "Ankara'da microblading yeri seçerken sertifika, hijyen, portfolyo, tasarım, fiyat ve rötuş politikasını nasıl değerlendireceğinizi öğrenin.",
  path: "/ankarada-mikroblading-yapan-yerler",
});

const faqs = [
  {
    q: "Ankara'da microblading yapan yerler hangi semtlerde yoğun?",
    a: "Seçenekler Çankaya ve Tunalı, Kızılay, Çayyolu ve Ümitköy ile Keçiören çevresinde görülür. Ancak semt, kalite göstergesi değildir. Ulaşımı değerlendirirken uygulayıcının eğitimi, hijyen düzeni, portfolyosu ve kontrol ya da rötuş için aynı yere yeniden gidebilme olanağı birlikte incelenmelidir.",
  },
  {
    q: "En iyi microblading salonu nasıl bulunur?",
    a: "Tek bir 'en iyi' salon listesi yerine doğrulanabilir ölçütlerle ilerleyin. Eğitim belgesini, iyileşmiş sonuçları içeren öncesi–sonrası portfolyoyu, tek kullanımlık ekipmanı, pigment bilgisini, ön çizim sürecini, toplam fiyat kapsamını ve rötuş politikasını aynı görüşmede sorun.",
  },
  {
    q: "Microblading işlemini kimler yapabilir ve kimler yapmalı?",
    a: "İşlem; microblading ve kalıcı makyaj alanında eğitimini belgeleyebilen, hijyen protokolü uygulayan, yüz ölçümü ile pigment bilgisini birlikte kullanabilen yetkin bir uygulayıcı tarafından yapılmalıdır. Sertifika tek başına yeterli değildir; güncel çalışma örnekleri, danışan güvenliği yaklaşımı ve takip politikası da değerlendirilmelidir.",
  },
  {
    q: "Çok ucuz microblading yapan yerler güvenilir mi?",
    a: "Düşük fiyat tek başına güvensizlik kanıtı değildir; fakat piyasanın belirgin biçimde altındaki teklifin hangi malzeme, tasarım süresi ve takip hizmetini kapsadığı mutlaka sorulmalıdır. Eğitim belgesi, steril tek kullanımlık ekipman veya şeffaf kapsam gösterilemiyorsa yalnızca fiyat avantajıyla karar vermeyin.",
  },
  {
    q: "Microblading ön görüşmesi neden önemlidir?",
    a: "Ön görüşme; cilt yapısının, mevcut kaşın veya eski pigmentin, beklentinin ve işleme uygunluğu etkileyebilecek durumların uygulamadan önce konuşulmasını sağlar. Kaş formu, pigment tonu, ücret kapsamı ve takip planı burada netleştiğinde hem danışan hem uygulayıcı aynı sonuç beklentisiyle ilerler.",
  },
];

export default async function AnkaradaMicrobladingYapanYerlerPage() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: "Ankara'da Microblading Stüdyosu Seçim Rehberi",
          description:
            "Ankara'da microblading yapan yerleri eğitim, hijyen, portfolyo, tasarım, fiyat ve takip ölçütleriyle değerlendirme rehberi.",
          path: "/ankarada-mikroblading-yapan-yerler",
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs
        items={[
          {
            name: "Ankara'da Microblading Yapan Yerler",
            path: "/ankarada-mikroblading-yapan-yerler",
          },
        ]}
      />

      <Section>
        <h1 className="max-w-[920px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">
          Ankara&apos;da Microblading Yapan Yerler: Doğru Stüdyo Nasıl Seçilir?
        </h1>
        <p className="mt-5 max-w-[760px] text-[19px] leading-relaxed text-muted2">
          Ankara&apos;da microblading, kalıcı makyaj eğitimi ve uygulama yetkinliği bulunan
          uzmanlarca yapılmalıdır; seçenekler Çankaya ve Tunalı, Kızılay, Çayyolu ve Ümitköy ile
          Keçiören çevresinde yoğunlaşır. Stüdyo seçerken sertifika, hijyen, iyileşmiş sonuçları da
          gösteren portfolyo, ön çizim onayı ve takip koşulları birlikte incelenmelidir. Stria
          Studio, Çankaya&apos;da ön görüşmeyle hizmet verir.
        </p>
        <p className="mt-4 text-[14px] text-muted2">Son güncelleme: 15 Temmuz 2026</p>
        <div className="mt-8"><CTAButtons settings={s} /></div>
      </Section>

      <Section
        eyebrow="Seçim ölçütleri"
        heading="Microblading nereye yaptırılır ve doğru yer nasıl seçilir?"
        className="bg-blush/40"
      >
        <p className="max-w-[760px] text-[17px] leading-relaxed text-muted2">
          Doğru stüdyo yalnızca güzel bir sonuç fotoğrafı sunan değil; eğitimi, hijyen düzeni,
          kullandığı pigment, tasarım yöntemi ve işlem sonrası desteği birlikte açıklayabilen
          yerdir. Kararı sosyal medya görünürlüğüne göre değil, aşağıdaki yedi ölçütün tamamını
          doğrulayarak vermek hem güvenliği hem de beklentinize uygun, doğal bir kaş sonucunu
          destekler.
        </p>
        <ol className="mt-7 max-w-[760px] list-decimal space-y-5 pl-6 text-[17px] leading-relaxed text-muted2 marker:font-medium marker:text-accent-dark">
          <li>
            <strong className="text-ink">Sertifika ve eğitim:</strong> Uygulayıcının microblading
            ve kalıcı makyaj eğitimini nerede, hangi kapsamda aldığını sorun; belgeyi görmeyi
            talep edin.
          </li>
          <li>
            <strong className="text-ink">Öncesi–sonrası portfolyo:</strong> Yalnızca işlemden
            hemen sonraki koyu görüntülere değil, iyileşmiş sonuçlara ve farklı kaş yapılarına ait
            gerçek çalışma örneklerine bakın.
          </li>
          <li>
            <strong className="text-ink">Hijyen ve tek kullanımlık ekipman:</strong> İşlem alanı
            temiz olmalı; steril uç ve diğer tek kullanımlık malzemeler sizin yanınızda açılmalı,
            yeniden kullanılmamalıdır.
          </li>
          <li>
            <strong className="text-ink">Pigment kalitesi:</strong> Pigmentin markası, içeriği,
            saklama koşulu ve cilt tonunuza neden uygun görüldüğü açıklanabilmelidir; kaynağı
            belirsiz ürünleri kabul etmeyin.
          </li>
          <li>
            <strong className="text-ink">Altın oran ölçümü ve ön çizim onayı:</strong> Kaş formu
            yüz oranlarına göre ölçülmeli, iki taraf birlikte kontrol edilmeli ve siz çizimi
            onaylamadan pigment uygulamasına başlanmamalıdır.
          </li>
          <li>
            <strong className="text-ink">Şeffaf fiyat:</strong> İlk seans, olası rötuş, kontrol
            ve ek işlemlerin hangisinin toplam ücrete dahil olduğunu randevu öncesinde netleştirin.
          </li>
          <li>
            <strong className="text-ink">Rötuş ve kontrol politikası:</strong> İyileşme sonrası
            değerlendirmenin ne zaman yapıldığını, rötuş gereksinimine kimin nasıl karar verdiğini
            ve iletişim desteğinin kapsamını öğrenin.
          </li>
        </ol>
        <p className="mt-7 max-w-[760px] text-[17px] leading-relaxed text-muted2">
          Ölçüm, ön çizim, pigment uygulaması ve bakım bilgilendirmesinin sırasını{" "}
          <Link href="/mikroblading-nasil-yapilir" className="text-accent-dark hover:underline">
            mikroblading nasıl yapılır
          </Link>{" "}
          rehberinde teknik bağlamıyla inceleyebilirsiniz.
        </p>
      </Section>

      <Section eyebrow="Kırmızı bayraklar" heading="Hangi işaretler microblading stüdyosu için kırmızı bayraktır?">
        <p className="max-w-[760px] text-[17px] leading-relaxed text-muted2">
          Bir yer olağandışı düşük fiyatla acele karar istiyor, işlemi bir saatten kısa sürede
          bitireceğini söylüyor veya eğitim belgesini paylaşmıyorsa temkinli yaklaşın. Steril
          düzenin görünmemesi ve kaş formu için ön çizim onayı alınmadan uygulamaya geçilmesi de
          sonucu ve sağlığı etkileyebilen ciddi kırmızı bayraklardır. Bu tür belirtiler, halk
          arasında “merdiven altı” diye tarif edilen kayıt dışı veya denetimsiz uygulama riskini
          düşündürür.
        </p>
        <ul className="mt-7 max-w-[760px] space-y-3 text-[17px] leading-relaxed text-muted2">
          <li>• Kapsamı açıklanmayan, aşırı düşük fiyat teklifi</li>
          <li>• Tasarım ve hazırlık dahil işlemin bir saatten kısa sürede biteceği vaadi</li>
          <li>• Uygulayıcının eğitim veya sertifika belgesini gösterememesi</li>
          <li>• Steril olmayan ortam ve tek kullanımlık paketin yanınızda açılmaması</li>
          <li>• Altın oran ölçümü ve ön çizim onayı almadan işleme başlama isteği</li>
        </ul>
      </Section>

      <Section
        eyebrow="Semtler"
        heading="Ankara'da microblading seçenekleri hangi semtlerde yoğunlaşır?"
        className="bg-blush/40"
      >
        <p className="max-w-[760px] text-[17px] leading-relaxed text-muted2">
          Ankara&apos;da microblading seçenekleri, güzellik ve kişisel bakım işletmelerinin erişilebilir
          olduğu Çankaya–Tunalı ve Kızılay çevresinde; batıda Çayyolu–Ümitköy, kuzeyde ise Keçiören
          hattında görülür. Semt tek başına kalite kanıtı değildir: ulaşım kolaylığını, ilk seans
          sonrası kontrol veya rötuş için aynı stüdyoya yeniden gidebilme olanağıyla birlikte
          değerlendirin.
        </p>
        <div className="mt-7 max-w-[760px] space-y-5 text-[17px] leading-relaxed text-muted2">
          <p>
            <strong className="text-ink">Çankaya ve Tunalı:</strong> Merkezi konum, farklı
            ilçelerden ulaşımı ve takip ziyaretlerini planlamayı kolaylaştırabilir. Stria
            Studio&apos;nun konumu ve ziyaret bilgileri için{" "}
            <Link href="/cankaya-mikroblading" className="text-accent-dark hover:underline">
              Çankaya microblading
            </Link>{" "}
            sayfasına bakın.
          </p>
          <p>
            <strong className="text-ink">Kızılay:</strong> Aktarma bağlantıları nedeniyle
            stüdyo arayışında sık değerlendirilen merkezlerden biridir. Çankaya&apos;daki stüdyoya
            güzergâh seçeneklerini{" "}
            <Link href="/kizilay-mikroblading" className="text-accent-dark hover:underline">
              Kızılay&apos;dan microblading ulaşım rehberinde
            </Link>{" "}
            bulabilirsiniz.
          </p>
          <p>
            <strong className="text-ink">Çayyolu ve Ümitköy:</strong> Ankara&apos;nın batı
            koridorundan seçim yaparken randevu saati kadar dönüş ve olası kontrol yolculuğunu da
            hesaba katın;{" "}
            <Link href="/cayyolu-mikroblading" className="text-accent-dark hover:underline">
              Çayyolu ve Ümitköy ulaşım sayfası
            </Link>{" "}
            yerel planlama ayrıntılarını verir.
          </p>
          <p>
            <strong className="text-ink">Keçiören:</strong> Kuzeyden gelecek danışanlar için
            trafik ve aktarma süresi, takip randevusunun sürdürülebilirliğini etkileyebilir.{" "}
            <Link href="/kecioren-mikroblading" className="text-accent-dark hover:underline">
              Keçiören&apos;den microblading ulaşım rehberi
            </Link>{" "}
            rota planına yardımcı olur.
          </p>
        </div>
      </Section>

      <Section eyebrow="Fiyat" heading="Microblading fiyatı stüdyo seçiminde nasıl değerlendirilmeli?">
        <p className="max-w-[760px] text-[17px] leading-relaxed text-muted2">
          Fiyatı tek başına kalite puanı gibi okumayın; eğitim, tek kullanımlık sarf malzemeleri,
          pigment standardı, tasarım süresi ve rötuş kapsamı toplam bedeli etkileyebilir.
          Karşılaştırma yaparken nelerin ücrete dahil olduğunu yazılı biçimde sorun ve rakamları
          kopyalanmış bir liste yerine güncel{" "}
          <Link href="/mikroblading-fiyatlari" className="text-accent-dark hover:underline">
            microblading fiyatları
          </Link>{" "}
          sayfasından kontrol edin.
        </p>
      </Section>

      <Section
        eyebrow="Öz değerlendirme"
        heading="Stria Studio bu seçim kriterlerine göre nasıl değerlendirilebilir?"
        className="bg-blush/40"
      >
        <p className="max-w-[760px] text-[17px] leading-relaxed text-muted2">
          Stria Studio, Çankaya&apos;daki uygulamalarında yüz ve mevcut kaş yapısını değerlendirir;
          altın oran ölçümüyle hazırlanan ön çizim danışanın onayından sonra uygulanır. Steril tek
          kullanımlık uçlar ve seçilmiş pigmentlerle çalışır, kapsam ile takip planını görüşmede
          açıklar. Bununla birlikte her cilt, eski pigment ve beklenti için microblading&apos;in uygun
          olduğunu uzaktan garanti etmez.
        </p>
        <p className="mt-5 max-w-[760px] text-[17px] leading-relaxed text-muted2">
          Karar vermeden önce eğitim belgelerimizi, çalışma örneklerimizi, kullanılacak pigmenti
          ve size önerilen takip planını sormanızı bekleriz. Mevcut kaşınızın fotoğrafını
          WhatsApp&apos;tan göndererek ön görüşme başlatabilir; uygunluk, tasarım beklentisi ve ücret
          kapsamını randevu almadan önce konuşabilirsiniz.
        </p>
        <div className="mt-8"><CTAButtons settings={s} /></div>
      </Section>

      <Section
        eyebrow="S.S.S."
        heading="Ankara'da microblading stüdyosu seçerken en çok ne sorulur?"
        narrow
      >
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          En sık sorular; seçeneklerin hangi semtlerde bulunduğu, uygulayıcının yetkinliğinin nasıl
          doğrulanacağı, düşük fiyatın ne anlama geldiği ve ön görüşmede nelerin konuşulacağı
          üzerinde toplanır. Aşağıdaki yanıtlar kısa bir karar çerçevesi sunar; sağlık durumu, eski
          uygulama ve kişisel tasarım ihtiyacı için bireysel değerlendirme gerekir.
        </p>
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/mikroblading-nasil-yapilir" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            Uygulama Aşamaları <ArrowIcon className="h-4 w-4" />
          </Link>
          <Link href="/mikroblading-fiyatlari" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">
            Güncel Fiyatlar <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      <CTABanner
        settings={s}
        heading="Ankara'da microblading için ön görüşme ister misiniz?"
        description="Ön görüşmede mevcut kaş yapınızı, cilt özelliklerinizi ve beklentinizi birlikte değerlendirir; önerilen formu, pigment yaklaşımını, işlem kapsamını ve takip planını açıklarız. Sorularınızı randevu kararı vermeden önce paylaşmak ve size uygun seçeneği konuşmak için WhatsApp üzerinden ücretsiz ön görüşme hemen başlatabilirsiniz."
      />
    </>
  );
}
