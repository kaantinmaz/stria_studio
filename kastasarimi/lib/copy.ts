// Static Turkish copy for the landing/service pages. Written answer-first with
// question-form headings for both Google and AI answer engines (AEO/GEO).
// Blog/FAQ/gallery come from the CMS; this is the evergreen on-page content.

export const LAST_UPDATED = "Temmuz 2026";

export const hero = {
  eyebrow: "Ankara · Çankaya · Stria Studio",
  title: "Kaş Tasarımı Ankara — Yüzünüze Özel Kaş Formu",
  subtitle:
    "Altın oran ölçümü ve kaş haritalama ile yüz hatlarınıza en uygun kaş formu tasarlanır; iplik veya ağda ile şekillendirilir, isteğe bağlı boyanır. Doğal, simetrik, bakımlı kaşlar.",
  primaryCta: "WhatsApp'tan Randevu Al",
  secondaryCta: "Fiyatları Gör",
};

// Answer-first definition (40–60 words) — targets "kaş tasarımı nedir".
export const whatIs = {
  heading: "Kaş tasarımı nedir?",
  answer:
    "Kaş tasarımı, yüz simetrisi ve altın oran ölçümüne göre kişiye özel kaş formunun belirlenip iplik ya da ağda ile şekillendirilmesi işlemidir. Ankara Çankaya'daki Stria Studio'da kaş haritalama ile başlanır; gerekirse kaş boyama (henna/boya) eklenir. Kalıcı değildir, doğal görünümü korur ve düzenli bakımla sürdürülür.",
};

export const benefits = {
  heading: "Kaş tasarımı kimler için uygun?",
  intro:
    "Kaşları asimetrik, düzensiz, dağınık ya da forma sokulmamış olan; yüzüne en yakışan kaş şeklini profesyonel olarak belirlemek isteyen herkes için uygundur.",
  items: [
    {
      title: "Yüze özel form",
      text: "Altın oran ve yüz şeklinize göre ölçülüp tasarlanan, size en yakışan kaş formu.",
    },
    {
      title: "Kaş haritalama",
      text: "Başlangıç, kavis ve bitiş noktaları ölçülerek çizilir; simetri sağlanır.",
    },
    {
      title: "Doğal & kalıcı değil",
      text: "Pigment uygulanmaz; iplik/ağda ile şekillendirme yapılır. İstediğinizde formu değiştirebilirsiniz.",
    },
    {
      title: "İsteğe bağlı boyama",
      text: "Henna veya kaş boyasıyla daha dolgun, belirgin görünüm — 2–4 hafta kalıcı.",
    },
  ],
};

export const process = {
  heading: "Kaş tasarımı nasıl yapılır? (Adım adım)",
  intro:
    "İşlem, ücretsiz kaş analizinden bakım önerisine kadar dört adımda tamamlanır ve yaklaşık 30–45 dakika sürer.",
  steps: [
    {
      title: "1. Kaş analizi ve dinleme",
      text: "Mevcut kaş yapınız, yüz şekliniz ve tercihleriniz değerlendirilir.",
    },
    {
      title: "2. Haritalama ve form tasarımı",
      text: "Altın oran ölçümüyle başlangıç–kavis–bitiş noktaları belirlenir; form onayınızla çizilir.",
    },
    {
      title: "3. Şekillendirme (iplik / ağda / cımbız)",
      text: "Belirlenen forma göre fazlalıklar alınır; simetrik, temiz bir çizgi elde edilir.",
    },
    {
      title: "4. Boyama ve bakım önerisi",
      text: "İstenirse henna/boya uygulanır; forma özel evde bakım önerileri verilir.",
    },
  ],
};

// Pricing — also mirrored in /llms.txt as machine-readable data.
export const pricing = {
  heading: "Kaş tasarımı fiyatları (Ankara, 2026)",
  intro:
    "Ankara'da kaş tasarımı fiyatları uygulanan yönteme (iplik, ağda) ve boyama eklenip eklenmemesine göre değişir. Stria Studio'da güncel fiyat aralıkları aşağıdadır; kesin fiyat ücretsiz analizde netleşir.",
  note: "Tüm hizmetlere kaş analizi ve haritalama dahildir. Fiyatlar bilgilendirme amaçlıdır.",
  rows: [
    { name: "Kaş tasarımı + şekillendirme", detail: "Haritalama + iplik/ağda", price: "250 – 450 ₺" },
    { name: "Kaş tasarımı + boyama (henna)", detail: "Şekillendirme + renklendirme", price: "400 – 650 ₺" },
    { name: "Düzenli kaş bakımı", detail: "Mevcut formun korunması", price: "150 – 300 ₺" },
    { name: "Kaş laminasyonu", detail: "Dolgun, taranmış görünüm", price: "600 – 1.000 ₺" },
  ],
};

