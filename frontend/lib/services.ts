// TR SEO content per service group. One indexable page each at /hizmetler/<slug>.
// Written for Ankara-local Turkish search + AI extraction: keyword in the first
// sentence, concrete specifics (duration, longevity), answer-first FAQ.

export type ServiceSeo = {
  slug: string;
  seoTitle: string; // ≤60 chars
  seoDesc: string; // ≤160 chars
  keywords: string[];
  intro: string; // keyword in first sentence
  benefits: string[];
  process: string[];
  aftercare: string;
  faq: { q: string; a: string }[]; // ≥3
  related: string[]; // other slugs
  gallery?: string[]; // owner: paths to real work photos, e.g. "/images/micro-1.png"
};

export const SERVICE_SEO: ServiceSeo[] = [
  {
    slug: "microblading",
    seoTitle: "Microblading Ankara | Stria Studio",
    seoDesc:
      "Ankara Çankaya'da microblading: kıl tekniğiyle doğal, kalıcı kaşlar. Steril ekipman, yüze özel tasarım. WhatsApp'tan randevu al.",
    keywords: [
      "microblading ankara",
      "ankara microblading",
      "kıl tekniği kaş",
      "kalıcı kaş ankara",
      "çankaya microblading",
    ],
    intro:
      "Microblading, Ankara Çankaya'daki Stria Studio'da kıl tekniğiyle uygulanan yarı kalıcı bir kaş işlemidir. Her kıl tek tek çizilir; sonuç gerçek kaştan ayırt edilemeyecek kadar doğaldır ve 12–18 ay kalıcıdır.",
    benefits: [
      "Gerçekçi kıl görünümü — makyajsız da dolgun kaş",
      "Yüz simetrisine göre birebir tasarım ve ölçüm",
      "Steril, tek kullanımlık iğne ve kaliteli pigment",
      "12–18 ay kalıcılık, rötuş kontrolü dahil",
    ],
    process: [
      "Ücretsiz ön görüşme ve yüz analizi",
      "Kaş tasarımı ve renk seçimi — onayınızla başlanır",
      "Anestezik krem sonrası kıl kıl uygulama (~90 dakika)",
      "4–6 hafta sonra rötuş seansı",
    ],
    aftercare:
      "İlk 7–10 gün kaşları ıslatmaktan, terlemekten ve güneşten koruyun; verilen bakım kremini uygulayın. Oluşan ince kabuklar kendiliğinden dökülür.",
    faq: [
      {
        q: "Microblading Ankara'da ne kadar kalıcı?",
        a: "Cilt tipine bağlı olarak 12–18 ay kalıcıdır. Yıllık rötuşla görünüm korunur.",
      },
      {
        q: "İşlem acıtır mı?",
        a: "Uygulamadan önce anestezik krem sürülür; çoğu kişi yalnızca hafif bir kaşınma hisseder.",
      },
      {
        q: "Kimler microblading yaptıramaz?",
        a: "Hamileler, emzirenler, kan sulandırıcı kullananlar ve bazı cilt hastalığı olanlar uygun değildir; ön görüşmede değerlendirilir.",
      },
    ],
    related: ["kas-pudralama", "kas-laminasyon"],
  },
  {
    slug: "kas-pudralama",
    seoTitle: "Kaş Pudralama Ankara | Powder Brows",
    seoDesc:
      "Ankara'da kaş pudralama (powder brows): pudra dokusuyla dolgun, makyajlı kaş. Yağlı ciltlere ideal, uzun ömürlü. Randevu için yazın.",
    keywords: [
      "kaş pudralama ankara",
      "powder brows ankara",
      "pudra kaş ankara",
      "gölgeli kaş",
    ],
    intro:
      "Kaş pudralama, Ankara Stria Studio'da kaşlara pudra makyajı etkisi veren yarı kalıcı bir tekniktir. Noktalama yöntemiyle uygulanan pigment dolgun, hafif gölgeli bir görünüm bırakır; yağlı ciltlerde microblading'e göre daha uzun ömürlüdür.",
    benefits: [
      "Dolgun, makyajlı kaş görünümü",
      "Yağlı ve karma ciltler için ideal",
      "Microblading'e göre daha kalıcı sonuç",
      "İyileşme sürecinde daha az hassasiyet",
    ],
    process: [
      "Ön görüşme ve cilt/kaş analizi",
      "Kaş tasarımı ve renk yoğunluğu seçimi",
      "Noktalama tekniğiyle uygulama (~90 dakika)",
      "4–6 hafta sonra rötuş",
    ],
    aftercare:
      "İlk 7–10 gün kaşları kuru tutun, güneş ve sauna gibi terleten ortamlardan kaçının, verilen kremi uygulayın.",
    faq: [
      {
        q: "Kaş pudralama ne kadar kalıcı?",
        a: "Ortalama 1,5–2 yıl kalıcıdır; yağlı ciltte biraz daha kısa sürebilir.",
      },
      {
        q: "Microblading'den farkı nedir?",
        a: "Microblading kıl kıl çizgiler yapar; pudralama pudra makyajı gibi dolgun bir gölge bırakır. Yağlı ciltlerde pudralama daha iyi tutar.",
      },
      {
        q: "İşlem sonrası kaşlar çok koyu mu olur?",
        a: "İlk günlerde renk koyu görünür, 7–10 günde gerçek tonuna açılır.",
      },
    ],
    related: ["microblading", "kas-laminasyon"],
  },
  {
    slug: "eyeliner",
    seoTitle: "Kalıcı Eyeliner Ankara | Stria Studio",
    seoDesc:
      "Ankara'da kalıcı eyeliner: simetrik, silinmeyen ince çizgi bakışları belirginleştirir. Steril, yüze özel uygulama. Randevu alın.",
    keywords: [
      "kalıcı eyeliner ankara",
      "eyeliner ankara",
      "kalıcı göz makyajı ankara",
      "ankara kalıcı eyeliner",
    ],
    intro:
      "Kalıcı eyeliner, Ankara Stria Studio'da kirpik hattına uygulanan silinmeyen ve simetrik bir göz makyajıdır. İnce ya da belirgin kalınlıkta yapılabilir, her sabah eyeliner çizme zahmetini ortadan kaldırır ve 1–3 yıl kalıcıdır.",
    benefits: [
      "Her sabah göz makyajı derdine son",
      "İki gözde birebir simetri",
      "İnce doğal ya da belirgin kalınlık seçeneği",
      "Suya, tere ve gün boyu dayanıklı",
    ],
    process: [
      "Göz yapısı analizi ve kalınlık kararı",
      "Anestezik krem uygulaması",
      "Kirpik hattına pigment uygulama (~60–90 dakika)",
      "4–6 hafta sonra rötuş",
    ],
    aftercare:
      "İlk hafta gözü ovmaktan, makyajdan ve sudan koruyun; kaşınma olursa krem uygulayın, kabukları koparmayın.",
    faq: [
      {
        q: "Kalıcı eyeliner ne kadar kalıcı?",
        a: "1–3 yıl arasında kalıcıdır; ince uygulamalar daha erken açılır.",
      },
      {
        q: "Lens kullanıyorum, sorun olur mu?",
        a: "İşlem sırasında lensler çıkarılır; iyileşene kadar birkaç gün gözlük önerilir.",
      },
      {
        q: "Doğal görünür mü?",
        a: "İsteğe göre kirpik dibinde ince ve doğal ya da belirgin çizgi yapılabilir.",
      },
    ],
    related: ["dipliner", "microblading"],
  },
  {
    slug: "dipliner",
    seoTitle: "Dipliner Ankara | Kirpik Dibi Dolgusu",
    seoDesc:
      "Ankara'da dipliner: kirpik diplerine ince pigment ile daha yoğun, uyanık bakış. Doğal, fark edilmeyen kalıcı dokunuş. Randevu alın.",
    keywords: [
      "dipliner ankara",
      "kirpik dibi dolgusu ankara",
      "kirpik dibi pigment",
      "doğal eyeliner ankara",
    ],
    intro:
      "Dipliner, Ankara Stria Studio'da yalnızca kirpik diplerine uygulanan, eyeliner'a göre daha ince ve doğal bir kalıcı makyaj işlemidir. Kirpikleri daha sık ve dolgun gösterir; makyaj yapılmış izlenimi vermeden bakışları açar.",
    benefits: [
      "Kirpikler daha sık ve dolgun görünür",
      "Çizgi belli olmadan doğal etki",
      "Açık, uyanık bir bakış",
      "1–3 yıl kalıcı",
    ],
    process: [
      "Kirpik hattı analizi",
      "Anestezik krem uygulaması",
      "Kirpik diplerine noktalı pigment (~60 dakika)",
      "4–6 hafta sonra rötuş",
    ],
    aftercare:
      "İlk hafta gözü sudan ve makyajdan koruyun, ovuşturmayın; oluşan ince kabukları kendiliğinden dökülmeye bırakın.",
    faq: [
      {
        q: "Dipliner ile eyeliner farkı nedir?",
        a: "Dipliner sadece kirpik diplerine uygulanır ve çizgi oluşturmaz; eyeliner ise görünür bir hat çizer.",
      },
      {
        q: "Ne kadar kalıcı?",
        a: "1–3 yıl kalıcıdır; ince uygulama olduğu için zamanla doğal şekilde açılır.",
      },
      {
        q: "Acıtır mı?",
        a: "Anestezik krem sayesinde çoğu kişi yalnızca hafif bir his duyar.",
      },
    ],
    related: ["eyeliner", "kirpik-lifting"],
  },
  {
    slug: "dudak-renklendirme",
    seoTitle: "Dudak Renklendirme Ankara | Lip Blush",
    seoDesc:
      "Ankara'da dudak renklendirme (lip blush): dudaklara doğal renk, tanım ve dolgunluk. Solgun dudaklara canlılık. Randevu için yazın.",
    keywords: [
      "dudak renklendirme ankara",
      "lip blush ankara",
      "dudak pigmentasyonu ankara",
      "kalıcı dudak rengi",
    ],
    intro:
      "Dudak renklendirme (lip blush), Ankara Stria Studio'da dudaklara doğal renk, netlik ve dolgunluk kazandıran yarı kalıcı bir işlemdir. Soluk ya da sınırları belirsiz dudaklara sağlıklı bir canlılık verir; renk 1–2 yıl kalıcıdır.",
    benefits: [
      "Dudaklara doğal, sağlıklı renk",
      "Belirgin dudak sınırı ve dolgunluk hissi",
      "Solgun ve açık tonlu dudaklara canlılık",
      "1–2 yıl kalıcı",
    ],
    process: [
      "Ton ve dudak sınırı planlaması",
      "Anestezik krem uygulaması",
      "Pigment uygulama (~90 dakika)",
      "4–6 hafta sonra rötuş",
    ],
    aftercare:
      "İlk hafta dudakları nemli tutun, baharatlı-sıcak yiyeceklerden ve güneşten kaçının, kabukları koparmayın.",
    faq: [
      {
        q: "Dudak renklendirme dudağı şişirir mi?",
        a: "Dolgu değildir; renk ve tanım verir. Hafif dolgunluk hissi görsel etkiden gelir.",
      },
      {
        q: "Ne kadar kalıcı?",
        a: "1–2 yıl kalıcıdır; renk zamanla doğal şekilde açılır.",
      },
      {
        q: "Uçuk geçmişim var, yaptırabilir miyim?",
        a: "İşlem uçuğu tetikleyebilir; öncesinde doktor önerisiyle koruyucu tedavi gerekir.",
      },
    ],
    related: ["microblading", "eyeliner"],
  },
  {
    slug: "kas-laminasyon",
    seoTitle: "Kaş Laminasyonu Ankara | Brow Lamination",
    seoDesc:
      "Ankara'da kaş laminasyonu: kaş kıllarını şekillendirip sabitler, dolgun ve bakımlı görünüm. İğnesiz, ~6 hafta etkili. Randevu alın.",
    keywords: [
      "kaş laminasyonu ankara",
      "brow lamination ankara",
      "kaş kaldırma ankara",
      "kaş bakımı ankara",
    ],
    intro:
      "Kaş laminasyonu, Ankara Stria Studio'da kaş kıllarını yukarı doğru şekillendirip sabitleyen iğnesiz bir bakım işlemidir. Seyrek ya da dağınık kaşları dolgun, düzenli ve bakımlı gösterir; etkisi yaklaşık 6 hafta sürer.",
    benefits: [
      "İğnesiz ve acısız uygulama",
      "Dolgun, düzenli ve kaldırılmış kaş",
      "Seyrek kaşları toparlar",
      "Yaklaşık 6 hafta etki",
    ],
    process: [
      "Kaş analizi ve şekil planı",
      "Kılları yumuşatma ve yukarı sabitleme",
      "Besleyici bakım, isteğe bağlı renklendirme",
      "Şekillendirme ve alma (~45–60 dakika)",
    ],
    aftercare:
      "İlk 24 saat kaşları ıslatmayın ve dokunmayın; sonrasında düzenli olarak besleyici yağ uygulayın.",
    faq: [
      {
        q: "Kaş laminasyonu kalıcı mıdır?",
        a: "Kalıcı değildir; etkisi yaklaşık 6 hafta sürer, sonra kıllar eski haline döner.",
      },
      {
        q: "Microblading'den farkı nedir?",
        a: "Microblading pigmentle kalıcı kaş çizer; laminasyon kendi kıllarınızı şekillendirir, boya veya iğne şart değildir.",
      },
      {
        q: "Kaşlara zarar verir mi?",
        a: "Doğru sürede ve besleyici bakımla uygulandığında zarar vermez.",
      },
    ],
    related: ["microblading", "kas-pudralama"],
  },
  {
    slug: "kirpik-lifting",
    seoTitle: "Kirpik Lifting Ankara | Lash Lift",
    seoDesc:
      "Ankara'da kirpik lifting (lash lift): kendi kirpiklerinizi kıvırıp uzun gösterir. Maskarasız açık bakış, ~6–8 hafta kalıcı. Randevu alın.",
    keywords: [
      "kirpik lifting ankara",
      "lash lift ankara",
      "kirpik kaldırma ankara",
      "kirpik perması ankara",
    ],
    intro:
      "Kirpik lifting (lash lift), Ankara Stria Studio'da kendi kirpiklerinizi dipten kıvırarak daha uzun ve dolgun gösteren bir işlemdir. Takma kirpik veya maskara olmadan açık, uyanık bir bakış verir; etkisi 6–8 hafta sürer.",
    benefits: [
      "Kendi kirpikleriniz — takma kirpik yok",
      "Maskarasız açık, uyanık bakış",
      "Suya ve gün boyu dayanıklı",
      "Yaklaşık 6–8 hafta kalıcı",
    ],
    process: [
      "Kirpik analizi ve kalıp seçimi",
      "Lifting solüsyonuyla kıvırma",
      "Besleme ve isteğe bağlı renklendirme",
      "Uygulama (~45–60 dakika)",
    ],
    aftercare:
      "İlk 24 saat kirpikleri ıslatmayın ve maskara sürmeyin; sonrasında besleyici kirpik serumu kullanabilirsiniz.",
    faq: [
      {
        q: "Kirpik lifting ne kadar kalıcı?",
        a: "Kirpik büyüme döngüsüne göre 6–8 hafta kalıcıdır.",
      },
      {
        q: "Kirpiklere zarar verir mi?",
        a: "Uygun sürede ve besleyici bakımla uygulandığında zarar vermez.",
      },
      {
        q: "İşlemden sonra nelere dikkat etmeliyim?",
        a: "İlk 24 saat su ve buhardan kaçının; kirpikleri ovuşturmayın.",
      },
    ],
    related: ["dipliner", "eyeliner"],
  },
];

