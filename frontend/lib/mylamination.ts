// My Lamination ürün kataloğu — editoryal içerik.
//
// Stria Studio kaş laminasyonu ve kirpik lifting uygulamalarında My Lamination
// (My Lamination Türkiye, Antalya / üretim İtalya) ürünlerini kullanır. Bu modül
// her ürün için özgün Türkçe anlatım, kullanım ve teknik bilgi tutar; kaynak
// üretici sayfası `sourceUrl` ile belirtilir.
//
// İçerik statiktir (DB'ye bağlı değil): tedarikçi kataloğu bizim hizmet
// verimiz değil, referans bilgidir ve editoryal olarak sürdürülür.

export type MlCategory = "uygulama" | "ekipman" | "evde-bakim" | "cilt";

/** Ürünün hangi uygulamada rol aldığı. */
export type MlScope = "kas" | "kirpik" | "ikisi";

export type MlProduct = {
  slug: string;
  name: string;
  category: MlCategory;
  scope: MlScope;
  /** Kart, meta description ve ItemList şemasında kullanılan tek cümlelik özet. */
  summary: string;
  seoTitle: string;
  seoDesc: string;
  keywords: string[];
  /** Detay sayfasının gövde paragrafları. */
  body: string[];
  highlights: string[];
  /** Uygulama ya da evde kullanım adımları. */
  usage?: string[];
  /** Öne çıkan aktif içerikler. */
  ingredients?: string[];
  /** Teknik bilgi tablosu satırları. */
  specs?: [string, string][];
  faq?: { q: string; a: string }[];
  /** public/mylamination altındaki dosya adı. */
  image: string;
  sourceUrl: string;
  inStock: boolean;
};

export const ML_CATEGORIES: Record<
  MlCategory,
  { label: string; blurb: string }
> = {
  uygulama: {
    label: "Uygulama Ürünleri",
    blurb:
      "Kaş laminasyonu ve kirpik lifting seansında stüdyoda kullandığımız solüsyon, bakım ve renklendirme ürünleri. Yalnızca sertifikalı uygulayıcıya satılır; evde kullanıma uygun değildir.",
  },
  ekipman: {
    label: "Ekipman ve Sarf",
    blurb:
      "Kalıp, silikon ped, fırça ve yapıştırıcılar. Sonucun kıvrım açısını ve kılların ayrılmasını belirleyen kısım büyük ölçüde burada seçilen ölçü ve alettir.",
  },
  "evde-bakim": {
    label: "Evde Bakım Ürünleri",
    blurb:
      "Seans arasındaki 6–8 haftayı taşıyan serum ve maskaralar. Laminasyon ya da lifting sonucunun ne kadar süre iyi durduğunu en çok bu adım belirler.",
  },
  cilt: {
    label: "Cilt Bakımı",
    blurb:
      "İşlem öncesi cilt hazırlığı ve sonrasında kaş çevresini koruyan temizleyici, peeling ve güneş koruma ürünleri.",
  },
};

export const ML_BRAND = {
  name: "My Lamination",
  distributorName: "My Lamination Türkiye",
  siteUrl: "https://www.mylamination.com.tr",
  productsUrl: "https://www.mylamination.com.tr/urunler/",
  logo: "/mylamination/logo.png",
  logoMark: "/mylamination/logo-mark.png",
  logoItaly: "/mylamination/logo-italy.png",
} as const;

// My Lamination sertifikası kuruma değil kişiye verilir: workshopu tamamlayan
// uygulayıcı adına düzenlenir. Uzmanlık iddiası bu yüzden stüdyoya değil
// Nilsu Kamişli'ye atfedilir.
export const ML_EXPERT = {
  name: "Nilsu Kamişli",
  role: "Kurucu & Kalıcı Makyaj Uzmanı",
} as const;

// My Lamination ürünleriyle yaptığımız hizmetler. Rozet, ürün bölümü ve kart
// işaretleri bu eşlemeye bakar — yeni bir hizmet eklenirse tek yerden açılır.
export const ML_SERVICE_SCOPE: Record<string, "kas" | "kirpik"> = {
  "kas-laminasyon": "kas",
  "kirpik-lifting": "kirpik",
};

