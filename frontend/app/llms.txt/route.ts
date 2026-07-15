import { formatHours, getSettings, SETTINGS_FALLBACK } from "@/lib/content";
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
- [Kaş Laminasyonu Ankara](${u("/hizmetler/kas-laminasyon")}): İğnesiz kaş şekillendirme, yaklaşık 6 hafta etkili.
- [Kirpik Lifting Ankara](${u("/hizmetler/kirpik-lifting")}): Lash lift; kendi kirpiklerini kıvırır, yaklaşık 6–8 hafta kalıcı.

## Önemli sayfalar
- [Sıkça Sorulan Sorular](${u("/sss")}): Tüm hizmetler ve stüdyo hakkında sık sorulan sorular.
- [Blog](${u("/blog")}): Kalıcı makyaj, kaş ve kirpik rehberleri.
- [Galeri](${u("/galeri")}): Stria Studio çalışma örnekleri.
- [İletişim](${u("/iletisim")}): Randevu, konum, telefon ve çalışma saatleri.

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
