export type Lang = "tr" | "en";
export type LS = { tr: string; en: string };

export const IMG = {
  hero: "/images/hero.png",
  micro: "/images/micro.png",
  powder: "/images/powder.png",
  eyeliner: "/images/eyeliner.png",
  dipliner: "/images/dipliner.png",
} as const;

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
  navBlog: string;
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
  aboutStoryLong: string;
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
    navBlog: "Blog",
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
    aboutStoryLong:
      "Stria Studio, Ankara Çankaya'da kalıcı makyaj ve güzellik alanında; doğallığı, sterilizasyonu ve kişiye özel tasarımı merkezine alan bir stüdyodur. Her uygulamaya ücretsiz ön görüşme, yüz analizi ve simetri ölçümüyle başlıyor; kaliteli pigmentler ve tek kullanımlık ekipmanla, abartısız ve size ait bir sonuç hedefliyoruz.",
    contactKicker: "İletişim",
    contactTitle: "Hadi randevunu oluşturalım",
    contactText:
      "Sorular ve randevu için WhatsApp'tan yaz ya da bizi ara. En kısa sürede dönüş yapıyoruz.",
    phone: "+90 507 732 30 26",
    mapPh: "Harita · Çankaya, Ankara",
    footerTag: "Ankara'da microblading, kalıcı makyaj ve kaş–kirpik bakımı.",
    footerExplore: "Keşfet",
    footerFollow: "Bizi takip et",
    footerRights: "Tüm hakları saklıdır.",
    info: [
      { label: "Adres", value: "Çankaya, Ankara" },
      { label: "Telefon", value: "+90 507 732 30 26" },
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
    navBlog: "Blog",
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
    aboutStoryLong:
      "Stria Studio is a permanent-makeup and beauty studio in Çankaya, Ankara, built around natural results, strict sterilisation and per-face design. Every treatment starts with a free consultation, face analysis and symmetry measurement; with quality pigments and single-use tools we aim for an understated result that stays truly yours.",
    contactKicker: "Contact",
    contactTitle: "Let's book your appointment",
    contactText:
      "Message us on WhatsApp or call for questions and bookings. We reply as soon as we can.",
    phone: "+90 507 732 30 26",
    mapPh: "Map · Çankaya, Ankara",
    footerTag:
      "Microblading, permanent makeup and brow & lash care in Ankara.",
    footerExplore: "Explore",
    footerFollow: "Follow us",
    footerRights: "All rights reserved.",
    info: [
      { label: "Address", value: "Çankaya, Ankara" },
      { label: "Phone", value: "+90 507 732 30 26" },
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
