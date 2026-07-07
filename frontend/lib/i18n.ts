export type Lang = "tr" | "en";
export type LS = { tr: string; en: string };

export const IMG = {
  hero: "/images/hero.png",
  micro: "/images/micro.png",
  powder: "/images/powder.png",
  eyeliner: "/images/eyeliner.png",
  dipliner: "/images/dipliner.png",
} as const;

export type Service = {
  id: string;
  slug: string;
  tag: LS;
  name: LS;
  desc: LS;
  img: string;
};

export const SERVICES: Service[] = [
  {
    id: "svc1",
    slug: "microblading",
    tag: { tr: "Kaş", en: "Brows" },
    name: { tr: "Microblading", en: "Microblading" },
    desc: {
      tr: "Kıl tekniğiyle çizilen, gerçek kaşlardan ayırt edilemeyen doğal ve ince detaylı kaşlar.",
      en: "Hair-stroke technique that mimics natural brow hairs for a soft, undetectable finish.",
    },
    img: IMG.micro,
  },
  {
    id: "svc2",
    slug: "kas-pudralama",
    tag: { tr: "Kaş", en: "Brows" },
    name: { tr: "Kaş Pudralama", en: "Powder Brows" },
    desc: {
      tr: "Pudra dokusuyla dolgun, makyajlı bir kaş görünümü — yağlı ciltler için ideal.",
      en: "A soft, filled-in powdered look — ideal for oily skin and a made-up effect.",
    },
    img: IMG.powder,
  },
  {
    id: "svc3",
    slug: "eyeliner",
    tag: { tr: "Göz", en: "Eyes" },
    name: { tr: "Eyeliner", en: "Eyeliner" },
    desc: {
      tr: "Bakışlarınızı belirginleştiren, kalıcı ve simetrik eyeliner uygulaması.",
      en: "A defined, symmetrical permanent eyeliner that opens up the gaze.",
    },
    img: IMG.eyeliner,
  },
  {
    id: "svc4",
    slug: "dipliner",
    tag: { tr: "Göz", en: "Eyes" },
    name: { tr: "Dipliner", en: "Lash-line Enhancement" },
    desc: {
      tr: "Kirpik diplerine uygulanan ince pigment ile daha yoğun ve uyanık bir bakış.",
      en: "Fine pigment along the lash line for fuller lashes and a wide-awake look.",
    },
    img: IMG.dipliner,
  },
  {
    id: "svc5",
    slug: "dudak-renklendirme",
    tag: { tr: "Dudak", en: "Lips" },
    name: { tr: "Dudak Renklendirme", en: "Lip Blush" },
    desc: {
      tr: "Dudaklara doğal renk, tanım ve dolgunluk kazandıran kalıcı renklendirme.",
      en: "Restores natural colour, definition and fullness with a soft lip-blush tint.",
    },
    img: "",
  },
  {
    id: "svc6",
    slug: "kas-laminasyon",
    tag: { tr: "Kaş", en: "Brows" },
    name: { tr: "Kaş Laminasyon", en: "Brow Lamination" },
    desc: {
      tr: "Kaş kıllarını şekillendirerek daha dolgun, bakımlı ve düzenli bir görünüm.",
      en: "Sets and lifts brow hairs for a fuller, groomed and lasting shape.",
    },
    img: "",
  },
  {
    id: "svc7",
    slug: "kirpik-lifting",
    tag: { tr: "Kirpik", en: "Lashes" },
    name: { tr: "Kirpik Lifting", en: "Lash Lift" },
    desc: {
      tr: "Kendi kirpiklerinizi kıvırarak uzatan, doğal ve kalıcı bir kirpik bakımı.",
      en: "Lifts and curls your own lashes for a longer, natural, low-maintenance look.",
    },
    img: "",
  },
];

export type GalleryItem = { id: string; img: string; ph: LS };

export const GALLERY: GalleryItem[] = [
  { id: "mg1", img: IMG.micro, ph: { tr: "Microblading", en: "Microblading" } },
  { id: "mg2", img: IMG.dipliner, ph: { tr: "Kirpik / göz", en: "Lashes / eye" } },
  { id: "mg3", img: IMG.hero, ph: { tr: "Stüdyo", en: "Studio" } },
  { id: "mg4", img: IMG.powder, ph: { tr: "Kaş pudralama", en: "Powder brows" } },
  { id: "mg5", img: IMG.eyeliner, ph: { tr: "Eyeliner", en: "Eyeliner" } },
  { id: "mg6", img: "", ph: { tr: "Çalışmanızı ekleyin", en: "Add your work" } },
];

