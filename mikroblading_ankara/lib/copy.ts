// Static Turkish copy for the landing/service pages. Written answer-first with
// question-form headings for both Google and AI answer engines (AEO/GEO).
// Blog/FAQ/gallery come from the CMS; this is the evergreen on-page content.

export const LAST_UPDATED = "Temmuz 2026";

export const hero = {
  eyebrow: "Ankara · Çankaya · Stria Studio",
  title: "Mikroblading Ankara — Kıl Tekniğiyle Doğal Kaşlar",
  subtitle:
    "Yüz hatlarınıza özel tasarlanan, kıl kıl işlenen ve gerçek kaştan ayırt edilemeyen kalıcı kaşlar. Steril ekipman, uzman uygulama, 12–18 ay kalıcılık.",
  primaryCta: "WhatsApp'tan Randevu Al",
  secondaryCta: "Fiyatları Gör",
};

// Answer-first definition (40–60 words) — targets "mikroblading nedir".
export const whatIs = {
  heading: "Mikroblading nedir?",
  answer:
    "Mikroblading (İngilizce: microblading), ince bir kalem ucuyla cildin üst katmanına kıl kıl pigment işlenerek yapılan yarı kalıcı bir kaş işlemidir. Ankara Çankaya'daki Stria Studio'da her kıl tek tek çizilir; sonuç doğal, dolgun ve 12–18 ay kalıcıdır. Makyaja gerek kalmadan simetrik, bakımlı kaşlar sağlar.",
};

export const benefits = {
  heading: "Mikroblading kimler için uygun?",
  intro:
    "Kaşları seyrek, açık renk, düzensiz ya da tamamen dökülmüş olan; her sabah kaş makyajıyla uğraşmak istemeyen herkes için idealdir.",
  items: [
    {
      title: "Gerçekçi kıl görünümü",
      text: "Blok dolgu değil, tek tek çizilen kıllarla makyajsız bile doğal ve dolgun kaş.",
    },
    {
      title: "Yüze özel tasarım",
      text: "Altın oran ve yüz simetrisine göre ölçülüp onayınızla çizilen kişiye özel form.",
    },
    {
      title: "Steril ve güvenli",
      text: "Tek kullanımlık iğne, açılıp önünüzde atılan steril paket, dermatolojik pigment.",
    },
    {
      title: "12–18 ay kalıcılık",
      text: "Yıllık yenileme ile görünüm korunur; kalıcı dövmeye göre daha esnek ve doğaldır.",
    },
  ],
};

export const process = {
  heading: "Mikroblading nasıl yapılır? (Adım adım)",
  intro:
    "İşlem, ücretsiz ön görüşmeden rötuşa kadar dört adımda tamamlanır ve yaklaşık 90 dakika sürer.",
  steps: [
    {
      title: "1. Ücretsiz ön görüşme ve analiz",
      text: "Kaş yapınız, cilt tipiniz ve beklentileriniz değerlendirilir; uygunluk kontrol edilir.",
    },
    {
      title: "2. Tasarım ve renk seçimi",
      text: "Kaş formu yüz hatlarınıza göre çizilir, pigment tonu belirlenir. Onayınız olmadan işleme başlanmaz.",
    },
    {
      title: "3. Anestezik krem ve uygulama",
      text: "Uyuşturucu krem sonrası kıllar tek tek işlenir (~90 dk). Ağrı minimumdur.",
    },
    {
      title: "4. Rötuş seansı (4–6 hafta sonra)",
      text: "İyileşme sonrası açılan bölgeler tamamlanır; kalıcılık ve netlik pekiştirilir.",
    },
  ],
};

// Pricing — also mirrored in /llms.txt as machine-readable data.
export const pricing = {
  heading: "Mikroblading fiyatları (Ankara, 2026)",
  intro:
    "Ankara'da mikroblading fiyatları uygulayıcının deneyimine ve kullanılan pigmente göre değişir. Stria Studio'da güncel fiyat aralıkları aşağıdadır; kesin fiyat ücretsiz ön görüşmede netleşir.",
  note: "Tüm paketlere yüz analizi, tasarım ve steril ekipman dahildir. Fiyatlar bilgilendirme amaçlıdır.",
  rows: [
    { name: "Mikroblading (tek seans)", detail: "Kıl tekniği, tasarım dahil", price: "4.500 – 6.500 ₺", min: 4500, max: 6500 },
    { name: "Mikroblading + Rötuş paketi", detail: "1. seans + 4–6 hafta rötuş", price: "6.000 – 8.500 ₺", min: 6000, max: 8500 },
    { name: "Yıllık yenileme", detail: "Mevcut kaşın tazelenmesi", price: "2.500 – 4.000 ₺", min: 2500, max: 4000 },
    { name: "Kaş pudralama (powder brows)", detail: "Yağlı ciltler için alternatif", price: "5.000 – 7.500 ₺", min: 5000, max: 7500 },
  ],
};

