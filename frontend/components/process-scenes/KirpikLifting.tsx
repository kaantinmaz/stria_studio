import type { CSSProperties } from "react";

// ---- Kirpik lifting sahnesi (viewBox 300×330, 5 faz × %20) ----
// Uzanan danışanın kapalı gözü yakından; kaş üstte silik.
// 1 analiz: kesikli ölçü yayı + kirpik boyu cetveli, silikon kalıp kapağa yerleşir
// 2 temizlik köpüğü, göz altı pedi alttan gelir, çubukla kirpikler kalıba sarılır (aşağı → yukarı)
// 3 Lifting Cream: beyaz krem   4 Neutralising Cream: pembe katman + çapraz parıltı
// 5 bakım: kalıp ve ped kalkar, kirpikler kıvrık kalır, koyulaşır, yıldızlar; sonda sıfırlanır

// Park–Miller: tamsayı aritmetiği, her ortamda aynı dizi.
let seed = 29;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const r1 = (v: number) => Math.round(v * 10) / 10;

// Kirpik dibi çizgisi (karesel Bézier, u: 0 iç köşe → 1 dış köşe), ortası y≈215.
const LINE = [54, 196, 150, 238, 246, 190] as const;
const qb = (u: number, a: number, b: number, c: number) => (1 - u) ** 2 * a + 2 * u * (1 - u) * b + u ** 2 * c;
const lx = (u: number) => qb(u, LINE[0], LINE[2], LINE[4]);
const ly = (u: number) => qb(u, LINE[1], LINE[3], LINE[5]);

// Kirpik yukarı çizilir (döndürme 0 = dik yukarı), ucu dışa hafif kıvrık.
// Önce: scaleY(-1) ile aşağı sarkık, --r0 dışa hafif açık. Sonra: --r1 yelpaze (uçlarda ±42°).
// Ortadakiler uzun ve kalın, köşelere doğru kısalır.
const N_LASHES = 32;
const LASHES = Array.from({ length: N_LASHES }, (_, i) => {
  const u = 0.04 + ((i + 0.2 + rand() * 0.6) / N_LASHES) * 0.92;
  const s = u - 0.5;
  const prof = Math.sin(Math.PI * u) ** 0.7;
  const x = r1(lx(u));
  const y = r1(ly(u));
  const len = 16 + 24 * prof + rand() * 3;
  const bend = (s * 0.3 + (rand() - 0.5) * 0.06) * len;
  return {
    d: `M${x} ${y}q${r1(bend * 0.2)} ${r1(-len * 0.55)} ${r1(bend)} ${r1(-len)}`,
    w: r1(1.6 + 0.4 * prof),
    style: {
      "--r0": `${r1(-s * 50 + (rand() - 0.5) * 10)}deg`,
      "--r1": `${r1(s * 84 + (rand() - 0.5) * 8)}deg`,
      transformOrigin: `${x}px ${y}px`,
      animationDelay: `${r1(u * 0.9)}s`,
    } as CSSProperties,
  };
});

