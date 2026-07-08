"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/components/LanguageProvider";
import { fmtDate } from "@/lib/date";
import type { Category, PostList } from "@/lib/blog";

export function BlogList({
  initial,
  categories,
}: {
  initial: PostList[];
  categories: Category[];
}) {
  const { lang } = useLang();
  const [active, setActive] = useState<string | null>(null);

  const posts = active
    ? initial.filter((p) => p.category?.slug === active)
    : initial;

  return (
    <section className="px-[clamp(18px,5vw,56px)] pb-[clamp(64px,8vw,120px)]">
      <div className="mx-auto max-w-[1160px]">
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => setActive(null)}
              className={`rounded-[20px] border px-4 py-2 text-[13px] transition-colors ${active === null ? "border-accent bg-accent text-white" : "border-line bg-white text-muted"}`}
            >
              {lang === "tr" ? "Tümü" : "All"}
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => setActive(c.slug)}
                className={`rounded-[20px] border px-4 py-2 text-[13px] transition-colors ${active === c.slug ? "border-accent bg-accent text-white" : "border-line bg-white text-muted"}`}
              >
                {lang === "tr" ? c.name_tr : c.name_en}
              </button>
            ))}
          </div>
        )}

        {posts.length === 0 ? (
          <p className="text-muted">{lang === "tr" ? "Henüz yazı yok." : "No posts yet."}</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-6">
            {posts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-[24px] border border-line bg-white transition hover:-translate-y-1 hover:shadow-[0_30px_60px_-40px_rgba(66,48,46,0.5)]"
              >
                <div className="relative h-[200px] bg-pink">
                  {p.cover_url && (
                    <Image
                      src={p.cover_url}
                      alt={lang === "tr" ? p.title_tr : p.title_en}
                      fill
                      sizes="(max-width: 768px) 100vw, 380px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  {p.category && (
                    <span className="text-[11px] uppercase tracking-[0.12em] text-accent">
                      {lang === "tr" ? p.category.name_tr : p.category.name_en}
                    </span>
                  )}
                  <h2 className="text-[20px] leading-[1.2] text-ink group-hover:text-accent">
                    {lang === "tr" ? p.title_tr : p.title_en}
                  </h2>
                  <p className="flex-1 text-sm leading-[1.6] text-muted">
                    {lang === "tr" ? p.excerpt_tr : p.excerpt_en}
                  </p>
                  <time className="text-[12px] text-muted2">{fmtDate(p.published_at, lang)}</time>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
