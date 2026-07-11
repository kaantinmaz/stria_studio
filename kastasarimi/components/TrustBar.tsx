import { trust } from "@/lib/copy";

export function TrustBar() {
  return (
    <div className="grid grid-cols-2 border-y border-line sm:grid-cols-4 sm:divide-x sm:divide-line">
      {trust.items.map((it) => (
        <div key={it.label} className="px-4 py-7 text-center">
          <p className="font-display text-[clamp(28px,3.4vw,40px)] font-medium leading-none text-ink">
            {it.stat}
          </p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-muted2">{it.label}</p>
        </div>
      ))}
    </div>
  );
}
