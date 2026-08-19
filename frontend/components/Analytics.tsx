"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gtagEvent, gtagPageview } from "@/lib/gtag";
import { site } from "@/lib/site";

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

export function Analytics() {
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
    // Aynı olay Google'a da gider; ikinci bir izleme mimarisi kurulmuyor.
    gtagPageview(pathname);
  }, [pathname]);

  // delegated click tracking for WhatsApp + call links (no per-component edits)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      const a = el?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) {
        post({ type: "event", name: "call_click", path: window.location.pathname });
        gtagEvent("call_click", { page_path: window.location.pathname });
      } else if (href.includes("wa.me") || href.includes("whatsapp")) {
        post({ type: "event", name: "whatsapp_click", path: window.location.pathname });
        gtagEvent("whatsapp_click", { page_path: window.location.pathname });
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
