"use client";

import { useLang } from "@/components/LanguageProvider";

// Owner: set the promo video here.
//  - YouTube:  "https://www.youtube.com/watch?v=XXXX"  (or youtu.be/XXXX)
//  - Self-host: put the file in public/videos/ and set "/videos/promo.mp4"
//  - Empty string -> a styled placeholder (nothing to show yet).
// ponytail: single const swap point; move to a CMS setting later if it changes often.
const VIDEO_URL = "/videos/promo.mp4";

function youtubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

export function PromoVideo() {
  const { lang } = useLang();
  const embed = VIDEO_URL ? youtubeEmbed(VIDEO_URL) : null;
  const isFile = VIDEO_URL && !embed;

  return (
    <section className="px-[clamp(18px,5vw,56px)] py-[clamp(40px,6vw,88px)]">
      <div className="mx-auto max-w-[960px]">
        <div className="mb-6 text-center">
          <div className="mb-3 text-xs uppercase tracking-[0.14em] text-accent">
            {lang === "tr" ? "Tanıtım" : "Studio"}
          </div>
          <h2 className="text-[clamp(26px,3.4vw,44px)] leading-[1.1]">
            {lang === "tr" ? "Stria Studio'yu keşfedin" : "Discover Stria Studio"}
          </h2>
        </div>

        <div className="relative aspect-video overflow-hidden rounded-[28px] border border-line bg-ink shadow-[0_40px_90px_-50px_rgba(197,124,105,0.7)]">
          {embed ? (
            <iframe
              src={embed}
              title="Stria Studio"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : isFile ? (
            <video
              controls
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover"
            >
              <source src={VIDEO_URL} />
            </video>
          ) : (
            // placeholder until the owner adds a video
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-ink to-accent-dark text-cream">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream/15 backdrop-blur-[4px]">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="text-[13px] uppercase tracking-[0.14em] text-cream/80">
                {lang === "tr" ? "Tanıtım videosu yakında" : "Promo video coming soon"}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
