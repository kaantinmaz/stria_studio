import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { Nav } from "@/components/Nav";
import { breadcrumbSchema } from "@/components/schema";
import { buildMetadata } from "@/lib/seo";

export const metadata = {
  ...buildMetadata({
    title: "Çerez Politikası | Stria Studio",
    description:
      "Stria Studio internet sitesinde kullanılan zorunlu, analitik ve üçüncü taraf çerezleri ile çerez tercihlerinizi nasıl yönetebileceğinizi öğrenin.",
    path: "/cerez-politikasi",
  }),
  robots: { index: true, follow: true },
};

const crumbs = [
  { name: "Ana Sayfa", path: "/" },
  { name: "Çerez Politikası", path: "/cerez-politikasi" },
];

const sectionClass = "border-t border-line pt-8";
const headingClass = "mb-4 text-[clamp(22px,3vw,30px)] leading-tight";
const textClass = "text-[15px] leading-[1.8] text-muted2";

export default function CerezPolitikasiPage() {
  return (
    <>
      <Nav />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <main className="mx-auto max-w-[920px] px-[clamp(18px,5vw,56px)] pb-[clamp(56px,8vw,104px)] pt-8">
        <header className="mb-[clamp(40px,6vw,64px)] max-w-[780px]">
          <div className="mb-4 text-xs uppercase tracking-[0.14em] text-accent">
            Yasal bilgilendirme
          </div>
          <h1 className="mb-5 text-[clamp(30px,4.4vw,56px)] leading-[1.06]">
            Çerez Politikası
          </h1>
          <p className="text-[clamp(15px,1.4vw,18px)] leading-[1.7] text-muted">
            Bu politika, Stria Studio internet sitesinde kullanılan çerezleri ve
            benzer tarayıcı teknolojilerini, bunların amaçlarını ve tercihlerinizi
            nasıl yönetebileceğinizi açıklar.
          </p>
        </header>

        <div className="flex flex-col gap-9">
          <section className={sectionClass}>
            <h2 className={headingClass}>Çerez nedir?</h2>
            <p className={textClass}>
              Çerezler, bir internet sitesini ziyaret ettiğinizde tarayıcınızda
              saklanabilen küçük veri dosyalarıdır. Site tercihlerini hatırlamak,
              temel işlevleri sürdürmek ve ziyaretlerin nasıl gerçekleştiğini
              anlamak için kullanılabilir. Bu politikada çerezlerle birlikte,
              tarayıcının yerel depolama alanı (localStorage) gibi benzer
              teknolojiler de açıklanmaktadır.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>Kullandığımız çerez türleri</h2>
            <div className="overflow-x-auto rounded-[20px] border border-line bg-white">
              <table className="w-full min-w-[660px] border-collapse text-left">
                <thead className="bg-blush/70 text-[12px] uppercase tracking-[0.1em] text-muted">
                  <tr>
                    <th scope="col" className="px-5 py-4 font-medium">Tür</th>
                    <th scope="col" className="px-5 py-4 font-medium">Amaç</th>
                    <th scope="col" className="px-5 py-4 font-medium">Örnek</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-[14px] leading-[1.7] text-muted2">
                  <tr className="align-top">
                    <th scope="row" className="px-5 py-5 font-medium text-ink">Zorunlu</th>
                    <td className="px-5 py-5">
                      Sitenin temel işlevlerinin çalışmasını ve tercihlerin
                      hatırlanmasını sağlar.
                    </td>
                    <td className="px-5 py-5">
                      Çerez onayı ile pop-up görüntüleme tercihinin localStorage
                      alanında saklanması; gerekli oturum bilgileri.
                    </td>
                  </tr>
                  <tr className="align-top">
                    <th scope="row" className="px-5 py-5 font-medium text-ink">Analitik</th>
                    <td className="px-5 py-5">
                      Ziyaret sayılarını, görüntülenen sayfaları ve genel kullanım
                      eğilimlerini ölçerek siteyi iyileştirmemize yardımcı olur.
                    </td>
                    <td className="px-5 py-5">
                      Stria Studio&apos;nun birinci taraf ziyaret istatistikleri ve
                      yapılandırılmışsa analitik araçlarının teknik kayıtları.
                    </td>
                  </tr>
                  <tr className="align-top">
                    <th scope="row" className="px-5 py-5 font-medium text-ink">Üçüncü taraf</th>
                    <td className="px-5 py-5">
                      Siteye sonradan eklenebilecek analitik veya pazarlama
                      araçlarının ölçüm ve kampanya işlevlerini sağlar.
                    </td>
                    <td className="px-5 py-5">
                      Yalnızca ilgili üçüncü taraf araçları siteye eklendiğinde bu
                      sağlayıcılar tarafından kullanılan teknolojiler.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>Çerezleri yönetme</h2>
            <div className={`${textClass} space-y-4`}>
              <p>
                Tarayıcınızın gizlilik veya site ayarları bölümünden çerezleri
                görüntüleyebilir, silebilir ya da belirli siteler için
                engelleyebilirsiniz. localStorage kayıtlarını kaldırmak için de
                tarayıcınızdaki site verilerini temizleyebilirsiniz.
              </p>
              <p>
                Zorunlu teknolojileri engellemeniz hâlinde onay veya pop-up gibi
                tercihleriniz hatırlanmayabilir ve sitenin bazı işlevleri
                beklendiği gibi çalışmayabilir. Çerez bildirimindeki seçiminiz
                tarayıcınızın yerel depolama alanında saklanır.
              </p>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>Değişiklikler</h2>
            <p className={textClass}>
              Sitede kullanılan teknolojiler veya mevzuat değiştiğinde bu politika
              güncellenebilir. Güncel metin her zaman bu sayfada yayımlanır.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>Kişisel verileriniz</h2>
            <p className={textClass}>
              Kişisel verilerinizin işlenmesi ve KVKK kapsamındaki haklarınız
              hakkında ayrıntılı bilgi için{" "}
              <Link href="/kvkk" className="font-medium text-accent underline underline-offset-4 hover:text-accent-dark">
                KVKK Aydınlatma Metni&apos;ni
              </Link>{" "}
              inceleyebilirsiniz.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
