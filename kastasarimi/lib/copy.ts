// Static Turkish copy for the landing/service pages. Written answer-first with
// question-form headings for both Google and AI answer engines (AEO/GEO).
// Blog/FAQ/gallery come from the CMS; this is the evergreen on-page content.
//
// Positioning: premium, kişiye özel, KALICI kaş tasarımı via kıl tekniği.
// House rule: never name other techniques or the brand term for it — the site
// stands out purely as "kaş tasarımı".

export const LAST_UPDATED = "Temmuz 2026";

export const hero = {
  eyebrow: "Ankara · Çankaya · Stria Studio",
  title: "Kaş Tasarımı Ankara — Kişiye Özel Kalıcı Kaşlar",
  subtitle:
    "Yüz hatlarınıza özel tasarlanan, kıl tekniğiyle tek tek işlenen doğal ve kalıcı kaşlar. Altın oran ölçümüyle simetrik form, steril uygulama, 12–18 ay kalıcılık.",
  primaryCta: "WhatsApp'tan Randevu Al",
  secondaryCta: "Fiyatları Gör",
};

// Answer-first definition (40–60 words) — targets "kaş tasarımı nedir".
export const whatIs = {
  heading: "Kaş tasarımı nedir?",
  answer:
    "Kaş tasarımı, yüz simetrisi ve altın oran ölçümüne göre kişiye özel belirlenen kaş formunun, kıl tekniğiyle tek tek işlenerek kalıcı hale getirilmesidir. Ankara Çankaya'daki Stria Studio'da her kıl gerçek kaştan ayırt edilemeyecek kadar doğal çizilir; sonuç 12–18 ay kalıcıdır ve makyaja gerek bırakmaz.",
};

export const benefits = {
  heading: "Kaş tasarımı kimler için uygun?",
  intro:
    "Kaşları seyrek, açık renk, asimetrik ya da şekilsiz olan; makyajsız da dolgun ve bakımlı kaşlar isteyen herkes için idealdir.",
  items: [
    {
      title: "Doğal kıl görünümü",
      text: "Blok dolgu değil; kıl kıl işlenen çizgilerle makyajsız bile gerçekçi, dolgun kaş.",
    },
    {
      title: "Yüze özel tasarım",
      text: "Altın oran ve yüz simetrinize göre ölçülüp onayınızla çizilen, size özel form.",
    },
    {
      title: "Kalıcı sonuç",
      text: "12–18 ay kalıcılık; yıllık yenileme ile görünüm korunur.",
    },
    {
      title: "Steril & güvenli",
      text: "Tek kullanımlık, steril ekipman ve kaliteli, dermatolojik pigment.",
    },
  ],
};

export const process = {
  heading: "Kaş tasarımı nasıl yapılır? (Adım adım)",
  intro:
    "İşlem, ücretsiz ön görüşmeden rötuşa kadar dört adımda tamamlanır ve yaklaşık 90 dakika sürer.",
  steps: [
    {
      title: "1. Ücretsiz ön görüşme ve analiz",
      text: "Kaş yapınız, cilt tipiniz ve beklentileriniz değerlendirilir; uygunluk kontrol edilir.",
    },
    {
      title: "2. Tasarım ve altın oran ölçümü",
      text: "Kaş formu yüz hatlarınıza göre çizilir, renk belirlenir. Onayınız olmadan işleme başlanmaz.",
    },
    {
      title: "3. Kıl kıl uygulama",
      text: "Anestezik krem sonrası her kıl tek tek işlenir (~90 dk). İşlem konforludur.",
    },
    {
      title: "4. Rötuş seansı (4–6 hafta sonra)",
      text: "İyileşme sonrası açılan bölgeler tamamlanır; kalıcılık ve netlik pekiştirilir.",
    },
  ],
};

