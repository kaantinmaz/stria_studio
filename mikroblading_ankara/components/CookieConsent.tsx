"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CONSENT_KEY = "stria-cookie-consent";

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(CONSENT_KEY) !== "accepted");
    } catch {
      // Storage may be unavailable; keep the notice usable for this session.
      setVisible(true);
    }
    setMounted(true);
  }, []);

  function acceptCookies() {
    try {
      localStorage.setItem(CONSENT_KEY, "accepted");
    } catch {
      // The button should still dismiss the notice when storage is unavailable.
    }
    setVisible(false);
  }

  if (!mounted || !visible) return null;

  return (
    <div
      role="region"
      aria-label="Çerez bildirimi"
      className="fixed inset-x-0 bottom-0 z-[45] border-t border-line bg-cream/95 px-5 py-3 shadow-[0_-8px_24px_rgba(66,48,46,0.08)] backdrop-blur"
    >
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-x-5 gap-y-3 sm:justify-between">
        <p className="text-center text-sm leading-relaxed text-muted2 sm:text-left">
          Deneyiminizi iyileştirmek için çerezler kullanıyoruz. {" "}
          <Link href="/cerez-politikasi" className="font-medium text-accent-dark underline underline-offset-2">
            Çerez Politikası
          </Link>
        </p>
        <button
          type="button"
          onClick={acceptCookies}
          className="shrink-0 rounded-full bg-ink px-5 py-2 text-sm font-medium text-cream transition hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-dark"
        >
          Kabul Ediyorum
        </button>
      </div>
    </div>
  );
}
