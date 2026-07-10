import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

// Visible breadcrumb trail + matching BreadcrumbList JSON-LD.
export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const trail = [{ name: "Anasayfa", path: "/" }, ...items];
  return (
    <>
      <JsonLd data={breadcrumbSchema(trail)} />
      <nav aria-label="Breadcrumb" className="mx-auto max-w-[1180px] px-5 pt-6 text-[13px] text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          {trail.map((it, i) => {
            const last = i === trail.length - 1;
            return (
              <li key={it.path} className="flex items-center gap-1.5">
                {last ? (
                  <span className="text-muted2">{it.name}</span>
                ) : (
                  <Link href={it.path} className="hover:text-accent-dark">
                    {it.name}
                  </Link>
                )}
                {!last && <span aria-hidden="true">/</span>}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
