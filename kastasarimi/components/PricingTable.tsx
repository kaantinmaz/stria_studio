// Pricing table — machine-extractable (real <table>) for AI answer engines.
export function PricingTable({
  rows,
}: {
  rows: { name: string; detail: string; price: string }[];
}) {
  return (
    <div className="mt-8 overflow-x-auto rounded-[20px] border border-line bg-white">
      <table className="w-full border-collapse text-left text-[15px]">
        <thead>
          <tr className="bg-blush text-ink">
            <th className="px-5 py-4 font-medium">Hizmet</th>
            <th className="px-5 py-4 font-medium">Kapsam</th>
            <th className="px-5 py-4 font-medium">Fiyat aralığı</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line">
              <td className="px-5 py-4 font-medium text-ink">{r.name}</td>
              <td className="px-5 py-4 text-muted2">{r.detail}</td>
              <td className="whitespace-nowrap px-5 py-4 text-accent-dark">{r.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
