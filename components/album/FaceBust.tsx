"use client";

/**
 * The idle portrait for the album page — a procedurally drawn
 * head-and-shoulders bust (after raviklaassens.com) in a spotlit room.
 * Purely decorative: AlbumClient fades the whole thing out while the
 * photo trail is live and brings it back on idle.
 */

import { useEffect, useRef } from "react";

const BUST = "#0E0B09";

function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export default function FaceBust() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const draw = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const headR = Math.min(W * 0.17, H * 0.21);
      const headCy = H * 0.4;
      const neckW = headR * 0.46;
      const shW = Math.min(W * 0.86, headR * 6.2);

      ctx.fillStyle = BUST;
      // shoulders sweeping off the bottom of the frame
      ctx.beginPath();
      ctx.moveTo(cx - shW / 2, H * 1.1);
      ctx.bezierCurveTo(cx - shW / 2, H * 0.74, cx - shW * 0.3, H * 0.615, cx - neckW * 1.5, H * 0.585);
      ctx.lineTo(cx + neckW * 1.5, H * 0.585);
      ctx.bezierCurveTo(cx + shW * 0.3, H * 0.615, cx + shW / 2, H * 0.74, cx + shW / 2, H * 1.1);
      ctx.closePath();
      ctx.fill();
      // neck
      ctx.fillRect(cx - neckW, headCy + headR * 0.4, neckW * 2, H * 0.62 - (headCy + headR * 0.4) + 4);
      // head
      ctx.beginPath();
      ctx.ellipse(cx, headCy, headR, headR * 1.16, 0, 0, Math.PI * 2);
      ctx.fill();
      // ears
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(cx + side * headR * 0.98, headCy + headR * 0.08, headR * 0.13, headR * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // the curls: a deterministic cloud of blobs over the crown
      for (let i = 0; i < 110; i++) {
        const a = Math.PI * (1.06 + hash(i) * 0.88);
        const dist = headR * (0.62 + hash(i + 200) * 0.52);
        const bx = cx + Math.cos(a) * dist * 1.06;
        const by = headCy + Math.sin(a) * dist * 1.12 - headR * 0.12;
        const r = headR * (0.14 + hash(i + 400) * 0.24);
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // a few curls dropping over the forehead sides
      for (let i = 0; i < 14; i++) {
        const side = i % 2 ? 1 : -1;
        const bx = cx + side * headR * (0.55 + hash(i + 600) * 0.5);
        const by = headCy - headR * (0.55 + hash(i + 700) * 0.35);
        ctx.beginPath();
        ctx.arc(bx, by, headR * (0.12 + hash(i + 800) * 0.14), 0, Math.PI * 2);
        ctx.fill();
      }
    };
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
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
