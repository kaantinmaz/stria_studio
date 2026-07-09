import { ImageSlot } from "@/components/ImageSlot";
import type { GalleryItem } from "@/lib/content";

// Placeholder tiles when the CMS gallery is empty, so /galeri and the home
// preview always render a complete grid.
const PLACEHOLDERS: GalleryItem[] = Array.from({ length: 6 }).map((_, i) => ({
  image: null,
  alt_tr: `Öncesi–sonrası mikroblading kaş çalışması ${i + 1} — Ankara Stria Studio`,
}));

export function Gallery({ items, limit }: { items: GalleryItem[]; limit?: number }) {
  const list = (items.length ? items : PLACEHOLDERS).slice(0, limit ?? undefined);
  return (
    <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
      {list.map((g, i) => (
        <ImageSlot
          key={i}
          src={g.image}
          alt={g.alt_tr}
          className="rounded-[18px]"
        />
      ))}
    </div>
  );
}
