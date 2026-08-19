import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { ServiceStrip } from "@/components/ServiceStrip";
import { PromoVideo } from "@/components/PromoVideo";
import { Services } from "@/components/Services";
import { Gallery } from "@/components/Gallery";
import { InstagramFeed } from "@/components/InstagramFeed";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { HomeFaq } from "@/components/HomeFaq";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { faqSchema } from "@/components/schema";
import { getGallery, getFaqs, getInstagramPosts } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Stria Studio · Ankara Çankaya Kalıcı Makyaj Stüdyosu",
  description:
    "Ankara Çankaya'da kalıcı makyaj, microblading ve kaş-kirpik uygulamaları; doğal görünüm, hijyenik süreç ve kişiye özel tasarımla Stria Studio'da.",
  path: "/",
});

export const revalidate = 300;

export default async function Home() {
  const [gallery, faqs, posts] = await Promise.all([
    getGallery(),
    getFaqs(),
    getInstagramPosts(),
  ]);

  return (
    <>
      <Nav />
      <JsonLd data={faqSchema(faqs.map((f) => ({ q: f.q_tr, a: f.a_tr })))} />
      <main>
        <Hero />
        <ServiceStrip />
        <PromoVideo />
        <Services />
        <Gallery items={gallery} />
        <InstagramFeed posts={posts} />
        <About />
        <Contact />
        <HomeFaq faqs={faqs} title="Sıkça Sorulan Sorular" />
      </main>
      <Footer />
    </>
  );
}
