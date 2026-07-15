import Link from "next/link";
import { site } from "@/lib/site";
import { phoneHref, formatHours, type Settings } from "@/lib/content";
import { WhatsAppIcon, PhoneIcon, InstagramIcon, MapPinIcon } from "@/components/Icons";

export function Footer({ settings }: { settings: Settings }) {
  const year = 2026;
  return (
    <footer className="mt-24 border-t border-line bg-blush/50">
      <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-[18px] font-medium text-ink">
            Kaş Tasarımı<span className="text-accent"> Ankara</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted2">
            {site.studio} — Ankara Çankaya'da kıl tekniğiyle doğal, kalıcı kaş tasarımı.
            Steril ekipman, yüze özel uygulama.
          </p>
          <div className="mt-4 flex gap-3">
            <a href={settings.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-muted2 hover:text-accent-dark">
              <WhatsAppIcon className="h-5 w-5" />
            </a>
            <a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted2 hover:text-accent-dark">
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a href={phoneHref(settings.phone)} aria-label="Telefon" className="text-muted2 hover:text-accent-dark">
              <PhoneIcon className="h-5 w-5" />
            </a>
          </div>
          <p className="mt-3 text-xs text-muted">
            Bir <a href="https://striastudio.com.tr" target="_blank" rel="noopener" className="hover:text-accent-dark">Stria Studio</a> markasıdır.
          </p>
          <div className="mt-8">
            <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-muted">Stria Studio</p>
            <ul className="space-y-2 text-sm text-muted2">
              <li><a href="https://striastudio.com.tr" target="_blank" rel="noopener" className="hover:text-accent-dark">Stria Studio · Ankara Kalıcı Makyaj</a></li>
              <li><a href="https://microbladingankara.com" target="_blank" rel="noopener" className="hover:text-accent-dark">Mikroblading Ankara</a></li>
            </ul>
          </div>
        </div>

        <div>
          <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-muted">Sayfalar</p>
          <ul className="space-y-2 text-sm text-muted2">
            <li><Link href="/kas-tasarimi-fiyatlari" className="hover:text-accent-dark">Fiyatlar</Link></li>
            <li><Link href="/kas-tasarimi-nasil-yapilir" className="hover:text-accent-dark">Nasıl Yapılır</Link></li>
            <li><Link href="/galeri" className="hover:text-accent-dark">Galeri</Link></li>
            <li><Link href="/blog" className="hover:text-accent-dark">Blog</Link></li>
            <li><Link href="/sss" className="hover:text-accent-dark">Sıkça Sorulan Sorular</Link></li>
            <li><Link href="/hakkimizda" className="hover:text-accent-dark">Hakkımızda</Link></li>
          </ul>
          <p className="mb-3 mt-8 text-[11px] uppercase tracking-[0.18em] text-muted">Yasal</p>
          <ul className="space-y-2 text-sm text-muted2">
            <li><Link href="/kvkk" className="hover:text-accent-dark">KVKK Aydınlatma Metni</Link></li>
            <li><Link href="/cerez-politikasi" className="hover:text-accent-dark">Çerez Politikası</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-muted">İletişim</p>
          <ul className="space-y-2 text-sm text-muted2">
            <li className="flex items-start gap-2">
              <MapPinIcon className="mt-[2px] h-4 w-4 shrink-0" />
              <span>{settings.street_address}, {settings.locality} / {settings.region}</span>
            </li>
            <li>
              <a href={phoneHref(settings.phone)} className="hover:text-accent-dark">{settings.phone_local}</a>
            </li>
            <li>{formatHours(settings.hours)}</li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-muted">Geliştiriciler</p>
          <ul className="space-y-2 text-sm text-muted2">
            <li><Link href="/api-docs" className="hover:text-accent-dark">API Dokümantasyonu</Link></li>
            <li><a href="/openapi.yaml" className="hover:text-accent-dark">openapi.yaml</a></li>
            <li><a href="/llms.txt" className="hover:text-accent-dark">llms.txt</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-6">
          <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-muted">Kaş Tasarımı Rehberi</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted2">
            <li><Link href="/kas-tasarimi-nedir" className="hover:text-accent-dark">Kaş tasarımı nedir</Link></li>
            <li><Link href="/kas-tasarimi-kalici-mi" className="hover:text-accent-dark">Kalıcı mı?</Link></li>
            <li><Link href="/kas-tasarimi-iyilesme-sureci" className="hover:text-accent-dark">İyileşme süreci</Link></li>
            <li><Link href="/kas-tasarimi-bakimi" className="hover:text-accent-dark">Bakım</Link></li>
            <li><Link href="/erkek-kas-tasarimi-ankara" className="hover:text-accent-dark">Erkek kaş tasarımı</Link></li>
            <li><Link href="/seyrek-kaslar-kas-tasarimi" className="hover:text-accent-dark">Seyrek kaşlar</Link></li>
            <li><Link href="/ankarada-kas-tasarimi-yapan-yerler" className="hover:text-accent-dark">Ankara'da yapan yerler</Link></li>
            <li><Link href="/cankaya-kas-tasarimi" className="hover:text-accent-dark">Çankaya</Link></li>
            <li><Link href="/kizilay-kas-tasarimi" className="hover:text-accent-dark">Kızılay</Link></li>
            <li><Link href="/kecioren-kas-tasarimi" className="hover:text-accent-dark">Keçiören</Link></li>
            <li><Link href="/yenimahalle-kas-tasarimi" className="hover:text-accent-dark">Yenimahalle</Link></li>
            <li><Link href="/kas-tasarimi-kimlere-yapilmaz" className="hover:text-accent-dark">Kimlere yapılmaz?</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line px-5 py-5 text-center text-xs leading-relaxed text-muted">
        <p className="mx-auto max-w-[980px]">
          Bu web sitesindeki tüm içerikler yalnızca bilgilendirme amaçlıdır; tıbbi öneri niteliği taşımaz,
          teşhis ve tedavi amacıyla kullanılamaz. Bu site sağlık hizmeti vermemektedir. Uzmana danışılmadan
          yapılan uygulamalardan doğabilecek sonuçlardan Stria Studio sorumlu tutulamaz. Çerezleri veri
          politikamızdaki amaçlarla sınırlı ve mevzuata uygun şekilde kullanıyoruz. Bu siteyi ziyaret eden
          kişi bu uyarıları okumuş ve kabul etmiş sayılır.
        </p>
        <p className="mt-4">
          © {year} {site.studio} · Kaş Tasarımı Ankara · Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
