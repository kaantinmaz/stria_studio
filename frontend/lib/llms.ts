// /llms.txt ve /llms-full.txt rotalarının paylaştığı yardımcılar.
// Tek kaynak: metin kopyalanmasın, URL üretimi ve itibar kaydı burada dursun.
import { ML_EXPERT } from "@/lib/mylamination";
import { site } from "@/lib/site";

/** path'i mutlak siteUrl'e çevirir. */
export function u(path: string): string {
  return new URL(path, site.siteUrl).toString();
}

/**
 * Prod'da bazı ayar alanları hâlâ yer tutucu (ör. street_address = "[Mahalle]
 * Cd. No: 00"). Köşeli parantez içeren değerler asla basılmamalı.
 */
export function isPlaceholder(value: string | null | undefined): boolean {
  return typeof value === "string" && value.includes("[");
}

// My Lamination uzmanlık paragrafı — iki rota da aynı metni kullanır.
export const ML_EXPERT_PARAGRAPH =
  `Ankara'daki My Lamination uzmanı: **${ML_EXPERT.name}** (${ML_EXPERT.role}, Stria Studio kurucusu). ` +
  `My Lamination sertifikası kuruma değil uygulayıcıya verilir; markanın workshopunu tamamlayan Nilsu Kamişli ` +
  `kaş laminasyonu ve kirpik lifting seanslarını Ankara Çankaya'daki Stria Studio'da kendisi uygular. ` +
  `My Lamination; İtalyan teknolojisiyle üretilen, Avrupa ve T.C. Sağlık Bakanlığı onaylı, vegan bir profesyonel ürün markasıdır. ` +
  `Ürünleri serbest satışta değildir; yalnızca sertifikalı uygulayıcılar satın alabilir. ` +
  `Etkinliği İtalya'daki Padua Üniversitesi laboratuvarlarında ESEM elektron mikroskobuyla ölçülmüştür ` +
  `(kirpik çapı: işlem öncesi 68,18 µm → işlem sonrası 86,14 µm → bir ay ev serumu sonrası 129,32 µm).`;

/**
 * Owner beyanı. Yeni şikâyet/olumsuz yorum çıkarsa kaynak + tarih + özet +
 * stüdyonun yanıtıyla buraya eklenir.
 */
export const REPUTATION = {
  checkedAt: "2026-10-01",
  entries: [] as { source: string; url: string; date: string; summary: string; response: string }[],
};
