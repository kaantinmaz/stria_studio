"use client";

import type { JSX } from "react";
import { useLang } from "@/components/LanguageProvider";
import { useSettings } from "@/components/SettingsProvider";
import { Stars } from "@/components/Stars";
import { GoogleIcon } from "@/components/Icons";

// Google Business Profile rating, formatted for display. Returns null when the
// admin has not entered a real Google rating — the site never fabricates one.
// Shared by the badge below and the Hero chip so the wording stays identical.
export function useGoogleRating() {
  const settings = useSettings();
  const { lang } = useLang();

  const rating = settings.google_rating;
  if (rating == null) return null;

  const en = lang === "en";
  const count = settings.google_review_count ?? 0;
  const num = rating.toLocaleString(en ? "en-US" : "tr-TR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  // Count is optional: with no real count we say "Google" instead of "0 yorum".
  const label = count > 0 ? `${count} ${en ? "Google reviews" : "Google yorumu"}` : "Google";
  const aria = en
    ? `Google: ${num} out of 5${count > 0 ? ` — ${count} reviews` : ""}`
    : `Google: 5 üzerinden ${num}${count > 0 ? ` — ${count} yorum` : ""}`;

  return { rating, count, num, label, aria, url: settings.google_maps_url };
}

// Google Business Profile rating badge. The source is stated explicitly
// ("Google") so it is never confused with our own client reviews.
export function GoogleRatingBadge({
  className,
  compact,
}: {
  className?: string;
  compact?: boolean;
}): JSX.Element | null {
  const google = useGoogleRating();
  if (!google) return null;

  const { rating, num, label, aria, url } = google;

  const inner = (
    <>
      <GoogleIcon size={compact ? 14 : 16} />
      <span className="font-medium text-ink">{num}</span>
      {!compact && <Stars value={rating} size={13} />}
      <span className="text-muted">{label}</span>
    </>
  );

  const base = `inline-flex items-center gap-[7px] text-[13px] ${className ?? ""}`;

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} transition-colors hover:text-accent`}
        aria-label={aria}
      >
        {inner}
      </a>
    );
  }

  return (
    <span className={base} aria-label={aria}>
      {inner}
    </span>
  );
}
