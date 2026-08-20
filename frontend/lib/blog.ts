import { site } from "@/lib/site";

export type Category = { id: number; slug: string; name_tr: string; name_en: string };
export type Tag = { slug: string; name_tr: string; name_en: string };

export type PostList = {
  id: number;
  slug: string;
  title_tr: string;
  title_en: string;
  excerpt_tr: string;
  excerpt_en: string;
  cover_url: string | null;
  published_at: string | null;
  updated_at: string | null;
  category: { slug: string; name_tr: string; name_en: string } | null;
  tags: Tag[];
};

export type PostFull = PostList & {
  body_tr: string;
  body_en: string;
  meta_title_tr: string | null;
  meta_title_en: string | null;
  meta_desc_tr: string | null;
  meta_desc_en: string | null;
};

export type Paginated<T> = {
  data: T[];
  meta: { current_page: number; last_page: number; total: number };
};

export type Heading = { id: string; text: string; level: 2 | 3 };

const TR_FOLD: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
  â: "a",
  î: "i",
  û: "u",
};

export function slugifyTr(text: string): string {
  return (
    text
      .toLocaleLowerCase("tr")
      .replace(/[çğıöşüâîû]/g, (c) => TR_FOLD[c] ?? c)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "bolum"
  );
}

/**
 * Gövde HTML'i sahibi admin editöründe yazar; başlıklarda id bulunmaz. İçindekiler
 * bağlantılarının çalışması için h2/h3'lere kararlı id basıp listeyi çıkarıyoruz.
 */
export function withHeadings(html: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const used = new Map<string, number>();

  const out = html.replace(
    /<h([23])\b([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (match, lvl: string, attrs: string, inner: string) => {
      const text = inner.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      if (!text) return match;

      const existing = /\bid=["']([^"']+)["']/i.exec(attrs);
      let id = existing?.[1] ?? slugifyTr(text);
      if (!existing) {
        const seen = used.get(id) ?? 0;
        used.set(id, seen + 1);
        if (seen > 0) id = `${id}-${seen + 1}`;
      }

      headings.push({ id, text, level: Number(lvl) as 2 | 3 });
      return existing
        ? match
        : `<h${lvl}${attrs} id="${id}">${inner}</h${lvl}>`;
    },
  );

  return { html: out, headings };
}

/** Dakika cinsinden kaba okuma süresi (200 kelime/dk). */
export function readingMinutes(html: string): number {
  const words = html
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export type FaqItem = { q: string; a: string };

const FAQ_SECTION =
  /<h([23])[^>]*>[^<]*(?:sık sorulan|sss|frequently asked|faq)[^<]*<\/h\1>([\s\S]*?)(?=<h[12]|$)/i;
const FAQ_H3 =
  /<h3[^>]*>([\s\S]*?)<\/h3>\s*((?:<(?:p|ul|ol)[^>]*>[\s\S]*?<\/(?:p|ul|ol)>\s*)+)/gi;
const FAQ_STRONG = /<p[^>]*>\s*<strong>([\s\S]*?)<\/strong>([\s\S]*?)<\/p>/gi;

const plain = (s: string) =>
  s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

/**
 * Yazıların "Sık Sorulan Sorular" bölümünü FAQPage şemasına çevirmek için ayıklar.
 * Editörde iki kalıp kullanılmış: `<h3>Soru</h3><p>Cevap</p>` ve
 * `<p><strong>Soru?</strong> Cevap</p>`. İkincisi yalnız h3 kalıbı hiç eşleşmezse
 * denenir, yoksa gövdedeki vurgulu cümleler soru sanılır.
 */
export function extractFaq(html: string): FaqItem[] {
  const section = FAQ_SECTION.exec(html);
  if (!section) return [];
  const body = section[2];
  const out: FaqItem[] = [];

  FAQ_H3.lastIndex = 0;
  for (let m = FAQ_H3.exec(body); m; m = FAQ_H3.exec(body)) {
    const q = plain(m[1]);
    const a = plain(m[2]);
    if (q && a) out.push({ q, a });
  }
  if (out.length > 0) return out;

  FAQ_STRONG.lastIndex = 0;
  for (let m = FAQ_STRONG.exec(body); m; m = FAQ_STRONG.exec(body)) {
    const q = plain(m[1]);
    const a = plain(m[2]);
    if (q && a.length > 20) out.push({ q, a });
  }
  return out;
}

const REVALIDATE = 300;

async function api<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${site.apiUrl}/api${path}`, {
      next: { revalidate: REVALIDATE },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getPosts(
  params: { category?: string; tag?: string; page?: number } = {},
): Promise<Paginated<PostList>> {
  const q = new URLSearchParams();
  if (params.category) q.set("category", params.category);
  if (params.tag) q.set("tag", params.tag);
  if (params.page) q.set("page", String(params.page));
  const qs = q.toString();
  const out = await api<Paginated<PostList>>(`/posts${qs ? `?${qs}` : ""}`);
  return out ?? { data: [], meta: { current_page: 1, last_page: 1, total: 0 } };
}

export async function getPost(slug: string): Promise<PostFull | null> {
  const out = await api<{ data: PostFull }>(`/posts/${encodeURIComponent(slug)}`);
  return out?.data ?? null;
}

export async function getCategories(): Promise<Category[]> {
  const out = await api<{ data: Category[] }>("/categories");
  return out?.data ?? [];
}

export async function getTags(): Promise<Tag[]> {
  const out = await api<{ data: Tag[] }>("/tags");
  return out?.data ?? [];
}

/**
 * Tüm yazılar, sayfalama gezilerek. API sayfa başına 9 döner; blog listesi ve
 * sitemap tam listeye ihtiyaç duyar. Kategori filtresi istemci tarafında
 * çalıştığı için eksik liste, filtreyi de yanlış gösterir.
 */
export async function getAllPosts(): Promise<PostList[]> {
  const posts: PostList[] = [];
  let page = 1;
  for (;;) {
    const res = await getPosts({ page });
    posts.push(...res.data);
    if (page >= res.meta.last_page || res.data.length === 0) break;
    page++;
  }
  return posts;
}
