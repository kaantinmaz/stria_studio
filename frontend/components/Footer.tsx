"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { site } from "@/lib/site";
import { SERVICES } from "@/lib/i18n";
import { PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/Icons";

const heading = "mb-4 text-[13px] font-medium uppercase tracking-[0.14em] text-cream";
const link = "text-[13px] leading-none text-[#d6c3bd] transition-colors hover:text-cream";

export function Footer() {
  const { lang, t } = useLang();

  const explore = [
    { href: "/hizmetler", label: t.navServices },
    { href: "/galeri", label: t.navGallery },
    { href: "/hakkimizda", label: t.navAbout },
    { href: "/iletisim", label: t.navContact },
  ];

  return (
    <footer className="bg-ink px-[clamp(18px,5vw,56px)] pb-10 pt-[clamp(52px,7vw,88px)] text-[#d6c3bd]">
      <div className="mx-auto grid max-w-[1160px] grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
        {/* brand + social */}
        <div>
          <div className="mb-3 text-[26px] font-semibold tracking-[-0.02em] text-cream">
            stria<span className="text-rose">.</span>
          </div>
          <p className="mb-6 max-w-[280px] text-[13px] leading-[1.6]">
            {t.footerTag}
          </p>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[#9a857e]">
            {t.footerFollow}
          </div>
          <div className="mt-3 flex gap-3">
            <a
              href={site.ig}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/20 text-[#d6c3bd] transition-colors hover:border-cream hover:text-cream"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.37 1.06.42 2.23.06 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.05 1.17-.25 1.8-.42 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.17-1.06.37-2.23.42-1.27.06-1.65.07-4.85.07s-3.58 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.42a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.17-.42-.37-1.06-.42-2.23C2.21 15.58 2.2 15.2 2.2 12s0-3.58.07-4.85c.05-1.17.25-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.17 1.06-.37 2.23-.42C8.42 2.21 8.8 2.2 12 2.2Zm0 1.8c-3.15 0-3.5 0-4.74.07-.9.04-1.38.19-1.7.31-.43.17-.74.37-1.06.69-.32.32-.52.63-.69 1.06-.12.32-.27.8-.31 1.7C3.24 8.5 3.2 8.85 3.2 12s0 3.5.07 4.74c.04.9.19 1.38.31 1.7.17.43.37.74.69 1.06.32.32.63.52 1.06.69.32.12.8.27 1.7.31 1.24.07 1.59.07 4.74.07s3.5 0 4.74-.07c.9-.04 1.38-.19 1.7-.31.43-.17.74-.37 1.06-.69.32-.32.52-.63.69-1.06.12-.32.27-.8.31-1.7.07-1.24.07-1.59.07-4.74s0-3.5-.07-4.74c-.04-.9-.19-1.38-.31-1.7a2.85 2.85 0 0 0-.69-1.06 2.85 2.85 0 0 0-1.06-.69c-.32-.12-.8-.27-1.7-.31C15.5 4 15.15 4 12 4Zm0 3.06A4.94 4.94 0 1 1 12 16.94 4.94 4.94 0 0 1 12 7.06Zm0 1.8A3.14 3.14 0 1 0 12 15.14 3.14 3.14 0 0 0 12 8.86Zm5.14-3.19a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z" />
              </svg>
            </a>
            <a
              href={site.wa}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/20 text-[#d6c3bd] transition-colors hover:border-cream hover:text-cream"
            >
              <WhatsAppIcon size={16} />
            </a>
          </div>
        </div>

        {/* services */}
        <div>
          <Link href="/hizmetler" className={`${heading} block hover:text-cream`}>
            {t.navServices}
          </Link>
          <ul className="flex flex-col gap-[14px]">
            {SERVICES.map((s) => (
              <li key={s.id}>
                <Link href={`/hizmetler/${s.slug}`} className={link}>
                  {s.name[lang]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* explore */}
        <div>
          <div className={heading}>{t.footerExplore}</div>
          <ul className="flex flex-col gap-[14px]">
            {explore.map((e) => (
              <li key={e.href}>
                <Link href={e.href} className={link}>
                  {e.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* contact */}
        <div>
          <div className={heading}>{t.navContact}</div>
          <ul className="flex flex-col gap-[14px]">
            <li className="flex items-start gap-[10px] text-[13px] leading-[1.5]">
              <PinIcon size={14} className="mt-[2px] flex-none text-rose" />
              {site.address}
            </li>
            <li>
              <a href={site.phoneHref} className={`flex items-center gap-[10px] ${link}`}>
                <PhoneIcon size={14} className="flex-none text-rose" />
                {t.phone}
              </a>
            </li>
            <li>
              <a href={site.ig} target="_blank" rel="noreferrer" className={link}>
                {site.igHandle}
              </a>
            </li>
            <li className="text-[13px] leading-[1.5]">{t.barHours}</li>
          </ul>
          <a
            href={site.wa}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-[24px] bg-rose px-5 py-[11px] text-[12.5px] text-white"
          >
            <WhatsAppIcon size={15} />
            {t.navCta}
          </a>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-[1160px] flex-col gap-2 border-t border-cream/[0.14] pt-6 text-[11px] tracking-[0.06em] text-[#9a857e] sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 Stria Studio · {t.footerRights}</span>
        <span>Çankaya, Ankara</span>
      </div>
    </footer>
  );
}
