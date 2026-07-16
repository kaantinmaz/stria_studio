"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type WorkLightboxProps = {
  images: string[];
  altBase: string;
  thumbClassName?: string;
};

export function WorkLightbox({
  images,
  altBase,
  thumbClassName = "",
}: WorkLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isOpen = activeIndex !== null;

  const close = useCallback(() => setActiveIndex(null), []);
  const showPrevious = useCallback(() => {
    setActiveIndex((current) =>
      current === null ? null : (current - 1 + images.length) % images.length,
    );
  }, [images.length]);
  const showNext = useCallback(() => {
    setActiveIndex((current) =>
      current === null ? null : (current + 1) % images.length,
    );
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [close, isOpen, showNext, showPrevious]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {images.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            aria-label={`${altBase} çalışma örneği ${index + 1} görselini büyüt`}
            onClick={() => setActiveIndex(index)}
            className={`group relative aspect-square cursor-zoom-in overflow-hidden rounded-[14px] border border-line bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${thumbClassName}`}
          >
            <Image
              src={src}
              alt={`${altBase} çalışma örneği ${index + 1} — Stria Studio Ankara`}
              fill
              sizes="(max-width: 640px) 30vw, 240px"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:transition-none"
            />
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm sm:p-8"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) close();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${altBase} çalışma galerisi`}
            className="relative flex h-[85vh] max-h-[85vh] w-full max-w-[1100px] items-center justify-center"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="relative h-full w-full overflow-hidden rounded-[22px] bg-cream/10 shadow-[0_30px_90px_-25px_rgba(0,0,0,0.75)]">
              <Image
                src={images[activeIndex]}
                alt={`${altBase} çalışma örneği ${activeIndex + 1} — Stria Studio Ankara`}
                fill
                priority
                sizes="(max-width: 1164px) calc(100vw - 32px), 1100px"
                className="object-contain"
              />
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Kapat"
              onClick={close}
              className="absolute right-3 top-3 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-cream/90 text-lg text-ink shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:right-4 sm:top-4"
            >
              ✕
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Önceki görsel"
                  onClick={showPrevious}
                  className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-cream/90 text-2xl text-ink shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:left-4"
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Sonraki görsel"
                  onClick={showNext}
                  className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-cream/90 text-2xl text-ink shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:right-4"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