const FOAM = Array.from({ length: 18 }, () => {
  const u = 0.04 + rand() * 0.92;
  const r = 2 + rand() * 3.5;
  const cx = lx(u) + (rand() - 0.5) * 6;
  const cy = ly(u) + (rand() - 0.5) * 14;
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

// Silikon kalıp: alt kenarı kirpik dibinin hemen üstünde, kapağa yapışık hilal.
const SHIELD = "M56 190Q150 230 244 184Q256 176 246 166Q150 116 52 170Q44 182 56 190Z";
// Göz altı pedi: kirpik dibinin hemen altında hilal.
const PAD = "M66 206Q150 246 236 202Q248 206 240 216Q150 290 62 220Q54 210 66 206Z";
// Krem bandı: kalıba yatmış kirpiklerin orta üçte biri (boyun ~%30–70'i).
const BAND = "M62 186Q150 208 238 180";
const GUIDE = "M48 186Q150 112 252 180";
const SPARKS = [
  [70, 158, 1.2],
  [116, 134, 1],
  [158, 120, 1.4],
  [204, 136, 1.1],
  [242, 156, 1.3],
  [96, 186, 0.9],
  [212, 184, 1],
] as const;
const STAR = "M0 -8Q1.2 -1.2 8 0Q1.2 1.2 0 8Q-1.2 1.2 -8 0Q-1.2 -1.2 0 -8Z";

export function KirpikLiftingScene() {
  return (
    <svg
      className="pa-kp min-h-0 w-full flex-1"
      viewBox="0 0 300 330"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <radialGradient id="pa-kp-socket" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#c98a72" stopOpacity=".3" />
          <stop offset="1" stopColor="#c98a72" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pa-kp-bubble" cx=".4" cy=".35" r=".65">
          <stop offset="0" stopColor="#fff" stopOpacity=".7" />
          <stop offset="1" stopColor="#fff" stopOpacity=".95" />
        </radialGradient>
        <linearGradient id="pa-kp-streak" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id="pa-kp-soft" x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <mask id="pa-kp-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="330">
          <path className="pa-kp-draw" d={GUIDE} pathLength={1} fill="none" stroke="#fff" strokeWidth="8" />
        </mask>
        {/* Krem bulanıklığı: bölge tüm sahne, ince bandın bbox'ı kalın stroku kırpmasın */}
        <filter id="pa-kp-cream" filterUnits="userSpaceOnUse" x="0" y="0" width="300" height="330">
          <feGaussianBlur stdDeviation="2" />
        </filter>
        {/* Yumuşak kenarlı krem bandı: parıltı şeridi bunun içinde kalır */}
        <mask id="pa-kp-area" maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="330">
          <path d={BAND} fill="none" stroke="#fff" strokeWidth="24" strokeLinecap="round" filter="url(#pa-kp-cream)" />
        </mask>
      </defs>

      {/* Cilt kartın arka planında (globals.css); silik kaş, göz çukuru gölgesi, kapak ışığı ve kıvrımı */}
      <path
        d="M58 100Q132 64 250 88"
        fill="none"
        stroke="#8a5a44"
        strokeWidth="12"
        strokeLinecap="round"
        opacity=".16"
        filter="url(#pa-kp-soft)"
      />
      <ellipse cx="150" cy="196" rx="124" ry="66" fill="url(#pa-kp-socket)" />
      <ellipse cx="150" cy="158" rx="76" ry="24" fill="#fff" opacity=".18" filter="url(#pa-kp-soft)" />
      <path d="M58 162Q150 100 244 158" fill="none" stroke="#d69c84" strokeWidth="2.4" strokeLinecap="round" opacity=".55" />

      {/* 2 · göz altı pedi (kirpiklerin altında, dokulu) */}
      <g className="pa-kp-pad">
        <path d={PAD} fill="#fff" fillOpacity=".95" stroke="#ecc9cd" strokeWidth="1.2" />
        <g fill="none" stroke="#ecc9cd" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="1.5 4">
          <path d="M80 222Q150 262 224 218" />
          <path d="M98 236Q150 268 208 232" />
        </g>
      </g>

      {/* 1 · silikon kalıp: kapağa yapışık, yarı saydam şeftali + üst kenar ışığı */}
      <g className="pa-kp-shield">
        <path d={SHIELD} fill="#f6c9c0" fillOpacity=".85" stroke="#eab2a8" strokeWidth="1.2" />
        <path d="M72 168Q150 126 230 164" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".5" />
      </g>

      {/* Kirpik dibi + kirpikler (dönüş ve ton globals.css'te) */}
      <path
        d={`M${LINE[0]} ${LINE[1]}Q${LINE[2]} ${LINE[3]} ${LINE[4]} ${LINE[5]}`}
        fill="none"
        stroke="#6b3a2c"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <g className="pa-kp-lashes" fill="none" strokeLinecap="round">
        {LASHES.map((l, i) => (
          <path key={i} className="pa-kp-lash" d={l.d} strokeWidth={l.w} style={l.style} />
        ))}
      </g>

      {/* 1 · analiz: kendini çizen kesikli ölçü yayı + ortada kirpik boyu cetveli */}
      <g className="pa-kp-guide" fill="none" stroke="#a83f54" strokeLinecap="round">
        <path d={GUIDE} strokeWidth="1.6" strokeOpacity=".85" strokeDasharray="5 4" mask="url(#pa-kp-mask)" />
        <path className="pa-kp-ruler" d="M150 210V150M143 150h14M143 180h8M143 210h14" strokeWidth="1.4" />
      </g>

      {/* 2 · temizlik köpüğü: kirpik dibi boyunca kısa süreli baloncuklar */}
      {FOAM.map((b, i) => (
        <g key={i} className="pa-kp-foam" style={{ animationDelay: b.delay }}>
          <circle cx={b.cx} cy={b.cy} r={b.r} fill="url(#pa-kp-bubble)" stroke="#d6bcc2" strokeWidth=".6" />
          <circle cx={b.hx} cy={b.hy} r={b.hr} fill="#fff" />
        </g>
      ))}

      {/* 3 · Lifting Cream (beyaz) · 4 · Neutralising Cream (pembe): kirpiklerin üstünde, bulanık kenarlı,
          soldan sağa sürülür (stroke-dashoffset) + üstte ince parlak çizgi */}
      <g className="pa-kp-lift" fill="none" strokeLinecap="round" filter="url(#pa-kp-cream)">
        <path d={BAND} pathLength={1} stroke="#fff" strokeWidth="16" />
        <path d={BAND} pathLength={1} stroke="#fff" strokeWidth="3" transform="translate(0 -3)" />
      </g>
      <g className="pa-kp-neutral" fill="none" strokeLinecap="round" filter="url(#pa-kp-cream)">
        <path d={BAND} pathLength={1} stroke="#f0a7b8" strokeWidth="16" />
        <path d={BAND} pathLength={1} stroke="#fbd9e1" strokeWidth="3" transform="translate(0 -3)" />
      </g>
      <g mask="url(#pa-kp-area)">
        <path className="pa-kp-shine" d="M-4 156L-24 232" stroke="url(#pa-kp-streak)" strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* 2 · sarma çubuğu: ucu kirpik dibi boyunca içten dışa ilerler, kirpikleri kalıba yatırır */}
      <g className="pa-kp-stick">
        <rect x="-2" y="2" width="4" height="96" rx="2" fill="#a83f54" />
        <rect x="-2.6" y="-4" width="5.2" height="10" rx="2.6" fill="#e58792" />
      </g>

      {/* 3–4 · krem aplikatörü: beyaz yuvarlak uç bandın sürülen kenarıyla birlikte ilerler */}
      <g className="pa-kp-applicator">
        <rect x="-1.2" y="3" width="2.4" height="70" rx="1.2" fill="#4c1313" />
        <ellipse rx="3.4" ry="4.6" fill="#fff" stroke="#4c1313" strokeOpacity=".35" strokeWidth=".8" />
      </g>

      {/* 5 · bakım: dört köşeli yıldızlar (beyaz / pembe dönüşümlü) */}
      {SPARKS.map(([x, y, s], k) => (
        <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
          <path
            className="pa-kp-spark"
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
