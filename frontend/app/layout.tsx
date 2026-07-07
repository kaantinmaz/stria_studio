import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stria Studio · Kalıcı Makyaj & Güzellik Stüdyosu · Ankara",
  description:
    "Ankara Çankaya'da microblading, kalıcı makyaj ve kaş–kirpik bakımı. Doğal, steril ve tamamen size özel dokunuşlar.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={jost.variable}>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
