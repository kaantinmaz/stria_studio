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
      ? "bg-accent text-white hover:bg-accent-dark"
      : "bg-ink text-white hover:bg-accent-dark";
  const call =
    variant === "dark"
      ? "border border-cream/35 text-cream hover:bg-cream/10"
      : "border border-ink/25 text-ink hover:border-ink hover:bg-ink/[0.03]";
  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={settings.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2.5 rounded-none px-7 py-[15px] text-[14px] tracking-[0.02em] transition ${wa}`}
      >
        <WhatsAppIcon className="h-[18px] w-[18px]" /> WhatsApp'tan Randevu
      </a>
      <a
        href={phoneHref(settings.phone)}
        className={`inline-flex items-center gap-2.5 rounded-none px-7 py-[15px] text-[14px] tracking-[0.02em] transition ${call}`}
      >
        <PhoneIcon className="h-[18px] w-[18px]" /> {settings.phone_local}
      </a>
    </div>
  );
}

// Full-width dark CTA banner used near the bottom of pages.
export function CTABanner({ settings }: { settings: Settings }) {
  return (
    <section className="py-4">
      <div className="mx-auto max-w-[1180px] px-5">
        <div className="rounded-[2px] bg-ink px-6 py-12 text-center sm:px-12">
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
