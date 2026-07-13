import { Nav } from "@/components/Nav";
import { Contact } from "@/components/Contact";
import { StudioMap } from "@/components/StudioMap";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/components/schema";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "İletişim · Stria Studio · Ankara",
  description:
    "Ankara Çankaya'daki Stria Studio'ya ulaşın; kalıcı makyaj, microblading ve kaş-kirpik uygulamaları için WhatsApp'tan bilgi alın ve randevu oluşturun.",
  path: "/iletisim",
});

export default function IletisimPage() {
  return (
    <>
      <Nav />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Ana Sayfa", path: "/" },
          { name: "İletişim", path: "/iletisim" },
        ])}
      />
      <main className="pt-[132px]">
        <Contact headingAs="h1" />
        <StudioMap />
      </main>
      <Footer />
    </>
  );
}
