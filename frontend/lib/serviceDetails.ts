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
  "kirpik-lifting": {
    updated: "2026-10-08",
    facts: [
      { label: "Seans süresi", value: "45–60 dakika" },
      { label: "Etki süresi", value: "6–8 hafta; kirpikler yenilendikçe kendiliğinden azalır" },
      { label: "Yöntem", value: "Kendi kirpikleriniz silikon kalıpla kökten kıvrılır; takma kirpik ve yapıştırıcı yok" },
      { label: "Diğer adları", value: "Kirpik laminasyonu, kirpik perması, lash lift" },
      { label: "Ürün", value: "My Lamination — İtalya üretimi, vegan, T.C. Sağlık Bakanlığı'na kayıtlı" },
      { label: "Uygulayan", value: "Nilsu Kamişli, sertifikalı My Lamination uzmanı" },
      { label: "Aynı seansta", value: "İsteğe bağlı kirpik boyama ve besleyici bakım; kaş laminasyonu da eklenebilir" },
      { label: "Seans aralığı", value: "En az 6 hafta" },
    ],
    suitable: [
      "Düz uzayan ya da aşağı bakan kirpikler",
      "Yeterli uzunlukta kendi kirpiği olanlar",
      "Her sabah kirpik kıvırıcı ve maskarayla uğraşmak istemeyenler",
      "İpek kirpiğin dolum ve bakım temposunu istemeyenler",
    ],
    postpone: [
      "Gözde kaşıntı, kızarıklık, şişlik veya enfeksiyon",
      "Göz rahatsızlığı, yakın tarihli göz cerrahisi ya da düzenli göz ilacı kullanımı (önceden bildirilmeli)",
      "Hamilelik ve emzirme dönemi (önceden bildirilmeli)",
      "Alerji öyküsü: uygulamadan 24–48 saat önce kol içine test yapılır",
      "Son 6 hafta içinde lifting veya perma yapılmış kirpikler",
    ],
    comparison: {
      caption: "Kirpik lifting ve ipek kirpik karşılaştırması",
      columns: ["Kirpik lifting", "İpek kirpik"],
      rows: [
        {
          label: "Ne yapar?",
          values: ["Kendi kirpiğinizi kökten kıvırır", "Kirpiklere tel tel sentetik kirpik yapıştırılır"],
        },
        { label: "Kalıcılık", values: ["6–8 hafta, kendiliğinden düzelir", "2–3 haftada bir dolum gerekir"] },
        { label: "Görünüm", values: ["Doğal, kalkık ve açık bakış", "Daha uzun, hacimli ve belirgin"] },
        {
          label: "Günlük bakım",
          values: ["Gerekmez; kirpik serumu önerilir", "Dikkatli temizlik, sürtünmeden kaçınma"],
        },
        {
          label: "Kimler için?",
          values: ["Kirpiği yeterince uzun ama düz olanlar", "Uzunluk ve hacim isteyenler"],
        },
      ],
    },
    guides: [
      "kirpik-lifting-nedir-kimlere-uygun",
      "kirpik-lifting-zararli-mi",
      "kirpik-lifting-sonrasi-bakim",
      "kirpik-lifting-mi-ipek-kirpik-mi",
    ],
  },
  "kamuflaj-makyaj": {
    updated: "2026-10-08",
    facts: [
      { label: "Uygulama türü", value: "Kamuflaj (kalıcı makyaj) uygulaması; medikal işlem değildir, tedavi yerine geçmez" },
      { label: "Amaç", value: "İzi yok etmek değil, çevre ciltle ton farkını belirgin şekilde azaltmak" },
      { label: "Seans süresi", value: "Bölgenin büyüklüğüne göre 1–3 saat" },
      { label: "Seans sayısı", value: "Genellikle birden fazla; ilk seanstan sonra rötuş planlanır" },
      { label: "Rengin oturması", value: "4–6 hafta" },
      { label: "Kalıcılık", value: "Uzun süreli (yarı kalıcı); renk zamanla açılabilir, rötuşla korunur" },
      { label: "Pigment", value: "Cilt tonunuza göre hazırlanan karışım; önce küçük bir alanda test edilir" },
      { label: "Ön görüşme", value: "Ücretsiz ve gizli" },
    ],
    suitable: [
      "İyileşmesini tamamlamış, rengi açılmış çatlaklar",
      "Olgunlaşmış ameliyat, sezaryen, yara ve yanık izleri",
      "İyileşmiş jilet ve faça izleri",
      "Vitiligo, doğum lekesi gibi ton farkları (uygunluk ön görüşmede değerlendirilir)",
    ],
    postpone: [
      "Hamilelik ve emzirme dönemi",
      "Bölgede açık yara, aktif iltihap veya enfeksiyon",
      "Henüz iyileşmesini tamamlamamış, kırmızı veya mor izler (sezaryen ve ameliyat izlerinde genellikle en az 1 yıl beklenir)",
      "Kabarık veya keloid yapıdaki izler: pigment ton farkını azaltır, dokuyu düzeltmez",
      "İyileşmeyi etkileyen bir sağlık durumu varsa önce ön değerlendirme yapılır",
    ],
    comparison: {
      caption: "Kamuflaj makyaj ve günlük kapatıcı makyaj karşılaştırması",
      columns: ["Kamuflaj makyaj", "Günlük kapatıcı makyaj"],
      rows: [
        {
          label: "Nasıl yapılır?",
          values: ["Pigment cildin üst katmanına işlenir", "Kapatıcı ürün her gün cilde sürülür"],
        },
        { label: "Kalıcılık", values: ["Uzun süreli, rötuşla korunur", "Gün sonunda temizlenir"] },
        { label: "Su ve tere dayanım", values: ["Dayanıklı", "Su, ter ve sürtünmeyle akabilir"] },
        { label: "Günlük uğraş", values: ["Yok", "Her gün yeniden uygulanır"] },
        {
          label: "Kimler için?",
          values: ["Uzun süreli bir ton dengesi isteyenler", "Geçici ya da ara sıra kapatmak isteyenler"],
        },
      ],
    },
    guides: ["kamuflaj-makyaj-nedir-iz-catlak-kapatma", "sezaryen-izi-silme"],
  },
};
