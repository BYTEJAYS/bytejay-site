export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-line py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-sm text-muted sm:flex-row">
        <p>
          © 2026 <span className="font-display font-medium text-ink">ByteJay</span>{" "}
          — built with too much curiosity.
        </p>
        <p className="font-hand text-lg text-ink-soft">
          somewhere between backend & the multiverse ✦
        </p>
      </div>
    </footer>
  );
}
