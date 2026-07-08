"use client";

import { useLang } from "@/components/LanguageProvider";
import { site } from "@/lib/site";
import { PhoneIcon, PinIcon } from "@/components/Icons";
import { NavServices } from "@/components/NavServices";

export function Nav() {
  const { lang, t, toggle } = useLang();

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      {/* contact bar */}
      <div className="flex flex-wrap items-center justify-center gap-x-[clamp(14px,2.4vw,28px)] gap-y-1 bg-ink px-5 py-[9px] text-xs tracking-[0.02em] text-[#e7d3cc]">
        <a
          href={site.phoneHref}
          className="inline-flex items-center gap-[7px] font-medium text-cream"
        >
          <PhoneIcon size={13} />
          {t.phone}
        </a>
        <span className="opacity-40">·</span>
        <span className="hidden sm:inline">{t.barHours}</span>
        <span className="hidden opacity-40 sm:inline">·</span>
        <a
          href={site.ig}
          target="_blank"
          rel="noreferrer"
          className="hidden text-[#e7d3cc] sm:inline"
        >
          Instagram
        </a>
        <span className="hidden opacity-40 sm:inline">·</span>
        <span className="hidden items-center gap-[6px] sm:inline-flex">
          <PinIcon size={12} className="text-rose" />
          {t.barLoc}
        </span>
      </div>

      {/* main nav */}
      <nav className="flex items-center justify-between border-b border-ink/[0.06] bg-cream/[0.88] px-[clamp(18px,5vw,56px)] py-[14px] backdrop-blur-[14px]">
        <a
          href="/"
          className="text-[23px] font-semibold tracking-[-0.02em] text-ink"
        >
          stria<span className="text-rose">.</span>
        </a>
        <div className="flex items-center gap-[clamp(11px,2vw,28px)]">
          <NavServices />
          <a href="/galeri" className="text-[13px] text-muted">
            {t.navGallery}
          </a>
          <a href="/hakkimizda" className="hidden text-[13px] text-muted sm:inline">
            {t.navAbout}
          </a>
          <a href="/iletisim" className="hidden text-[13px] text-muted sm:inline">
            {t.navContact}
          </a>
          <a href="/blog" className="hidden text-[13px] text-muted sm:inline">
            {t.navBlog}
          </a>
          <button
            onClick={toggle}
            className="cursor-pointer rounded-[20px] border border-line2 bg-white px-3 py-[7px] text-[11px] tracking-[0.1em] text-muted"
          >
            {lang === "tr" ? "EN" : "TR"}
          </button>
          <a
            href={site.phoneHref}
            className="hidden items-center gap-[7px] rounded-[24px] border border-[#e3c9c1] px-4 py-[10px] text-[12.5px] text-ink sm:inline-flex"
          >
            <PhoneIcon size={13} />
            {t.callLabel}
          </a>
          <a
            href={site.wa}
            target="_blank"
            rel="noreferrer"
            className="rounded-[24px] bg-rose px-5 py-[11px] text-[12.5px] text-white"
          >
            {t.navCta}
          </a>
        </div>
      </nav>
    </div>
  );
}
