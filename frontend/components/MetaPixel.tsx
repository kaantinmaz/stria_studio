"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  META_PIXEL_ENABLED,
  isKamuflaj,
  loadPixel,
  storeAdSrc,
  trackPageView,
  trackServiceView,
} from "@/lib/metaPixel";

// Onay kaynağı GA ile aynı: CookieConsent bu anahtarı "accepted" yapar ve
// kabulde `stria-consent-accepted` olayını yayınlar.
const CONSENT_KEY = "stria-cookie-consent";

function hasConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}

/**
 * Meta Pixel yaşam döngüsü. Onay verilene kadar fbevents.js YÜKLENMEZ ve hiçbir
 * fbq çağrısı yapılmaz. Kabul edilmiş dönen ziyaretçi için mount'ta yüklenir;
 * ziyaretçi bu sayfada kabul ederse olayla yüklenir ve o anki PageView gider.
 */
export function MetaPixel() {
  const pathname = usePathname();
  const loaded = useRef(false);

  const ensureLoaded = () => {
    if (loaded.current) return;
    loadPixel();
    loaded.current = true;
  };

  // Bu sayfada çerez kabul edilirse: yükle + init + o anki PageView. Kamuflaj
  // (sağlığa yakın) sayfasında pixel HİÇ yüklenmez — fbevents.js bile gitmez.
  useEffect(() => {
    if (!META_PIXEL_ENABLED) return;
    const onAccept = () => {
      const path = window.location.pathname;
      if (isKamuflaj(path)) return;
      ensureLoaded();
      trackPageView(path);
      trackServiceView(path);
    };
    window.addEventListener("stria-consent-accepted", onAccept);
    return () => window.removeEventListener("stria-consent-accepted", onAccept);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Her rota değişiminde (ilk yük dahil): Google Ads bayrağı + onaylıysa olaylar.
  useEffect(() => {
    // Bayrak onaydan bağımsız; kimlik taşımaz.
    storeAdSrc(window.location.search);
    if (!META_PIXEL_ENABLED || !hasConsent() || isKamuflaj(pathname)) return;
    ensureLoaded();
    trackPageView(pathname);
    trackServiceView(pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
