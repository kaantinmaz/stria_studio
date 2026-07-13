"use client";

import { useLang } from "@/components/LanguageProvider";
import { IMG, TRUST } from "@/lib/i18n";
import { ImageSlot } from "@/components/ImageSlot";

export function About({
  headingAs: Heading = "h2",
}: {
  headingAs?: "h1" | "h2";
}) {
  const { lang, t } = useLang();

  return (
    <section
      id="about"
      className="bg-blush px-[clamp(18px,5vw,56px)] py-[clamp(64px,8vw,120px)]"
    >
      <div className="mx-auto grid max-w-[1160px] grid-cols-1 items-center gap-[clamp(36px,5vw,80px)] md:grid-cols-2">
        <div className="reveal relative h-[min(64vh,520px)] overflow-hidden rounded-[32px] shadow-[0_40px_80px_-55px_rgba(197,124,105,0.7)]">
          <ImageSlot
            src={IMG.powder}
            alt={t.aboutTitle}
            sizes="(max-width: 768px) 100vw, 45vw"
          />
        </div>
        <div className="max-w-[520px]">
          <div className="reveal mb-[14px] text-xs uppercase tracking-[0.14em] text-accent">
            {t.aboutKicker}
          </div>
          <Heading className="reveal mb-5 text-[clamp(28px,3.8vw,48px)] leading-[1.12]">
            {t.aboutTitle}
          </Heading>
          <p className="reveal mb-[34px] text-base leading-[1.72] text-muted2">
            {t.aboutText}
          </p>
          <div className="grid grid-cols-2 gap-[14px]">
            {TRUST.map((tr) => (
              <div
                key={tr.label.en}
                className="reveal rounded-[20px] bg-cream px-[22px] py-5"
              >
                <div className="text-[30px] font-medium leading-none tracking-[-0.02em] text-accent">
                  {tr.stat[lang]}
                </div>
                <div className="mt-[6px] text-[13px] leading-[1.5] text-muted2">
                  {tr.label[lang]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
