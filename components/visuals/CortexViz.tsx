// Phyllotaxis layout: deterministic, so server and client render identically.
const DOTS = Array.from({ length: 48 }, (_, i) => {
  const angle = i * 2.39996;
  const radius = 6.5 * Math.sqrt(i);
  return {
    x: 160 + radius * Math.cos(angle) * 1.25,
    y: 76 + radius * Math.sin(angle) * 0.8,
    accent: i % 11 === 0,
  };
});

export default function CortexViz() {
  return (
    <svg
      viewBox="0 0 320 200"
      className="w-full max-w-[340px] opacity-80 transition-opacity duration-500 group-hover:opacity-100"
      aria-hidden
    >
      {/* the memory thread */}
      <polyline
        points={DOTS.map((d) => `${d.x.toFixed(1)},${d.y.toFixed(1)}`).join(" ")}
        fill="none"
        stroke="#FAFAFA"
        strokeWidth="0.75"
        opacity="0.08"
      />

      {/* memory particles */}
      {DOTS.map((d, i) => (
        <circle
          key={i}
          cx={d.x.toFixed(1)}
          cy={d.y.toFixed(1)}
          r={d.accent ? 3 : 2}
          fill={d.accent ? "#FF4D24" : "#FAFAFA"}
          className="twinkle"
          style={{ animationDelay: `${i * 90}ms` }}
        />
      ))}

      {/* life timeline */}
      <line x1="40" y1="172" x2="280" y2="172" stroke="#2A2A2A" strokeWidth="1.5" />
      {[40, 100, 160, 220, 280].map((x) => (
        <line key={x} x1={x} y1="168" x2={x} y2="176" stroke="#8F8B84" strokeWidth="1" />
      ))}
      <circle r="4" fill="#FF4D24">
        <animateMotion
          dur="9s"
          repeatCount="indefinite"
          path="M40,172 L280,172 L40,172"
        />
      </circle>

      <text
        x="160"
        y="194"
        textAnchor="middle"
        fontSize="10"
        fill="#8F8B84"
        fontFamily="var(--font-space)"
        letterSpacing="2"
      >
        REPLAYING A LIFE
      </text>
    </svg>
  );
}
