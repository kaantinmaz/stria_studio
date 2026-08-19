import { site } from "@/lib/site";

// Consent Mode v2 alanları. `ad_*` üçlüsü Google Ads'in dönüşüm modellemesi
// için de gerekli; analytics_storage GA4'ü kapsar.
const CONSENT_KEYS = [
  "ad_storage",
  "ad_user_data",
  "ad_personalization",
  "analytics_storage",
] as const;

type ConsentState = "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const GA_ENABLED = site.gaId !== "";

/**
 * gtag komutunu gönderir.
 *
 * `dataLayer.push([...])` ÇALIŞMAZ: gtag.js komutları `arguments` nesnesi
 * olarak okur, düz diziyi komut saymaz — o yüzden olaylar sessizce yutulur ve
 * consent update uygulanmaz. `window.gtag` <head>'deki başlangıç betiğinde
 * senkron tanımlandığı için React kodu çalıştığında her zaman hazırdır.
 */
function call(...args: unknown[]): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag(...args);
}

export function gtagEvent(name: string, params: Record<string, unknown> = {}): void {
  if (!GA_ENABLED) return;
  call("event", name, params);
}

export function gtagPageview(path: string): void {
  if (!GA_ENABLED) return;
  call("event", "page_view", { page_path: path, page_location: window.location.href });
}

/**
 * Çerez onayı verildiğinde çağrılır. Onaydan önce her şey `denied`; bu hâlde
 * GA4 çerezsiz (modellenmiş) ping atar, kişiselleştirme yapılmaz.
 */
export function gtagConsent(state: ConsentState): void {
  if (!GA_ENABLED) return;
  call("consent", "update", Object.fromEntries(CONSENT_KEYS.map((key) => [key, state])));
}

/**
 * <head>'in EN BAŞINA basılan başlangıç betiği: gtag stub'ı, Consent Mode v2
 * varsayılanları (hepsi denied) ve `js` komutu.
 *
 * Bilinçli olarak `next/script` kullanılmıyor: `beforeInteractive` bile Next'in
 * istemci kuyruğuna (`__next_s`) düşüyor. Onay varsayılanı hukuken taşıyıcı
 * olduğu için framework semantiğine bağlı bırakılmaz — düz inline script,
 * gtag.js'ten önce, garantili.
 */
export function gtagBootstrapTag(): string {
  if (!GA_ENABLED) return "";

  const defaults = CONSENT_KEYS.map((key) => `${key}:'denied'`).join(",");

  return `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{${defaults},wait_for_update:500});gtag('js',new Date());</script>`;
}

/**
 * gtag.js yüklendikten sonra çalışan yapılandırma. `send_page_view:false` —
 * sayfa görüntülemeyi Analytics bileşeni rota değişiminde kendisi gönderiyor;
 * ikisi birlikte açık kalırsa ilk sayfa iki kez sayılır.
 */
export function gtagConfigScript(): string {
  const lines = [`gtag('config','${site.gaId}',{send_page_view:false});`];

  if (site.adsId !== "") {
    lines.push(`gtag('config','${site.adsId}');`);
  }

  return lines.join("\n");
}
