"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Settings } from "@/lib/content";

const DISMISSED_KEY = "stria-popup-dismissed";
const OPEN_DELAY_MS = 800;
const FADE_DURATION_MS = 300;

type PopupSettings = Pick<
  Settings,
  | "popup_enabled"
  | "popup_title_tr"
  | "popup_text_tr"
  | "popup_image"
  | "popup_cta_text_tr"
  | "popup_cta_url"
>;

export function Popup({ settings }: { settings: PopupSettings }) {
  const title = settings.popup_title_tr ?? "";
  const text = settings.popup_text_tr ?? "";
  const image = settings.popup_image ?? "";
  const signature = `${title}${text}${image}`;
  const isEligible = settings.popup_enabled && Boolean(title || text || image);

  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const unmountTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isEligible) return;

    try {
      if (localStorage.getItem(DISMISSED_KEY) === signature) return;
    } catch {
      // Storage can be unavailable in privacy modes; the popup should still work.
    }

    const openTimer = window.setTimeout(() => setIsRendered(true), OPEN_DELAY_MS);
    return () => window.clearTimeout(openTimer);
  }, [isEligible, signature]);

  useEffect(() => {
    if (!isRendered) return;

    const frame = window.requestAnimationFrame(() => setIsVisible(true));
    closeButtonRef.current?.focus();
    return () => window.cancelAnimationFrame(frame);
  }, [isRendered]);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISSED_KEY, signature);
    } catch {
      // Dismiss for this page view even when storage is unavailable.
    }

    setIsVisible(false);
    if (unmountTimerRef.current) window.clearTimeout(unmountTimerRef.current);
    unmountTimerRef.current = window.setTimeout(
      () => setIsRendered(false),
      FADE_DURATION_MS,
    );
  }, [signature]);

  useEffect(() => {
    if (!isRendered) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dismiss, isRendered]);

  useEffect(
    () => () => {
      if (unmountTimerRef.current) window.clearTimeout(unmountTimerRef.current);
    },
    [],
  );

  if (!isRendered) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-ink/65 p-4 backdrop-blur-[2px] transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={dismiss}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "stria-popup-title" : undefined}
        aria-label={title ? undefined : "Stria Studio duyurusu"}
        aria-describedby={text ? "stria-popup-text" : undefined}
        className={`relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-[2px] border border-line2 bg-cream shadow-2xl transition duration-300 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Pop-up'ı kapat"
          onClick={dismiss}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-line2 bg-cream/95 text-xl leading-none text-ink shadow-sm transition hover:border-accent hover:bg-blush focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span aria-hidden="true">×</span>
        </button>

        {image && (
          <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-line2 bg-blush">
            <Image
              src={image}
              alt={title || "Kampanya görseli"}
              fill
              sizes="(max-width: 448px) calc(100vw - 2rem), 448px"
              className="object-cover"
            />
          </div>
        )}

        {(title || text || settings.popup_cta_url) && (
          <div className="px-6 py-7 sm:px-8 sm:py-8">
            <div className="mb-5 flex items-center gap-3" aria-hidden="true">
              <span className="h-px w-8 bg-accent" />
              <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted2">
                Stria Studio
              </span>
            </div>

            {title && (
              <h2
                id="stria-popup-title"
                className="font-display text-[clamp(27px,7vw,36px)] font-medium leading-[1.08] text-ink"
              >
                {title}
              </h2>
            )}

            {text && (
              <p
                id="stria-popup-text"
                className={`${title ? "mt-4" : ""} whitespace-pre-line text-[15px] leading-7 text-muted2`}
              >
                {text}
              </p>
            )}

            {settings.popup_cta_url && (
              <a
                href={settings.popup_cta_url}
                onClick={dismiss}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-[2px] bg-ink px-6 py-3 text-[12px] font-medium uppercase tracking-[0.12em] text-cream transition hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {settings.popup_cta_text_tr || "Detayları Gör"}
              </a>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
