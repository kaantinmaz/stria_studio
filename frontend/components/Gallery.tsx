"use client";

import { useLang } from "@/components/LanguageProvider";
import { pickLang, type GalleryItem2 } from "@/lib/content";
import { ImageSlot } from "@/components/ImageSlot";

export function Gallery({
  items,
  headingAs: Heading = "h2",
}: {
  items: GalleryItem2[];
  headingAs?: "h1" | "h2";
}) {
  const { lang, t } = useLang();

  return (
    <section
      id="gallery"
      className="px-[clamp(18px,5vw,56px)] pb-[clamp(64px,8vw,120px)] pt-[clamp(30px,5vw,60px)]"
    >
      <div className="mx-auto mb-[clamp(28px,4vw,44px)] flex max-w-[1160px] flex-wrap items-end justify-between gap-[18px]">
        <div className="reveal">
          <div className="mb-3 text-xs uppercase tracking-[0.14em] text-accent">
            {t.galleryKicker}
          </div>
          <Heading className="text-[clamp(30px,4vw,52px)] leading-[1.1]">
            {t.galleryTitle}
          </Heading>
        </div>
        <p className="reveal max-w-[320px] text-sm leading-[1.6] text-muted">
          {t.galleryText}
        </p>
      </div>

      <div className="mx-auto grid max-w-[1160px] grid-cols-[repeat(auto-fill,minmax(min(100%,210px),1fr))] gap-[14px] [grid-auto-rows:250px]">
        {items.map((g, i) => {
          const alt = pickLang(g.alt_tr, g.alt_en, lang);
          return (
            <div
              key={i}
              className="reveal relative overflow-hidden rounded-[22px]"
            >
              <ImageSlot
                src={g.image ?? ""}
                alt={alt}
                placeholder={alt}
                sizes="(max-width: 768px) 100vw, 280px"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
