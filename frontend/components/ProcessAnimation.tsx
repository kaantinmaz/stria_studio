import type { CSSProperties } from "react";
import type { ProcessAnimationData } from "@/lib/serviceHero";

// Hizmet şeridinin ilk kartı: işlemi adım adım anlatan tek SVG sahne.
// Tüm fazlar tek döngülü zaman çizelgesinde (--dur) eşit dilimlere bölünür;
// altyazıdaki adımlar aynı süreyi `pa-step` ile paylaşır, böylece metin ve sahne
// hep senkron kalır. Keyframe'ler globals.css'te (`pa-` / `pa-kl-` blokları).
// Geometri sabit tohumlu üreteçle modül yüklenirken bir kez hesaplanır:
// sunucu ve tarayıcı aynı çıktıyı üretir (hydration uyuşmazlığı yok).

const SCENES = { "kas-laminasyon": KasLaminasyonScene };

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

// ---- Kaş laminasyonu sahnesi (viewBox 300×330, 5 faz × %20) ----
// 1 analiz: kesikli kaş çizgisi kendini çizer, başlangıç/kemer/kuyruk çizgileri
// 2 Cleansing Foam: köpük baloncukları   3 Lifting Cream: beyaz krem + fırça, kıllar yukarı döner
// 4 Neutralising Cream: pembe katman + çapraz parıltı şeridi   5 bakım: kıllar koyulaşır, yıldızlar; sonda sıfırlanır

// Park–Miller: tamsayı aritmetiği, her ortamda aynı dizi.
let seed = 11;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const r1 = (v: number) => Math.round(v * 10) / 10;

// Kaş merkez çizgisi (t: 0 baş → 1 kuyruk), kemer t≈0.68'de; h yarım kalınlık.
const TP = 0.68;
const bx = (t: number) => 42 + 222 * t;
const by = (t: number) =>
  t < TP ? 152 - 34 * Math.sin(((t / TP) * Math.PI) / 2) : 118 + 22 * ((t - TP) / (1 - TP)) ** 1.6;
const bh = (t: number) => (2 + 12 * (1 - t) ** 0.9) * Math.min(1, 0.55 + t * 9);

const SAMPLES = Array.from({ length: 25 }, (_, k) => k / 24);
const BROW = `M${[
  ...SAMPLES.map((t) => `${r1(bx(t))} ${r1(by(t) - bh(t))}`),
  ...[...SAMPLES].reverse().map((t) => `${r1(bx(t))} ${r1(by(t) + bh(t))}`),
].join("L")}Z`;

// Yoğunluk: t = u + 0.08·sin(2πu) baş/kuyrukta seyrek, gövdede sık örnekler.
// prof: gövdede 1, uçlarda 0 → uzun/kalın gövde, kısa/ince baş ve kuyruk.
const N_HAIRS = 84;
const HAIRS = Array.from({ length: N_HAIRS }, (_, i) => {
  const u = (i + 0.2 + rand() * 0.6) / N_HAIRS;
  const t = u + 0.08 * Math.sin(2 * Math.PI * u);
  const prof = Math.sin(Math.PI * t) ** 0.6;
  const x = r1(bx(t) + (rand() - 0.5) * 3);
  const y = r1(by(t) + bh(t) * (rand() * 1.5 - 0.6));
  const len = 10 + 7 * prof + rand() * 1.5;
  const bend = 1.2 + (rand() - 0.5) * 3;
  // Döndürme 0 = dik yukarı. Laminasyon: baş ≈ -86°, gövde ≈ -60°, kuyruk ≈ -34° (yataydan), ±6° oynama.
  const lam = 4 + 52 * t ** 1.2 + (rand() - 0.5) * 12;
  // Dağınık: lam + [-70°, +55°], üs <1 dağılımı kuyruğa doğru yatık/aşağı tarafa kaydırır.
  const messy = lam - 70 + 125 * rand() ** 0.4;
  return {
    d: `M${x} ${y}q${r1(bend)} ${r1(-len / 2)} ${r1(bend * 0.4)} ${r1(-len)}`,
    w: r1(1.5 + 0.5 * prof),
    style: {
      "--r0": `${r1(messy)}deg`,
      "--r1": `${r1(lam)}deg`,
      transformOrigin: `${x}px ${y}px`,
      animationDelay: `${r1(t * 1.6)}s`,
    } as CSSProperties,
  };
});

