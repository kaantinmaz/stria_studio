"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

// First-party, cookieless pageview + CTA tracking. Reuses the shared backend
// /track endpoint; tags each hit with the microsite slug.
function post(body: Record<string, unknown>) {
  try {
    fetch(`${site.apiUrl}/api/track`, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site: site.slug, ...body }),
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

export function Analytics() {
  const pathname = usePathname();

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
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) {
        post({ type: "event", name: "call_click", path: window.location.pathname });
      } else if (href.includes("wa.me") || href.includes("whatsapp")) {
        post({ type: "event", name: "whatsapp_click", path: window.location.pathname });
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
