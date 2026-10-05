import type { ServiceListItem } from "@/lib/content";

// Reklamdan gelen ziyaretçi WhatsApp'ta yalnızca "gönder"e bassın diye mesajı
// hazır doldururuz; stüdyo da talebin hangi hizmetten geldiğini görür.

// Genel sayfalar için varsayılan mesaj.
export const GENERIC_WHATSAPP_TEXT = "Merhaba, randevu ve bilgi almak istiyorum.";

// Hizmet sayfaları için hizmet adını içeren mesaj.
export function serviceWhatsappText(name: string): string {
  return `Merhaba, ${name} hakkında bilgi ve randevu almak istiyorum.`;
}

// wa.me bağlantısına ön dolgulu metni ekler. Metin boşsa taban değişmeden döner.
// Analytics'teki tıklama izleme için bağlantı düz `wa.me` olarak kalır.
export function whatsappHref(base: string, text?: string): string {
  if (!text) return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}text=${encodeURIComponent(text)}`;
}

// Global CTA'lar için: `/hizmetler/<slug>` (ve alt sayfaları, ör. kamuflaj)
// yolundan hizmet adını bulup mesajı üretir; aksi halde genel mesaj.
export function pathWhatsappText(
  path: string,
  services: ServiceListItem[],
): string {
  const m = /^\/hizmetler\/([^/]+)(?:\/[^/]+)?\/?$/.exec(path);
  if (m) {
    const svc = services.find((s) => s.slug === m[1]);
    if (svc) return serviceWhatsappText(svc.name_tr);
  }
  return GENERIC_WHATSAPP_TEXT;
}
