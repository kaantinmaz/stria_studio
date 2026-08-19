"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { gtagConsent } from "@/lib/gtag";

const CONSENT_KEY = "stria-cookie-consent";

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    let hasAccepted = false;

    try {
      hasAccepted = localStorage.getItem(CONSENT_KEY) === "accepted";
    } catch {
      // Storage may be unavailable; the notice can still be dismissed for this view.
    }

    // Daha önce onay vermiş ziyaretçi `denied` durumunda kalmasın.
    if (hasAccepted) gtagConsent("granted");

    const frame = window.requestAnimationFrame(() => {
      setAccepted(hasAccepted);
      setMounted(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "accepted");
    } catch {
      // Dismiss even when storage is unavailable in strict privacy modes.
    }
    gtagConsent("granted");
    setAccepted(true);
  };

  if (!mounted || accepted) return null;

  return (
    <div
      role="region"
      aria-label="Çerez bildirimi"
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-line2 bg-cream/95 px-[clamp(16px,4vw,40px)] py-3 shadow-[0_-12px_36px_-24px_rgba(76,19,19,0.55)] backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-[1160px] flex-wrap items-center gap-x-4 gap-y-3 pr-[72px] sm:pr-[76px]">
        <p className="min-w-[220px] flex-1 text-[13px] leading-[1.55] text-muted2">
          Deneyiminizi iyileştirmek için çerezler kullanıyoruz.{" "}
          <Link
            href="/cerez-politikasi"
            className="font-medium text-accent underline underline-offset-4 hover:text-accent-dark"
          >
            Çerez Politikası
          </Link>
        </p>
        <button
          type="button"
          onClick={accept}
          className="min-h-10 shrink-0 cursor-pointer rounded-[22px] bg-rose px-5 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Kabul Ediyorum
        </button>
      </div>
    </div>
  );
}
