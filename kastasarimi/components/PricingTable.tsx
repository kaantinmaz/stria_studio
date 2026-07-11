// Pricing table — machine-extractable (real <table>) for AI answer engines.
export function PricingTable({
  rows,
}: {
  rows: { name: string; detail: string; price: string }[];
}) {
  return (
    <div className="mt-10 overflow-x-auto border-t border-ink/80">
      <table className="w-full border-collapse text-left text-[15px]">
        <thead>
          <tr className="border-b border-line text-[11px] uppercase tracking-[0.14em] text-muted2">
            <th className="py-4 pr-4 font-medium">Hizmet</th>
            <th className="py-4 pr-4 font-medium">Kapsam</th>
            <th className="py-4 font-medium">Fiyat aralığı</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line">
              <td className="py-5 pr-4 font-display text-[18px] text-ink">{r.name}</td>
              <td className="py-5 pr-4 text-muted2">{r.detail}</td>
              <td className="whitespace-nowrap py-5 font-display text-[18px] text-accent-dark">
                {r.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
