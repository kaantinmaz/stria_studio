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
    "Stria Studio Ankara Çankaya — randevu ve sorular için WhatsApp, telefon ve konum bilgileri.",
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
        <Contact />
        <StudioMap />
      </main>
      <Footer />
    </>
  );
}
