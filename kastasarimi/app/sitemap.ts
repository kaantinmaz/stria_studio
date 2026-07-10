import type { MetadataRoute } from "next";
import { absUrl } from "@/lib/seo";
import { getAllPostSlugs } from "@/lib/content";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const slugs = await getAllPostSlugs();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absUrl("/kas-tasarimi-fiyatlari"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absUrl("/kas-tasarimi-nasil-yapilir"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absUrl("/galeri"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absUrl("/sss"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absUrl("/hakkimizda"), lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: absUrl("/iletisim"), lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: absUrl("/api-docs"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const posts: MetadataRoute.Sitemap = slugs.map((s) => ({
    url: absUrl(`/blog/${s}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...posts];
}
