import { Nav } from "@/components/Nav";
import { About } from "@/components/About";
import { AboutStory } from "@/components/AboutStory";
import { Founder } from "@/components/Founder";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/components/schema";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Hakkımızda · Stria Studio · Ankara",
  description:
    "Stria Studio'yu tanıyın: Ankara Çankaya'da kalıcı makyaj, microblading ve kaş-kirpik uygulamalarında doğallık, hijyen ve kişiye özel tasarım.",
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
        <About headingAs="h1" />
        <Founder />
        <AboutStory />
      </main>
      <Footer />
    </>
  );
}
