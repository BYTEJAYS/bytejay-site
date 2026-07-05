"use client";

/**
 * THE FACE — the album as a portrait, after raviklaassens.com.
 *
 * A dark head-and-shoulders bust fills the screen. Moving the cursor
 * wipes a soft, smoky trail across it, and the album's photos show
 * through the silhouette — stop moving and the trail dissolves back
 * to black. Photos rotate as the cursor keeps travelling.
 *
 * Fully procedural silhouette (canvas 2D, zero extra assets).
 */

import { useEffect, useRef } from "react";
import CustomCursor from "@/components/CustomCursor";

/* bright frames lead — dark ones would vanish against the ink bust */
const PHOTOS = [
  "/album/jay-02.jpg",
  "/album/jay-05.jpg",
  "/album/jay-03.jpg",
  "/album/jay-08.jpg",
  "/album/jay-07.jpg",
  "/album/jay-09.jpg",
  "/album/jay-04.jpg",
  "/album/jay-10.jpg",
  "/album/jay-11.jpg",
  "/album/jay-06.jpg",
  "/album/jay-01.jpg",
];

const BUST = "#0E0B09"; // the silhouette's ink
const TRAVEL_PER_PHOTO = 1000; // px of cursor travel between photo swaps
const XFADE_MS = 650;
const FADE_PER_FRAME = 0.055; // how fast the reveal trail dissolves

