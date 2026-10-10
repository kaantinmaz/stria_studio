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

/**
 * Meta Pixel yaşam döngüsü. Çerez onayı beklenmez (owner kararı 2026-10-10:
 * rızasız remarketing); her rotada yüklenir ve PageView gider. Kamuflaj
 * (sağlığa yakın) sayfasında pixel HİÇ yüklenmez — fbevents.js bile gitmez.
 */
export function MetaPixel() {
  const pathname = usePathname();
  const loaded = useRef(false);

  useEffect(() => {
    // Bayrak kimlik taşımaz.
    storeAdSrc(window.location.search);
    if (!META_PIXEL_ENABLED || isKamuflaj(pathname)) return;
    if (!loaded.current) {
      loadPixel();
      loaded.current = true;
    }
    trackPageView(pathname);
    trackServiceView(pathname);
  }, [pathname]);

  return null;
}
