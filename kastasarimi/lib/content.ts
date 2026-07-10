import { site } from "@/lib/site";

// ---- Types (TR-only subset of the shared backend resources) ----

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

// Used when the backend is unreachable (e.g. build with API down). Owner edits
// real NAP in the admin; these keep pages rendering and schema valid.
export const SETTINGS_FALLBACK: Settings = {
  phone: "+90 507 732 30 26",
  phone_local: "0507 732 30 26",
  whatsapp: "https://wa.me/905077323026",
  instagram: "https://instagram.com/striastudio",
  instagram_handle: "@striastudio",
  address: "Çankaya, Ankara",
  street_address: "Kızılırmak Mah. [Cadde] No: 00",
  locality: "Çankaya",
  region: "Ankara",
  postal_code: "06000",
  country: "TR",
  lat: 39.9208,
  lng: 32.8541,
  hours: [
    {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      open: "10:00",
      close: "19:00",
    },
  ],
};

export type ServiceFull = {
  slug: string;
  name_tr: string;
  tag_tr: string;
  desc_tr: string;
  image: string | null;
  seo_title_tr: string | null;
  seo_desc_tr: string | null;
  keywords_tr: string[];
  intro_tr: string | null;
  aftercare_tr: string | null;
  benefits_tr: string[];
  process_tr: string[];
  faq_tr: { q: string; a: string }[];
  gallery: string[];
};

export type PostList = {
  id: number;
  slug: string;
  title_tr: string;
  excerpt_tr: string;
  cover_url: string | null;
  published_at: string | null;
  category: { slug: string; name_tr: string } | null;
};

export type PostFull = PostList & {
  body_tr: string;
  meta_title_tr: string | null;
  meta_desc_tr: string | null;
};

export type Paginated<T> = {
  data: T[];
  meta: { current_page: number; last_page: number; total: number };
};

export type GalleryItem = { image: string | null; alt_tr: string };
export type FaqItem = { q_tr: string; a_tr: string };

// ---- Scoped API client ----

const REVALIDATE = 3600; // ISR: content edits in admin appear within the hour.

function base(path: string): string {
  return `${site.apiUrl}/api/microsites/${site.slug}${path}`;
}

async function api<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getService(): Promise<ServiceFull | null> {
  const out = await api<{ data: ServiceFull }>(base("/service"));
  return out?.data ?? null;
}

export async function getSettings(): Promise<Settings | null> {
  const out = await api<{ data: Settings }>(base("/settings"));
  return out?.data ?? null;
}

export async function getPosts(page = 1): Promise<Paginated<PostList>> {
  const out = await api<Paginated<PostList>>(base(`/posts?page=${page}`));
  return out ?? { data: [], meta: { current_page: 1, last_page: 1, total: 0 } };
}

export async function getPost(slug: string): Promise<PostFull | null> {
  const out = await api<{ data: PostFull }>(base(`/posts/${encodeURIComponent(slug)}`));
  return out?.data ?? null;
}

export async function getFaqs(): Promise<FaqItem[]> {
  const out = await api<{ data: FaqItem[] }>(base("/faqs"));
  return out?.data ?? [];
}

export async function getGallery(): Promise<GalleryItem[]> {
  const out = await api<{ data: GalleryItem[] }>(base("/gallery"));
  return out?.data ?? [];
}

export async function getAllPostSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  let page = 1;
  for (;;) {
    const res = await getPosts(page);
    slugs.push(...res.data.map((p) => p.slug));
    if (page >= res.meta.last_page || res.data.length === 0) break;
    page++;
  }
  return slugs;
}

// ---- Helpers ----

export function phoneHref(phone: string): string {
  return "tel:" + (phone || "").replace(/[^\d+]/g, "");
}

const DAY_TR: Record<string, string> = {
  Monday: "Pzt",
  Tuesday: "Sal",
  Wednesday: "Çar",
  Thursday: "Per",
  Friday: "Cum",
  Saturday: "Cmt",
  Sunday: "Paz",
};

export function formatHours(hours: Hours[]): string {
  if (!hours?.length) return "";
  return hours
    .map((h) => {
      const ds = h.days.map((d) => DAY_TR[d] ?? d);
      const label = ds.length > 1 ? `${ds[0]} – ${ds[ds.length - 1]}` : ds[0];
      return `${label} · ${h.open} – ${h.close}`;
    })
    .join(", ");
}
