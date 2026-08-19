import { site } from "@/lib/site";

export type Hours = { days: string[]; open: string; close: string };
export type Settings = {
  phone: string;
  phone_local: string;
  whatsapp: string;
  instagram: string;
  instagram_handle: string;
  address: string;
  street_address: string;
  locality: string;
  region: string;
  postal_code: string;
  country: string;
  lat: number | string | null;
  lng: number | string | null;
  hours: Hours[];
  campaign_enabled: boolean;
  campaign_text_tr: string;
  campaign_text_en: string;
  popup_enabled: boolean;
  popup_title_tr: string | null;
  popup_title_en: string | null;
  popup_text_tr: string | null;
  popup_text_en: string | null;
  popup_image: string | null;
  popup_cta_text_tr: string | null;
  popup_cta_text_en: string | null;
  popup_cta_url: string | null;
  header_code: string | null;
  footer_code: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  google_maps_url: string | null;
  google_reviews_synced_at: string | null;
};

export const SETTINGS_FALLBACK: Settings = {
  phone: "+90 507 732 30 26",
  phone_local: "0507 732 30 26",
  whatsapp: "https://wa.me/905077323026",
  instagram: "https://instagram.com/striastudio",
  instagram_handle: "@striastudio",
  address: "Çankaya, Ankara",
  street_address: "Çankaya, Ankara",
  locality: "Çankaya",
  region: "Ankara",
  postal_code: "06000",
  country: "TR",
  lat: 39.9208,
  lng: 32.8541,
  hours: [{ days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], open: "10:00", close: "19:00" }],
  campaign_enabled: false,
  campaign_text_tr: "",
  campaign_text_en: "",
  popup_enabled: false,
  popup_title_tr: null,
  popup_title_en: null,
  popup_text_tr: null,
  popup_text_en: null,
  popup_image: null,
  popup_cta_text_tr: null,
  popup_cta_text_en: null,
  popup_cta_url: null,
  header_code: null,
  footer_code: null,
  google_rating: null,
  google_review_count: null,
  google_maps_url: null,
  google_reviews_synced_at: null,
};

export type ServiceListItem = {
  slug: string;
  name_tr: string;
  name_en: string;
  tag_tr: string;
  tag_en: string;
  desc_tr: string;
  desc_en: string;
  image: string | null;
  url: string;
  rating_avg: number | null;
  rating_count: number;
};

export type SubService = {
  slug?: string;
  name: string;
  desc: string;
  gallery?: string[];
  seo_title?: string;
  seo_desc?: string;
  intro?: string;
  benefits?: string[];
  faq?: { q: string; a: string }[];
};

export type ServiceReview = {
  author_name: string;
  rating: number;
  body: string;
  body_en: string | null;
  source: string;
  source_url: string | null;
  reviewed_at: string | null;
};

export type ServiceFull = ServiceListItem & {
  hero_images: string[];
  seo_title_tr: string | null;
  seo_title_en: string | null;
  seo_desc_tr: string | null;
  seo_desc_en: string | null;
  keywords_tr: string[];
  keywords_en: string[];
  intro_tr: string | null;
  intro_en: string | null;
  aftercare_tr: string | null;
  aftercare_en: string | null;
  benefits_tr: string[];
  benefits_en: string[];
  process_tr: string[];
  process_en: string[];
  subservices_tr?: SubService[];
  faq_tr: { q: string; a: string }[];
  faq_en: { q: string; a: string }[];
  gallery: string[];
  related: string[];
  reviews: ServiceReview[];
};

export type Lang = "tr" | "en";

export function pickLang(
  tr: string | null | undefined,
  en: string | null | undefined,
  lang: Lang,
): string {
  return lang === "en" ? (en || tr || "") : (tr || "");
}

