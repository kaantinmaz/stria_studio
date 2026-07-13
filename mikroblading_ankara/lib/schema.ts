import { site } from "@/lib/site";
import { absUrl } from "@/lib/seo";
import { phoneHref, type Settings } from "@/lib/content";

// LocalBusiness (BeautySalon) — microsite identity. @id is referenced by
// per-page Service schema via `provider`. Same physical studio as the main brand.
export function beautySalonSchema(s: Settings) {
  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": absUrl("/#business"),
    name: `${site.studio} — ${site.brand}`,
    url: site.siteUrl,
    telephone: phoneHref(s.phone).replace("tel:", ""),
    image: absUrl("/og"),
    priceRange: "₺₺",
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
    areaServed: { "@type": "City", name: "Ankara" },
    openingHoursSpecification: s.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.open,
      closes: h.close,
    })),
    sameAs: [
      s.instagram || site.instagram,
      "https://striastudio.com",
      "https://kastasarimiankara.com",
      site.gbpUrl,
    ].filter(Boolean),
  };
}

export function serviceSchema(opts: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    serviceType: "Microblading",
    description: opts.description,
    url: absUrl(opts.path),
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

export function blogPostingSchema(opts: {
  title: string;
  description: string;
  path: string;
  datePublished: string | null;
  dateModified?: string | null;
  image?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: opts.title,
    description: opts.description,
    url: absUrl(opts.path),
    mainEntityOfPage: absUrl(opts.path),
    datePublished: opts.datePublished ?? undefined,
    dateModified: opts.dateModified ?? opts.datePublished ?? undefined,
    image: opts.image ? [opts.image] : [absUrl("/og")],
    author: { "@type": "Organization", name: site.studio },
    publisher: {
      "@type": "Organization",
      name: site.studio,
      logo: { "@type": "ImageObject", url: absUrl("/og") },
    },
  };
}
