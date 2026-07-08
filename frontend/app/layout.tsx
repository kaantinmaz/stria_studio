import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { ServicesProvider } from "@/components/ServicesProvider";
import { SettingsProvider } from "@/components/SettingsProvider";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { JsonLd } from "@/components/JsonLd";
import { beautySalonSchema } from "@/components/schema";
import { site } from "@/lib/site";
import { getServices, getSettings } from "@/lib/content";

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
    images: [{ url: "/images/hero.png" }],
  },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [services, settings] = await Promise.all([getServices(), getSettings()]);
  return (
    <html lang="tr" className={jost.variable}>
      <body>
        <JsonLd data={beautySalonSchema()} />
        <LanguageProvider>
          <SettingsProvider settings={settings}>
            <ServicesProvider services={services}>{children}</ServicesProvider>
          </SettingsProvider>
        </LanguageProvider>
        <WhatsAppFab />
      </body>
    </html>
  );
}
