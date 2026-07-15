import type { MetadataRoute } from "next";
import { absUrl } from "@/lib/seo";
import { getServiceSlugs } from "@/lib/content";
import { getAllPostSlugs } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const slugs = await getAllPostSlugs();
  const serviceSlugs = await getServiceSlugs();
  const blog = [
    { url: absUrl("/blog"), lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 },
    ...slugs.map((s) => ({
      url: absUrl(`/blog/${s}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
  return [
    { url: absUrl("/"), lastModified: now, changeFrequency: "monthly", priority: 1 },
    {
      url: absUrl("/hizmetler"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absUrl("/ankara-kalici-makyaj-yapan-yerler"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    { url: absUrl("/galeri"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absUrl("/hakkimizda"), lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: absUrl("/iletisim"), lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: absUrl("/sss"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    ...serviceSlugs.map((slug) => ({
      url: absUrl(`/hizmetler/${slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...blog,
  ];
}
