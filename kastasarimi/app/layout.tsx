import type { Metadata } from "next";
import Script from "next/script";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { getSettings, SETTINGS_FALLBACK } from "@/lib/content";
import { JsonLd } from "@/components/JsonLd";
import { beautySalonSchema, webSiteSchema } from "@/lib/schema";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { ChatWidget } from "@/components/ChatWidget";
import { Analytics } from "@/components/Analytics";
import { Popup } from "@/components/Popup";
import { CookieConsent } from "@/components/CookieConsent";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-fraunces-src",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
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
    <html lang="tr" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        {/* Admin-managed raw code (analytics/GTM/pixel). Server-rendered so injected
            <script> tags run; intentionally unescaped — admin-only, per-site. */}
        {settings.header_code && (
          <div dangerouslySetInnerHTML={{ __html: settings.header_code }} />
        )}
        <JsonLd data={beautySalonSchema(settings)} />
        <JsonLd data={webSiteSchema()} />
        <Nav
          whatsapp={settings.whatsapp}
          campaignEnabled={settings.campaign_enabled}
          campaignText={settings.campaign_text_tr}
        />
        <main>{children}</main>
        <Footer settings={settings} />
        <CookieConsent />
        <WhatsAppFab whatsapp={settings.whatsapp} />
        <ChatWidget whatsapp={settings.whatsapp} />
        <Popup settings={settings} />
        <Analytics />
        {/* Third-party visitor analytics (site-wide) */}
        <Script
          src="http://localhost:3001/v.js"
          data-vd="IOi9dvnMzzalAZVlZnqYX99rWUwKZa02"
          strategy="afterInteractive"
        />
        {settings.footer_code && (
          <div dangerouslySetInnerHTML={{ __html: settings.footer_code }} />
        )}
      </body>
    </html>
  );
}
