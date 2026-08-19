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
                <span className="font-medium text-ink">Hesap tanımlayıcıları:</span>{" "}
                uygulama kullanıcı kimliğiniz ve müşteri kodunuz; hesabınızı doğru
                kayıtlarla eşleştirmek için kullanılır.
              </li>
              <li>
                <span className="font-medium text-ink">Randevu bilgileri:</span>{" "}
                randevu tarihi, seçtiğiniz hizmet, randevu durumu ve varsa randevuya
                eklediğiniz notlar.
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
              <li>
                <span className="font-medium text-ink">Uygulama kullanım verisi:</span>{" "}
                bildirim listesini en son ne zaman görüntülediğiniz; yalnızca yeni
                içerik rozetini sıfırlamak için tutulur.
              </li>
            </ul>
            <p className={`${textClass} mt-4`}>
              Konum, kişiler, sağlık verisi, ödeme bilgisi, reklam kimliği veya
              cihaz kimliği toplamayız; sizi izlemez, üçüncü taraf analitik ya da
              reklam yazılımı kullanmayız.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>3. Kullanım amaçları</h2>
            <ul className={listClass}>
              <li>Randevularınızı almak, planlamak ve yönetmek,</li>
              <li>Sadakat programını yürütmek,</li>
              <li>Size kampanya ve duyuruları göstermek,</li>
              <li>Destek taleplerinizi karşılamak ve sizinle iletişim kurmak.</li>
            </ul>
            <p className={`${textClass} mt-4`}>
              Verileriniz yalnızca uygulamanın çalışması için işlenir; reklam,
              profilleme veya sizi izleme amacıyla kullanılmaz.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>4. Yapay zekâ sohbeti ve onayınız</h2>
            <p className={`${textClass} mb-4`}>
              Sohbet asistanını ilk kez açtığınızda, hangi verinin nereye ve neden
              gönderileceğini açıklayan bir onay adımı gösterilir. Onay vermeden
              sohbet başlatılmaz.
            </p>
            <ul className={listClass}>
              <li>
                Size yanıt üretebilmek için yazdığınız mesajlar; adınız, müşteri
                kodunuz, son randevularınız ve sadakat özetinizle birlikte bir
                yapay zekâ hizmet sağlayıcısına (Anthropic) iletilir.
              </li>
              <li>
                E-posta adresiniz ve telefon numaranız sohbet için gönderilmez.
              </li>
              <li>
                Sohbet geçmişiniz profilleme veya reklam amacıyla kullanılmaz.
              </li>
              <li>
                Verdiğiniz onayı dilediğiniz zaman{" "}
                <span className="font-medium text-ink">Profil</span> ekranından
                geri çekebilirsiniz; onayı geri çektiğinizde sohbet, yeniden onay
                verene kadar açılmaz.
              </li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>5. Kamera ve QR ile eşleşme</h2>
            <p className={textClass}>
              Stüdyoda gösterilen QR kodunu okutarak mevcut müşteri kaydınızla
              eşleşmek isteğe bağlıdır ve kamera izni gerektirir. Kamera
              görüntüleri veya kareleri sunucuya yüklenmez; QR yalnızca cihazınızda
              çözümlenir. Sunucuya yalnızca okunan eşleştirme kodu gönderilir.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>6. Üçüncü taraflar</h2>
            <p className={textClass}>
              Verileriniz, hizmetin çalışması için gerekli olduğu ölçüde yalnızca
              barındırma sağlayıcımız ve yapay zekâ hizmet sağlayıcımızla
              paylaşılır. Kişisel verileriniz satılmaz, reklam ağlarıyla
              paylaşılmaz ve uygulamamızda üçüncü taraf analitik veya reklam
              yazılım geliştirme kiti (SDK) kullanılmaz.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>
              7. Hesap silme, saklama ve anonimleştirme
            </h2>
            <p className={`${textClass} mb-4`}>
              Hesabınızı dilediğiniz zaman doğrudan uygulama içinden{" "}
              <span className="font-medium text-ink">
                Profil &gt; Hesabımı Sil
              </span>{" "}
              adımını izleyerek silebilirsiniz. Bu işlem tek seferde yapılır ve
              geri alınamaz.
            </p>
            <ul className={listClass}>
              <li>
                Uygulama hesabınız ve tüm oturum anahtarlarınız (giriş token&apos;ları)
                kalıcı olarak silinir; silinen hesapla tekrar giriş yapılamaz.
              </li>
              <li>
                Stüdyodaki müşteri kaydınızdaki kişisel bilgiler anonimleştirilir:
                adınız &quot;Silinmiş Müşteri&quot; olarak değiştirilir; telefon,
                e-posta, Instagram ve not alanları boşaltılır. Size ait randevu
                fotoğrafları ve dosyaları silinir.
              </li>
              <li>
                Geçmiş randevu kayıtları (tarih, hizmet ve tutar bilgisi) işletme
                muhasebesi ve tabi olduğumuz yasal yükümlülükler için tutulmaya
                devam eder; ancak bu kayıtlarda sizi tanımlayan ya da sizinle
                ilişkilendirilebilecek hiçbir alan bırakılmaz.
              </li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>8. Haklarınız</h2>
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
            <h2 className={headingClass}>9. İletişim</h2>
            <p className={`${textClass} mb-4`}>
              Gizliliğinizle ilgili sorularınızı ve taleplerinizi{" "}
              <Link href="/iletisim" className={linkClass}>
                iletişim sayfamızdaki
              </Link>{" "}
              güncel kanallardan Stria Studio&apos;ya iletebilirsiniz.
            </p>
            <p className={textClass}>Yürürlük tarihi: 12.08.2026.</p>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
