import { phoneHref, type Settings } from "@/lib/content";
import { WhatsAppIcon, PhoneIcon } from "@/components/Icons";

// Reused call-to-action row: one filled WhatsApp button + a phone text link.
// `variant` toggles colors for light sections vs the dark banner.
export function CTAButtons({
  settings,
  variant = "light",
}: {
  settings: Settings;
  variant?: "light" | "dark";
}) {
  const wa =
    variant === "dark"
      ? "bg-cream text-ink hover:bg-pink"
      : "bg-accent text-white hover:bg-accent-dark";
  const call =
    variant === "dark" ? "text-cream/90 hover:text-cream" : "text-ink hover:text-accent-dark";
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
      <a
        href={settings.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2.5 px-7 py-[15px] text-[12px] uppercase tracking-[0.12em] transition ${wa}`}
      >
        <WhatsAppIcon className="h-[18px] w-[18px]" /> WhatsApp'tan Randevu
      </a>
      <a
        href={phoneHref(settings.phone)}
        className={`inline-flex items-center gap-2 border-b border-current pb-1 text-[14px] transition ${call}`}
      >
        <PhoneIcon className="h-[16px] w-[16px]" /> {settings.phone_local}
      </a>
    </div>
  );
}

// Full-width dark CTA banner used near the bottom of pages.
export function CTABanner({ settings }: { settings: Settings }) {
  return (
    <section className="py-4">
      <div className="mx-auto max-w-[1180px] px-5">
        <div className="bg-ink px-6 py-16 text-center sm:px-12">
          <h2 className="mx-auto max-w-[620px] font-display text-[clamp(26px,4vw,42px)] leading-[1.1] text-cream">
            Ankara'da doğal kaşlar için ücretsiz ön görüşme
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-[15px] text-cream/70">
            Uygunluğunuzu değerlendirelim, kaş tasarımınızı birlikte planlayalım. Randevu ücretsizdir.
          </p>
          <div className="mt-8 flex justify-center">
            <CTAButtons settings={settings} variant="dark" />
          </div>
        </div>
      </div>
    </section>
  );
}