// General FAQ for the home page (broad queries + AI answer extraction).
export const HOME_FAQ: { q: string; a: string }[] = [
  {
    q: "Stria Studio nerede?",
    a: "Ankara Çankaya'dayız. Randevular WhatsApp veya telefon ile alınır.",
  },
  {
    q: "Kalıcı makyaj ne kadar kalıcıdır?",
    a: "İşleme ve cilt tipine göre değişir: microblading 12–18 ay, kalıcı eyeliner ve dudak renklendirme 1–3 yıl kalıcıdır.",
  },
  {
    q: "İşlemler acıtır mı?",
    a: "Uygulama öncesi anestezik krem kullanılır; çoğu kişi yalnızca hafif bir his duyar.",
  },
  {
    q: "Randevu ve fiyat bilgisini nasıl alırım?",
    a: "WhatsApp'tan yazabilir ya da arayabilirsiniz. Fiyat, hizmete ve kişiye göre ön görüşmede netleşir.",
  },
];

export const SERVICE_SEO_BY_SLUG: Record<string, ServiceSeo> = Object.fromEntries(
  SERVICE_SEO.map((s) => [s.slug, s]),
);

export function getServiceSeo(slug: string): ServiceSeo | undefined {
  return SERVICE_SEO_BY_SLUG[slug];
}