async function api<T>(path: string, revalidate = 300): Promise<T | null> {
  try {
    const res = await fetch(`${site.apiUrl}/api${path}`, {
      next: { revalidate },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// API'de puan alanları henüz olmayabilir; eksikse yıldız hiç görünmesin diye
// rating_avg null, rating_count 0'a normalize edilir (sahte veri üretilmez).
function normalizeListItem(item: ServiceListItem): ServiceListItem {
  return {
    ...item,
    rating_avg: typeof item.rating_avg === "number" ? item.rating_avg : null,
    rating_count: typeof item.rating_count === "number" ? item.rating_count : 0,
  };
}

export async function getServices(): Promise<ServiceListItem[]> {
  const out = await api<{ data: ServiceListItem[] }>("/services");
  return (out?.data ?? []).map(normalizeListItem);
}

export async function getService(slug: string): Promise<ServiceFull | null> {
  const out = await api<{ data: ServiceFull }>(`/services/${encodeURIComponent(slug)}`);
  if (!out?.data) return null;

  return {
    ...out.data,
    hero_images: Array.isArray(out.data.hero_images)
      ? out.data.hero_images.filter(
          (image): image is string => typeof image === "string" && image.length > 0,
        )
      : [],
    rating_avg: typeof out.data.rating_avg === "number" ? out.data.rating_avg : null,
    rating_count: typeof out.data.rating_count === "number" ? out.data.rating_count : 0,
    reviews: Array.isArray(out.data.reviews) ? out.data.reviews : [],
  };
}

export async function getServiceSlugs(): Promise<string[]> {
  const list = await getServices();
  return list.map((s) => s.slug);
}

export async function getSettings(): Promise<Settings | null> {
  // Short cache: admins toggle the campaign bar / contact info and expect it live.
  const out = await api<{ data: Settings }>("/settings", 30);
  if (!out?.data) return null;
  // Google alanları API'de eksikse null'a normalize — graceful (rozet render edilmez).
  return {
    ...out.data,
    google_rating: typeof out.data.google_rating === "number" ? out.data.google_rating : null,
    google_review_count:
      typeof out.data.google_review_count === "number" ? out.data.google_review_count : null,
    google_maps_url: out.data.google_maps_url ?? null,
    google_reviews_synced_at: out.data.google_reviews_synced_at ?? null,
  };
}

export type GalleryItem2 = { image: string | null; alt_tr: string; alt_en: string | null };
export type FaqItem = { q_tr: string; q_en: string | null; a_tr: string; a_en: string | null };

export async function getGallery(): Promise<GalleryItem2[]> {
  const out = await api<{ data: GalleryItem2[] }>("/gallery");
  return out?.data ?? [];
}

export async function getFaqs(): Promise<FaqItem[]> {
  const out = await api<{ data: FaqItem[] }>("/faqs");
  return out?.data ?? [];
}

export type InstagramPost = {
  id: string;
  permalink: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  caption: string | null;
  image: string | null;
  posted_at: string | null;
};

export async function getInstagramPosts(): Promise<InstagramPost[]> {
  const out = await api<{ data: InstagramPost[] }>("/instagram");
  return out?.data ?? [];
}

/** One row of the /linkler bio-link page (admin-managed). */
export type LinkItem = {
  label_tr: string;
  label_en: string | null;
  subtitle_tr: string | null;
  subtitle_en: string | null;
  url: string;
  icon: string;
  is_featured: boolean;
};

export async function getLinks(): Promise<LinkItem[]> {
  const out = await api<{ data: LinkItem[] }>("/links");
  return out?.data ?? [];
}

export function phoneHref(phone: string): string {
  return "tel:" + (phone || "").replace(/[^\d+]/g, "");
}

const DAY_NAMES: Record<string, { tr: string; en: string }> = {
  Monday: { tr: "Pzt", en: "Mon" },
  Tuesday: { tr: "Sal", en: "Tue" },
  Wednesday: { tr: "Çar", en: "Wed" },
  Thursday: { tr: "Per", en: "Thu" },
  Friday: { tr: "Cum", en: "Fri" },
  Saturday: { tr: "Cmt", en: "Sat" },
  Sunday: { tr: "Paz", en: "Sun" },
};

export function formatHours(hours: Hours[], lang: "tr" | "en"): string {
  if (!hours?.length) return "";
  return hours
    .map((h) => {
      const ds = h.days.map((d) => DAY_NAMES[d]?.[lang] ?? d);
      const dayLabel = ds.length > 1 ? `${ds[0]} – ${ds[ds.length - 1]}` : ds[0];
      return `${dayLabel} · ${h.open} – ${h.close}`;
    })
    .join(", ");
}
