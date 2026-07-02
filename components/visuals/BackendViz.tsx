const routes = [
  "M78,100 C104,100 106,100 128,100",
  "M202,92 C228,92 228,52 246,52",
  "M202,100 C228,100 228,108 246,108",
  "M202,108 C228,108 228,164 246,164",
];

const services = [
  { y: 36, label: "orders" },
  { y: 92, label: "kitchen" },
  { y: 148, label: "billing" },
];

export default function BackendViz() {
  return (
    <svg
      viewBox="0 0 320 200"
      className="w-full max-w-[340px] opacity-80 transition-opacity duration-500 group-hover:opacity-100"
      aria-hidden
    >
      {routes.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#E9E2D6" strokeWidth="1.5" />
      ))}

      {/* requests flowing through the system */}
      {routes.map((d, i) => (
        <circle key={`dot${i}`} r="3" fill={i === 0 ? "#FF4D24" : "#1C1917"} opacity={i === 0 ? 1 : 0.55}>
          <animateMotion dur="2.2s" begin={`${i * 0.55}s`} repeatCount="indefinite" path={d} />
        </circle>
      ))}

      {/* client */}
      <rect x="16" y="82" width="62" height="36" rx="9" fill="#FBF8F2" stroke="#1C1917" strokeWidth="1.5" />
      <text x="47" y="104" textAnchor="middle" fontSize="10" fill="#57534E" fontFamily="var(--font-space)">
        client
      </text>

      {/* api gateway */}
      <rect x="128" y="78" width="74" height="44" rx="10" fill="#1C1917" />
      <text x="165" y="104" textAnchor="middle" fontSize="10" fill="#FBF8F2" fontFamily="var(--font-space)">
        FastAPI
      </text>

      {/* services */}
      {services.map((s) => (
        <g key={s.label}>
          <rect x="246" y={s.y} width="58" height="32" rx="8" fill="#FBF8F2" stroke="#1C1917" strokeWidth="1.5" />
          <text
            x="275"
            y={s.y + 20}
            textAnchor="middle"
            fontSize="9"
            fill="#57534E"
            fontFamily="var(--font-space)"
          >
            {s.label}
          </text>
        </g>
      ))}

      {/* status chip */}
      <g>
        <rect x="130" y="34" width="70" height="22" rx="11" fill="#FFEDE5" />
        <text x="165" y="48" textAnchor="middle" fontSize="9" fill="#FF4D24" fontFamily="var(--font-space)">
          200 OK · async
        </text>
        <animate attributeName="opacity" values="0;1;1;0" dur="2.2s" repeatCount="indefinite" />
      </g>

      <text
        x="160"
        y="192"
        textAnchor="middle"
        fontSize="10"
        fill="#8A8074"
        fontFamily="var(--font-space)"
        letterSpacing="2"
      >
        CAFÉ-SIM · ORDER PIPELINE
      </text>
    </svg>
  );
}
