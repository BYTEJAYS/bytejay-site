"use client";

/**
 * The idle portrait for the album page — a head-and-shoulders bust
 * after raviklaassens.com, complete with its signature: a red,
 * vertically-smeared glitch texture living on the face. Built from
 * one album photo, red-tinted and pixel-stretched; it shimmers slowly
 * while the page is idle. AlbumClient fades the whole thing out when
 * the photo trail comes alive.
 */

import { useEffect, useRef } from "react";

const BUST = "#0E0B09";
const SMEAR_SRC = "/album/jay-02.jpg";
const SMEAR_FPS = 12;

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

    const silC = document.createElement("canvas"); // the ink bust
    const grayC = document.createElement("canvas"); // grayscale source photo
    const redC = document.createElement("canvas"); // …multiplied crimson
    const smearC = document.createElement("canvas"); // the sliced glitch layer
    let W = 0;
    let H = 0;
    let img: HTMLImageElement | null = null;

    /* geometry shared by every layer */
    const geo = () => {
      const headR = Math.min(W * 0.17, H * 0.21);
      return { cx: W / 2, headR, headCy: H * 0.4 };
    };

    const drawBust = () => {
      const c = silC.getContext("2d")!;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);
      const { cx, headR, headCy } = geo();
      const neckW = headR * 0.46;
      const shW = Math.min(W * 0.86, headR * 6.2);

      c.fillStyle = BUST;
      c.beginPath();
      c.moveTo(cx - shW / 2, H * 1.1);
      c.bezierCurveTo(cx - shW / 2, H * 0.74, cx - shW * 0.3, H * 0.615, cx - neckW * 1.5, H * 0.585);
      c.lineTo(cx + neckW * 1.5, H * 0.585);
      c.bezierCurveTo(cx + shW * 0.3, H * 0.615, cx + shW / 2, H * 0.74, cx + shW / 2, H * 1.1);
      c.closePath();
      c.fill();
      c.fillRect(cx - neckW, headCy + headR * 0.4, neckW * 2, H * 0.62 - (headCy + headR * 0.4) + 4);
      c.beginPath();
      c.ellipse(cx, headCy, headR, headR * 1.16, 0, 0, Math.PI * 2);
      c.fill();
      for (const side of [-1, 1]) {
        c.beginPath();
        c.ellipse(cx + side * headR * 0.98, headCy + headR * 0.08, headR * 0.13, headR * 0.22, 0, 0, Math.PI * 2);
        c.fill();
      }
      for (let i = 0; i < 110; i++) {
        const a = Math.PI * (1.06 + hash(i) * 0.88);
        const dist = headR * (0.62 + hash(i + 200) * 0.52);
        const bx = cx + Math.cos(a) * dist * 1.06;
        const by = headCy + Math.sin(a) * dist * 1.12 - headR * 0.12;
        c.beginPath();
        c.arc(bx, by, headR * (0.14 + hash(i + 400) * 0.24), 0, Math.PI * 2);
        c.fill();
      }
      for (let i = 0; i < 14; i++) {
        const side = i % 2 ? 1 : -1;
        const bx = cx + side * headR * (0.55 + hash(i + 600) * 0.5);
        const by = headCy - headR * (0.55 + hash(i + 700) * 0.35);
        c.beginPath();
        c.arc(bx, by, headR * (0.12 + hash(i + 800) * 0.14), 0, Math.PI * 2);
        c.fill();
      }
    };

    /* the photo, graded once — slices get cut from these */
    const buildRed = () => {
      if (!img) return;
      const { cx, headR, headCy } = geo();
      const box = { x: cx - headR * 1.9, y: headCy - headR * 2.1, w: headR * 3.8, h: headR * 4.4 };
      const s = Math.max(box.w / img.width, box.h / img.height);
      // pale silver pass — the glinting highlight slivers
      const g = grayC.getContext("2d")!;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      g.filter = "grayscale(1) contrast(1.4) brightness(1.5)";
      g.drawImage(img, box.x + (box.w - img.width * s) / 2, box.y + (box.h - img.height * s) / 2, img.width * s, img.height * s);
      g.filter = "none";
      // crimson pass — grayscale multiplied down into ravi red
      const c = redC.getContext("2d")!;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.globalCompositeOperation = "source-over";
      c.clearRect(0, 0, W, H);
      c.filter = "grayscale(1) contrast(1.3) brightness(1.45)";
      c.drawImage(img, box.x + (box.w - img.width * s) / 2, box.y + (box.h - img.height * s) / 2, img.width * s, img.height * s);
      c.filter = "none";
      c.globalCompositeOperation = "multiply";
      c.fillStyle = "#e22614";
      c.fillRect(box.x, box.y, box.w, box.h);
      c.globalCompositeOperation = "source-over";
    };

    /* one shimmer pass: cut vertical slivers with drifting offsets,
       then keep only what falls on the face/hair — ravi's red smear */
    const buildSmear = (t: number) => {
      const c = smearC.getContext("2d")!;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);
      const { cx, headR, headCy } = geo();
      const x0 = cx - headR * 1.5;
      const x1 = cx + headR * 1.5;
      const yTop = headCy - headR * 1.9;
      const band = headR * 3.4;
      const sw = Math.max(2, Math.round(headR / 34)); // sliver width
      for (let x = x0; x < x1; x += sw) {
        const n = hash(Math.floor(x / sw) * 7.13) ;
        const drift = Math.sin(t * (0.4 + n * 0.7) + n * 40) * headR * 0.22;
        const drop = (hash(Math.floor(x / sw) * 3.7) - 0.2) * headR * 0.85 + drift;
        const stretch = 1 + n * 1.6 + Math.sin(t * 0.6 + n * 20) * 0.25;
        c.globalAlpha = 0.3 + n * 0.6;
        // occasional pale slice, like a scanline catching light
        const hot = hash(Math.floor(x / sw) * 11.3 + Math.floor(t * 1.5)) > 0.94;
        if (hot) c.globalAlpha = 0.85;
        c.drawImage(hot ? grayC : redC, x * dpr, yTop * dpr, sw * dpr, band * dpr, x, yTop + drop, sw, band * stretch);
      }
      c.globalAlpha = 1;
      // confine the smear to the face and hair, fading at the fringes
      c.globalCompositeOperation = "destination-in";
      const g = c.createRadialGradient(cx, headCy - headR * 0.15, headR * 0.2, cx, headCy - headR * 0.15, headR * 1.75);
      g.addColorStop(0, "rgba(255,255,255,0.95)");
      g.addColorStop(0.55, "rgba(255,255,255,0.75)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, W, H);
      // and strictly inside the silhouette
      c.drawImage(silC, 0, 0, W, H);
      c.globalCompositeOperation = "source-over";
    };

    const compose = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(silC, 0, 0, W, H);
      ctx.drawImage(smearC, 0, 0, W, H);
    };

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      for (const c of [canvas, silC, grayC, redC, smearC]) {
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

    /* idle shimmer, gently — the character breathes red */
    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 1000 / SMEAR_FPS) return;
      last = now;
      if (!img) return;
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
        background:
          "radial-gradient(115% 80% at 50% 30%, #57504a 0%, #2b2724 44%, rgba(19,17,16,0) 78%)",
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
