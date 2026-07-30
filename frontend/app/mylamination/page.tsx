import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { Nav } from "@/components/Nav";
import { breadcrumbSchema, faqSchema } from "@/components/schema";
import { absUrl, buildMetadata } from "@/lib/seo";
import {
  ML_BRAND,
  ML_CATEGORIES,
  ML_CATEGORY_ORDER,
  ML_PRODUCTS,
} from "@/lib/mylamination";

export const revalidate = 3600;

const path = "/mylamination";

export const metadata = buildMetadata({
  title: "My Lamination Ürünleri: Kaş Laminasyonu ve Kirpik Lifting Rehberi",
  description:
    "My Lamination kaş laminasyonu ve kirpik lifting ürünlerinin tamamı: solüsyonlar, silikon kalıplar, fırçalar ve evde bakım serumları. Hangisi ne işe yarar, nasıl kullanılır?",
  path,
});

const crumbs = [
  { name: "Ana Sayfa", path: "/" },
  { name: "My Lamination Ürünleri", path },
];

const faqs = [
  {
    q: "My Lamination nedir?",
    a: "My Lamination, kaş laminasyonu ve kirpik lifting alanında İtalyan teknolojisiyle üretilen profesyonel bir ürün markasıdır. Ürünleri Avrupa ve T.C. Sağlık Bakanlığı tarafından onaylıdır, vegandır ve toksin, paraben, sülfat içermez. Türkiye distribütörlüğü 2018’den bu yana My Lamination Türkiye’dedir.",
  },
  {
    q: "My Lamination ürünlerini herkes satın alabilir mi?",
    a: "Profesyonel uygulama ürünleri (solüsyonlar, boyalar, ekipman) yalnızca My Lamination workshoplarına katılıp sertifika almış uygulayıcılara satılır. Evde bakım ürünleri — serumlar ve maskaralar — uygulayıcı üzerinden temin edilebilir.",
  },
  {
    q: "My Lamination ürünlerinin etkisi kanıtlanmış mı?",
    a: "Marka, İtalya’daki Padua Üniversitesi araştırma ve geliştirme laboratuvarlarında ESEM elektron mikroskobuyla yapılan bir klinik çalışmaya dayanır. Çalışmada işlem öncesi 68,18 µm olan kirpik çapı işlemden hemen sonra 86,14 µm, bir ay ev serumu kullanımından sonra 129,32 µm ölçülmüştür.",
  },
  {
    q: "Stria Studio hangi My Lamination ürünlerini kullanıyor?",
    a: "Kaş laminasyonu ve kirpik lifting seanslarında Lifting Cream, Neutralising Cream ve Hydrating Serum üçlüsünü, bakım için Vitamin ve Mineral Lashbrow kürlerini, renklendirmede PPD içermeyen kaş-kirpik boyasını Color Developer ile birlikte kullanıyoruz. Kalıp ve fırçalarda Lamitta serisini tercih ediyoruz.",
  },
  {
    q: "Kaş laminasyonu ürünleri kaşa zarar verir mi?",
    a: "Doğru sürede ve kıl yapısına uygun uygulandığında zarar vermez. Hasar genelde üründen değil, bekleme süresinin kıla göre ayarlanmamasından veya seansların çok sık tekrarlanmasından kaynaklanır. Bu nedenle iki uygulama arasında en az 6 hafta bırakılır.",
  },
  {
    q: "Laminasyon ürünleri hamilelikte kullanılabilir mi?",
    a: "My Lamination laminasyon ürünlerinin hamile ve emziren kadınlar için güvenli olduğunu, toksin, paraben ve sülfat içermediğini belirtir. Buna karşın bazı yardımcı ürünlerin (güneş ürünleri, BB krem) etiketinde hamilelikte kullanılmaması notu vardır. Seans öncesinde durumu bize bildirin; ürün seçimini buna göre yaparız.",
  },
];

const sectionClass = "border-t border-line py-[clamp(40px,6vw,72px)] first:border-t-0";
const headingClass = "mb-5 text-[clamp(24px,3vw,36px)] leading-tight";
const answerClass = "max-w-[760px] text-[16px] leading-[1.75] text-muted2";
const linkClass =
  "font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent";

