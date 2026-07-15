"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Settings } from "@/lib/content";

const DISMISSED_KEY = "stria-popup-dismissed";
const OPEN_DELAY_MS = 800;

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
  const body = settings.popup_text_tr ?? "";
  const image = settings.popup_image ?? "";
  const ctaText = settings.popup_cta_text_tr || "Detayları Gör";
  const ctaUrl = settings.popup_cta_url ?? "";
  const eligible = settings.popup_enabled && Boolean(title || body || image);
  const signature = useMemo(() => title + body + image, [title, body, image]);

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!eligible) return;

    try {
      if (localStorage.getItem(DISMISSED_KEY) === signature) return;
    } catch {
      // Storage can be unavailable in privacy-restricted browsers; still show it.
    }

    let frame = 0;
    const timer = window.setTimeout(() => {
      setMounted(true);
      frame = window.requestAnimationFrame(() => setVisible(true));
    }, OPEN_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
    };
  }, [eligible, signature]);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISSED_KEY, signature);
    } catch {
      // Closing must keep working even when localStorage is unavailable.
    }
    setVisible(false);
    setMounted(false);
  }, [signature]);

  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dismiss, mounted]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-ink/55 px-4 py-6 backdrop-blur-sm transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "popup-title" : undefined}
        aria-label={title ? undefined : "Stria Studio duyurusu"}
        aria-describedby={body ? "popup-text" : undefined}
        className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-[28px] border border-line bg-cream shadow-2xl"
      >
        <button
          type="button"
          aria-label="Pop-up'ı kapat"
          onClick={dismiss}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-cream/90 text-xl leading-none text-ink shadow-sm transition hover:bg-blush hover:text-accent-dark"
        >
          ×
        </button>

        {image && (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-[27px] bg-blush">
            <Image
              src={image}
              alt={title || "Stria Studio duyurusu"}
              fill
              sizes="(max-width: 512px) calc(100vw - 2rem), 448px"
              className="object-cover"
            />
          </div>
        )}

        {(title || body || ctaUrl) && (
          <div className="px-6 pb-7 pt-6 sm:px-8 sm:pb-8 sm:pt-7">
            {title && (
              <h2 id="popup-title" className="pr-8 text-2xl leading-tight text-ink sm:text-[28px]">
                {title}
              </h2>
            )}
            {body && (
              <p
                id="popup-text"
                className={`${title ? "mt-3" : ""} whitespace-pre-line leading-7 text-muted2`}
              >
                {body}
              </p>
            )}
            {ctaUrl && (
              <a
                href={ctaUrl}
                onClick={dismiss}
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-ink px-6 py-3 text-center text-sm font-medium text-cream transition hover:bg-accent-dark"
              >
                {ctaText}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
