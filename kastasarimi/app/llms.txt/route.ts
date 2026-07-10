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

  const body = `# Kaş Tasarımı Ankara — Stria Studio

> Ankara Çankaya'da kaş tasarımı yapan güzellik stüdyosu: altın oran ile kaş haritalama, yüze özel form tasarımı, iplik/ağda ile şekillendirme ve isteğe bağlı kaş boyama (henna). Doğal, kalıcı olmayan, düzenli bakımla sürdürülen bir işlemdir. Son güncelleme: ${LAST_UPDATED}.

## Hizmet
- Hizmet: Kaş tasarımı, kaş haritalama, iplik/ağda ile şekillendirme, kaş boyama (henna)
- Konum: Çankaya, Ankara, Türkiye
- Kalıcılık: Şekillendirme kalıcı değildir (3–4 haftada bir bakım); kaş boyama 2–4 hafta
- Uygulama süresi: ~30–45 dakika
- İlgili kalıcı işlemler: microblading, kaş pudralama (ayrı hizmet)

## Fiyatlar (${LAST_UPDATED}, Ankara)
${priceLines}
Not: ${pricing.note}

## Önemli sayfalar
- [Anasayfa](${u("/")}): Kaş Tasarımı Ankara genel bilgi
- [Kaş tasarımı nedir & nasıl yapılır](${u("/kas-tasarimi-nasil-yapilir")}): adım adım süreç
- [Fiyatlar](${u("/kas-tasarimi-fiyatlari")}): güncel fiyat listesi
- [Galeri](${u("/galeri")}): öncesi & sonrası
- [Blog](${u("/blog")}): kaş tasarımı rehberleri
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
