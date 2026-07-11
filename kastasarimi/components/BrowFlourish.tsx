// Signature element (feminine / rose-gold): an elegant brow drawn as individual
// "kıl tekniği" hair strokes — delicate rose-gold curves fanning along a brow
// arch. Communicates the hair-by-hair design service while staying soft and
// decorative (no technical measurement labels).
const ROSE = "#b76e79";
const ROSE_DEEP = "#98505f";
const ROSE_LIGHT = "#cb9aa8";

const N = 17;
const strokes = Array.from({ length: N }, (_, i) => {
  const t = i / (N - 1);
  const x = 95 + t * 300;
  const archY = 255 - 58 * Math.sin(t * Math.PI * 0.92) + 26 * t;
  const len = 24 + 18 * Math.sin(t * Math.PI);
  const tilt = -16 + t * 34;
  const x1 = x;
  const y1 = archY + len;
  const cx = x + tilt * 0.4;
  const cy = archY;
  const x2 = x + tilt;
  const y2 = archY - len;
  const d = `M${x1.toFixed(1)},${y1.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
  const op = 0.55 + 0.4 * Math.sin(t * Math.PI);
  return { d, op };
});

export function BrowFlourish({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 520"
      className={className}
      role="img"
      aria-label="Kıl tekniğiyle kişiye özel tasarlanan doğal kaş çizimi"
      fill="none"
    >
      <defs>
        <radialGradient id="bf-glow" cx="52%" cy="46%" r="55%">
          <stop offset="0%" stopColor="#f6dde5" />
          <stop offset="100%" stopColor="#f6dde5" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="250" cy="240" r="200" fill="url(#bf-glow)" />

      {/* soft baseline arch under the brow */}
      <path
        d="M84,286 C170,258 250,246 300,254 C348,262 388,278 414,296"
        stroke={ROSE_LIGHT}
        strokeWidth="1.2"
        opacity="0.6"
        strokeLinecap="round"
      />

      {/* hair strokes */}
      {strokes.map((s, i) => (
        <path
          key={i}
          d={s.d}
          stroke={i % 3 === 0 ? ROSE_DEEP : ROSE}
          strokeWidth="1.7"
          strokeLinecap="round"
          opacity={s.op}
        />
      ))}

      {/* flowing flourish lines */}
      <path
        d="M70,360 C180,330 320,332 420,300"
        stroke={ROSE}
        strokeWidth="1"
        opacity="0.35"
        strokeLinecap="round"
      />
      <path
        d="M120,392 C210,372 300,372 380,352"
        stroke={ROSE_LIGHT}
        strokeWidth="1"
        opacity="0.35"
        strokeLinecap="round"
      />

      {/* small rose-gold marker dots at brow ends */}
      <circle cx="90" cy="279" r="3.2" fill={ROSE_DEEP} />
      <circle cx="410" cy="292" r="3.2" fill={ROSE_DEEP} />
    </svg>
  );
}
