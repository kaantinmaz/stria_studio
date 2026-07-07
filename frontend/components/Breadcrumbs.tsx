import Link from "next/link";

export function Breadcrumbs({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  return (
    <nav
      aria-label="breadcrumb"
      className="mx-auto max-w-[1160px] px-[clamp(18px,5vw,56px)] pt-[128px] text-[12px] text-muted"
    >
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <span key={it.path}>
            {i > 0 && <span className="mx-2 opacity-50">/</span>}
            {last ? (
              <span className="text-ink">{it.name}</span>
            ) : (
              <Link href={it.path} className="hover:text-accent">
                {it.name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
