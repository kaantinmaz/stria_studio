"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import type { HeroVideo, ProcessAnimationData } from "@/lib/serviceHero";
import { ProcessAnimation } from "@/components/ProcessAnimation";

// Cards visible on first paint (mobile shows two and a half). Their posters are the
// page's LCP, so they are preloaded with high priority. Video files are attached on the
// visitor's first interaction (scroll, touch, pointer, key): a playing video keeps
// producing LCP candidates until input, and autoplaying ~3 MB of video pushed the
// kaş laminasyon mobile LCP to 8–9 s in Lighthouse.
const ABOVE_FOLD = 3;
const START_EVENTS = ["scroll", "pointerdown", "pointermove", "touchstart", "keydown"] as const;

// Hizmet sayfası üst bölümü: dikey çekimler yan yana, sessiz ve döngüde oynar.
// Tıklanan video ekranın ortasında hafif bir büyüme animasyonuyla açılır
// (Esc, arka plan veya kapat düğmesiyle kapanır; açıkken sayfa kaymaz).
export function HeroVideoStrip({
  videos,
  title,
  animation,
}: {
  videos: HeroVideo[];
  title: string;
  animation?: ProcessAnimationData;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  videos.slice(0, ABOVE_FOLD).forEach((video) => preload(video.poster, { as: "image", fetchPriority: "high" }));
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setOpen(null);
    lastTrigger.current?.focus();
  }, []);

  useEffect(() => {
    const start = () => setLoaded(true);
    START_EVENTS.forEach((type) => window.addEventListener(type, start, { once: true, passive: true }));
    return () => START_EVENTS.forEach((type) => window.removeEventListener(type, start));
  }, []);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  // Videosuz hizmet (kamuflaj): yalnızca animasyon kartı, eski fotoğraf kutusu yüksekliğinde.
  if (!videos.length && animation) {
    return (
      <div className="min-w-0">
        <ProcessAnimation animation={animation} className="mx-auto aspect-[10/11] md:max-w-[420px]" />
      </div>
    );
  }

  const active = open === null ? null : videos[open];
  // 2 video: yarım; 3: üçte bir; daha fazlası ya da animasyon kartı varsa: şerit kayar,
  // son kart kenardan görünür (kaydırma ipucu).
  const scrolls = Boolean(animation) || videos.length > 3;
  const itemWidth = scrolls
    ? "w-[44%] md:w-[30%]"
    : videos.length <= 2
      ? "w-[calc((100%-12px)/2)]"
      : "w-[44%] md:w-[calc((100%-24px)/3)]";
  // Animasyon kartı videolarla aynı yükseklikte ama daha geniş: genişlik × 16/9 × 9/10
  // (44% → 70.4%, 30% → 48%).
  const animClass = "w-[70.4%] md:w-[48%] aspect-[9/10]";

  return (
    <div className="min-w-0">
      <div
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="list"
        aria-label={`${title} videoları`}
      >
        {animation && (
          <div role="listitem" className={`flex-none snap-start ${animClass}`}>
            <ProcessAnimation animation={animation} className="h-full" />
          </div>
        )}
        {videos.map((video, i) => (
          <div key={video.src} role="listitem" className={`flex-none snap-start ${itemWidth}`}>
            <button
              type="button"
              onClick={(e) => {
                lastTrigger.current = e.currentTarget;
                setOpen(i);
              }}
              aria-label={`Videoyu büyüt: ${video.label}`}
              className="group relative block aspect-[9/16] w-full cursor-pointer overflow-hidden rounded-[22px] bg-blush shadow-[0_24px_60px_-36px_rgba(229,135,146,0.8)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <video
                src={loaded ? video.src : undefined}
                poster={video.poster}
                muted
                autoPlay
                loop
                playsInline
                preload={i < ABOVE_FOLD ? "metadata" : "none"}
                aria-hidden
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
              />
              <span className="pointer-events-none absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 text-ink shadow-sm backdrop-blur-[4px] transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z" />
                </svg>
              </span>
            </button>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[12.5px] text-muted">
        Stüdyomuzdan gerçek uygulama çekimleri · büyütmek için videoya dokunun
        {scrolls ? " · yana kaydırın" : ""}
      </p>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.label}
          onClick={close}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/75 p-4 backdrop-blur-sm animate-[heroVideoFade_.25s_ease-out] motion-reduce:animate-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative aspect-[9/16] h-[min(86vh,780px)] max-w-full animate-[heroVideoIn_.32s_cubic-bezier(.2,.8,.2,1)] overflow-hidden rounded-[26px] bg-ink shadow-2xl motion-reduce:animate-none"
          >
            <video
              key={active.src}
              src={active.src}
              poster={active.poster}
              muted
              autoPlay
              loop
              playsInline
              controls
              className="h-full w-full object-cover"
            />
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Videoyu kapat"
              className="absolute right-3 top-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-cream/90 text-ink shadow-sm transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// İtalyan bayrağı — emoji bayrak Windows'ta "IT" harfleri olarak görünür,
// bu yüzden üç şerit çizilir.
export function ItalyFlag({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-flex h-[12px] w-[18px] flex-none overflow-hidden rounded-[2px] ring-1 ring-black/10 ${className}`}
    >
      <span className="h-full w-1/3 bg-[#009246]" />
      <span className="h-full w-1/3 bg-white" />
      <span className="h-full w-1/3 bg-[#ce2b37]" />
    </span>
  );
}
