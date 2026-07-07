// Visual FAQ (accessible <details>). JSON-LD FAQPage schema is added separately
// by the page via <JsonLd data={faqSchema(items)} />.
export function Faq({
  title,
  items,
}: {
  title: string;
  items: { q: string; a: string }[];
}) {
  return (
    <section className="mx-auto max-w-[820px] px-[clamp(18px,5vw,56px)] py-[clamp(32px,5vw,64px)]">
      <h2 className="mb-6 text-center text-[clamp(24px,3vw,38px)]">{title}</h2>
      <div className="flex flex-col gap-3">
        {items.map((f) => (
          <details
            key={f.q}
            className="group rounded-[18px] border border-line bg-white px-5 py-4"
          >
            <summary className="cursor-pointer list-none text-[16px] font-medium text-ink [&::-webkit-details-marker]:hidden">
              {f.q}
            </summary>
            <p className="mt-3 text-[14px] leading-[1.7] text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
