"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gtagEvent, gtagPageview } from "@/lib/gtag";
import { metaContext, newEventId, trackContact, trackFindLocation } from "@/lib/metaPixel";
import { captureAttribution, getAttribution, newRefCode, withRef } from "@/lib/attribution";
import { site } from "@/lib/site";
import { serviceValueForPath } from "@/lib/conversionValue";
import type { ServiceListItem } from "@/lib/content";

function post(body: Record<string, unknown>) {
  try {
    fetch(`${site.apiUrl}/api/track`, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

// Harita / yol tarifi bağlantıları (Google Maps, Apple Maps, Yandex Haritalar).
const MAPS_HREF = /google\.[a-z.]+\/maps|maps\.google\.|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.apple\.com|yandex\.[a-z.]+\/maps/i;

export function Analytics({ services }: { services: ServiceListItem[] }) {
  const pathname = usePathname();

  // pageview on every route change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    post({
      type: "pageview",
      path: pathname,
      referrer: document.referrer || null,
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
    });
    // Reklam gelişi (gclid/fbclid/UTM) 90 gün saklanır; iletişim tıklamasında backend'e gider.
    captureAttribution(window.location.href, document.referrer);
    // Aynı olay Google'a da gider; ikinci bir izleme mimarisi kurulmuyor.
    gtagPageview(pathname);
  }, [pathname]);

  // delegated click tracking for WhatsApp, call and map links (no per-component edits)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      const a = el?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      const path = window.location.pathname;
      const eventId = newEventId();
      // Hizmet sayfasındaki iletişim tıklaması o hizmetin dönüşüm değerini taşır.
      const value = serviceValueForPath(path, services);
      if (href.startsWith("tel:")) {
        post({ type: "event", name: "call_click", path, meta: metaContext(eventId), attr: getAttribution() });
        gtagEvent("call_click", { page_path: path, ...value });
        trackContact("phone", path, eventId, value);
      } else if (href.includes("wa.me") || href.includes("whatsapp")) {
        // Mesaja kısa kod eklenir; panelde müşteriye girilince ödeme doğru reklama yazılır.
        // Taban bağlantı saklanır ki tekrar tıklamada kodlar üst üste eklenmesin.
        const ref = newRefCode();
        a.dataset.waBase ??= href;
        a.setAttribute("href", withRef(a.dataset.waBase, ref));
        post({ type: "event", name: "whatsapp_click", path, ref, meta: metaContext(eventId), attr: getAttribution() });
        gtagEvent("whatsapp_click", { page_path: path, ...value });
        trackContact("whatsapp", path, eventId, value);
      } else if (MAPS_HREF.test(href)) {
        post({ type: "event", name: "maps_click", path, meta: metaContext(eventId) });
        gtagEvent("maps_click", { page_path: path });
        trackFindLocation(path, eventId);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [services]);

  return null;
}
