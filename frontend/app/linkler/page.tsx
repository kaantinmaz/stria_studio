import { LinkTree } from "@/components/LinkTree";
import { getLinks } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = {
  ...buildMetadata({
    title: "Stria Studio · Tüm Bağlantılar",
    description:
      "Stria Studio'nun tüm bağlantıları tek sayfada: WhatsApp randevu, hizmetler, galeri, Instagram ve konum bilgisi.",
    path: "/linkler",
  }),
  // Instagram bio hedefi; site içeriğinin ince bir kopyası olduğu için aramada
  // listelenmez, ancak link değeri sayfalara akmaya devam eder.
  robots: { index: false, follow: true },
};

export const revalidate = 300;

export default async function LinklerPage() {
  const links = await getLinks();
  return <LinkTree links={links} />;
}
