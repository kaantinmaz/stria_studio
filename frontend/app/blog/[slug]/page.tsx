import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { PostBody } from "@/components/PostBody";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/components/schema";
import { buildMetadata, absUrl } from "@/lib/seo";
import { getPost, getAllPostSlugs } from "@/lib/blog";

export const revalidate = 300;

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
    title: (post.meta_title_tr || post.title_tr) + " · Stria Studio",
    description: post.meta_desc_tr || post.excerpt_tr,
    path: `/blog/${post.slug}`,
    image: post.cover_url ?? undefined,
  });
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title_tr,
    description: post.excerpt_tr,
    url: absUrl(`/blog/${post.slug}`),
    datePublished: post.published_at,
    dateModified: post.updated_at ?? post.published_at,
    image: post.cover_url ?? absUrl("/og"),
    author: { "@id": absUrl("/hakkimizda#nilsu-kamisli") },
    publisher: {
      "@type": "Organization",
      name: "Stria Studio",
      logo: { "@type": "ImageObject", url: absUrl("/logo.png") },
    },
    mainEntityOfPage: absUrl(`/blog/${post.slug}`),
  };

  return (
    <>
      <Nav />
      <JsonLd data={blogPosting} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Ana Sayfa", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title_tr, path: `/blog/${post.slug}` },
        ])}
      />
      <main className="pt-[132px]">
        <PostBody post={post} />
      </main>
      <Footer />
    </>
  );
}
