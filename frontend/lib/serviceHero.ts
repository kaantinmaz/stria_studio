// Kaş laminasyonu ve kirpik lifting sayfalarının üst bölümü: görsel yerine
// yan yana oynayan sessiz Stria çekimleri + güven satırı ve kısa öne çıkanlar.
// Videolar `Stria Videos/` kaynaklarından 540p, sessiz, faststart olarak
// üretildi (video2 başka stüdyonun çekimi — asla kullanılmaz).
// Öne çıkanlar `serviceDetails.ts` gerçekleriyle birebir.

export type HeroVideo = { src: string; poster: string; label: string };

export type ServiceHero = {
  videos: HeroVideo[];
  highlights: string[];
};

const v = (name: string, label: string): HeroVideo => ({
  src: `/videos/hizmet/${name}.mp4`,
  poster: `/videos/hizmet/${name}.jpg`,
  label,
});

export const SERVICE_HERO: Record<string, ServiceHero> = {
  "kas-laminasyon": {
    videos: [
      v("kas-1", "Kaş laminasyonu: kıllar yukarı taranıyor"),
      v("kas-2", "Kaş laminasyonu sonrası düzenli kaşlar"),
      v("kas-3", "Kaş laminasyonu uygulaması"),
      v("kas-4", "Kaş laminasyonu adım adım"),
    ],
    highlights: ["İğnesiz, pigmentsiz", "45–60 dakika", "Ortalama 6 hafta"],
  },
  "kirpik-lifting": {
    videos: [
      v("kirpik-1", "Kirpik lifting sonrası kıvrık kirpikler"),
      v("kirpik-2", "Kirpik lifting uygulaması"),
    ],
    highlights: ["Takma kirpik yok", "45–60 dakika", "6–8 hafta"],
  },
};
