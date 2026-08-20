"use client";

import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { useSettings } from "@/components/SettingsProvider";
import { fmtDate } from "@/lib/date";
import type { Category, Heading, PostList } from "@/lib/blog";

const CARD = "rounded-[24px] border border-line bg-white p-6";
const CARD_TITLE = "mb-4 text-[12px] uppercase tracking-[0.14em] text-accent";

export function BlogSidebar({
  categories,
  counts,
  recent,
  activeCategory,
  headings,
}: {
  categories: Category[];
  counts: Record<string, number>;
  recent: PostList[];
  activeCategory: string | null;
  headings: Heading[];
}) {
  const { lang } = useLang();
  const settings = useSettings();
  const tr = lang === "tr";

  return (
    <aside className="flex flex-col gap-6 lg:sticky lg:top-[150px] lg:max-h-[calc(100vh-170px)] lg:overflow-y-auto lg:pr-1">
      {headings.length > 1 && (
        <nav className={`${CARD} hidden lg:block`} aria-label={tr ? "İçindekiler" : "Contents"}>
          <div className={CARD_TITLE}>{tr ? "İçindekiler" : "Contents"}</div>
          <ol className="flex max-h-[38vh] flex-col gap-[10px] overflow-y-auto text-[14px] leading-[1.45]">
            {headings.map((h) => (
              <li key={h.id} className={h.level === 3 ? "pl-4" : undefined}>
                <a href={`#${h.id}`} className="text-muted2 transition-colors hover:text-accent">
                  {h.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {categories.length > 0 && (
        <nav className={CARD} aria-label={tr ? "Blog kategorileri" : "Blog categories"}>
          <div className={CARD_TITLE}>{tr ? "Kategoriler" : "Categories"}</div>
          <ul className="flex flex-col">
            {categories.map((c) => {
              const active = c.slug === activeCategory;
              return (
                <li key={c.slug} className="border-b border-line last:border-0">
                  <Link
                    href={`/blog?kategori=${c.slug}`}
                    className={`flex items-center justify-between gap-3 py-[10px] text-[15px] transition-colors hover:text-accent ${active ? "text-accent" : "text-muted2"}`}
                  >
                    <span>{tr ? c.name_tr : c.name_en}</span>
                    <span className="rounded-[12px] bg-blush px-2 py-[2px] text-[12px] text-muted">
                      {counts[c.slug] ?? 0}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/blog"
            className="mt-4 inline-block text-[13px] text-accent underline-offset-4 hover:underline"
          >
            {tr ? "Tüm yazılar →" : "All posts →"}
          </Link>
        </nav>
      )}

      {recent.length > 0 && (
        <section className={CARD}>
          <div className={CARD_TITLE}>{tr ? "Son Yazılar" : "Latest Posts"}</div>
          <ul className="flex flex-col gap-4">
            {recent.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="group flex gap-3">
                  <div className="relative h-[56px] w-[56px] shrink-0 overflow-hidden rounded-[14px] bg-pink">
                    {p.cover_url && (
                      <Image
                        src={p.cover_url}
                        alt={tr ? p.title_tr : p.title_en}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="line-clamp-2 text-[14px] leading-[1.35] text-ink group-hover:text-accent">
                      {tr ? p.title_tr : p.title_en}
                    </div>
                    <time className="text-[12px] text-muted">{fmtDate(p.published_at, lang)}</time>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-[24px] bg-ink p-6 text-cream">
        <div className="mb-2 text-[12px] uppercase tracking-[0.14em] text-blossom">
          {tr ? "Randevu" : "Booking"}
        </div>
        <p className="mb-5 text-[15px] leading-[1.6] text-pink">
          {tr
            ? "Kaş, dudak ve kirpik uygulamaları için Ankara Çankaya'daki stüdyomuzda yerinizi ayırtın."
            : "Book your spot at our Çankaya, Ankara studio for brow, lip and lash treatments."}
        </p>
        <a
          href={settings.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-[20px] bg-blossom px-5 py-[10px] text-[14px] text-ink transition-colors hover:bg-pink"
        >
          {tr ? "WhatsApp'tan yaz" : "Message on WhatsApp"}
        </a>
      </section>
    </aside>
  );
}
