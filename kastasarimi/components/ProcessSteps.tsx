export function ProcessSteps({ steps }: { steps: { title: string; text: string }[] }) {
  return (
    <ol className="mt-10 grid gap-6 sm:grid-cols-2">
      {steps.map((s, i) => (
        <li key={i} className="relative rounded-[16px] border border-line bg-white p-6">
          <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-[16px] bg-blush text-[15px] font-medium text-accent-dark">
            {i + 1}
          </span>
          <h3 className="text-[18px] text-ink">{s.title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-muted2">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}
