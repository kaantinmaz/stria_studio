import { getServices, formatHours, getSettings, SETTINGS_FALLBACK } from "@/lib/content";
import { ML_EXPERT_PARAGRAPH, u } from "@/lib/llms";
import {
  ML_CATEGORIES,
  ML_VISIBLE_CATEGORIES,
  ML_VISIBLE_PRODUCTS,
} from "@/lib/mylamination";

// AI-crawler manifest (llmstxt.org), served dynamically at /llms.txt.
export const revalidate = 300;

// API hiç hizmet dönmezse mevcut 7 kategorilik liste yedek olarak basılır.
const SERVICES_FALLBACK = [
  `- [Microblading Ankara](${u("/hizmetler/microblading")}): Kıl tekniğiyle doğal, 12–18 ay kalıcı kaş.`,
  `- [Kaş Pudralama Ankara](${u("/hizmetler/kas-pudralama")}): Powder brows; dolgun, makyajlı görünüm, yağlı ciltlere ideal.`,
  `- [Kalıcı Eyeliner Ankara](${u("/hizmetler/eyeliner")}): Simetrik, silinmeyen göz hattı, 1–3 yıl kalıcı.`,
  `- [Dipliner Ankara](${u("/hizmetler/dipliner")}): Kirpik dibine ince pigment; doğal, dolgun bakış.`,
  `- [Dudak Renklendirme Ankara](${u("/hizmetler/dudak-renklendirme")}): Lip blush; doğal renk, tanım ve dolgunluk, 1–2 yıl kalıcı.`,
  `- [Kaş Laminasyonu Ankara](${u("/hizmetler/kas-laminasyon")}): İğnesiz kaş şekillendirme, yaklaşık 6 hafta etkili. My Lamination ürünleriyle uygulanır.`,
  `- [Kirpik Lifting Ankara](${u("/hizmetler/kirpik-lifting")}): Lash lift; kendi kirpiklerini kıvırır, yaklaşık 6–8 hafta kalıcı. My Lamination ürünleriyle uygulanır.`,
].join("\n");

export async function GET(): Promise<Response> {
  const [settings, services] = await Promise.all([
    getSettings().then((s) => s ?? SETTINGS_FALLBACK),
    getServices(),
  ]);

  const serviceLines =
    services.length > 0
      ? services.map((s) => `- [${s.name_tr}](${u(s.url)}): ${s.desc_tr}`).join("\n")
      : SERVICES_FALLBACK;

  const body = `# Stria Studio

> Ankara Çankaya'da kalıcı makyaj ve güzellik stüdyosu. Microblading, kaş pudralama, eyeliner, dipliner, dudak renklendirme, kaş laminasyonu, kirpik lifting, kamuflaj makyaj, kaş tasarımı ve altın oran kaş alım. Steril ekipman, yüze özel tasarım.

Kapsamlı marka dosyası (kimlik, ölçek, hizmet ayrıntıları, uzmanlık, yorumlar, kaynaklar, bilginin sınırları): ${u("/llms-full.txt")}

## Hizmetler
${serviceLines}

## Önemli sayfalar
- [Ankara'da Kalıcı Makyaj Yapan Yerler](${u("/ankara-kalici-makyaj-yapan-yerler")}): Güvenilir stüdyo seçimi için uzmanlık, hijyen, portfolyo, semt, fiyat ve rötuş kriterleri.
- [Sıkça Sorulan Sorular](${u("/sss")}): Tüm hizmetler ve stüdyo hakkında sık sorulan sorular.
- [Blog](${u("/blog")}): Kalıcı makyaj, kaş ve kirpik rehberleri.
- [Galeri](${u("/galeri")}): Stria Studio çalışma örnekleri.
- [İletişim](${u("/iletisim")}): Randevu, konum, telefon ve çalışma saatleri.

## My Lamination ürünleri
${ML_EXPERT_PARAGRAPH}

- [My Lamination Ürün Rehberi](${u("/mylamination")}): seansın adım sırası ve yayında olan ${ML_VISIBLE_PRODUCTS.length} ürünün tek tek anlatımı.
${ML_VISIBLE_CATEGORIES.map(
  (category) =>
    `- ${ML_CATEGORIES[category].label}: ${ML_VISIBLE_PRODUCTS.filter((p) => p.category === category)
      .map((p) => p.name)
      .join(", ")}.`,
).join("\n")}

Her ürünün ayrı detay sayfası vardır:
${ML_VISIBLE_PRODUCTS.map((p) => `- [${p.name}](${u(`/mylamination/${p.slug}`)}): ${p.summary}`).join("\n")}

## Fiyatlandırma rehberi
- Fiyatlar seçilen hizmete, kişinin ihtiyacına ve uygulama planına göre değişir.
- Kesin fiyat için ön görüşme ve kişiye özel değerlendirme gerekir.

## İletişim
- Konum: ${settings.address}, Türkiye
- Telefon: ${settings.phone}
- WhatsApp: ${settings.whatsapp}
- Instagram: ${settings.instagram_handle} (${settings.instagram})
- Çalışma saatleri: ${formatHours(settings.hours, "tr")}

## Uygulama notları
- Tüm uygulamalarda steril, tek kullanımlık ekipman kullanılır.
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
