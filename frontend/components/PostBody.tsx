"use client";

import Image from "next/image";
import { useLang } from "@/components/LanguageProvider";
import { fmtDate } from "@/lib/date";
import type { PostFull } from "@/lib/blog";

export function PostBody({ post }: { post: PostFull }) {
  const { lang } = useLang();
  const title = lang === "tr" ? post.title_tr : post.title_en;
  const body = lang === "tr" ? post.body_tr : post.body_en;

  return (
    <article className="px-[clamp(18px,5vw,56px)] py-[clamp(32px,5vw,64px)]">
      <div className="mx-auto max-w-[760px]">
        {post.category && (
          <span className="text-[12px] uppercase tracking-[0.12em] text-accent">
            {lang === "tr" ? post.category.name_tr : post.category.name_en}
          </span>
        )}
        <h1 className="mb-3 mt-2 text-[clamp(30px,4vw,52px)] leading-[1.08]">{title}</h1>
        <time className="text-[13px] text-muted2">{fmtDate(post.published_at, lang)}</time>

        {post.cover_url && (
          <div className="relative my-8 h-[min(52vh,460px)] overflow-hidden rounded-[28px]">
            <Image src={post.cover_url} alt={title} fill sizes="760px" className="object-cover" priority />
          </div>
        )}

        {/* body is trusted HTML authored by the owner in the admin editor */}
        <div
          className="prose-stria flex flex-col gap-4 text-[16px] leading-[1.75] text-muted2 [&_a]:text-accent [&_h2]:mt-8 [&_h2]:text-[26px] [&_h2]:text-ink [&_h3]:mt-6 [&_h3]:text-[20px] [&_h3]:text-ink [&_img]:rounded-[18px] [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink"
          dangerouslySetInnerHTML={{ __html: body }}
        />

        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag.slug} className="rounded-[16px] bg-cream px-3 py-[6px] text-[12px] text-muted">
                #{lang === "tr" ? tag.name_tr : tag.name_en}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
