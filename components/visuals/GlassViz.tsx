const CELLS = Array.from({ length: 60 }, (_, i) => i);

export default function GlassViz() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative overflow-hidden rounded-2xl border border-line bg-white/[0.07] p-4 shadow-sm [transform:perspective(700px)_rotateX(14deg)] transition-transform duration-500 group-hover:[transform:perspective(700px)_rotateX(6deg)]">
        <div className="grid grid-cols-10 gap-1.5">
          {CELLS.map((i) => (
            <span
              key={i}
              className={`voxel h-3 w-3 rounded-[3px] ${
                i % 13 === 0 ? "bg-accent" : "bg-ink"
              }`}
              style={{ animationDelay: `${(i * 137) % 2900}ms` }}
            />
          ))}
        </div>
        <span
          aria-hidden
          className="sheen pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-transparent via-white/80 to-transparent"
        />
      </div>
      <p className="font-display text-[10px] uppercase tracking-[0.2em] text-muted">
        5D voxel plane · layer 03
      </p>
    </div>
  );
}