function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export default function AlbumFace() {
  const mountRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = mountRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    /* offscreen layers */
    const silC = document.createElement("canvas"); // the dark bust
    const maskC = document.createElement("canvas"); // where the cursor has been
    const tempC = document.createElement("canvas"); // mask ∩ photo, per frame
    const photoC: (HTMLCanvasElement | null)[] = PHOTOS.map(() => null); // bust-masked photos
    const imgs: (HTMLImageElement | null)[] = PHOTOS.map(() => null);

    let W = 0;
    let H = 0;

    /* ── the bust: head, curls, ears, neck, shoulders ─────────────── */
    const drawBust = (c: CanvasRenderingContext2D) => {
      const cx = W / 2;
      const headR = Math.min(W * 0.17, H * 0.21);
      const headCy = H * 0.4;
      const neckW = headR * 0.46;
      const shW = Math.min(W * 0.86, headR * 6.2);

      c.fillStyle = BUST;
      // shoulders sweeping off the bottom of the frame
      c.beginPath();
      c.moveTo(cx - shW / 2, H * 1.1);
      c.bezierCurveTo(cx - shW / 2, H * 0.74, cx - shW * 0.3, H * 0.615, cx - neckW * 1.5, H * 0.585);
      c.lineTo(cx + neckW * 1.5, H * 0.585);
      c.bezierCurveTo(cx + shW * 0.3, H * 0.615, cx + shW / 2, H * 0.74, cx + shW / 2, H * 1.1);
      c.closePath();
      c.fill();
      // neck
      c.fillRect(cx - neckW, headCy + headR * 0.4, neckW * 2, H * 0.62 - (headCy + headR * 0.4) + 4);
      // head
      c.beginPath();
      c.ellipse(cx, headCy, headR, headR * 1.16, 0, 0, Math.PI * 2);
      c.fill();
      // ears
      for (const side of [-1, 1]) {
        c.beginPath();
        c.ellipse(cx + side * headR * 0.98, headCy + headR * 0.08, headR * 0.13, headR * 0.22, 0, 0, Math.PI * 2);
        c.fill();
      }
      // the curls: a deterministic cloud of blobs over the crown
      for (let i = 0; i < 110; i++) {
        const a = Math.PI * (1.06 + hash(i) * 0.88); // top hemisphere, canvas angles
        const dist = headR * (0.62 + hash(i + 200) * 0.52);
        const bx = cx + Math.cos(a) * dist * 1.06;
        const by = headCy + Math.sin(a) * dist * 1.12 - headR * 0.12;
        const r = headR * (0.14 + hash(i + 400) * 0.24);
        c.beginPath();
        c.arc(bx, by, r, 0, Math.PI * 2);
        c.fill();
      }
      // a few curls dropping over the forehead sides
      for (let i = 0; i < 14; i++) {
        const side = i % 2 ? 1 : -1;
        const bx = cx + side * headR * (0.55 + hash(i + 600) * 0.5);
        const by = headCy - headR * (0.55 + hash(i + 700) * 0.35);
        c.beginPath();
        c.arc(bx, by, headR * (0.12 + hash(i + 800) * 0.14), 0, Math.PI * 2);
        c.fill();
      }
    };

    /* photo, cover-fitted over the bust's core and clipped to it */
    const buildPhoto = (i: number) => {
      const img = imgs[i];
      if (!img || photoC[i]) return;
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const cc = c.getContext("2d")!;
      cc.drawImage(silC, 0, 0, W, H);
      cc.globalCompositeOperation = "source-in";
      cc.filter = "brightness(1.35) contrast(1.05) saturate(1.08)";
      const box = { x: W * 0.1, y: H * 0.08, w: W * 0.8, h: H * 1.02 };
      const s = Math.max(box.w / img.width, box.h / img.height);
      const dw = img.width * s;
      const dh = img.height * s;
      cc.drawImage(img, box.x + (box.w - dw) / 2, box.y + (box.h - dh) / 2, dw, dh);
      cc.filter = "none";
      photoC[i] = c;
    };

    const resize = () => {
      W = Math.round(window.innerWidth * dpr) / dpr;
      H = Math.round(window.innerHeight * dpr) / dpr;
      for (const c of [canvas, silC, maskC, tempC]) {
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
      }
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      for (const c of [silC, maskC, tempC]) c.getContext("2d")!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawBust(silC.getContext("2d")!);
      photoC.fill(null);
      imgs.forEach((_, i) => buildPhoto(i));
    };
    resize();
    window.addEventListener("resize", resize);

    /* preload the album */
    imgs.forEach((_, i) => {
      const img = new Image();
      img.src = PHOTOS[i];
      img.onload = () => {
        imgs[i] = img;
        buildPhoto(i);
      };
    });

    /* ── the reveal trail ─────────────────────────────────────────── */
    const maskCtx = maskC.getContext("2d")!;
    const tempCtx = tempC.getContext("2d")!;
    const pen = { x: -1, y: -1, has: false };
    let travel = 0;
    let cur = 0;
    let nxt = -1; // photo crossfading in, -1 = none
    let xfadeAt = 0;

    const stamp = (x: number, y: number, drag: number) => {
      const base = Math.min(175, 95 + drag * 0.4);
      const blob = (bx: number, by: number, r: number, a: number) => {
        const g = maskCtx.createRadialGradient(bx, by, r * 0.1, bx, by, r);
        g.addColorStop(0, `rgba(255,255,255,${a})`);
        g.addColorStop(0.65, `rgba(255,255,255,${a * 0.4})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        maskCtx.fillStyle = g;
        maskCtx.beginPath();
        maskCtx.arc(bx, by, r, 0, Math.PI * 2);
        maskCtx.fill();
      };
      blob(x, y, base, 0.92);
      // ragged smoky edge: a few jittered side-puffs
      for (let i = 0; i < 3; i++) {
        blob(
          x + (Math.random() - 0.5) * base * 1.5,
          y + (Math.random() - 0.5) * base * 1.5,
          base * (0.3 + Math.random() * 0.4),
          0.42
        );
      }
    };

    const onMove = (x: number, y: number) => {
      if (!pen.has) {
        pen.x = x;
        pen.y = y;
        pen.has = true;
        return;
      }
      const dx = x - pen.x;
      const dy = y - pen.y;
      const d = Math.hypot(dx, dy);
      // stamp along the path so fast moves stay continuous
      const steps = Math.max(1, Math.min(14, Math.floor(d / 14)));
      for (let s = 1; s <= steps; s++) stamp(pen.x + (dx * s) / steps, pen.y + (dy * s) / steps, d);
      pen.x = x;
      pen.y = y;
      travel += d;
      if (travel > TRAVEL_PER_PHOTO && nxt === -1) {
        travel = 0;
        nxt = (cur + 1) % PHOTOS.length;
        xfadeAt = performance.now();
      }
    };
    const onPointer = (e: PointerEvent) => onMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onMove(t.clientX, t.clientY);
    };
    window.addEventListener("pointermove", onPointer);
    window.addEventListener("touchmove", onTouch, { passive: true });

    /* ── compose ──────────────────────────────────────────────────── */
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      // the trail dissolves a little every frame
      maskCtx.globalCompositeOperation = "destination-out";
      maskCtx.fillStyle = `rgba(0,0,0,${FADE_PER_FRAME})`;
      maskCtx.fillRect(0, 0, W, H);
      maskCtx.globalCompositeOperation = "source-over";

      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(silC, 0, 0, W, H);

      const a = photoC[cur];
      if (a) {
        tempCtx.clearRect(0, 0, W, H);
        tempCtx.globalAlpha = 1;
        tempCtx.globalCompositeOperation = "source-over";
        tempCtx.drawImage(maskC, 0, 0, W, H);
        tempCtx.globalCompositeOperation = "source-in";
        tempCtx.drawImage(a, 0, 0, W, H);
        if (nxt !== -1) {
          const b = photoC[nxt];
          const k = Math.min(1, (performance.now() - xfadeAt) / XFADE_MS);
          if (b) {
            tempCtx.globalCompositeOperation = "source-atop";
            tempCtx.globalAlpha = k;
            tempCtx.drawImage(b, 0, 0, W, H);
            tempCtx.globalAlpha = 1;
          }
          if (k >= 1) {
            cur = nxt;
            nxt = -1;
          }
        }
        ctx.drawImage(tempC, 0, 0, W, H);
      }
    };

    if (reduced) {
      // no trail: a calm static reveal across the chest
      const g = maskCtx.createRadialGradient(W / 2, H * 0.42, 40, W / 2, H * 0.42, Math.min(W, H) * 0.34);
      g.addColorStop(0, "rgba(255,255,255,0.9)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      maskCtx.fillStyle = g;
      maskCtx.fillRect(0, 0, W, H);
      const still = () => {
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(silC, 0, 0, W, H);
        const a = photoC[0];
        if (a) {
          tempCtx.clearRect(0, 0, W, H);
          tempCtx.drawImage(maskC, 0, 0, W, H);
          tempCtx.globalCompositeOperation = "source-in";
          tempCtx.drawImage(a, 0, 0, W, H);
          tempCtx.globalCompositeOperation = "source-over";
          ctx.drawImage(tempC, 0, 0, W, H);
        } else setTimeout(still, 200);
      };
      still();
    } else {
      frame();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("touchmove", onTouch);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 touch-none overflow-clip bg-[#131110]"
      style={{
        backgroundImage:
          "radial-gradient(115% 80% at 50% 30%, #57504a 0%, #2b2724 44%, #131110 78%)",
      }}
    >
      <CustomCursor dark />

      {/* the portrait */}
      <canvas ref={mountRef} className="absolute inset-0" />

      {/* name over the chest, like the reference */}
      <div className="pointer-events-none absolute inset-x-0 top-[64vh] z-10 px-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cream/45">
          bytejay — photo log
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-cream/90 sm:text-5xl">
          The Album
        </h1>
        <p className="mt-4 font-hand text-xl text-cream/50">
          move your cursor — the pictures live inside ✦
        </p>
      </div>

      {/* nav */}
      <div className="absolute inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5">
        <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-cream/40">
          album / {String(PHOTOS.length).padStart(2, "0")} frames
        </span>
        <a
          href="/"
          className="rounded-full border border-cream/15 bg-cream/5 px-4 py-1.5 text-sm text-cream/70 backdrop-blur-md transition-colors hover:text-cream"
        >
          ← home
        </a>
      </div>
    </div>
  );
}
