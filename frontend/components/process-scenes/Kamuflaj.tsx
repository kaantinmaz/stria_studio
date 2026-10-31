import type { CSSProperties, ReactNode } from "react";
import type { KamuflajVariant } from "@/lib/serviceHero";

// ---- Kamuflaj makyaj sahnesi (viewBox 300×330, 5 faz × %20) ----
// Cildin yakın çekimi; kusur alt sayfaya göre çizilir (variant), araçlar ve zaman çizelgesi ortak.
// 1 analiz: köşeli çerçeve kusuru tarar, alttaki ölçü cetveli
// 2 renk analizi: ten tonu paleti gelir, biri seçilir, karışım iki renkten seçilen tona döner
// 3 test: kusurun kenarında küçük deneme noktası + onay   4 steril uygulama: kalem kusur boyunca
// ilerler, ten rengi pigment izini (maske) noktalı doku ile bırakır   5 iyileşme: kalan iz söner,
// yumuşak ışık ve yıldızlar; kusur gizliyken maske sıfırlanır, döngü başında kusur geri gelir

// Park–Miller: tamsayı aritmetiği, her ortamda aynı dizi.
let seed = 37;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const r1 = (v: number) => Math.round(v * 10) / 10;
const jit = (a: number) => (rand() - 0.5) * a;

type P = readonly [number, number];
// x, y, genişlik, yükseklik
type Box = readonly [number, number, number, number];

const pt = (p: P) => `${r1(p[0])} ${r1(p[1])}`;
const mid = (a: P, b: P) => `${r1((a[0] + b[0]) / 2)} ${r1((a[1] + b[1]) / 2)}`;
// Açık yumuşak eğri: ara noktalar kontrol noktası, parçalar orta noktalarda birleşir.
const smooth = (ps: P[]) =>
  `M${pt(ps[0])}${ps
    .slice(1, -1)
    .map((p, i) => `Q${pt(p)} ${mid(p, ps[i + 2])}`)
    .join("")}L${pt(ps[ps.length - 1])}`;

// Düzensiz kapalı leke: n köşe, yarıçap ±j oranında oynar; rot radyan döndürme.
function blob(cx: number, cy: number, rx: number, ry: number, n = 10, j = 0.25, rot = 0) {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  const ps: P[] = Array.from({ length: n }, (_, i) => {
    const a = ((i + jit(0.4)) / n) * 2 * Math.PI;
    const k = 1 + jit(2 * j);
    const x = Math.cos(a) * rx * k;
    const y = Math.sin(a) * ry * k;
    return [cx + x * c - y * s, cy + x * s + y * c];
  });
  return `M${mid(ps[n - 1], ps[0])}${ps.map((p, i) => `Q${pt(p)} ${mid(p, ps[(i + 1) % n])}`).join("")}Z`;
}

// a → b arası k parçalı dalgalı çizgi noktaları (uçlar sabit, dik yönde ±amp).
function wave(a: P, b: P, k: number, amp: number): P[] {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  const ph = rand() * 6.3;
  return Array.from({ length: k + 1 }, (_, i) => {
    const t = i / k;
    const o = i === 0 || i === k ? 0 : amp * Math.sin(ph + t * 9) + jit(amp * 0.6);
    return [a[0] + dx * t - (dy / len) * o, a[1] + dy * t + (dx / len) * o] as const;
  });
}

// Elips içinde birbirine değmeyen n daire [x, y, r].
function scatter(cx: number, cy: number, rx: number, ry: number, n: number, rMin: number, rMax: number) {
  const out: [number, number, number][] = [];
  for (let tries = 0; out.length < n && tries < 400; tries++) {
    const a = rand() * 2 * Math.PI;
    const d = Math.sqrt(rand());
    const x = cx + Math.cos(a) * rx * d;
    const y = cy + Math.sin(a) * ry * d;
    const r = rMin + rand() * (rMax - rMin);
    if (out.every(([ox, oy, or]) => Math.hypot(ox - x, oy - y) > or + r + 3)) out.push([r1(x), r1(y), r1(r)]);
  }
  return out;
}

