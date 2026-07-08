import { site } from "@/lib/site";
import { WhatsAppIcon } from "@/components/Icons";

// Sticky bottom-right WhatsApp button with a pulsing ring.
export function WhatsAppFab() {
  return (
    <a
      href={site.wa}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,0.7)] transition-transform duration-200 hover:scale-110"
      style={{ animation: "waPulse 2s ease-in-out infinite" }}
    >
      <WhatsAppIcon size={28} />
    </a>
  );
}
