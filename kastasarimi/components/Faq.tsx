// Accordion using native <details>/<summary> — accessible, works without JS,
// and fully visible to crawlers/AI in the initial HTML.
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-8 divide-y divide-line rounded-[2px] border border-line bg-cream">
      {items.map((f, i) => (
        <details key={i} className="group px-5 py-1 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[16px] font-medium text-ink">
            {f.q}
            <span className="shrink-0 text-accent transition group-open:rotate-45">+</span>
          </summary>
          <p className="pb-5 pr-8 text-[15px] leading-relaxed text-muted2">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
