"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import { pickLang, type Settings } from "@/lib/content";

const DISMISSED_KEY = "stria-popup-dismissed";

type PopupSettings = Pick<
  Settings,
  | "popup_enabled"
  | "popup_title_tr"
  | "popup_title_en"
  | "popup_text_tr"
  | "popup_text_en"
  | "popup_image"
  | "popup_cta_text_tr"
  | "popup_cta_text_en"
  | "popup_cta_url"
>;

export function Popup({ settings }: { settings: PopupSettings }) {
  const { lang } = useLang();
  const title = pickLang(settings.popup_title_tr, settings.popup_title_en, lang);
  const popupText = pickLang(settings.popup_text_tr, settings.popup_text_en, lang);
  const ctaText = pickLang(settings.popup_cta_text_tr, settings.popup_cta_text_en, lang);
  const image = settings.popup_image ?? "";
  const signature = `${title}${popupText}${image}`;
  const enabled = settings.popup_enabled && Boolean(title || popupText || image);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const textId = useId();

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISSED_KEY, signature);
    } catch {
      // Storage may be unavailable in strict privacy modes; closing still works.
    }

    setVisible(false);
    window.setTimeout(() => setMounted(false), 300);
  }, [signature]);

  useEffect(() => {
    if (!enabled) return;

    let firstFrame: number | undefined;
    let secondFrame: number | undefined;

    const showTimer = window.setTimeout(() => {
      try {
        if (localStorage.getItem(DISMISSED_KEY) === signature) return;
      } catch {
        // If storage cannot be read, show the current announcement.
      }

      setMounted(true);
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => setVisible(true));
      });
    }, 800);

    return () => {
      window.clearTimeout(showTimer);
      if (firstFrame) window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, [enabled, signature]);

  useEffect(() => {
    if (!mounted) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };

    document.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [dismiss, mounted]);

  if (!mounted || !enabled) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) dismiss();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={popupText ? textId : undefined}
        aria-label={!title ? (lang === "tr" ? "Stria Studio duyurusu" : "Stria Studio announcement") : undefined}
        className={`relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-[28px] bg-cream shadow-[0_30px_90px_-25px_rgba(66,48,46,0.65)] transition-transform duration-300 motion-reduce:transition-none ${
          visible ? "scale-100" : "scale-[0.97]"
        }`}
      >
        <button
          ref={closeButtonRef}
          type="button"
          aria-label={lang === "tr" ? "Kapat" : "Close"}
          onClick={dismiss}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-cream/90 text-lg text-ink shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          ✕
        </button>

        {image && (
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-[28px] bg-pink">
            <Image
              src={image}
              alt={title || (lang === "tr" ? "Stria Studio duyurusu" : "Stria Studio announcement")}
              fill
              sizes="(max-width: 512px) calc(100vw - 32px), 448px"
              className="object-cover"
            />
          </div>
        )}

        {(title || popupText || settings.popup_cta_url) && (
          <div className="px-6 pb-7 pt-6 sm:px-8 sm:pb-8">
            {title && (
              <h2 id={titleId} className="pr-8 text-[clamp(24px,6vw,32px)] leading-tight text-ink">
                {title}
              </h2>
            )}
            {popupText && (
              <p id={textId} className={`${title ? "mt-3" : ""} whitespace-pre-line text-[15px] leading-[1.7] text-muted2`}>
                {popupText}
              </p>
            )}
            {settings.popup_cta_url && (
              <a
                href={settings.popup_cta_url}
                onClick={dismiss}
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-[26px] bg-rose px-6 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {ctaText || (lang === "tr" ? "Detayları Gör" : "View Details")}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
