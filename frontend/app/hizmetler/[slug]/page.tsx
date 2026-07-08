import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ServicePage } from "@/components/ServicePage";
import { JsonLd } from "@/components/JsonLd";
import { serviceSchema, faqSchema, breadcrumbSchema } from "@/components/schema";
import { buildMetadata } from "@/lib/seo";
import { getService, getServices, getServiceSlugs } from "@/lib/content";

type Params = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const svc = await getService(slug);
  if (!svc) return {};
  return buildMetadata({
    title: svc.seo_title_tr || `${svc.name_tr} · Stria Studio`,
    description: svc.seo_desc_tr || svc.desc_tr,
    path: `/hizmetler/${svc.slug}`,
  });
}

export default async function ServiceRoute({ params }: Params) {
  const { slug } = await params;
  const [svc, services] = await Promise.all([getService(slug), getServices()]);
  if (!svc) notFound();

  const name = svc.name_tr;
  const crumbs = [
    { name: "Ana Sayfa", path: "/" },
    { name: "Hizmetler", path: "/hizmetler" },
    { name, path: `/hizmetler/${svc.slug}` },
  ];

  return (
    <>
      <Nav />
      <JsonLd data={serviceSchema(svc, name)} />
      <JsonLd data={faqSchema(svc.faq_tr)} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <ServicePage svc={svc} services={services} />
      <Footer />
    </>
  );
}
