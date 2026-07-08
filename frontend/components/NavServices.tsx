"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import Link from "next/link";
import { useServices } from "@/components/ServicesProvider";
import { pickLang } from "@/lib/content";
import { ImageSlot } from "@/components/ImageSlot";

// Hizmetler mega-menu: full service list + a featured service (Microblading).
export function NavServices() {
  const { lang, t } = useLang();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const services = useServices();
  const featured = services[0]; // Microblading

  if (!featured) return null;

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 text-[13px] text-muted"
      >
        {t.navServices}
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        // top-full + transparent pt bridges the 14px gap so moving the cursor
        // from the button to the card never leaves the hover region (mouseleave).
        <div className="absolute left-1/2 top-full z-50 w-[min(680px,92vw)] -translate-x-1/2 pt-[14px]">
          <div className="overflow-hidden rounded-[22px] border border-line bg-cream shadow-[0_30px_70px_-30px_rgba(66,48,46,0.45)]">
          <div className="grid grid-cols-1 md:grid-cols-[228px_1fr]">
            {/* featured service */}
            <div className="flex flex-col gap-3 border-b border-line bg-pink/60 p-5 md:border-b-0 md:border-r">
              <div className="relative h-28 overflow-hidden rounded-[16px]">
                <ImageSlot
                  src={featured.image ?? ""}
                  alt={pickLang(featured.name_tr, featured.name_en, lang)}
                  sizes="228px"
                />
                <span className="absolute left-2 top-2 rounded-[14px] bg-cream/90 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-accent">
                  {t.featuredLabel}
                </span>
              </div>
              <div>
                <div className="text-[17px] font-medium leading-tight">
                  {pickLang(featured.name_tr, featured.name_en, lang)}
                </div>
                <div className="mt-1 text-[12px] text-muted">
                  {t.featuredHint}
                </div>
              </div>
              <Link
                href={featured.url}
                onClick={() => setOpen(false)}
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-[22px] bg-ink px-4 py-[10px] text-[12.5px] text-cream"
              >
                İncele →
              </Link>
            </div>

            {/* full list */}
            <div className="grid grid-cols-1 gap-1 p-4 sm:grid-cols-2">
              {services.map((s) => (
                <Link
                  key={s.slug}
                  href={s.url}
                  onClick={() => setOpen(false)}
                  className="group flex items-center justify-between gap-2 rounded-[14px] px-3 py-[10px] transition-colors hover:bg-white"
                >
                  <span className="text-[13.5px] text-ink">
                    {pickLang(s.name_tr, s.name_en, lang)}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.1em] text-accent opacity-0 transition-opacity group-hover:opacity-100">
                    {pickLang(s.tag_tr, s.tag_en, lang)}
                  </span>
                </Link>
              ))}
              <Link
                href="/hizmetler"
                onClick={() => setOpen(false)}
                className="col-span-full mt-1 rounded-[14px] px-3 py-[10px] text-[13px] font-medium text-accent hover:bg-white"
              >
                Tüm hizmetler →
              </Link>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
