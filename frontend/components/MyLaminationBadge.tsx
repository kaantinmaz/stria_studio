import Image from "next/image";
import Link from "next/link";
import { ML_BRAND, ML_EXPERT } from "@/lib/mylamination";

// "My Lamination uzmanı" rozeti. Kaş laminasyonu ve kirpik lifting sayfalarının
// en üstünde, başlığın hemen üzerinde görünür; ürün rehberine bağlantı verir.
// Sertifika kişiye ait olduğu için uzmanlık Nilsu Kamişli adına yazılır.
export function MyLaminationBadge({
  scope,
  className = "",
}: {
  scope: "kas" | "kirpik";
  className?: string;
}) {
  const label =
    scope === "kas"
      ? `${ML_EXPERT.name}, kaş laminasyonunda My Lamination uzmanıdır`
      : `${ML_EXPERT.name}, kirpik liftingde My Lamination uzmanıdır`;

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
          Stria Studio’nun kurucusu Nilsu Kamişli, My Lamination workshopunu
          tamamlamış sertifikalı uygulayıcıdır. Seansta İtalyan teknolojisiyle
          üretilen, T.C. Sağlık Bakanlığı’na kayıtlı{" "}
          <Link
            href="/mylamination"
            className="underline decoration-line underline-offset-2 transition-colors hover:text-accent"
          >
            My Lamination ürünleri
          </Link>{" "}
          kullanılır.
        </p>
      </div>
    </div>
  );
}

// Kompakt marka işareti — hizmet kartlarının görseli üzerinde, kategori
// çipinin karşı köşesinde durur. Kart zaten bir link olduğu için kendisi
// link değildir; yalnızca "bu uygulamada My Lamination kullanıyoruz" der.
export function MyLaminationChip({ className = "" }: { className?: string }) {
  return (
    <span
      title="My Lamination ürünleriyle uygulanır"
      className={`inline-flex items-center gap-[6px] rounded-[16px] bg-cream/[0.92] py-[5px] pl-[7px] pr-[10px] backdrop-blur-[4px] ${className}`}
    >
      <Image
        src={ML_BRAND.logoMark}
        alt=""
        aria-hidden
        width={270}
        height={270}
        className="h-[15px] w-[15px] flex-none"
      />
      <span className="text-[9.5px] font-medium uppercase tracking-[0.08em] text-ink">
        My Lamination
      </span>
    </span>
  );
}
