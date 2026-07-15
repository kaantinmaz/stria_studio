import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/Section";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Çerez Politikası | Mikroblading Ankara",
    description:
      "Mikroblading Ankara web sitesinde kullanılan çerezler ve benzeri teknolojiler hakkında bilgi.",
    path: "/cerez-politikasi",
  }),
  robots: { index: true, follow: true },
};

export default function CookiePolicyPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Çerez Politikası", path: "/cerez-politikasi" }]} />
      <Section
        as="h1"
        narrow
        eyebrow="Yasal"
        heading="Çerez Politikası"
        intro="Bu politika, web sitemizde kullanılan çerezleri ve benzeri tarayıcı teknolojilerini nasıl yönetebileceğinizi açıklar."
      >
        <div className="prose mt-8 max-w-none">
          <h2>Çerez nedir?</h2>
          <p>
            Çerezler, ziyaret ettiğiniz internet siteleri tarafından tarayıcınıza kaydedilen
            küçük metin dosyalarıdır. Site tercihlerinizi hatırlamak, temel işlevleri
            çalıştırmak ve sitenin nasıl kullanıldığını anlamak için kullanılabilirler. Bu
            politikada “çerez” ifadesi, aynı amaçlarla kullanılan localStorage gibi tarayıcı
            depolama teknolojilerini de kapsar.
          </p>

          <h2>Kullandığımız çerez türleri</h2>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th scope="col">Tür</th>
                  <th scope="col">Amaç ve örnekler</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Zorunlu</th>
                  <td>
                    Sitenin temel özelliklerinin çalışmasını ve tercihlerin hatırlanmasını
                    sağlar. Çerez onayı ile pop-up görüntüleme tercihlerinin localStorage&apos;da
                    saklanması bu kapsamdadır.
                  </td>
                </tr>
                <tr>
                  <th scope="row">Analitik</th>
                  <td>
                    Ziyaret sayısı, görüntülenen sayfalar ve genel kullanım eğilimleri gibi
                    istatistikleri ölçerek siteyi iyileştirmemize yardımcı olur. Sitede
                    first-party ziyaret analitiği kullanılabilir.
                  </td>
                </tr>
                <tr>
                  <th scope="row">Üçüncü taraf</th>
                  <td>
                    Siteye sonradan analitik veya pazarlama aracı eklenmesi halinde bu
                    hizmetlerin sağlayıcıları tarafından yerleştirilebilir. Bu araçların
                    oluşturduğu çerezler ilgili üçüncü tarafın koşullarına tabidir.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Çerezleri yönetme</h2>
          <p>
            Tarayıcınızın ayarlarından çerezleri görüntüleyebilir, silebilir veya belirli
            siteler için engelleyebilirsiniz. Menü adları tarayıcıya göre değişmekle birlikte
            bu seçenekler genellikle “Gizlilik”, “Güvenlik” ya da “Site ayarları” bölümünde
            bulunur. Zorunlu çerezlerin veya tarayıcı depolamasının engellenmesi, bazı site
            tercihlerinin hatırlanmamasına neden olabilir.
          </p>

          <h2>Değişiklikler</h2>
          <p>
            Kullanılan teknolojilerde veya yasal gerekliliklerde değişiklik olması halinde bu
            politika güncellenebilir. Güncel metin her zaman bu sayfada yayımlanır.
          </p>

          <h2>Kişisel veriler</h2>
          <p>
            Çerezler aracılığıyla işlenebilecek kişisel veriler ve KVKK kapsamındaki
            haklarınız hakkında ayrıntılı bilgi için {" "}
            <Link href="/kvkk">KVKK Aydınlatma Metni&apos;ni</Link> inceleyebilirsiniz.
          </p>
        </div>
      </Section>
    </>
  );
}
