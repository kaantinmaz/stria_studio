import { phoneHref, type Settings } from "@/lib/content";
import { WhatsAppIcon, PhoneIcon } from "@/components/Icons";

// Reused call-to-action row: WhatsApp + phone. `variant` toggles button colors
// for use on light sections vs the dark banner.
export function CTAButtons({
  settings,
  variant = "light",
}: {
  settings: Settings;
  variant?: "light" | "dark";
}) {
  const wa =
    variant === "dark"
      ? "bg-[#25D366] text-white hover:opacity-90"
      : "bg-[#25D366] text-white hover:opacity-90";
  const call =
    variant === "dark"
      ? "border border-cream/40 text-cream hover:bg-cream/10"
      : "border border-ink/20 text-ink hover:bg-ink/5";
  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={settings.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 rounded-full px-6 py-[14px] text-[15px] transition ${wa}`}
      >
        <WhatsAppIcon className="h-5 w-5" /> WhatsApp'tan Randevu
      </a>
      <a
        href={phoneHref(settings.phone)}
        className={`inline-flex items-center gap-2 rounded-full px-6 py-[14px] text-[15px] transition ${call}`}
      >
        <PhoneIcon className="h-5 w-5" /> {settings.phone_local}
      </a>
    </div>
  );
}

// Full-width dark CTA banner used near the bottom of pages.
export function CTABanner({ settings }: { settings: Settings }) {
  return (
    <section className="py-4">
      <div className="mx-auto max-w-[1180px] px-5">
        <div className="rounded-[28px] bg-ink px-6 py-12 text-center sm:px-12">
          <h2 className="mx-auto max-w-[560px] text-[clamp(22px,3vw,32px)] leading-tight text-cream">
            Ankara'da doğal kaşlar için ücretsiz ön görüşme
          </h2>
          <p className="mx-auto mt-3 max-w-[520px] text-[15px] text-cream/70">
            Uygunluğunuzu değerlendirelim, kaş tasarımınızı birlikte planlayalım. Randevu ücretsizdir.
          </p>
          <div className="mt-7 flex justify-center">
            <CTAButtons settings={settings} variant="dark" />
          </div>
        </div>
      </div>
    </section>
  );
}
