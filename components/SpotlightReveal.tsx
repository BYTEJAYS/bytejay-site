"use client";

import { useEffect, useRef } from "react";

const RADIUS = 260;
const LERP = 0.1;

/**
 * A torch that follows the cursor across the hero and reveals the
 * blueprint hiding under the paper — grid, plumb lines, margin notes.
 * The reveal is a CSS radial-gradient mask driven by CSS variables,
 * so nothing re-rasterises per frame. Desktop pointers only.
 */
export default function SpotlightReveal({ dark }: { dark: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const el = wrapRef.current;
    if (!el) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const mouse = { x: -9999, y: -9999 };
    const smooth = { x: -9999, y: -9999 };
    let radius = 0;
    let targetRadius = 0;
    let raf = 0;
    let inView = true;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      targetRadius =
        mouse.y >= 0 && mouse.y <= rect.height && mouse.x >= 0 ? RADIUS : 0;
    };
    const onLeave = () => {
      targetRadius = 0;
    };

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
    });
    io.observe(el);

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!inView) return;
      if (reduced) {
        smooth.x = mouse.x;
        smooth.y = mouse.y;
        radius = targetRadius;
      } else {
        smooth.x += (mouse.x - smooth.x) * LERP;
        smooth.y += (mouse.y - smooth.y) * LERP;
        radius += (targetRadius - radius) * 0.08;
      }
      el.style.setProperty("--sx", `${smooth.x}px`);
      el.style.setProperty("--sy", `${smooth.y}px`);
      el.style.setProperty("--sr", `${Math.max(radius, 0)}px`);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("mousemove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const line = dark ? "rgba(251,248,242,0.16)" : "rgba(28,25,23,0.14)";
  const noteColor = dark ? "text-cream/50" : "text-ink/45";
  const mask =
    "radial-gradient(circle var(--sr,0px) at var(--sx,-9999px) var(--sy,-9999px), black 55%, rgba(0,0,0,0.4) 78%, transparent 100%)";

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden md:block"
      style={{
        maskImage: mask,
        WebkitMaskImage: mask,
        backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }}
    >
      {/* margin notes on the blueprint */}
      <span
        className={`absolute left-[12%] top-[18%] font-mono text-[10px] tracking-[0.2em] ${noteColor}`}
      >
        FIG. 01 — HERO
      </span>
      <span
        className={`absolute right-[14%] top-[26%] font-hand text-xl -rotate-6 ${noteColor}`}
      >
        the blueprint was here all along
      </span>
      <span
        className={`absolute bottom-[24%] left-[18%] font-mono text-[10px] tracking-[0.2em] ${noteColor}`}
      >
        SCALE 1:1 · DRAWN BY JAY
      </span>
      <span
        className={`absolute bottom-[30%] right-[16%] font-mono text-[10px] tracking-[0.2em] ${noteColor}`}
      >
        REV 4 · APPROVED ✓
      </span>
      {/* crosshair registration marks */}
      {[
        ["left-[8%]", "top-[40%]"],
        ["right-[10%]", "top-[55%]"],
        ["left-[30%]", "bottom-[14%]"],
      ].map(([x, y]) => (
        <span key={x + y} className={`absolute ${x} ${y} ${noteColor}`}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 0v18M0 9h18"
              stroke="currentColor"
              strokeWidth="1"
            />
            <circle
              cx="9"
              cy="9"
              r="5"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        </span>
      ))}
    </div>
  );
}
