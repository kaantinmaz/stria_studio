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

> Ankara Çankaya'da kişiye özel, kalıcı kaş tasarımı yapan güzellik stüdyosu. Yüz simetrisi ve altın oran ölçümüne göre belirlenen kaş formu, kıl tekniğiyle tek tek işlenir; sonuç doğal ve 12–18 ay kalıcıdır. Son güncelleme: ${LAST_UPDATED}.

## Hizmet
- Hizmet: Kişiye özel kalıcı kaş tasarımı (kıl tekniği)
- Konum: Çankaya, Ankara, Türkiye
- Kalıcılık: 12–18 ay (yıllık yenileme ile korunur)
- Uygulama süresi: ~90 dakika (ilk seans)
- Rötuş: 4–6 hafta sonra (paketlere dahil)

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

## Kaş tasarımı rehberi
- [Kaş tasarımı nedir](${u("/kas-tasarimi-nedir")}): tanım, altın oran, kıl tekniği
- [Kaş tasarımı kalıcı mı](${u("/kas-tasarimi-kalici-mi")}): 12–18 ay kalıcılık, yenileme
- [Acır mı & iyileşme süreci](${u("/kas-tasarimi-iyilesme-sureci")}): konfor, 7–10 gün iyileşme
- [Kaş tasarımı bakımı](${u("/kas-tasarimi-bakimi")}): öncesi & sonrası bakım
- [Erkek kaş tasarımı Ankara](${u("/erkek-kas-tasarimi-ankara")}): erkeklere özel doğal form
- [Seyrek kaşlar için kaş tasarımı](${u("/seyrek-kaslar-kas-tasarimi")}): seyrek/dökük kaş dolgusu
- [Çankaya kaş tasarımı](${u("/cankaya-kas-tasarimi")}): konum ve ulaşım
- [Kızılay kaş tasarımı](${u("/kizilay-kas-tasarimi")}): Kızılay'dan erişim

## API
- [API dokümantasyonu](${u("/api-docs")})
- [OpenAPI şeması](${u("/openapi.yaml")})
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
