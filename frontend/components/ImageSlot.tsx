import Image from "next/image";

type Props = {
  src: string;
  alt?: string;
  placeholder?: string;
  sizes?: string;
};

// Renders a cover image, or the design's soft-pink empty state when src is blank.
// Parent must be positioned (relative) and sized.
export function ImageSlot({ src, alt, placeholder, sizes }: Props) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-pink px-3 text-center text-xs tracking-wide text-accent">
        {placeholder}
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt ?? placeholder ?? ""}
      fill
      sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
      className="object-cover"
    />
  );
}
