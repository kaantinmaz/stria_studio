"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ImageSlot } from "@/components/ImageSlot";

type Props = {
  images: string[];
  alt: string;
};

export function HeroCarousel({ images, alt }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const currentIndex = activeIndex < images.length ? activeIndex : 0;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(media.matches);

    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (images.length <= 1 || hovered || focused || reducedMotion) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [focused, hovered, images.length, reducedMotion]);

  if (images.length <= 1) {
    return (
      <ImageSlot
        src={images[0] ?? ""}
        alt={alt}
        placeholder={alt}
        sizes="(max-width: 768px) 100vw, 45vw"
        priority
      />
    );
  }

  return (
    <div
      className="relative h-full w-full"
      role="region"
      aria-roledescription="carousel"
      aria-label={alt}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      {images.map((src, index) => (
        <div
          key={`${src}-${index}`}
          className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${
            index === currentIndex ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={index !== currentIndex}
        >
          <Image
            src={src}
            alt={index === currentIndex ? `${alt} · ${index + 1}` : ""}
            fill
            priority={index === 0}
            sizes="(max-width: 768px) 100vw, 45vw"
            className="object-cover"
          />
        </div>
      ))}

      <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`${index + 1}. görseli göster`}
            aria-current={index === currentIndex ? "true" : undefined}
            onClick={() => setActiveIndex(index)}
            className={`h-2.5 w-2.5 cursor-pointer rounded-full border border-white/80 shadow-sm transition-colors motion-reduce:transition-none ${
              index === currentIndex ? "bg-white" : "bg-white/35 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
