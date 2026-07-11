// Microsite-wide config. NAP/hours come from the shared backend (/settings);
// these are brand + SEO constants specific to this domain.
export const site = {
  // Shared Laravel API base. Override with NEXT_PUBLIC_API_URL.
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8002",

  // Microsite slug — must match a key in backend/config/microsites.php.
  slug: process.env.NEXT_PUBLIC_SITE ?? "kas-tasarimi-ankara",

  // Public domain (canonical, sitemap, OpenGraph).
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kastasarimiankara.com",

  brand: "Kaş Tasarımı Ankara",
  studio: "Stria Studio",
  gbpUrl: "", // owner: paste Google Business Profile URL when live
  instagram: "https://instagram.com/striastudio",

  // Primary target keywords (used in metadata + llms.txt).
  keywords: [
    "kaş tasarımı ankara",
    "ankara kaş tasarımı",
    "kalıcı kaş ankara",
    "kıl tekniği kaş ankara",
    "kişiye özel kaş tasarımı",
    "çankaya kaş tasarımı",
    "doğal kaş tasarımı ankara",
  ],
} as const;
