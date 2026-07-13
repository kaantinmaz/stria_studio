import { site } from "@/lib/site";
import { absUrl } from "@/lib/seo";
import { phoneHref, type Settings } from "@/lib/content";

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
      "https://mikrobladingankara.com",
      "https://kastasarimiankara.com",
      site.gbpUrl,
    ].filter(Boolean),
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
