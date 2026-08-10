import { Nav } from "@/components/Nav";
import { About } from "@/components/About";
import { AboutStory } from "@/components/AboutStory";
import { Founder } from "@/components/Founder";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, personSchema } from "@/components/schema";
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
      <JsonLd data={personSchema()} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Ana Sayfa", path: "/" },
          { name: "Hakkımızda", path: "/hakkimizda" },
        ])}
      />
      <main className="pt-[132px]">
        <About headingAs="h1" />
        {/* Person @id="/hakkimizda#nilsu-kamisli" bu çıpada çözülür. */}
        <div id="nilsu-kamisli">
          <Founder />
        </div>
        <AboutStory />
      </main>
      <Footer />
    </>
  );
}
