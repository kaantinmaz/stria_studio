import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/Section";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  ...buildMetadata({
    title: `Çerez Politikası | ${site.brand}`,
    description:
      "Kaş Tasarımı Ankara internet sitesinde kullanılan çerezler, benzer teknolojiler ve bunları yönetme seçenekleri hakkında bilgi.",
    path: "/cerez-politikasi",
  }),
  robots: { index: true, follow: true },
};

export default function CookiePolicyPage() {
  return (
    <>
      <Breadcrumbs
        items={[{ name: "Çerez Politikası", path: "/cerez-politikasi" }]}
      />
      <Section
        as="h1"
        narrow
        eyebrow="Yasal"
        heading="Çerez Politikası"
        intro="Bu politika, internet sitemizde kullanılan çerezleri ve benzer tarayıcı teknolojilerini neden kullandığımızı açıklar."
      >
        <div className="prose mt-10">
          <h2>Çerez nedir?</h2>
          <p>
            Çerezler, bir internet sitesini ziyaret ettiğinizde tarayıcınız
            aracılığıyla cihazınızda saklanabilen küçük metin dosyalarıdır.
            Tercihlerin hatırlanması, sitenin güvenli ve düzgün çalışması ve
            ziyaretlerin anlaşılması gibi amaçlarla kullanılabilir. Çerezlere ek
            olarak localStorage gibi benzer tarayıcı depolama teknolojilerinden
            de yararlanabiliriz.
          </p>

          <h2>Kullandığımız çerez türleri</h2>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Tür</th>
                  <th>Kullanım amacı</th>
                  <th>Örnekler</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Zorunlu</strong></td>
                  <td>
                    Sitenin temel işlevlerini ve ziyaretçi tercihlerini
                    çalıştırır. Bu kayıtlar pazarlama amacıyla kullanılmaz.
                  </td>
                  <td>
                    Çerez onayı ve pop-up tercihi gibi seçimlerin localStorage
                    içinde hatırlanması.
                  </td>
                </tr>
                <tr>
                  <td><strong>Analitik</strong></td>
                  <td>
                    Sayfa ziyaretleri ve site içi etkileşimler hakkında toplu
                    istatistikler oluşturarak siteyi iyileştirmemize yardımcı olur.
                  </td>
                  <td>
                    Birinci taraf ziyaret analitiği; ziyaret edilen sayfa,
                    yönlendiren sayfa ve ziyaret zamanı gibi teknik bilgiler.
                  </td>
                </tr>
                <tr>
                  <td><strong>Üçüncü taraf</strong></td>
                  <td>
                    Pazarlama veya ayrıntılı analiz araçları siteye eklenirse bu
                    sağlayıcılar kendi çerezlerini kullanabilir.
                  </td>
                  <td>
                    Yönetim panelinden etkinleştirilebilen üçüncü taraf analitik
                    veya pazarlama araçları.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            localStorage kayıtları teknik olarak çerez değildir; benzer şekilde
            cihazınızda tercih sakladıkları için bu politika kapsamında birlikte
            açıklanmıştır. Kullanılan teknolojiler, siteye eklenen veya kaldırılan
            hizmetlere göre değişebilir.
          </p>

          <h2>Çerezleri yönetme</h2>
          <p>
            Tarayıcınızın gizlilik veya site verileri ayarlarından çerezleri
            görüntüleyebilir, engelleyebilir ya da silebilirsiniz. Aynı bölümden
            ilgili siteye ait localStorage ve diğer site verilerini de
            temizleyebilirsiniz. Zorunlu çerezlerin veya site verilerinin
            engellenmesi, bazı tercihlerin hatırlanmamasına ya da kimi işlevlerin
            beklendiği gibi çalışmamasına neden olabilir.
          </p>

          <h2>Değişiklikler</h2>
          <p>
            Sitede kullanılan teknolojiler veya yasal gereklilikler değiştiğinde
            bu politika güncellenebilir. Güncel metin her zaman bu sayfada
            yayımlanır.
          </p>

          <h2>Kişisel veriler hakkında</h2>
          <p>
            Kişisel verilerin işlenmesi, hukuki sebepler ve haklarınız hakkında
            ayrıntılı bilgi için <Link href="/kvkk">KVKK Aydınlatma Metni&apos;ni</Link>{" "}
            inceleyebilirsiniz.
          </p>
        </div>
      </Section>
    </>
  );
}
