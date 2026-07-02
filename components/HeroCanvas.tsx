"use client";

import { useEffect, useRef } from "react";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ix: number; // impulse from cursor/bursts, decays each frame
  iy: number;
  r: number;
  accent: boolean;
};

type Props = {
  dark?: boolean;
  onBurst?: () => void;
};

export default function HeroCanvas({ dark = false, onBurst }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const burstRef = useRef(onBurst);
  burstRef.current = onBurst;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const base = dark ? "251,248,242" : "28,25,23";
    const linkAlpha = dark ? 0.16 : 0.12;
    const nodeAlpha = dark ? 0.45 : 0.28;

    let raf = 0;
    let w = 0;
    let h = 0;
    let nodes: Node[] = [];
    const pointer = { x: -9999, y: -9999 };

    const init = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(70, Math.max(28, Math.floor((w * h) / 22000)));
      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        ix: 0,
        iy: 0,
        r: 1.2 + Math.random() * 1.8,
        accent: i % 9 === 0,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const linkDist = 130;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < linkDist) {
            ctx.strokeStyle = `rgba(${base},${(1 - d / linkDist) * linkAlpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.beginPath();
        ctx.fillStyle = n.accent
          ? "rgba(255,77,36,0.6)"
          : `rgba(${base},${nodeAlpha})`;
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const tick = () => {
      for (const n of nodes) {
        // gentle repulsion around the cursor
        const dx = n.x - pointer.x;
        const dy = n.y - pointer.y;
        const d = Math.hypot(dx, dy);
        if (d < 110 && d > 0.01) {
          const f = (1 - d / 110) * 0.4;
          n.ix += (dx / d) * f;
          n.iy += (dy / d) * f;
        }
        n.ix *= 0.9;
        n.iy *= 0.9;
        n.x += n.vx + n.ix;
        n.y += n.vy + n.iy;
        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;
      }
      draw();
      raf = requestAnimationFrame(tick);
    };

    const toLocal = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top, r };
    };

    const onMove = (e: MouseEvent) => {
      const p = toLocal(e);
      pointer.x = p.x;
      pointer.y = p.y;
    };

    const onClick = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest("a, button")) return;
      const p = toLocal(e);
      if (p.x < 0 || p.y < 0 || p.x > p.r.width || p.y > p.r.height) return;
      for (const n of nodes) {
        const d = Math.hypot(n.x - p.x, n.y - p.y);
        if (d < 180) {
          const f = (1 - d / 180) * 14;
          n.ix += ((n.x - p.x) / (d || 1)) * f;
          n.iy += ((n.y - p.y) / (d || 1)) * f;
        }
      }
      burstRef.current?.();
    };

    init();
    draw();
    if (!reduced) {
      raf = requestAnimationFrame(tick);
      window.addEventListener("mousemove", onMove);
      window.addEventListener("click", onClick);
    }

    const onResize = () => {
      init();
      draw();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
    };
  }, [dark]);

  return <canvas ref={ref} aria-hidden className="h-full w-full" />;
}
