"use client";

import Image from "next/image";
import { useLang } from "@/components/LanguageProvider";
import { useSettings } from "@/components/SettingsProvider";
import { formatHours, phoneHref, pickLang, type LinkItem } from "@/lib/content";
import {
  CalendarIcon,
  GoogleIcon,
  InstagramIcon,
  LinkIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  TikTokIcon,
  WhatsAppIcon,
  YouTubeIcon,
} from "@/components/Icons";

const ICONS = {
  whatsapp: WhatsAppIcon,
  instagram: InstagramIcon,
  phone: PhoneIcon,
  map: PinIcon,
  calendar: CalendarIcon,
  mail: MailIcon,
  tiktok: TikTokIcon,
  youtube: YouTubeIcon,
  google: GoogleIcon,
  web: LinkIcon,
} as const;

/** Site-internal targets keep the SPA-ish same-tab behaviour; the rest open out. */
function isExternal(url: string): boolean {
  return /^(https?:)?\/\//.test(url) || /^(mailto|tel):/.test(url);
}

export function LinkTree({ links }: { links: LinkItem[] }) {
  const { lang, t, toggle } = useLang();
  const settings = useSettings();

  const social = [
    { href: settings.whatsapp, label: "WhatsApp", Icon: WhatsAppIcon },
    { href: settings.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: phoneHref(settings.phone), label: settings.phone, Icon: PhoneIcon },
  ];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[540px] flex-col items-center px-5 pb-24 pt-12 text-center">
      <a href="/" aria-label="Stria Studio">
        <Image
          src="/Stria_Studio_Logo.svg"
          alt="Stria Studio"
          width={1000}
          height={212}
          priority
          unoptimized
          className="h-9 w-auto sm:h-10"
        />
      </a>

      <h1 className="mt-6 text-[15px] font-normal uppercase tracking-[0.16em] text-ink">
        {lang === "tr"
          ? "Kalıcı Makyaj & Güzellik Stüdyosu"
          : "Permanent Make-up & Beauty Studio"}
      </h1>
      <p className="mt-3 max-w-[380px] text-[13.5px] leading-[1.7] text-muted">
        {lang === "tr"
          ? "Doğal, kişiye özel dokunuşlar. Steril ekipman, ücretsiz ön görüşme ve yüz analizi."
          : "Natural, bespoke results. Sterile equipment, free consultation and face analysis."}
      </p>

      <div className="mt-4 flex flex-col items-center gap-1 text-[12px] text-muted2">
        <span className="inline-flex items-center gap-[6px]">
          <PinIcon size={12} className="text-rose" />
          {settings.address}
        </span>
        <span>{formatHours(settings.hours, lang)}</span>
      </div>

      <div className="mt-6 flex gap-3">
        {social.map(({ href, label, Icon }) => (
          <a
            key={label}
            href={href}
            target={isExternal(href) && !href.startsWith("tel:") ? "_blank" : undefined}
            rel="noreferrer"
            aria-label={label}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line2 text-ink transition-colors hover:border-rose hover:text-rose"
          >
            <Icon size={16} />
          </a>
        ))}
      </div>

      <nav aria-label={lang === "tr" ? "Bağlantılar" : "Links"} className="mt-9 w-full">
        <ul className="flex flex-col gap-3">
          {links.map((l) => {
            const Icon = ICONS[l.icon as keyof typeof ICONS] ?? LinkIcon;
            const label = pickLang(l.label_tr, l.label_en, lang);
            const subtitle = pickLang(l.subtitle_tr, l.subtitle_en, lang);
            const external = isExternal(l.url);
            return (
              <li key={l.url + label}>
                <a
                  href={l.url}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                  className={
                    l.is_featured
                      ? "flex items-center gap-3 rounded-[26px] bg-rose px-5 py-[15px] text-left text-white transition-colors hover:bg-accent-dark"
                      : "flex items-center gap-3 rounded-[26px] border border-line2 bg-white/70 px-5 py-[15px] text-left text-ink transition-colors hover:border-rose hover:bg-blush"
                  }
                >
                  <Icon
                    size={17}
                    className={l.is_featured ? "flex-none text-white" : "flex-none text-rose"}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] leading-[1.4]">{label}</span>
                    {subtitle && (
                      <span
                        className={`block truncate text-[11.5px] leading-[1.5] ${
                          l.is_featured ? "text-white/80" : "text-muted"
                        }`}
                      >
                        {subtitle}
                      </span>
                    )}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-muted2">
        <a href="/" className="hover:text-rose">
          {lang === "tr" ? "Web Sitesi" : "Website"}
        </a>
        <a href="/sss" className="hover:text-rose">
          {t.navFaq}
        </a>
        <a href="/gizlilik-politikasi" className="hover:text-rose">
          {lang === "tr" ? "Gizlilik" : "Privacy"}
        </a>
        <button type="button" onClick={toggle} className="hover:text-rose">
          {lang === "tr" ? "EN" : "TR"}
        </button>
      </div>
    </main>
  );
}
