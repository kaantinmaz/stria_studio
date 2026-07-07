"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { SERVICES } from "@/lib/i18n";
import { ImageSlot } from "@/components/ImageSlot";

export function Services() {
  const { lang, t } = useLang();

  return (
    <section id="services" className="px-[clamp(18px,5vw,56px)] py-[clamp(64px,8vw,120px)]">
      <div className="reveal mx-auto mb-[clamp(40px,5vw,64px)] max-w-[640px] text-center">
        <div className="mb-[14px] text-xs uppercase tracking-[0.14em] text-accent">
          {t.servicesKicker}
        </div>
        <h2 className="mb-[18px] text-[clamp(30px,4vw,52px)] leading-[1.1]">
          {t.servicesTitle}
        </h2>
        <p className="text-base leading-[1.7] text-muted">{t.servicesText}</p>
      </div>

      <div className="mx-auto grid max-w-[1160px] grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-[18px]">
        {SERVICES.map((s) => (
          <div
            key={s.id}
            className="reveal flex flex-col overflow-hidden rounded-[24px] border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-40px_rgba(66,48,46,0.5)]"
          >
            <div className="relative h-[200px]">
              <ImageSlot
                src={s.img}
                alt={s.name[lang]}
                placeholder={s.name[lang]}
                sizes="(max-width: 768px) 100vw, 300px"
              />
              <span className="absolute left-3 top-3 rounded-[16px] bg-cream/[0.92] px-[11px] py-[6px] text-[10px] uppercase tracking-[0.12em] text-accent backdrop-blur-[4px]">
                {s.tag[lang]}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-[11px] px-[26px] pb-[22px] pt-6">
              <h3 className="text-[22px] leading-[1.15]">
                <Link href={`/hizmetler/${s.slug}`} className="text-ink hover:text-accent">
                  {s.name[lang]}
                </Link>
              </h3>
              <p className="flex-1 text-sm leading-[1.6] text-muted">
                {s.desc[lang]}
              </p>
              <div className="flex items-center justify-between pt-[6px]">
                <span className="text-[11px] uppercase tracking-[0.06em] text-accent">
                  {t.priceNote}
                </span>
                <Link
                  href={`/hizmetler/${s.slug}`}
                  aria-label={`${s.name[lang]} — detaylar`}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-cream text-base text-ink transition-colors hover:bg-pink"
                >
                  →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
