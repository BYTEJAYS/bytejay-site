"use client";

import { useEffect, useRef } from "react";

/*
 * Jerry as a living particle brain — two lobes split by a central
 * fissure (same anatomy as his pixel icon), drawn as drifting
 * particles with synapses that fire in accent orange. While Jerry
 * is thinking the whole network agitates and fires faster.
 */

const INK = "28, 25, 23";
const ACCENT = "255, 77, 36";
const COUNT = 210;
const LINK_DIST = 26;

type P = {
  hx: number; // home position (unit brain space, roughly -1..1 x, -0.7..0.7 y)
  hy: number;
  phase: number;
  speed: number;
  amp: number;
  fire: number; // 0..1, decays — how lit this synapse is
};

/** deterministic pseudo-random so SSR/CSR agree if ever needed */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** two mirrored lobes with a fissure down the middle */
function sampleBrain(rand: () => number): { x: number; y: number } {
  for (;;) {
    const x = rand() * 2 - 1;
    const y = rand() * 1.4 - 0.7;
    const side = x < 0 ? -1 : 1;
    // lobe: ellipse centred at ±0.52, squashed vertically
    const lx = (x - side * 0.52) / 0.5;
    const ly = y / 0.62;
    const inLobe = lx * lx + ly * ly <= 1;
    // the fissure: keep a gap around x = 0
    const inFissure = Math.abs(x) < 0.055;
    // brain-stem nub below the fissure (like the icon's bottom pixels)
    const inStem = Math.abs(x) < 0.1 && y > 0.55 && y < 0.78;
    if ((inLobe && !inFissure) || inStem) return { x, y };
  }
}

export default function ParticleBrain({
  thinking = false,
  className = "",
}: {
  thinking?: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const thinkingRef = useRef(thinking);
  thinkingRef.current = thinking;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const rand = mulberry32(20070427);
    const parts: P[] = Array.from({ length: COUNT }, () => {
      const { x, y } = sampleBrain(rand);
      return {
        hx: x,
        hy: y,
        phase: rand() * Math.PI * 2,
        speed: 0.5 + rand() * 0.9,
        amp: 0.35 + rand() * 0.75,
        fire: 0,
      };
    });

    let w = 0;
    let h = 0;
    let scale = 1;
    let cx = 0;
    let cy = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // fit the ~2.1 x 1.5 brain box into the canvas with padding
      scale = Math.min(w / 2.35, h / 1.65);
      cx = w / 2;
      cy = h / 2;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // static topology: link home positions once
    const links: [number, number][] = [];
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        const dx = (parts[i].hx - parts[j].hx) * 100;
        const dy = (parts[i].hy - parts[j].hy) * 100;
        if (dx * dx + dy * dy < LINK_DIST * LINK_DIST) links.push([i, j]);
      }
    }

    const px = new Float32Array(COUNT);
    const py = new Float32Array(COUNT);
    let raf = 0;
    let last = performance.now();
    let fireClock = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const think = thinkingRef.current;
      const agitation = think ? 2.2 : 1;
      const t = now / 1000;

      // fire a random synapse every so often; much faster while thinking
      fireClock -= dt;
      if (fireClock <= 0) {
        fireClock = (think ? 0.09 : 0.5) + Math.random() * (think ? 0.12 : 0.9);
        const i = Math.floor(Math.random() * COUNT);
        parts[i].fire = 1;
        // ripple: light the linked neighbours a little
        for (const [a, b] of links) {
          if (a === i) parts[b].fire = Math.max(parts[b].fire, 0.55);
          else if (b === i) parts[a].fire = Math.max(parts[a].fire, 0.55);
        }
      }

      for (let i = 0; i < COUNT; i++) {
        const p = parts[i];
        const drift = reduceMotion ? 0 : p.amp * agitation;
        px[i] =
          cx +
          (p.hx + Math.sin(t * p.speed + p.phase) * 0.014 * drift) * scale;
        py[i] =
          cy +
          (p.hy + Math.cos(t * p.speed * 0.8 + p.phase * 1.7) * 0.014 * drift) *
            scale;
        p.fire = Math.max(0, p.fire - dt * (think ? 2.6 : 1.6));
      }

      ctx.clearRect(0, 0, w, h);

      // neural threads
      ctx.lineWidth = 0.6;
      for (const [a, b] of links) {
        const glow = Math.max(parts[a].fire, parts[b].fire);
        ctx.strokeStyle =
          glow > 0.05
            ? `rgba(${ACCENT}, ${0.08 + glow * 0.5})`
            : `rgba(${INK}, 0.07)`;
        ctx.beginPath();
        ctx.moveTo(px[a], py[a]);
        ctx.lineTo(px[b], py[b]);
        ctx.stroke();
      }

      // particles
      for (let i = 0; i < COUNT; i++) {
        const f = parts[i].fire;
        const r = 1.3 + f * 1.8;
        if (f > 0.05) {
          ctx.fillStyle = `rgba(${ACCENT}, ${0.45 + f * 0.55})`;
          // soft halo on strongly firing synapses
          if (f > 0.6) {
            ctx.beginPath();
            ctx.arc(px[i], py[i], r * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${ACCENT}, ${(f - 0.6) * 0.18})`;
            ctx.fill();
            ctx.fillStyle = `rgba(${ACCENT}, ${0.45 + f * 0.55})`;
          }
        } else {
          ctx.fillStyle = `rgba(${INK}, 0.72)`;
        }
        ctx.beginPath();
        ctx.arc(px[i], py[i], r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
