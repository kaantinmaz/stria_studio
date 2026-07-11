import Link from "next/link";
import { ImageSlot } from "@/components/ImageSlot";
import { ArrowIcon } from "@/components/Icons";
import type { PostList } from "@/lib/content";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function BlogList({ posts }: { posts: PostList[] }) {
  if (!posts.length) {
    return (
      <p className="mt-8 rounded-[2px] border border-line bg-white px-6 py-10 text-center text-muted2">
        Blog yazıları çok yakında yayında.
      </p>
    );
  }
  return (
    <div className="mt-8 grid gap-6 md:grid-cols-3">
      {posts.map((p) => (
        <article key={p.id} className="group overflow-hidden rounded-[2px] border border-line bg-white">
          <Link href={`/blog/${p.slug}`}>
            <ImageSlot src={p.cover_url} alt={p.title_tr} ratio="aspect-[16/10]" />
          </Link>
          <div className="p-5">
            {p.published_at && (
              <p className="text-[12px] uppercase tracking-[0.12em] text-accent">
                {formatDate(p.published_at)}
              </p>
            )}
            <h3 className="mt-2 text-[18px] leading-snug text-ink">
              <Link href={`/blog/${p.slug}`} className="hover:text-accent-dark">
                {p.title_tr}
              </Link>
            </h3>
            <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-muted2">{p.excerpt_tr}</p>
            <Link
              href={`/blog/${p.slug}`}
              className="mt-4 inline-flex items-center gap-1.5 text-[14px] text-accent-dark"
            >
              Devamını oku <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
