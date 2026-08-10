import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { WhatsAppIcon } from "@/components/Icons";
import { JsonLd } from "@/components/JsonLd";
import { Nav } from "@/components/Nav";
import { breadcrumbSchema, faqSchema, serviceSchema } from "@/components/schema";
import { getSettings, SETTINGS_FALLBACK } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

const path = "/ankara-kalici-makyaj-yapan-yerler";

export const metadata = buildMetadata({
  title: "Ankara Kalıcı Makyaj Yapan Yerler | Stria Studio",
  description:
    "Ankara’da kalıcı makyaj yapan yerleri seçerken uzmanlık, hijyen, portfolyo, ön çizim, fiyat ve rötuş politikasını değerlendirin. Çankaya rehberi.",
  path,
});

const crumbs = [
  { name: "Ana Sayfa", path: "/" },
  { name: "Kalıcı Makyaj Yapan Yerler", path },
];

const faqs = [
  {
    q: "Ankara’da kalıcı makyaj yapan yerler hangi semtlerde yoğun?",
    a: "Kalıcı makyaj stüdyoları Çankaya–Tunalı, Kızılay, Çayyolu–Ümitköy ve Keçiören gibi merkezi ya da ulaşımı güçlü bölgelerde daha sık aranır. Yoğunluk, kalite garantisi değildir; kısa listenizdeki her işletmeyi eğitim, hijyen, iyileşmiş portfolyo ve takip politikasıyla ayrı ayrı değerlendirin.",
  },
  {
    q: "En iyi kalıcı makyaj salonu Ankara’da nasıl bulunur?",
    a: "Tek bir herkese uygun ‘en iyi’ salon yoktur. İhtiyacınız olan işlemde iyileşmiş sonuç gösterebilen, eğitimini belgeleyen, tek kullanımlık ekipman kullanan, ön çizimi onayınıza sunan ve fiyat ile rötuş koşullarını baştan açıklayan stüdyo sizin için daha güvenilir bir seçimdir.",
  },
  {
    q: "Kalıcı makyajı kimler yapabilir, kimler yapmalı?",
    a: "Uygulamayı kalıcı makyaj alanındaki eğitimini belgeleyebilen; cilt, renk teorisi, yüz anatomisi, hijyen ve işlem sonrası bakım konusunda yetkin bir profesyonel yapmalıdır. Uzmanın genel deneyiminin yanında seçtiğiniz işlemdeki portfolyosunu da inceleyin; kaş, göz ve dudak uygulamaları farklı pratik beceriler gerektirir.",
  },
  {
    q: "Çok ucuz kalıcı makyaj yapan yerler güvenilir mi?",
    a: "Düşük fiyat tek başına güvensizlik kanıtı değildir, fakat piyasanın belirgin altındaki bir teklifte pigment, tek kullanımlık sarf, ön çizim, rötuş ve takip kapsamını mutlaka sorun. Açıklanamayan fiyat farkı; deneyim, malzeme veya işlem süresinden taviz verildiğini gösterebilir.",
  },
  {
    q: "Kalıcı makyaj ön görüşmesi neden önemli?",
    a: "Ön görüşme; sağlık geçmişi ve önceki işlemleri konuşmak, beklentiyi gerçekçi bir sonuca çevirmek, uygun tekniği belirlemek ve fiyat ile rötuş kapsamını netleştirmek içindir. Aynı zamanda uygulayıcının iletişimini, portfolyosunu ve çalışma yaklaşımını işlem başlamadan değerlendirmenize imkân verir.",
  },
];

const serviceForSchema = {
  slug: "ankara-kalici-makyaj-yapan-yerler",
  intro_tr:
    "Ankara’da kalıcı makyaj stüdyosu seçerken eğitim, hijyen, portfolyo, pigment, ön çizim, fiyat ve rötuş politikasını değerlendirme rehberi.",
  desc_tr:
    "Ankara’da güvenilir kalıcı makyaj stüdyosu seçimi için semtler, uzmanlık sinyalleri ve kontrol kriterleri.",
};

