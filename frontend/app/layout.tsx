import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { ServicesProvider } from "@/components/ServicesProvider";
import { SettingsProvider } from "@/components/SettingsProvider";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { ChatWidget } from "@/components/ChatWidget";
import { Analytics } from "@/components/Analytics";
import { Popup } from "@/components/Popup";
import { EngageSurvey } from "@/components/EngageSurvey";
import { CookieConsent } from "@/components/CookieConsent";
import { JsonLd } from "@/components/JsonLd";
import { beautySalonSchema } from "@/components/schema";
import { site } from "@/lib/site";
import { getServices, getSettings, SETTINGS_FALLBACK } from "@/lib/content";

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: {
    default: "Stria Studio · Kalıcı Makyaj & Güzellik Stüdyosu · Ankara",
    template: "%s · Stria Studio",
  },
  description:
    "Ankara Çankaya'da microblading, kalıcı makyaj ve kaş–kirpik bakımı. Doğal, steril ve tamamen size özel dokunuşlar.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Stria Studio",
    images: [{ url: "/og" }],
  },
  twitter: { card: "summary_large_image" },
  other: {
    "geo.region": "TR-06",
    "geo.placename": "Çankaya, Ankara",
    "geo.position": "39.9208;32.8541",
    ICBM: "39.9208, 32.8541",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [services, settings] = await Promise.all([getServices(), getSettings()]);
  return (
    <html lang="tr" className={jost.variable}>
      <body>
        {/* Admin-managed raw code. Server-rendered so injected <script> tags run
            (innerHTML scripts wouldn't). Intentionally unescaped — admin-only. */}
        {settings?.header_code && (
          <div dangerouslySetInnerHTML={{ __html: settings.header_code }} />
        )}
        <JsonLd data={beautySalonSchema(settings ?? SETTINGS_FALLBACK)} />
        <LanguageProvider>
          <SettingsProvider settings={settings}>
            <ServicesProvider services={services}>
              {children}
              <Popup settings={settings ?? SETTINGS_FALLBACK} />
              <EngageSurvey
                whatsappUrl={(settings ?? SETTINGS_FALLBACK).whatsapp}
              />
            </ServicesProvider>
            <CookieConsent />
            <ChatWidget whatsappUrl={(settings ?? SETTINGS_FALLBACK).whatsapp} />
            <WhatsAppFab />
            <Analytics />
          </SettingsProvider>
        </LanguageProvider>
        {settings?.footer_code && (
          <div dangerouslySetInnerHTML={{ __html: settings.footer_code }} />
        )}
      </body>
    </html>
  );
}
