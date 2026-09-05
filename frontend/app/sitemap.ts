import type { MetadataRoute } from "next";
import { absUrl } from "@/lib/seo";
import { getService, getServiceSlugs } from "@/lib/content";
import { getAllPosts } from "@/lib/blog";
import { ML_VISIBLE_PRODUCTS } from "@/lib/mylamination";

// Sitemap rotası açıkça ISR: fetch seviyesindeki revalidate'e bırakıldığında
// yeni yayımlanan yazı sitemap'e girmiyordu (x-nextjs-cache sürekli HIT).
// Blog rotalarıyla aynı 300 sn penceresi.
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const posts = await getAllPosts();
  const serviceSlugs = await getServiceSlugs();
  const services = await Promise.all(serviceSlugs.map((slug) => getService(slug)));
  const subservices = services.flatMap((svc) => {
    if (!svc) return [];

    return (svc.subservices_tr ?? []).flatMap((sub) =>
      sub.slug
        ? [
            {
              url: absUrl(`/hizmetler/${svc.slug}/${sub.slug}`),
              lastModified: now,
              changeFrequency: "monthly" as const,
              priority: 0.7,
            },
          ]
        : [],
    );
  });
  const blog = [
    { url: absUrl("/blog"), lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 },
    ...posts.map((p) => ({
      url: absUrl(`/blog/${p.slug}`),
      // gerçek içerik tarihi: uydurma lastmod (build zamanı) Google'ın lastmod
      // sinyalini tamamen yok saymasına yol açar.
      lastModified: new Date(p.updated_at ?? p.published_at ?? now),
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
    {
      url: absUrl("/mylamination"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...ML_VISIBLE_PRODUCTS.map((product) => ({
      url: absUrl(`/mylamination/${product.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
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
    ...subservices,
    ...blog,
  ];
}
