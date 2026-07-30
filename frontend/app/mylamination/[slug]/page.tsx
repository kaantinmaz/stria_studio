import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { Nav } from "@/components/Nav";
import { WhatsAppIcon } from "@/components/Icons";
import { breadcrumbSchema, faqSchema, howToSchema } from "@/components/schema";
import { getSettings, SETTINGS_FALLBACK } from "@/lib/content";
import { absUrl, buildMetadata } from "@/lib/seo";
import {
  ML_BRAND,
  ML_CATEGORIES,
  ML_PRODUCTS,
  ML_SCOPE_LABEL,
} from "@/lib/mylamination";

type Params = { params: Promise<{ slug: string }> };

export const revalidate = 3600;

export function generateStaticParams() {
  return ML_PRODUCTS.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = ML_PRODUCTS.find((p) => p.slug === slug);
  if (!product) return {};

  return buildMetadata({
    title: `${product.seoTitle} | Stria Studio`,
    description: product.seoDesc,
    path: `/mylamination/${product.slug}`,
    image: `/mylamination/${product.image}`,
  });
}

const sectionClass = "border-t border-line py-[clamp(32px,5vw,56px)]";
const headingClass = "mb-5 text-[clamp(21px,2.4vw,30px)] leading-tight";

export default async function MyLaminationProductPage({ params }: Params) {
  const { slug } = await params;
  const product = ML_PRODUCTS.find((p) => p.slug === slug);
  if (!product) notFound();

  const settings = (await getSettings()) ?? SETTINGS_FALLBACK;
  const category = ML_CATEGORIES[product.category];
  const servicePath =
    product.scope === "kas"
      ? "/hizmetler/kas-laminasyon"
      : "/hizmetler/kirpik-lifting";

  const related = ML_PRODUCTS.filter(
    (p) => p.category === product.category && p.slug !== product.slug,
  ).slice(0, 6);

  const crumbs = [
    { name: "Ana Sayfa", path: "/" },
    { name: "My Lamination Ürünleri", path: "/mylamination" },
    { name: product.name, path: `/mylamination/${product.slug}` },
  ];

  // Product şeması: fiyat vermiyoruz (ürünü satmıyoruz, uygulamada kullanıyoruz),
  // bu yüzden offers yerine yalnızca tanımlayıcı alanlar ve marka bağı verilir.
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": absUrl(`/mylamination/${product.slug}#product`),
    name: product.name,
    description: product.summary,
    url: absUrl(`/mylamination/${product.slug}`),
    image: absUrl(`/mylamination/${product.image}`),
    category: category.label,
    brand: { "@type": "Brand", name: ML_BRAND.name, "@id": absUrl("/mylamination#brand") },
    ...(product.specs?.length
      ? {
          additionalProperty: product.specs.map(([name, value]) => ({
            "@type": "PropertyValue",
            name,
            value,
          })),
        }
      : {}),
    isRelatedTo: {
      "@type": "Service",
      name:
        product.scope === "kas"
          ? "Kaş Laminasyonu"
          : product.scope === "kirpik"
            ? "Kirpik Lifting"
            : "Kaş Laminasyonu ve Kirpik Lifting",
      url: absUrl(servicePath),
      provider: { "@id": absUrl("/#business") },
    },
  };

  return (
    <>
      <Nav />
      <JsonLd data={productSchema} />
      {product.usage && product.usage.length > 0 && (
        <JsonLd
          data={howToSchema({
            name: `${product.name} nasıl kullanılır?`,
            description: product.summary,
            steps: product.usage,
          })}
        />
      )}
      {product.faq && product.faq.length > 0 && <JsonLd data={faqSchema(product.faq)} />}
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <main className="mx-auto max-w-[1000px] px-[clamp(18px,5vw,56px)] pb-[clamp(32px,5vw,64px)] pt-8">
        <header className="grid grid-cols-1 items-start gap-[clamp(24px,4vw,48px)] md:grid-cols-[0.85fr_1.15fr]">
          <div className="relative aspect-square overflow-hidden rounded-[26px] border border-line bg-blush">
            <Image
              src={`/mylamination/${product.image}`}
              alt={`${product.name} — My Lamination ürünü`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 420px"
              className="object-cover"
            />
          </div>
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Link
                href={`/mylamination#${product.category}`}
                className="inline-flex items-center rounded-[22px] bg-pink px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-accent transition-colors hover:bg-blush"
              >
                {category.label}
              </Link>
              <span className="inline-flex items-center rounded-[22px] border border-line px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-muted">
                {ML_SCOPE_LABEL[product.scope]}
              </span>
            </div>
            <h1 className="mb-4 text-[clamp(26px,3.6vw,44px)] leading-[1.1]">
              {product.name}
            </h1>
            <p className="mb-6 text-[clamp(15px,1.4vw,18px)] leading-[1.7] text-muted">
              {product.summary}
            </p>
            <div className="flex flex-wrap items-center gap-4 rounded-[18px] bg-blush px-5 py-4">
              <Image
                src={ML_BRAND.logo}
                alt="My Lamination"
                width={250}
                height={150}
                className="h-8 w-auto flex-none"
              />
              <p className="min-w-[200px] flex-1 text-[13px] leading-[1.6] text-muted2">
                Stria Studio bu ürünü Ankara Çankaya’daki uygulamalarında kullanan
                sertifikalı My Lamination uzmanıdır.
              </p>
            </div>
          </div>
        </header>

        <section className={`${sectionClass} mt-[clamp(32px,5vw,56px)]`}>
          <h2 className={headingClass}>{product.name} nedir, ne işe yarar?</h2>
          <div className="grid max-w-[820px] gap-5">
            {product.body.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="text-[16px] leading-[1.75] text-muted2">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Öne çıkan özellikler</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {product.highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-start gap-3 rounded-[16px] bg-blush px-5 py-4 text-[14px] leading-[1.65] text-muted2"
              >
                <span className="mt-[2px] flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full bg-pink text-[11px] text-accent">
                  ✓
                </span>
                {highlight}
              </li>
            ))}
          </ul>
        </section>

        {product.usage && product.usage.length > 0 && (
          <section className={sectionClass}>
            <h2 className={headingClass}>Nasıl kullanılır?</h2>
            <ol className="grid gap-3">
              {product.usage.map((step, index) => (
                <li
                  key={step}
                  className="grid grid-cols-[30px_1fr] gap-4 text-[15px] leading-[1.7] text-muted2"
                >
                  <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-ink text-[12px] text-cream">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            {product.category === "uygulama" && (
              <p className="mt-6 max-w-[720px] rounded-[16px] border border-line bg-white px-5 py-4 text-[14px] leading-[1.7] text-muted">
                Bu ürün yalnızca profesyonel kullanım içindir ve My Lamination
                tarafından yalnızca sertifikalı uygulayıcılara satılır. Adımlar
                bilgi amaçlıdır; bekleme sürelerinin kıl yapısına göre ayarlanması
                gerekir.
              </p>
            )}
          </section>
        )}

        {product.ingredients && product.ingredients.length > 0 && (
          <section className={sectionClass}>
            <h2 className={headingClass}>İçerik ve etken maddeler</h2>
            <ul className="grid max-w-[760px] gap-2">
              {product.ingredients.map((ingredient) => (
                <li
                  key={ingredient}
                  className="border-b border-line pb-2 text-[15px] leading-[1.7] text-muted2 last:border-b-0"
                >
                  {ingredient}
                </li>
              ))}
            </ul>
          </section>
        )}

        {product.specs && product.specs.length > 0 && (
          <section className={sectionClass}>
            <h2 className={headingClass}>Teknik bilgi</h2>
            <div className="max-w-[680px] overflow-hidden rounded-[20px] border border-line bg-white">
              <table className="w-full border-collapse text-left text-[14px] leading-[1.6]">
                <tbody className="divide-y divide-line">
                  {product.specs.map(([label, value]) => (
                    <tr key={label}>
                      <th className="w-[42%] bg-blush px-5 py-3 font-medium text-ink">
                        {label}
                      </th>
                      <td className="px-5 py-3 text-muted2">{value}</td>
                    </tr>
                  ))}
                  <tr>
                    <th className="w-[42%] bg-blush px-5 py-3 font-medium text-ink">
                      Stok durumu (üretici)
                    </th>
                    <td className="px-5 py-3 text-muted2">
                      {product.inStock ? "Stokta" : "Üreticide stokta yok"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className={sectionClass}>
          <h2 className={headingClass}>Bu ürünü hangi uygulamada kullanıyoruz?</h2>
          <p className="max-w-[760px] text-[16px] leading-[1.75] text-muted2">
            {product.scope === "ikisi"
              ? "Bu ürün hem kaş laminasyonu hem kirpik lifting seanslarında kullanılır."
              : product.scope === "kas"
                ? "Bu ürün kaş laminasyonu seanslarında kullanılır."
                : "Bu ürün kirpik lifting seanslarında kullanılır."}{" "}
            Uygulamanın adımlarını, süresini ve sonrasındaki bakımı ilgili hizmet
            sayfasında anlattık.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/hizmetler/kas-laminasyon"
              className="inline-flex items-center gap-2 rounded-[24px] border border-line bg-white px-5 py-3 text-sm text-ink transition-colors hover:border-accent hover:text-accent"
            >
              Kaş Laminasyonu Ankara
              <span className="text-accent">→</span>
            </Link>
            <Link
              href="/hizmetler/kirpik-lifting"
              className="inline-flex items-center gap-2 rounded-[24px] border border-line bg-white px-5 py-3 text-sm text-ink transition-colors hover:border-accent hover:text-accent"
            >
              Kirpik Lifting Ankara
              <span className="text-accent">→</span>
            </Link>
          </div>

          <div className="mt-8 rounded-[26px] bg-ink px-[clamp(22px,4vw,40px)] py-[clamp(26px,4vw,38px)] text-cream">
            <h3 className="text-[clamp(19px,2.4vw,26px)] text-cream">
              Bu ürünle uygulama yaptırmak ister misiniz?
            </h3>
            <p className="mt-3 max-w-[620px] text-[15px] leading-[1.7] text-cream/70">
              Kaş ve kirpik yapınızı görmeden hangi ürünün ve hangi sürenin doğru
              olduğunu söyleyemeyiz. WhatsApp’tan ön görüşmede mevcut durumu
              değerlendirip uygun planı birlikte belirleyelim.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={settings.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-[26px] bg-[#25D366] px-6 py-3 text-sm text-white transition-opacity hover:opacity-90"
              >
                <WhatsAppIcon size={17} />
                WhatsApp’tan ön görüşme
              </a>
              <Link
                href="/mylamination"
                className="inline-flex items-center rounded-[26px] border border-cream/30 px-6 py-3 text-sm text-cream transition-colors hover:bg-cream/10"
              >
                Tüm My Lamination ürünleri
              </Link>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className={sectionClass}>
            <h2 className={headingClass}>Aynı kategorideki diğer ürünler</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/mylamination/${item.slug}`}
                  className="flex gap-4 rounded-[20px] border border-line bg-white p-4 transition-colors hover:border-accent"
                >
                  <div className="relative h-[64px] w-[64px] flex-none overflow-hidden rounded-[12px] bg-blush">
                    <Image
                      src={`/mylamination/${item.image}`}
                      alt={`${item.name} — My Lamination`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[15px] leading-[1.35] text-ink">{item.name}</h3>
                    <p className="mt-1.5 text-[13px] leading-[1.55] text-muted2">
                      {item.summary}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="mt-[clamp(28px,4vw,48px)] border-t border-line pt-6 text-[13px] leading-[1.7] text-muted">
          Ürün bilgileri üreticinin resmî sayfasına dayanır:{" "}
          <a
            href={product.sourceUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="underline decoration-line underline-offset-4 transition-colors hover:text-accent"
          >
            {product.name} — mylamination.com.tr
          </a>
          . Stria Studio ürün satışı yapmaz; ürünleri stüdyodaki uygulamalarında
          kullanır. My Lamination markası ve logosu hak sahibine aittir.
        </p>
      </main>

      {product.faq && product.faq.length > 0 && (
        <Faq title={`${product.name} hakkında sık sorulanlar`} items={product.faq} />
      )}

      <Footer />
    </>
  );
}
