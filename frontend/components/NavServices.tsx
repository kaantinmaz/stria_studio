"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLang } from "@/components/LanguageProvider";
import Link from "next/link";
import { useServices } from "@/components/ServicesProvider";
import { pickLang } from "@/lib/content";
import { ImageSlot } from "@/components/ImageSlot";

// Altın oran kılavuzları: kaş başı / kemer / kuyruk dikeyleri + burun kanadı → göz → kuyruk çaprazı.
const GUIDES = ["M106 18V140", "M196 18V140", "M246 18V140", "M118 150L250 46"];
const BROW_POINTS: [number, number][] = [[106, 65], [196, 36], [246, 54]];

// Hizmetler mega-menu: full-width panel under the nav bar — featured service,
// full service list and an animated "kişiye özel" card (lg+).
export function NavServices() {
  const { lang, t } = useLang();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  // Panel starts at the nav's bottom edge, so the cursor crosses a gap outside
  // the wrapper; a short close delay keeps the menu open across it.
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

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
  // Owner kararı (2026-10-07): menüde öne çıkan hizmet kaş laminasyon.
  const featured = services.find((s) => s.slug === "kas-laminasyon") ?? services[0];

  if (!featured) return null;

  const close = () => setOpen(false);

  return (
    <div
      ref={wrapRef}
      onMouseEnter={() => {
        clearTimeout(closeTimer.current);
        setOpen(true);
      }}
      onMouseLeave={() => {
        closeTimer.current = setTimeout(close, 150);
      }}
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
        <div className="nm-panel absolute inset-x-0 top-full z-50 border-b border-line bg-cream shadow-[0_30px_60px_-30px_rgba(76,19,19,0.35)]">
          <div className="mx-auto grid max-w-[1280px] grid-cols-[220px_1fr] gap-8 px-[clamp(18px,5vw,56px)] py-8 lg:grid-cols-[240px_1fr_360px]">
            {/* featured service */}
            <div className="nm-col flex flex-col gap-3 rounded-[20px] bg-pink/60 p-4">
              <div className="relative h-36 overflow-hidden rounded-[16px]">
                <ImageSlot
                  src={featured.image ?? ""}
                  alt={pickLang(featured.name_tr, featured.name_en, lang)}
                  sizes="240px"
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
                onClick={close}
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-[22px] bg-ink px-4 py-[10px] text-[12.5px] text-cream"
              >
                İncele →
              </Link>
            </div>

            {/* full list */}
            <div className="nm-col flex flex-col" style={{ animationDelay: "50ms" }}>
              <div className="mb-2 px-3 text-[10px] uppercase tracking-[0.14em] text-accent">
                {t.servicesKicker}
              </div>
              <div className="grid grid-cols-2 gap-1">
                {services.map((s) => (
                  <Link
                    key={s.slug}
                    href={s.url}
                    onClick={close}
                    className="group flex items-center justify-between gap-2 rounded-[14px] px-3 py-[9px] transition-colors hover:bg-white"
                  >
                    <span className="flex flex-col">
                      <span className="text-[14px] text-ink">
                        {pickLang(s.name_tr, s.name_en, lang)}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.1em] text-muted">
                        {pickLang(s.tag_tr, s.tag_en, lang)}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="-translate-x-1 text-accent opacity-0 transition-[opacity,transform] group-hover:translate-x-0 group-hover:opacity-100"
                    >
                      →
                    </span>
                  </Link>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3">
                <Link
                  href="/mylamination"
                  onClick={close}
                  className="flex items-center gap-3 rounded-[14px] bg-white/70 px-3 py-[9px] text-[13px] text-ink hover:bg-white"
                >
                  My Lamination Ürünleri
                  <span className="text-[10px] uppercase tracking-[0.1em] text-accent">
                    Kaş &amp; Kirpik
                  </span>
                </Link>
                <Link
                  href="/hizmetler"
                  onClick={close}
                  className="rounded-[14px] px-3 py-[9px] text-[13px] font-medium text-accent hover:bg-white"
                >
                  Tüm hizmetler →
                </Link>
              </div>
            </div>

            {/* kişiye özel: altın oran ölçümü → şekil → uygulama döngüsü */}
            <div
              className="nm-col relative hidden overflow-hidden rounded-[20px] bg-ink p-5 text-cream lg:block"
              style={{ animationDelay: "100ms" }}
            >
              <div className="text-[10px] uppercase tracking-[0.14em] text-blossom">
                {t.navPersonalKicker}
              </div>
              <div className="mt-1 text-[18px] font-medium leading-tight">
                {t.navPersonalTitle}
              </div>

              <svg viewBox="0 0 320 150" className="mt-3 block w-full" aria-hidden="true" fill="none">
                <defs>
                  <mask id="nm-guide-mask">
                    {GUIDES.map((d) => (
                      <path key={d} d={d} pathLength={1} className="nm-guide" stroke="#fff" strokeWidth="4" />
                    ))}
                  </mask>
                </defs>
                {/* eye */}
                <g stroke="currentColor" strokeOpacity="0.7" strokeWidth="1.4" strokeLinecap="round">
                  <path d="M122 92Q166 62 214 88" />
                  <path d="M122 92Q168 112 214 88" strokeOpacity="0.45" />
                  <circle cx="166" cy="89" r="11" />
                  <circle cx="166" cy="89" r="4" fill="currentColor" fillOpacity="0.7" stroke="none" />
                </g>
                <g className="nm-loop">
                  <g mask="url(#nm-guide-mask)" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.2" strokeDasharray="3 4">
                    {GUIDES.map((d) => (
                      <path key={d} d={d} />
                    ))}
                  </g>
                  <path
                    d="M104 63C130 45 170 35 196 36C214 37 232 44 246 54C226 49 208 47 194 48C168 50 136 59 108 70Z"
                    pathLength={1}
                    className="nm-brow"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                    fill="#e58792"
                  />
                  {BROW_POINTS.map(([cx, cy], i) => (
                    <circle
                      key={cx}
                      cx={cx}
                      cy={cy}
                      r="3.5"
                      fill="#e58792"
                      className="nm-dot"
                      style={{ "--d": `${i * 0.25}s` } as CSSProperties}
                    />
                  ))}
                </g>
              </svg>

              <div className="nm-steps mt-3 grid text-[12.5px]">
                {t.navPersonalSteps.map((step, i) => (
                  <span key={step} style={{ "--i": i } as CSSProperties}>
                    <span className="mr-2 text-blossom">0{i + 1}</span>
                    {step}
                  </span>
                ))}
              </div>
              <div className="mt-2 h-px overflow-hidden bg-cream/15">
                <div className="nm-bar h-full bg-blossom" />
              </div>

              <Link
                href="/iletisim"
                onClick={close}
                className="mt-4 inline-block text-[12.5px] text-blossom hover:underline"
              >
                {t.navPersonalCta}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
