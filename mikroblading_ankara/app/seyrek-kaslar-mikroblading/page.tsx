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
  title: "Seyrek Kaşlar İçin Mikroblading | Ankara Kıl Tekniği",
  description:
    "Seyrek kaşlar için mikroblading: boşluk ve incelme durumunda kıl tekniği uygunluğu, kaş dökülmesi ve alopeside değerlendirme, doğal tasarım yaklaşımı.",
  path: "/seyrek-kaslar-mikroblading",
});

const faqs = [
  {
    q: "Çok seyrek kaşlara mikroblading yapılabilir mi?",
    a: "Seyreklik tek başına kesin uygunluk anlamına gelmez. Mevcut kılların yönü, boşlukların dağılımı, cilt yapısı ve dökülmenin aktif olup olmadığı ön görüşmede değerlendirilmelidir.",
  },
  {
    q: "Mikroblading kaş dökülmesini durdurur mu?",
    a: "Hayır. Mikroblading görünümü destekleyen kozmetik bir uygulamadır; kaş dökülmesinin nedenini teşhis veya tedavi etmez. Yeni ya da devam eden dökülmede önce dermatoloji değerlendirmesi alınmalıdır.",
  },
  {
    q: "Alopesi olan kişiler mikroblading yaptırabilir mi?",
    a: "Alopesinin türü, aktivitesi ve bölgedeki cilt durumu farklı olabilir. Bu nedenle önce dermatoloğunuzun değerlendirmesini alın; sonrasında kozmetik uygulama uygunluğu ayrıca görüşülmelidir.",
  },
  {
    q: "Kıl tekniği boş bölgelerde doğal görünür mü?",
    a: "Doğal görünüm, çizgilerin komşu kılların yön ve yoğunluğuyla uyumuna bağlıdır. Geniş ve tamamen kılsız alanlarda beklenti ile uygulanabilir teknik ön görüşmede gerçekçi biçimde değerlendirilmelidir.",
  },
];

export default async function SeyrekKaslarMicrobladingPage() {
  const s = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <>
      <JsonLd data={serviceSchema({
        name: "Seyrek Kaşlar İçin Mikroblading",
        description: "Seyrek, incelmiş veya boşluklu kaşlarda mevcut kıllarla uyumlu çizgiler hedefleyen, kişisel uygunluğa göre planlanan mikroblading hizmeti.",
        path: "/seyrek-kaslar-mikroblading",
      })} />
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Seyrek Kaşlar İçin Mikroblading", path: "/seyrek-kaslar-mikroblading" }]} />

      <Section>
        <h1 className="max-w-[820px] text-[clamp(28px,4vw,46px)] leading-tight text-ink">Seyrek kaşlar için mikroblading</h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-relaxed text-muted2">
          Seyrek kaşlar için mikroblading, mevcut kılların arasındaki boşluklara kıl benzeri
          çizgiler ekleyerek daha bütün bir görünüm hedefleyebilir. Uygunluk; seyrekliğin nedeni,
          cilt yapısı, boşlukların genişliği ve kaş dökülmesinin aktif olup olmamasına göre
          değerlendirilir. İşlem, dökülmenin nedenini tedavi eden tıbbi bir yöntem değildir.
        </p>
        <ImageSlot
          src="/images/topics/seyrek-kaslar-mikroblading.png"
          alt="Seyrek kaşlar için mikroblading — boşlukları tamamlayan doğal kıl tekniği"
          ratio="aspect-[16/9]"
          className="mt-8 max-w-[920px] rounded-[24px] border border-line bg-blush"
        />
        <div className="mt-8"><CTAButtons settings={s} /></div>
      </Section>

      <Section eyebrow="Uygunluk" heading="Seyrek veya incelmiş kaşlarda mikroblading uygun mu?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Mikroblading; doğuştan seyrek, zamanla incelmiş ya da belirli bölümlerinde boşluk bulunan
          kaşlarda değerlendirilebilir. En uygun durum, mevcut kılların yeni çizgilere yön ve
          yoğunluk referansı verebildiği kaşlardır. Çok geniş boşluklarda veya değişen dökülmede
          sonuç beklentisi uygulama öncesinde ayrıca ve gerçekçi biçimde konuşulmalıdır.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Teknik adımlar için <Link href="/mikroblading-nasil-yapilir" className="text-accent-dark hover:underline">mikroblading nasıl yapılır</Link> rehberine bakın.
        </p>
      </Section>

      <Section eyebrow="Dökülme" heading="Kaş dökülmesi veya alopesi varsa ne yapılmalı?">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Yeni başlayan, ilerleyen veya nedeni bilinmeyen kaş dökülmesinde önce dermatoloji
          değerlendirmesi gerekir; mikroblading alopesiyi ya da başka bir dökülme nedenini teşhis
          veya tedavi etmez. Alopesi tanınız varsa hastalığın durumu ve bölge cildinin uygunluğu
          konusunda hekiminizin görüşünü alın, ardından kozmetik seçenekleri değerlendirin.
        </p>
        <p className="mt-4 max-w-[720px] text-[15px] leading-relaxed text-muted2">
          Tıbbi değerlendirme yaklaşımı, Amerikan Dermatoloji Akademisi&apos;nin <a href="https://www.aad.org/public/diseases/hair-loss/types/alopecia/self-care" target="_blank" rel="noopener noreferrer" className="text-accent-dark hover:underline">alopesi bilgilendirmesiyle</a> uyumludur.
        </p>
      </Section>

      <Section eyebrow="Görünüm" heading="Kıl tekniği boşlukları nasıl daha doğal tamamlar?" className="bg-blush/40">
        <p className="max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Kıl tekniğinde çizgiler tek bir blok renk oluşturmak yerine komşu kılların çıkış açısını
          ve akışını izleyerek planlanır. Kaş başı, gövdesi ve ucundaki yoğunluk aynı tutulmaz;
          mevcut yapıya göre kademelendirilir. Doğal sonuç, daha fazla çizgiden değil doğru yön,
          aralık ve renk seçiminden gelir.
        </p>
        <p className="mt-4 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Güncel hizmet kapsamı için <Link href="/mikroblading-fiyatlari" className="text-accent-dark hover:underline">mikroblading fiyatları</Link>, kişisel görüşme için <Link href="/iletisim" className="text-accent-dark hover:underline">iletişim</Link> sayfasını kullanın.
        </p>
      </Section>

      <Section eyebrow="S.S.S." heading="Seyrek kaşlarda mikroblading hakkında neler soruluyor?" narrow>
        <p className="mb-8 max-w-[720px] text-[17px] leading-relaxed text-muted2">
          Seyrek kaşlarla ilgili sorular uygunluk, doğal görünüm ve dökülmenin devam ettiği
          durumlarda izlenecek yol üzerinde yoğunlaşır. Önce dökülmenin tıbbi açıdan değerlendirilmesi,
          ardından mevcut kıl ve cilt yapısına uygun kozmetik tekniğin seçilmesi gerekir. Aşağıdaki
          yanıtlar bu önemli ayrımı kısa ve doğrudan biçimde açıklar.
        </p>
        <Faq items={faqs} />
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          <Link href="/" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Mikroblading Ankara <ArrowIcon className="h-4 w-4" /></Link>
          <Link href="/iletisim" className="inline-flex items-center gap-1.5 text-accent-dark hover:underline">Ön görüşme <ArrowIcon className="h-4 w-4" /></Link>
        </div>
      </Section>

      <CTABanner settings={s} />
    </>
  );
}
