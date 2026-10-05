"use client";

import { useLang } from "@/components/LanguageProvider";
import { useSettings } from "@/components/SettingsProvider";
import { phoneHref } from "@/lib/content";
import { whatsappHref, GENERIC_WHATSAPP_TEXT } from "@/lib/whatsapp";
import { PinIcon, WhatsAppIcon } from "@/components/Icons";
import { ContactForm } from "@/components/ContactForm";

export function Contact({
  headingAs: Heading = "h2",
}: {
  headingAs?: "h1" | "h2";
}) {
  const { lang, t } = useLang();
  const settings = useSettings();

  return (
    <section id="contact" className="px-[clamp(18px,5vw,56px)] py-[clamp(64px,8vw,120px)]">
      <div className="mx-auto grid max-w-[1160px] grid-cols-1 items-start gap-[clamp(36px,5vw,80px)] md:grid-cols-2">
        <div>
          <div className="reveal mb-[14px] text-xs uppercase tracking-[0.14em] text-accent">
            {t.contactKicker}
          </div>
          <Heading className="reveal mb-[22px] text-[clamp(30px,4.2vw,56px)] leading-[1.06]">
            {t.contactTitle}
          </Heading>
          <p className="reveal mb-8 max-w-[420px] text-base leading-[1.7] text-muted">
            {t.contactText}
          </p>
          <div className="reveal mb-8 flex flex-wrap gap-3">
            <a
              href={whatsappHref(settings.whatsapp, GENERIC_WHATSAPP_TEXT)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-[9px] rounded-[28px] bg-rose px-7 py-[15px] text-sm text-white"
            >
              <WhatsAppIcon size={16} />
              {t.heroCtaPrimary}
            </a>
            <a
              href={phoneHref(settings.phone)}
              className="rounded-[28px] border border-line2 bg-white px-7 py-[15px] text-sm text-ink"
            >
              {settings.phone}
            </a>
          </div>

          {/* info card */}
          <div className="reveal rounded-[28px] border border-line bg-white p-[clamp(24px,3vw,40px)]">
            {t.info.map((i) => (
              <div
                key={i.label}
                className="flex gap-4 border-b border-[#f4e3e3] py-4 last:border-b-0"
              >
                <div className="w-24 flex-none pt-[3px] text-[11px] uppercase tracking-[0.12em] text-accent">
                  {i.label}
                </div>
                <div className="text-base leading-[1.5] text-ink">{i.value}</div>
              </div>
            ))}
            <a
              href={
                settings.google_maps_url ??
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  "Stria Studio Çankaya Ankara",
                )}`
              }
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-[20px] border border-line2 bg-cream/60 px-5 py-3 text-[13px] font-medium text-ink transition-colors hover:border-accent hover:text-accent"
            >
              <PinIcon size={15} className="text-blossom" />
              {lang === "en" ? "Open in Maps" : "Haritada aç"}
            </a>
          </div>
        </div>

        {/* appointment form */}
        <ContactForm />
      </div>
    </section>
  );
}
