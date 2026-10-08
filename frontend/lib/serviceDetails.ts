// Hizmet sayfalarındaki yapılandırılmış bloklar (kısa bilgiler, uygunluk,
// karşılaştırma, rehber yazıları). API'de karşılığı olmayan, AI motorlarının
// doğrudan alıntılayabileceği veriler burada tutulur; slug yoksa bloklar gizlenir.
// Rakamlar sitedeki mevcut içerikle (hizmet kaydı + blog yazıları) tutarlı olmalı.

export type ServiceDetails = {
  /** İçeriğin son gözden geçirildiği tarih (YYYY-MM-DD); sayfada ve şemada görünür. */
  updated: string;
  facts: { label: string; value: string }[];
  suitable: string[];
  postpone: string[];
  comparison?: {
    caption: string;
    columns: string[];
    rows: { label: string; values: string[] }[];
  };
  /** Konu kümesindeki blog yazıları; yayında olmayanlar otomatik atlanır. */
  guides: string[];
};

export const SERVICE_DETAILS: Record<string, ServiceDetails> = {
  "kas-laminasyon": {
    updated: "2026-10-08",
    facts: [
      { label: "Seans süresi", value: "45–60 dakika" },
      { label: "Etki süresi", value: "Ortalama 6 hafta (kişiye göre 4–8 hafta)" },
      { label: "Yöntem", value: "İğnesiz ve pigmentsiz; kendi kaş kıllarınız şekillendirilir" },
      { label: "Acı", value: "Beklenmez; solüsyon sırasında hafif gerginlik hissedilebilir" },
      { label: "Ürün", value: "My Lamination — İtalya üretimi, vegan, T.C. Sağlık Bakanlığı'na kayıtlı" },
      { label: "Uygulayan", value: "Nilsu Kamişli, sertifikalı My Lamination uzmanı" },
      { label: "Aynı seansta", value: "İsteğe bağlı kaş boyama (tint) ve besleyici bakım" },
      { label: "Ön görüşme", value: "Ücretsiz, yüz analiziyle" },
    ],
    suitable: [
      "Dağınık büyüyen ya da farklı yönlere yatan kaşlar",
      "Kılı olan ama seyrek görünen kaşlar",
      "Her sabah kaş jeli veya sabitleyiciyle uğraşmak istemeyenler",
      "Kalıcı makyaja geçmeden doğal ve geçici bir sonuç isteyenler",
    ],
    postpone: [
      "Hamilelik ve emzirme dönemi",
      "Kaş bölgesinde aktif tahriş, yara veya göz çevresinde enfeksiyon",
      "Bilinen alerji öyküsü ya da çok hassas cilt (önce ön değerlendirme yapılır)",
      "Yakın zamanda kaş bölgesine yapılmış boya veya başka bir kimyasal işlem",
      "Kılın hiç olmadığı boşluklar: laminasyon boşluk doldurmaz",
    ],
    comparison: {
      caption: "Kaş laminasyonu, microblading ve kaş pudralama karşılaştırması",
      columns: ["Kaş laminasyonu", "Microblading", "Kaş pudralama"],
      rows: [
        {
          label: "Ne yapar?",
          values: [
            "Kendi kıllarınızı yukarı şekillendirip sabitler",
            "Pigmentle tek tek kıl çizer",
            "Noktalama tekniğiyle pudra etkisi verir",
          ],
        },
        { label: "Pigment / iğne", values: ["Yok", "Var", "Var"] },
        { label: "Kalıcılık", values: ["4–8 hafta", "12–18 ay", "1,5–2 yıl"] },
        { label: "Boşluk doldurur mu?", values: ["Hayır", "Evet", "Evet"] },
        {
          label: "Kimler için?",
          values: [
            "Kılı yeterli ama dağınık kaşlar",
            "Boşluklu kaşta doğal kıl görünümü isteyenler",
            "Makyajlı, dolgun görünüm isteyenler; yağlı ciltler",
          ],
        },
      ],
    },
    guides: [
      "kas-laminasyonu-nedir-ne-kadar-kalici",
      "kas-laminasyonu-kimlere-uygun",
      "kas-laminasyonu-bakimi",
      "evde-kas-laminasyonu-riskleri",
      "kas-laminasyonu-mu-microblading-mi",
      "kas-pudralama-mi-kas-laminasyonu-mu",
    ],
  },
};
