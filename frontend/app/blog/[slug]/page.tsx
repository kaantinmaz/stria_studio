import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { PostBody } from "@/components/PostBody";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/components/schema";
import { buildMetadata, absUrl } from "@/lib/seo";
import { getPost, getAllPosts, getCategories, extractFaq, relatedServiceSlugs } from "@/lib/blog";
import { getServices } from "@/lib/content";

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
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
  const [post, allPosts, categories, allServices] = await Promise.all([
    getPost(slug),
    getAllPosts(),
    getCategories(),
    getServices(),
  ]);
  if (!post) notFound();

  const others = allPosts.filter((p) => p.slug !== slug);
  const recent = others.slice(0, 5);
  const related = post.category
    ? others.filter((p) => p.category?.slug === post.category?.slug).slice(0, 2)
    : [];
  const counts: Record<string, number> = {};
  for (const p of allPosts) {
    if (p.category) counts[p.category.slug] = (counts[p.category.slug] ?? 0) + 1;
  }
  // API yeniden eskiye sıralar: listede bir sonraki kayıt daha eski yazıdır.
  const i = allPosts.findIndex((p) => p.slug === slug);
  const prev = i >= 0 ? (allPosts[i + 1] ?? null) : null;
  const next = i > 0 ? allPosts[i - 1] : null;
  const wantedSlugs = relatedServiceSlugs(post, allServices);
  const services = wantedSlugs
    .map((s) => allServices.find((service) => service.slug === s))
    .filter((service) => service !== undefined);

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

  // Yazıların "Sık Sorulan Sorular" bölümü hizmet sayfalarındaki gibi FAQPage'e
  // dönüşür; bölümü olmayan yazıda şema hiç basılmaz.
  const faq = extractFaq(post.body_tr);

  return (
    <>
      <Nav />
      <JsonLd data={blogPosting} />
      {faq.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "@id": absUrl(`/blog/${post.slug}#faq`),
            mainEntity: faq.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }}
        />
      )}
      <JsonLd
        data={breadcrumbSchema([
          { name: "Ana Sayfa", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title_tr, path: `/blog/${post.slug}` },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Ana Sayfa", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title_tr, path: `/blog/${post.slug}` },
        ]}
      />
      <main>
        <PostBody
          post={post}
          related={related}
          prev={prev}
          next={next}
          categories={categories}
          counts={counts}
          recent={recent}
          services={services}
        />
      </main>
      <Footer />
    </>
  );
}
