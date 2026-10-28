import type { ServiceListItem } from "@/lib/content";

// Reklam dönüşümlerine (Google + Meta) giden değer. Tek kaynak: panelde hizmetin
// "Dönüşüm değeri". Hizmet bilinmiyorsa ya da değeri yoksa null → olaya
// value/currency hiç eklenmez (owner kararı 2026-10-28).
export type ConversionValue = { value: number; currency: "TRY" };

function of(service: ServiceListItem | undefined): ConversionValue | null {
  const value = service?.conversion_value;
  return value ? { value, currency: "TRY" } : null;
}

// `/hizmetler/<slug>` ve alt sayfaları (`/hizmetler/<slug>/<sub>`).
export function serviceValueForPath(path: string, services: ServiceListItem[]): ConversionValue | null {
  const slug = /^\/hizmetler\/([^/]+)/.exec(path)?.[1];
  return slug ? of(services.find((s) => s.slug === slug)) : null;
}

// Formdaki hizmet seçimi yerelleştirilmiş AD taşır (name_tr ya da name_en).
export function serviceValueForName(name: string | null, services: ServiceListItem[]): ConversionValue | null {
  return name ? of(services.find((s) => s.name_tr === name || s.name_en === name)) : null;
}
