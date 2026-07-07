import type { MetadataRoute } from "next";
import { absUrl } from "@/lib/seo";
import { SERVICE_SEO } from "@/lib/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: absUrl("/"), lastModified: now, changeFrequency: "monthly", priority: 1 },
    {
      url: absUrl("/hizmetler"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...SERVICE_SEO.map((s) => ({
      url: absUrl(`/hizmetler/${s.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
