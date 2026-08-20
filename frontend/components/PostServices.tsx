"use client";

import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { useSettings } from "@/components/SettingsProvider";
import type { ServiceListItem } from "@/lib/content";

/**
 * Yazının konusuyla ilgili hizmetler — okuma biten yerde dönüşüm noktası.
 * Hizmetler sunucuda `relatedServiceSlugs()` ile seçilir; boş gelirse hiç basılmaz.
 */
export function PostServices({ services }: { services: ServiceListItem[] }) {
  const { lang } = useLang();
  const settings = useSettings();
  const tr = lang === "tr";

  if (services.length === 0) return null;

  return (
    <section className="mt-12 rounded-[28px] border border-line bg-blush p-[clamp(20px,3vw,32px)]">
      <div className="mb-1 text-[12px] uppercase tracking-[0.14em] text-accent">
        {tr ? "Bu yazıyla ilgili hizmetlerimiz" : "Related services"}
      </div>
      <h2 className="mb-6 text-[clamp(20px,2.4vw,26px)] leading-[1.2]">
        {tr
          ? "Ankara Çankaya'da uyguluyoruz"
          : "We apply these at our Çankaya, Ankara studio"}
      </h2>

      <ul className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <li key={service.slug}>
            <Link
              href={`/hizmetler/${service.slug}`}
              className="group flex h-full gap-4 rounded-[20px] border border-line2 bg-white p-4 transition hover:-translate-y-1 hover:shadow-[0_30px_60px_-40px_rgba(76,19,19,0.5)]"
            >
              <div className="relative h-[64px] w-[64px] shrink-0 overflow-hidden rounded-[16px] bg-pink">
                {service.image && (
                  <Image
                    src={service.image}
                    alt={tr ? service.name_tr : service.name_en}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[16px] leading-[1.3] text-ink group-hover:text-accent">
                  {tr ? service.name_tr : service.name_en}
                </div>
                <p className="mt-1 line-clamp-2 text-[13px] leading-[1.5] text-muted">
                  {tr ? service.desc_tr : service.desc_en}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <a
          href={settings.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[20px] bg-rose px-5 py-[10px] text-[14px] text-white transition-colors hover:bg-accent-dark"
        >
          {tr ? "WhatsApp'tan randevu al" : "Book on WhatsApp"}
        </a>
        <Link
          href="/hizmetler"
          className="text-[14px] text-accent underline-offset-4 hover:underline"
        >
          {tr ? "Tüm hizmetler →" : "All services →"}
        </Link>
      </div>
    </section>
  );
}
