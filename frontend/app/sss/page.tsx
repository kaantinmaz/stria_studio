import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { Nav } from "@/components/Nav";
import { breadcrumbSchema, faqSchema } from "@/components/schema";
import { getFaqs, getService, getServices } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata = buildMetadata({
  title: "Sıkça Sorulan Sorular · Stria Studio Ankara",
  description:
    "Microblading, kalıcı makyaj, kaş ve kirpik uygulamalarının süreci, kalıcılığı, bakımı ve uygunluğu hakkında sık sorulan soruların yanıtlarını keşfedin.",
  path: "/sss",
});

const crumbs = [
  { name: "Ana Sayfa", path: "/" },
  { name: "Sıkça Sorulan Sorular", path: "/sss" },
];

function questionKey(question: string): string {
  return question.trim().toLocaleLowerCase("tr-TR");
}

export default async function SssPage() {
  const [serviceList, generalFaqs] = await Promise.all([getServices(), getFaqs()]);
  const services = (
    await Promise.all(serviceList.map((service) => getService(service.slug)))
  ).filter((service) => service !== null);

  const serviceGroups = services.map((service) => ({
    service,
    faqs: service.faq_tr,
  }));
  const seen = new Set(
    serviceGroups.flatMap((group) => group.faqs.map((faq) => questionKey(faq.q))),
  );
  const distinctGeneralFaqs = generalFaqs
    .map((faq) => ({ q: faq.q_tr, a: faq.a_tr }))
    .filter((faq) => {
      const key = questionKey(faq.q);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  const allFaqs = [
    ...serviceGroups.flatMap((group) => group.faqs),
    ...distinctGeneralFaqs,
  ];

  return (
    <>
      <Nav />
      <JsonLd data={faqSchema(allFaqs)} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <main className="mx-auto max-w-[920px] px-[clamp(18px,5vw,56px)] pb-[clamp(48px,7vw,96px)] pt-8">
        <header className="mb-[clamp(36px,6vw,64px)] max-w-[760px]">
          <div className="mb-4 text-xs uppercase tracking-[0.14em] text-accent">
            S.S.S.
          </div>
          <h1 className="mb-5 text-[clamp(30px,4.4vw,56px)] leading-[1.06]">
            Sıkça sorulan sorular
          </h1>
          <p className="text-[clamp(15px,1.4vw,18px)] leading-[1.7] text-muted">
            Kalıcı makyaj, kaş ve kirpik uygulamalarının kalıcılığı, süreci,
            bakımı ve kimlere uygun olduğu hakkında en çok merak edilenleri
            hizmetlere göre bir araya getirdik.
          </p>
        </header>

        <div className="flex flex-col gap-[clamp(40px,6vw,72px)]">
          {serviceGroups.map(({ service, faqs }) =>
            faqs.length > 0 ? (
              <section key={service.slug}>
                <h2 className="mb-6 text-[clamp(24px,3vw,36px)] leading-tight">
                  {service.name_tr} hakkında neler merak ediliyor?
                </h2>
                <div className="flex flex-col gap-3">
                  {faqs.map((faq) => (
                    <article key={faq.q} className="rounded-[18px] border border-line bg-white px-5 py-5">
                      <h3 className="text-[17px] font-medium leading-[1.4] text-ink">
                        {faq.q}
                      </h3>
                      <p className="mt-3 text-[14px] leading-[1.7] text-muted">{faq.a}</p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null,
          )}

          {distinctGeneralFaqs.length > 0 && (
            <section>
              <h2 className="mb-6 text-[clamp(24px,3vw,36px)] leading-tight">
                Stria Studio hakkında neler merak ediliyor?
              </h2>
              <div className="flex flex-col gap-3">
                {distinctGeneralFaqs.map((faq) => (
                  <article key={faq.q} className="rounded-[18px] border border-line bg-white px-5 py-5">
                    <h3 className="text-[17px] font-medium leading-[1.4] text-ink">{faq.q}</h3>
                    <p className="mt-3 text-[14px] leading-[1.7] text-muted">{faq.a}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
