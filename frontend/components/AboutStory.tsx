"use client";

import { useLang } from "@/components/LanguageProvider";

export function AboutStory() {
  const { t } = useLang();
  return (
    <section className="px-[clamp(18px,5vw,56px)] py-[clamp(48px,6vw,88px)]">
      <p className="mx-auto max-w-[760px] text-center text-[clamp(16px,1.6vw,20px)] leading-[1.75] text-muted2">
        {t.aboutStoryLong}
      </p>
    </section>
  );
}
