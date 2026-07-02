import PixelIcon from "./PixelIcon";

const items = [
  "graph intelligence",
  "backend systems",
  "AI engineering",
  "holographic storage",
  "memory systems",
  "quantum curiosity",
  "async everything",
  "product ideation",
];

export default function Marquee() {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-line bg-surface/70 py-4">
      <div className="flex w-max animate-marquee">
        {row.map((item, i) => (
          <span
            key={i}
            className="flex items-center pr-10 font-display text-sm uppercase tracking-[0.2em] text-muted"
          >
            {item}
            <PixelIcon name="spark" className="ml-10 h-3 w-3 text-accent" />
          </span>
        ))}
      </div>
    </div>
  );
}