// Premium pricing. Mirrored in /llms.txt as machine-readable data.
export const pricing = {
  heading: "Kaş tasarımı fiyatları (Ankara, 2026)",
  intro:
    "Ankara'da kaş tasarımı fiyatları uygulayıcının deneyimine ve kullanılan pigmente göre değişir. Stria Studio'da güncel fiyat aralıkları aşağıdadır; kesin fiyat ücretsiz ön görüşmede netleşir.",
  note: "Tüm paketlere yüz analizi, altın oran tasarımı ve steril uygulama dahildir. Fiyatlar bilgilendirme amaçlıdır.",
  rows: [
    { name: "Kaş tasarımı (tek seans)", detail: "Kıl tekniği, tasarım dahil", price: "4.500 – 6.500 ₺" },
    { name: "Kaş tasarımı + rötuş paketi", detail: "1. seans + 4–6 hafta rötuş", price: "6.000 – 8.500 ₺" },
    { name: "Yıllık yenileme", detail: "Mevcut kaşın tazelenmesi", price: "2.500 – 4.000 ₺" },
  ],
};

export const trust = {
  heading: "Neden Stria Studio?",
  items: [
    { stat: "1.500+", label: "tasarlanan kaş" },
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
      text: "Kaşlarım o kadar doğal ki kimse yaptırdığımı anlamıyor. Yüzüme göre tasarlandı, çok memnunum.",
    },
    {
      name: "Selin Y.",
      text: "İşlem çok konforluydu, uygulama titizdi. Steril paketleri önümde açtılar, içim rahat etti.",
    },
    {
      name: "Merve T.",
      text: "Artık sabahları kaş makyajıyla uğraşmıyorum. Rötuş sonrası sonuç kusursuz oldu.",
    },
  ],
};

export const about = {
  heading: "Ankara'da kişiye özel kaş tasarımı",
  paragraphs: [
    "Stria Studio, Ankara Çankaya'da kalıcı kaş tasarımı alanında hizmet veren bir güzellik stüdyosudur. Her uygulamaya ücretsiz ön görüşme ve altın oran ölçümüyle başlar, forma karar vermeden işleme geçmeyiz.",
    "Kaş tasarımı, sertifikalı ve deneyimli uygulayıcılar tarafından kıl tekniğiyle, hijyen standartlarına tam uyumla gerçekleştirilir. Tek kullanımlık steril iğneler ve dermatolojik pigmentler kullanılır. Amacımız abartısız, yüz hatlarınızla uyumlu ve kalıcı bir kaş oluşturmaktır.",
    "İşlem öncesi beklentilerinizi dinler, size en uygun formu birlikte belirleriz. Sonuç doğal, dolgun ve uzun süre kalıcıdır.",
  ],
  credentials: [
    "Sertifikalı, deneyimli kaş tasarımı uygulayıcıları",
    "Altın oran ile kişiye özel form tasarımı",
    "Tek kullanımlık steril ekipman politikası",
    "İşlem sonrası bakım desteği ve rötuş kontrolü",
  ],
};

// Fallback FAQ (used if the CMS/API is unavailable at build time).
export const faqFallback: { q: string; a: string }[] = [
  {
    q: "Kaş tasarımı nedir?",
    a: "Yüz simetrisine göre kişiye özel belirlenen kaş formunun, kıl tekniğiyle tek tek işlenerek kalıcı hale getirilmesidir. Sonuç doğal ve 12–18 ay kalıcıdır.",
  },
  {
    q: "Kaş tasarımı ne kadar kalıcı?",
    a: "Cilt tipine bağlı olarak 12–18 ay kalıcıdır. Yıllık yenileme seansıyla görünüm korunur.",
  },
  {
    q: "Kaş tasarımı fiyatları Ankara'da ne kadar?",
    a: "Stria Studio'da tek seans 4.500–6.500 ₺, rötuş dahil paket 6.000–8.500 ₺ aralığındadır. Kesin fiyat ücretsiz ön görüşmede netleşir.",
  },
  {
    q: "İşlem acıtır mı?",
    a: "Uygulamadan önce anestezik krem sürülür; çoğu kişi yalnızca hafif bir çizilme hissi tarif eder.",
  },
  {
    q: "İyileşme süreci ne kadar sürer?",
    a: "Yüzeysel iyileşme 7–10 gün sürer; ince kabuklar kendiliğinden dökülür. Nihai renk 4–6 haftada oturur.",
  },
  {
    q: "Rötuş seansı şart mı?",
    a: "Evet, kalıcılık ve netlik için 4–6 hafta sonra yapılan rötuş önerilir; paketlerimize dahildir.",
  },
];
