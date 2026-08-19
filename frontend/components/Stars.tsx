import type { JSX } from "react";

// Decorative 5-star rating with fractional (half-star) fill. Purely visual —
// the wrapper is aria-hidden; callers expose the numeric value/aria-label.
// Filled stars use text-rose, empty stars text-line2; the fill is a clipped
// overlay so both layers inherit currentColor (no per-value gradient ids).

const STAR_PATH =
  "M12 2.2l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.02l-5.8 3.04 1.1-6.46-4.69-4.58 6.49-.94L12 2.2Z";

function Star({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="flex-none">
      <path d={STAR_PATH} />
    </svg>
  );
}

export function Stars({
  value,
  size = 14,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}): JSX.Element {
  const pct = (Math.max(0, Math.min(5, value)) / 5) * 100;
  const stars = [0, 1, 2, 3, 4];
  return (
    <span
      className={`relative inline-flex leading-none ${className ?? ""}`}
      aria-hidden="true"
    >
      <span className="flex text-line2">
        {stars.map((i) => (
          <Star key={i} size={size} />
        ))}
      </span>
      <span
        className="absolute inset-0 flex overflow-hidden text-rose"
        style={{ width: `${pct}%` }}
      >
        {stars.map((i) => (
          <Star key={i} size={size} />
        ))}
      </span>
    </span>
  );
}
