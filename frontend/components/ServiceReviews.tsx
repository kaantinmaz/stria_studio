"use client";

import type { JSX } from "react";
import { useLang } from "@/components/LanguageProvider";
import { Stars } from "@/components/Stars";
import { GoogleIcon } from "@/components/Icons";
import type { ServiceReview } from "@/lib/content";

function formatDate(value: string, lang: "tr" | "en"): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(lang === "en" ? "en-US" : "tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Real client reviews for a service. Renders nothing when there are no reviews
// — no "0 reviews", no empty stars, no placeholder cards.
export function ServiceReviews({
  reviews,
  ratingAvg,
  ratingCount,
  subjectName,
  className,
}: {
  reviews: ServiceReview[];
  ratingAvg: number | null;
  ratingCount: number;
  /** Set on sub-service pages: says out loud which service the reviews belong to. */
  subjectName?: string;
  className?: string;
}): JSX.Element | null {
  const { lang, t } = useLang();
  if (reviews.length === 0) return null;

  const avg =
    ratingAvg != null
      ? ratingAvg.toLocaleString(lang === "en" ? "en-US" : "tr-TR", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })
      : null;

  return (
    <section
      className={`reveal mx-auto max-w-[1160px] px-[clamp(18px,5vw,56px)] py-[clamp(32px,5vw,64px)] ${className ?? ""}`}
    >
      <div className="mb-4 text-xs uppercase tracking-[0.14em] text-accent">
        {t.reviewsKicker}
      </div>
      <h2 className="mb-3 text-[clamp(22px,2.4vw,30px)] leading-[1.1]">
        {t.reviewsTitle}
      </h2>
      <p className="mb-7 text-[13px] text-muted">
        {subjectName
          ? lang === "en"
            ? `Reviews left for our ${subjectName} service.`
            : `${subjectName} hizmetimiz için bırakılan değerlendirmeler.`
          : t.verifiedNote}
      </p>

      {avg != null && ratingCount > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-4 rounded-[24px] border border-line bg-blush px-6 py-5">
          <span className="text-[clamp(34px,5vw,46px)] font-medium leading-none tracking-[-0.02em] text-ink">
            {avg}
          </span>
          <div className="flex flex-col gap-1">
            <Stars value={ratingAvg ?? 0} size={18} />
            <span className="text-[13px] text-muted">
              {ratingCount} {t.reviewCountLabel} · {t.verifiedNote}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review, index) => {
          const body =
            lang === "en" && review.body_en ? review.body_en : review.body;
          const date = review.reviewed_at
            ? formatDate(review.reviewed_at, lang)
            : null;
          const isGoogle = review.source === "google";
          return (
            <article
              key={`${review.author_name}-${index}`}
              className="flex flex-col gap-3 rounded-[24px] border border-line bg-white px-6 py-5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-ink">{review.author_name}</span>
                {isGoogle && (
                  <span className="inline-flex items-center gap-[5px] text-[11px] text-muted">
                    <GoogleIcon size={13} />
                    Google
                  </span>
                )}
              </div>
              <Stars value={review.rating} size={14} />
              <p className="flex-1 text-[14px] leading-[1.7] text-muted2">{body}</p>
              <div className="flex items-center justify-between gap-3 text-[12px] text-muted">
                {date ? <span>{date}</span> : <span />}
                {isGoogle && review.source_url && (
                  <a
                    href={review.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent transition-colors hover:text-accent-dark"
                  >
                    {t.googleViewLabel} →
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
