import Image from "next/image";
import Link from "next/link";
import { ML_BRAND } from "@/lib/mylamination";

// "My Lamination uzmanı" rozeti. Kaş laminasyonu ve kirpik lifting sayfalarının
// en üstünde, başlığın hemen üzerinde görünür; ürün rehberine bağlantı verir.
export function MyLaminationBadge({
  scope,
  className = "",
}: {
  scope: "kas" | "kirpik";
  className?: string;
}) {
  const label =
    scope === "kas"
      ? "Kaş laminasyonunda My Lamination uzmanıyız"
      : "Kirpik liftingde My Lamination uzmanıyız";

  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[20px] border border-line bg-white px-5 py-4 ${className}`}
    >
      <Image
        src={ML_BRAND.logo}
        alt="My Lamination"
        width={250}
        height={150}
        className="h-12 w-auto flex-none"
      />
      <div className="min-w-[220px] flex-1">
        <p className="text-[14px] font-medium leading-[1.45] text-ink">{label}</p>
        <p className="mt-1 text-[13px] leading-[1.6] text-muted">
          Uygulamalarımızda İtalyan teknolojisiyle üretilen, T.C. Sağlık
          Bakanlığı’na kayıtlı{" "}
          <Link
            href="/mylamination"
            className="underline decoration-line underline-offset-2 transition-colors hover:text-accent"
          >
            My Lamination ürünlerini
          </Link>{" "}
          kullanıyoruz.
        </p>
      </div>
    </div>
  );
}
