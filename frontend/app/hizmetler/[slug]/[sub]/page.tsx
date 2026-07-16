import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SubServicePage } from "@/components/SubServicePage";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema, subServiceSchema } from "@/components/schema";
import { buildMetadata } from "@/lib/seo";
import { getService, getServiceSlugs } from "@/lib/content";

type Params = { params: Promise<{ slug: string; sub: string }> };

export const revalidate = 300;

export async function generateStaticParams() {
  const serviceSlugs = await getServiceSlugs();
  const services = await Promise.all(serviceSlugs.map((slug) => getService(slug)));

  return services.flatMap((svc) => {
    if (!svc) return [];

    return (svc.subservices_tr ?? []).flatMap((sub) =>
      sub.slug ? [{ slug: svc.slug, sub: sub.slug }] : [],
    );
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, sub: subSlug } = await params;
  const svc = await getService(slug);
  const sub = svc?.subservices_tr?.find((item) => item.slug === subSlug);
  if (!svc || !sub) return {};

  return buildMetadata({
    title: sub.seo_title || `${sub.name} Ankara · Stria Studio`,
    description: sub.seo_desc || sub.desc,
    path: `/hizmetler/${svc.slug}/${sub.slug}`,
  });
}

export default async function SubServiceRoute({ params }: Params) {
  const { slug, sub: subSlug } = await params;
  const svc = await getService(slug);
  if (!svc) notFound();

  const sub = svc.subservices_tr?.find((item) => item.slug === subSlug);
  if (!sub) notFound();

  const path = `/hizmetler/${svc.slug}/${sub.slug}`;
  const crumbs = [
    { name: "Ana Sayfa", path: "/" },
    { name: "Hizmetler", path: "/hizmetler" },
    { name: svc.name_tr, path: `/hizmetler/${svc.slug}` },
    { name: sub.name, path },
  ];

  return (
    <>
      <Nav />
      <JsonLd data={subServiceSchema(svc, sub)} />
      {sub.faq && sub.faq.length > 0 && <JsonLd data={faqSchema(sub.faq)} />}
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <SubServicePage svc={svc} sub={sub} />
      <Footer />
    </>
  );
}
