"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import { useSettings } from "@/components/SettingsProvider";
import { phoneHref } from "@/lib/content";
import { IMG } from "@/lib/i18n";
import { ImageSlot } from "@/components/ImageSlot";
import { PhoneIcon, WhatsAppIcon, GoogleIcon } from "@/components/Icons";
import { Stars } from "@/components/Stars";
import { useGoogleRating } from "@/components/GoogleRatingBadge";
import { CallLabel } from "@/components/CallLabel";

export function Hero() {
  const { t } = useLang();
  const settings = useSettings();
  const slides = IMG.heroSlides;
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(
      () => setSlide((n) => (n + 1) % slides.length),
      5000,
    );
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <header
      id="top"
      className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-[clamp(28px,4.5vw,72px)] px-[clamp(18px,5vw,56px)] pb-16 pt-[116px] sm:pt-[158px] md:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)]"
    >
      <div>
        <div className="reveal in mb-[26px] inline-flex items-center gap-2 rounded-[22px] bg-pink px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-accent">
          <span className="h-[6px] w-[6px] rounded-full bg-rose" />
          {t.heroKicker}
        </div>
        <h1 className="reveal in mb-[22px] whitespace-pre-line text-[clamp(40px,5.6vw,78px)] leading-[1.03]">
          {t.heroTitle}
        </h1>
        <p className="reveal in mb-[30px] max-w-[480px] text-[clamp(15px,1.4vw,18px)] leading-[1.7] text-muted">
          {t.heroText}
        </p>
        <div className="reveal in mb-[30px] flex flex-wrap gap-3">
          <a
            href={settings.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-[9px] rounded-[28px] bg-ink px-7 py-[15px] text-sm text-cream"
          >
            <WhatsAppIcon size={16} />
            {t.heroCtaPrimary}
          </a>
          <a
            href={phoneHref(settings.phone)}
            className="inline-flex items-center gap-[9px] rounded-[28px] border border-line2 bg-white px-7 py-[15px] text-sm text-ink"
          >
            <PhoneIcon size={15} />
            <CallLabel label={t.heroCtaSecondary} />
          </a>
        </div>
        <div className="reveal in flex flex-wrap gap-x-[22px] gap-y-4">
          {t.heroFeatures.map((f) => (
            <div
              key={f}
              className="inline-flex items-center gap-2 text-[13px] text-muted2"
            >
              <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-pink text-[11px] text-accent">
                ✓
              </span>
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className="reveal in relative">
        <div className="relative h-[min(72vh,600px)] overflow-hidden rounded-[200px_200px_32px_32px] shadow-[0_40px_90px_-50px_rgba(229,135,146,0.7)]">
          {slides.map((src, i) => (
            <div
              key={src}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === slide ? "opacity-100" : "opacity-0"
              }`}
            >
              <ImageSlot
                src={src}
                alt="Stria Studio — Ankara kalıcı makyaj stüdyosu"
                sizes="(max-width: 768px) 100vw, 45vw"
                priority={i === 0}
              />
            </div>
          ))}

          {slides.length > 1 && (
            <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {slides.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  aria-label={`Görsel ${i + 1}`}
                  aria-current={i === slide}
                  onClick={() => setSlide(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === slide ? "w-5 bg-cream" : "w-2 bg-cream/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* featured service card */}
        <a
          href="#services"
          className="absolute bottom-[26px] left-2 flex items-center gap-[13px] rounded-[20px] bg-cream/[0.92] p-3 pl-3 pr-4 text-ink shadow-[0_20px_40px_-18px_rgba(76,19,19,0.4)] backdrop-blur-[10px] sm:left-[-14px]"
        >
          <div className="relative h-14 w-14 flex-none overflow-hidden rounded-[14px]">
            <ImageSlot src={IMG.micro} alt={t.featuredName} sizes="56px" />
          </div>
          <div>
            <div className="mb-[3px] text-[10px] uppercase tracking-[0.1em] text-accent">
              {t.featuredLabel}
            </div>
            <div className="text-base font-medium leading-[1.1]">
              {t.featuredName}
            </div>
            <div className="mt-[1px] text-[11px] text-muted">
              {t.featuredHint}
            </div>
          </div>
          <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-ink text-[15px] text-cream">
            →
          </span>
        </a>

        {/* Google rating chip — real value only; hidden entirely when unset */}
        <GoogleRatingChip />
      </div>
    </header>
  );
}

// Dark hero variant of the Google rating badge. Same data and wording as
// GoogleRatingBadge (shared hook) — only the chip styling differs.
function GoogleRatingChip() {
  const google = useGoogleRating();
  if (!google) return null;

  const { rating, num, label, aria, url } = google;
  const chipClass =
    "absolute right-2 top-6 flex flex-col items-center gap-[6px] rounded-[18px] bg-ink px-4 py-3 text-center text-cream shadow-[0_20px_40px_-18px_rgba(76,19,19,0.5)] sm:right-[-8px]";
  const body = (
    <>
      <span className="text-[22px] font-medium leading-none tracking-[-0.02em]">
        {num}
      </span>
      <Stars value={rating} size={12} />
      <span className="inline-flex items-center gap-[5px] text-[10px] tracking-[0.06em] text-[#eed6d7]">
        <GoogleIcon size={11} />
        {label}
      </span>
    </>
  );

  return url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={chipClass}
      aria-label={aria}
    >
      {body}
    </a>
  ) : (
    <div className={chipClass} aria-label={aria}>
      {body}
    </div>
  );
}
