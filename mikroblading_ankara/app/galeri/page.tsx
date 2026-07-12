import type { Metadata } from "next";
import { getSettings, getGallery, SETTINGS_FALLBACK } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/Section";
import { Gallery } from "@/components/Gallery";
import { CTABanner } from "@/components/CTA";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = buildMetadata({
  title: "Mikroblading Galeri — Öncesi & Sonrası (Ankara)",
  description:
    "Ankara Stria Studio mikroblading öncesi ve sonrası çalışmaları. Kıl tekniğiyle yapılan doğal kaş tasarımı örneklerini inceleyin.",
  path: "/galeri",
});

export default async function GalleryPage() {
  const [settings, gallery] = await Promise.all([getSettings(), getGallery()]);
  const s = settings ?? SETTINGS_FALLBACK;
  return (
    <>
      <Breadcrumbs items={[{ name: "Galeri", path: "/galeri" }]} />
      <Section as="h1" eyebrow="Galeri" heading="Öncesi & sonrası çalışmalarımız"
        intro="Kıl tekniğiyle yapılan doğal ve yüze özel kaş tasarımlarından örnekler. Her uygulama kişiye özeldir; sonuçlar cilt tipine göre değişebilir.">
        <Gallery items={gallery} />
      </Section>
      <CTABanner settings={s} />
    </>
  );
}
