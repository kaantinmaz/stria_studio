import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/Section";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  ...buildMetadata({
    title: `KVKK Aydınlatma Metni | ${site.brand}`,
    description:
      "Stria Studio tarafından kişisel verilerin hangi amaçlarla ve hukuki sebeplerle işlendiğine ilişkin KVKK aydınlatma metni.",
    path: "/kvkk",
  }),
  robots: { index: true, follow: true },
};

export default function KvkkPage() {
  return (
    <>
      <Breadcrumbs
        items={[{ name: "KVKK Aydınlatma Metni", path: "/kvkk" }]}
      />
      <Section
        as="h1"
        narrow
        eyebrow="Yasal"
        heading="KVKK Aydınlatma Metni"
        intro="Kişisel verilerinizi hangi kapsamda ve amaçlarla işlediğimizi, verilerin korunmasına ilişkin haklarınızı sade ve açık bir dille açıklıyoruz."
      >
        <div className="prose mt-10">
          <h2>Veri sorumlusu</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK)
            kapsamında veri sorumlusu, Çankaya/Ankara&apos;da faaliyet gösteren
            Stria Studio&apos;dur. Güncel adres ve iletişim kanallarımıza{" "}
            <Link href="/iletisim">iletişim sayfamızdan</Link> ulaşabilirsiniz.
          </p>

          <h2>İşlenen kişisel veriler</h2>
          <p>
            İnternet sitemizi kullanırken aşağıdaki kişisel verileriniz
            işlenebilir:
          </p>
          <ul>
            <li>
              Randevu veya iletişim formunda paylaştığınız ad-soyad ve telefon
              numarası,
            </li>
            <li>
              Ziyaret analitiği kapsamında IP adresi, ziyaret edilen sayfalar,
              ziyaret zamanı ve yönlendiren sayfa gibi gezinme bilgileri,
            </li>
            <li>
              Çerezler ve benzer tarayıcı teknolojileri aracılığıyla oluşan
              tercih ve kullanım bilgileri.
            </li>
          </ul>

          <h2>Kişisel verilerin işlenme amaçları</h2>
          <p>Kişisel verileriniz şu amaçlarla sınırlı olarak işlenir:</p>
          <ul>
            <li>Randevu talebinizi almak, planlamak ve sizinle iletişim kurmak,</li>
            <li>Hizmet ve site kullanım kalitesini ölçmek,</li>
            <li>İnternet sitesinin işleyişini, güvenliğini ve içeriğini iyileştirmek,</li>
            <li>İlgili mevzuattan doğan yasal yükümlülükleri yerine getirmek.</li>
          </ul>

          <h2>Hukuki sebepler</h2>
          <p>
            Verileriniz, işleme faaliyetinin niteliğine göre KVKK&apos;nın 5.
            maddesinde yer alan açık rızanızın bulunması, bir sözleşmenin
            kurulması veya ifası için işlemenin gerekli olması ve temel hak ve
            özgürlüklerinize zarar vermemek kaydıyla veri sorumlusunun meşru
            menfaati hukuki sebeplerine dayanılarak işlenir. Mevzuatın zorunlu
            kıldığı durumlarda, kanunlarda açıkça öngörülme ve hukuki
            yükümlülüğün yerine getirilmesi sebepleri de uygulanabilir.
          </p>

          <h2>Kişisel verilerin aktarılması</h2>
          <p>
            Kişisel verileriniz, yasal zorunluluk bulunan durumlar dışında
            üçüncü kişilere aktarılmaz. İnternet sitesinin barındırılması,
            güvenliğinin sağlanması ve kullanımının ölçülmesi için barındırma
            veya analitik hizmet sağlayıcılarıyla, yalnızca hizmetin sunulması
            için gerekli ölçüde sınırlı teknik paylaşım yapılabilir. Kanunen
            yetkili kamu kurum ve kuruluşlarının usulüne uygun talepleri saklıdır.
          </p>

          <h2>KVKK&apos;nın 11. maddesi kapsamındaki haklarınız</h2>
          <p>Stria Studio&apos;ya başvurarak kişisel verilerinizle ilgili olarak:</p>
          <ul>
            <li>İşlenip işlenmediğini öğrenme,</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
            <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
            <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
            <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
            <li>
              KVKK&apos;da öngörülen şartlar çerçevesinde silinmesini veya yok
              edilmesini isteme,
            </li>
            <li>
              Düzeltme, silme veya yok etme işlemlerinin verilerin aktarıldığı
              üçüncü kişilere bildirilmesini isteme,
            </li>
            <li>
              Verilerin yalnızca otomatik sistemler aracılığıyla analiz edilmesi
              sonucunda aleyhinize bir sonucun ortaya çıkmasına itiraz etme,
            </li>
            <li>
              Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın
              giderilmesini talep etme
            </li>
          </ul>
          <p>haklarına sahipsiniz.</p>

          <h2>Başvuru</h2>
          <p>
            KVKK kapsamındaki taleplerinizi, kimliğinizi ve talebinizi açıkça
            belirterek <Link href="/iletisim">iletişim sayfamızdaki</Link> güncel
            kanallar üzerinden Stria Studio&apos;ya iletebilirsiniz. Başvurunuz,
            niteliğine göre yasal süre içinde ve kural olarak ücretsiz olarak
            sonuçlandırılır.
          </p>
        </div>
      </Section>
    </>
  );
}
