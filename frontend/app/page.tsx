import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { ServiceStrip } from "@/components/ServiceStrip";
import { PromoVideo } from "@/components/PromoVideo";
import { Services } from "@/components/Services";
import { Gallery } from "@/components/Gallery";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { HomeFaq } from "@/components/HomeFaq";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { faqSchema } from "@/components/schema";
import { getGallery, getFaqs } from "@/lib/content";

export const revalidate = 300;

export default async function Home() {
  const [gallery, faqs] = await Promise.all([getGallery(), getFaqs()]);

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
        <About />
        <Contact />
        <HomeFaq faqs={faqs} title="Sıkça Sorulan Sorular" />
      </main>
      <Footer />
    </>
  );
}
