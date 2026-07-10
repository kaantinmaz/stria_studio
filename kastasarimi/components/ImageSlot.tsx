import Image from "next/image";

// Renders a real image when a URL exists; otherwise a branded placeholder so
// layouts never break before the owner uploads photos via the admin.
export function ImageSlot({
  src,
  alt,
  className = "",
  ratio = "aspect-[4/3]",
}: {
  src: string | null;
  alt: string;
  className?: string;
  ratio?: string;
}) {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${ratio} ${className}`}>
        <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
      </div>
    );
  }
  return (
    <div
      className={`relative flex ${ratio} items-center justify-center overflow-hidden bg-gradient-to-br from-blush to-pink ${className}`}
      role="img"
      aria-label={alt}
    >
      <span className="px-4 text-center text-[12px] uppercase tracking-[0.16em] text-accent/70">
        Kaş Tasarımı Ankara
      </span>
    </div>
  );
}
