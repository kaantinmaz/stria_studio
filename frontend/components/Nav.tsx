"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import { useSettings } from "@/components/SettingsProvider";
import { phoneHref, formatHours } from "@/lib/content";
import { PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/Icons";
import { NavServices } from "@/components/NavServices";

export function Nav() {
  const { lang, t, toggle } = useLang();
  const settings = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const links = [
    { href: "/hizmetler", label: t.navServices },
    { href: "/galeri", label: t.navGallery },
    { href: "/hakkimizda", label: t.navAbout },
    { href: "/iletisim", label: t.navContact },
    { href: "/blog", label: t.navBlog },
  ];

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      {/* contact bar */}
      <div className="flex flex-wrap items-center justify-center gap-x-[clamp(14px,2.4vw,28px)] gap-y-1 bg-ink px-5 py-[9px] text-xs tracking-[0.02em] text-[#e7d3cc]">
        <a
          href={phoneHref(settings.phone)}
          className="inline-flex items-center gap-[7px] font-medium text-cream"
        >
          <PhoneIcon size={13} />
          {settings.phone}
        </a>
        <span className="hidden opacity-40 sm:inline">·</span>
        <span className="hidden sm:inline">{formatHours(settings.hours, lang)}</span>
        <span className="hidden opacity-40 sm:inline">·</span>
        <a
          href={settings.instagram}
          target="_blank"
          rel="noreferrer"
          className="hidden text-[#e7d3cc] sm:inline"
        >
          Instagram
        </a>
        <span className="hidden opacity-40 sm:inline">·</span>
        <span className="hidden items-center gap-[6px] sm:inline-flex">
          <PinIcon size={12} className="text-rose" />
          {settings.address}
        </span>
      </div>

      {/* main nav */}
      <nav className="flex items-center justify-between border-b border-ink/[0.06] bg-cream/[0.88] px-[clamp(18px,5vw,56px)] py-[12px] backdrop-blur-[14px]">
        <a href="/" aria-label="Stria Studio" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Stria Studio"
            width={772}
            height={371}
            priority
            className="h-8 w-auto sm:h-9"
          />
        </a>

        {/* desktop nav */}
        <div className="hidden items-center gap-[clamp(11px,2vw,28px)] md:flex">
          <NavServices />
          <a href="/galeri" className="text-[13px] text-muted hover:text-ink">
            {t.navGallery}
          </a>
          <a href="/hakkimizda" className="text-[13px] text-muted hover:text-ink">
            {t.navAbout}
          </a>
          <a href="/iletisim" className="text-[13px] text-muted hover:text-ink">
            {t.navContact}
          </a>
          <a href="/blog" className="text-[13px] text-muted hover:text-ink">
            {t.navBlog}
          </a>
          <button
            onClick={toggle}
            className="cursor-pointer rounded-[20px] border border-line2 bg-white px-3 py-[7px] text-[11px] tracking-[0.1em] text-muted"
          >
            {lang === "tr" ? "EN" : "TR"}
          </button>
          <a
            href={phoneHref(settings.phone)}
            className="hidden items-center gap-[7px] rounded-[24px] border border-[#e3c9c1] px-4 py-[10px] text-[12.5px] text-ink lg:inline-flex"
          >
            <PhoneIcon size={13} />
            {t.callLabel}
          </a>
          <a
            href={settings.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="rounded-[24px] bg-rose px-5 py-[11px] text-[12.5px] text-white"
          >
            {t.navCta}
          </a>
        </div>

        {/* mobile cluster */}
        <div className="flex items-center gap-2 md:hidden">
          <a
            href={settings.whatsapp}
            target="_blank"
            rel="noreferrer"
            aria-label={t.navCta}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-rose text-white"
          >
            <WhatsAppIcon size={17} />
          </a>
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line2 bg-white text-ink"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* mobile menu panel */}
      {menuOpen && (
        <div className="border-b border-line bg-cream px-[clamp(18px,5vw,56px)] pb-5 pt-1 shadow-[0_30px_60px_-40px_rgba(66,48,46,0.5)] md:hidden">
          <nav className="flex flex-col">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between border-b border-line/60 py-[13px] text-[15px] text-ink"
              >
                {l.label}
                <span className="text-accent">→</span>
              </a>
            ))}
          </nav>
          <div className="mt-4 flex items-center gap-3">
            <a
              href={phoneHref(settings.phone)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-[24px] border border-[#e3c9c1] bg-white px-4 py-[12px] text-[13px] text-ink"
            >
              <PhoneIcon size={14} />
              {t.callLabel}
            </a>
            <button
              onClick={() => toggle()}
              className="rounded-[24px] border border-line2 bg-white px-4 py-[12px] text-[12px] tracking-[0.1em] text-muted"
            >
              {lang === "tr" ? "EN" : "TR"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
