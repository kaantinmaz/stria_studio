import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { Gallery } from "@/components/Gallery";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { faqSchema } from "@/components/schema";
import { HOME_FAQ } from "@/lib/services";

export default function Home() {
  return (
    <>
      <Nav />
      <JsonLd data={faqSchema(HOME_FAQ)} />
      <main>
        <Hero />
        <Services />
        <Gallery />
        <About />
        <Contact />
        <Faq title="Sıkça Sorulan Sorular" items={HOME_FAQ} />
      </main>
      <Footer />
    </>
  );
}
