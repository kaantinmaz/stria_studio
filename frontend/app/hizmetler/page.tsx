import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ImageSlot } from "@/components/ImageSlot";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/components/schema";
import { buildMetadata } from "@/lib/seo";
import { getServices } from "@/lib/content";

export const revalidate = 300;

export const metadata = buildMetadata({
  title: "Hizmetler · Ankara Kalıcı Makyaj | Stria Studio",
  description:
    "Ankara Çankaya'da microblading, kaş pudralama, eyeliner, dipliner, dudak renklendirme, kaş laminasyonu ve kirpik lifting. Tüm kalıcı makyaj hizmetleri.",
  path: "/hizmetler",
});

const crumbs = [
  { name: "Ana Sayfa", path: "/" },
  { name: "Hizmetler", path: "/hizmetler" },
];

export default async function HizmetlerHub() {
  const services = await getServices();
  return (
    <>
      <Nav />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <main className="mx-auto max-w-[1160px] px-[clamp(18px,5vw,56px)] pb-[clamp(48px,7vw,96px)] pt-8">
        <div className="mb-[clamp(32px,5vw,56px)] max-w-[720px]">
          <div className="mb-4 text-xs uppercase tracking-[0.14em] text-accent">
            Hizmetlerimiz
          </div>
          <h1 className="mb-5 text-[clamp(30px,4.4vw,56px)] leading-[1.06]">
            Ankara kalıcı makyaj ve kaş–kirpik hizmetleri
          </h1>
          <p className="text-[clamp(15px,1.4vw,18px)] leading-[1.7] text-muted">
            Kaştan dudağa, gözden kirpiğe — Çankaya'daki Stria Studio'da her
            uygulama yüz hatlarına göre planlanır. Aşağıdan ilgilendiğin hizmete
            girip detayları ve sık sorulan soruları inceleyebilirsin.
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-[18px]">
          {services.map((s) => (
            <Link
              key={s.slug}
              href={`/hizmetler/${s.slug}`}
              className="group flex flex-col overflow-hidden rounded-[24px] border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-40px_rgba(66,48,46,0.5)]"
            >
              <div className="relative h-[200px]">
                <ImageSlot
                  src={s.image ?? ""}
                  alt={s.name_tr}
                  placeholder={s.name_tr}
                  sizes="(max-width: 768px) 100vw, 300px"
                />
                <span className="absolute left-3 top-3 rounded-[16px] bg-cream/[0.92] px-[11px] py-[6px] text-[10px] uppercase tracking-[0.12em] text-accent backdrop-blur-[4px]">
                  {s.tag_tr}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 px-[26px] pb-[22px] pt-6">
                <h2 className="text-[22px] leading-[1.15]">{s.name_tr}</h2>
                <p className="flex-1 text-sm leading-[1.6] text-muted">
                  {s.desc_tr}
                </p>
                <span className="pt-2 text-[13px] font-medium text-accent">
                  Detaylar →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
