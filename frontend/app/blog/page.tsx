import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { BlogList } from "@/components/BlogList";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/components/schema";
import { buildMetadata } from "@/lib/seo";
import { getPosts, getCategories } from "@/lib/blog";

export const revalidate = 300;

export const metadata = buildMetadata({
  title: "Blog · Stria Studio · Ankara",
  description:
    "Kalıcı makyaj, microblading ve bakım üzerine Stria Studio blogu — Ankara Çankaya.",
  path: "/blog",
});

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);

  return (
    <>
      <Nav />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Ana Sayfa", path: "/" },
          { name: "Blog", path: "/blog" },
        ])}
      />
      <main className="pt-[132px]">
        <header className="px-[clamp(18px,5vw,56px)] pb-8 pt-[clamp(24px,4vw,48px)]">
          <div className="mx-auto max-w-[1160px]">
            <h1 className="text-[clamp(32px,4.6vw,58px)] leading-[1.05]">Blog</h1>
          </div>
        </header>
        <BlogList initial={posts.data} categories={categories} />
      </main>
      <Footer />
    </>
  );
}
