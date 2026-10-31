// Kaş laminasyonu ve kirpik lifting sayfalarının üst bölümü: görsel yerine
// yan yana oynayan sessiz Stria çekimleri + güven satırı ve kısa öne çıkanlar.
// Videolar `Stria Videos/` kaynaklarından 540p, sessiz, faststart olarak
// üretildi (video2 başka stüdyonun çekimi — asla kullanılmaz).
// Öne çıkanlar `serviceDetails.ts` gerçekleriyle birebir.

export type HeroVideo = { src: string; poster: string; label: string };

// Şeridin ilk kartı: adım adım SVG anlatım (bkz. ProcessAnimation.tsx).
// `steps` sırası sahnedeki eşit süreli fazlarla birebir eşleşir.
export type ProcessAnimationData = {
  kind: "kas-laminasyon" | "kirpik-lifting" | "kamuflaj";
  // Yalnızca kamuflaj: sahnede çizilen kusur (bkz. process-scenes/Kamuflaj.tsx).
  variant?: KamuflajVariant;
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

// Kamuflaj 1. adımı: kusura özel analiz cümlesi; 2–5 tüm varyantlarda aynı (kamuflajAnimation).
// SERVICE_HERO bunu modül yüklenirken kullandığı için ondan önce tanımlı olmalı.
const KAMUFLAJ_ANALYSIS: Record<KamuflajVariant, string> = {
  iz: "Cilt ve iz yapısı değerlendirilir",
  catlak: "Çatlakların yapısı ve cilt tonu incelenir",
  vitiligo: "Vitiligo alanları ve çevre ton incelenir",
  yanik: "Yanık izinin dokusu ve sınırları değerlendirilir",
  ameliyat: "Ameliyat izinin iyileşmesi ve dokusu kontrol edilir",
  yara: "Yara izinin yapısı ve derinliği değerlendirilir",
  jilet: "Jilet izlerinin yönü ve dokusu incelenir",
  sezaryen: "Sezaryen izinin hattı ve iyileşmesi kontrol edilir",
  "dogum-lekesi": "Doğum lekesinin rengi ve sınırları incelenir",
  leke: "Lekelerin dağılımı ve tonu analiz edilir",
  kararma: "Kararan bölge ve çevre ton analiz edilir",
  sivilce: "Sivilce izlerinin derinliği ve dağılımı incelenir",
  dovme: "Dövmenin mürekkep rengi ve yoğunluğu incelenir",
  "goz-alti": "Göz altı morluğunun tonu ve yayılımı incelenir",
  rosacea: "Kızarıklık alanları ve kılcal yapı incelenir",
  "gunes-lekesi": "Güneş lekelerinin dağılımı ve tonu analiz edilir",
  kilcal: "Kılcal damarların yayılımı değerlendirilir",
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
    // Süreçle birebir: analiz + silikon kalıp → temizlik, göz altı koruması, sarma →
    // Lifting / Neutralising Cream → Lashbrow vitamin bakımı ve Hydrating Serum.
    animation: {
      kind: "kirpik-lifting",
      kicker: "Nasıl uygulanır?",
      label: "Kirpik lifting adım adım animasyon",
      seconds: 15,
      steps: [
        "Kirpik analizi ve silikon kalıp seçimi",
        "Temizlik, göz altı koruması, kalıba sarma",
        "Lifting Cream kirpikleri kalıp üzerinde kıvırır",
        "Neutralising Cream kıvrımı sabitler",
        "Vitamin bakımı ve serum: kökten kıvrık kirpikler",
      ],
    },
  },
  // Video yok: şeritte yalnızca animasyon kartı. Öne çıkanlar process_tr (DB) ile birebir:
  // Ön görüşme → Renk analizi + test → Steril uygulama 1–3 saat → İyileşme ve seans süreci (renk 4–6 haftada oturur, en az 3 seans).
  "kamuflaj-makyaj": {
    videos: [],
    highlights: ["Size özel pigment karışımı", "1–3 saat", "Renk 4–6 haftada oturur"],
    animation: kamuflajAnimation("iz", "Kamuflaj makyaj"),
  },
};

// Kamuflaj alt sayfaları: her biri kendi kusurunu çizen sahne varyantı; listede olmayan alt sayfa "iz".
export type KamuflajVariant =
  | "iz"
  | "catlak"
  | "vitiligo"
  | "yanik"
  | "ameliyat"
  | "yara"
  | "jilet"
  | "sezaryen"
  | "dogum-lekesi"
  | "leke"
  | "kararma"
  | "sivilce"
  | "dovme"
  | "goz-alti"
  | "rosacea"
  | "gunes-lekesi"
  | "kilcal";

export const KAMUFLAJ_SUB_VARIANT: Record<string, KamuflajVariant> = {
  "catlak-gizleme": "catlak",
  "vitiligo-kamuflaji": "vitiligo",
  "yanik-izi-kapatma": "yanik",
  "ameliyat-izi-kapatma": "ameliyat",
  "yara-izi-kapatma": "yara",
  "jilet-ve-faca-izi-kapatma": "jilet",
  "sezaryen-izi-kapatma": "sezaryen",
  "dogum-lekesi-kapatma": "dogum-lekesi",
  "leke-pigment-kamuflaji": "leke",
  "bolgesel-kararma-kamuflaji": "kararma",
  "sivilce-izi-kapatma": "sivilce",
  "dovme-kapatma": "dovme",
  "goz-alti-morluk-kapatma": "goz-alti",
  "rosacea-kapatma": "rosacea",
  "gunes-lekesi-kapatma": "gunes-lekesi",
  "kilcal-damar-kapatma": "kilcal",
};

export function kamuflajAnimation(variant: KamuflajVariant, name: string): ProcessAnimationData {
  return {
    kind: "kamuflaj",
    variant,
    kicker: "Nasıl uygulanır?",
    label: `${name} adım adım animasyon`,
    seconds: 15,
    steps: [
      KAMUFLAJ_ANALYSIS[variant],
      "Cilt tonu ve alt tonu analiz edilerek kişiye özel pigment hazırlanır",
      "Küçük bir alanda test uygulaması",
      "Steril, tek kullanımlık ekipmanla uygulama",
      "Pigment 4–6 haftada oturur, en az 3 seans uygulanarak renk eşitliği hedeflenir",
    ],
  };
}
