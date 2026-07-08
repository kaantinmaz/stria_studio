import { Nav } from "@/components/Nav";
import { About } from "@/components/About";
import { AboutStory } from "@/components/AboutStory";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/components/schema";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Hakkımızda · Stria Studio · Ankara",
  description:
    "Stria Studio — Ankara Çankaya'da doğallık, sterilizasyon ve kişiye özel tasarım odaklı kalıcı makyaj stüdyosu.",
  path: "/hakkimizda",
});

export default function HakkimizdaPage() {
  return (
    <>
      <Nav />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Ana Sayfa", path: "/" },
          { name: "Hakkımızda", path: "/hakkimizda" },
        ])}
      />
      <main className="pt-[132px]">
        <About />
        <AboutStory />
      </main>
      <Footer />
    </>
  );
}
