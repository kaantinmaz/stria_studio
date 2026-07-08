"use client";

import { useLang } from "@/components/LanguageProvider";
import { GALLERY } from "@/lib/i18n";
import { ImageSlot } from "@/components/ImageSlot";

export function Gallery() {
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
          <h2 className="text-[clamp(30px,4vw,52px)] leading-[1.1]">
            {t.galleryTitle}
          </h2>
        </div>
        <p className="reveal max-w-[320px] text-sm leading-[1.6] text-muted">
          {t.galleryText}
        </p>
      </div>

      <div className="mx-auto grid max-w-[1160px] grid-cols-[repeat(auto-fill,minmax(min(100%,210px),1fr))] gap-[14px] [grid-auto-rows:250px]">
        {GALLERY.map((g) => (
          <div
            key={g.id}
            className="reveal relative overflow-hidden rounded-[22px]"
          >
            <ImageSlot
              src={g.img}
              alt={g.ph[lang]}
              placeholder={g.ph[lang]}
              sizes="(max-width: 768px) 100vw, 280px"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
