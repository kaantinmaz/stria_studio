import { trust } from "@/lib/copy";

export function TrustBar() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {trust.items.map((it) => (
        <div key={it.label} className="rounded-[16px] border border-line bg-white px-4 py-6 text-center">
          <p className="text-[26px] font-medium text-accent-dark">{it.stat}</p>
          <p className="mt-1 text-[13px] leading-snug text-muted2">{it.label}</p>
        </div>
      ))}
    </div>
  );
}
