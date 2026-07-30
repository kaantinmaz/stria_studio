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

export async function getAllPostSlugs(): Promise<string[]> {
  const posts = await getAllPosts();
  return posts.map((p) => p.slug);
}
