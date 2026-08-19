import { site } from "@/lib/site";
import { absUrl } from "@/lib/seo";
import {
  phoneHref,
  type ServiceFull,
  type ServiceReview,
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
    // Kardeş domainler (microbladingankara.com, kastasarimiankara.com) ana
    // domaine 301 yönlendiriliyor; redirect'e işaret eden sameAs yanlış otorite
    // sinyali olur — bu yüzden listeden çıkarıldı.
    sameAs: [s.instagram, site.gbpUrl].filter(Boolean),
    founder: { "@id": absUrl("/hakkimizda#nilsu-kamisli") },
    priceRange: "₺₺",
  };
}

// Person (yazar/uygulayıcı entity) — E-E-A-T sinyali. @id, BlogPosting.author ve
// BeautySalon.founder tarafından referanslanır; /hakkimizda sayfasındaki
// id="nilsu-kamisli" çıpasında çözülür. My Lamination sertifikası kuruma değil
// kişiye ait olduğu için hasCredential burada tutulur.
export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": absUrl("/hakkimizda#nilsu-kamisli"),
    name: "Nilsu Kamişli",
    jobTitle: "Kalıcı makyaj uzmanı, stüdyo kurucusu",
    worksFor: { "@id": absUrl("/#business") },
    url: absUrl("/hakkimizda"),
    image: absUrl("/images/nilsu-kamisli.jpg"),
    knowsAbout: [
      "Microblading",
      "Kaş pudralama",
      "Kalıcı eyeliner",
      "Dudak renklendirme",
      "Kaş laminasyonu",
      "Kirpik lifting",
      "Kamuflaj makyaj",
    ],
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "certificate",
      name: "My Lamination Workshop Sertifikası",
      recognizedBy: { "@type": "Organization", name: "My Lamination" },
    },
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
  rating?: { avg: number | null; count: number; reviews?: ServiceReview[] },
) {
  const hasRating = Boolean(rating && rating.avg != null && rating.count > 0);
  const reviews = rating?.reviews ?? [];
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
    ...(hasRating && rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.avg,
            reviewCount: rating.count,
            bestRating: 5,
            worstRating: 1,
          },
          ...(reviews.length
            ? {
                review: reviews.slice(0, 5).map((r) => ({
                  "@type": "Review",
                  author: { "@type": "Person", name: r.author_name },
                  reviewRating: {
                    "@type": "Rating",
                    ratingValue: r.rating,
                    bestRating: 5,
                    worstRating: 1,
                  },
                  ...(r.reviewed_at ? { datePublished: r.reviewed_at } : {}),
                  reviewBody: r.body,
                })),
              }
            : {}),
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
