import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getAllPostSlugs } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/Section";
import { PostBody } from "@/components/PostBody";
import { ImageSlot } from "@/components/ImageSlot";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ArrowIcon } from "@/components/Icons";
import { JsonLd } from "@/components/JsonLd";
import { blogPostingSchema } from "@/lib/schema";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.meta_title_tr || post.title_tr,
    description: post.meta_desc_tr || post.excerpt_tr,
    path: `/blog/${slug}`,
    image: post.cover_url ?? undefined,
  });
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <>
      <JsonLd
        data={blogPostingSchema({
          title: post.title_tr,
          description: post.excerpt_tr,
          path: `/blog/${slug}`,
          datePublished: post.published_at,
          image: post.cover_url,
        })}
      />
      <Breadcrumbs items={[{ name: "Blog", path: "/blog" }, { name: post.title_tr, path: `/blog/${slug}` }]} />

      <article className="py-12">
        <Container className="max-w-[760px]">
          {post.published_at && (
            <p className="text-[12px] uppercase tracking-[0.14em] text-accent">{formatDate(post.published_at)}</p>
          )}
          <h1 className="mt-3 text-[clamp(28px,4vw,40px)] leading-tight text-ink">{post.title_tr}</h1>
          <p className="mt-4 text-[18px] leading-relaxed text-muted2">{post.excerpt_tr}</p>

          <div className="my-8">
            <ImageSlot src={post.cover_url} alt={post.title_tr} ratio="aspect-[16/9]" className="rounded-[24px]" />
          </div>

          <PostBody html={post.body_tr} />

          <div className="mt-12 border-t border-line pt-6">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-[15px] text-accent-dark">
              <ArrowIcon className="h-4 w-4 rotate-180" /> Tüm yazılara dön
            </Link>
          </div>
        </Container>
      </article>
    </>
  );
}