const sectionClass =
  "border-t border-line py-[clamp(40px,6vw,72px)] first:border-t-0";
const headingClass = "mb-5 text-[clamp(24px,3vw,36px)] leading-tight";
const answerClass = "max-w-[760px] text-[16px] leading-[1.75] text-muted2";
const linkClass =
  "font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent";

export default async function AnkaraKaliciMakyajYapanYerlerPage() {
  const settings = (await getSettings()) ?? SETTINGS_FALLBACK;

  return (
    <>
      <Nav />
      <JsonLd data={serviceSchema(serviceForSchema, "Kalıcı Makyaj Stüdyosu Seçim Rehberi", path)} />
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <main className="mx-auto max-w-[920px] px-[clamp(18px,5vw,56px)] pb-[clamp(32px,5vw,64px)] pt-8">
        <header className="mb-[clamp(28px,5vw,52px)] max-w-[820px]">
          <div className="mb-4 text-xs uppercase tracking-[0.14em] text-accent">
            Ankara Stüdyo Seçim Rehberi
          </div>
          <h1 className="mb-5 text-[clamp(30px,4.4vw,56px)] leading-[1.06]">
            Ankara&apos;da Kalıcı Makyaj Yapan Yerler: Güvenilir Stüdyo Nasıl Seçilir?
          </h1>
          <p className="text-[clamp(16px,1.5vw,19px)] leading-[1.75] text-muted">
            Ankara’da kalıcı makyaj; eğitimli kalıcı makyaj uzmanları tarafından, özellikle
            Çankaya–Tunalı, Kızılay, Çayyolu–Ümitköy ve Keçiören çevresindeki stüdyo ve salonlarda
            yapılır. Seçerken sertifika, iyileşmiş öncesi–sonrası portfolyosu, hijyen, pigment
            bilgisi, ön çizim onayı, açık fiyat ve rötuş politikasına bakın. Stria Studio
            Çankaya’da hizmet verir.
          </p>
          <p className="mt-5 text-[13px] text-muted">Son güncelleme: 15 Temmuz 2026</p>
        </header>

        <section className={sectionClass}>
          <h2 className={headingClass}>Güvenilir bir kalıcı makyaj stüdyosu nasıl seçilir?</h2>
          <p className={answerClass}>
            Güvenilir bir stüdyo, yalnızca güzel görünen yeni işlem fotoğraflarıyla değil;
            eğitimini, çalışma düzenini ve işlem sonrası sorumluluğunu birlikte gösterebilmelidir.
            Karar vermeden önce aşağıdaki yedi başlığı aynı görüşmede sorun, mümkünse belgeleri ve
            iyileşmiş sonuçları görün. Yanıtların netliği, uygulayıcının tekniği kadar çalışma
            disiplinini de ortaya koyar.
          </p>
          <ol className="mt-8 grid gap-4">
            {[
              {
                title: "Sertifika ve eğitim",
                text: "Uygulayıcının kalıcı makyaj eğitimini nereden aldığını, güncel eğitimlerini ve seçtiğiniz teknikteki deneyimini sorun.",
              },
              {
                title: "Öncesi–sonrası portfolyosu",
                text: "Yalnızca işlemden hemen sonraki kareleri değil, farklı ciltlerde iyileşmiş sonuçları ve tutarlı çalışmaları inceleyin.",
              },
              {
                title: "Hijyen ve tek kullanımlık ekipman",
                text: "İğne, kartuş ve diğer sarfların tek kullanımlık olduğunu; paketin işlem öncesinde açıldığını ve yüzeylerin düzenli dezenfekte edildiğini doğrulayın.",
              },
              {
                title: "Pigment kalitesi",
                text: "Kullanılacak pigmentin markasını, içeriğini, son kullanma tarihini ve cilt tonunuza neden uygun görüldüğünü sorabilmelisiniz.",
              },
              {
                title: "Altın oran ölçümü ve ön çizim onayı",
                text: "Tasarım yüz oranlarına göre ölçülmeli; form, kalınlık ve simetri siz aynada görüp açıkça onaylamadan pigment uygulamasına geçilmemelidir.",
              },
              {
                title: "Şeffaf fiyat",
                text: "İlk seans, olası ek işlemler ve dahil olan hizmetler yazılı ya da açık biçimde anlatılmalı; sonradan çıkabilecek ücretler saklanmamalıdır.",
              },
              {
                title: "Rötuş ve kontrol politikası",
                text: "İyileşme sonrası kontrolün ne zaman yapılacağını, rötuşun hangi koşullarda gerektiğini ve fiyata dahil olup olmadığını işlemden önce netleştirin.",
              },
            ].map((item, index) => (
              <li
                key={item.title}
                className="grid grid-cols-[36px_1fr] gap-4 rounded-[18px] border border-line bg-white p-5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm text-cream">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-[17px] leading-[1.4] text-ink">{item.title}</h3>
                  <p className="mt-2 text-[14px] leading-[1.7] text-muted">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Kalıcı makyaj stüdyosunda kırmızı bayraklar nelerdir?</h2>
          <p className={answerClass}>
            Bir stüdyo sizi hızla ödeme yapmaya itiyor, temel güvenlik sorularını geçiştiriyor veya
            sonucu garanti ediyorsa görüşmeyi durdurun. Özellikle piyasanın çok altındaki ücret,
            bir saatten kısa işlem sözü, belgesiz uygulayıcı, steril görünmeyen alan ve çizimi
            onaylatmadan başlama teklifi; birlikte ya da tek başına ciddi uyarı işaretidir.
          </p>
          <ul className="mt-7 grid gap-3 text-[15px] leading-[1.65] text-muted2 sm:grid-cols-2">
            {[
              "Açıklaması yapılmayan aşırı düşük fiyat",
              "İşlemi bir saatten kısa sürede bitirme vaadi",
              "Sertifika veya eğitim belgesi gösterememe",
              "Steril olmayan ortam ya da açıkta bekleyen ekipman",
              "Ön çizim onayı almadan uygulamaya başlama",
            ].map((flag) => (
              <li key={flag} className="rounded-[16px] bg-blush px-5 py-4">
                <span className="mr-2 text-accent">×</span>
                {flag}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[15px] leading-[1.7] text-muted">
            Bu koşulların sık görüldüğü, kaydı ve çalışma standardı belirsiz “merdiven altı”
            uygulamalar; düşük fiyatın ötesinde düzeltme, cilt hasarı ve enfeksiyon riski
            doğurabilir.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Ankara’da kalıcı makyaj yapan yerler hangi semtlerde yoğun?</h2>
          <p className={answerClass}>
            Ankara’da kalıcı makyaj seçenekleri merkezi ve ulaşımı kolay hatlarda yoğunlaşır:
            Çankaya–Tunalı, Kızılay, Çayyolu–Ümitköy ve Keçiören en sık karşılaşılan arama
            bölgeleridir. Semt, tek başına kalite göstergesi değildir; ulaşım kolaylığını seçtikten
            sonra aynı sertifika, hijyen, portfolyo ve takip ölçütlerini her bölgedeki stüdyo için
            yeniden uygulayın.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <article>
              <h3 className="mb-2 text-[19px]">Çankaya ve Tunalı</h3>
              <p className="text-[14px] leading-[1.7] text-muted">
                Merkezi konum ve farklı ulaşım seçenekleri nedeniyle geniş bir stüdyo seçkisi
                bulunur. Stria Studio Çankaya’dadır; kaş odaklı teknik ayrıntılar için{" "}
                <Link href="/hizmetler/microblading" className={linkClass}>
                  microblading hizmet sayfamıza
                </Link>{" "}
                bakabilirsiniz.
              </p>
            </article>
            <article>
              <h3 className="mb-2 text-[19px]">Kızılay</h3>
              <p className="text-[14px] leading-[1.7] text-muted">
                Metro ve otobüs bağlantıları, işlem ve sonraki kontrol ziyaretlerini planlamayı
                kolaylaştırabilir. Randevu öncesi hazırlığı{" "}
                <Link href="/blog/kalici-makyaj-oncesi-hazirlik" className={linkClass}>
                  hazırlık rehberimizde
                </Link>{" "}
                ayrıca anlattık.
              </p>
            </article>
            <article>
              <h3 className="mb-2 text-[19px]">Çayyolu ve Ümitköy</h3>
              <p className="text-[14px] leading-[1.7] text-muted">
                Batı koridorunda yaşayanlar stüdyo seçerken ilk seans kadar kontrol ve rötuş
                ulaşımını da hesaba katmalıdır. Rötuşun ne zaman gerektiğini{" "}
                <Link href="/blog/kalici-makyaj-renk-solmasi-rotus-zamani" className={linkClass}>
                  renk solması ve rötuş zamanı yazımızda
                </Link>{" "}
                inceleyebilirsiniz.
              </p>
            </article>
            <article>
              <h3 className="mb-2 text-[19px]">Keçiören</h3>
              <p className="text-[14px] leading-[1.7] text-muted">
                Kuzey Ankara’dan seçim yaparken trafik süresiyle birlikte iyileşme sonrası olası
                ikinci ziyareti planlamak yararlıdır. Kaş uygulamasına özel seçenekleri{" "}
                <Link href="/hizmetler/kas-tasarimi" className={linkClass}>
                  kaş tasarımı sayfamızda
                </Link>{" "}
                bulabilirsiniz.
              </p>
            </article>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Hangi işlem için hangi uzmanlığa bakmalısınız?</h2>
          <p className={answerClass}>
            Her kalıcı makyaj ve bakım işlemi aynı el becerisini ölçmez. Kaşta kıl yönü ve simetri,
            göz çevresinde çizgi hâkimiyeti, dudakta renk teorisi; pigmentsiz uygulamalarda ise ürün
            ve süre kontrolü öne çıkar. Aşağıdaki tablo, hizmet adından çok hangi somut deneyim
            sinyalini aramanız gerektiğini gösterir.
          </p>
          <div className="mt-8 overflow-x-auto rounded-[20px] border border-line bg-white">
            <table className="w-full min-w-[680px] border-collapse text-left text-[14px] leading-[1.6]">
              <thead className="bg-blush text-ink">
                <tr>
                  <th className="px-5 py-4 font-medium">İşlem</th>
                  <th className="px-5 py-4 font-medium">Aranacak uzmanlık / deneyim sinyali</th>
                  <th className="px-5 py-4 font-medium">İlgili sayfa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-muted2">
                {[
                  ["Microblading", "Farklı ciltlerde iyileşmiş, kıl yönü doğal ve çizgileri dağılmamış kaş sonuçları", "/hizmetler/microblading"],
                  ["Kaş pudralama", "Yağlı ve karma ciltlerde dengeli iyileşmiş, başlangıcı yumuşak gölgeleme örnekleri", "/hizmetler/kas-pudralama"],
                  ["Kalıcı eyeliner", "Farklı göz formlarında simetrik kuyruk ve kontrollü çizgi portfolyosu", "/hizmetler/eyeliner"],
                  ["Dipliner", "Kirpik dibinde taşma yapmadan ince, iki gözde dengeli hat çalışabilme", "/hizmetler/dipliner"],
                  ["Dudak renklendirme", "Renk teorisi, nötralizasyon ve iyileşmiş dudak tonu örnekleri", "/hizmetler/dudak-renklendirme"],
                  ["Kaş laminasyonu", "Kıl yönü analizi, ürün süresi kontrolü ve kaş telini yıpratmadan şekillendirme", "/hizmetler/kas-laminasyon"],
                  ["Kirpik lifting", "Göz çevresini koruyan izolasyon, doğru kalıp ve ürün süresi seçimi", "/hizmetler/kirpik-lifting"],
                ].map(([service, signal, href]) => (
                  <tr key={service}>
                    <td className="px-5 py-4 font-medium text-ink">{service}</td>
                    <td className="px-5 py-4">{signal}</td>
                    <td className="px-5 py-4">
                      <Link href={href} className={linkClass}>
                        Hizmeti incele
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-[15px] leading-[1.7] text-muted">
            Teknik ayrıntıya inmek isterseniz{" "}
            <Link href="/hizmetler/microblading" className={linkClass}>
              microblading
            </Link>{" "}
            ve{" "}
            <Link href="/hizmetler/kas-tasarimi" className={linkClass}>
              kaş tasarımı
            </Link>{" "}
            sayfalarımızı; genel seçenekler için{" "}
            <Link href="/hizmetler" className={linkClass}>
              tüm hizmetlerimizi
            </Link>{" "}
            kullanabilirsiniz.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Kalıcı makyaj fiyatı kaliteyle nasıl ilişkilidir?</h2>
          <p className={answerClass}>
            Fiyat, güvenilirliğin tek kanıtı değildir; ancak belgeli pigment, tek kullanımlık sarf,
            yeterli işlem süresi, kişisel tasarım ve takip hizmetinin gerçek bir maliyeti vardır.
            Çok düşük teklifi otomatik fırsat saymak yerine nelerin dahil olduğunu karşılaştırın;
            güncel kapsamı{" "}
            <Link href="/hizmetler" className={linkClass}>
              hizmetler sayfasından
            </Link>{" "}
            ve{" "}
            <Link href="/blog/kalici-makyaj-fiyatlari-2026-ankara" className={linkClass}>
              kalıcı makyaj fiyatları rehberinden
            </Link>{" "}
            inceleyin.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Stria Studio bu kriterlere göre nasıl?</h2>
          <p className={answerClass}>
            Stria Studio bu ölçütleri Çankaya’daki çalışma düzeninde görünür kılmayı amaçlar:
            kişiye özel değerlendirme, yüz oranlarına göre ön çizim, işlem öncesi onay, hijyenik
            uygulama ve sonrasında kontrol planı. Bununla birlikte uygunluk ve beklenen sonuç
            fotoğraf üzerinden kesinleştirilemez; WhatsApp ön görüşmesinde mevcut durumu, hedefi ve
            gerekli seansları birlikte değerlendiririz.
          </p>
          <div className="mt-8 rounded-[26px] bg-ink px-[clamp(22px,4vw,44px)] py-[clamp(28px,4vw,42px)] text-cream">
            <h3 className="text-[clamp(20px,2.5vw,28px)] text-cream">
              Önce beklentinizi ve mevcut durumu konuşalım
            </h3>
            <p className="mt-3 max-w-[650px] text-[15px] leading-[1.7] text-cream/70">
              Kendimizi herkes için tek “en iyi” seçenek ilan etmiyoruz. Portfolyomuzu, süreç
              yaklaşımımızı ve işlem planını paylaşalım; sizin için doğru eşleşme olup olmadığına
              bilgiyle karar verin.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={settings.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-[26px] bg-[#25D366] px-6 py-3 text-sm text-white transition-opacity hover:opacity-90"
              >
                <WhatsAppIcon size={17} />
                WhatsApp’tan ön görüşme
              </a>
              <Link
                href="/galeri"
                className="inline-flex items-center rounded-[26px] border border-cream/30 px-6 py-3 text-sm text-cream transition-colors hover:bg-cream/10"
              >
                Çalışmaları incele
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Faq
        title="Ankara’da kalıcı makyaj yaptırmadan önce neler soruluyor?"
        intro="Ankara’da stüdyo arayanların kararını en çok semt, uygulayıcı yetkinliği, düşük fiyatın anlamı ve ön görüşmenin kapsamı etkiler. Aşağıdaki kısa yanıtlar bu başlıklarda karşılaştırılabilir bir çerçeve sunar. Sağlık durumu, önceki pigment veya kişisel uygunluk söz konusuysa genel yanıt yerine uygulayıcı ve gerektiğinde hekim değerlendirmesi esas alınmalıdır."
        items={faqs}
      />

      <Footer />
    </>
  );
}
