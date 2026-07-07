import type { Metadata } from "next";
import { site } from "@/lib/site";

/** Absolute URL from a site-relative path, based on site.siteUrl. */
export function absUrl(path: string): string {
  return new URL(path, site.siteUrl).toString();
}

/** Per-page metadata: title, description, self-canonical, OpenGraph, Twitter. */
export function buildMetadata(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const url = absUrl(opts.path);
  return {
    // absolute: bypass the layout's "%s · Stria Studio" template so titles that
    // already carry branding don't double up.
    title: { absolute: opts.title },
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: "Stria Studio",
      locale: "tr_TR",
      type: "website",
      images: [{ url: absUrl(opts.image ?? "/images/hero.png") }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
    },
  };
}
