export function ProcessSteps({ steps }: { steps: { title: string; text: string }[] }) {
  return (
    <ol className="mt-10 border-t border-line">
      {steps.map((s, i) => (
        <li
          key={i}
          className="grid grid-cols-[auto_1fr] gap-x-6 border-b border-line py-7 sm:grid-cols-[80px_1fr]"
        >
          <span className="font-display text-[clamp(28px,4vw,44px)] leading-none text-accent">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <h3 className="font-display text-[20px] font-medium text-ink">{s.title}</h3>
            <p className="mt-2 max-w-[560px] text-[15px] leading-relaxed text-muted2">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
