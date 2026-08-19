"use client";

import type { JSX } from "react";
import { useLang } from "@/components/LanguageProvider";
import { Stars } from "@/components/Stars";

// Compact rating badge for service cards. Returns null when there is no real
// data (value null or count 0) — the site never renders a fabricated rating.
export function RatingBadge({
  value,
  count,
  size = 13,
  className,
}: {
  value: number | null;
  count: number;
  size?: number;
  className?: string;
}): JSX.Element | null {
  const { lang, t } = useLang();
  if (value == null || count === 0) return null;

  const num = value.toLocaleString(lang === "en" ? "en-US" : "tr-TR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const aria =
    lang === "en"
      ? `${num} out of 5 — ${count} ${t.reviewCountLabel}`
      : `5 üzerinden ${num} — ${count} ${t.reviewCountLabel}`;

  return (
    <span
      className={`inline-flex items-center gap-[6px] text-[13px] ${className ?? ""}`}
      aria-label={aria}
    >
      <Stars value={value} size={size} />
      <span className="font-medium text-ink">{num}</span>
      <span className="text-muted">({count})</span>
    </span>
  );
}