export const trust = {
  heading: "Neden Stria Studio?",
  items: [
    { stat: "1.000+", label: "uygulanan kaş" },
    { stat: "12–18 ay", label: "ortalama kalıcılık" },
    { stat: "%100", label: "steril, tek kullanımlık ekipman" },
    { stat: "4,9/5", label: "müşteri memnuniyeti" },
  ],
};

export const reviews = {
  heading: "Danışan yorumları",
  items: [
    {
      name: "Elif K.",
      text: "Kaşlarım çok doğal duruyor, kimse yaptırdığımı anlamıyor. Ankara'da araştırıp en doğrusunu seçmişim.",
    },
    {
      name: "Merve T.",
      text: "İşlem hiç acımadı, uygulama çok titizdi. Steril paketleri önümde açtılar, içim rahat etti.",
    },
    {
      name: "Zeynep A.",
      text: "Sabahları artık kaş makyajıyla uğraşmıyorum. Rötuş sonrası sonuç harika oldu.",
    },
  ],
};

// Fallback FAQ (used if the CMS/API is unavailable at build time). The live
// site prefers CMS FAQs; these keep FAQPage schema + the SSS page populated.
export const faqFallback: { q: string; a: string }[] = [
  {
    q: "Mikroblading Ankara'da ne kadar kalıcı?",
    a: "Cilt tipine bağlı olarak 12–18 ay kalıcıdır. Yıllık yenileme seansıyla görünüm korunur.",
  },
  {
    q: "Mikroblading işlemi acıtır mı?",
    a: "Uygulamadan önce anestezik krem sürülür; çoğu kişi yalnızca hafif bir çizilme hissi tarif eder.",
  },
  {
    q: "Mikroblading fiyatları Ankara'da ne kadar?",
    a: "Stria Studio'da tek seans 4.500–6.500 ₺, rötuş dahil paket 6.000–8.500 ₺ aralığındadır. Kesin fiyat ücretsiz ön görüşmede netleşir.",
  },
  {
    q: "İyileşme süreci ne kadar sürer?",
    a: "Yüzeysel iyileşme 7–10 gün sürer; ince kabuklar kendiliğinden dökülür. Nihai renk 4–6 haftada oturur.",
  },
  {
    q: "Kimler mikroblading yaptıramaz?",
    a: "Hamileler, emzirenler, kan sulandırıcı kullananlar ve bazı cilt hastalığı olanlar uygun değildir; ön görüşmede değerlendirilir.",
  },
  {
    q: "Rötuş seansı şart mı?",
    a: "Evet, kalıcılık ve netlik için 4–6 hafta sonra yapılan rötuş önerilir; paketlerimize dahildir.",
  },
];

export const about = {
  heading: "Ankara'da güvenilir mikroblading",
  paragraphs: [
    "Stria Studio, Ankara Çankaya'da kalıcı makyaj ve kaş tasarımı alanında hizmet veren bir güzellik stüdyosudur. Mikroblading uygulamalarımız, sertifikalı ve deneyimli uygulayıcılar tarafından hijyen standartlarına tam uyumla gerçekleştirilir.",
    "Her uygulamada tek kullanımlık, steril iğneler ve dermatolojik olarak test edilmiş pigmentler kullanılır. Amacımız abartısız, yüz hatlarınızla uyumlu ve zamanla doğal şekilde açılan kaşlar tasarlamaktır.",
    "İşlem öncesi ücretsiz ön görüşmede uygunluğunuzu değerlendirir, beklentilerinizi dinler ve size en uygun tekniği (mikroblading veya kaş pudralama) birlikte belirleriz.",
  ],
  credentials: [
    "Sertifikalı kalıcı makyaj uygulayıcıları",
    "Tek kullanımlık steril ekipman politikası",
    "Yüze özel tasarım ve renk analizi",
    "İşlem sonrası bakım desteği ve rötuş kontrolü",
  ],
};