export const ML_PRODUCTS: MlProduct[] = [
  // ---------------------------------------------------------------- uygulama
  {
    slug: "lifting-cream",
    name: "Lifting Cream",
    category: "uygulama",
    scope: "ikisi",
    summary:
      "Laminasyonun birinci adımı: kıl yapısını yumuşatarak yeni kıvrımın veya kaş formunun oluşmasını sağlayan losyon.",
    seoTitle: "My Lamination Lifting Cream Nedir, Nasıl Kullanılır?",
    seoDesc:
      "My Lamination Lifting Cream, kaş laminasyonu ve kirpik liftingin 1. adım solüsyonudur: kıl bağlarını yumuşatır, yeni formu hazırlar. Stria Studio Ankara.",
    keywords: [
      "my lamination lifting cream",
      "kirpik lifting 1. adım solüsyonu",
      "kaş laminasyonu solüsyonu",
      "lifting cream nedir",
      "kirpik lifting ürünleri",
    ],
    body: [
      "Lifting Cream, laminasyon uygulamasının ilk adımıdır. Kıl telinin içindeki bağları geçici olarak yumuşatır; böylece kirpik silikon kalıbın verdiği yeni açıyı, kaş kılı ise taramayla verilen yeni yönü alabilecek hâle gelir. Bu adım olmadan kıl kalıba yatar ama formu tutmaz — şekli mümkün kılan kimyasal iş burada yapılır.",
      "Üreticinin ürün anlatımı kirpik liftingi merkeze alır: ürün yeni bir kirpik kıvrımı oluşturmak için geliştirilmiştir. Aynı solüsyon, My Lamination protokolünde kaş laminasyonunun da birinci adımıdır; fark bekleme süresinde ve ardından uygulanan tarama tekniğindedir.",
      "Ürünün belirleyici özelliği bekleme süresidir. Kıl kalınlığı, önceki işlem geçmişi ve kıl direnci kişiden kişiye değişir; aynı süre herkeste aynı sonucu vermez. İnce ve daha önce yıpranmış kılda süre kısalır, kalın ve dirençli kılda uzar. Süreyi uygulayıcının kılı okuyarak belirlemesi, ürünün kendisinden daha kritiktir.",
      "My Lamination'ın kendi anlatımında ürün, kirpiğe zarar vermeyen bir formülasyonla hızlı etki etmek ve uygulama sırasında müşteri konforunu korumak üzere geliştirilmiştir. Stria Studio'da bu solüsyonu her seansta kaş/kirpik analizinden sonra, kişiye göre belirlenen sürede uygularız.",
    ],
    highlights: [
      "Yeni kıvrımın ve kaş formunun oluşmasını sağlayan 1. adım solüsyonu",
      "Kirpiğe zarar vermeyecek şekilde formüle edilmiş yapı",
      "Uygulaması kontrollü; süre kıl yapısına göre ayarlanır",
      "Kaş laminasyonu ve kirpik liftingde kullanılır",
      "Yalnızca profesyonel kullanım için üretilir",
    ],
    usage: [
      "Kaş ya da kirpikler makyaj ve yağ kalıntısından tamamen arındırılır.",
      "Kirpikte kirpik boyuna uygun silikon kalıp seçilip göz kapağına yerleştirilir; kaşta kıl yönü taranarak planlanır.",
      "Kirpikler kalıp üzerine tek tek ayrılarak sabitlenir.",
      "Lifting Cream kök bölgesinden başlanarak, uca değdirilmeden ince bir tabaka hâlinde uygulanır.",
      "Kıl yapısına göre belirlenen süre beklenir, ardından kalıntı tamamen alınır.",
    ],
    specs: [
      ["Ürün kodu", "ML-LC"],
      ["Adım", "1 — Lifting (kıvırma)"],
      ["Kullanım", "Yalnızca profesyonel"],
    ],
    faq: [
      {
        q: "Lifting Cream evde kullanılabilir mi?",
        a: "Hayır. Ürün yalnızca profesyonel kullanım için üretilir ve My Lamination tarafından yalnızca sertifikalı uygulayıcılara satılır. Bekleme süresinin kirpik yapısına göre ayarlanması gerekir; yanlış süre kirpikte kırılma ve dağınık kıvrım bırakır.",
      },
      {
        q: "Bu solüsyon kirpiği yakar mı?",
        a: "Doğru sürede ve kirpik yapısına uygun uygulandığında yakmaz. Kirpik hasarı genelde üründen değil, süreyi kirpiğe göre ayarlamamaktan veya arka arkaya çok sık işlem yapmaktan kaynaklanır. Bu nedenle iki seans arasında en az 6 hafta bırakılır.",
      },
    ],
    image: "lifting-cream.jpg",
    sourceUrl: "https://www.mylamination.com.tr/lifting-cream/",
    inStock: true,
  },
  {
    slug: "neutralising-cream",
    name: "Neutralising Cream",
    category: "uygulama",
    scope: "ikisi",
    summary:
      "İkinci adım: birinci solüsyonla açılan kıl yapısını kapatarak yeni kıvrımı veya kaş formunu sabitler.",
    seoTitle: "My Lamination Neutralising Cream Ne İşe Yarar?",
    seoDesc:
      "Neutralising Cream, kaş laminasyonu ve kirpik liftingin 2. adımıdır: yumuşatılan kıl yapısını kapatıp yeni formu sabitler. Stria Studio Ankara.",
    keywords: [
      "my lamination neutralising cream",
      "kaş laminasyonu 2. adım",
      "kirpik lifting sabitleyici",
      "neutralising cream nedir",
    ],
    body: [
      "Neutralising Cream, işlemin ikinci adımıdır ve tek görevi ilk solüsyonla açılan kıl yapısını yeniden kapatmaktır. Birinci adım kılı şekil alabilir hâle getirir; ikinci adım o şekli kalıcılaştırır. İkisi bir çift olarak çalışır — nötralizasyon eksik kalırsa kıvrım ya da kaş formu birkaç gün içinde düşer.",
      "Ürün hem kirpikte hem kaşta kullanılır. Kirpikte kıvrımı sabitler; kaşta ise kılın yukarı ve dışa doğru taranmış duruşunu kilitler. My Lamination'ın anlatımına göre formül aynı zamanda kılı yumuşatıp nemlendirir, bu yüzden sabitleme adımı kılı kurutan bir işlem gibi davranmaz.",
      "Uygulamada dikkat edilen nokta, ilk solüsyonun kalıntısının tamamen alınmış olmasıdır. Kalıntı üzerine sabitleyici uygulandığında iki ürün birbirini bozar ve sonuç dengesiz olur. Stria Studio'da her iki adım arasında kirpik ve kaş yüzeyi ayrı ayrı temizlenir.",
    ],
    highlights: [
      "Yeni kıvrımı ve kaş formunu sabitleyen 2. adım",
      "Kirpikte ve kaşta aynı ürün kullanılır",
      "Kılı yumuşatan ve nemlendiren formül",
      "Dağınık, aşağı bakan kaş kıllarına form verir",
    ],
    usage: [
      "1. adım solüsyonunun kalıntısı kuru bir aplikatörle tamamen alınır.",
      "Neutralising Cream kök bölgesinden uca doğru ince bir tabaka hâlinde uygulanır.",
      "1. adımdan kısa olacak şekilde, kıl yapısına göre belirlenen süre beklenir.",
      "Kalıntı temizlenir; ardından bakım ve isteğe bağlı renklendirme adımına geçilir.",
    ],
    specs: [
      ["Ürün kodu", "ML-NC"],
      ["Adım", "2 — Nötralizasyon (sabitleme)"],
      ["Kullanım alanı", "Kirpik ve kaş"],
    ],
    faq: [
      {
        q: "Nötralizasyon adımı atlanabilir mi?",
        a: "Atlanamaz. Birinci solüsyon kıl yapısını açık bırakır; kapatılmadığında kıvrım tutmaz ve kıl açık yapıda kaldığı için daha kırılgan hâle gelir. İki adım tek bir işlemin parçasıdır.",
      },
    ],
    image: "neutralising-cream.jpg",
    sourceUrl: "https://www.mylamination.com.tr/neutralising-cream/",
    inStock: true,
  },
  {
    slug: "hydrating-serum",
    name: "Hydrating Serum",
    category: "uygulama",
    scope: "kirpik",
    summary:
      "Kirpik laminasyonunun son adımı: dokuz bileşenle kütikülü kapatır, kalıntıyı giderir ve kirpiği nemlendirir.",
    seoTitle: "My Lamination Hydrating Serum | Kirpik Laminasyonu 3. Adım",
    seoDesc:
      "Hydrating Serum, kirpik laminasyonunun son adımıdır: hint yağı, aloe vera, kollajen ve keratinle kütikülü kapatır, kirpiği nemlendirir.",
    keywords: [
      "my lamination hydrating serum",
      "kirpik laminasyonu 3. adım",
      "kirpik nemlendirici serum",
      "hydrating serum içeriği",
    ],
    body: [
      "Hydrating Serum, kirpik laminasyonu uygulamasının son aşamasıdır. Üç işi birlikte yapar: kütikülü kapatır, önceki adımlardan kalan kalıntıyı giderir ve kirpiği nemlendirir. Kimyasal adımlardan sonra kirpiğin yüzeyi açık kalır; bu serum o yüzeyi kapatarak işlemin görünür sonucunu — parlaklık ve düzgün duruş — ortaya çıkarır.",
      "Formül doğal kaynaklı bileşen açısından yoğundur. Hidrojene hint yağı, ısırgan otu, büyük ebegümeci çiçeği, aloe vera ve gliserinin yanına kollajen, pantenol, hidrolize keratin ve hidrolize ipek eklenir. Bu dokuz bileşen birlikte çalışarak kirpiğin daha güzel ve sağlıklı görünmesine yardımcı olur.",
      "Seansın sonundaki bu adım, aynı zamanda evde bakımın da mantığını gösterir: kirpik işlemden sonra nem ve besleyici desteğe cevap verir. Stüdyoda bir kez uygulanan bu bakımın karşılığını evde serum kullanımı sürdürür.",
    ],
    highlights: [
      "Kirpik laminasyonunun kapanış adımı",
      "Kütikülü kapatır, kalıntıyı giderir, nemlendirir",
      "Dokuz fonksiyonel bileşenden oluşan formül",
      "İşlem sonrası parlak ve düzgün görünümü ortaya çıkarır",
    ],
    ingredients: [
      "Hidrojene hint yağı — kılı besler ve yumuşatır",
      "Aloe vera — yatıştırıcı, nemlendirici",
      "Isırgan otu ve büyük ebegümeci çiçeği özleri",
      "Kollajen — kıl yüzeyini doldurur",
      "Hidrolize keratin — yapıyı onarır",
      "Hidrolize ipek — parlaklık verir",
      "Pantenol (Pro-vitamin B5) — nemlendirir",
      "Gliserin — nem tutar",
    ],
    specs: [
      ["Ürün kodu", "ML-HS"],
      ["Adım", "3 — Bakım ve kapanış"],
      ["Bileşen sayısı", "9 fonksiyonel bileşen"],
    ],
    image: "hydrating-serum.jpg",
    sourceUrl: "https://www.mylamination.com.tr/hydrating-serum/",
    inStock: true,
  },
  {
    slug: "vitamin-lashbrow",
    name: "Vitamin Lashbrow (Vitaminlashbotox)",
    category: "uygulama",
    scope: "ikisi",
    summary:
      "14 fonksiyonel içerikli kaş ve kirpik bakım kürü; A, B, C, E, F, K vitaminleri, kollajen, keratin ve hyaluronik asit içerir.",
    seoTitle: "Vitamin Lashbrow (Kirpik Botoksu) Nedir, Ne İşe Yarar?",
    seoDesc:
      "My Lamination Vitamin Lashbrow: 14 içerikli kaş-kirpik bakım kürü. A, B, C, E, F, K vitaminleri, kollajen, keratin. Lifting işlemi değildir.",
    keywords: [
      "vitamin lashbrow",
      "vitaminlashbotox",
      "kirpik botoksu nedir",
      "kaş botoksu",
      "my lamination vitamin bakım",
    ],
    body: [
      "Vitamin Lashbrow, halk arasında “kirpik botoksu” veya “kaş botoksu” denen bakım kürüdür. İsim yanıltıcıdır: ürün bir lifting işlemi değildir ve kirpiğe şekil vermez. Yaptığı iş, kıla ihtiyacı olan vitamin ve besleyici desteği tek üründe vermektir. Bu yüzden hem lifting/laminasyon seansının bakım adımı olarak hem de tek başına bir bakım uygulaması olarak kullanılır.",
      "Formül 14 fonksiyonel içerikten oluşur: A, B, C, E, F, K vitaminleri, B5 ve B6 pro-vitaminleri, beş farklı doğal yağ, kollajen, hyaluronik asit, keratin ve gliserin. Üretici, düzenli uygulama sonucunda kirpiklerde yaklaşık %70 oranında kalınlaşma ve dolgunluk gözlendiğini belirtir. Kaşta ise parlak bir görünüm sağlamanın yanında, dökülmüş kaş kıllarının yeniden çıkmasına ve güçlenmesine yardımcı olduğu ifade edilir.",
      "Ürün parafin ve paraben içermez. Bu, gözün hemen yanında çalışan bir üründe önemlidir: kirpik dibi cildin en ince ve en geçirgen bölgelerinden biridir. Stria Studio'da yıpranmış, kırılgan ya da önceki işlemlerden zarar görmüş kirpik ve kaşlarda bu bakımı öncelikle öneririz — bazı durumlarda lifting yapmadan önce birkaç bakım seansı daha doğru bir başlangıç olur.",
    ],
    highlights: [
      "14 fonksiyonel içerikten oluşan bakım kürü",
      "A, B, C, E, F, K vitaminleri + B5 ve B6 pro-vitaminleri",
      "Kollajen, hyaluronik asit, keratin ve 5 doğal yağ",
      "Lifting işlemi değildir; kıla şekil vermez, bakım yapar",
      "Parafin ve paraben içermez",
      "Kaşta dökülen kılların güçlenmesine destek olur",
    ],
    specs: [
      ["Ürün kodu", "ML-VLB"],
      ["Tür", "Bakım kürü (lifting değil)"],
      ["İçerik sayısı", "14 fonksiyonel içerik"],
      ["Kullanım alanı", "Kirpik ve kaş"],
    ],
    faq: [
      {
        q: "Kirpik botoksu ile kirpik lifting aynı şey mi?",
        a: "Değil. Kirpik lifting kirpiğe kalıcı olmayan bir kıvrım verir — görünür şekil değişikliği yaratır. Vitamin Lashbrow ise bakım ürünüdür: kılı besler, güçlendirir ve parlatır, ama kıvırmaz. İkisi aynı seansta birlikte de uygulanabilir.",
      },
      {
        q: "Yıpranmış kirpikte doğrudan lifting yapılabilir mi?",
        a: "Her zaman doğru olmaz. Kirpik çok kırılgansa önce bakım kürüyle güçlendirilmesi, liftingin ise sonraya bırakılması daha iyi sonuç verir. Bunu seans öncesi kirpik analizinde değerlendiririz.",
      },
    ],
    image: "vitamin-lashbrow.jpg",
    sourceUrl: "https://www.mylamination.com.tr/vitamin-lashbrow/",
    inStock: true,
  },
  {
    slug: "mineral-lashbrow",
    name: "Mineral Lashbrow (Minerallashbotox)",
    category: "uygulama",
    scope: "ikisi",
    summary:
      "12 içerikli mineral bakım kürü; bakır, magnezyum, çinko ve kükürtle kirpik dibinden besler.",
    seoTitle: "Mineral Lashbrow (Minerallashbotox) Nedir?",
    seoDesc:
      "My Lamination Mineral Lashbrow: bakır, magnezyum, çinko, kükürt ve alg özleriyle kirpik dibini besleyen 12 içerikli mineral bakım kürü.",
    keywords: [
      "mineral lashbrow",
      "minerallashbotox",
      "kirpik mineral bakımı",
      "kirpik dökülmesi bakımı",
    ],
    body: [
      "Mineral Lashbrow, vitamin kürünün mineral karşılığıdır. 12 farklı içerikle formüle edilir ve etkisini kirpik dibinden gösterir: bakır, magnezyum, çinko, kükürt ve sodyum kirpik dipleri tarafından emilir ve kirpiğin sağlıklı uzamasına destek olur.",
      "Formülde ayrıca alg özleri, tatlı badem yağı, hyaluronik asit ve plankton özü bulunur. Tatlı badem yağı kıla bakım yaparken hyaluronik asit nemi kirpik diplerine hapseder; üretici bunun kopmadan kaynaklanan dökülmelerin önlenmesinde rol oynadığını belirtir.",
      "Vitamin ve mineral kürleri farklı yerden çalışır: vitamin kürü kılı uçtan besler, mineral kürü kökten. My Lamination'ın kendi karşılaştırmasında iki ürünün birlikte kullanımı önerilir. Stria Studio'da hangisinin öne çıkacağına kirpik ve kaşın mevcut durumuna göre karar veririz — dökülme şikâyeti öndeyse mineral desteği önceliklidir.",
    ],
    highlights: [
      "12 içerikli mineral bakım kürü",
      "Bakır, magnezyum, çinko, kükürt, sodyum",
      "Alg özleri, tatlı badem yağı, hyaluronik asit, plankton özü",
      "Kılı kökten besler (vitamin kürü uçtan besler)",
      "Kopmaya bağlı dökülmeye karşı destek",
    ],
    specs: [
      ["Ürün kodu", "ML-MLB"],
      ["Tür", "Bakım kürü (lifting değil)"],
      ["İçerik sayısı", "12 içerik"],
      ["Etki bölgesi", "Kıl kökü"],
    ],
    image: "mineral-lashbrow.jpg",
    sourceUrl: "https://www.mylamination.com.tr/mineral-lashbrow/",
    inStock: true,
  },
  {
    slug: "kas-ve-kirpik-boyasi",
    name: "Kaş ve Kirpik Boyası",
    category: "uygulama",
    scope: "ikisi",
    summary:
      "PPD içermeyen, hint yağı ve keratinle besleyen krem yapılı kaş-kirpik boyası; beş renk seçeneği.",
    seoTitle: "My Lamination Kaş ve Kirpik Boyası | PPD İçermez",
    seoDesc:
      "My Lamination kaş ve kirpik boyası: PPD içermez, hint yağı ve keratinle besler. 5 renk. Laminasyon ve lifting sonrası renklendirme.",
    keywords: [
      "my lamination kaş boyası",
      "kirpik boyası",
      "ppd içermeyen kaş boyası",
      "kaş kirpik renklendirme ankara",
    ],
    body: [
      "Laminasyon ve lifting işleminin çoğu zaman gözden kaçan tamamlayıcısı renklendirmedir. Kıl şekillenir ama açık renkli uç kısımları görünmeye devam ediyorsa sonuç yarım kalır. My Lamination kaş ve kirpik boyası bu adımı, kılı aynı zamanda besleyen bir formülle yapar: içeriğindeki hint yağı, pantenol, Limnanthes alba çiçeği ve keratin boyama sırasında kılı güçlendirir.",
      "Ürünün en belirleyici özelliği, çoğu boyada bulunan parafenilendiamin (PPD) maddesini içermemesidir. PPD, saç ve kıl boyalarında alerjik reaksiyonun en sık nedenidir; göz çevresi gibi hassas bir bölgede çalışırken bu maddenin dışarıda bırakılması anlamlı bir farktır.",
      "Boya beş renkte sunulur: mavi siyah, grafit, açık kahverengi, orta kahverengi ve kestane. Renk seçimi saç ve ten tonuna göre yapılır; koyu ton her zaman daha belirgin sonuç anlamına gelmez. Krem tüpü yapısı sayesinde kontrollü uygulanır ve Color Developer ile aktive edilir.",
    ],
    highlights: [
      "PPD (parafenilendiamin) içermez",
      "Hint yağı, pantenol, keratin ile besleyici formül",
      "5 renk: mavi siyah, grafit, açık kahve, orta kahve, kestane",
      "Krem tüpü — kontrollü ve kolay uygulama",
      "Color Developer ile birlikte kullanılır",
    ],
    usage: [
      "Kaş ve kirpik iyice temizlenir ve tamamen kurutulur.",
      "Boya, Color Developer ile karıştırılarak aktive edilir.",
      "Karışım kıl üzerine kök bölgesinden başlanarak uygulanır.",
      "Renk oturması için belirlenen süre beklenir.",
      "Durulanarak kalıntı tamamen giderilir.",
    ],
    specs: [
      ["Ürün kodu", "ML-KKB"],
      ["Renk seçenekleri", "Blue Black, Graphite, Light Brown, Orta Kahve, Chestnut"],
      ["Form", "Krem tüpü"],
      ["Alerjen", "PPD içermez"],
    ],
    faq: [
      {
        q: "Kaş ve kirpik boyası laminasyonla aynı seansta yapılabilir mi?",
        a: "Evet, standart uygulamada renklendirme laminasyon veya lifting adımlarından sonra aynı seansta yapılır. Kılın yeni formu sabitlendikten sonra boya uygulanır.",
      },
      {
        q: "Boya alerji yapar mı?",
        a: "Bu üründe alerjik reaksiyonun en sık nedeni olan PPD bulunmaz; yine de hiçbir boya için sıfır risk denemez. Hassas cilt geçmişi olan veya daha önce boya reaksiyonu yaşamış kişilerde seans öncesi duyarlılık testi yapılır.",
      },
    ],
    image: "kas-ve-kirpik-boyasi.jpg",
    sourceUrl: "https://www.mylamination.com.tr/kas-ve-kirpik-boyasi/",
    inStock: false,
  },
  {
    slug: "color-developer",
    name: "Color Developer",
    category: "uygulama",
    scope: "ikisi",
    summary:
      "Kaş ve kirpik boyasını aktive eden krem yapılı renk geliştirici; tonun doğru oturmasını sağlar.",
    seoTitle: "My Lamination Color Developer Ne İşe Yarar?",
    seoDesc:
      "Color Developer, My Lamination kaş ve kirpik boyalarını aktive eden krem yapılı renk geliştiricidir. Doğru ton ve uzun ömürlü etki sağlar.",
    keywords: [
      "my lamination color developer",
      "kaş boyası aktivatör",
      "renk geliştirici krem",
      "kirpik boyası oksidan",
    ],
    body: [
      "Color Developer, boyanın kendisi değil onu çalıştıran üründür. My Lamination kaş ve kirpik boyalarını aktive eden özel formüllü bir krem olarak üretilir ve tonun doğru oturmasını sağlar. Boya ile geliştirici oranı, elde edilen rengin hem yoğunluğunu hem de kalıcılığını belirler.",
      "Krem yapısı, sıvı geliştiricilere göre uygulayıcıya daha fazla kontrol verir: karışım göz çevresinde akmaz, uygulanan yerde kalır. Üretici, ürünün yoğun renk tonlarıyla kullanılmak üzere tasarlandığını ve dayanıklı yapısının uzun ömürlü etki sağladığını belirtir.",
      "Bu ürün, renklendirmenin neden ayrı bir uzmanlık olduğunu gösterir. Aynı boya, farklı geliştirici oranı ve süreyle çok farklı sonuç verir. Stria Studio'da renk kararı ten ve saç tonuna göre alınır, karışım her seans için taze hazırlanır.",
    ],
    highlights: [
      "Kaş ve kirpik boyalarını aktive eder",
      "Krem yapısı — göz çevresinde akmaz, kontrol sağlar",
      "Yoğun renk tonlarıyla kullanım için tasarlanmıştır",
      "Dayanıklı yapı, uzun ömürlü renk etkisi",
      "Yalnızca profesyonel kullanım",
    ],
    specs: [
      ["Ürün kodu", "ML-CD"],
      ["Form", "Krem"],
      ["İşlev", "Boya aktivatörü"],
    ],
    image: "color-developer.jpg",
    sourceUrl: "https://www.mylamination.com.tr/color-developer/",
    inStock: true,
  },
  {
    slug: "cleansing-foam",
    name: "Cleansing Foam",
    category: "uygulama",
    scope: "ikisi",
    summary:
      "Cilt pH'ına uyumlu temizleme köpüğü; işlem öncesi kaş ve göz çevresini yağ ve makyaj kalıntısından arındırır.",
    seoTitle: "My Lamination Cleansing Foam | İşlem Öncesi Temizlik",
    seoDesc:
      "My Lamination Cleansing Foam: cilt pH'ına uyumlu, papatya ve pasiflora özlü temizleme köpüğü. Laminasyon öncesi kaş ve göz çevresi hazırlığı.",
    keywords: [
      "my lamination cleansing foam",
      "kaş temizleme köpüğü",
      "laminasyon öncesi temizlik",
      "göz çevresi temizleyici",
    ],
    body: [
      "Laminasyon ve liftingde sonucu bozan en sık teknik neden yetersiz temizliktir. Kıl üzerinde kalan yağ, silikon içerikli ürün veya makyaj kalıntısı solüsyonun kıla temas etmesini engeller; sonuç bölgesel olarak tutmaz. Cleansing Foam bu yüzden işlemin ilk adımından önce gelen adımdır.",
      "Ürün cilt pH'ı ile uyumlu üretilir ve kolay köpüren yapısıyla cildi tahriş etmeden, nem dengesini bozmadan temizler. İçeriğindeki papatya ve pasiflora özleri cildi yatıştırır, pirinç proteini besler. Kaş ve göz çevresinde güvenle kullanılabilir; gözle doğrudan temas ettirilmemesi gerekir.",
      "Yüze doğrudan ya da pamuklu pedle uygulanır, dairesel hareketle çalışılır ve ılık suyla durulanır. Çabuk durulanan yapısı ciltte kalıntı bırakmadığı için hemen ardından gelen kimyasal adımlar için temiz bir zemin oluşturur.",
    ],
    highlights: [
      "Cilt pH'ı ile uyumlu formül",
      "Papatya ve pasiflora özleri — yatıştırıcı",
      "Pirinç proteini — besleyici",
      "Kaş ve göz çevresinde güvenli kullanım",
      "Kalıntı bırakmaz; kimyasal adımlar için temiz zemin",
    ],
    usage: [
      "Yüze doğrudan veya pamuklu ped ile uygulanır.",
      "Dairesel hareketlerle kaş ve göz çevresinde çalışılır (gözle temas ettirilmez).",
      "Ilık su ile durulanır.",
      "Bölge tamamen kurulanır; ardından işleme geçilir.",
    ],
    specs: [
      ["Ürün kodu", "ML-CF"],
      ["Cilt tipi", "Tüm cilt tipleri"],
      ["Ek kullanım", "Makyaj temizleme"],
    ],
    image: "cleansing-foam.jpg",
    sourceUrl: "https://www.mylamination.com.tr/cleansing-foam/",
    inStock: true,
  },

  // ----------------------------------------------------------------- ekipman
  {
    slug: "lami-tool",
    name: "Lami Tool",
    category: "ekipman",
    scope: "ikisi",
    summary:
      "Paslanmaz çelik laminasyon aleti; kılları ayırır ve şekil verirken sterilize edilerek tekrar kullanılır.",
    seoTitle: "My Lamination Lami Tool | Laminasyon Aleti",
    seoDesc:
      "Lami Tool, kaş ve kirpik laminasyonunda kılları ayırıp şekil vermek için kullanılan çelik alettir. Sterilize edilebilir, tekrar kullanılır.",
    keywords: [
      "lami tool",
      "laminasyon aleti",
      "kaş laminasyon aparatı",
      "my lamination ekipman",
    ],
    body: [
      "Lami Tool, laminasyon sırasında kılları tek tek ayırıp yönlendirmek için kullanılan alettir. Solüsyon kılı şekil alabilir hâle getirdiğinde, o şeklin ne olacağını belirleyen şey bu aletle yapılan tarama ve yerleştirmedir. Kaş laminasyonunda kılın hangi açıyla yukarı yattığı, kirpik liftingde kirpiklerin kalıp üzerinde eşit aralıkla ayrılıp ayrılmadığı bu adımda kararlaşır.",
      "Alet çelikten üretilir. Bunun pratik karşılığı hijyendir: kolayca sterilize edilir ve tekrar tekrar kullanılabilir. Plastik alternatiflerin aksine yüzeyinde ürün kalıntısı tutmaz ve zamanla şekil kaybetmez.",
      "Üretici, aletin kaşa zarar vermeden nazik uygulama imkânı verdiğini ve profesyonel kullanım için tasarlandığını belirtir. Stria Studio'da her seans öncesi sterilizasyon döngüsünden geçirilir.",
    ],
    highlights: [
      "Paslanmaz çelik gövde — sterilize edilebilir",
      "Kılları ayırma ve şekillendirme aleti",
      "Kaş ve kirpik uygulamalarında kullanılır",
      "Zamanla şekil kaybetmez, kalıntı tutmaz",
      "Profesyonel kullanım için tasarlanmıştır",
    ],
    specs: [
      ["Ürün kodu", "ML-LT"],
      ["Malzeme", "Çelik"],
      ["Hijyen", "Sterilize edilir, tekrar kullanılır"],
    ],
    image: "lami-tool.jpg",
    sourceUrl: "https://www.mylamination.com.tr/lami-tool/",
    inStock: true,
  },
  {
    slug: "lamitta-laminator-original",
    name: "Lamitta Laminator Original",
    category: "ekipman",
    scope: "kirpik",
    summary:
      "Kirpik lifting için üretilen ilk laminator fırça; yumuşak yoğun kılları kirpiği çekmeden ayırır.",
    seoTitle: "Lamitta Laminator Original | Kirpik Lifting Fırçası",
    seoDesc:
      "Lamitta Laminator Original, kirpik lifting için üretilen ilk fırçadır. Yumuşak yoğun kılları kirpiği sertçe çekmeden ayırır ve sarar.",
    keywords: [
      "lamitta laminator original",
      "kirpik lifting fırçası",
      "laminator brush",
      "kirpik sarma aleti",
    ],
    body: [
      "Lamitta Laminator Original, kirpik lifting işlemi için özel olarak tasarlanmış ve piyasadaki ilk örnek olan fırçadır. Yumuşak ve yoğun kıllardan yapılan uç kısmı, sarma sırasında her kirpiği ayırır ve kalıba yapışmasını sağlar. Kısa ve düz ucu sayesinde her fırça darbesinde kirpikleri doğru şekilde ayırır.",
      "Fırçanın asıl avantajı metal veya plastik uçlu aletlere göre nazik olmasıdır: kirpikleri sertçe çekmeden çalışır. İzolasyon — yani kirpiklerin birbirine yapışmadan tek tek ayrılması — liftingin kalitesini belirleyen adımdır; bu yüzden aletin sertliği doğrudan sonucu etkiler. Fırça, Y veya L aleti gibi de kullanılabilir.",
      "Sentetik kıl, metal çubuk ve ahşap saptan üretilir; hafiftir, kolay temizlenir ve zamanla şeklini korur. Yeni başlayan uygulayıcıdan ileri düzey kirpik sanatçısına kadar kullanıma uygundur.",
    ],
    highlights: [
      "Kirpik lifting için üretilen ilk laminator fırça",
      "Yumuşak, yoğun kıllar — kirpiği çekmeden ayırır",
      "Metal/plastik uçlara göre daha nazik alternatif",
      "Y veya L aleti gibi de kullanılabilir",
      "Sentetik kıl, metal çubuk, ahşap sap",
      "Tekrar kullanılabilir; zamanla şeklini korur",
    ],
    usage: [
      "Kıllar ılık su ile ıslatılır.",
      "Temiz avuç içine bir damla temizleyici damlatılır.",
      "Kıl uçları avuç içinde nazikçe masaj yapılarak temizlenir.",
      "Kıllar iyice durulanır ve temiz havluyla fazla nem alınır.",
      "Fırça başlığı orijinal şekline getirilir; kıllar tezgah kenarından sarkacak şekilde kurutulur.",
    ],
    specs: [
      ["Ürün kodu", "LT-LO"],
      ["Marka", "Lamitta"],
      ["Malzeme", "Sentetik kıl, metal çubuk, ahşap sap"],
      ["Tasarım", "Liliya Utivlenova (patentli)"],
    ],
    image: "lamitta-laminator-original.jpg",
    sourceUrl: "https://www.mylamination.com.tr/lamitta-laminator-original/",
    inStock: false,
  },
  {
    slug: "lamitta-laminator-slide",
    name: "Lamitta Laminator Slide",
    category: "ekipman",
    scope: "kirpik",
    summary:
      "Orijinal laminator fırçanın geliştirilmiş versiyonu; düz kesim başıyla sarma işlemini hızlandırır, dikey açıyla izolasyon sağlar.",
    seoTitle: "Lamitta Laminator Slide | Geliştirilmiş Lifting Fırçası",
    seoDesc:
      "Lamitta Laminator Slide: düz kesim fırça başıyla kirpik sarmayı hızlandırır, dikey açıda izolasyon sağlar. 17 cm, uç 0.3 x 0.3 cm.",
    keywords: [
      "lamitta laminator slide",
      "kirpik lifting fırçası",
      "laminator slide brush",
      "kirpik izolasyon fırçası",
    ],
    body: [
      "Laminator Slide, orijinal Laminator Brush'un yeni ve geliştirilmiş versiyonudur. Adı uygulama yöntemini de anlatır: düz kesim tasarımlı fırça başı, kirpiklerin yüzeyinde kökten uca kayarak sarma işlemini hızlandırır. Uç kısmı küçüktür ama kalın ve güçlü kıllardan yapıldığı için özellikle gözün küçük iç köşelerinde işe yarar.",
      "Fırçanın tek aletle iki iş yapması pratik farkı yaratır: düz taraf sarma için, dikey açı izolasyon için kullanılır. Uygulayıcı yatay ve dikey açı arasında geçiş yaparak alet değiştirmeden çalışır. Aynı fırça fazla yapıştırıcıyı almak için de kullanılır; sarma adımını tamamlamak için ikinci bir alete ihtiyaç kalmaz.",
      "Her kullanımdan sonra ılık su ve sabunla temizlenir, ardından tam sterilizasyon için alkolle yıkanır. Bu ürün ayrıca Lamitta Fixer ile birlikte kullanılması önerilen alettir.",
    ],
    highlights: [
      "Orijinal Laminator Brush'un geliştirilmiş versiyonu",
      "Düz kesim fırça başı — sarma işlemini hızlandırır",
      "Dikey açı ile izolasyon; tek aletle iki işlev",
      "Küçük ama güçlü uç — gözün iç köşesi için uygun",
      "Fazla yapıştırıcıyı almak için de kullanılır",
    ],
    specs: [
      ["Ürün kodu", "LT-LS"],
      ["Marka", "Lamitta"],
      ["Uzunluk", "17 cm"],
      ["Fırça ucu", "0.3 x 0.3 cm"],
      ["Tasarım", "Liliya Utivlenova (patentli)"],
    ],
    image: "lamitta-laminator-slide.jpg",
    sourceUrl: "https://www.mylamination.com.tr/lamitta-laminator-slide/",
    inStock: true,
  },
  {
    slug: "lamitta-brush-kit",
    name: "Lamitta Brush Kit",
    category: "ekipman",
    scope: "kirpik",
    summary:
      "Kirpik liftingin her adımı için ayrı, sırayla numaralanmış 4 fırça + Laminator Slide'dan oluşan set.",
    seoTitle: "Lamitta Brush Kit | Kirpik Lifting Fırça Seti",
    seoDesc:
      "Lamitta Brush Kit: solüsyon yerleştirme, çıkarma, boyama ve sarma için numaralanmış 4 fırça + Laminator Slide. Kirpik lifting fırça seti.",
    keywords: [
      "lamitta brush kit",
      "kirpik lifting fırça seti",
      "lash lift brush kit",
      "solüsyon fırçası",
    ],
    body: [
      "Brush Kit, kirpik liftingin her adımı için ayrı fırça kullanma mantığına dayanır. Aynı fırçayla hem solüsyon yerleştirmek hem de çıkarmak, ürünlerin birbirine bulaşmasına yol açar — bu da adımların birbirini bozması anlamına gelir. Set bu riski, her adıma özel ve sapında sırayla numaralanmış fırçalarla ortadan kaldırır.",
      "Koleksiyon, ikonik Laminator Brush'un yaratıcısı Liliya Utivlenova tarafından patentlenmiş ve tasarlanmıştır. Fırçalar sarma, solüsyon yerleştirme, çıkarma ve boya ya da kirpik botoksu uygulaması için özel olarak üretilir. Fırça başlarının ölçüleri hızlı ve doğru uygulamaya göre belirlenmiştir.",
      "Setin hijyen protokolü belirgindir: her kullanımdan sonra ılık su ve sabunla temizlik, ardından alkolle sterilizasyon. Temizlik sırasında kuru ısı kullanılmaması gerekir; fırça bütünlüğünü bozar.",
    ],
    highlights: [
      "Fırça 1 — solüsyon yerleştirme",
      "Fırça 2 — solüsyon yerleştirme / kirpiklerin altını boyama",
      "Fırça 3 — solüsyon çıkarma",
      "Fırça 4 — boyama / kirpik botoksu",
      "Laminator Slide — kirpik sarma",
      "Adım sırasına göre numaralanmış saplar",
    ],
    specs: [
      ["Ürün kodu", "LT-BK"],
      ["Marka", "Lamitta"],
      ["Set içeriği", "4 fırça + Laminator Slide"],
      ["Tasarım", "Liliya Utivlenova (patentli)"],
    ],
    image: "lamitta-brush-kit.jpg",
    sourceUrl: "https://www.mylamination.com.tr/lamitta-brush-kit/",
    inStock: false,
  },
  {
    slug: "lamitta-fixer",
    name: "Lamitta Fixer",
    category: "ekipman",
    scope: "kirpik",
    summary:
      "Kirpik lifting yapıştırıcı balmı; kurumaz, fazlasını almak gerekmez ve alt kirpiklerin üste yapışmasını engeller.",
    seoTitle: "Lamitta Fixer | Kirpik Lifting Yapıştırıcı Balm",
    seoDesc:
      "Lamitta Fixer: kirpik lifting için nemlendirici yapıştırıcı balm. Kurumaz, fazla kalıntı bırakmaz, alt kirpiklerin yapışmasını engeller. 5 g.",
    keywords: [
      "lamitta fixer",
      "kirpik lifting yapıştırıcı",
      "lash lift glue balm",
      "kirpik sabitleyici balm",
    ],
    body: [
      "Lamitta Fixer, kirpiği silikon kalıba tutturan yapıştırıcı balmdır — Eye do ve Lamitta iş birliğiyle geliştirilmiştir. Kirpik liftingde yapıştırıcının işi kirpiği kalıp üzerinde solüsyon etkisini gösterene kadar sabit tutmaktır; bu yüzden ne çok kuruyup kirpiği kırması ne de kayacak kadar yumuşak olması gerekir.",
      "Ürünün ayırt edici tarafları: hassas göz çevresi için güvenli, nemlendirici formül; kirpiğe derinlemesine nüfuz ederek etkili lifting sağlaması; ve tamamen kurumaması. Kurumadığı için fazla yapıştırıcıyı çıkarmak gerekmez ve alt kirpikler üst kirpiklere yapışmaz — pratikte seans süresini kısaltan iki ayrıntı.",
      "Üretici, Fixer kullanıldığında 1. çözelti için maruz kalma süresinin %30'a kadar artırılması gerekebileceğini not eder. Bu, ürün seçiminin süre hesabını değiştirdiğini gösteren iyi bir örnek: aynı kirpikte aynı solüsyon, farklı yapıştırıcıyla farklı süre ister.",
    ],
    highlights: [
      "Hassas göz çevresi için güvenli, nemlendirici formül",
      "Tamamen kurumaz — yapışkan kalıntı bırakmaz",
      "Fazla yapıştırıcıyı çıkarmak gerekmez",
      "Alt kirpikler üst kirpiklere yapışmaz",
      "Üstün penetrasyon ile etkili lifting",
      "Hafif ve hoş koku",
    ],
    usage: [
      "Kavanoz ilk açıldığında yapıştırıcı, mikro uçlu aplikatörle iyice karıştırılarak etkinleştirilir.",
      "Laminator Slide veya uygun bir lifting aletiyle kirpiğe uygulanır.",
      "Kirpikler silikon kalıp üzerine sabitlenir.",
      "Koruyucu mühür her kullanımdan sonra yerine takılır; ürünün ömrü böyle korunur.",
    ],
    ingredients: [
      "Gliserin",
      "PEG-40 hidrojene hint yağı",
      "PEG 90M",
      "PPG-2 metil eter",
      "2-Bromo-2-nitropropane-1,3-diol",
      "Silika",
      "Linalool, parfüm",
    ],
    specs: [
      ["Ürün kodu", "LT-F"],
      ["Marka", "Lamitta"],
      ["Ambalaj", "5 g, koruyucu mühürlü plastik kavanoz"],
      ["Not", "1. çözelti süresi %30'a kadar artabilir"],
    ],
    image: "lamitta-fixer.jpg",
    sourceUrl: "https://www.mylamination.com.tr/lamitta-fixer/",
    inStock: true,
  },
  {
    slug: "lamitta-honey-glue",
    name: "Lamitta Honey Glue",
    category: "ekipman",
    scope: "kirpik",
    summary:
      "Bal kıvamında laminasyon yapıştırıcısı; yavaş kurur, yayılmaz ve uygulama başına 1–2 damla yeterlidir.",
    seoTitle: "Lamitta Honey Glue | Kirpik Laminasyon Yapıştırıcısı",
    seoDesc:
      "Lamitta Honey Glue: bal kıvamında kirpik laminasyon yapıştırıcısı. Yavaş kurur, yayılmaz, 1-2 damla yeterlidir. 5 ml. Alt kirpikte de kullanılır.",
    keywords: [
      "lamitta honey glue",
      "kirpik laminasyon yapıştırıcısı",
      "honey glue lash lift",
      "bal kıvamında yapıştırıcı",
    ],
    body: [
      "Honey Glue, sıvı silikon yapıştırıcı ile “glueless glue” yaklaşımını birleştiren bal kıvamında bir laminasyon yapıştırıcısıdır. Kalın dokusu hemen sertleşmediği için uygulayıcı kirpikleri acele etmeden, tek tek ve hassas biçimde yerleştirebilir. Kıvamın yeterince yoğun olması yayılmasını engeller, buna karşın kirpikleri hızlı sabitler.",
      "Yavaş kuruma, yeni başlayan uygulayıcı için belirgin bir avantajdır: yerleştirme sırasında hata düzeltilebilir. Üretici ürünün her deneyim seviyesine uygun olduğunu belirtir. Tüketim düşüktür — bir uygulama için 1–2 damla yeterlidir.",
      "Ürün hem üst hem alt kirpiklerde kullanılır ve klasik Laminator Brush Tool ile Laminator Slide ile uyumlu çalışır. Saklama koşulu net: kuru, serin ve güneş ışığından uzak, ideal olarak +5 °C ile +25 °C arası.",
    ],
    highlights: [
      "Bal kıvamı — yayılmaz, hızlı sabitler",
      "Yavaş kurur; kirpik yerleşimi düzeltilebilir",
      "Uygulama başına 1–2 damla (ekonomik)",
      "Üst ve alt kirpikte kullanılabilir",
      "Her deneyim seviyesi için uygun",
      "Laminator Brush Tool ve Laminator Slide ile uyumlu",
    ],
    usage: [
      "Gerekli miktarda yapıştırıcı mikro fırça ile alınır.",
      "Yapıştırıcı kirpiklere veya silikon kalıba uygulanır.",
      "Kirpikler kalıba sabitlenir; gerekiyorsa konum ayarlanır.",
      "Standart laminasyon prosedürüne devam edilir.",
    ],
    specs: [
      ["Ürün kodu", "LT-HG"],
      ["Marka", "Lamitta"],
      ["Hacim", "5 ml (0.17 fl oz)"],
      ["Kıvam", "Sıvı bal dokusu"],
      ["Raf ömrü", "Üretimden 12 ay; açıldıktan sonra 6 ay"],
      ["Saklama", "+5 °C – +25 °C, güneşten uzak"],
      ["Üretim yeri", "Kazakistan"],
    ],
    faq: [
      {
        q: "Honey Glue alt kirpiklerde kullanılabilir mi?",
        a: "Evet. Üretici hem üst hem alt kirpikler için güvenli tutuş sağladığını belirtir; alt kirpik laminasyonunda Mariposa silikon pedleriyle birlikte kullanılır.",
      },
    ],
    image: "lamitta-honey-glue.jpg",
    sourceUrl: "https://www.mylamination.com.tr/lamitta-honey-glue/",
    inStock: true,
  },
  {
    slug: "lamitta-shields-silikon-seti-5-cift",
    name: "Lamitta Shields Silikon Seti (5 Çift)",
    category: "ekipman",
    scope: "kirpik",
    summary:
      "Patentli kirpik lifting kalkanı; SS, SM, M, ML, L olmak üzere 5 boy, gözyaşı damlası formunda yuvarlak kaldırma etkisi.",
    seoTitle: "Lamitta Shields Silikon Seti | 5 Boy Kirpik Lifting Kalıbı",
    seoDesc:
      "Lamitta Shields: patentli kirpik lifting silikon kalkanı. SS, SM, M, ML, L 5 boy. Gözyaşı damlası formu, yuvarlak kaldırma etkisi.",
    keywords: [
      "lamitta shields",
      "kirpik lifting silikon kalıbı",
      "lash lift shield",
      "kirpik lifting kalıp boyu",
    ],
    body: [
      "Kirpik liftingde sonucu en çok belirleyen tek seçim kalıp boyudur. Kalıp, kirpiğin hangi noktadan ve hangi açıyla kalkacağını tanımlar; kirpik boyuna göre küçük seçilirse kıvrım fazla keskin ve kirpik kısa görünür, büyük seçilirse kıvrım yetersiz kalır. Lamitta Shields seti bu yüzden tek boy değil, beş boy olarak gelir: SS, SM, M, ML ve L.",
      "Kalkanlar Lamitta tarafından tasarlanmış ve patentlenmiştir. Yüksek kaliteli silikondan üretilir ve cilde iyi yapıştığı için sarma işlemini kolaylaştırır. Form olarak gözyaşı damlası kategorisine girer — bu kategori kaldırma etkisi sağlar — ancak kendi tasarımı yuvarlak bir kaldırma efekti verir.",
      "Sette her boyuttan bir pembe ve bir nane yeşili kalkan bulunur. Stria Studio'da kalıp seçimi seans başında kirpik boyu ve göz kapağı formu ölçülerek yapılır; aynı kişide iki gözde farklı boy kullanılması da olağandır.",
    ],
    highlights: [
      "5 boy: SS, SM, M, ML, L",
      "Lamitta tarafından tasarlanmış ve patentli",
      "Yüksek kaliteli silikon — cilde iyi yapışır",
      "Gözyaşı damlası formu, yuvarlak kaldırma efekti",
      "Her boyutta bir pembe + bir nane yeşili kalkan",
    ],
    specs: [
      ["Ürün kodu", "LT-SSS"],
      ["Marka", "Lamitta"],
      ["Set içeriği", "5 çift (SS, SM, M, ML, L)"],
      ["Form", "Gözyaşı damlası / yuvarlak kaldırma"],
    ],
    faq: [
      {
        q: "Kirpik lifting kalıbı nasıl seçilir?",
        a: "Kirpik boyu ve göz kapağı formuna göre seçilir. Kısa kirpikte büyük kalıp kıvrımı yetersiz bırakır; uzun kirpikte küçük kalıp kirpiği fazla kıvırıp kısa gösterir. Doğru boy, kirpiğin ucunun kalıbın üst kenarına yaklaşık denk geldiği ölçüdür.",
      },
    ],
    image: "lamitta-shields-silikon-seti-5-cift.jpg",
    sourceUrl: "https://www.mylamination.com.tr/lamitta-shields-silikon-seti-5-cift/",
    inStock: true,
  },
  {
    slug: "lami-combo-pads",
    name: "Lami Combo Pads",
    category: "ekipman",
    scope: "kirpik",
    summary:
      "Yuvarlak (S–XL) ve düz (S1–XL1) olmak üzere iki form ailesinde silikon ped; yapıştırıcı kullanmadan göz kapağına sabitlenir.",
    seoTitle: "Lami Combo Pads | Kirpik Lifting Silikon Pedleri",
    seoDesc:
      "Lami Combo Pads: yuvarlak S-XL ve düz S1-XL1 silikon pedler. Yapıştırıcı kullanmadan göz kapağına sabitlenir, tekrar kullanılabilir.",
    keywords: [
      "lami combo pads",
      "kirpik lifting pedi",
      "silikon kirpik pedi",
      "lash lift pad boyutları",
    ],
    body: [
      "Combo Pads'in adı iki form ailesini bir arada sunmasından gelir: yuvarlak boyutlar (S, M, L, XL) ve düz boyutlar (S1, M1, L1, XL1). Yuvarlak formlar daha belirgin, kıvrımlı bir sonuç verir; düz formlar kirpiği daha yukarı doğru, açılmış bir açıyla kaldırır. Aynı kirpik boyunda iki farklı form iki farklı görünüm demektir — bu seçim seans başında müşteriyle konuşulur.",
      "Pedler yumuşak ve esnek silikondan üretilir, göz kapağına rahat uyum sağlar. Öne çıkan pratik özelliği yapıştırıcı gerektirmemesidir: yumuşak silikon, kalıbın göz kapağına hızlı ve kolay sabitlenmesini sağlar. Bu, hassas göz çevresinde bir kimyasal katmanı daha devreden çıkarır.",
      "Tekrar kullanılabilir ve hijyeniktir; kolay temizlenir, dezenfekte edilip yeniden kullanılabilir. Pembe, turuncu ve yeşil renklerde sunulur.",
    ],
    highlights: [
      "Yuvarlak boyutlar: S, M, L, XL",
      "Düz boyutlar: S1, M1, L1, XL1",
      "Yapıştırıcı KULLANMADAN göz kapağına sabitlenir",
      "Yumuşak, esnek silikon — göz kapağına uyum sağlar",
      "Tekrar kullanılabilir ve dezenfekte edilebilir",
      "Renkler: pembe, turuncu, yeşil",
    ],
    specs: [
      ["Marka", "Lami"],
      ["Yuvarlak ölçüler", "S, M, L, XL"],
      ["Düz ölçüler", "S1, M1, L1, XL1"],
      ["Renkler", "Pembe, turuncu, yeşil"],
    ],
    image: "lami-combo-pads.jpg",
    sourceUrl: "https://www.mylamination.com.tr/lami-combo-pads/",
    inStock: true,
  },
  {
    slug: "lami-lashes-silikon",
    name: "Lami Lashes Silikon",
    category: "ekipman",
    scope: "kirpik",
    summary:
      "Tekrar kullanılabilir göz altı pedi; lifting sırasında göz altı cildini korur ve alt kirpikleri yerinde tutar.",
    seoTitle: "Lami Lashes Silikon | Göz Altı Kirpik Pedi",
    seoDesc:
      "Lami Lashes Silikon: kirpik lifting sırasında göz altı cildini koruyan, alt kirpikleri yerinde tutan tekrar kullanılabilir silikon pedler.",
    keywords: [
      "lami lashes silikon",
      "göz altı pedi",
      "kirpik lifting göz altı koruma",
      "alt kirpik pedi",
    ],
    body: [
      "Kirpik lifting sırasında iki ayrı sorun aynı anda çözülmelidir: göz altı cildinin solüsyonla temas etmemesi ve alt kirpiklerin üst kirpiklere karışmaması. Lami Lashes Silikon pedleri bu iki işi birlikte yapar — hassas göz altı cildini korur ve alt kirpikleri rahat şekilde yerinde tutar.",
      "Pedler yumuşak silikondan üretilir, göz altı bölgesine nazikçe uyum sağlar. Kâğıt ya da tek kullanımlık pedlerin aksine dayanıklı yapısı uzun süreli kullanım imkânı verir ve hijyenik olarak temizlenebilir.",
      "Yedi renk seçeneğiyle sunulur: siyah, yeşil, lacivert, turuncu, pembe, sarı ve mor. Renk, pratikte pedin kalınlığını ya da işlevini değiştirmez; stüdyoda müşteri ve seans ayrımı için kullanışlıdır.",
    ],
    highlights: [
      "Göz altı cildini solüsyondan korur",
      "Alt kirpikleri işlem boyunca yerinde tutar",
      "Yumuşak silikon — göz altına nazik uyum",
      "Tekrar kullanılabilir ve hijyenik olarak temizlenebilir",
      "7 renk: siyah, yeşil, lacivert, turuncu, pembe, sarı, mor",
    ],
    specs: [
      ["Ürün kodu", "LM-LS"],
      ["Marka", "Lami"],
      ["Kullanım", "Tekrar kullanılabilir"],
    ],
    image: "lami-lashes-silikon.jpg",
    sourceUrl: "https://www.mylamination.com.tr/lami-lashes-silikon/",
    inStock: false,
  },
  {
    slug: "lami-bands",
    name: "Lami Bands",
    category: "ekipman",
    scope: "kirpik",
    summary:
      "Silikon bant; laminasyon sırasında kirpiklerin silikon pedden ayrılmasını engeller. 3 çift, tekrar kullanılabilir.",
    seoTitle: "Lami Bands | Kirpik Laminasyon Silikon Bandı",
    seoDesc:
      "Lami Bands: kirpik laminasyonunda kirpiklerin silikon pedden ayrılmasını engelleyen silikon bantlar. 3 çift, tekrar kullanılabilir.",
    keywords: [
      "lami bands",
      "kirpik laminasyon bandı",
      "silikon bant kirpik",
      "lash lift band",
    ],
    body: [
      "Laminasyon sırasında kirpiklerin kalıptan kalkması, sonucun dağınık çıkmasının en sık nedenlerinden biridir. Lami Bands bu ihtimali azaltmak için tasarlanmış silikon bantlardır: kirpiklerin silikon pedden ayrılmasını engeller ve ürünlerin kıl üzerine düzgün sürülmesini sağlar.",
      "Silikon malzeme, işlem boyunca kirpiğin şeklini korumasına yardımcı olur. Dayanıklı yapısı çoklu kullanıma uygundur; tek kullanımlık sarf yerine tekrar kullanılabilir bir çözüm sunar.",
      "Paket üç çift banttan oluşur; pembe ve beyaz renk seçenekleri vardır.",
    ],
    highlights: [
      "Kirpiklerin silikon pedden ayrılmasını engeller",
      "Ürünlerin düzgün sürülmesini sağlar",
      "İşlem boyunca kirpiğin şeklini korumasına yardım eder",
      "Tekrar kullanılabilir — çevre dostu",
      "Paket: 3 çift bant; pembe ve beyaz",
    ],
    specs: [
      ["Marka", "Lami"],
      ["Paket içeriği", "3 çift bant"],
      ["Renkler", "Pembe, beyaz"],
    ],
    image: "lami-bands.jpg",
    sourceUrl: "https://www.mylamination.com.tr/lami-bands/",
    inStock: true,
  },
  {
    slug: "lamitta-mariposa-goz-alti-kirpik-kapatma-silikonu",
    name: "Lamitta Mariposa Göz Altı Kirpik Kapatma Silikonu",
    category: "ekipman",
    scope: "kirpik",
    summary:
      "Alt kirpikleri kapatmak ve göz altı bölgesini korumak için tasarlanmış tekrar kullanılabilir silikon ped; 3 renk.",
    seoTitle: "Lamitta Mariposa Göz Altı Kirpik Kapatma Silikonu",
    seoDesc:
      "Lamitta Mariposa göz altı silikonu: alt kirpikleri kapatır, göz altı bölgesini korur. Yüksek kaliteli, tekrar kullanılabilir. Lila, açık yeşil, siyah.",
    keywords: [
      "lamitta mariposa",
      "göz altı kirpik kapatma silikonu",
      "alt kirpik kapatma pedi",
      "kirpik lifting göz altı",
    ],
    body: [
      "Mariposa serisinin göz altı pedi, alt kirpikleri kapatmak ve göz altı bölgesini korumak için tasarlanmıştır. Üst kirpiğe lifting uygularken alt kirpiklerin araya karışması hem sonucu bozar hem de alt kirpiklerin istenmeden şekil almasına yol açar; bu ped o ayrımı fiziksel olarak sağlar.",
      "Yüksek kaliteli silikondan üretilir. Göz altı bölgesine nazikçe uyum sağladığı için uzun seanslarda konfor verir ve çeşitli güzellik uygulamaları sırasında güvenilir koruma sunar.",
      "Tekrar kullanılabilir yapıdadır. Lila, açık yeşil ve siyah renk seçenekleri vardır; paket bir çift ped içerir.",
    ],
    highlights: [
      "Alt kirpikleri kapatır, göz altını korur",
      "Yüksek kaliteli silikon",
      "Göz altına nazik uyum — uzun seanslarda konfor",
      "Tekrar kullanılabilir",
      "Renkler: lila, açık yeşil, siyah",
    ],
    specs: [
      ["Marka", "Lamitta"],
      ["Paket içeriği", "1 çift"],
      ["Renkler", "Lila, açık yeşil, siyah"],
    ],
    image: "lamitta-mariposa-goz-alti-kirpik-kapatma-silikonu.jpg",
    sourceUrl:
      "https://www.mylamination.com.tr/lamitta-mariposa-goz-alti-kirpik-kapatma-silikonu/",
    inStock: true,
  },
  {
    slug: "lamitta-mariposa-alt-kirpik-laminasyon-ve-boyama",
    name: "Lamitta Mariposa Alt Kirpik Laminasyon ve Boyama",
    category: "ekipman",
    scope: "kirpik",
    summary:
      "Alt kirpik laminasyonu ve boyaması için özel tasarlanmış silikon ped; 3 renk seçeneği.",
    seoTitle: "Lamitta Mariposa Alt Kirpik Laminasyon ve Boyama Silikonu",
    seoDesc:
      "Lamitta Mariposa alt kirpik pedi: alt kirpik laminasyonu ve boyaması için özel tasarım. Yüksek kaliteli silikon, lila, açık yeşil, siyah.",
    keywords: [
      "alt kirpik laminasyonu",
      "lamitta mariposa alt kirpik",
      "alt kirpik boyama",
      "alt kirpik lifting",
    ],
    body: [
      "Alt kirpik laminasyonu, üst kirpikten farklı bir problem çözer. Alt kirpikler kısa, ince ve aşağı bakan yapıdadır; üst kirpik için tasarlanmış kalıplar bu bölgede çalışmaz. Mariposa'nın alt kirpik pedi bu iş için özel olarak tasarlanmış, kendine özgü forma sahip silikon peddir.",
      "Yüksek kaliteli silikondan üretilir ve alt kirpiklere kolayca uyum sağlar. Hem laminasyon hem boyama adımlarında kullanılır — alt kirpik boyaması özellikle bakışın çerçevesini tamamlayan ve üst kirpikle dengeyi kuran ayrıntıdır.",
      "Lila, açık yeşil ve siyah renk seçenekleri vardır.",
    ],
    highlights: [
      "Alt kirpikler için özel tasarım",
      "Laminasyon ve boyama adımlarında kullanılır",
      "Yüksek kaliteli silikon; alt kirpiklere uyum sağlar",
      "Renkler: lila, açık yeşil, siyah",
    ],
    specs: [
      ["Marka", "Lamitta"],
      ["Kullanım", "Alt kirpik laminasyonu ve boyama"],
      ["Renkler", "Lila, açık yeşil, siyah"],
    ],
    faq: [
      {
        q: "Alt kirpiklere de lifting yapılır mı?",
        a: "Yapılır, ancak üst kirpikten farklı ürün ve kalıp gerektirir. Alt kirpik daha kısa ve ince olduğu için süre de daha kısadır. Çoğunlukla üst kirpik liftingiyle aynı seansta, dengeyi kurmak için tercih edilir.",
      },
    ],
    image: "lamitta-mariposa-alt-kirpik-laminasyon-ve-boyama.jpg",
    sourceUrl:
      "https://www.mylamination.com.tr/lamitta-mariposa-alt-kirpik-laminasyon-ve-boyama/",
    inStock: true,
  },
  {
    slug: "lamitta-organizer-pad",
    name: "Lamitta Organizer Pad",
    category: "ekipman",
    scope: "ikisi",
    summary:
      "%100 platin silikon çalışma paleti; 7 çözelti haznesi, 5 fırça ve 3 küçük alet desteğiyle adımları ayırır.",
    seoTitle: "Lamitta Organizer Pad | Laminasyon Çalışma Paleti",
    seoDesc:
      "Lamitta Organizer Pad: %100 platin silikon çalışma paleti. 7 çözelti haznesi, 5 fırça ve 3 alet desteği. 20 x 13.5 x 1 cm.",
    keywords: [
      "lamitta organizer pad",
      "laminasyon çalışma paleti",
      "silikon palet",
      "lash lift organizer",
    ],
    body: [
      "Organizer Pad bir kozmetik ürün değil, çalışma disiplini aracıdır. Kaş laminasyonu ve kirpik liftingde üç ayrı solüsyon, yapıştırıcı ve boya kısa aralıklarla kullanılır; hangi haznede ne olduğunun karışması adımların birbirini bozması demektir. Palet bu riski her adıma ayrı hazne vererek ortadan kaldırır.",
      "Palette 7 yuvarlak çözelti/sıvı haznesi, 5 Lamitta fırça desteği ve 3 küçük alet desteği bulunur. Hazneler adım adım ayrılmıştır: boya, adım 1, adım 2, yapıştırıcı tutucu, yapıştırıcı, adım 3, pamuk pedler. Her haznenin ölçüsü ilgili ürün için yeterli miktarı alacak şekilde belirlendiği için gereksiz israf önlenir.",
      "%100 platin silikondan üretilir; dik pozisyonda kalacak kadar sağlam olduğu için sıvı ve krem dökülmesini engeller. Koyu renk tonu boya lekelerinin görünmesini engeller. Her kullanımdan sonra ılık su ve sabunla temizlenir, ardından alkolle sterilize edilir.",
    ],
    highlights: [
      "7 yuvarlak çözelti/sıvı haznesi",
      "5 fırça desteği + 3 küçük alet desteği",
      "Adım adım ayrılmış hazneler — karışma riski yok",
      "%100 platin silikon, sağlam taban",
      "Koyu ton — boya lekeleri görünmez",
      "Kolay temizlenir ve sterilize edilir",
    ],
    specs: [
      ["Ürün kodu", "LT-OP"],
      ["Marka", "Lamitta"],
      ["Ölçü", "20 cm x 13.5 cm x 1 cm"],
      ["Malzeme", "%100 platin silikon"],
    ],
    image: "lamitta-organizer-pad.jpg",
    sourceUrl: "https://www.mylamination.com.tr/lamitta-organizer-pad/",
    inStock: false,
  },
  {
    slug: "lami-neon-powder-pigments-kit",
    name: "Lami Neon Powder Pigments Kit",
    category: "ekipman",
    scope: "ikisi",
    summary:
      "Cilt dostu, yüksek yoğunluklu 6 renkli neon pigment seti; kozmetik ürünlere renk katmak için kullanılır.",
    seoTitle: "Lami Neon Powder Pigments Kit | 6 Renk Neon Pigment",
    seoDesc:
      "Lami Neon Powder Pigments Kit: cilt dostu, yüksek yoğunluklu 6 renk neon pigment. Mavi, yeşil, turuncu, pembe, sarı, violet.",
    keywords: [
      "lami neon powder pigments",
      "neon pigment kiti",
      "kozmetik pigment",
      "renkli kaş pigmenti",
    ],
    body: [
      "Neon Powder Pigments Kit, standart laminasyon protokolünün dışında kalan yaratıcı uygulamalar için üretilmiştir. Yüksek yoğunluklu neon pigmentler geniş bir kozmetik uygulama yelpazesinde kullanılır ve beyaz renkle birlikte her türlü ürüne renk katmak için idealdir.",
      "Pigmentler cilt için güvenli olacak şekilde formüle edilmiştir ve kullanımı kolaydır. Çok yönlü yapısıyla mevcut kozmetik ürünlere canlı renk dokunuşu eklemeye imkân verir.",
      "Kit altı renkten oluşur: mavi, yeşil, turuncu, pembe, sarı ve violet. Bu ürün rutin kaş laminasyonu veya kirpik lifting seansının parçası değildir; özel çekim, etkinlik ya da editoryal işlerde tercih edilir.",
    ],
    highlights: [
      "6 renk: mavi, yeşil, turuncu, pembe, sarı, violet",
      "Yüksek yoğunluklu pigment",
      "Cilt dostu formül",
      "Kozmetik ürünlere karıştırılarak kullanılır",
      "Rutin laminasyon protokolünün parçası değildir",
    ],
    specs: [
      ["Ürün kodu", "LM-NPPK"],
      ["Marka", "Lami"],
      ["Kit içeriği", "6 renk"],
    ],
    image: "lami-neon-powder-pigments-kit.jpg",
    sourceUrl: "https://www.mylamination.com.tr/lami-neon-powder-pigments-kit/",
    inStock: false,
  },

  // -------------------------------------------------------------- evde-bakim
  {
    slug: "vitamin-lash-serum-home",
    name: "Vitamin Lash Serum Home",
    category: "evde-bakim",
    scope: "ikisi",
    summary:
      "Günde iki kez kullanılan, 7 bileşenli kaş ve kirpik serumu; C, E, F, K vitaminleri ve keratinle uçtan besler.",
    seoTitle: "Vitamin Lash Serum Home | Evde Kirpik ve Kaş Serumu",
    seoDesc:
      "Vitamin Lash Serum Home: 7 bileşenli kaş-kirpik serumu. C, E, F, K vitaminleri, B5, keratin, kolajen. Günde 2 kez. Siyah, kahve, şeffaf.",
    keywords: [
      "vitamin lash serum home",
      "kirpik serumu",
      "kaş serumu",
      "kirpik uzatan serum",
      "laminasyon sonrası bakım",
    ],
    body: [
      "Kirpik lifting ve kaş laminasyonunun sonucu 6–8 hafta sürer, ama o sürenin ne kadar iyi geçtiğini evde yapılan bakım belirler. Vitamin Lash Serum Home bu adımın en yaygın kullanılan ürünüdür: C, E, F ve K vitaminleri ile B5 pro-vitamini kirpiği besler, kirpik köklerini güçlendirdiği için dökülmeyi azaltır.",
      "Formüldeki hidrolize keratin hem kaşı hem kirpiği kalınlaştırır — her teli sararak daha dolgun bir görünüm verir. Kolajen ise kirpik diplerine bakım uygular ve kılların daha kısa sürede uzamasına, daha dolgun olmasına katkı sağlar. Toplam yedi fonksiyonel bileşenden oluşur.",
      "Kullanımı maskara formundadır ve bu ürünün en pratik yanıdır: alışkanlık gerektirmeyen bir hareketle, günde iki kez uygulanır. Serum siyah, kahverengi ve şeffaf olmak üzere üç seçenekle sunulur; renkli seçenekler makyaja son dokunuş olarak da kullanılabilir.",
      "My Lamination'ın klinik verilerinde bu serumun rolü açıkça görünür. Padua Üniversitesi laboratuvarlarında yapılan ölçümde işlem öncesi 68,18 µm olan kirpik çapı işlemden hemen sonra 86,14 µm'ye çıkmış; bir ay boyunca sabah–akşam ev serumu kullanımından sonra aynı kirpik 129,32 µm ölçülmüştür. Yani gürleşme işlemle başlıyor, evde bakımla sürüyor.",
    ],
    highlights: [
      "7 fonksiyonel bileşenli formül",
      "C, E, F, K vitaminleri + B5 pro-vitamini",
      "Hidrolize keratin — kaş ve kirpiği kalınlaştırır",
      "Kolajen — kirpik diplerine bakım",
      "Günde 2 kez kullanım; maskara formu",
      "Siyah, kahverengi ve şeffaf seçenekler",
    ],
    usage: [
      "Temiz ve makyajsız kaş/kirpiğe uygulanır.",
      "Kökten uca doğru, maskara sürer gibi çekilir.",
      "Günde iki kez (sabah ve akşam) tekrarlanır.",
      "Düzenli kullanımda değişim kısa sürede fark edilir.",
    ],
    specs: [
      ["Ürün kodu", "ML-VLSH"],
      ["Kullanım sıklığı", "Günde 2 kez"],
      ["Renk seçenekleri", "Şeffaf, kahverengi, siyah"],
      ["Bileşen sayısı", "7 fonksiyonel bileşen"],
    ],
    faq: [
      {
        q: "Kirpik serumu lifting sonucunu uzatır mı?",
        a: "Liftingin kıvrımını uzatmaz — kıvrım kirpiğin büyüme döngüsüyle birlikte doğal olarak açılır. Ancak serum kirpiği besleyip güçlendirdiği için kirpik daha dolgun ve sağlıklı görünür; bir sonraki seansa daha iyi durumda girilir.",
      },
      {
        q: "Vitamin ve mineral serumu birlikte kullanılabilir mi?",
        a: "Evet, üretici birlikte kullanımı önerir. Vitamin serumu kılı uçtan, mineral serumu kökten besler; farklı yerden çalıştıkları için birbirini tamamlar.",
      },
    ],
    image: "vitamin-lash-serum-home.jpg",
    sourceUrl: "https://www.mylamination.com.tr/vitamin-lash-serum-home/",
    inStock: true,
  },
  {
    slug: "mineral-serum-home",
    name: "Mineral Serum Home",
    category: "evde-bakim",
    scope: "ikisi",
    summary:
      "Kökten besleyen mineral serum; ince uçlu fırçasıyla kirpik ve kaş diplerine ulaşır.",
    seoTitle: "Mineral Serum Home | Kökten Besleyen Kirpik-Kaş Serumu",
    seoDesc:
      "Mineral Serum Home: magnezyum, çinko, kalsiyum, kükürt ve deniz tuzuyla kirpik ve kaş köklerini besleyen serum. İnce uçlu fırça.",
    keywords: [
      "mineral serum home",
      "mineral kirpik serumu",
      "kaş güçlendirici serum",
      "kirpik kökü bakımı",
    ],
    body: [
      "Mineral Serum Home, vitamin serumunun tamamlayıcısıdır ve farkı çalıştığı yerden gelir. Üreticinin karşılaştırması net: vitamin serumu kirpik ve kaşları uçlardan beslerken, mineral serumu kökten besler. Kaş ve kirpiğin her ikisine de ihtiyacı vardır; birlikte kullanıldıklarında etkileri toplanır.",
      "Ürünün fırçası bu amaca göre tasarlanmıştır: ince uçlu yapısı kirpik ve kaş köklerine rahatça ulaşmayı sağlar. Kök bölgesine ulaşamayan bir uygulama, mineral desteğinin asıl işini yapmasını engeller.",
      "İçerikteki her bileşen ayrı bir işe karşılık gelir: magnezyum klorür koruyucu ve aydınlatıcı, kalsiyum klorür antioksidan, çinko güçlendirici, demir klorür cilt fonksiyonlarını uyarıcı, kükürt arındırıcı ve parlaklık verici. Bunlara bitkisel gliserin, mavi kantaron suyu, deniz tuzu, nar, hamamelis ve plankton özü eklenir.",
    ],
    highlights: [
      "Kirpik ve kaşı kökten besler",
      "İnce uçlu fırça — kök bölgesine ulaşır",
      "Magnezyum, kalsiyum, çinko, demir, kükürt",
      "Deniz tuzu, nar, hamamelis, plankton özü",
      "Vitamin serumuyla birlikte kullanım önerilir",
    ],
    ingredients: [
      "Magnezyum klorür — koruyucu, aydınlatıcı",
      "Kalsiyum klorür — antioksidan, koruyucu",
      "Çinko — güçlendirici, aydınlatıcı",
      "Demir klorür — cilt fonksiyonlarını uyarır",
      "Kükürt — arındırıcı, parlaklık verir",
      "Bitkisel gliserin — nemlendirici, yumuşatıcı",
      "Mavi kantaron suyu — yatıştırıcı",
      "Deniz tuzu — güçlendirici, yenileyici",
      "Nar — antioksidan",
      "Hamamelis — serbest radikallere karşı koruyucu",
      "Plankton özü — nemlendirir, elastikiyeti artırır",
    ],
    specs: [
      ["Ürün kodu", "ML-MSH"],
      ["Etki bölgesi", "Kıl kökü"],
      ["Fırça", "İnce uçlu"],
    ],
    image: "mineral-serum-home.jpg",
    sourceUrl: "https://www.mylamination.com.tr/mineral-serum-home/",
    inStock: true,
  },
  {
    slug: "biotin-serum-home",
    name: "Biotin Serum Home",
    category: "evde-bakim",
    scope: "ikisi",
    summary:
      "Biyotinle zenginleştirilmiş 9 bileşenli serum; hem kıl fırçası hem aplikatörle gelir. 10 ml.",
    seoTitle: "Biotin Serum Home | Biyotinli Kirpik ve Kaş Serumu",
    seoDesc:
      "My Lamination Biotin Serum Home: biyotin, metiyonin, keratin ve bitki kolajeniyle 9 bileşenli kirpik-kaş serumu. Fırça + aplikatör, 10 ml.",
    keywords: [
      "biotin serum home",
      "biyotinli kirpik serumu",
      "kaş çıkarma serumu",
      "kirpik büyüme serumu",
    ],
    body: [
      "Biotin Serum Home, My Lamination'ın serum ailesindeki en yeni üründür ve biyotin ekseninde kurulur. Biyotin güçlendirici, besleyici ve büyümeyi teşvik edici bileşen olarak öne çıkar; formül toplam 9 fonksiyonel bileşenden oluşur.",
      "Ürünün pratik farkı ambalajında: hem kıl fırça hem aplikatör içerir. Fırça kirpiğe boydan uygulama için, aplikatör kaşta seyrek alanlara ve kirpik dibine noktasal uygulama için kullanılır. İki uygulayıcının bir arada olması, aynı ürünle iki farklı bölgede hassas çalışmayı mümkün kılar.",
      "Ürün paraben, parafin, yağlar, mineral yağlar, silikon ve formaldehit içermez. Renk ve kokudaki değişiklikler doğal bitki fonksiyonel maddelerinden kaynaklanır ve bozulma anlamına gelmez. Üretimden itibaren 2 yıl, açıldıktan sonra 6 ay kullanım süresi vardır.",
    ],
    highlights: [
      "Biyotin eksenli, 9 fonksiyonel bileşen",
      "Hem kıl fırça hem aplikatör içerir",
      "Paraben, parafin, mineral yağ, silikon, formaldehit İÇERMEZ",
      "10 ml hacim",
      "Üretimden 2 yıl; açıldıktan sonra 6 ay",
    ],
    ingredients: [
      "Biyotin — güçlendirici, besleyici, büyümeyi teşvik edici",
      "Metiyonin — güçlendirici, yenileyici, besleyici",
      "Hidrolize keratin — yeniden yapılandırıcı, hacim ve parlaklık",
      "Bitki kolajeni — doldurucu, güçlendirici",
      "Bitki gliserini — nemlendirici, yumuşatıcı",
      "Tokoferol (E vitamini asetat) — antioksidan",
      "Linoleik asit (F vitamini) — besleyici",
      "Askorbil tetraizopalmitat (C vitamini) — aydınlatıcı",
      "Pantenol (Pro-vitamin B5) — güçlendirir, nemlendirir",
    ],
    usage: [
      "Temiz kirpiklere kökten uca doğru uygulanır.",
      "Kaşta seyrek alanlar için aplikatör ucu kullanılır.",
      "Her kullanımdan sonra kapak sıkıca kapatılır.",
      "Serin ortamda, doğrudan ışıktan uzak saklanır.",
    ],
    specs: [
      ["Ürün kodu", "ML-BSH"],
      ["Hacim", "10 ml"],
      ["Uygulayıcı", "Kıl fırça + aplikatör"],
      ["Bileşen sayısı", "9 fonksiyonel bileşen"],
      ["Yaş sınırı", "18 yaş altında önerilmez"],
    ],
    image: "biotin-serum-home.jpg",
    sourceUrl: "https://www.mylamination.com.tr/biotin-serum-home/",
    inStock: true,
  },
  {
    slug: "extreme-lift-mascara",
    name: "Extreme Lift Mascara",
    category: "evde-bakim",
    scope: "kirpik",
    summary:
      "Laminasyon görmüş kirpikleri korumak için formüle edilmiş uzatıcı maskara; %91 doğal kökenli, İtalya üretimi, 8.5 ml.",
    seoTitle: "My Lamination Extreme Lift Mascara | Lifting Etkili Maskara",
    seoDesc:
      "Extreme Lift Mascara: laminasyonlu kirpikler için formüle edilmiş uzatıcı maskara. %91 doğal kökenli, paraben ve silikon içermez. İtalya, 8.5 ml.",
    keywords: [
      "extreme lift mascara",
      "my lamination maskara",
      "lifting etkili maskara",
      "laminasyonlu kirpik maskarası",
    ],
    body: [
      "Kirpik lifting sonrası maskara kullanımı çoğu zaman yanlış anlaşılır: liftingin amacı maskaraya ihtiyacı azaltmaktır, ama tamamen bırakmak zorunlu değildir. Sorun, standart maskaraların çoğunun silikon ve ağır polimer içermesi — bunlar laminasyon görmüş kirpiğin yüzeyini yükler ve temizlenirken kirpiği yorar. Extreme Lift Mascara özellikle laminasyon işlemi görmüş kirpikleri korumak için formüle edilmiştir.",
      "Formülün merkezinde Yeniden Diriliş Bitkisi bulunur; üretici bunun kirpik büyümesini uyardığını belirtir. Ayçiçeği yağı ve carnauba mumu kirpiği yeniden yapılandırmaya yardımcı olarak uzatıcı etki yaratır. Ürün %91 doğal kökenli içerikten üretilir ve paraben, talk, alkol, silikon, gluten ile mineral yağ içermez.",
      "İtalya'da üretilir, net hacmi 8.5 ml'dir. Üreticinin önemli bir notu var: düz kirpikler için önerilmez — bu maskara mevcut kıvrımı uzatır ve belirginleştirir, kıvrım yaratmaz. Yani lifting yapılmış kirpikte iyi çalışır, işlem görmemiş düz kirpikte beklentiyi karşılamaz.",
    ],
    highlights: [
      "Laminasyon görmüş kirpikleri korumak için formüle edilmiştir",
      "%91 doğal kökenli içerik",
      "Paraben, talk, alkol, silikon, gluten, mineral yağ içermez",
      "Yeniden Diriliş Bitkisi, ayçiçeği yağı, carnauba mumu",
      "İtalya üretimi, 8.5 ml",
      "Düz kirpikler için önerilmez",
    ],
    usage: [
      "Temiz kirpiklere köklerden uçlara doğru uygulanır.",
      "İstenen sonuca ulaşana kadar uygulama tekrarlanabilir.",
      "Her kullanımdan sonra sıkıca kapatılır.",
      "Serin ortamda, doğrudan ışıktan uzak saklanır.",
    ],
    specs: [
      ["Ürün kodu", "ML-ELM"],
      ["Hacim", "8.5 ml"],
      ["Üretim yeri", "İtalya"],
      ["Doğal kökenli içerik", "%91"],
    ],
    faq: [
      {
        q: "Kirpik lifting sonrası maskara kullanılabilir mi?",
        a: "İlk 24 saat kullanılmaz. Sonrasında kullanılabilir; ancak silikon ve ağır polimer içermeyen, laminasyonlu kirpik için formüle edilmiş bir maskara tercih edilmesi kirpiğin yorulmasını azaltır. Su bazlı, kolay temizlenen ürünler önerilir.",
      },
    ],
    image: "extreme-lift-mascara.jpg",
    sourceUrl: "https://www.mylamination.com.tr/extreme-lift-mascara/",
    inStock: true,
  },
  {
    slug: "extreme-volume-mascara",
    name: "Extreme Volume Mascara",
    category: "evde-bakim",
    scope: "kirpik",
    summary:
      "Vegan hacim maskarası; çayır üçgülü, yenidünya ve monoi yağıyla kirpiğe dolgunluk verir.",
    seoTitle: "My Lamination Extreme Volume Mascara | Vegan Hacim Maskarası",
    seoDesc:
      "Extreme Volume Mascara: vegan hacim maskarası. Çayır üçgülü, yenidünya ve monoi yağı. Paraben, talk, alkol, silikon ve gluten içermez.",
    keywords: [
      "extreme volume mascara",
      "vegan maskara",
      "hacim veren maskara",
      "my lamination volume mascara",
    ],
    body: [
      "Extreme Volume Mascara, Lift Mascara'nın hacim odaklı karşılığıdır. Lift versiyonu uzunluk ve mevcut kıvrımı belirginleştirirken, Volume kirpiğe maksimum hacim ve dolgunluk kazandırmaya odaklanır. İkisi arasındaki seçim kirpiğin ihtiyacına göre yapılır: seyrek kirpikte hacim, kısa kirpikte uzunluk öne çıkar.",
      "Formülde üç bileşen öne çıkar: çayır üçgülü dolgun ve kalın kirpikler için hacim sağlar, yenidünya kirpik uzunluğunu artırır, monoi yağı kirpiği besleyip koruyarak sağlıklı ve parlak bir görünüm verir.",
      "Ürün tamamen vegan bir formülasyona sahiptir ve paraben, talk, alkol, silikon, gluten ile mineral yağ içermez. Doğal bitkisel içeriklerden kaynaklanan renk ve koku değişiklikleri normaldir.",
    ],
    highlights: [
      "Tamamen vegan formülasyon",
      "Çayır üçgülü — hacim",
      "Yenidünya — uzunluk",
      "Monoi yağı — besler ve parlatır",
      "Paraben, talk, alkol, silikon, gluten, mineral yağ içermez",
    ],
    usage: [
      "Temiz kirpiklere köklerden uçlara doğru uygulanır.",
      "İstenen sonuca ulaşana kadar tekrarlanabilir.",
      "Kullanımdan sonra kapatılır; serin ve ışıktan uzak saklanır.",
    ],
    specs: [
      ["Ürün kodu", "ML-EVM"],
      ["Özellik", "Vegan"],
      ["Odak", "Hacim ve dolgunluk"],
    ],
    image: "extreme-volume-mascara.jpg",
    sourceUrl: "https://www.mylamination.com.tr/extreme-volume-mascara/",
    inStock: true,
  },
  {
    slug: "brow-color-fiber-kas-maskarasi",
    name: "Brow Color Fiber Kaş Maskarası",
    category: "evde-bakim",
    scope: "kas",
    summary:
      "Fiber içerikli, suya dayanıklı kaş maskarası; boşlukları doldurur ve kaş tellerini tek tek kavrar. 5 ml.",
    seoTitle: "Brow Color Fiber Kaş Maskarası | Fiberli, Suya Dayanıklı",
    seoDesc:
      "My Lamination Brow Color Fiber kaş maskarası: fiber içerikli, suya dayanıklı. Kaş boşluklarını doldurur, dolgun görünüm verir. 5 ml, 2 ton.",
    keywords: [
      "brow color fiber",
      "kaş maskarası",
      "fiberli kaş maskarası",
      "suya dayanıklı kaş maskarası",
    ],
    body: [
      "Kaş laminasyonu kılları şekillendirir ama var olmayan kılı yerine koymaz. Kaşta gerçek boşluk varsa sonucu tamamlayan şey günlük kullanılan bir kaş ürünüdür. Brow Color Fiber, içeriğindeki fiberler sayesinde kaşı belirginleştirir, boşlukları doldurur ve doğal bir hacim kazandırır.",
      "Fiberli yapı, kaş tellerini tek tek kavrayarak dolgun bir görünüm oluşturur. Suya dayanıklı formülü sayesinde kaş gün boyu sabit kalır — laminasyonla elde edilen taranmış duruşu bozmayan bir sabitlik sağlar.",
      "5 ml hacimde, orta kahverengi ve koyu kahverengi olmak üzere iki tonda sunulur. Yalnızca harici kullanım içindir; 18 yaş altı ile hamile ve emziren bireylerde kullanılması önerilmez.",
    ],
    highlights: [
      "Fiber içerik — kaş tellerini tek tek kavrar",
      "Kaş boşluklarını doldurur, doğal hacim verir",
      "Suya dayanıklı formül; gün boyu sabit",
      "2 ton: orta kahverengi, koyu kahverengi",
      "5 ml hacim",
    ],
    usage: [
      "Kaşlar yukarı doğru, tüylerin çıkış yönünde taranır.",
      "Daha belirgin ve yoğun görünüm için aplikatör ucuyla istenen alanlar doldurulur.",
      "Her kullanımdan sonra şişe sıkıca kapatılır.",
    ],
    specs: [
      ["Hacim", "5 ml"],
      ["Renkler", "Orta kahverengi, koyu kahverengi"],
      ["Özellik", "Suya dayanıklı, fiberli"],
      ["Yaş sınırı", "18 yaş altında önerilmez"],
    ],
    image: "brow-color-fiber-kas-maskarasi.jpg",
    sourceUrl: "https://www.mylamination.com.tr/brow-color-fiber-kas-maskarasi/",
    inStock: true,
  },
  {
    slug: "brow-designer-kas-kalemi",
    name: "Brow Designer Kaş Kalemi",
    category: "evde-bakim",
    scope: "kas",
    summary:
      "Üç uçlu aplikatörlü kaş kalemi; %82 doğal içerik oranı, gerçek kıl efekti ve 10 saate kadar kalıcılık.",
    seoTitle: "Brow Designer Kaş Kalemi | 3 Uçlu, 10 Saat Kalıcı",
    seoDesc:
      "My Lamination Brow Designer kaş kalemi: 3 uçlu aplikatör, gerçek kıl efekti, %82 doğal içerik, 10 saate kadar kalıcılık.",
    keywords: [
      "brow designer kaş kalemi",
      "kaş kalemi",
      "kıl efektli kaş kalemi",
      "my lamination kaş kalemi",
    ],
    body: [
      "Brow Designer, kaşa gerçek kıl efekti vererek doğal ve dolgun bir görünüm kazandıran kalemdir. Ayırt edici tarafı üç uçlu özel aplikatörü: düz uç kaşı doldurmak, kesik uç daha keskin çizgi ve hat tamamlamak için kullanılır. Bu, tek bir kalemle hem doldurma hem çizim yapmayı mümkün kılar.",
      "%82 doğal içerik oranına sahip formülü cilt dostudur ve kaşta 10 saate kadar kalıcılık sağlar. Laminasyon yapılmış kaşta bu ürünün rolü sınırlıdır ama anlamlıdır: laminasyon kılı yukarı taşır, kalem kılın olmadığı boşluğu kapatır.",
      "İçeriği su bazlıdır: aqua, butilen glikol, pentilen glikol, poliakrilat-21, akasya senegal zamkı ve gliseril kaprilat gibi bileşenlerden oluşur. Yalnızca harici kullanım içindir; gözle temasından kaçınılmalıdır.",
    ],
    highlights: [
      "Üç uçlu özel aplikatör",
      "Gerçek kıl efekti — doğal, dolgun görünüm",
      "%82 doğal içerik oranı",
      "10 saate kadar kalıcılık",
      "Su bazlı, cilt dostu formül",
    ],
    usage: [
      "Temiz ve kuru kaşlara uygulanır.",
      "Kalem 45° eğimle tutularak kaş çıkış yönünde çizgiler oluşturulur.",
      "Düz uçla kaşlar doldurulur.",
      "Daha keskin etki için kesik uç kısmıyla kaş çizimleri tamamlanır.",
      "Seyrek alanlar doldurularak doğal görünüm elde edilir.",
    ],
    specs: [
      ["Ürün kodu", "ML-BD"],
      ["Aplikatör", "3 uçlu"],
      ["Kalıcılık", "10 saate kadar"],
      ["Doğal içerik oranı", "%82"],
    ],
    image: "brow-designer-kas-kalemi.jpg",
    sourceUrl: "https://www.mylamination.com.tr/brow-designer-kas-kalemi/",
    inStock: false,
  },

  // -------------------------------------------------------------------- cilt
  {
    slug: "mineral-scrub",
    name: "Mineral Scrub",
    category: "cilt",
    scope: "kas",
    summary:
      "Deniz tuzu, hamamelis ve nar özlü peeling; işlem öncesi kaş çevresindeki ölü tabakayı temizler. Haftalık kullanım.",
    seoTitle: "My Lamination Mineral Scrub | İşlem Öncesi Peeling",
    seoDesc:
      "My Lamination Mineral Scrub: deniz tuzu, hamamelis ve nar özlü peeling. Kalıcı makyaj ve laminasyon öncesi kaş çevresi hazırlığı. Haftalık.",
    keywords: [
      "my lamination mineral scrub",
      "kaş peeling",
      "işlem öncesi cilt hazırlığı",
      "mineral peeling",
    ],
    body: [
      "Mineral Scrub, cildi ölü hücrelerden arındıran ve kalıntıları gideren peeling ürünüdür. Deniz tuzları, hamamelis ve nar özü içeren formülü cildi kurutmadan ve aşındırmadan temizler; minerallerle zenginleştirilmiş içeriği cilt üzerinde canlandırıcı bir etki bırakır.",
      "Ürünün laminasyon ve kalıcı makyajla ilişkisi doğrudandır: işlem öncesinde yüzdeki ve kaşlardaki ölü tabakanın temizlenmesi, uygulanacak ürünün kılla ve ciltle düzgün temas etmesini sağlar. Üretici, ürünün kalıcı makyaj işlemi öncesinde bu amaçla tercih edilebileceğini belirtir.",
      "Haftalık kullanıma uygundur. Cilt bakım rutinine eklendiğinde daha aydınlık ve ferah bir görünüm kazanılmasına yardımcı olur. İşlem gününde değil, işlemden birkaç gün önce kullanılması daha uygundur — taze peeling sonrası cilt hassas olur.",
    ],
    highlights: [
      "Deniz tuzları, hamamelis, nar özü",
      "Cildi kurutmadan ve aşındırmadan temizler",
      "Minerallerle zenginleştirilmiş — canlandırıcı",
      "Kalıcı makyaj / laminasyon öncesi hazırlık",
      "Haftalık kullanıma uygun",
    ],
    specs: [
      ["Ürün kodu", "ML-MS"],
      ["Kullanım sıklığı", "Haftalık"],
      ["Tür", "Peeling / scrub"],
    ],
    image: "mineral-scrub.jpg",
    sourceUrl: "https://www.mylamination.com.tr/mineral-scrub/",
    inStock: true,
  },
  {
    slug: "nude-skin-cream",
    name: "Nude Skin Cream (SPF 20 BB Krem)",
    category: "cilt",
    scope: "ikisi",
    summary:
      "SPF 20 içeren renkli BB krem; dört ton, dikenli armut, çarkıfelek, aynısefa ve salatalık özleriyle nemlendirir.",
    seoTitle: "My Lamination Nude Skin Cream | SPF 20 BB Krem",
    seoDesc:
      "Nude Skin Cream: SPF 20 içeren renkli BB krem. Light, Medium, Dark, Very Dark. Dikenli armut, çarkıfelek ve salatalık özleriyle nemlendirir.",
    keywords: [
      "nude skin cream",
      "my lamination bb krem",
      "spf 20 renkli krem",
      "kaş sonrası güneş koruma",
    ],
    body: [
      "Nude Skin Cream, SPF 20 içeren renkli bir BB kremdir. Aktif nemlendiricilerle cildi mükemmelleştirir ve aydınlatır; sabahları günlük kullanım için önerilir. Açık, orta, koyu ve çok koyu olmak üzere dört tonda sunulur.",
      "Formülde dikenli armuttan elde edilen Opuntia Ficus öne çıkar: yoğun nemlendiricidir ve kızarıklığı yatıştırmada etkilidir. Buna çarkıfelek, aynısefa ve salatalığın aydınlatıcı ve yatıştırıcı özleri eklenir.",
      "Bu ürünün kaş uygulamalarıyla bağı güneş korumasıdır. Kaş laminasyonu ve özellikle pigment içeren kalıcı makyaj sonrası bölgenin güneşten korunması, hem sonucun hem cildin lehinedir. Kaş üstüne uygulanmadan, kaş çevresindeki cilde kullanılır.",
    ],
    highlights: [
      "SPF 20 koruma + renk verme",
      "4 ton: Light, Medium, Dark, Very Dark",
      "Opuntia Ficus (dikenli armut) — yoğun nemlendirici",
      "Çarkıfelek, aynısefa, salatalık özleri",
      "Sabah günlük kullanım için önerilir",
    ],
    specs: [
      ["Tonlar", "Light, Medium, Dark, Very Dark"],
      ["Koruma", "SPF 20"],
      ["Kullanım", "Sabah, günlük"],
    ],
    image: "nude-skin-cream.jpg",
    sourceUrl: "https://www.mylamination.com.tr/nude-skin-cream/",
    inStock: true,
  },
  {
    slug: "sun-cream-spf-30",
    name: "Sun Cream SPF 30",
    category: "cilt",
    scope: "ikisi",
    summary:
      "Fiziksel (mineral) filtreli SPF 30 güneş kremi; %97 doğal kökenli, kuru ve hassas ciltler için.",
    seoTitle: "My Lamination Sun Cream SPF 30 | Fiziksel Filtreli",
    seoDesc:
      "My Lamination Sun Cream SPF 30: çinko oksit fiziksel filtreli güneş kremi. %97 doğal kökenli, aloe vera ve shea yağlı. Hassas ciltler için.",
    keywords: [
      "my lamination sun cream",
      "spf 30 fiziksel filtre",
      "mineral güneş kremi",
      "kalıcı makyaj sonrası güneş koruma",
    ],
    body: [
      "Sun Cream SPF 30, fiziksel (mineral) filtre kullanan bir güneş kremidir. Bu ayrım kalıcı makyaj ve kaş uygulamaları sonrasında önemlidir: fiziksel filtreler güneş ışığını yansıtarak ve dağıtarak korur, cilde uygulandıkları anda etki eder ve etkinleşme süresi gerektirmez. Kimyasal filtrelere göre daha ışık stabilidirler ve cilt tahrişine yol açma olasılıkları daha düşüktür.",
      "Formül %97 doğal kökenli işlevsel bileşenlerle zenginleştirilmiştir: organik aloe vera suyu ve shea yağı nemlendirici ve yatıştırıcı etki verir, üzüm çekirdeği yağı kılcal mikro dolaşım üzerinde sıkılaştırıcı ve uyarıcı özellik gösterir, mango ekstresi ile E vitamini oksidatif stresi azaltır.",
      "Krem ekstra nemlendirme sağladığı için kuru ve hassas cilde sahip kişiler için uygundur. Uzun süreli banyodan ve güneşe uzun süre maruz kalmaktan sonra tekrar uygulanması gerekir.",
    ],
    highlights: [
      "Fiziksel (mineral) filtre — çinko oksit",
      "Uygulandığı anda korur; bekleme gerektirmez",
      "UVA ve UVB'ye karşı koruma",
      "%97 doğal kökenli işlevsel bileşen",
      "Aloe vera, shea yağı, üzüm çekirdeği yağı, mango, E vitamini",
      "Kuru ve hassas ciltler için uygun",
    ],
    usage: [
      "Kullanmadan önce çalkalanır.",
      "Yüze (gözden kaçınarak) ve vücuda uygulanır.",
      "Uzun süreli banyo ve güneşe maruz kalma sonrası tekrar uygulanır.",
    ],
    specs: [
      ["Ürün kodu", "ML-SCSPF30"],
      ["Koruma", "SPF 30, fiziksel filtre"],
      ["Doğal kökenli içerik", "%97"],
      ["Cilt tipi", "Kuru ve hassas"],
    ],
    image: "sun-cream-spf-30.jpg",
    sourceUrl: "https://www.mylamination.com.tr/sun-cream-spf-30/",
    inStock: false,
  },
  {
    slug: "sun-oil-spray-spf-50",
    name: "Sun Oil Spray SPF 50+",
    category: "cilt",
    scope: "ikisi",
    summary:
      "Hafif, hızlı emilen SPF 50+ sprey yağ; havuç yağı, kadife çiçeği ve yeşil çay özüyle antioksidan destek.",
    seoTitle: "My Lamination Sun Oil Spray SPF 50+ | Sprey Güneş Yağı",
    seoDesc:
      "My Lamination Sun Oil Spray SPF 50+: hafif, hızlı emilen sprey güneş yağı. Havuç yağı, kadife çiçeği, yeşil çay özü. Kuru ciltler için.",
    keywords: [
      "sun oil spray spf 50",
      "sprey güneş yağı",
      "my lamination güneş koruma",
      "spf 50 yağ",
    ],
    body: [
      "Sun Oil Spray, SPF 50+ koruma sunan hafif bir sprey yağdır. Havuç yağı, kadife çiçeği özü ve antioksidan özellikli yeşil çay özü gibi işlevsel bileşenlerle zenginleştirilmiştir; bu aktifler cilt ve saçın nemlendirilmesine ve esnekliğinin artmasına yardımcı olur. Yağlılık oranı azaltılmış, hızlı emilen bir formüldür.",
      "Ürün cildi parlak ve nemli bırakır; kuru ciltler ve bronz ten hedefi için uygundur. Üretici burada açık bir sınır koyar: Sun Oil 50+, geleneksel güneş kremleri kadar etkili koruma sağlamayabilir ve hassas ciltler ile su sporlarında uzun süre kalan kişiler için uygun olmayabilir.",
      "Bu nedenle kalıcı makyaj veya taze işlem sonrası bölge koruması için tercih edilmez; genel vücut kullanımına yönelik bir üründür. İşlem bölgesinin korunmasında fiziksel filtreli krem daha uygundur.",
    ],
    highlights: [
      "SPF 50+ koruma, sprey form",
      "Havuç yağı, kadife çiçeği, yeşil çay özü",
      "Antioksidan; cilt ve saç esnekliğini artırır",
      "Hızlı emilir, yağlılık oranı azaltılmış",
      "Hassas ciltler ve su sporları için önerilmez",
    ],
    usage: [
      "Güneşe maruz kalmadan önce yeterli miktarda uygulanır.",
      "Terledikten veya ıslandıktan sonra sık sık yeniden uygulanır.",
      "Cilt tipine uygun koruma faktörü seçilir.",
    ],
    specs: [
      ["Ürün kodu", "ML-SOSSPF50"],
      ["Koruma", "SPF 50+"],
      ["Form", "Sprey yağ"],
      ["Cilt tipi", "Kuru cilt"],
    ],
    image: "sun-oil-spray-spf-50.jpg",
    sourceUrl: "https://www.mylamination.com.tr/sun-oil-spray-spf-50/",
    inStock: false,
  },
];

/** Kategori sırası — hub sayfası ve sitemap bu sırayı kullanır. */
export const ML_CATEGORY_ORDER: MlCategory[] = [
  "uygulama",
  "ekipman",
  "evde-bakim",
  "cilt",
];

export const ML_SCOPE_LABEL: Record<MlScope, string> = {
  kas: "Kaş laminasyonu",
  kirpik: "Kirpik lifting",
  ikisi: "Kaş ve kirpik",
};
