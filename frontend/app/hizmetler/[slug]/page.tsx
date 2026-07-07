import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ServicePage } from "@/components/ServicePage";
import { JsonLd } from "@/components/JsonLd";
import { serviceSchema, faqSchema, breadcrumbSchema } from "@/components/schema";
import { buildMetadata } from "@/lib/seo";
import { SERVICE_SEO, getServiceSeo } from "@/lib/services";
import { SERVICES } from "@/lib/i18n";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SERVICE_SEO.map((s) => ({ slug: s.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const svc = getServiceSeo(slug);
  if (!svc) return {};
  return buildMetadata({
    title: svc.seoTitle,
    description: svc.seoDesc,
    path: `/hizmetler/${svc.slug}`,
  });
}

export default async function ServiceRoute({ params }: Params) {
  const { slug } = await params;
  const svc = getServiceSeo(slug);
  const display = SERVICES.find((s) => s.slug === slug);
  if (!svc || !display) notFound();

  const name = display.name.tr;
  const crumbs = [
    { name: "Ana Sayfa", path: "/" },
    { name: "Hizmetler", path: "/hizmetler" },
    { name, path: `/hizmetler/${svc.slug}` },
  ];

  return (
    <>
      <Nav />
      <JsonLd data={serviceSchema(svc, name)} />
      <JsonLd data={faqSchema(svc.faq)} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <ServicePage svc={svc} display={display} />
      <Footer />
    </>
  );
}
