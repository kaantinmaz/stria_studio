"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { fmtDate } from "@/lib/date";
import { BlogSidebar } from "@/components/BlogSidebar";
import { PostServices } from "@/components/PostServices";
import type { ServiceListItem } from "@/lib/content";
import { readingMinutes, withHeadings, type Category, type PostFull, type PostList } from "@/lib/blog";

export function PostBody({
  post,
  related,
  prev,
  next,
  categories,
  counts,
  recent,
  services,
}: {
  post: PostFull;
  related: PostList[];
  prev: PostList | null;
  next: PostList | null;
  categories: Category[];
  counts: Record<string, number>;
  recent: PostList[];
  services: ServiceListItem[];
}) {
  const { lang, t } = useLang();
  const tr = lang === "tr";
  const title = tr ? post.title_tr : post.title_en;
  const raw = tr ? post.body_tr : post.body_en;
  const { html, headings } = useMemo(() => withHeadings(raw), [raw]);
  const minutes = useMemo(() => readingMinutes(raw), [raw]);
  const showUpdated =
    post.updated_at !== null && post.updated_at.slice(0, 10) !== post.published_at?.slice(0, 10);

  return (
    <div className="px-[clamp(18px,5vw,56px)] pb-[clamp(64px,8vw,110px)] pt-4">
      <div className="mx-auto grid max-w-[1160px] items-start gap-[clamp(32px,4vw,56px)] lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="min-w-0">
          {post.category && (
            <Link
              href={`/blog?kategori=${post.category.slug}`}
              className="text-[12px] uppercase tracking-[0.12em] text-accent hover:underline"
            >
              {tr ? post.category.name_tr : post.category.name_en}
            </Link>
          )}
          <h1 className="mb-4 mt-2 text-[clamp(30px,3.6vw,46px)] leading-[1.1]">{title}</h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line pb-6 text-[13px] text-muted2">
            <span>
              {tr ? "Yazan: " : "By "}
              <Link href="/hakkimizda" className="text-accent">
                {t.founderName}
              </Link>
            </span>
            <time dateTime={post.published_at ?? undefined}>{fmtDate(post.published_at, lang)}</time>
            {showUpdated && (
              <time dateTime={post.updated_at ?? undefined}>
                {tr ? "Son güncelleme:" : "Updated:"} {fmtDate(post.updated_at, lang)}
              </time>
            )}
            <span>
              {minutes} {tr ? "dk okuma" : "min read"}
            </span>
          </div>

          {post.cover_url && (
            <div className="relative my-8 h-[min(52vh,460px)] overflow-hidden rounded-[28px]">
              <Image src={post.cover_url} alt={title} fill sizes="760px" className="object-cover" priority />
            </div>
          )}

          {/* body is trusted HTML authored by the owner in the admin editor */}
          <div
            className="prose-stria mt-8 flex flex-col gap-4 text-[17px] leading-[1.8] text-muted2 [&_a]:text-accent [&_h2]:mt-10 [&_h2]:scroll-mt-[150px] [&_h2]:text-[27px] [&_h2]:text-ink [&_h3]:mt-7 [&_h3]:scroll-mt-[150px] [&_h3]:text-[21px] [&_h3]:text-ink [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-[18px] [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag.slug} className="rounded-[16px] bg-cream px-3 py-[6px] text-[12px] text-muted">
                  #{tr ? tag.name_tr : tag.name_en}
                </span>
              ))}
            </div>
          )}

          <PostServices services={services} />

          <section className="mt-10 flex flex-col gap-4 rounded-[24px] border border-line bg-white p-6 sm:flex-row sm:items-center">
            <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full bg-pink">
              <Image
                src="/images/nilsu-kamisli.jpg"
                alt={t.founderName}
                fill
                sizes="72px"
                className="object-cover"
              />
            </div>
            <div>
              <div className="text-[17px] text-ink">{t.founderName}</div>
              <div className="mb-2 text-[13px] text-accent">{t.founderRole}</div>
              <Link href="/hakkimizda" className="text-[13px] text-muted2 underline-offset-4 hover:underline">
                {tr ? "Yazar hakkında →" : "About the author →"}
              </Link>
            </div>
          </section>

          {(prev || next) && (
            <nav className="mt-8 grid gap-4 sm:grid-cols-2">
              {prev ? (
                <Link
                  href={`/blog/${prev.slug}`}
                  className="rounded-[20px] border border-line bg-white p-5 transition hover:border-accent"
                >
                  <div className="mb-1 text-[12px] uppercase tracking-[0.12em] text-muted">
                    {tr ? "Önceki yazı" : "Previous"}
                  </div>
                  <div className="text-[15px] leading-[1.35] text-ink">
                    {tr ? prev.title_tr : prev.title_en}
                  </div>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  href={`/blog/${next.slug}`}
                  className="rounded-[20px] border border-line bg-white p-5 text-right transition hover:border-accent"
                >
                  <div className="mb-1 text-[12px] uppercase tracking-[0.12em] text-muted">
                    {tr ? "Sonraki yazı" : "Next"}
                  </div>
                  <div className="text-[15px] leading-[1.35] text-ink">
                    {tr ? next.title_tr : next.title_en}
                  </div>
                </Link>
              )}
            </nav>
          )}

          {related.length > 0 && (
            <section className="mt-12 border-t border-line pt-8">
              <h2 className="mb-5 text-[24px] leading-[1.2]">
                {tr ? "İlgili Yazılar" : "Related Posts"}
              </h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {related.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/blog/${p.slug}`}
                    className="group flex flex-col overflow-hidden rounded-[20px] border border-line bg-white transition hover:-translate-y-1 hover:shadow-[0_30px_60px_-40px_rgba(76,19,19,0.5)]"
                  >
                    <div className="relative h-[132px] bg-pink">
                      {p.cover_url && (
                        <Image
                          src={p.cover_url}
                          alt={tr ? p.title_tr : p.title_en}
                          fill
                          sizes="(max-width: 640px) 100vw, 340px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-2 p-5">
                      <h3 className="text-[17px] leading-[1.25] text-ink group-hover:text-accent">
                        {tr ? p.title_tr : p.title_en}
                      </h3>
                      <time className="text-[12px] text-muted2">{fmtDate(p.published_at, lang)}</time>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>

        <BlogSidebar
          categories={categories}
          counts={counts}
          recent={recent}
          activeCategory={post.category?.slug ?? null}
          headings={headings}
        />
      </div>
    </div>
  );
}
