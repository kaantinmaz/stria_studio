import { Nav } from "@/components/Nav";
import { Gallery } from "@/components/Gallery";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/components/schema";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Galeri · Stria Studio · Ankara",
  description:
    "Stria Studio çalışmalarından örnekler — Ankara Çankaya'da microblading, kalıcı makyaj ve kaş–kirpik uygulamaları.",
  path: "/galeri",
});

export default function GaleriPage() {
  return (
    <>
      <Nav />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Ana Sayfa", path: "/" },
          { name: "Galeri", path: "/galeri" },
        ])}
      />
      <main className="pt-[132px]">
        <Gallery />
      </main>
      <Footer />
    </>
  );
}
