import { site } from "@/lib/site";
import { pricing, LAST_UPDATED } from "@/lib/copy";

// AI-crawler manifest (llmstxt.org). Served as /llms.txt. Gives LLMs a concise,
// authoritative overview + key links + machine-readable pricing.
export const dynamic = "force-static";

function u(path: string): string {
  return new URL(path, site.siteUrl).toString();
}

export function GET(): Response {
  const priceLines = pricing.rows.map((r) => `- ${r.name} (${r.detail}): ${r.price}`).join("\n");

  const body = `# Mikroblading Ankara — Stria Studio

> Ankara Çankaya'da kıl tekniğiyle (mikroblading) doğal ve kalıcı kaş tasarımı yapan güzellik stüdyosu. Steril tek kullanımlık ekipman, yüze özel tasarım, 12–18 ay kalıcılık. Son güncelleme: ${LAST_UPDATED}.

## Hizmet
- Hizmet: Mikroblading (kıl tekniği kaş), kaş pudralama
- Konum: Çankaya, Ankara, Türkiye
- Kalıcılık: 12–18 ay (yıllık yenileme ile korunur)
- Uygulama süresi: ~90 dakika (ilk seans)
- Rötuş: 4–6 hafta sonra

## Fiyatlar (${LAST_UPDATED}, Ankara)
${priceLines}
Not: ${pricing.note}

## Önemli sayfalar
- [Anasayfa](${u("/")}): Mikroblading Ankara genel bilgi
- [Mikroblading nedir & nasıl yapılır](${u("/mikroblading-nasil-yapilir")}): adım adım işlem ve iyileşme
- [Fiyatlar](${u("/mikroblading-fiyatlari")}): güncel fiyat listesi
- [Galeri](${u("/galeri")}): öncesi & sonrası
- [Blog](${u("/blog")}): mikroblading rehberleri
- [S.S.S.](${u("/sss")}): sıkça sorulan sorular
- [Hakkımızda](${u("/hakkimizda")}): deneyim ve hijyen
- [İletişim](${u("/iletisim")}): randevu, adres, telefon

## API
- [API dokümantasyonu](${u("/api-docs")})
- [OpenAPI şeması](${u("/openapi.yaml")})
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