// Marka + ürün kataloğu şeması: ItemList her ürün detay sayfasına işaret eder,
// böylece arama ve yapay zekâ motorları kataloğu tek istekte görebilir.
const catalogSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "My Lamination Ürünleri",
  description:
    "Stria Studio’nun kaş laminasyonu ve kirpik lifting uygulamalarında kullandığı My Lamination ürünleri.",
  url: absUrl(path),
  numberOfItems: ML_PRODUCTS.length,
  itemListElement: ML_PRODUCTS.map((product, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: absUrl(`/mylamination/${product.slug}`),
    name: product.name,
  })),
};

const brandSchema = {
  "@context": "https://schema.org",
  "@type": "Brand",
  "@id": absUrl("/mylamination#brand"),
  name: ML_BRAND.name,
  alternateName: ["My Lamination Türkiye", "MyLamination"],
  description:
    "Kaş laminasyonu ve kirpik lifting alanında İtalyan teknolojisiyle üretilen, vegan ve T.C. Sağlık Bakanlığı’na kayıtlı profesyonel ürün markası.",
  url: ML_BRAND.siteUrl,
  logo: absUrl(ML_BRAND.logo),
  sameAs: [
    ML_BRAND.siteUrl,
    "https://www.instagram.com/mylaminationturkey/",
    "https://www.youtube.com/@mylaminationturkey",
  ],
};