export type TrustItem = { stat: LS; label: LS };

export const TRUST: TrustItem[] = [
  {
    stat: { tr: "%100", en: "100%" },
    label: {
      tr: "Steril, tek kullanımlık ekipman",
      en: "Sterile, single-use equipment",
    },
  },
  {
    stat: { tr: "5+", en: "5+" },
    label: { tr: "Yıllık uzmanlık ve deneyim", en: "Years of expertise" },
  },
  {
    stat: { tr: "Kişiye", en: "Bespoke" },
    label: {
      tr: "Her yüze özel tasarım ve ölçüm",
      en: "Design mapped to each face",
    },
  },
  {
    stat: { tr: "Onaylı", en: "Certified" },
    label: {
      tr: "Sağlık onaylı, kaliteli pigmentler",
      en: "Health-approved premium pigments",
    },
  },
];

export type InfoRow = { label: string; value: string };

export type Dict = {
  navServices: string;
  navGallery: string;
  navAbout: string;
  navContact: string;
  navCta: string;
  callLabel: string;
  barHours: string;
  barLoc: string;
  heroKicker: string;
  heroTitle: string;
  heroText: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  heroFeatures: string[];
  featuredLabel: string;
  featuredName: string;
  featuredHint: string;
  servicesKicker: string;
  servicesTitle: string;
  servicesText: string;
  priceNote: string;
  galleryKicker: string;
  galleryTitle: string;
  galleryText: string;
  aboutKicker: string;
  aboutTitle: string;
  aboutText: string;
  contactKicker: string;
  contactTitle: string;
  contactText: string;
  phone: string;
  mapPh: string;
  footerTag: string;
  footerExplore: string;
  footerFollow: string;
  footerRights: string;
  info: InfoRow[];
  // appointment form (added, not in original design)
  formTitle: string;
  formName: string;
  formPhone: string;
  formEmail: string;
  formEmailOpt: string;
  formService: string;
  formServicePick: string;
  formServiceOther: string;
  formDate: string;
  formMessage: string;
  formSubmit: string;
  formSending: string;
  formOk: string;
  formErr: string;
  formOr: string;
};

