import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { Nav } from "@/components/Nav";
import { breadcrumbSchema } from "@/components/schema";
import { buildMetadata } from "@/lib/seo";

export const metadata = {
  ...buildMetadata({
    title: "Gizlilik Politikası | Stria Studio",
    description:
      "Stria Studio web sitesi ve mobil uygulaması tarafından toplanan veriler, kullanım amaçları, yapay zekâ işlemesi ve hesabınızı uygulama içinden nasıl silebileceğiniz hakkında bilgi edinin.",
    path: "/gizlilik-politikasi",
  }),
  robots: { index: true, follow: true },
};

const crumbs = [
  { name: "Ana Sayfa", path: "/" },
  { name: "Gizlilik Politikası", path: "/gizlilik-politikasi" },
];

const sectionClass = "border-t border-line pt-8";
const headingClass = "mb-4 text-[clamp(22px,3vw,30px)] leading-tight";
const textClass = "text-[15px] leading-[1.8] text-muted2";
const listClass = "ml-5 list-disc space-y-2 text-[15px] leading-[1.75] text-muted2";
const linkClass =
  "font-medium text-accent underline underline-offset-4 hover:text-accent-dark";

export default function GizlilikPolitikasiPage() {
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
            Gizlilik Politikası (Stria Studio Web Sitesi ve Mobil Uygulaması)
          </h1>
          <p className="text-[clamp(15px,1.4vw,18px)] leading-[1.7] text-muted">
            Bu politika, Stria Studio web sitesini kullandığınızda veya mobil
            uygulamamızda bir hesap oluşturduğunuzda kişisel verilerinizin nasıl
            toplandığını, kullanıldığını ve korunduğunu sade ve açık biçimde
            anlatır.
          </p>
        </header>

        <div className="flex flex-col gap-9">
          <section className={sectionClass}>
            <h2 className={headingClass}>1. Veri sorumlusu</h2>
            <p className={textClass}>
              Kişisel verilerinizden sorumlu veri sorumlusu Stria Studio&apos;dur.
              Güncel adres, telefon ve diğer iletişim bilgilerimize{" "}
              <Link href="/iletisim" className={linkClass}>
                iletişim sayfamızdan
              </Link>{" "}
              ulaşabilirsiniz.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>2. Toplanan veriler</h2>
            <ul className={listClass}>
              <li>
                <span className="font-medium text-ink">Hesap bilgileri:</span> ad
                soyad, e-posta adresi, telefon numarası (isteğe bağlı) ve şifreniz.
                Şifreniz geri döndürülemez biçimde özetlenerek (hash) saklanır;
                açık metin olarak tutulmaz.
              </li>
              <li>
                <span className="font-medium text-ink">Randevu bilgileri:</span>{" "}
                randevu tarihi, seçtiğiniz hizmet ve randevu durumu.
              </li>
              <li>
                <span className="font-medium text-ink">
                  Sadakat ve kampanya kullanımı:
                </span>{" "}
                sadakat programı ilerlemeniz ve yararlandığınız kampanyalara
                ilişkin kayıtlar.
              </li>
              <li>
                <span className="font-medium text-ink">
                  Sohbet asistanı mesajları:
                </span>{" "}
                uygulama içindeki sohbet asistanına gönderdiğiniz mesajlar.
              </li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>3. Kullanım amaçları</h2>
            <ul className={listClass}>
              <li>Randevularınızı almak, planlamak ve yönetmek,</li>
              <li>Sadakat programını yürütmek,</li>
              <li>Size kampanya ve duyuruları göstermek,</li>
              <li>Destek taleplerinizi karşılamak ve sizinle iletişim kurmak.</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>4. Yapay zekâ işlemesi</h2>
            <p className={textClass}>
              Sohbet asistanına gönderdiğiniz mesajlar, size yanıt üretebilmek
              amacıyla bir yapay zekâ hizmet sağlayıcısına (Anthropic) iletilir.
              Sohbet geçmişiniz profilleme veya reklam amacıyla kullanılmaz.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>5. Üçüncü taraflar</h2>
            <p className={textClass}>
              Verileriniz, hizmetin çalışması için gerekli olduğu ölçüde yalnızca
              barındırma sağlayıcımız ve yapay zekâ hizmet sağlayıcımızla
              paylaşılır. Kişisel verileriniz satılmaz, reklam ağlarıyla
              paylaşılmaz ve uygulamamızda üçüncü taraf analitik veya reklam
              yazılım geliştirme kiti (SDK) kullanılmaz.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>6. Saklama ve silme</h2>
            <p className={`${textClass} mb-4`}>
              Hesabınızı dilediğiniz zaman doğrudan uygulama içinden{" "}
              <span className="font-medium text-ink">
                Profil &gt; Hesabımı Sil
              </span>{" "}
              adımını izleyerek kalıcı olarak silebilirsiniz.
            </p>
            <ul className={listClass}>
              <li>
                Hesabınıza ait veriler (ad soyad, e-posta, telefon, oturum
                anahtarları) derhal ve kalıcı olarak silinir.
              </li>
              <li>
                Randevu ve işletme kayıtları, tabi olduğumuz yasal saklama
                süreleri boyunca kimliksizleştirilerek (sizinle ilişkilendirilemez
                biçimde) saklanır.
              </li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>7. Haklarınız</h2>
            <p className={textClass}>
              6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamındaki
              haklarınızın ayrıntılarına ve md. 11 uyarınca sahip olduğunuz
              haklara{" "}
              <Link href="/kvkk" className={linkClass}>
                KVKK Aydınlatma Metni
              </Link>{" "}
              sayfamızdan ulaşabilirsiniz.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>8. İletişim</h2>
            <p className={`${textClass} mb-4`}>
              Gizliliğinizle ilgili sorularınızı ve taleplerinizi{" "}
              <Link href="/iletisim" className={linkClass}>
                iletişim sayfamızdaki
              </Link>{" "}
              güncel kanallardan Stria Studio&apos;ya iletebilirsiniz.
            </p>
            <p className={textClass}>Yürürlük tarihi: 17.07.2026.</p>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
