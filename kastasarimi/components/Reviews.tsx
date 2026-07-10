import { reviews } from "@/lib/copy";
import { StarIcon } from "@/components/Icons";

export function Reviews() {
  return (
    <div className="mt-8 grid gap-5 md:grid-cols-3">
      {reviews.items.map((r) => (
        <figure key={r.name} className="rounded-[2px] border border-line bg-white p-6">
          <div className="mb-3 flex gap-0.5 text-accent">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} className="h-4 w-4" />
            ))}
          </div>
          <blockquote className="text-[15px] leading-relaxed text-muted2">“{r.text}”</blockquote>
          <figcaption className="mt-4 text-[14px] font-medium text-ink">{r.name}</figcaption>
        </figure>
      ))}
    </div>
  );
}