const FOAM = Array.from({ length: 26 }, () => {
  const t = 0.02 + rand() * 0.94;
  const r = 2 + rand() * 5;
  const cx = bx(t) + (rand() - 0.5) * 8;
  const cy = by(t) - 4 + (rand() - 0.5) * (bh(t) * 2 + 10);
  return {
    cx: r1(cx),
    cy: r1(cy),
    r: r1(r),
    hx: r1(cx - r * 0.38),
    hy: r1(cy - r * 0.38),
    hr: r1(r * 0.26),
    delay: `${r1(rand() * 0.6)}s`,
  };
});

// Kapalı göz: alt kapak eğrisi (karesel Bézier) boyunca dışa yatan kirpikler.
const LID = [92, 226, 166, 250, 242, 224] as const;
const LASHES = Array.from({ length: 14 }, (_, k) => {
  const u = 0.08 + (k * 0.84) / 13;
  const q = (a: number, b: number, c: number) => (1 - u) ** 2 * a + 2 * u * (1 - u) * b + u ** 2 * c;
  const x = q(LID[0], LID[2], LID[4]);
  const y = q(LID[1], LID[3], LID[5]);
  const a = ((-20 + 60 * u) * Math.PI) / 180;
  const len = 6 + 8 * Math.sin(Math.PI * u);
  const ex = Math.sin(a) * len;
  const ey = Math.cos(a) * len;
  return `M${r1(x)} ${r1(y)}q${r1(ex * 0.3)} ${r1(ey * 0.6)} ${r1(ex)} ${r1(ey)}`;
});

const TICKS = [0.02, TP, 0.99].map((t) => r1(bx(t)));
const SPARKS = [
  [58, 112, 1.4],
  [138, 94, 1.1],
  [214, 90, 1.5],
  [272, 122, 1.1],
  [280, 164, 1.3],
  [104, 180, 1.2],
  [178, 150, 1],
] as const;
const STAR = "M0 -8Q1.2 -1.2 8 0Q1.2 1.2 0 8Q-1.2 1.2 -8 0Q-1.2 -1.2 0 -8Z";

