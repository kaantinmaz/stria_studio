import { site } from "@/lib/site";
import { pricing, LAST_UPDATED } from "@/lib/copy";

// Machine-readable pricing for AI agents (same pattern as /llms.txt).
// Agents comparing services programmatically can parse this without rendering JS.
export const dynamic = "force-static";

export function GET(): Response {
  const rows = pricing.rows
    .map((r) => `## ${r.name}\n- Kapsam: ${r.detail}\n- Fiyat: ${r.price}`)
    .join("\n\n");

  const body = `# Fiyatlar — Kaş Tasarımı Ankara (Stria Studio)

Son güncelleme: ${LAST_UPDATED}. Para birimi: Türk Lirası (₺). Konum: Çankaya, Ankara.

${rows}

## Notlar
- ${pricing.note}
- Kesin fiyat, ücretsiz ön görüşmede kaş yapısına göre netleşir.
- Randevu: WhatsApp veya telefon — bkz. ${new URL("/iletisim", site.siteUrl)}
- Ayrıntılı fiyat sayfası: ${new URL("/kas-tasarimi-fiyatlari", site.siteUrl)}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
