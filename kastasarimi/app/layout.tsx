import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { getSettings, SETTINGS_FALLBACK } from "@/lib/content";
import { JsonLd } from "@/components/JsonLd";
import { beautySalonSchema } from "@/lib/schema";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { Analytics } from "@/components/Analytics";

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: {
    default: "Kaş Tasarımı Ankara | Kıl Tekniği Kaş Tasarımı · Stria Studio",
    template: "%s · Kaş Tasarımı Ankara",
  },
  description:
    "Ankara Çankaya'da kaş tasarımı (kıl tekniği kaş): doğal, kalıcı, yüze özel kaş tasarımı. Steril ekipman, uzman uygulama, 12–18 ay kalıcılık. WhatsApp'tan randevu.",
  keywords: [...site.keywords],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: site.brand,
    images: [{ url: "/og" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  other: {
    "geo.region": "TR-06",
    "geo.placename": "Ankara",
    "geo.position": "39.9208;32.8541",
    ICBM: "39.9208, 32.8541",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = (await getSettings()) ?? SETTINGS_FALLBACK;
  return (
    <html lang="tr" className={jost.variable}>
      <body>
        <JsonLd data={beautySalonSchema(settings)} />
        <Nav whatsapp={settings.whatsapp} />
        <main>{children}</main>
        <Footer settings={settings} />
        <WhatsAppFab whatsapp={settings.whatsapp} />
        <Analytics />
      </body>
    </html>
  );
}
