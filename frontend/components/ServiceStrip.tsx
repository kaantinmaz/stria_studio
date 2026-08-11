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
        <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => {
            const name = pickLang(s.name_tr, s.name_en, lang);
            return (
              <Link
                key={s.slug}
                href={s.url}
                className="group flex h-full items-center gap-[13px] rounded-[20px] bg-cream/[0.92] p-3 pl-3 pr-4 text-ink shadow-[0_20px_40px_-18px_rgba(76,19,19,0.4)] backdrop-blur-[10px] transition duration-300 hover:-translate-y-1"
              >
                <div className="relative h-14 w-14 flex-none overflow-hidden rounded-[14px]">
                  <ImageSlot src={s.image ?? ""} alt={name} placeholder={name} sizes="56px" />
                </div>
                <div className="min-w-0">
                  <div className="mb-[3px] text-[10px] uppercase tracking-[0.1em] text-accent">
                    {pickLang(s.tag_tr, s.tag_en, lang)}
                  </div>
                  <div className="text-base font-medium leading-[1.1]">{name}</div>
                  <div className="mt-[2px] text-[11px] leading-[1.45] text-muted">
                    {pickLang(s.desc_tr, s.desc_en, lang)}
                  </div>
                </div>
                <span className="ml-auto flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-ink text-[15px] text-cream transition-colors group-hover:bg-accent">
                  →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