function KasLaminasyonScene() {
  return (
    <svg
      className="pa-kl min-h-0 w-full flex-1"
      viewBox="0 0 300 330"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <radialGradient id="pa-kl-socket" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#c98a72" stopOpacity=".35" />
          <stop offset="1" stopColor="#c98a72" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pa-kl-bubble" cx=".4" cy=".35" r=".65">
          <stop offset="0" stopColor="#fff" stopOpacity=".7" />
          <stop offset="1" stopColor="#fff" stopOpacity=".95" />
        </radialGradient>
        <linearGradient id="pa-kl-streak" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id="pa-kl-soft" x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <mask id="pa-kl-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="330">
          <path className="pa-kl-draw" d={BROW} pathLength={1} fill="none" stroke="#fff" strokeWidth="8" />
        </mask>
        {/* Yumuşak kenarlı kaş alanı: parıltı şeridi bunun içinde kalır */}
        <mask id="pa-kl-area" maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="330">
          <path d={BROW} fill="#fff" stroke="#fff" strokeWidth="18" strokeLinejoin="round" filter="url(#pa-kl-soft)" />
        </mask>
      </defs>

      {/* Cilt kartın arka planında (globals.css); göz çukuru gölgesi, kaş kemiği, kapalı göz */}
      <ellipse cx="168" cy="222" rx="96" ry="34" fill="url(#pa-kl-socket)" />
      <path d="M96 208Q168 186 238 206" fill="none" stroke="#d69c84" strokeWidth="2.4" strokeLinecap="round" opacity=".55" />
      <path
        d={`M${LID[0]} ${LID[1]}Q${LID[2]} ${LID[3]} ${LID[4]} ${LID[5]}`}
        fill="none"
        stroke="#6b3a2c"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <g fill="none" stroke="#4a2a20" strokeWidth="1.8" strokeLinecap="round">
        {LASHES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      {/* Kaş tabanı (bulanık gölge) + kıllar (dönüş ve ton globals.css'te) */}
      <path
        d={BROW}
        fill="#6b4232"
        stroke="#6b4232"
        strokeWidth="6"
        strokeLinejoin="round"
        opacity=".18"
        filter="url(#pa-kl-soft)"
      />
      <g className="pa-kl-hairs" fill="none" strokeLinecap="round">
        {HAIRS.map((h, i) => (
          <path key={i} className="pa-kl-hair" d={h.d} strokeWidth={h.w} style={h.style} />
        ))}
      </g>

      {/* 1 · analiz: kesikli şekil planı + üç kılavuz çizgisi */}
      <g className="pa-kl-plan" fill="none" stroke="#a83f54" strokeLinecap="round">
        <path d={BROW} strokeWidth="1.4" strokeOpacity=".8" strokeDasharray="5 4" mask="url(#pa-kl-mask)" />
        <g className="pa-kl-ticks" strokeWidth=".8" strokeDasharray="3 4">
          {TICKS.map((x) => (
            <path key={x} d={`M${x} 86V182`} />
          ))}
        </g>
      </g>

      {/* 2 · Cleansing Foam: baloncuk kümesi + küçük ışık noktası */}
      {FOAM.map((b, i) => (
        <g key={i} className="pa-kl-foam" style={{ animationDelay: b.delay }}>
          <circle cx={b.cx} cy={b.cy} r={b.r} fill="url(#pa-kl-bubble)" stroke="#d6bcc2" strokeWidth=".6" />
          <circle cx={b.hx} cy={b.hy} r={b.hr} fill="#fff" />
        </g>
      ))}

      {/* 3 · Lifting Cream (beyaz) · 4 · Neutralising Cream (pembe): yarı saydam, bulanık kenarlı */}
      <path
        className="pa-kl-lift"
        d={BROW}
        fill="#fff"
        stroke="#fff"
        strokeWidth="14"
        strokeLinejoin="round"
        filter="url(#pa-kl-soft)"
      />
      <path
        className="pa-kl-neutral"
        d={BROW}
        fill="#f3b8c4"
        stroke="#f3b8c4"
        strokeWidth="14"
        strokeLinejoin="round"
        filter="url(#pa-kl-soft)"
      />
      <g mask="url(#pa-kl-area)">
        <path className="pa-kl-shine" d="M-4 92L-34 184" stroke="url(#pa-kl-streak)" strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* Fırça (spoolie): sap + spiral kıl başlığı; kaş boyunca yukarı süpürür */}
      <g className="pa-kl-brush">
        <rect x="-3.5" y="16" width="7" height="86" rx="3.5" fill="#a83f54" />
        <rect x="-2.5" y="12" width="5" height="8" rx="1.5" fill="#e58792" />
        <path d="M0 -16V14" stroke="#4c1313" strokeWidth="1.6" />
        <g stroke="#4c1313" strokeWidth="1.6" strokeLinecap="round">
          {[-14, -10, -6, -2, 2, 6, 10].map((y) => (
            <path key={y} d={`M-7 ${y + 2}L7 ${y - 1}`} />
          ))}
        </g>
      </g>

      {/* 5 · bakım: dört köşeli yıldızlar (beyaz / pembe dönüşümlü) */}
      {SPARKS.map(([x, y, s], k) => (
        <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
          <path
            className="pa-kl-spark"
            d={STAR}
            fill={k % 2 ? "#e58792" : "#fff"}
            stroke="#a83f54"
            strokeWidth=".8"
            style={{ animationDelay: `${k * 0.14}s` }}
          />
        </g>
      ))}
    </svg>
  );
}
