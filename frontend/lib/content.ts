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
};

export const SETTINGS_FALLBACK: Settings = {
  phone: "+90 507 732 30 26",
  phone_local: "0507 732 30 26",
  whatsapp: "https://wa.me/905077323026",
  instagram: "https://instagram.com/striastudio",
  instagram_handle: "@striastudio",
  address: "Çankaya, Ankara",
  street_address: "[Mahalle] Cd. No: 00",
  locality: "Çankaya",
  region: "Ankara",
  postal_code: "06000",
  country: "TR",
  lat: 39.9208,
  lng: 32.8541,
  hours: [{ days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], open: "10:00", close: "19:00" }],
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
};

export type ServiceFull = ServiceListItem & {
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
  faq_tr: { q: string; a: string }[];
  faq_en: { q: string; a: string }[];
  gallery: string[];
  related: string[];
};

export type Lang = "tr" | "en";

export function pickLang(
  tr: string | null | undefined,
  en: string | null | undefined,
  lang: Lang,
): string {
  return lang === "en" ? (en || tr || "") : (tr || "");
}

async function api<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${site.apiUrl}/api${path}`, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getServices(): Promise<ServiceListItem[]> {
  const out = await api<{ data: ServiceListItem[] }>("/services");
  return out?.data ?? [];
}

export async function getService(slug: string): Promise<ServiceFull | null> {
  const out = await api<{ data: ServiceFull }>(`/services/${encodeURIComponent(slug)}`);
  return out?.data ?? null;
}

export async function getServiceSlugs(): Promise<string[]> {
  const list = await getServices();
  return list.map((s) => s.slug);
}

export async function getSettings(): Promise<Settings | null> {
  const out = await api<{ data: Settings }>("/settings");
  return out?.data ?? null;
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
