import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/Section";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "KVKK Aydınlatma Metni | Mikroblading Ankara",
    description:
      "Stria Studio tarafından kişisel verilerin işlenmesine ilişkin KVKK aydınlatma metni.",
    path: "/kvkk",
  }),
  robots: { index: true, follow: true },
};

export default function KvkkPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "KVKK Aydınlatma Metni", path: "/kvkk" }]} />
      <Section
        as="h1"
        narrow
        eyebrow="Yasal"
        heading="KVKK Aydınlatma Metni"
        intro="Bu metin, kişisel verilerinizin hangi kapsamda ve amaçlarla işlendiğini sade bir dille açıklamak için hazırlanmıştır."
      >
        <div className="prose mt-8 max-w-none">
          <h2>Veri sorumlusu</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri
            sorumlusu, Çankaya / Ankara&apos;da faaliyet gösteren Stria Studio&apos;dur.
            Güncel adres, telefon ve diğer iletişim bilgilerimize {" "}
            <Link href="/iletisim">iletişim sayfamızdan</Link> ulaşabilirsiniz.
          </p>

          <h2>İşlenen kişisel veriler</h2>
          <p>Web sitemizi kullanmanız sırasında aşağıdaki veriler işlenebilir:</p>
          <ul>
            <li>
              Randevu ve iletişim formu aracılığıyla paylaştığınız ad-soyad ve
              telefon numarası,
            </li>
            <li>
              Ziyaret analitiği kapsamında IP adresi, ziyaret zamanı, görüntülenen
              sayfalar ve benzeri gezinme bilgileri,
            </li>
            <li>
              Çerezler ve benzeri tarayıcı depolama teknolojileri üzerinden oluşan
              tercih ve kullanım bilgileri.
            </li>
          </ul>

          <h2>Kişisel verilerin işlenme amaçları</h2>
          <p>Kişisel verileriniz şu amaçlarla sınırlı olarak işlenir:</p>
          <ul>
            <li>Randevu talebinizi almak, sizinle iletişim kurmak ve talebinizi sonuçlandırmak,</li>
            <li>Hizmet kalitesini ve web sitesi kullanımını ölçmek,</li>
            <li>Web sitesinin güvenliğini, performansını ve kullanıcı deneyimini iyileştirmek,</li>
            <li>Mevzuattan doğan yükümlülükleri yerine getirmek.</li>
          </ul>

          <h2>Hukuki sebepler</h2>
          <p>
            Verileriniz KVKK&apos;nın 5. maddesinde belirtilen hukuki sebeplere dayanılarak;
            talep ettiğiniz hizmete ilişkin sözleşmenin kurulması veya ifası için gerekli
            olması, temel hak ve özgürlüklerinize zarar vermemek kaydıyla Stria Studio&apos;nun
            meşru menfaati ve diğer işleme şartlarının bulunmadığı durumlarda açık rızanız
            kapsamında işlenir.
          </p>

          <h2>Kişisel verilerin aktarılması</h2>
          <p>
            Kişisel verileriniz, yasal zorunluluk halleri dışında üçüncü kişilerle
            paylaşılmaz. Web sitesinin çalıştırılması ve kullanımının ölçülmesi için
            barındırma ve analitik hizmet sağlayıcılarıyla, yalnızca hizmetin gerektirdiği
            ölçüde sınırlı teknik paylaşım yapılabilir. Yetkili kamu kurumları veya adli
            merciler tarafından usulüne uygun bir talepte bulunulması halinde veriler,
            yasal yükümlülüğün kapsamıyla sınırlı olarak aktarılabilir.
          </p>

          <h2>KVKK&apos;nın 11. maddesi kapsamındaki haklarınız</h2>
          <p>Stria Studio&apos;ya başvurarak kişisel verilerinizle ilgili olarak:</p>
          <ul>
            <li>İşlenip işlenmediğini öğrenme,</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
            <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
            <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
            <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
            <li>KVKK&apos;da öngörülen şartlar kapsamında silinmesini veya yok edilmesini isteme,</li>
            <li>
              Düzeltme, silme veya yok etme işlemlerinin verilerin aktarıldığı üçüncü
              kişilere bildirilmesini isteme,
            </li>
            <li>
              Verilerin yalnızca otomatik sistemlerle analiz edilmesi sonucunda aleyhinize
              bir sonucun ortaya çıkmasına itiraz etme,
            </li>
            <li>
              Kanuna aykırı işleme nedeniyle zarara uğramanız halinde zararın giderilmesini
              talep etme
            </li>
          </ul>
          <p>haklarına sahipsiniz.</p>

          <h2>Başvuru</h2>
          <p>
            KVKK kapsamındaki taleplerinizi kimliğinizi ve talebinizi açıklayan bir mesajla {" "}
            <Link href="/iletisim">iletişim sayfamızdaki</Link> kanallar üzerinden Stria
            Studio&apos;ya iletebilirsiniz. Başvurunuz, niteliğine göre yasal süre içinde
            değerlendirilerek yanıtlanır.
          </p>
        </div>
      </Section>
    </>
  );
}