export default function MyLaminationPage() {
  return (
    <>
      <Nav />
      <JsonLd data={brandSchema} />
      <JsonLd data={catalogSchema} />
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <main className="mx-auto max-w-[1080px] px-[clamp(18px,5vw,56px)] pb-[clamp(32px,5vw,64px)] pt-8">
        <header className="mb-[clamp(28px,5vw,52px)]">
          <div className="mb-5 flex flex-wrap items-center gap-4">
            <Image
              src={ML_BRAND.logoItaly}
              alt="My Lamination — Made in Italy"
              width={719}
              height={641}
              className="h-16 w-auto"
            />
            <div className="text-xs uppercase tracking-[0.14em] text-accent">
              Stria Studio · My Lamination Uzmanı
            </div>
          </div>
          <h1 className="mb-5 max-w-[880px] text-[clamp(30px,4.4vw,54px)] leading-[1.06]">
            My Lamination Ürünleri: Kaş Laminasyonu ve Kirpik Lifting Rehberi
          </h1>
          <p className="max-w-[820px] text-[clamp(16px,1.5vw,19px)] leading-[1.75] text-muted">
            Stria Studio, Ankara Çankaya’da kaş laminasyonu ve kirpik lifting
            uygulamalarında My Lamination ürünlerini kullanır. Bu sayfa markanın{" "}
            {ML_PRODUCTS.length} ürününü tek tek anlatır: hangi adımda hangi
            solüsyon kullanılır, silikon kalıp boyu sonucu nasıl değiştirir, evde
            hangi serum ne işe yarar. Her ürünün kendi detay sayfası vardır.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/hizmetler/kas-laminasyon"
              className="inline-flex items-center gap-2 rounded-[26px] bg-ink px-6 py-3 text-sm text-cream transition-opacity hover:opacity-90"
            >
              Kaş Laminasyonu
              <span>→</span>
            </Link>
            <Link
              href="/hizmetler/kirpik-lifting"
              className="inline-flex items-center gap-2 rounded-[26px] border border-line2 bg-white px-6 py-3 text-sm text-ink transition-colors hover:border-accent"
            >
              Kirpik Lifting
              <span className="text-accent">→</span>
            </Link>
          </div>
        </header>

        <section className={sectionClass}>
          <h2 className={headingClass}>My Lamination nedir, neden bu markayı kullanıyoruz?</h2>
          <p className={answerClass}>
            My Lamination, kirpik ve kaş laminasyonu ürünlerini İtalyan
            teknolojisiyle geliştiren bir markadır. Markayı ayıran nokta, eski
            jenerasyon agresif lifting ürünlerinin aksine formülünü vitamin ve
            mineral desteği üzerine kurmasıdır: amaç yalnızca kılı şekillendirmek
            değil, şekillendirirken beslemektir. Ürünler Avrupa Sağlık Bakanlığı ve
            T.C. Sağlık Bakanlığı tarafından onaylıdır; vegandır, toksin, paraben
            ve sülfat içermez.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Klinik ölçüm",
                text: "İtalya’daki Padua Üniversitesi laboratuvarlarında ESEM elektron mikroskobuyla yapılan çalışmada, işlem öncesi 68,18 µm olan kirpik çapı işlemden hemen sonra 86,14 µm; bir ay ev serumu kullanımı sonrasında 129,32 µm ölçülmüştür.",
              },
              {
                title: "Sertifikalı uygulayıcı sistemi",
                text: "Ürünler serbest satışta değildir. Yalnızca My Lamination workshoplarını tamamlayıp sertifika almış uygulayıcılar satın alabilir. Bu, ürünün doğru protokolle kullanılmasını sağlayan yapısal bir güvence.",
              },
              {
                title: "Uluslararası ödüller",
                text: "Marka, eğitmenleri ve öğrencileriyle uluslararası şampiyonalarda toplam 300’den fazla ödül aldığını belirtir; İtalya, İspanya, Polonya, Ukrayna ve ABD dâhil birçok ülkede ödüllendirilmiştir.",
              },
              {
                title: "Türkiye’de 2018’den beri",
                text: "My Lamination Türkiye 2018’de markanın Türkiye exclusive distribütörlüğünü almıştır; merkezi Antalya’dadır ve Türkiye genelinde binlerce sertifikalı uygulayıcıya sahiptir.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-[20px] border border-line bg-white p-6"
              >
                <h3 className="mb-2 text-[18px] leading-[1.35]">{item.title}</h3>
                <p className="text-[14px] leading-[1.7] text-muted2">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Bir seansta ürünler hangi sırayla kullanılır?</h2>
          <p className={answerClass}>
            Kaş laminasyonu ve kirpik lifting tek bir ürünle yapılmaz; birbirine
            bağlı bir adım dizisidir. Bir adımın süresi ya da sırası kayarsa sonuç
            tutmaz. Aşağıdaki sıra, standart My Lamination protokolünün Stria
            Studio’da uyguladığımız hâlidir.
          </p>
          <ol className="mt-8 grid gap-4">
            {[
              {
                title: "Temizlik",
                product: "Cleansing Foam",
                slug: "cleansing-foam",
                text: "Kıl üzerindeki yağ ve makyaj kalıntısı alınır. Kalıntı kalırsa solüsyon kıla temas etmez ve sonuç bölgesel olarak tutmaz.",
              },
              {
                title: "Kalıp ve sarma",
                product: "Lamitta Shields / Lami Combo Pads",
                slug: "lamitta-shields-silikon-seti-5-cift",
                text: "Kirpik boyuna uygun silikon kalıp seçilir, kıllar tek tek ayrılarak kalıba sabitlenir. Kıvrımın açısını belirleyen adım burasıdır.",
              },
              {
                title: "1. adım — Lifting",
                product: "Lifting Cream",
                slug: "lifting-cream",
                text: "Kıl bağları yumuşatılır ve kıl yeni formu alabilir hâle gelir. Süre kıl yapısına göre belirlenir.",
              },
              {
                title: "2. adım — Nötralizasyon",
                product: "Neutralising Cream",
                slug: "neutralising-cream",
                text: "Açılan kıl yapısı kapatılır ve yeni kıvrım ya da kaş formu sabitlenir. Bu adım atlanırsa sonuç birkaç günde düşer.",
              },
              {
                title: "Bakım kürü",
                product: "Vitamin / Mineral Lashbrow",
                slug: "vitamin-lashbrow",
                text: "Vitamin ve mineral desteği uygulanır. Vitamin kürü kılı uçtan, mineral kürü kökten besler.",
              },
              {
                title: "Renklendirme (isteğe bağlı)",
                product: "Kaş ve Kirpik Boyası + Color Developer",
                slug: "kas-ve-kirpik-boyasi",
                text: "Açık renkli kıl uçları görünüyorsa renklendirme yapılır. PPD içermeyen boya, Color Developer ile aktive edilir.",
              },
              {
                title: "3. adım — Kapanış",
                product: "Hydrating Serum",
                slug: "hydrating-serum",
                text: "Kütikül kapatılır, kalıntı giderilir ve kıl nemlendirilir. Parlaklık bu adımda ortaya çıkar.",
              },
              {
                title: "Evde bakım",
                product: "Vitamin / Mineral / Biotin Serum Home",
                slug: "vitamin-lash-serum-home",
                text: "Sonucun 6–8 hafta iyi durmasını belirleyen adım. Serum günde iki kez, kökten uca uygulanır.",
              },
            ].map((step, index) => (
              <li
                key={step.title}
                className="grid grid-cols-[36px_1fr] gap-4 rounded-[18px] border border-line bg-white p-5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm text-cream">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-[17px] leading-[1.4] text-ink">{step.title}</h3>
                  <p className="mt-1 text-[13px] text-accent">
                    <Link href={`/mylamination/${step.slug}`} className="hover:underline">
                      {step.product}
                    </Link>
                  </p>
                  <p className="mt-2 text-[14px] leading-[1.7] text-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {ML_CATEGORY_ORDER.map((category) => {
          const products = ML_PRODUCTS.filter((p) => p.category === category);
          const meta = ML_CATEGORIES[category];

          return (
            <section key={category} className={sectionClass} id={category}>
              <h2 className={headingClass}>{meta.label}</h2>
              <p className={answerClass}>{meta.blurb}</p>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <Link
                    key={product.slug}
                    href={`/mylamination/${product.slug}`}
                    className="group flex flex-col overflow-hidden rounded-[22px] border border-line bg-white transition-colors hover:border-accent"
                  >
                    <div className="relative aspect-[4/3] bg-blush">
                      <Image
                        src={`/mylamination/${product.image}`}
                        alt={`${product.name} — My Lamination`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 340px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-[17px] leading-[1.35] text-ink">
                        {product.name}
                      </h3>
                      <p className="mt-2 flex-1 text-[14px] leading-[1.7] text-muted2">
                        {product.summary}
                      </p>
                      <p className="mt-4 text-[14px] text-accent">Detaylı bilgi →</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        <section className={sectionClass}>
          <h2 className={headingClass}>Ürünleri Ankara’da kimden uygulatabilirsiniz?</h2>
          <p className={answerClass}>
            My Lamination ürünleri serbest satışta olmadığı için uygulama, markanın
            workshopunu tamamlamış sertifikalı uygulayıcılar tarafından yapılır.
            Stria Studio Ankara Çankaya’da kaş laminasyonu ve kirpik lifting
            uygulamalarını bu ürünlerle yapar; seans öncesi kıl analizinde hangi
            solüsyonu hangi sürede kullanacağımızı ve evde hangi bakımı
            önerdiğimizi birlikte konuşuruz.
          </p>
          <p className="mt-6 text-[15px] leading-[1.7] text-muted">
            Markanın kendi ürün kataloğuna{" "}
            <a
              href={ML_BRAND.productsUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={linkClass}
            >
              mylamination.com.tr üzerinden
            </a>{" "}
            ulaşabilirsiniz. Uygulama detayları için{" "}
            <Link href="/hizmetler/kas-laminasyon" className={linkClass}>
              kaş laminasyonu
            </Link>{" "}
            ve{" "}
            <Link href="/hizmetler/kirpik-lifting" className={linkClass}>
              kirpik lifting
            </Link>{" "}
            sayfalarımıza bakabilirsiniz.
          </p>
        </section>
      </main>

      <Faq
        title="My Lamination ürünleri hakkında sık sorulanlar"
        intro="Marka, ürünlerin kimler tarafından satın alınabildiği, klinik dayanağı ve güvenlik notları en çok sorulan başlıklardır. Aşağıdaki yanıtlar üreticinin açıkladığı bilgilere dayanır; kişisel uygunluk için seans öncesi değerlendirme gerekir."
        items={faqs}
      />

      <Footer />
    </>
  );
}
