import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { getSettings, SETTINGS_FALLBACK } from "@/lib/content";
import { JsonLd } from "@/components/JsonLd";
import { beautySalonSchema, websiteSchema } from "@/lib/schema";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { Analytics } from "@/components/Analytics";
import { Popup } from "@/components/Popup";
import { CookieConsent } from "@/components/CookieConsent";
import { ChatWidget } from "@/components/ChatWidget";

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: {
    default: "Mikroblading Ankara | Kıl Tekniği Kaş · Stria Studio",
    template: "%s · Mikroblading Ankara",
  },
  description:
    "Ankara Çankaya'da mikroblading (microblading / kıl tekniği kaş): doğal, kalıcı, yüze özel kaş tasarımı. Steril ekipman, 12–18 ay kalıcılık. WhatsApp'tan randevu.",
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
        {/* Admin-managed raw code (analytics/GTM/pixel). Server-rendered so injected
            <script> tags run; intentionally unescaped — admin-only, per-site. */}
        {settings.header_code && (
          <div dangerouslySetInnerHTML={{ __html: settings.header_code }} />
        )}
        <JsonLd data={beautySalonSchema(settings)} />
        <JsonLd data={websiteSchema()} />
        <Nav
          whatsapp={settings.whatsapp}
          campaignEnabled={settings.campaign_enabled}
          campaignText={settings.campaign_text_tr}
        />
        <Popup settings={settings} />
        <main>{children}</main>
        <Footer settings={settings} />
        <CookieConsent />
        <ChatWidget whatsapp={settings.whatsapp} />
        <WhatsAppFab whatsapp={settings.whatsapp} />
        <Analytics />
        {settings.footer_code && (
          <div dangerouslySetInnerHTML={{ __html: settings.footer_code }} />
        )}
      </body>
    </html>
  );
}
