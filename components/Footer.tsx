import PixelIcon from "./PixelIcon";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-line py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-sm text-muted sm:flex-row">
        <p className="inline-flex items-center gap-1.5">
          © 2026 <span className="font-display font-medium text-ink">ByteJay</span>{" "}
          — built with too much curiosity
          <PixelIcon name="heart" className="h-3 w-3 text-accent" />
        </p>
        <p className="font-hand text-lg text-ink-soft">
          somewhere between backend & the multiverse ✦
        </p>
      </div>
    </footer>
  );
}
