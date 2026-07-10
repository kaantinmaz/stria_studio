import type { Settings } from "@/lib/content";
import { site } from "@/lib/site";

// Keyless Google Maps embed (q=... &output=embed) — no API key required.
export function StudioMap({ settings }: { settings: Settings }) {
  const query = encodeURIComponent(
    `${site.studio} ${settings.street_address} ${settings.locality} ${settings.region}`,
  );
  return (
    <div className="overflow-hidden rounded-[20px] border border-line">
      <iframe
        title="Stria Studio — Ankara Çankaya konum haritası"
        src={`https://www.google.com/maps?q=${query}&output=embed`}
        width="100%"
        height="320"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        style={{ border: 0 }}
      />
    </div>
  );
}
