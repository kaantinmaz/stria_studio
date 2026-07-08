import { site } from "@/lib/site";
import { absUrl } from "@/lib/seo";

// LocalBusiness (BeautySalon) — site-wide identity. @id is referenced by
// per-service Service schema via `provider`.
export function beautySalonSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": absUrl("/#business"),
    name: site.nap.name,
    url: site.siteUrl,
    telephone: site.phoneHref.replace("tel:", ""),
    image: absUrl("/images/hero.png"),
    address: {
      "@type": "PostalAddress",
      streetAddress: site.nap.streetAddress,
      addressLocality: site.nap.locality,
      addressRegion: site.nap.region,
      postalCode: site.nap.postalCode,
      addressCountry: site.nap.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.lat,
      longitude: site.geo.lng,
    },
    openingHoursSpecification: site.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.open,
      closes: h.close,
    })),
    sameAs: [site.ig, site.gbpUrl].filter(Boolean),
    priceRange: "₺₺",
  };
}

export function serviceSchema(
  svc: { slug: string; intro_tr: string | null; desc_tr: string },
  name: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    serviceType: name,
    description: svc.intro_tr || svc.desc_tr,
    url: absUrl(`/hizmetler/${svc.slug}`),
    provider: { "@id": absUrl("/#business") },
    areaServed: { "@type": "City", name: "Ankara" },
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
