// Signature element: a clinical "kaş haritalama" (golden-ratio brow mapping)
// line drawing — the precision motif the site is built around. Line-art only,
// sage guides on a mist panel, echoing how a real brow map is measured.
const SAGE = "#5e7c6b";
const INK = "#18201c";
const MUTED = "#7c857f";

export function BrowMap({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 560"
      className={className}
      role="img"
      aria-label="Altın oran ile kaş haritalama şeması: başlangıç, kavis ve bitiş noktaları"
      fill="none"
    >
      {/* golden ratio note */}
      <text x="40" y="70" fill={SAGE} fontSize="15" letterSpacing="3" fontFamily="var(--font-space-grotesk)">
        φ · 1.618
      </text>
      <text x="40" y="94" fill={MUTED} fontSize="11" letterSpacing="3" fontFamily="var(--font-inter)">
        KAŞ HARİTALAMA
      </text>

      {/* three mapping guides */}
      {[
        { x: 108, label: "BAŞLANGIÇ", y: 268 },
        { x: 292, label: "KAVİS", y: 214 },
        { x: 404, label: "BİTİŞ", y: 250 },
      ].map((g) => (
        <g key={g.x}>
          <line x1={g.x} y1="130" x2={g.x} y2="470" stroke={SAGE} strokeWidth="1" strokeDasharray="3 5" opacity="0.7" />
          <text x={g.x} y="500" fill={MUTED} fontSize="10.5" letterSpacing="1.5" textAnchor="middle" fontFamily="var(--font-inter)">
            {g.label}
          </text>
        </g>
      ))}

      {/* tail angle line (nose wing → tail) */}
      <line x1="70" y1="500" x2="404" y2="250" stroke={SAGE} strokeWidth="1" strokeDasharray="2 6" opacity="0.55" />

      {/* brow silhouette — line art */}
      <path
        d="M96,272 C160,228 236,206 300,214 C346,220 380,236 410,252 C382,250 344,256 300,258 C232,262 160,278 96,272 Z"
        fill="rgba(94,124,107,0.10)"
        stroke={INK}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* mapping points */}
      {[
        [108, 270],
        [292, 216],
        [404, 251],
      ].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r="5.5" fill="#ffffff" stroke={SAGE} strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r="2" fill={SAGE} />
        </g>
      ))}
    </svg>
  );
}
