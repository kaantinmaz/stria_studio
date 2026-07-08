import { site } from "@/lib/site";

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
