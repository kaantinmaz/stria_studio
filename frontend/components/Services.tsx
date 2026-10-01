"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { useServices } from "@/components/ServicesProvider";
import { pickLang } from "@/lib/content";
import { ImageSlot } from "@/components/ImageSlot";
import { MyLaminationChip } from "@/components/MyLaminationBadge";
import { ML_SERVICE_SCOPE } from "@/lib/mylamination";
import { RatingBadge } from "@/components/RatingBadge";

export function Services() {
  const { lang, t } = useLang();
  const services = useServices();

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

      <div className="mx-auto grid max-w-[1160px] grid-cols-1 gap-3 md:grid-cols-2 md:gap-[18px] lg:grid-cols-5">
        {services.map((s) => {
          const name = pickLang(s.name_tr, s.name_en, lang);
          return (
            <div
              key={s.slug}
              className="reveal group flex min-h-[112px] flex-row overflow-hidden rounded-[20px] border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-40px_rgba(76,19,19,0.5)] md:min-h-0 md:flex-col md:rounded-[24px]"
            >
              <div className="relative w-[104px] flex-none self-stretch overflow-hidden md:h-[160px] md:w-full lg:h-[128px]">
                <ImageSlot
                  src={s.image ?? ""}
                  alt={name}
                  placeholder={name}
                  sizes="(max-width: 768px) 104px, (max-width: 1024px) 50vw, 220px"
                />
                <span className="absolute left-2 top-2 rounded-[14px] bg-cream/[0.92] px-[9px] py-[5px] text-[9px] uppercase tracking-[0.1em] text-accent backdrop-blur-[4px] md:left-3 md:top-3 md:px-[11px] md:py-[6px] md:text-[10px] md:tracking-[0.12em]">
                  {pickLang(s.tag_tr, s.tag_en, lang)}
                </span>
                {ML_SERVICE_SCOPE[s.slug] && (
                  <MyLaminationChip className="absolute right-2 top-2 md:right-3 md:top-3" />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-[6px] px-4 py-3 md:gap-[11px] md:px-6 md:pb-[22px] md:pt-5">
                <h3 className="text-[16px] leading-[1.2] md:text-[20px] md:leading-[1.15]">
                  <Link href={s.url} className="text-ink hover:text-accent">
                    {name}
                  </Link>
                </h3>
                {/* flex-1 kullanma: esnetilen yükseklik line-clamp'i deler, kırpılan satırlar görünür. */}
                <p className="line-clamp-2 text-[13px] leading-[1.5] text-muted md:line-clamp-3 md:text-sm md:leading-[1.6]">
                  {pickLang(s.desc_tr, s.desc_en, lang)}
                </p>
                <div className="flex-1" aria-hidden="true" />
                <RatingBadge value={s.rating_avg} count={s.rating_count} size={12} />
                <div className="hidden items-center justify-between pt-[6px] md:flex">
                  <span className="text-[11px] uppercase tracking-[0.06em] text-accent">
                    {lang === "tr" ? "İncele" : "View"}
                  </span>
                  <Link
                    href={s.url}
                    aria-label={`${name} — ${lang === "tr" ? "detaylar" : "details"}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-cream text-base text-ink transition-colors hover:bg-pink"
                  >
                    →
                  </Link>
                </div>
              </div>
              <Link
                href={s.url}
                aria-label={`${name} — ${lang === "tr" ? "detaylar" : "details"}`}
                className="flex w-11 flex-none items-center justify-center self-stretch text-ink md:hidden"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream text-base transition-colors group-hover:bg-pink">
                  →
                </span>
              </Link>
            </div>
          );
        })}
      </div>
      <div className="reveal mx-auto mt-10 max-w-[1160px] text-center">
        <Link
          href="/ankara-kalici-makyaj-yapan-yerler"
          className="inline-flex items-center gap-2 rounded-[22px] border border-line bg-cream/60 px-6 py-3 text-[14px] font-medium text-ink transition-colors hover:border-line2 hover:text-accent"
        >
          <span>
            {lang === "tr"
              ? "Ankara’da güvenilir kalıcı makyaj stüdyosu nasıl seçilir?"
              : "How to choose a permanent makeup studio in Ankara"}
          </span>
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