const ell = (cx: number, cy: number, rx: number, ry: number): Box => [cx - rx, cy - ry, rx * 2, ry * 2];
function bbox(ps: P[], pad: number): Box {
  const xs = ps.map((p) => p[0]);
  const ys = ps.map((p) => p[1]);
  const x = Math.min(...xs) - pad;
  const y = Math.min(...ys) - pad;
  return [r1(x), r1(y), r1(Math.max(...xs) + pad - x), r1(Math.max(...ys) + pad - y)];
}
// Kalem yolu: kutuyu satır satır gidip gelerek tarar.
const serp = ([x, y, w, h]: Box, rows: number): P[] =>
  Array.from({ length: rows }, (_, i) => {
    const yy = y + (h * (i + 0.5)) / rows;
    const row: P[] = [
      [x, yy],
      [x + w, yy],
    ];
    return i % 2 ? row.reverse() : row;
  }).flat();

// box: analiz çerçevesi · pen: 4. fazda kalemin yolu · w: kalem izinin kalınlığı · test: deneme noktası
// defect: kapatılan kusur · base: kusur olmayan, hep görünen çizim (ör. kirpik çizgisi)
type Spec = { box: Box; pen: P[]; w: number; test: P; defect: ReactNode; base?: ReactNode };
function spec(box: Box, defect: ReactNode, o: Partial<Spec> = {}): Spec {
  const rows = Math.max(1, Math.round(box[3] / 26));
  return {
    box,
    pen: serp(box, rows),
    w: r1(box[3] / rows + 12),
    test: [box[0] + 6, box[1] + box[3] / 2],
    defect,
    ...o,
  };
}

// Renkler: açık kusurlar tenden soluk/pembe, koyular kahve, kırmızılar kızıl; pigment hep ten tonu.
const PALE = "#fcefe8";
const RIM = "#eac0b2";
const BROWN = "#a9735a";
const VEIN = "#c4505a";
const INK = "#5d6d86";

// Tek çizgili izler: kenar (RIM) üstünde açık çekirdek.
const scar = (d: string, w: number) => (
  <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} stroke={RIM} strokeWidth={w} />
    <path d={d} stroke={PALE} strokeWidth={r1(w * 0.55)} />
  </g>
);

const STRETCH = Array.from({ length: 5 }, (_, i) => {
  const y = 114 + i * 27;
  return wave([78 + jit(18), y + jit(4)], [222 + jit(18), y + 18 + jit(4)], 6, 2.4);
});

const VITILIGO = [
  blob(118, 142, 30, 22, 11, 0.24),
  blob(186, 166, 34, 26, 12, 0.24),
  blob(136, 208, 24, 17, 10, 0.26),
];

const BURN = blob(150, 172, 62, 44, 14, 0.18);
const BURN_MOTTLE = Array.from({ length: 16 }, (_, k) => {
  const a = rand() * 2 * Math.PI;
  const d = Math.sqrt(rand()) * 0.72;
  return { cx: r1(150 + Math.cos(a) * 62 * d), cy: r1(172 + Math.sin(a) * 44 * d), r: r1(2 + rand() * 5), light: k % 2 === 0 };
});

const SURGERY: [P, P] = [
  [78, 196],
  [222, 146],
];
const STITCHES = Array.from({ length: 9 }, (_, k) => {
  const t = 0.08 + k * 0.105;
  const x = 78 + 144 * t;
  const y = 196 - 50 * t;
  // Çizgiye dik birim vektör (50, 144)/|·| ≈ (0.33, 0.94)
  return [
    [r1(x - 2.6), r1(y - 7.6)],
    [r1(x + 2.6), r1(y + 7.6)],
  ] as const;
});

const WOUND: P[] = Array.from({ length: 9 }, (_, i) => [82 + i * 17 + jit(6), 176 - i * 2 + jit(24)]);

const RAZOR: [P, P][] = Array.from({ length: 5 }, (_, i) => [
  [114 + i * 22 + jit(4), 114 + jit(10)],
  [82 + i * 22 + jit(4), 224 + jit(10)],
]);

const qb = (u: number, a: number, b: number, c: number) => (1 - u) ** 2 * a + 2 * u * (1 - u) * b + u ** 2 * c;
const CSEC: P[] = Array.from({ length: 9 }, (_, i) => [qb(i / 8, 76, 150, 224), qb(i / 8, 156, 204, 156)]);

