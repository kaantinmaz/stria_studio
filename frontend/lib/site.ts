// Placeholder contact details from the design — the owner swaps these in one place.
export const site = {
  phone: "+90 500 000 00 00",
  phoneHref: "tel:+905000000000",
  wa: "https://wa.me/905000000000",
  ig: "https://instagram.com/striastudio",
  igHandle: "@striastudio",
  address: "Çankaya, Ankara",
  // Laravel API base. Override with NEXT_PUBLIC_API_URL in .env.local.
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8002",
} as const;
