"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { useServices } from "@/components/ServicesProvider";
import { pickLang } from "@/lib/content";
import { ImageSlot } from "@/components/ImageSlot";

// Compact 4-across highlight strip right under the hero (like the hero's featured card).
export function ServiceStrip() {
  const { lang } = useLang();
  const services = useServices().slice(0, 4);
  if (services.length === 0) return null;

  return (
    <section className="px-[clamp(18px,5vw,56px)] pt-[clamp(20px,3vw,40px)]">
      <div className="mx-auto max-w-[1160px]">
        <div className="mb-5 text-center text-xs uppercase tracking-[0.14em] text-accent">
          {lang === "tr" ? "Öne Çıkan Hizmetler" : "Featured Services"}
        </div>
        <div className="grid grid-cols-2 gap-[14px] md:grid-cols-4">
          {services.map((s) => {
            const name = pickLang(s.name_tr, s.name_en, lang);
            return (
              <Link
                key={s.slug}
                href={s.url}
                className="group overflow-hidden rounded-[22px] border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-40px_rgba(66,48,46,0.5)]"
              >
                <div className="relative h-[150px]">
                  <ImageSlot
                    src={s.image ?? ""}
                    alt={name}
                    placeholder={name}
                    sizes="(max-width: 768px) 50vw, 280px"
                  />
                  <span className="absolute left-2 top-2 rounded-[14px] bg-cream/90 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-accent">
                    {pickLang(s.tag_tr, s.tag_en, lang)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 px-4 py-[13px]">
                  <span className="text-[14px] font-medium leading-tight text-ink group-hover:text-accent">
                    {name}
                  </span>
                  <span className="flex-none text-accent">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
