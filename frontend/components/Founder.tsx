"use client";

import { useLang } from "@/components/LanguageProvider";
import { ImageSlot } from "@/components/ImageSlot";

export function Founder() {
  const { t } = useLang();

  return (
    <section
      id="founder"
      className="px-[clamp(18px,5vw,56px)] py-[clamp(64px,8vw,120px)]"
    >
      <div className="mx-auto grid max-w-[1160px] grid-cols-1 items-center gap-[clamp(36px,5vw,80px)] md:grid-cols-2">
        <div className="max-w-[520px] md:order-1">
          <div className="reveal mb-[14px] text-xs uppercase tracking-[0.14em] text-accent">
            {t.founderKicker}
          </div>
          <h2 className="reveal mb-2 text-[clamp(28px,3.8vw,48px)] leading-[1.12]">
            {t.founderName}
          </h2>
          <div className="reveal mb-5 text-sm font-medium tracking-[0.04em] text-accent">
            {t.founderRole}
          </div>
          <p className="reveal text-base leading-[1.72] text-muted2">
            {t.founderText}
          </p>
        </div>
        <div className="reveal relative h-[min(70vh,560px)] overflow-hidden rounded-[32px] shadow-[0_40px_80px_-55px_rgba(229,135,146,0.7)] md:order-2">
          <ImageSlot
            src="/images/nilsu-kamisli.jpg"
            alt="Nilsu Kamişli — Stria Studio kurucusu, kalıcı makyaj uzmanı"
            sizes="(max-width: 768px) 100vw, 45vw"
          />
        </div>
      </div>
    </section>
  );
}
