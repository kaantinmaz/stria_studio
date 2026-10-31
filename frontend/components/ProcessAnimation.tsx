import type { CSSProperties } from "react";
import type { ProcessAnimationData } from "@/lib/serviceHero";
import { KasLaminasyonScene } from "@/components/process-scenes/KasLaminasyon";
import { KirpikLiftingScene } from "@/components/process-scenes/KirpikLifting";

// Hizmet şeridinin ilk kartı: işlemi adım adım anlatan tek SVG sahne.
// Tüm fazlar tek döngülü zaman çizelgesinde (--dur) eşit dilimlere bölünür;
// altyazıdaki adımlar aynı süreyi `pa-step` ile paylaşır, böylece metin ve sahne
// hep senkron kalır. Keyframe'ler globals.css'te (`pa-` / `pa-kl-` / `pa-kp-` blokları).
// Sahneler process-scenes/ altında; geometri sabit tohumlu üreteçle modül yüklenirken
// bir kez hesaplanır: sunucu ve tarayıcı aynı çıktıyı üretir (hydration uyuşmazlığı yok).

const SCENES = { "kas-laminasyon": KasLaminasyonScene, "kirpik-lifting": KirpikLiftingScene };

export function ProcessAnimation({
  animation,
  className = "",
}: {
  animation: ProcessAnimationData;
  className?: string;
}) {
  const Scene = SCENES[animation.kind];
  const n = animation.steps.length;
  return (
    <figure
      aria-label={animation.label}
      className={`pa-card relative m-0 flex w-full flex-col overflow-hidden rounded-[22px] shadow-[0_24px_60px_-36px_rgba(229,135,146,0.8)] ${className}`}
      style={{ "--dur": `${animation.seconds}s`, "--n": n } as CSSProperties}
    >
      <figcaption className="flex-none px-4 pb-1 pt-4 text-[14.5px] leading-snug text-ink">
        <small className="block text-[10.5px] uppercase tracking-[0.14em] text-accent">{animation.kicker}</small>
        <span className="pa-steps mt-1 grid">
          {animation.steps.map((step, i) => (
            <span key={step} style={{ "--i": i } as CSSProperties}>
              <b className="mb-[2px] block text-[11px] font-normal text-muted">
                {i + 1}/{n}
              </b>
              {step}
            </span>
          ))}
        </span>
      </figcaption>
      <Scene />
    </figure>
  );
}
