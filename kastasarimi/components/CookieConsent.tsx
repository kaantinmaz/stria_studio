"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CONSENT_KEY = "stria-cookie-consent";

export function CookieConsent() {
  const [isMounted, setIsMounted] = useState(false);
  const [isAccepted, setIsAccepted] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    try {
      setIsAccepted(localStorage.getItem(CONSENT_KEY) === "accepted");
    } catch {
      setIsAccepted(false);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "accepted");
    } catch {
      // Hide for this page view even when storage is unavailable.
    }
    setIsAccepted(true);
  };

  if (!isMounted || isAccepted) return null;

  return (
    <div
      role="region"
      aria-label="Çerez bildirimi"
      className="fixed inset-x-0 bottom-0 z-[55] border-t border-line2 bg-cream/95 shadow-[0_-8px_30px_rgba(23,20,18,0.08)] backdrop-blur"
    >
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-x-5 gap-y-3 px-5 py-3 sm:justify-between">
        <p className="text-center text-[13px] leading-relaxed text-muted2 sm:text-left">
          Deneyiminizi iyileştirmek için çerezler kullanıyoruz.{" "}
          <Link
            href="/cerez-politikasi"
            className="font-medium text-accent-dark underline decoration-line2 underline-offset-4 hover:decoration-accent-dark"
          >
            Çerez Politikası
          </Link>
        </p>
        <button
          type="button"
          onClick={accept}
          className="min-h-10 shrink-0 rounded-[2px] bg-ink px-5 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-cream transition hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Kabul Ediyorum
        </button>
      </div>
    </div>
  );
}