const BIRTH = blob(152, 170, 46, 34, 12, 0.28, 0.2);
const BIRTH_CORE = blob(146, 166, 28, 20, 9, 0.3, 0.2);
const SPOTS = scatter(150, 170, 70, 48, 7, 4, 12).map(([x, y, r]) => ({ d: blob(x, y, r, r * 0.85, 8, 0.2), o: r1(0.45 + rand() * 0.3) }));
const DARK = blob(150, 172, 70, 50, 12, 0.18);
const PITS = scatter(150, 170, 62, 42, 14, 2.6, 4.6);

const LASH_LINE = [66, 116, 150, 156, 234, 112] as const;
const UNDER_LASHES = Array.from({ length: 18 }, (_, k) => {
  const u = 0.06 + (k * 0.88) / 17;
  const x = qb(u, LASH_LINE[0], LASH_LINE[2], LASH_LINE[4]);
  const y = qb(u, LASH_LINE[1], LASH_LINE[3], LASH_LINE[5]);
  const a = ((-30 + 60 * u) * Math.PI) / 180;
  const len = 7 + 9 * Math.sin(Math.PI * u) + rand() * 2;
  const ex = Math.sin(a) * len;
  const ey = Math.cos(a) * len;
  return `M${r1(x)} ${r1(y)}q${r1(ex * 0.3)} ${r1(ey * 0.6)} ${r1(ex)} ${r1(ey)}`;
});

const ROSACEA = blob(150, 170, 72, 48, 12, 0.2);
const VESSELS = Array.from({ length: 6 }, () => {
  const a = rand() * 2 * Math.PI;
  const d = Math.sqrt(rand()) * 0.7;
  const x = 150 + Math.cos(a) * 60 * d;
  const y = 170 + Math.sin(a) * 36 * d;
  const t = rand() * Math.PI;
  const len = 12 + rand() * 10;
  return smooth(wave([x, y], [x + Math.cos(t) * len, y + Math.sin(t) * len], 3, 1.4));
});

const SUN = scatter(150, 172, 80, 56, 13, 2.2, 5.5).map(([x, y, r]) => ({ x, y, r, o: r1(0.35 + rand() * 0.25) }));

const TRUNK = wave([84, 196], [216, 148], 8, 3);
const CAPILLARIES = [0.15, 0.3, 0.42, 0.55, 0.68, 0.8, 0.9].flatMap((t, k) => {
  const b = TRUNK[Math.floor(t * 8)];
  const ang = Math.atan2(-48, 132) + (k % 2 ? 1 : -1) * (0.7 + rand() * 0.6);
  const len = 16 + rand() * 18;
  const e: P = [b[0] + Math.cos(ang) * len, b[1] + Math.sin(ang) * len];
  const branch = wave(b, e, 3, 1.6);
  const twig = rand() < 0.5 ? [] : [wave(branch[2], [branch[2][0] + jit(20), branch[2][1] + jit(20)], 2, 1)];
  return [{ d: smooth(branch), w: 1 }, ...twig.map((ps) => ({ d: smooth(ps), w: 0.7 }))];
});

