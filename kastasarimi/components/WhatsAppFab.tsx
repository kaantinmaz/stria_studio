import { WhatsAppIcon } from "@/components/Icons";

// Sticky WhatsApp button. Server component — the href comes from settings.
export function WhatsAppFab({ whatsapp }: { whatsapp: string }) {
  return (
    <a
      href={whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp'tan randevu al"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg"
      style={{ animation: "waPulse 2.4s infinite" }}
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
