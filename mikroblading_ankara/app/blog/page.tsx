import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/Section";
import { BlogList } from "@/components/BlogList";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = buildMetadata({
  title: "Mikroblading Blog — Rehberler ve Sık Sorulan Sorular",
  description:
    "Mikroblading hakkında bilmeniz gereken her şey: fiyatlar, kalıcılık, bakım, iyileşme ve daha fazlası. Ankara Stria Studio uzman rehberleri.",
  path: "/blog",
});

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const current = Math.max(1, Number(page) || 1);
  const res = await getPosts(current);
  const { last_page } = res.meta;

  return (
    <>
      <Breadcrumbs items={[{ name: "Blog", path: "/blog" }]} />
      <Section eyebrow="Blog" heading="Mikroblading rehberi"
        intro="Kıl tekniği kaş uygulaması, fiyatlar, bakım ve iyileşme hakkında uzman içerikleri.">
        <BlogList posts={res.data} />

        {last_page > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-3 text-[14px]" aria-label="Sayfalama">
            {current > 1 && (
              <Link href={`/blog?page=${current - 1}`} className="rounded-full border border-line px-4 py-2 text-muted2 hover:text-accent-dark">
                ← Önceki
              </Link>
            )}
            <span className="text-muted">Sayfa {current} / {last_page}</span>
            {current < last_page && (
              <Link href={`/blog?page=${current + 1}`} className="rounded-full border border-line px-4 py-2 text-muted2 hover:text-accent-dark">
                Sonraki →
              </Link>
            )}
          </nav>
        )}
      </Section>
    </>
  );
}
