"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import { useSettings } from "@/components/SettingsProvider";
import { phoneHref, formatHours, pickLang } from "@/lib/content";
import { InstagramIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/Icons";
import { NavServices } from "@/components/NavServices";
import { ML_BRAND, ML_EXPERT } from "@/lib/mylamination";

export function Nav() {
  const { lang, t, toggle } = useLang();
  const settings = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);

  // Campaign bar. Admin toggles it (campaign_enabled); a visitor can dismiss it,
  // which we remember per-message so a new campaign shows again.
  const promoText = pickLang(
    settings.campaign_text_tr,
    settings.campaign_text_en,
    lang,
  );
  const promoActive = settings.campaign_enabled && !!promoText;
  const [promoOpen, setPromoOpen] = useState(true);
  const promoRef = useRef<HTMLDivElement>(null);
  const showPromo = promoActive && promoOpen;

  // Close the mobile menu on Escape; lock page scroll while it is open.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [menuOpen]);

  // Hide if this exact message was already dismissed (runs client-side only,
  // so first paint matches SSR and there's no hydration mismatch).
  useEffect(() => {
    if (!promoActive) return;
    if (localStorage.getItem("promo_dismissed") === settings.campaign_text_tr) {
      setPromoOpen(false);
    }
  }, [promoActive, settings.campaign_text_tr]);

  // Push page content down by the bar's real height (see globals.css --promo-h).
  useEffect(() => {
    const h = showPromo && promoRef.current ? promoRef.current.offsetHeight : 0;
    document.documentElement.style.setProperty("--promo-h", `${h}px`);
    return () => document.documentElement.style.setProperty("--promo-h", "0px");
  }, [showPromo, promoText]);

  const dismissPromo = () => {
    localStorage.setItem("promo_dismissed", settings.campaign_text_tr);
    setPromoOpen(false);
  };

  const links = [
    { href: "/hizmetler", label: t.navServices },
    { href: "/mylamination", label: "My Lamination Ürünleri" },
    { href: "/galeri", label: t.navGallery },
    { href: "/hakkimizda", label: t.navAbout },
    { href: "/iletisim", label: t.navContact },
    { href: "/blog", label: t.navBlog },
    { href: "/sss", label: t.navFaq },
  ];

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      {/* campaign bar */}
      {showPromo && (
        <div
          ref={promoRef}
          className="relative flex items-center justify-center bg-blossom px-11 py-[9px] text-center text-xs font-medium tracking-[0.02em] text-ink"
        >
          <span>{promoText}</span>
          <button
            type="button"
            aria-label={lang === "tr" ? "Kapat" : "Close"}
            onClick={dismissPromo}
            className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-ink/70 hover:bg-ink/10 hover:text-ink"
          >
            ✕
          </button>
        </div>
      )}

      {/* contact bar */}
      <div className="hidden flex-wrap items-center justify-center gap-x-[clamp(14px,2.4vw,28px)] gap-y-1 bg-ink px-5 py-[9px] text-xs tracking-[0.02em] text-[#eed6d7] md:flex">
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
          className="inline-flex items-center gap-[7px] text-[#eed6d7]"
        >
          <InstagramIcon size={13} />
          Instagram
        </a>
        <span className="hidden opacity-40 sm:inline">·</span>
        <span className="hidden items-center gap-[6px] sm:inline-flex">
          <PinIcon size={12} className="text-blossom" />
          {settings.address}
        </span>
      </div>

      {/* main nav */}
      <nav className="flex items-center justify-between border-b border-ink/[0.06] bg-cream/[0.88] px-[clamp(18px,5vw,56px)] py-[12px] backdrop-blur-[14px]">
        <a href="/" aria-label="Stria Studio" className="flex items-center">
          <Image
            src="/Stria_Studio_Logo.svg"
            alt="Stria Studio"
            width={1000}
            height={212}
            priority
            // SVG'ler optimizer'dan geçmez (dangerouslyAllowSVG kapalı) — doğrudan servis edilir.
            unoptimized
            className="h-6 w-auto sm:h-7"
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
          <a href="/sss" className="text-[13px] text-muted hover:text-ink">
            {t.navFaq}
          </a>
          <button
            onClick={toggle}
            className="cursor-pointer rounded-[20px] border border-line2 bg-white px-3 py-[7px] text-[11px] tracking-[0.1em] text-muted"
          >
            {lang === "tr" ? "EN" : "TR"}
          </button>
          <a
            href={phoneHref(settings.phone)}
            className="hidden items-center gap-[7px] rounded-[24px] border border-[#eed9d9] px-4 py-[10px] text-[12.5px] text-ink lg:inline-flex"
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
          {/* Telefon numarası doğrudan görünür; dokununca arar. */}
          <a
            href={phoneHref(settings.phone)}
            aria-label={`${t.callLabel}: ${settings.phone}`}
            className="inline-flex h-10 items-center gap-[6px] whitespace-nowrap rounded-full border border-line2 bg-white px-3 text-[13px] font-medium tracking-[0.01em] text-ink"
          >
            <PhoneIcon size={13} />
            {settings.phone_local || settings.phone}
          </a>
          {/* Dar ekranda (<400px) WhatsApp ikonu gizlenir; alt çubukta zaten var. */}
          <a
            href={settings.whatsapp}
            target="_blank"
            rel="noreferrer"
            aria-label={t.navCta}
            className="hidden h-10 w-10 items-center justify-center rounded-full bg-rose text-white min-[400px]:flex"
          >
            <WhatsAppIcon size={17} />
          </a>
          <button
            type="button"
            aria-label={menuOpen ? (lang === "tr" ? "Menüyü kapat" : "Close menu") : (lang === "tr" ? "Menüyü aç" : "Open menu")}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line2 bg-white text-ink"
          >
            {/* Üç çizgi → X: üst/alt çizgi döner, orta çizgi kaybolur. */}
            <span aria-hidden="true" className="relative block h-[14px] w-[18px]">
              <span
                className={`absolute left-0 top-0 h-[2px] w-full rounded-full bg-current transition-transform duration-300 ease-out motion-reduce:transition-none ${menuOpen ? "translate-y-[6px] rotate-45" : ""}`}
              />
              <span
                className={`absolute left-0 top-[6px] h-[2px] w-full rounded-full bg-current transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${menuOpen ? "scale-x-0 opacity-0" : ""}`}
              />
              <span
                className={`absolute left-0 top-[12px] h-[2px] w-full rounded-full bg-current transition-transform duration-300 ease-out motion-reduce:transition-none ${menuOpen ? "-translate-y-[6px] -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* backdrop — sayfayı karartır, dokununca menüyü kapatır */}
      <div
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 -z-10 bg-ink/30 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none md:hidden ${menuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      {/* mobile menu panel — açılıp kapanırken yükseklik + opaklık animasyonu */}
      <div
        id="mobile-menu"
        inert={!menuOpen}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none md:hidden ${menuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="min-h-0 overflow-hidden">
        <div className="max-h-[calc(100vh-var(--promo-h)-110px)] overflow-y-auto overscroll-contain border-b border-line bg-cream px-[clamp(18px,5vw,56px)] pb-5 pt-1 shadow-[0_30px_60px_-40px_rgba(76,19,19,0.5)]">
          <nav className="flex flex-col">
            {links.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                style={{ transitionDelay: menuOpen ? `${60 + i * 35}ms` : "0ms" }}
                className={`flex min-h-[48px] items-center justify-between border-b border-line/60 py-[13px] text-[15px] text-ink transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${menuOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}
              >
                {l.label}
                <span className="text-accent">→</span>
              </a>
            ))}
          </nav>
          <div className="mt-4 flex items-center gap-3">
            <a
              href={phoneHref(settings.phone)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-[24px] border border-[#eed9d9] bg-white px-4 py-[12px] text-[13px] text-ink"
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

          {/* My Lamination uzmanlığı — menünün en altında, kapatmadan görünür */}
          <a
            href="/mylamination"
            onClick={() => setMenuOpen(false)}
            className="mt-4 flex items-center gap-3 rounded-[20px] border border-line bg-white px-4 py-[13px]"
          >
            <Image
              src={ML_BRAND.logo}
              alt="My Lamination"
              width={250}
              height={150}
              className="h-10 w-auto flex-none"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-medium leading-[1.35] text-ink">
                {ML_EXPERT.name} · My Lamination Uzmanı
              </span>
              <span className="mt-[3px] block text-[11.5px] leading-[1.45] text-muted">
                {lang === "tr"
                  ? "Kaş laminasyonu ve kirpik liftingde sertifikalı uygulayıcı — ürünleri incele"
                  : "Certified applier for brow lamination and lash lift — see the products"}
              </span>
            </span>
            <span className="flex-none text-accent">→</span>
          </a>
        </div>
        </div>
      </div>
    </div>
  );
}
