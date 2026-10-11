// Reklam tıklaması → ödeme yapan müşteri eşleştirmesinin istemci tarafı.
//
// 1) Siteye gelişte URL'deki tıklama kimlikleri (gclid/gbraid/wbraid/fbclid) ve
//    UTM'ler 90 gün saklanır (son reklam gelişi kazanır; reklamsız ziyaret silmez).
// 2) WhatsApp tıklamasında mesaja kısa bir kod eklenir: "… (Ref: K7F3)". Kod ve
//    saklanan geliş bilgisi /api/track'e gider; panelde müşteriye bu kod girilince
//    ödeme Google/Meta'ya doğru reklama yazılır.

const KEY = "stria-attr";
const TTL_MS = 90 * 24 * 60 * 60 * 1000;
const PARAMS = ["gclid", "gbraid", "wbraid", "fbclid", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
// Karıştırılmayan harfler (0/O, 1/I yok) — backend Attribution::parseRef ile uyumlu.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type Attribution = Partial<Record<(typeof PARAMS)[number] | "landing_url" | "referrer", string>>;

export function captureAttribution(href: string, referrer: string, now = Date.now()): void {
  const url = new URL(href);
  const found: Attribution = {};
  for (const p of PARAMS) {
    const v = url.searchParams.get(p);
    if (v) found[p] = v.slice(0, 255);
  }
  if (Object.keys(found).length === 0) return;
  found.landing_url = href.slice(0, 1024);
  if (referrer) found.referrer = referrer.slice(0, 512);
  try {
    localStorage.setItem(KEY, JSON.stringify({ ts: now, attr: found }));
  } catch {
    // Depolama kapalı (gizlilik modu): bu ziyaret eşleşmez, site çalışmaya devam eder.
  }
}

export function getAttribution(now = Date.now()): Attribution | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { ts?: number; attr?: Attribution };
    if (typeof data.ts !== "number" || now - data.ts > TTL_MS) return null;
    return data.attr ?? null;
  } catch {
    return null;
  }
}

export function newRefCode(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/** WhatsApp bağlantısının `text` parametresine "(Ref: KOD)" ekler. Boşluk `%20`
 * olarak kodlanır — WhatsApp `+` işaretini her istemcide boşluğa çevirmiyor. */
export function withRef(href: string, code: string): string {
  try {
    const url = new URL(href);
    const text = url.searchParams.get("text");
    url.searchParams.delete("text");
    const full = `${text ? `${text} ` : ""}(Ref: ${code})`;
    const sep = url.search ? "&" : "?";
    return `${url.origin}${url.pathname}${url.search}${sep}text=${encodeURIComponent(full)}`;
  } catch {
    return href;
  }
}
