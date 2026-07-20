const sources: [number, number][] = [
  [40, 38],
  [30, 100],
  [40, 162],
];
const targets: [number, number][] = [
  [278, 46],
  [288, 100],
  [278, 154],
];
const hub: [number, number] = [156, 100];

export default function GraphViz() {
  return (
    <svg
      viewBox="0 0 320 200"
      className="w-full max-w-[340px] opacity-80 transition-opacity duration-500 group-hover:opacity-100"
      aria-hidden
    >
      {/* fan-in edges */}
      {sources.map(([x, y], i) => (
        <line
          key={`s${i}`}
          x1={x}
          y1={y}
          x2={hub[0]}
          y2={hub[1]}
          stroke="#2A2A2A"
          strokeWidth="1.5"
        />
      ))}
      {/* fan-out edges */}
      {targets.map(([x, y], i) => (
        <line
          key={`t${i}`}
          x1={hub[0]}
          y1={hub[1]}
          x2={x}
          y2={y}
          stroke="#2A2A2A"
          strokeWidth="1.5"
        />
      ))}

      {/* pulses travelling into the mule account */}
      {sources.map(([x, y], i) => (
        <circle key={`pi${i}`} r="3" fill="#FF4D24">
          <animateMotion
            dur="2.6s"
            begin={`${i * 0.7}s`}
            repeatCount="indefinite"
            path={`M${x},${y} L${hub[0]},${hub[1]}`}
          />
        </circle>
      ))}
      {/* pulses fanning out */}
      {targets.map(([x, y], i) => (
        <circle key={`po${i}`} r="3" fill="#FAFAFA" opacity="0.55">
          <animateMotion
            dur="2.6s"
            begin={`${1.3 + i * 0.7}s`}
            repeatCount="indefinite"
            path={`M${hub[0]},${hub[1]} L${x},${y}`}
          />
        </circle>
      ))}

      {/* account nodes */}
      {[...sources, ...targets].map(([x, y], i) => (
        <circle key={`n${i}`} cx={x} cy={y} r="7" fill="#141414" stroke="#FAFAFA" strokeWidth="1.5" />
      ))}

      {/* flagged mule account */}
      <circle cx={hub[0]} cy={hub[1]} r="16" fill="none" stroke="#FF4D24" strokeWidth="1">
        <animate attributeName="r" values="14;20;14" dur="2.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.7;0;0.7" dur="2.6s" repeatCount="indefinite" />
      </circle>
      <circle cx={hub[0]} cy={hub[1]} r="10" fill="#FF4D24">
        <animate attributeName="r" values="9;11;9" dur="2.6s" repeatCount="indefinite" />
      </circle>

      <text
        x="160"
        y="192"
        textAnchor="middle"
        fontSize="10"
        fill="#8F8B84"
        fontFamily="var(--font-space)"
        letterSpacing="2"
      >
        FAN-IN → MULE → FAN-OUT
      </text>
    </svg>
  );
}