const SPECS: Record<KamuflajVariant, Spec> = {
  iz: spec(
    [86, 148, 128, 44],
    <>
      <path d={blob(150, 170, 56, 15, 12, 0.22, -0.12)} fill={PALE} stroke={RIM} strokeWidth="1.4" />
      <path d="M110 172Q150 162 194 162" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity=".6" />
    </>,
  ),
  catlak: spec(
    bbox(STRETCH.flat(), 8),
    <g fill="none" strokeLinecap="round">
      {STRETCH.map((ps, i) => (
        <g key={i}>
          <path d={smooth(ps)} stroke="#f3c6c2" strokeWidth="5.5" />
          <path d={smooth(ps)} stroke="#fbe6e2" strokeWidth="1.8" />
        </g>
      ))}
    </g>,
    { pen: STRETCH.flatMap((ps, i) => (i % 2 ? [ps[ps.length - 1], ps[0]] : [ps[0], ps[ps.length - 1]])), w: 24 },
  ),
  vitiligo: spec(
    [84, 114, 146, 116],
    <g fill="#fdf5ef" filter="url(#pa-km-soft)">
      {VITILIGO.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>,
  ),
  yanik: spec(
    ell(150, 172, 70, 52),
    <>
      <path d={BURN} fill="#f5cbc1" stroke="#e9ada2" strokeWidth="1" />
      {BURN_MOTTLE.map((m, k) => (
        <circle key={k} cx={m.cx} cy={m.cy} r={m.r} fill={m.light ? "#fbe2da" : "#eeb4a9"} opacity=".7" filter="url(#pa-km-soft)" />
      ))}
      <ellipse cx="134" cy="156" rx="26" ry="8" fill="#fff" opacity=".45" transform="rotate(-12 134 156)" filter="url(#pa-km-soft)" />
    </>,
  ),
  ameliyat: spec(
    bbox(SURGERY, 14),
    <>
      {scar(`M${pt(SURGERY[0])}L${pt(SURGERY[1])}`, 6.5)}
      <g fill="#dea294">
        {STITCHES.flat().map(([x, y], k) => (
          <circle key={k} cx={x} cy={y} r="1.5" />
        ))}
      </g>
    </>,
    { pen: SURGERY, w: 28, test: [84, 194] },
  ),
  yara: spec(bbox(WOUND, 10), scar(`M${WOUND.map(pt).join("L")}`, 7), { pen: WOUND, w: 26, test: WOUND[0] }),
  jilet: spec(
    bbox(RAZOR.flat(), 8),
    <>
      {RAZOR.map(([a, b], i) => (
        <g key={i}>{scar(`M${pt(a)}L${pt(b)}`, 3)}</g>
      ))}
    </>,
    { pen: RAZOR.flatMap(([a, b], i) => (i % 2 ? [b, a] : [a, b])), w: 22, test: RAZOR[0][0] },
  ),
  sezaryen: spec(bbox(CSEC, 10), scar("M76 156Q150 204 224 156", 6.5), { pen: CSEC, w: 26, test: CSEC[0] }),
  "dogum-lekesi": spec(
    ell(152, 170, 58, 44),
    <g filter="url(#pa-km-soft)">
      <path d={BIRTH} fill={BROWN} opacity=".72" />
      <path d={BIRTH_CORE} fill="#8c5a44" opacity=".25" />
    </g>,
  ),
  leke: spec(
    ell(150, 170, 80, 58),
    <g fill="#b07a5e" filter="url(#pa-km-soft)">
      {SPOTS.map((s) => (
        <path key={s.d} d={s.d} opacity={s.o} />
      ))}
    </g>,
  ),
  kararma: spec(ell(150, 172, 74, 54), <path d={DARK} fill="url(#pa-km-dark)" filter="url(#pa-km-haze)" />),
  sivilce: spec(
    ell(150, 170, 68, 48),
    <>
      {PITS.map(([x, y, r]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r={r} fill="#fbe7dc" opacity=".9" />
          <circle cx={r1(x + 0.4)} cy={r1(y + 0.5)} r={r1(r * 0.55)} fill="#b9836d" opacity=".6" />
        </g>
      ))}
    </>,
  ),
  dovme: spec(
    [88, 122, 124, 94],
    <g fill="none" stroke={INK} strokeLinecap="round" opacity=".85" filter="url(#pa-km-ink)">
      <path d="M150 180C120 160 116 138 132 133C142 130 148 136 150 142C152 136 158 130 168 133C184 138 180 160 150 180Z" strokeWidth="2.4" />
      <path d="M96 206C126 196 172 214 204 198" strokeWidth="2" />
    </g>,
  ),
  "goz-alti": spec(
    [72, 124, 158, 60],
    <path d="M74 128Q150 172 228 124Q214 176 150 186Q90 178 74 128Z" fill="url(#pa-km-under)" filter="url(#pa-km-haze)" />,
    {
      test: [84, 140],
      base: (
        <>
          <path d="M70 94Q150 128 230 92" fill="none" stroke="#d69c84" strokeWidth="2.4" strokeLinecap="round" opacity=".55" />
          <path d="M66 116Q150 156 234 112" fill="none" stroke="#6b3a2c" strokeWidth="2.6" strokeLinecap="round" />
          <g fill="none" stroke="#4a2a20" strokeWidth="1.8" strokeLinecap="round">
            {UNDER_LASHES.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        </>
      ),
    },
  ),
  rosacea: spec(
    ell(150, 170, 78, 52),
    <>
      <path d={ROSACEA} fill="url(#pa-km-red)" filter="url(#pa-km-haze)" />
      <g fill="none" stroke={VEIN} strokeWidth=".8" strokeLinecap="round" opacity=".7">
        {VESSELS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </>,
  ),
  "gunes-lekesi": spec(
    ell(150, 172, 86, 62),
    <g fill="#c08a68" filter="url(#pa-km-soft)">
      {SUN.map((s) => (
        <circle key={`${s.x}-${s.y}`} cx={s.x} cy={s.y} r={s.r} opacity={s.o} />
      ))}
    </g>,
  ),
  kilcal: spec(
    bbox(TRUNK, 30),
    <g fill="none" stroke={VEIN} strokeLinecap="round" opacity=".75">
      <path d={smooth(TRUNK)} strokeWidth="1.4" />
      {CAPILLARIES.map((c) => (
        <path key={c.d} d={c.d} strokeWidth={c.w} />
      ))}
    </g>,
  ),
};

// Kalem izinde ince noktalı pigment dokusu (yol boyunca, iz kalınlığı içinde).
function stipple(pen: P[], w: number) {
  return Array.from({ length: 70 }, () => {
    const i = Math.floor(rand() * (pen.length - 1));
    const [a, b] = [pen[i], pen[i + 1]];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const t = rand();
    const o = jit(w * 0.8);
    return [r1(a[0] + dx * t - (dy / len) * o), r1(a[1] + dy * t + (dx / len) * o), r1(0.4 + rand() * 0.5)] as const;
  });
}

// Kalem keyframe'leri: 3. fazda deneme noktasına dokunur (41–48), 4. fazda yol uzunluğuyla
// orantılı olarak 60.5 → 76 arasında ilerler; pa-km-wipe (stroke-dashoffset) ile aynı hız.
function penKeyframes(name: string, pen: P[], test: P) {
  const at = (p: P, dx = 0, dy = 0) => `transform: translate(${r1(p[0] + dx)}px, ${r1(p[1] + dy)}px);`;
  const segs = pen.slice(1).map((p, i) => Math.hypot(p[0] - pen[i][0], p[1] - pen[i][1]));
  const total = segs.reduce((s, l) => s + l, 0);
  let acc = 0;
  const path = pen.slice(1).map((p, i) => {
    acc += segs[i];
    return `${(60.5 + (15.5 * acc) / total).toFixed(2)}% { opacity: 1; ${at(p)} animation-timing-function: linear; }`;
  });
  const end = pen[pen.length - 1];
  return [
    `@keyframes ${name} {`,
    `0%, 41% { opacity: 0; ${at(test, 8, -12)} }`,
    `43% { opacity: 1; ${at(test, 3, -5)} }`,
    `44.5% { ${at(test)} }`,
    `46% { opacity: 1; ${at(test, 3, -5)} }`,
    `48% { opacity: 0; ${at(test, 8, -12)} }`,
    `59.9% { opacity: 0; ${at(pen[0], 6, -10)} }`,
    `60.5% { opacity: 1; ${at(pen[0])} animation-timing-function: linear; }`,
    ...path,
    `78%, 100% { opacity: 0; ${at(end, 8, -12)} }`,
    "}",
  ].join("\n");
}

// Varyantın çizime hazır hali: çerçeve köşeleri, cetvel, kalem yolu, doku, yıldızlar, kalem keyframe'i.
function build(variant: KamuflajVariant, s: Spec) {
  const [x, y, w, h] = s.box;
  const fx = r1(x - 8);
  const fy = r1(y - 8);
  const fw = r1(w + 16);
  const fh = r1(h + 16);
  const c = 12;
  const ry = r1(y + h + 16);
  return {
    ...s,
    penD: `M${s.pen.map(pt).join("L")}`,
    corners: `M${fx} ${r1(fy + c)}V${fy}H${r1(fx + c)}M${r1(fx + fw - c)} ${fy}H${r1(fx + fw)}V${r1(fy + c)}M${r1(fx + fw)} ${r1(fy + fh - c)}V${r1(fy + fh)}H${r1(fx + fw - c)}M${r1(fx + c)} ${r1(fy + fh)}H${fx}V${r1(fy + fh - c)}`,
    ruler: `M${x} ${ry}H${r1(x + w)}${Array.from({ length: 9 }, (_, i) => `M${r1(x + (w * i) / 8)} ${ry}v${i % 4 ? -3 : -6}`).join("")}`,
    dots: stipple(s.pen, s.w),
    sparks: [
      [x - 4, y + h * 0.3, 1.2],
      [x + w * 0.3, y - 8, 1],
      [x + w * 0.72, y - 4, 1.4],
      [x + w + 6, y + h * 0.55, 1.1],
      [x + w * 0.58, y + h + 8, 1.3],
      [x + w * 0.16, y + h + 4, 0.9],
    ].map(([sx, sy, k]) => [r1(sx), r1(sy), k] as const),
    css: penKeyframes(`pa-km-pen-${variant}`, s.pen, s.test),
  };
}
// Modül yüklenirken bir kez (tohumlu dizi sırası sabit): sunucu ve tarayıcı aynı çıktıyı üretir.
const SCENES = Object.fromEntries(
  (Object.entries(SPECS) as [KamuflajVariant, Spec][]).map(([variant, s]) => [variant, build(variant, s)]),
) as Record<KamuflajVariant, ReturnType<typeof build>>;

// Cilt dokusu: tüm varyantlarda aynı ince gözenekler.
const PORES = Array.from({ length: 46 }, () => [r1(14 + rand() * 272), r1(30 + rand() * 270), r1(0.5 + rand() * 0.6)] as const);

// 2 · ten tonu paleti (açıktan koyuya); seçilen = pigment, karışım iki uç tondan ona döner.
const TONES = ["#fbe4d4", "#f1c7ae", "#dfa889", "#c48a6b"] as const;
const PICK = 1;
const PAL_Y = 262;
const palX = (i: number) => 104 + i * 26;

const STAR = "M0 -8Q1.2 -1.2 8 0Q1.2 1.2 0 8Q-1.2 1.2 -8 0Q-1.2 -1.2 0 -8Z";

export function KamuflajScene({ variant = "iz" }: { variant?: KamuflajVariant }) {
  const s = SCENES[variant];
  const [x, y, w, h] = s.box;
  const [tx, ty] = s.test;
  return (
    <svg className="pa-km min-h-0 w-full flex-1" viewBox="0 0 300 330" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <style>{s.css}</style>
      <defs>
        <filter id="pa-km-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <filter id="pa-km-haze" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4.5" />
        </filter>
        <filter id="pa-km-ink" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation=".45" />
        </filter>
        <filter id="pa-km-blur" filterUnits="userSpaceOnUse" x="0" y="0" width="300" height="330">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <radialGradient id="pa-km-dark" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#9c6248" stopOpacity=".55" />
          <stop offset="1" stopColor="#9c6248" stopOpacity=".05" />
        </radialGradient>
        <radialGradient id="pa-km-red" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#dc6f6c" stopOpacity=".55" />
          <stop offset="1" stopColor="#dc6f6c" stopOpacity=".05" />
        </radialGradient>
        <linearGradient id="pa-km-under" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7f5468" stopOpacity=".6" />
          <stop offset="1" stopColor="#7f5468" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="pa-km-light" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff" stopOpacity=".8" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        {/* Kusur maskesi: kalem izi (koyu, bulanık kenarlı) kusuru ~%25'e indirir; deneme noktası da */}
        <mask id="pa-km-hide" maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="330">
          <rect width="300" height="330" fill="#fff" />
          <g filter="url(#pa-km-blur)">
            <path
              className="pa-km-wipe"
              d={s.penD}
              pathLength={1}
              fill="none"
              stroke="#000"
              strokeOpacity=".75"
              strokeWidth={s.w}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle className="pa-km-testfill" cx={tx} cy={ty} r="7" fill="#000" fillOpacity=".75" />
          </g>
        </mask>
        {/* Noktalı doku yalnızca kalemin geçtiği yerde görünür */}
        <mask id="pa-km-reveal" maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="330">
          <path
            className="pa-km-wipe"
            d={s.penD}
            pathLength={1}
            fill="none"
            stroke="#fff"
            strokeWidth={s.w}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </mask>
      </defs>

      {/* Cilt kartın arka planında (globals.css); ince gözenekler */}
      <g fill="#c98a72" opacity=".18">
        {PORES.map(([px, py, pr], k) => (
          <circle key={k} cx={px} cy={py} r={pr} />
        ))}
      </g>

      {/* Kusur (varyanta göre) — maskeyle kapanır, 5. fazda tamamen söner */}
      <g className="pa-km-defect">
        <g mask="url(#pa-km-hide)">{s.defect}</g>
      </g>
      {s.base}

      {/* 4 · pigment dokusu: ten tonundan koyu/açık ince noktalar */}
      <g className="pa-km-stipple" mask="url(#pa-km-reveal)">
        {s.dots.map(([dx, dy, dr], k) => (
          <circle key={k} cx={dx} cy={dy} r={dr} fill={k % 3 ? "#e3a98e" : "#fff"} />
        ))}
      </g>

      {/* 1 · analiz: köşeli çerçeve + ölçü cetveli, tarama çizgisi aşağı iner ve geri döner */}
      <g className="pa-km-frame" fill="none" stroke="#a83f54" strokeLinecap="round">
        <path d={s.corners} strokeWidth="1.8" />
        <path className="pa-km-ticks" d={s.ruler} strokeWidth="1.1" />
      </g>
      <g className="pa-km-scan" style={{ "--sh": `${h}px` } as CSSProperties}>
        <line x1={x} x2={r1(x + w)} y1={y} y2={y} stroke="#fff" strokeWidth="4" opacity=".5" filter="url(#pa-km-soft)" />
        <line x1={x} x2={r1(x + w)} y1={y} y2={y} stroke="#a83f54" strokeWidth="1" strokeOpacity=".8" />
      </g>

      {/* 2 · renk analizi: palet, seçim halkası, karışım */}
      {TONES.map((c, i) => (
        <circle
          key={c}
          className="pa-km-swatch"
          cx={palX(i)}
          cy={PAL_Y}
          r="7.5"
          fill={c}
          stroke="#fff"
          strokeWidth="1.4"
          style={{ animationDelay: `${r1(i * 0.12)}s` }}
        />
      ))}
      <circle className="pa-km-ring" cx={palX(PICK)} cy={PAL_Y} r="11" fill="none" stroke="#a83f54" strokeWidth="1.3" />
      <g className="pa-km-mix" stroke="#fff" strokeWidth="1.4">
        <path d={`M214 ${PAL_Y - 9}a9 9 0 0 0 0 18Z`} fill={TONES[0]} />
        <path d={`M214 ${PAL_Y - 9}a9 9 0 0 1 0 18Z`} fill={TONES[2]} />
      </g>
      <circle className="pa-km-blend" cx="214" cy={PAL_Y} r="9" fill={TONES[PICK]} stroke="#fff" strokeWidth="1.4" />

      {/* 3 · test: kesikli halka + onay rozeti */}
      <circle className="pa-km-test" cx={tx} cy={ty} r="10" fill="none" stroke="#a83f54" strokeWidth="1" strokeDasharray="2 2" />
      <g className="pa-km-check">
        <circle cx={r1(tx + 14)} cy={r1(ty - 14)} r="6.5" fill="#fff" stroke="#a83f54" strokeWidth=".8" />
        <path
          d={`M${r1(tx + 11)} ${r1(ty - 14)}l2 2.2 4-4.4`}
          fill="none"
          stroke="#a83f54"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* 5 · iyileşme: yumuşak ışık */}
      <ellipse
        className="pa-km-glow"
        cx={r1(x + w / 2)}
        cy={r1(y + h / 2)}
        rx={r1(w / 2 + 16)}
        ry={r1(h / 2 + 16)}
        fill="url(#pa-km-light)"
      />

      {/* 3–4 · steril kalem: ucu (0,0), gövde sağ üste yatık; konum varyant keyframe'inden */}
      <g className="pa-km-pen" style={{ animationName: `pa-km-pen-${variant}` }}>
        <g transform="rotate(28)">
          <path d="M0 0V-7" stroke="#8f8582" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M-2.2 -7H2.2L4.2 -16H-4.2Z" fill="#ece5e2" />
          <rect x="-4.6" y="-80" width="9.2" height="65" rx="4.6" fill="#4c1313" />
          <rect x="-4.6" y="-32" width="9.2" height="3" fill="#e58792" />
          <path d="M-2 -74V-38" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity=".25" />
        </g>
      </g>

      {/* 5 · yıldızlar (beyaz / pembe dönüşümlü) */}
      {s.sparks.map(([sx, sy, k], i) => (
        <g key={i} transform={`translate(${sx} ${sy}) scale(${k})`}>
          <path
            className="pa-km-spark"
            d={STAR}
            fill={i % 2 ? "#e58792" : "#fff"}
            stroke="#a83f54"
            strokeWidth=".8"
            style={{ animationDelay: `${r1(i * 0.14)}s` }}
          />
        </g>
      ))}
    </svg>
  );
}
