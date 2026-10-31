// Kaş laminasyonu ve kirpik lifting sayfalarının üst bölümü: görsel yerine
// yan yana oynayan sessiz Stria çekimleri + güven satırı ve kısa öne çıkanlar.
// Videolar `Stria Videos/` kaynaklarından 540p, sessiz, faststart olarak
// üretildi (video2 başka stüdyonun çekimi — asla kullanılmaz).
// Öne çıkanlar `serviceDetails.ts` gerçekleriyle birebir.

export type HeroVideo = { src: string; poster: string; label: string };

// Şeridin ilk kartı: adım adım SVG anlatım (bkz. ProcessAnimation.tsx).
// `steps` sırası sahnedeki eşit süreli fazlarla birebir eşleşir.
export type ProcessAnimationData = {
  kind: "kas-laminasyon";
  kicker: string;
  label: string;
  seconds: number;
  steps: string[];
};

export type ServiceHero = {
  videos: HeroVideo[];
  highlights: string[];
  animation?: ProcessAnimationData;
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
    // process_tr ile birebir: analiz → Cleansing Foam → Lifting / Neutralising Cream → vitamin bakımı.
    animation: {
      kind: "kas-laminasyon",
      kicker: "Nasıl uygulanır?",
      label: "Kaş laminasyonu adım adım animasyon",
      seconds: 15,
      steps: [
        "Kaş analizi ve şekil planı",
        "Cleansing Foam ile temizlik",
        "Lifting Cream kılları yumuşatır, yukarı taranır",
        "Neutralising Cream şekli sabitler",
        "Vitamin bakımı: düzenli, dolgun kaşlar",
      ],
    },
  },
  "kirpik-lifting": {
    videos: [
      v("kirpik-1", "Kirpik lifting sonrası kıvrık kirpikler"),
      v("kirpik-2", "Kirpik lifting uygulaması"),
    ],
    highlights: ["Takma kirpik yok", "45–60 dakika", "6–8 hafta"],
  },
};
