import { reviews } from "@/lib/copy";

export function Reviews() {
  return (
    <div className="mt-10 grid gap-px bg-line md:grid-cols-3">
      {reviews.items.map((r) => (
        <figure key={r.name} className="bg-cream p-8">
          <blockquote className="pull-quote">“{r.text}”</blockquote>
          <figcaption className="mt-6 text-[11px] uppercase tracking-[0.16em] text-muted">
            {r.name}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
