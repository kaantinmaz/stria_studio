import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { Nav } from "@/components/Nav";
import { breadcrumbSchema } from "@/components/schema";
import { buildMetadata } from "@/lib/seo";

export const metadata = {
  ...buildMetadata({
    title: "KVKK Aydınlatma Metni | Stria Studio",
    description:
      "Stria Studio tarafından işlenen kişisel veriler, işleme amaçları, hukuki sebepler ve KVKK kapsamındaki haklarınız hakkında bilgi edinin.",
    path: "/kvkk",
  }),
  robots: { index: true, follow: true },
};

const crumbs = [
  { name: "Ana Sayfa", path: "/" },
  { name: "KVKK Aydınlatma Metni", path: "/kvkk" },
];

const sectionClass = "border-t border-line pt-8";
const headingClass = "mb-4 text-[clamp(22px,3vw,30px)] leading-tight";
const textClass = "text-[15px] leading-[1.8] text-muted2";
const listClass = "ml-5 list-disc space-y-2 text-[15px] leading-[1.75] text-muted2";

export default function KvkkPage() {
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
            KVKK Aydınlatma Metni
          </h1>
          <p className="text-[clamp(15px,1.4vw,18px)] leading-[1.7] text-muted">
            Bu metin, Stria Studio ile iletişime geçtiğinizde veya internet
            sitemizi ziyaret ettiğinizde kişisel verilerinizin nasıl işlendiğini
            sade ve açık biçimde anlatmak için hazırlanmıştır.
          </p>
        </header>

        <div className="flex flex-col gap-9">
          <section className={sectionClass}>
            <h2 className={headingClass}>1. Veri sorumlusu</h2>
            <p className={textClass}>
              6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında
              veri sorumlusu, Çankaya/Ankara&apos;da faaliyet gösteren Stria
              Studio&apos;dur. Güncel adres, telefon ve diğer iletişim bilgilerimize{" "}
              <Link href="/iletisim" className="font-medium text-accent underline underline-offset-4 hover:text-accent-dark">
                iletişim sayfamızdan
              </Link>{" "}
              ulaşabilirsiniz.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>2. İşlenen kişisel veriler</h2>
            <ul className={listClass}>
              <li>
                <span className="font-medium text-ink">Kimlik ve iletişim bilgileri:</span>{" "}
                Randevu veya iletişim formunda paylaştığınız ad-soyad ve telefon
                numarası.
              </li>
              <li>
                <span className="font-medium text-ink">Ziyaret bilgileri:</span>{" "}
                IP adresi, ziyaret edilen sayfalar, yönlendiren sayfa ve sitedeki
                gezinmeye ilişkin teknik bilgiler.
              </li>
              <li>
                <span className="font-medium text-ink">Çerez ve tercih bilgileri:</span>{" "}
                Çerezler veya benzer tarayıcı teknolojileri aracılığıyla oluşan
                onay ve site kullanım tercihleri.
              </li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>3. Kişisel verilerin işlenme amaçları</h2>
            <ul className={listClass}>
              <li>Randevu taleplerini almak, planlamak ve sizinle iletişim kurmak,</li>
              <li>Sunulan hizmetlerin kalitesini ve site kullanımını ölçmek,</li>
              <li>İnternet sitesinin güvenliğini, işleyişini ve içeriğini iyileştirmek,</li>
              <li>Mevzuattan doğan yükümlülükleri yerine getirmek.</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>4. Hukuki sebepler</h2>
            <p className={`${textClass} mb-4`}>
              Kişisel verileriniz, KVKK&apos;nın 5. maddesinde yer alan ve somut
              işleme faaliyetine uygun olan aşağıdaki hukuki sebeplere dayanılarak
              işlenir:
            </p>
            <ul className={listClass}>
              <li>Gerekli olduğu durumlarda verdiğiniz açık rıza,</li>
              <li>Bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması,</li>
              <li>
                Temel hak ve özgürlüklerinize zarar vermemek kaydıyla Stria
                Studio&apos;nun meşru menfaatleri,
              </li>
              <li>Hukuki yükümlülüklerin yerine getirilmesi.</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>5. Kişisel verilerin aktarımı</h2>
            <p className={textClass}>
              Kişisel verileriniz satılmaz ve ticari amaçlarla üçüncü kişilerle
              paylaşılmaz. Veriler, yalnızca yasal bir zorunluluğun bulunması
              hâlinde yetkili kamu kurum ve kuruluşlarına; internet sitesinin
              çalışması ve kullanımının ölçülmesi için gerekli olduğu ölçüde ise
              barındırma ve analitik hizmet sağlayıcılarına aktarılabilir. Bu
              teknik paylaşımlar amaçla sınırlı tutulur.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>6. KVKK&apos;nın 11. maddesi kapsamındaki haklarınız</h2>
            <p className={`${textClass} mb-4`}>
              Veri sorumlusuna başvurarak kendinizle ilgili olarak:
            </p>
            <ul className={listClass}>
              <li>Kişisel verinizin işlenip işlenmediğini öğrenme,</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
              <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
              <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
              <li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme,</li>
              <li>Kanundaki şartlar çerçevesinde silinmesini veya yok edilmesini isteme,</li>
              <li>
                Düzeltme, silme veya yok etme işlemlerinin verilerin aktarıldığı
                üçüncü kişilere bildirilmesini isteme,
              </li>
              <li>
                Yalnızca otomatik sistemlerle yapılan analiz sonucunda aleyhinize
                bir sonuç doğmasına itiraz etme,
              </li>
              <li>
                Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın
                giderilmesini talep etme
              </li>
            </ul>
            <p className={`${textClass} mt-4`}>haklarına sahipsiniz.</p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>7. Başvuru</h2>
            <p className={textClass}>
              KVKK kapsamındaki taleplerinizi ve kişisel verilerinizle ilgili
              sorularınızı{" "}
              <Link href="/iletisim" className="font-medium text-accent underline underline-offset-4 hover:text-accent-dark">
                iletişim sayfamızdaki
              </Link>{" "}
              güncel kanallardan Stria Studio&apos;ya iletebilirsiniz.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
