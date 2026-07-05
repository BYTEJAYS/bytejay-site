"use client";

/**
 * The idle portrait for the album page — the raviklaassens.com
 * character, rebuilt for real this time: a Blender-rendered bust
 * (defined head, short messy hair, crew-neck tee, red-lit neck,
 * silver studio backdrop) with the animated red particle smear
 * eating across the face, plus crawling film grain.
 *
 * AlbumClient fades the whole thing out while the photo trail is
 * live and brings it back on idle.
 */

import { useEffect, useRef } from "react";

const PORTRAIT_SRC = "/album/bust-portrait.jpg";
const SMEAR_SRC = "/album/jay-02.jpg";
const FPS = 12;
// where the face sits inside the portrait render (fractions of image)
const FACE = { x: 0.5, y: 0.31, r: 0.16 }; // r = head radius / image width

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

    const figC = document.createElement("canvas"); // portrait, cover-fit
    const maskC = document.createElement("canvas"); // figure-only alpha mask
    const grayC = document.createElement("canvas"); // pale smear source
    const redC = document.createElement("canvas"); // crimson smear source
    const smearC = document.createElement("canvas"); // the animated red layer
    const grainT: HTMLCanvasElement[] = [];
    let W = 0;
    let H = 0;
    let portrait: HTMLImageElement | null = null;
    let smearImg: HTMLImageElement | null = null;

    /* cover-fit the portrait, anchoring the head at ~1/3 height */
    const fit = () => {
      if (!portrait) return null;
      const scale = Math.max(W / portrait.width, (H * 0.9) / portrait.height);
      const dw = portrait.width * scale;
      const dh = portrait.height * scale;
      const dx = (W - dw) / 2;
      // put the face at 30% of the viewport height
      const dy = H * 0.3 - FACE.y * dh;
      return { dx, dy: Math.min(0, dy), dw, dh };
    };

    const geo = () => {
      const r = fit();
      if (!r) return { cx: W / 2, cy: H * 0.3, headR: Math.min(W, H) * 0.16 };
      return { cx: r.dx + r.dw / 2, cy: r.dy + FACE.y * r.dh, headR: FACE.r * r.dw };
    };

    const drawFigure = () => {
      const r = fit();
      if (!r) return;
      const c = figC.getContext("2d")!;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);
      c.drawImage(portrait!, r.dx, r.dy, r.dw, r.dh);
      // extend the render's own backdrop to any uncovered edges
      c.globalCompositeOperation = "destination-over";
      const edge = c.createRadialGradient(W * 0.52, H * 0.34, 40, W * 0.52, H * 0.34, Math.max(W, H));
      edge.addColorStop(0, "#b9b5ae");
      edge.addColorStop(0.55, "#4a4744");
      edge.addColorStop(1, "#111010");
      c.fillStyle = edge;
      c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = "source-over";
    };

    /* figure mask from luminance: the render is silver bg / near-black
       figure, so a threshold separates them cleanly */
    const buildMask = () => {
      const mc = maskC.getContext("2d")!;
      mc.setTransform(dpr, 0, 0, dpr, 0, 0);
      mc.clearRect(0, 0, W, H);
      mc.drawImage(figC, 0, 0, W, H);
      const id = mc.getImageData(0, 0, maskC.width, maskC.height);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        const lum = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
        // soft ramp: fully figure below 60, fully background above 110
        const a = lum <= 60 ? 255 : lum >= 110 ? 0 : Math.round(255 * (1 - (lum - 60) / 50));
        d[i] = d[i + 1] = d[i + 2] = 255;
        d[i + 3] = a;
      }
      mc.putImageData(id, 0, 0);
    };

    const buildRed = () => {
      if (!smearImg) return;
      const { cx, cy, headR } = geo();
      const box = { x: cx - headR * 1.7, y: cy - headR * 1.2, w: headR * 3.4, h: headR * 4.2 };
      const s = Math.max(box.w / smearImg.width, box.h / smearImg.height);
      const g = grayC.getContext("2d")!;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      g.filter = "grayscale(1) contrast(1.4) brightness(1.5)";
      g.drawImage(smearImg, box.x + (box.w - smearImg.width * s) / 2, box.y + (box.h - smearImg.height * s) / 2, smearImg.width * s, smearImg.height * s);
      g.filter = "none";
      const c = redC.getContext("2d")!;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.globalCompositeOperation = "source-over";
      c.clearRect(0, 0, W, H);
      c.filter = "grayscale(1) contrast(1.3) brightness(1.5)";
      c.drawImage(smearImg, box.x + (box.w - smearImg.width * s) / 2, box.y + (box.h - smearImg.height * s) / 2, smearImg.width * s, smearImg.height * s);
      c.filter = "none";
      c.globalCompositeOperation = "multiply";
      c.fillStyle = "#dc2412";
      c.fillRect(box.x, box.y, box.w, box.h);
      c.globalCompositeOperation = "source-over";
    };

    /* the torn patch eating across the face — feathered fragments,
       clustered around the cheeks/mouth, trailing down the neck */
    const buildSmear = (t: number) => {
      const c = smearC.getContext("2d")!;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);
      const { cx, cy, headR } = geo();
      const x0 = cx - headR * 1.2;
      const x1 = cx + headR * 1.2;
      const yTop = cy - headR * 0.55;
      const band = headR * 2.1;
      const sw = Math.max(2, Math.round(headR / 34));
      for (let x = x0; x < x1; x += sw) {
        const col = Math.floor(x / sw);
        const n = hash(col * 7.13);
        const xN = (x - cx) / (headR * 1.2);
        const density = 0.95 - Math.abs(xN + 0.1) * 0.55;
        if (hash(col * 4.9) > density) continue;
        const frags = 2 + Math.floor(hash(col * 6.1) * 3);
        for (let fgi = 0; fgi < frags; fgi++) {
          const fn = hash(col * 17.3 + fgi * 57);
          const sy = yTop + fn * band * 0.6;
          const sh = band * (0.06 + hash(col * 23.7 + fgi * 91) * 0.24);
          const drift = Math.sin(t * (0.35 + fn * 0.6) + fn * 40) * headR * 0.12;
          const drop = hash(col * 3.7 + fgi * 13) * headR * 0.7 + drift;
          const stretch = 1 + fn * 0.8 + Math.sin(t * 0.55 + fn * 20) * 0.12;
          c.globalAlpha = 0.32 + n * 0.58;
          const hot = hash(col * 11.3 + fgi * 7 + Math.floor(t * 1.4)) > 0.96;
          if (hot) c.globalAlpha = 0.7;
          c.drawImage(hot ? grayC : redC, x * dpr, sy * dpr, sw * dpr, sh * dpr, x, sy + drop, sw, sh * stretch);
        }
      }
      c.globalAlpha = 1;
      // feathered containment: the cheeks-to-neck region
      c.globalCompositeOperation = "destination-in";
      const g = c.createRadialGradient(cx - headR * 0.15, cy + headR * 0.35, headR * 0.25, cx - headR * 0.15, cy + headR * 0.35, headR * 1.8);
      g.addColorStop(0, "rgba(255,255,255,0.95)");
      g.addColorStop(0.5, "rgba(255,255,255,0.7)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, W, H);
      // and never off the figure — the luminance mask keeps it on him
      c.drawImage(maskC, 0, 0, W, H);
      c.globalCompositeOperation = "source-over";
    };

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
          id.data[i + 3] = 22;
        }
        tc.putImageData(id, 0, 0);
        grainT.push(tile);
      }
    };

    let grainIdx = 0;
    const compose = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(figC, 0, 0, W, H);
      ctx.filter = "blur(0.7px)";
      ctx.drawImage(smearC, 0, 0, W, H);
      ctx.filter = "none";
      const tile = grainT[grainIdx % grainT.length];
      if (tile) {
        const pat = ctx.createPattern(tile, "repeat")!;
        ctx.fillStyle = pat;
        ctx.fillRect(0, 0, W, H);
      }
    };

    const rebuild = () => {
      drawFigure();
      buildMask();
      buildRed();
      buildSmear(performance.now() / 1000);
      compose();
    };

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      for (const c of [canvas, figC, maskC, grayC, redC, smearC]) {
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
      }
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      if (portrait) rebuild();
    };
    buildGrain();
    resize();
    window.addEventListener("resize", resize);

    const pImg = new Image();
    pImg.src = PORTRAIT_SRC;
    pImg.onload = () => {
      portrait = pImg;
      rebuild();
    };
    const sImg = new Image();
    sImg.src = SMEAR_SRC;
    sImg.onload = () => {
      smearImg = sImg;
      if (portrait) rebuild();
    };

    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 1000 / FPS) return;
      last = now;
      if (!portrait || !smearImg) return;
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
    <div aria-hidden className="absolute inset-0 bg-[#131110]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
