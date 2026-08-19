"use client";

import { useLang } from "@/components/LanguageProvider";
import { useSettings } from "@/components/SettingsProvider";
import { type InstagramPost } from "@/lib/content";
import { ImageSlot } from "@/components/ImageSlot";
import { InstagramIcon } from "@/components/Icons";

export function InstagramFeed({ posts }: { posts: InstagramPost[] }) {
  const { t } = useLang();
  const settings = useSettings();

  // Gönderi yoksa bölüm hiç basılmaz (sahte veri üretilmez).
  if (posts.length === 0) return null;

  return (
    <section
      id="instagram"
      className="px-[clamp(18px,5vw,56px)] pb-[clamp(64px,8vw,120px)] pt-[clamp(30px,5vw,60px)]"
    >
      <div className="mx-auto mb-[clamp(28px,4vw,44px)] flex max-w-[1160px] flex-wrap items-end justify-between gap-[18px]">
        <div className="reveal">
          <div className="mb-3 text-xs uppercase tracking-[0.14em] text-accent">
            {t.instagramKicker}
          </div>
          <h2 className="text-[clamp(30px,4vw,52px)] leading-[1.1]">
            {t.instagramTitle}
          </h2>
        </div>
        <div className="reveal max-w-[320px]">
          <p className="text-sm leading-[1.6] text-muted">{t.instagramText}</p>
          <a
            href={settings.instagram}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-[9px] rounded-[28px] bg-ink px-6 py-[13px] text-sm text-cream"
          >
            <InstagramIcon size={16} />
            {t.instagramCta}
          </a>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1160px] grid-cols-[repeat(auto-fill,minmax(min(100%,210px),1fr))] gap-[14px]">
        {posts.map((post) => {
          const caption = post.caption?.replace(/\s+/g, " ").trim() ?? "";
          const alt = caption ? caption.slice(0, 90) : t.instagramTitle;
          return (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noreferrer"
              className="reveal relative block aspect-square overflow-hidden rounded-[22px]"
            >
              <ImageSlot
                src={post.image ?? ""}
                alt={alt}
                placeholder={alt}
                sizes="(max-width: 768px) 100vw, 280px"
              />
              {post.media_type === "VIDEO" && (
                <span className="absolute right-[10px] top-[10px] flex h-[26px] w-[26px] items-center justify-center rounded-full bg-ink/70 text-cream">
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              )}
            </a>
          );
        })}
      </div>
    </section>
  );
}