export const UI: Record<Lang, Dict> = {
  tr: {
    navServices: "Hizmetler",
    navGallery: "Galeri",
    navAbout: "Hakkımızda",
    navContact: "İletişim",
    navCta: "Randevu Al",
    callLabel: "Ara",
    barHours: "Pzt – Cmt · 10:00 – 19:00",
    barLoc: "[Mahalle] Cd. No: 00, Çankaya / Ankara",
    heroKicker: "Ankara · Kalıcı Makyaj & Güzellik Stüdyosu",
    heroTitle: "Sen, en doğal\nhalinle güzelsin",
    heroText:
      "Kaş, kirpik ve kalıcı makyajda özenli, doğal ve tamamen sana özel dokunuşlar. Ankara Çankaya'da.",
    heroCtaPrimary: "WhatsApp'tan Randevu",
    heroCtaSecondary: "Hemen Ara",
    heroFeatures: [
      "Steril, tek kullanımlık ekipman",
      "Her yüze özel tasarım",
      "5+ yıl uzmanlık",
    ],
    featuredLabel: "Öne çıkan hizmet",
    featuredName: "Microblading",
    featuredHint: "Kıl tekniği · doğal kaş",
    servicesKicker: "Hizmetlerimiz",
    servicesTitle: "Sana özel dokunuşlar",
    servicesText:
      "Kaştan dudağa, gözden kirpiğe — her uygulama yüz hatlarına göre planlanır. Fiyat ve süre için mesaj atman yeterli.",
    priceNote: "Detaylı bilgi randevuda",
    galleryKicker: "Galeri",
    galleryTitle: "Öncesi & Sonrası",
    galleryText:
      "Gerçek müşteri çalışmalarından bir seçki. Görselleri buraya yükleyebilirsin.",
    aboutKicker: "Neden Stria",
    aboutTitle: "Rahat, güvenli ve tamamen sana özel",
    aboutText:
      "Her uygulamaya yüz analizi ve simetri ölçümüyle başlıyoruz. Steril ortam, kaliteli pigmentler ve doğallıktan ödün vermeyen bir anlayış — Stria'da güzellik abartısız ve sana ait kalıyor.",
    contactKicker: "İletişim",
    contactTitle: "Hadi randevunu oluşturalım",
    contactText:
      "Sorular ve randevu için WhatsApp'tan yaz ya da bizi ara. En kısa sürede dönüş yapıyoruz.",
    phone: "+90 500 000 00 00",
    mapPh: "Harita · Çankaya, Ankara",
    footerTag: "Ankara'da microblading, kalıcı makyaj ve kaş–kirpik bakımı.",
    footerExplore: "Keşfet",
    footerFollow: "Bizi takip et",
    footerRights: "Tüm hakları saklıdır.",
    info: [
      { label: "Adres", value: "Çankaya, Ankara" },
      { label: "Telefon", value: "+90 500 000 00 00" },
      { label: "Instagram", value: "@striastudio" },
      { label: "Çalışma Saatleri", value: "Pzt – Cmt · 10:00 – 19:00" },
    ],
    formTitle: "Randevu Talebi",
    formName: "Ad Soyad",
    formPhone: "Telefon",
    formEmail: "E-posta",
    formEmailOpt: "(isteğe bağlı)",
    formService: "Hizmet",
    formServicePick: "Bir hizmet seç",
    formServiceOther: "Diğer",
    formDate: "Tercih edilen tarih",
    formMessage: "Mesaj",
    formSubmit: "Talep Gönder",
    formSending: "Gönderiliyor…",
    formOk: "Teşekkürler! Talebini aldık, en kısa sürede döneceğiz.",
    formErr: "Bir sorun oluştu. Lütfen tekrar dene ya da WhatsApp'tan yaz.",
    formOr: "veya",
  },
  en: {
    navServices: "Services",
    navGallery: "Gallery",
    navAbout: "About",
    navContact: "Contact",
    navCta: "Book Now",
    callLabel: "Call",
    barHours: "Mon – Sat · 10:00 – 19:00",
    barLoc: "[Street] St. No: 00, Çankaya / Ankara",
    heroKicker: "Ankara · Permanent Makeup & Beauty Studio",
    heroTitle: "You, at your\nmost natural",
    heroText:
      "Careful, natural and entirely bespoke touches for brows, lashes and permanent makeup. In Çankaya, Ankara.",
    heroCtaPrimary: "Book on WhatsApp",
    heroCtaSecondary: "Call Now",
    heroFeatures: [
      "Sterile, single-use tools",
      "Bespoke to every face",
      "5+ years of expertise",
    ],
    featuredLabel: "Featured service",
    featuredName: "Microblading",
    featuredHint: "Hair-stroke · natural brows",
    servicesKicker: "Our Services",
    servicesTitle: "Touches made for you",
    servicesText:
      "From brows to lips, eyes to lashes — every treatment is mapped to your features. Just message us for pricing and timing.",
    priceNote: "Details on booking",
    galleryKicker: "Gallery",
    galleryTitle: "Before & After",
    galleryText:
      "A selection of real client work. You can upload your own images here.",
    aboutKicker: "Why Stria",
    aboutTitle: "Relaxed, safe and entirely yours",
    aboutText:
      "Every treatment begins with facial analysis and symmetry mapping. A sterile space, premium pigments and an approach that never oversteps — at Stria, beauty stays understated and unmistakably yours.",
    contactKicker: "Contact",
    contactTitle: "Let's book your appointment",
    contactText:
      "Message us on WhatsApp or call for questions and bookings. We reply as soon as we can.",
    phone: "+90 500 000 00 00",
    mapPh: "Map · Çankaya, Ankara",
    footerTag:
      "Microblading, permanent makeup and brow & lash care in Ankara.",
    footerExplore: "Explore",
    footerFollow: "Follow us",
    footerRights: "All rights reserved.",
    info: [
      { label: "Address", value: "Çankaya, Ankara" },
      { label: "Phone", value: "+90 500 000 00 00" },
      { label: "Instagram", value: "@striastudio" },
      { label: "Hours", value: "Mon – Sat · 10:00 – 19:00" },
    ],
    formTitle: "Appointment Request",
    formName: "Full name",
    formPhone: "Phone",
    formEmail: "Email",
    formEmailOpt: "(optional)",
    formService: "Service",
    formServicePick: "Pick a service",
    formServiceOther: "Other",
    formDate: "Preferred date",
    formMessage: "Message",
    formSubmit: "Send Request",
    formSending: "Sending…",
    formOk: "Thank you! We've received your request and will get back to you soon.",
    formErr: "Something went wrong. Please try again or message us on WhatsApp.",
    formOr: "or",
  },
};
