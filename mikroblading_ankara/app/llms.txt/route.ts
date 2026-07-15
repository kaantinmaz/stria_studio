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
- [Kalıcı kaş Ankara](${u("/kalici-kas-ankara")}): kalıcı kaş teknikleri, fiyatlar ve doğru teknik seçimi
- [Kaş pudralama Ankara](${u("/kas-pudralama-ankara")}): powder brows, yağlı ciltler için alternatif, 1–3 yıl kalıcılık
- [Mikroblading mi kaş pudralama mı](${u("/mikroblading-mi-kas-pudralama-mi")}): iki tekniğin karşılaştırma tablosu ve hangi cilt tipine hangisi
- [Mikroblading sonrası bakım](${u("/mikroblading-sonrasi-bakim")}): gün gün iyileşme süreci ve bakım kuralları
- [Mikroblading zararlı mı](${u("/mikroblading-zararli-mi")}): riskler, güvenlik önlemleri ve kontrendikasyonlar
- [Mikroblading öncesi hazırlık](${u("/mikroblading-oncesi-hazirlik")}): randevu öncesi yapılması ve kaçınılması gerekenler
- [Eski kalıcı kaş düzeltme](${u("/eski-kalici-kas-duzeltme")}): eski pigment üzerine mikroblading, renk düzeltme ve kapsam değerlendirmesi
- [Kaş kontürü Ankara](${u("/kas-konturu-ankara")}): kalıcı kaş kontürü nedir, hangi teknikle yapılır, laminasyon/boyama farkı
- [Çankaya mikroblading](${u("/cankaya-mikroblading")}): Çankaya stüdyo konumu, ulaşım ve rötuş ziyaretleri
- [Kızılay mikroblading](${u("/kizilay-mikroblading")}): Kızılay'dan metro, otobüs ve dolmuş bağlantılarıyla ulaşım
- [Keçiören mikroblading](${u("/kecioren-mikroblading")}): Keçiören'den Çankaya stüdyoya ulaşım ve randevu planlama
- [Çayyolu & Ümitköy mikroblading](${u("/cayyolu-mikroblading")}): batı koridorundan M2 metro ve araçla ulaşım rehberi
- [Erkek mikroblading Ankara](${u("/erkek-mikroblading-ankara")}): doğal erkek kaş formu, kıl tekniği ve mahremiyet
- [Seyrek kaşlar için mikroblading](${u("/seyrek-kaslar-mikroblading")}): seyrek kaş, kaş dökülmesi ve kıl tekniği uygunluğu
- [Galeri](${u("/galeri")}): öncesi & sonrası
- [Blog](${u("/blog")}): mikroblading rehberleri
- [S.S.S.](${u("/sss")}): sıkça sorulan sorular
- [Hakkımızda](${u("/hakkimizda")}): deneyim ve hijyen
- [İletişim](${u("/iletisim")}): randevu, adres, telefon

## Bağlantılı siteler
- [Stria Studio](https://striastudio.com.tr): ana stüdyo sitesi — Ankara Çankaya'da tüm kalıcı makyaj hizmetleri.
- [Kaş Tasarımı Ankara](https://kastasarimiankara.com): kişiye özel kaş tasarımı rehber sitemiz.

## API
- [API dokümantasyonu](${u("/api-docs")})
- [OpenAPI şeması](${u("/openapi.yaml")})
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
