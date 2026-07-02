const SPRITES = {
  heart: ["0110110", "1111111", "1111111", "0111110", "0011100", "0001000"],
  spark: ["00100", "01110", "11111", "01110", "00100"],
  corner: ["11111", "10000", "10000", "10000", "10000"],
} as const;

type Props = {
  name: keyof typeof SPRITES;
  className?: string;
};

/** Tiny pixel-art sprite rendered crisp at any size; colored via currentColor. */
export default function PixelIcon({ name, className = "" }: Props) {
  const rows = SPRITES[name];
  const w = rows[0].length;
  const h = rows.length;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      aria-hidden
      className={className}
    >
      {rows.flatMap((row, y) =>
        row.split("").map((cell, x) =>
          cell === "1" ? (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
          ) : null
        )
      )}
    </svg>
  );
}
