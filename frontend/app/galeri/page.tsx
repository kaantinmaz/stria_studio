import { Nav } from "@/components/Nav";
import { Gallery } from "@/components/Gallery";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/components/schema";
import { buildMetadata } from "@/lib/seo";
import { getGallery } from "@/lib/content";

export const metadata = buildMetadata({
  title: "Galeri · Stria Studio · Ankara",
  description:
    "Stria Studio galerisinde Ankara Çankaya'da uygulanan microblading, kalıcı makyaj ve kaş-kirpik çalışmalarından doğal sonuçları ve örnekleri inceleyin.",
  path: "/galeri",
});

export const revalidate = 300;

export default async function GaleriPage() {
  const gallery = await getGallery();

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
        <Gallery items={gallery} headingAs="h1" />
      </main>
      <Footer />
    </>
  );
}