export const trust = {
  heading: "Neden Stria Studio?",
  items: [
    { stat: "2.000+", label: "tasarlanan kaş" },
    { stat: "30–45 dk", label: "ortalama işlem süresi" },
    { stat: "%100", label: "hijyenik, tek kullanımlık malzeme" },
    { stat: "4,9/5", label: "müşteri memnuniyeti" },
  ],
};

export const reviews = {
  heading: "Danışan yorumları",
  items: [
    {
      name: "Selin Y.",
      text: "Kaş formumu ilk kez birisi yüzüme göre tasarladı. Fark inanılmaz, çok daha bakımlı görünüyorum.",
    },
    {
      name: "Büşra M.",
      text: "Haritalama ile iki kaşım da simetrik oldu. İplikle şekillendirme çok temizdi, tavsiye ederim.",
    },
    {
      name: "Derya K.",
      text: "Henna ile boyattım, doğal ve dolgun duruyor. Ankara'da doğru yeri bulmuşum.",
    },
  ],
};

export const about = {
  heading: "Ankara'da profesyonel kaş tasarımı",
  paragraphs: [
    "Stria Studio, Ankara Çankaya'da kaş tasarımı, şekillendirme ve kaş bakımı alanında hizmet veren bir güzellik stüdyosudur. Her uygulamaya yüz analizi ve kaş haritalama ile başlar, forma karar vermeden işleme geçmeyiz.",
    "Şekillendirmede kişiye özel olarak iplik, ağda veya cımbız yöntemleri kullanılır; tüm malzemeler hijyeniktir ve tek kullanımlıktır. Amacımız yüz hatlarınızla uyumlu, abartısız ve bakımı kolay bir kaş formu oluşturmaktır.",
    "İsteğe bağlı henna veya kaş boyama ile daha dolgun bir görünüm sağlar; kalıcı işlem (microblading, kaş pudralama) düşünenlere de doğru formu önceden tasarlama imkânı sunarız.",
  ],
  credentials: [
    "Yüz analizi + altın oran ile kaş haritalama",
    "İplik / ağda / cımbız ile hassas şekillendirme",
    "Hijyenik, tek kullanımlık malzeme politikası",
    "Henna & kaş boyama ile isteğe bağlı renklendirme",
  ],
};

// Fallback FAQ (used if the CMS/API is unavailable at build time). The live
// site prefers CMS FAQs; these keep FAQPage schema + the SSS page populated.
export const faqFallback: { q: string; a: string }[] = [
  {
    q: "Kaş tasarımı nedir?",
    a: "Yüz simetrisine göre kişiye özel kaş formunun haritalanıp iplik/ağda ile şekillendirilmesidir. Pigment uygulanmaz, doğal ve kalıcı olmayan bir işlemdir.",
  },
  {
    q: "Kaş tasarımı fiyatları Ankara'da ne kadar?",
    a: "Stria Studio'da şekillendirme 250–450 ₺, boyama dahil paket 400–650 ₺ aralığındadır. Kesin fiyat ücretsiz analizde netleşir.",
  },
  {
    q: "Kaş tasarımı ne sıklıkla yapılmalı?",
    a: "Kaşların uzama hızına göre 3–4 haftada bir bakım önerilir; formun bozulmaması için düzenli şekillendirme yeterlidir.",
  },
  {
    q: "Kaş tasarımı kalıcı mı?",
    a: "Hayır. Şekillendirme kalıcı değildir; kıllar uzadıkça bakım gerekir. Kaş boyama (henna) ise 2–4 hafta kalıcıdır.",
  },
  {
    q: "İplik mi ağda mı daha iyi?",
    a: "İplik hassas ve ince kontrol sağlar, ciltte tahriş riski düşüktür; ağda geniş alanlarda hızlıdır. Cilt tipinize göre birlikte karar veririz.",
  },
  {
    q: "Kaş tasarımı ile microblading arasındaki fark nedir?",
    a: "Kaş tasarımı doğal şekillendirme/boyamadır ve kalıcı değildir; microblading ise pigmentle 12–18 ay kalıcı bir işlemdir. Tasarım, microblading öncesi doğru formu belirlemek için de yapılır.",
  },
];
