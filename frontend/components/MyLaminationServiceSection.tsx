import Image from "next/image";
import Link from "next/link";
import {
  ML_EXPERT,
  ML_VISIBLE_PRODUCTS,
  type MlProduct,
} from "@/lib/mylamination";

// Hizmet sayfasında My Lamination ürünleri bölümü. Yalnızca yayında olan
// kategorileri gösterir; hepsi gizliyse bölüm hiç render edilmez.
export function MyLaminationServiceSection({
  scope,
  serviceName,
}: {
  scope: "kas" | "kirpik";
  serviceName: string;
}) {
  const inScope = ML_VISIBLE_PRODUCTS.filter(
    (p) => p.scope === scope || p.scope === "ikisi",
  );
  const groups = [
    {
      key: "uygulama",
      title: `${serviceName} seansında kullandığımız My Lamination ürünleri`,
      blurb: `Seansı sertifikalı My Lamination uzmanı ${ML_EXPERT.name} uygular ve her adımda hangi ürünün kullanıldığını açıkça paylaşır. Bu ürünler İtalyan teknolojisiyle üretilir ve T.C. Sağlık Bakanlığı’na kayıtlıdır.`,
      items: inScope.filter((p) => p.category === "uygulama"),
    },
    {
      key: "evde-bakim",
      title: `${serviceName} sonrası evde önerdiğimiz My Lamination ürünleri`,
      blurb:
        "Sonucun 6–8 hafta boyunca iyi durmasını en çok evde bakım belirler. Serumlar İtalyan teknolojisiyle üretilir, vegandır ve T.C. Sağlık Bakanlığı’na kayıtlıdır.",
      items: inScope.filter((p) => p.category === "evde-bakim"),
    },
  ].filter((group) => group.items.length > 0);

  if (groups.length === 0) return null;

  return (
    <>
      {groups.map((group) => (
        <section
          key={group.key}
          className="mx-auto max-w-[1160px] px-[clamp(18px,5vw,56px)] py-[clamp(32px,5vw,64px)]"
        >
          <h2 className="mb-2 text-[clamp(22px,2.4vw,30px)]">{group.title}</h2>
          <p className="mb-8 max-w-[720px] text-[15px] leading-[1.7] text-muted">
            {group.blurb}{" "}
            <Link
              href="/mylamination"
              className="font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent"
            >
              Ürün rehberini inceleyin
            </Link>
            .
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((product) => (
              <MlCard key={product.slug} product={product} />
            ))}
          </div>
        </section>
      ))}
    </>
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
