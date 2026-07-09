// Microsite-wide config. NAP/hours come from the shared backend (/settings);
// these are brand + SEO constants specific to this domain.
export const site = {
  // Shared Laravel API base. Override with NEXT_PUBLIC_API_URL.
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8002",

  // Microsite slug — must match a key in backend/config/microsites.php.
  slug: process.env.NEXT_PUBLIC_SITE ?? "mikroblading-ankara",

  // Public domain (canonical, sitemap, OpenGraph).
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://mikrobladingankara.com",

  brand: "Mikroblading Ankara",
  studio: "Stria Studio",
  gbpUrl: "", // owner: paste Google Business Profile URL when live
  instagram: "https://instagram.com/striastudio",

  // Primary target keywords (used in metadata + llms.txt).
  keywords: [
    "mikroblading ankara",
    "ankara mikroblading",
    "microblading ankara",
    "kıl tekniği kaş ankara",
    "kalıcı kaş ankara",
    "çankaya mikroblading",
    "kaş tasarımı ankara",
  ],
} as const;
