import { site } from "@/lib/site";
import { absUrl } from "@/lib/seo";
import {
  phoneHref,
  type ServiceFull,
  type Settings,
  type SubService,
} from "@/lib/content";

// LocalBusiness (BeautySalon) — site-wide identity. @id is referenced by
// per-service Service schema via `provider`.
export function beautySalonSchema(s: Settings) {
  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": absUrl("/#business"),
    name: site.nap.name,
    url: site.siteUrl,
    telephone: phoneHref(s.phone).replace("tel:", ""),
    image: absUrl("/images/hero.png"),
    address: {
      "@type": "PostalAddress",
      streetAddress: s.street_address,
      addressLocality: s.locality,
      addressRegion: s.region,
      postalCode: s.postal_code,
      addressCountry: s.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: Number(s.lat),
      longitude: Number(s.lng),
    },
    openingHoursSpecification: s.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.open,
      closes: h.close,
    })),
    sameAs: [
      s.instagram,
      "https://microbladingankara.com",
      "https://kastasarimiankara.com",
      site.gbpUrl,
    ].filter(Boolean),
    priceRange: "₺₺",
  };
}

// Colloquial synonyms searchers use for a service; emitted as schema.org
// alternateName so search/AI engines map variant queries to the same page.
const SERVICE_ALTERNATE_NAMES: Record<string, string[]> = {
  microblading: ["Kıl Tekniği Kaş", "Kaş Microblading"],
};

export function serviceSchema(
  svc: {
    slug: string;
    intro_tr: string | null;
    desc_tr: string;
    subservices_tr?: SubService[];
  },
  name: string,
  path = `/hizmetler/${svc.slug}`,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    serviceType: name,
    ...(SERVICE_ALTERNATE_NAMES[svc.slug]
      ? { alternateName: SERVICE_ALTERNATE_NAMES[svc.slug] }
      : {}),
    description: svc.intro_tr || svc.desc_tr,
    url: absUrl(path),
    provider: { "@id": absUrl("/#business") },
    areaServed: { "@type": "City", name: "Ankara" },
    ...(svc.subservices_tr?.length
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: `${name} Alt Uygulamaları`,
            itemListElement: svc.subservices_tr.map((subservice) => ({
              "@type": "Offer",
              ...(subservice.slug
                ? { url: absUrl(`/hizmetler/${svc.slug}/${subservice.slug}`) }
                : {}),
              itemOffered: {
                "@type": "Service",
                name: subservice.name,
                description: subservice.desc,
              },
            })),
          },
        }
      : {}),
  };
}

export function subServiceSchema(svc: ServiceFull, sub: SubService) {
  const path = `/hizmetler/${svc.slug}/${sub.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: sub.name,
    serviceType: sub.name,
    description: sub.desc,
    url: absUrl(path),
    provider: { "@id": absUrl("/#business") },
    areaServed: "Ankara",
    category: svc.name_tr,
  };
}

export function faqSchema(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function howToSchema(opts: { name: string; description: string; steps: string[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text: s,
    })),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absUrl(it.path),
    })),
  };
}
