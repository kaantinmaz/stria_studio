export type Lang = "tr" | "en";
export type LS = { tr: string; en: string };

export const IMG = {
  hero: "/images/hero.png",
  // Hero slider slides — add/remove paths here to change the rotation.
  heroSlides: ["/images/eyeliner.png"],
  micro: "/images/micro.png",
  powder: "/images/powder.png",
  eyeliner: "/images/eyeliner.png",
  dipliner: "/images/dipliner.png",
} as const;

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
  navFaq: string;
  navCta: string;
  callLabel: string;
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
  instagramKicker: string;
  instagramTitle: string;
  instagramText: string;
  instagramCta: string;
  aboutKicker: string;
  aboutTitle: string;
  aboutText: string;
  aboutStoryLong: string;
  founderKicker: string;
  founderName: string;
  founderRole: string;
  founderText: string;
  contactKicker: string;
  contactTitle: string;
  contactText: string;
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
  reviewsKicker: string;
  reviewsTitle: string;
  reviewCountLabel: string;
  googleReviewsLabel: string;
  googleViewLabel: string;
  verifiedNote: string;
};

export const UI: Record<Lang, Dict> = {
  tr: {
    navServices: "Hizmetler",
    navGallery: "Galeri",
    navAbout: "Hakkımızda",
    navContact: "İletişim",
    navBlog: "Blog",
    navFaq: "S.S.S.",
    navCta: "Randevu Al",
    callLabel: "Ara",
    heroKicker: "Ankara · Kaş Tasarımı, Microblading & Kalıcı Makyaj",
    heroTitle: "Kaşların, en doğal\nhaliyle güzel",
    heroText:
      "Microblading, kaş pudralama ve kalıcı makyajda yüz hatlarına göre kişiye özel tasarım. Kaşın yüzüne göre çizilir — Ankara Çankaya'da.",
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
    instagramKicker: "INSTAGRAM",
    instagramTitle: "Stüdyodan son paylaşımlar",
    instagramText:
      "Güncel çalışmalarımızı, öncesi–sonrası kareleri ve stüdyodan anları Instagram'da paylaşıyoruz.",
    instagramCta: "Instagram'da takip et",
    aboutKicker: "Neden Stria",
    aboutTitle: "Rahat, güvenli ve tamamen sana özel",
    aboutText:
      "Her uygulamaya yüz analizi ve simetri ölçümüyle başlıyoruz. Steril ortam, kaliteli pigmentler ve doğallıktan ödün vermeyen bir anlayış — Stria'da güzellik abartısız ve sana ait kalıyor.",
    aboutStoryLong:
      "Stria Studio, Ankara Çankaya'da kalıcı makyaj ve güzellik alanında; doğallığı, sterilizasyonu ve kişiye özel tasarımı merkezine alan bir stüdyodur. Her uygulamaya ücretsiz ön görüşme, yüz analizi ve simetri ölçümüyle başlıyor; kaliteli pigmentler ve tek kullanımlık ekipmanla, abartısız ve size ait bir sonuç hedefliyoruz.",
    founderKicker: "Kurucu",
    founderName: "Nilsu Kamişli",
    founderRole: "Kurucu & Kalıcı Makyaj Uzmanı",
    founderText:
      "Stria Studio'nun kurucusu Nilsu Kamişli; kaş tasarımı, microblading ve kalıcı makyaj alanında her müşterisine yüz hatlarına özel, doğal ve abartısız sonuçlar sunar. Hijyen ve güveni merkezine alan yaklaşımıyla her uygulamayı ücretsiz ön görüşme ve yüz analiziyle kişiselleştirir.",
    contactKicker: "İletişim",
    contactTitle: "Hadi randevunu oluşturalım",
    contactText:
      "Sorular ve randevu için WhatsApp'tan yaz ya da bizi ara. En kısa sürede dönüş yapıyoruz.",
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
    reviewsKicker: "Yorumlar",
    reviewsTitle: "Müşterilerimiz ne diyor?",
    reviewCountLabel: "değerlendirme",
    googleReviewsLabel: "Google yorumu",
    googleViewLabel: "Google'da görüntüle",
    verifiedNote: "Gerçek müşteri değerlendirmeleri",
  },
  en: {
    navServices: "Services",
    navGallery: "Gallery",
    navAbout: "About",
    navContact: "Contact",
    navBlog: "Blog",
    navFaq: "FAQ",
    navCta: "Book Now",
    callLabel: "Call",
    heroKicker: "Ankara · Brow Design, Microblading & Permanent Makeup",
    heroTitle: "Your brows, beautiful\nat their most natural",
    heroText:
      "Bespoke microblading, powder brows and permanent makeup, designed for your features. In Çankaya, Ankara.",
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
    instagramKicker: "INSTAGRAM",
    instagramTitle: "Latest from the studio",
    instagramText:
      "We share our latest work, before-and-after shots and moments from the studio on Instagram.",
    instagramCta: "Follow on Instagram",
    aboutKicker: "Why Stria",
    aboutTitle: "Relaxed, safe and entirely yours",
    aboutText:
      "Every treatment begins with facial analysis and symmetry mapping. A sterile space, premium pigments and an approach that never oversteps — at Stria, beauty stays understated and unmistakably yours.",
    aboutStoryLong:
      "Stria Studio is a permanent-makeup and beauty studio in Çankaya, Ankara, built around natural results, strict sterilisation and per-face design. Every treatment starts with a free consultation, face analysis and symmetry measurement; with quality pigments and single-use tools we aim for an understated result that stays truly yours.",
    founderKicker: "Founder",
    founderName: "Nilsu Kamişli",
    founderRole: "Founder & Permanent Makeup Specialist",
    founderText:
      "Nilsu Kamişli, founder of Stria Studio, delivers natural, understated results in brow design, microblading and permanent makeup — each mapped to the client's own features. With hygiene and trust at the core, every treatment starts with a free consultation and facial analysis.",
    contactKicker: "Contact",
    contactTitle: "Let's book your appointment",
    contactText:
      "Message us on WhatsApp or call for questions and bookings. We reply as soon as we can.",
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
    reviewsKicker: "Reviews",
    reviewsTitle: "What our clients say",
    reviewCountLabel: "reviews",
    googleReviewsLabel: "Google reviews",
    googleViewLabel: "View on Google",
    verifiedNote: "Verified client feedback",
  },
};
