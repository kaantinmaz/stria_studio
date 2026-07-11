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

      <div className="border-t border-line px-5 py-5 text-center text-xs text-muted">
        © {year} {site.studio} · Kaş Tasarımı Ankara · Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
