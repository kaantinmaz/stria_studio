import { site } from "@/lib/site";

// Meta (Facebook/Instagram) Pixel yardımcıları: yükleme/init, izleme, yol
// kuralları ve Google Ads geliş bayrağı. `NEXT_PUBLIC_META_PIXEL_ID` boşsa
// (varsayılan) pixel tamamen kapalı — hiçbir betik basılmaz, hiçbir fbq çağrısı
// gitmez. Çerez onayı BEKLENMEZ (owner kararı 2026-10-10: rızasız remarketing);
// tek istisna kamuflaj yolları (aşağıda).
export const META_PIXEL_ENABLED = site.metaPixelId !== "";

type FbqStub = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: unknown;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

// --- Yol kuralları ---

// Retargeting'e açık hizmet sayfaları. Sağlığa yakın "kamuflaj" bilinçli olarak
// DIŞARIDA; eyeliner/dipliner da asla eklenmez.
export const SERVICE_SLUGS = [
  "kas-laminasyon",
  "dudak-renklendirme",
  "kirpik-lifting",
  "kas-pudralama",
  "microblading",
  "kas-tasarimi",
  "altin-oran-kas-alim",
] as const;

const KAMUFLAJ_PREFIX = "/hizmetler/kamuflaj-makyaj";

// Kamuflaj (sağlığa yakın) yollarına Meta'ya HİÇBİR şey gitmez — PageView bile.
export function isKamuflaj(path: string): boolean {
  return path.startsWith(KAMUFLAJ_PREFIX);
}

// `/hizmetler/<slug>` sayfasından izin listesindeki slug'ı çıkarır; alt sayfalar
// (`/hizmetler/<slug>/<sub>`) ve izin dışı slug'lar null döner.
export function serviceSlug(path: string): string | null {
  if (isKamuflaj(path)) return null;
  const m = /^\/hizmetler\/([^/]+)\/?$/.exec(path);
  if (!m) return null;
  return (SERVICE_SLUGS as readonly string[]).includes(m[1]) ? m[1] : null;
}

// --- Google Ads geliş bayrağı ---
// Kimlik taşımaz; yalnızca "bu ziyaretçi Google reklamından geldi" bilgisini
// 30 gün tutar. Tıklama kimliği (gclid vb.) hiçbir yere gönderilmez.
const AD_SRC_KEY = "stria-ad-src";
const AD_SRC_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function detectGoogleAds(search: string): boolean {
  const p = new URLSearchParams(search);
  if (p.get("gclid") || p.get("gbraid") || p.get("wbraid")) return true;
  return p.get("utm_source") === "google" && p.get("utm_medium") === "cpc";
}

export function storeAdSrc(search: string, now = Date.now()): void {
  if (!detectGoogleAds(search)) return;
  try {
    localStorage.setItem(AD_SRC_KEY, JSON.stringify({ src: "google_ads", ts: now }));
  } catch {
    // Depolama yoksa (gizlilik modu) sessiz geç.
  }
}

export function isAdSrcValid(now = Date.now()): boolean {
  try {
    const raw = localStorage.getItem(AD_SRC_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw) as { src?: string; ts?: number };
    if (data.src !== "google_ads" || typeof data.ts !== "number") return false;
    return now - data.ts <= AD_SRC_TTL_MS;
  } catch {
    return false;
  }
}

// --- Pixel yükleme + izleme ---

let initialized = false;

/**
 * fbevents.js'i enjekte eder ve pixel'i init eder. Yalnızca onay verilmişken
 * çağrılmalı. Idempotent: betik/çağrı bir kez düşer. Standart Meta base code —
 * init OTOMATİK PageView atmaz; onu rota efekti açıkça gönderir (çift sayım yok).
 */
export function loadPixel(): void {
  if (!META_PIXEL_ENABLED || typeof window === "undefined") return;

  if (!window.fbq) {
    const n = function (...args: unknown[]) {
      n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
    } as FbqStub;
    window.fbq = n;
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    const t = document.createElement("script");
    t.async = true;
    t.src = "https://connect.facebook.net/en_US/fbevents.js";
    const s = document.getElementsByTagName("script")[0];
    s.parentNode?.insertBefore(t, s);
  }

  if (!initialized) {
    window.fbq("init", site.metaPixelId);
    initialized = true;
  }
}

function fbqReady(): boolean {
  return (
    META_PIXEL_ENABLED &&
    typeof window !== "undefined" &&
    typeof window.fbq === "function"
  );
}

export function trackPageView(path: string): void {
  if (!fbqReady() || isKamuflaj(path)) return;
  window.fbq!("track", "PageView");
}

export function trackServiceView(path: string, now = Date.now()): void {
  if (!fbqReady() || isKamuflaj(path)) return;
  const slug = serviceSlug(path);
  if (!slug) return;
  window.fbq!("track", "ViewContent", { content_name: slug, content_category: "service" });
  // Google reklamından gelen ziyaretçi için ayrıca özel retargeting olayı.
  if (isAdSrcValid(now)) {
    window.fbq!("trackCustom", "GoogleAdsServiceView", { service: slug });
  }
}

export function trackContact(method: "whatsapp" | "phone", path: string, eventId?: string): void {
  if (!fbqReady() || isKamuflaj(path)) return;
  window.fbq!("track", "Contact", { method }, eventId ? { eventID: eventId } : undefined);
}

export function trackLead(path: string, eventId: string, service?: string | null): void {
  if (!fbqReady() || isKamuflaj(path)) return;
  window.fbq!("track", "Lead", service ? { content_name: service } : {}, { eventID: eventId });
}

// --- Dönüşümler API'si (sunucu) bağlamı ---
// Pixel olayı ile sunucu olayı aynı event_id'yi taşır → Meta tek sayar.

export function newEventId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function cookie(name: string): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

/**
 * Sunucuya giden `meta` bloğu. `consent` alanı sunucu için "gönderilebilir"
 * bayrağıdır: pixel kapalıysa ya da kamuflaj sayfasındaysa `false` gider ve
 * sunucu Meta'ya hiçbir şey göndermez. Çerez onayına bakılmaz.
 */
export function metaContext(eventId: string): Record<string, unknown> {
  const path = window.location.pathname;
  if (!META_PIXEL_ENABLED || isKamuflaj(path)) return { consent: false };
  return {
    event_id: eventId,
    consent: true,
    fbp: cookie("_fbp"),
    fbc: cookie("_fbc"),
    url: window.location.href,
  };
}
