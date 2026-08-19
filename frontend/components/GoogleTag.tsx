import Script from "next/script";
import { site } from "@/lib/site";
import { GA_ENABLED, gtagConfigScript } from "@/lib/gtag";

/**
 * Google etiketi (gtag.js) yükleyici + yapılandırma.
 *
 * Consent Mode v2 varsayılanları burada DEĞİL: onlar `gtagBootstrapTag()` ile
 * layout'un <head>'ine düz inline script olarak, gtag.js'ten önce basılıyor.
 * Onay güncellemesi `CookieConsent` bileşeninden geliyor.
 */
export function GoogleTag() {
  if (!GA_ENABLED) return null;

  return (
    <>
      <Script
        id="gtag-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${site.gaId}`}
      />
      <Script id="gtag-config" strategy="afterInteractive">
        {gtagConfigScript()}
      </Script>
    </>
  );
}
