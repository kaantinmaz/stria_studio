// Placeholder contact details from the design — the owner swaps these in one place.
export const site = {
  phone: "+90 507 732 30 26",
  phoneLocal: "0507 732 30 26",
  phoneHref: "tel:+905077323026",
  wa: "https://wa.me/905077323026",
  ig: "https://instagram.com/striastudio",
  igHandle: "@striastudio",
  address: "Çankaya, Ankara",
  // Laravel API base. Override with NEXT_PUBLIC_API_URL in .env.local.
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8002",

  // --- SEO / structured-data source of truth (owner replaces placeholders) ---
  siteUrl: "https://striastudio.com", // owner: set the real domain
  gbpUrl: "", // owner: paste the Google Business Profile URL when live
  nap: {
    name: "Stria Studio",
    streetAddress: "[Mahalle] Cd. No: 00", // owner: real street address
    locality: "Çankaya",
    region: "Ankara",
    postalCode: "06000", // owner: real postal code
    country: "TR",
  },
  geo: { lat: 39.9208, lng: 32.8541 }, // owner: exact studio coordinates
  hours: [
    {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      open: "10:00",
      close: "19:00",
    },
  ],
} as const;
