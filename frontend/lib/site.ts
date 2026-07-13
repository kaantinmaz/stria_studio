// Site-wide config. Contact/NAP details now live in the DB (see /api/settings).
export const site = {
  // Laravel API base. Prod: https://admin.striastudio.com.tr (set via
  // NEXT_PUBLIC_API_URL at build time). Fallback is local dev.
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8002",

  // --- SEO / structured-data source of truth (owner replaces placeholders) ---
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://striastudio.com.tr",
  gbpUrl: "", // owner: paste the Google Business Profile URL when live
  nap: {
    name: "Stria Studio",
  },
} as const;
