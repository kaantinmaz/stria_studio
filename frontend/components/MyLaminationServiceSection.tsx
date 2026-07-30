import Image from "next/image";
import Link from "next/link";
import { ML_PRODUCTS, type MlProduct } from "@/lib/mylamination";

// Hizmet sayfasında "seansta kullandığımız ürünler" bölümü. Uygulama ve ekipman
// ürünlerini kısa kartlarla listeler, detay için ürün rehberine bağlar.
export function MyLaminationServiceSection({
  scope,
  serviceName,
}: {
  scope: "kas" | "kirpik";
  serviceName: string;
}) {
  const inScope = ML_PRODUCTS.filter(
    (p) => p.scope === scope || p.scope === "ikisi",
  );
  const solutions = inScope.filter((p) => p.category === "uygulama");
  const homecare = inScope.filter((p) => p.category === "evde-bakim");

  return (
    <section className="mx-auto max-w-[1160px] px-[clamp(18px,5vw,56px)] py-[clamp(32px,5vw,64px)]">
      <h2 className="mb-2 text-[clamp(22px,2.4vw,30px)]">
        {serviceName} seansında kullandığımız My Lamination ürünleri
      </h2>
      <p className="mb-8 max-w-[720px] text-[15px] leading-[1.7] text-muted">
        Seansın her adımında hangi ürünü kullandığımızı açıkça paylaşırız.
        Aşağıdaki solüsyon ve bakım ürünleri My Lamination’a aittir; İtalyan
        teknolojisiyle üretilir ve T.C. Sağlık Bakanlığı’na kayıtlıdır.{" "}
        <Link
          href="/mylamination"
          className="font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent"
        >
          Tüm ürün rehberini inceleyin
        </Link>
        .
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {solutions.map((product) => (
          <MlCard key={product.slug} product={product} />
        ))}
      </div>

      {homecare.length > 0 && (
        <>
          <h3 className="mb-2 mt-[clamp(28px,4vw,48px)] text-[clamp(18px,2vw,22px)]">
            Sonrasında evde önerdiğimiz ürünler
          </h3>
          <p className="mb-6 max-w-[720px] text-[15px] leading-[1.7] text-muted">
            Sonucun 6–8 hafta boyunca iyi durmasını en çok evde bakım belirler.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {homecare.map((product) => (
              <MlCard key={product.slug} product={product} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function MlCard({ product }: { product: MlProduct }) {
  return (
    <Link
      href={`/mylamination/${product.slug}`}
      className="flex gap-4 rounded-[22px] border border-line bg-white p-4 transition-colors hover:border-accent"
    >
      <div className="relative h-[72px] w-[72px] flex-none overflow-hidden rounded-[14px] bg-blush">
        <Image
          src={`/mylamination/${product.image}`}
          alt={`${product.name} — My Lamination`}
          fill
          sizes="72px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0">
        <h4 className="text-[15px] leading-[1.35] text-ink">{product.name}</h4>
        <p className="mt-1.5 text-[13px] leading-[1.6] text-muted2">
          {product.summary}
        </p>
      </div>
    </Link>
  );
}
