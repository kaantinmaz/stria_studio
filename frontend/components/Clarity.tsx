"use client";

import { useEffect } from "react";
import { site } from "@/lib/site";

// Onay kaynağı GA/Meta ile aynı (bkz. MetaPixel.tsx).
const CONSENT_KEY = "stria-cookie-consent";

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[][] };

declare global {
  interface Window {
    clarity?: ClarityFn;
  }
}

/**
 * Microsoft Clarity: ısı haritası + oturum kaydı. Çerez onayı verilene kadar
 * clarity.ms betiği YÜKLENMEZ. Rota değişimlerini Clarity kendisi izler (SPA).
 * Form alanları Clarity'nin varsayılan maskelemesiyle kayda girmez.
 */
function loadClarity(): void {
  if (window.clarity || !site.clarityId) return;
  const c: ClarityFn = (...args: unknown[]) => {
    (c.q = c.q || []).push(args);
  };
  window.clarity = c;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.clarity.ms/tag/${site.clarityId}`;
  document.head.appendChild(s);
  // Yalnız onaydan sonra yüklendiği için onay sinyali hep "granted".
  c("consentv2", { ad_Storage: "granted", analytics_Storage: "granted" });
}

export function Clarity() {
  useEffect(() => {
    if (!site.clarityId) return;
    try {
      if (localStorage.getItem(CONSENT_KEY) === "accepted") loadClarity();
    } catch {
      /* localStorage kapalı: onay yok say */
    }
    window.addEventListener("stria-consent-accepted", loadClarity);
    return () => window.removeEventListener("stria-consent-accepted", loadClarity);
  }, []);

  return null;
}
