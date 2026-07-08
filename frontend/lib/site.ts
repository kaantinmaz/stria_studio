// Site-wide config. Contact/NAP details now live in the DB (see /api/settings).
export const site = {
  // Laravel API base. Override with NEXT_PUBLIC_API_URL in .env.local.
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8002",

  // --- SEO / structured-data source of truth (owner replaces placeholders) ---
  siteUrl: "https://striastudio.com", // owner: set the real domain
  gbpUrl: "", // owner: paste the Google Business Profile URL when live
  nap: {
    name: "Stria Studio",
  },
} as const;
