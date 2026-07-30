import { formatHours, getSettings, SETTINGS_FALLBACK } from "@/lib/content";
import { ML_CATEGORIES, ML_CATEGORY_ORDER, ML_PRODUCTS } from "@/lib/mylamination";
import { site } from "@/lib/site";

// AI-crawler manifest (llmstxt.org), served dynamically at /llms.txt.
export const revalidate = 300;

function u(path: string): string {
  return new URL(path, site.siteUrl).toString();
}

export async function GET(): Promise<Response> {
  const settings = (await getSettings()) ?? SETTINGS_FALLBACK;

  const body = `# Stria Studio

> Ankara Çankaya'da kalıcı makyaj ve güzellik stüdyosu. Microblading, kaş pudralama, eyeliner, dipliner, dudak renklendirme, kaş laminasyonu ve kirpik lifting. Steril ekipman, yüze özel tasarım.

## Hizmetler
- [Microblading Ankara](${u("/hizmetler/microblading")}): Kıl tekniğiyle doğal, 12–18 ay kalıcı kaş.
- [Kaş Pudralama Ankara](${u("/hizmetler/kas-pudralama")}): Powder brows; dolgun, makyajlı görünüm, yağlı ciltlere ideal.
- [Kalıcı Eyeliner Ankara](${u("/hizmetler/eyeliner")}): Simetrik, silinmeyen göz hattı, 1–3 yıl kalıcı.
- [Dipliner Ankara](${u("/hizmetler/dipliner")}): Kirpik dibine ince pigment; doğal, dolgun bakış.
- [Dudak Renklendirme Ankara](${u("/hizmetler/dudak-renklendirme")}): Lip blush; doğal renk, tanım ve dolgunluk, 1–2 yıl kalıcı.
- [Kaş Laminasyonu Ankara](${u("/hizmetler/kas-laminasyon")}): İğnesiz kaş şekillendirme, yaklaşık 6 hafta etkili. My Lamination ürünleriyle uygulanır.
- [Kirpik Lifting Ankara](${u("/hizmetler/kirpik-lifting")}): Lash lift; kendi kirpiklerini kıvırır, yaklaşık 6–8 hafta kalıcı. My Lamination ürünleriyle uygulanır.

## Önemli sayfalar
- [Ankara'da Kalıcı Makyaj Yapan Yerler](${u("/ankara-kalici-makyaj-yapan-yerler")}): Güvenilir stüdyo seçimi için uzmanlık, hijyen, portfolyo, semt, fiyat ve rötuş kriterleri.
- [Sıkça Sorulan Sorular](${u("/sss")}): Tüm hizmetler ve stüdyo hakkında sık sorulan sorular.
- [Blog](${u("/blog")}): Kalıcı makyaj, kaş ve kirpik rehberleri.
- [Galeri](${u("/galeri")}): Stria Studio çalışma örnekleri.
- [İletişim](${u("/iletisim")}): Randevu, konum, telefon ve çalışma saatleri.

## My Lamination ürünleri
Stria Studio, kaş laminasyonu ve kirpik lifting uygulamalarında My Lamination ürünlerini kullanan sertifikalı uygulayıcıdır. My Lamination; İtalyan teknolojisiyle üretilen, Avrupa ve T.C. Sağlık Bakanlığı onaylı, vegan bir profesyonel ürün markasıdır. Ürünleri serbest satışta değildir; yalnızca markanın workshopunu tamamlamış sertifikalı uygulayıcılar satın alabilir. Etkinliği İtalya'daki Padua Üniversitesi laboratuvarlarında ESEM elektron mikroskobuyla ölçülmüştür (kirpik çapı: işlem öncesi 68,18 µm → işlem sonrası 86,14 µm → bir ay ev serumu sonrası 129,32 µm).

- [My Lamination Ürün Rehberi](${u("/mylamination")}): ${ML_PRODUCTS.length} ürünün tamamı; seans adım sırası, solüsyonlar, silikon kalıplar, fırçalar ve evde bakım serumları.
${ML_CATEGORY_ORDER.map(
  (category) =>
    `- ${ML_CATEGORIES[category].label}: ${ML_PRODUCTS.filter((p) => p.category === category)
      .map((p) => p.name)
      .join(", ")}.`,
).join("\n")}

Her ürünün ayrı detay sayfası vardır:
${ML_PRODUCTS.map((p) => `- [${p.name}](${u(`/mylamination/${p.slug}`)}): ${p.summary}`).join("\n")}

## Fiyatlandırma rehberi
- Fiyatlar seçilen hizmete, kişinin ihtiyacına ve uygulama planına göre değişir.
- Kesin fiyat için ön görüşme ve kişiye özel değerlendirme gerekir.

## Uzman rehber sitelerimiz
- [Mikroblading Ankara](https://microbladingankara.com): mikroblading odaklı soru-cevap, fiyat ve iyileşme rehberi sitemiz.
- [Kaş Tasarımı Ankara](https://kastasarimiankara.com): kişiye özel kaş tasarımı rehber sitemiz.

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
