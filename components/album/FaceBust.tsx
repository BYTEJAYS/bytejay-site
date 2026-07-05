"use client";

/**
 * The idle portrait for the album page — a close replica of the
 * raviklaassens.com character: a silver spotlight room, wide dark
 * shoulders, a shaggy hair mass whose strands hang like curtains
 * over an OPEN face (the background shows through the gaps), a red
 * particle smear dripping from the hair down the neck, and film
 * grain over everything. Procedural canvas 2D, zero assets beyond
 * one album photo feeding the smear.
 *
 * AlbumClient fades the whole thing out while the photo trail is
 * live and brings it back on idle.
 */

import { useEffect, useRef } from "react";

const INK = "#0A0908";
const SMEAR_SRC = "/album/jay-02.jpg";
const FPS = 12;

function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export default function FaceBust() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const bustC = document.createElement("canvas"); // shoulders + hair, static
    const grayC = document.createElement("canvas"); // pale source for hot slices
    const redC = document.createElement("canvas"); // crimson source
    const smearC = document.createElement("canvas"); // the dripping red layer
    const grainT: HTMLCanvasElement[] = []; // three film-grain tiles
    let W = 0;
    let H = 0;
    let img: HTMLImageElement | null = null;

    /* shared geometry — the character is big and slightly cropped, like the ref */
    const geo = () => {
      const headR = Math.min(W * 0.21, H * 0.26); // hair mass radius
      return { cx: W / 2, headR, headCy: H * 0.27 };
    };

    /* ── the body: wide shoulders + neck, plain ink ──────────────── */
    const drawShoulders = (c: CanvasRenderingContext2D) => {
      const { cx, headR } = geo();
      const neckW = headR * 0.42;
      const shW = Math.min(W * 1.06, headR * 7.4);
      c.fillStyle = INK;
      c.beginPath();
      c.moveTo(cx - shW / 2, H * 1.08);
      c.bezierCurveTo(cx - shW * 0.5, H * 0.78, cx - shW * 0.34, H * 0.705, cx - neckW * 3.1, H * 0.7);
      c.lineTo(cx + neckW * 3.1, H * 0.7);
      c.bezierCurveTo(cx + shW * 0.34, H * 0.705, cx + shW * 0.5, H * 0.78, cx + shW / 2, H * 1.08);
      c.closePath();
      c.fill();
      // the neck rises into the hair curtain
      c.beginPath();
      c.moveTo(cx - neckW, H * 0.72);
      c.lineTo(cx - neckW * 0.88, H * 0.5);
      c.quadraticCurveTo(cx, H * 0.46, cx + neckW * 0.88, H * 0.5);
      c.lineTo(cx + neckW, H * 0.72);
      c.closePath();
      c.fill();
    };

    /* ── the hair: a shaggy mass with strands hanging like curtains.
         No skull underneath — the face is an open gap. ───────────── */
    const drawHair = (c: CanvasRenderingContext2D) => {
      const { cx, headR, headCy } = geo();
      c.fillStyle = INK;

      // crown mass: two passes — a soft blurred underlay, then a
      // sharp ragged top — so the edge reads organic, not bubbly
      for (const pass of [0, 1] as const) {
        c.filter = pass === 0 ? "blur(9px)" : "none";
        const count = pass === 0 ? 70 : 220;
        for (let i = 0; i < count; i++) {
          const a = Math.PI * (1.02 + hash(i + pass * 900) * 0.96);
          const dist = headR * (0.08 + hash(i + 130 + pass * 900) * 0.62);
          const bx = cx + Math.cos(a) * dist * 1.16 + (hash(i + 260) - 0.5) * headR * 0.16;
          const by = headCy + Math.sin(a) * dist * 0.78 + (hash(i + 390) - 0.5) * headR * 0.1;
          const r = headR * (0.07 + hash(i + 520 + pass * 300) * 0.12);
          c.beginPath();
          c.arc(bx, by, r, 0, Math.PI * 2);
          c.fill();
        }
        // fine raggedness along the top rim
        if (pass === 1)
          for (let i = 0; i < 90; i++) {
            const a = Math.PI * (1.08 + hash(i + 77) * 0.84);
            const dist = headR * (0.66 + hash(i + 177) * 0.14);
            c.beginPath();
            c.arc(
              cx + Math.cos(a) * dist * 1.16,
              headCy + Math.sin(a) * dist * 0.78,
              headR * (0.02 + hash(i + 277) * 0.05),
              0,
              Math.PI * 2
            );
            c.fill();
          }
      }
      c.filter = "none";

      // hanging strands: a dense curtain of tapered strokes, heavier
      // at the sides, with the reference's bright gap left of centre
      c.strokeStyle = INK;
      c.lineCap = "round";
      for (let i = 0; i < 340; i++) {
        const u = hash(i * 3.7) * 2 - 1; // -1..1 across the face
        const side = Math.sign(u) || 1;
        const xN = side * Math.pow(Math.abs(u), 0.95);
        const gap = Math.exp(-Math.pow((xN + 0.26) / 0.13, 2));
        if (hash(i * 9.1) < gap * 0.75) continue;
        const x0 = cx + xN * headR * 1.12;
        const yTop = headCy + headR * (0.05 - Math.abs(xN) * 0.3);
        const len = headR * (0.5 + hash(i * 5.3) * 0.85) * (0.85 + Math.abs(xN) * 0.4);
        const wander = (hash(i * 7.9) - 0.5) * headR * 0.22;
        const thick = headR * (0.014 + hash(i * 11.3) * 0.02);
        const SEG = 8;
        for (let sgm = 0; sgm < SEG; sgm++) {
          const k0 = sgm / SEG;
          const k1 = (sgm + 1) / SEG;
          const px0 = x0 + Math.sin(k0 * Math.PI * (1 + hash(i) * 1.2)) * wander * k0;
          const py0 = yTop + len * k0;
          const px1 = x0 + Math.sin(k1 * Math.PI * (1 + hash(i) * 1.2)) * wander * k1;
          const py1 = yTop + len * k1;
          c.lineWidth = Math.max(0.5, thick * (1 - k0 * 0.9));
          c.beginPath();
          c.moveTo(px0, py0);
          c.lineTo(px1, py1);
          c.stroke();
        }
      }
    };

    const drawBust = () => {
      const c = bustC.getContext("2d")!;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);
      drawShoulders(c);
      drawHair(c);
    };

    /* ── the smear sources: one photo, pale + crimson ────────────── */
    const buildRed = () => {
      if (!img) return;
      const { cx, headR, headCy } = geo();
      const box = { x: cx - headR * 1.7, y: headCy - headR * 0.8, w: headR * 3.4, h: headR * 4.6 };
      const s = Math.max(box.w / img.width, box.h / img.height);
      const g = grayC.getContext("2d")!;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      g.filter = "grayscale(1) contrast(1.4) brightness(1.5)";
      g.drawImage(img, box.x + (box.w - img.width * s) / 2, box.y + (box.h - img.height * s) / 2, img.width * s, img.height * s);
      g.filter = "none";
      const c = redC.getContext("2d")!;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.globalCompositeOperation = "source-over";
      c.clearRect(0, 0, W, H);
      c.filter = "grayscale(1) contrast(1.3) brightness(1.45)";
      c.drawImage(img, box.x + (box.w - img.width * s) / 2, box.y + (box.h - img.height * s) / 2, img.width * s, img.height * s);
      c.filter = "none";
      c.globalCompositeOperation = "multiply";
      c.fillStyle = "#d92613";
      c.fillRect(box.x, box.y, box.w, box.h);
      c.globalCompositeOperation = "source-over";
    };

    /* ── the drip: red slivers falling from the hairline to the collar ── */
    const buildSmear = (t: number) => {
      const c = smearC.getContext("2d")!;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);
      const { cx, headR, headCy } = geo();
      const x0 = cx - headR * 1.15;
      const x1 = cx + headR * 1.15;
      const yTop = headCy - headR * 0.2;
      const band = headR * 1.9;
      const sw = Math.max(2, Math.round(headR / 30));
      for (let x = x0; x < x1; x += sw) {
        const col = Math.floor(x / sw);
        const n = hash(col * 7.13);
        const xN = (x - cx) / (headR * 1.15);
        const density = 0.92 - Math.abs(xN) * 0.5;
        if (hash(col * 4.9) > density) continue;
        // torn fragments: each sliver samples a random sub-strip and
        // several fall per column, so the smear shreds instead of banding
        const frags = 2 + Math.floor(hash(col * 6.1) * 3);
        for (let fgi = 0; fgi < frags; fgi++) {
          const fn = hash(col * 17.3 + fgi * 57);
          const sy = yTop + fn * band * 0.55;
          const sh = band * (0.08 + hash(col * 23.7 + fgi * 91) * 0.3);
          const drift = Math.sin(t * (0.35 + fn * 0.6) + fn * 40) * headR * 0.14;
          const drop = hash(col * 3.7 + fgi * 13) * headR * 0.9 + drift;
          const stretch = 1 + fn * 0.9 + Math.sin(t * 0.55 + fn * 20) * 0.15;
          c.globalAlpha = 0.3 + n * 0.55;
          const hot = hash(col * 11.3 + fgi * 7 + Math.floor(t * 1.4)) > 0.96;
          if (hot) c.globalAlpha = 0.7;
          c.drawImage(hot ? grayC : redC, x * dpr, sy * dpr, sw * dpr, sh * dpr, x, sy + drop, sw, sh * stretch);
        }
      }
      c.globalAlpha = 1;
      // strongest over the face gap, trailing down the neck — and gone
      // well above the collar so nothing streaks over the shoulders
      c.globalCompositeOperation = "destination-in";
      const g = c.createRadialGradient(cx, headCy + headR * 0.7, headR * 0.3, cx, headCy + headR * 0.7, headR * 1.45);
      g.addColorStop(0, "rgba(255,255,255,0.95)");
      g.addColorStop(0.55, "rgba(255,255,255,0.65)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = "source-over";
    };

    /* ── film grain tiles ────────────────────────────────────────── */
    const buildGrain = () => {
      grainT.length = 0;
      for (let k = 0; k < 3; k++) {
        const tile = document.createElement("canvas");
        tile.width = tile.height = 160;
        const tc = tile.getContext("2d")!;
        const id = tc.createImageData(160, 160);
        for (let i = 0; i < id.data.length; i += 4) {
          const v = Math.floor(Math.random() * 255);
          id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
          id.data[i + 3] = 26; // ~10% grain
        }
        tc.putImageData(id, 0, 0);
        grainT.push(tile);
      }
    };

    let grainIdx = 0;
    const compose = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(bustC, 0, 0, W, H);
      ctx.filter = "blur(0.7px)";
      ctx.drawImage(smearC, 0, 0, W, H);
      ctx.filter = "none";
      // grain over everything, cycling tiles so it crawls like film
      const tile = grainT[grainIdx % grainT.length];
      if (tile) {
        const pat = ctx.createPattern(tile, "repeat")!;
        ctx.fillStyle = pat;
        ctx.fillRect(0, 0, W, H);
      }
    };

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      for (const c of [canvas, bustC, grayC, redC, smearC]) {
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
      }
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      drawBust();
      buildRed();
      buildSmear(performance.now() / 1000);
      compose();
    };
    buildGrain();
    resize();
    window.addEventListener("resize", resize);

    const image = new Image();
    image.src = SMEAR_SRC;
    image.onload = () => {
      img = image;
      buildRed();
      buildSmear(performance.now() / 1000);
      compose();
    };

    /* idle shimmer — drips drift, grain crawls */
    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 1000 / FPS) return;
      last = now;
      if (!img) return;
      grainIdx++;
      buildSmear(now / 1000);
      compose();
    };
    if (!reduced) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        // the silver spotlight room: bright behind the head, black corners
        background:
          "radial-gradient(95% 82% at 52% 34%, #b9b5ae 0%, #8e8a84 30%, #4a4744 58%, #161514 85%)",
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
