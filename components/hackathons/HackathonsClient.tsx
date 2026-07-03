"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/*
 * The playground — Jay's hackathon badge collection on an endless
 * draggable plane (à la yutaabe.com). Every slot is a 3D card
 * turning on its own: one real badge so far, twenty numbered
 * placeholders waiting for the hackathons to come. Click the real
 * one to inspect it up close.
 */

type Badge = {
  id: string;
  name: string;
  title: string; // the one line under the name
  front: string;
  back: string;
};

const BADGES: Badge[] = [
  {
    id: "idea20",
    name: "IDEA 2.0",
    title: "FINALIST",
    front: "/badges/idea20-front.jpg",
    back: "/badges/idea20-back.jpg",
  },
];

const TOTAL_SLOTS = 21; // 1 real + 20 waiting

const COLS = 7;
const ROWS = 3;
const CW = 360; // cell size
const CH = 440;
const PW = CW * COLS;
const PH = CH * ROWS;
const CARD_W = 200;
const CARD_H = Math.round(CARD_W * 1.586);
const DRIFT = { x: -14, y: -9 }; // px/s, endless idle motion

/* ── the close-up viewer: drag to spin, momentum included ──────── */

function BadgeViewer({ badge, onClose }: { badge: Badge; onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rot = useRef({ x: 0, y: -24 });
  const vel = useRef(0);
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0, t: 0 });
  const lastInput = useRef(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!dragging.current) {
        rot.current.y += vel.current * dt;
        vel.current *= Math.pow(0.02, dt);
        rot.current.x += (0 - rot.current.x) * Math.min(1, dt * 4);
        if (!reduceMotion && Math.abs(vel.current) < 16 && now - lastInput.current > 2200) {
          vel.current = 16 * Math.sign(vel.current || -1);
        }
      }
      if (cardRef.current) {
        cardRef.current.style.transform = `rotateX(${rot.current.x}deg) rotateY(${rot.current.y}deg)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="cursor-grab touch-none select-none active:cursor-grabbing"
        style={{ perspective: 1400 }}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => {
          dragging.current = true;
          vel.current = 0;
          lastPointer.current = { x: e.clientX, y: e.clientY, t: performance.now() };
          lastInput.current = performance.now();
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          const dx = e.clientX - lastPointer.current.x;
          const dy = e.clientY - lastPointer.current.y;
          const dt = Math.max(1, performance.now() - lastPointer.current.t);
          rot.current.y += dx * 0.55;
          rot.current.x = Math.max(-32, Math.min(32, rot.current.x - dy * 0.25));
          vel.current = (dx / dt) * 1000 * 0.55;
          lastPointer.current = { x: e.clientX, y: e.clientY, t: performance.now() };
          lastInput.current = performance.now();
        }}
        onPointerUp={() => {
          dragging.current = false;
          lastInput.current = performance.now();
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      >
        <div
          ref={cardRef}
          className="relative h-[min(62vh,540px)] w-[calc(min(62vh,540px)/1.586)] will-change-transform"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="absolute inset-0 rounded-[18px] bg-[#D9D4C8]" />
          <div
            className="absolute inset-0 overflow-hidden rounded-[18px] shadow-[0_30px_70px_rgba(0,0,0,0.55)]"
            style={{ backfaceVisibility: "hidden", transform: "translateZ(1.6px)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={badge.front} alt={`${badge.name} badge — front`} className="h-full w-full object-cover" draggable={false} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/10" />
          </div>
          <div
            className="absolute inset-0 overflow-hidden rounded-[18px]"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg) translateZ(1.6px)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={badge.back} alt={`${badge.name} badge — back`} className="h-full w-full object-cover" draggable={false} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-bl from-white/25 via-transparent to-black/10" />
          </div>
        </div>
      </motion.div>
      <div className="pointer-events-none mt-8 text-center">
        <p className="font-display text-3xl font-bold tracking-tight text-cream">{badge.name}</p>
        <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.3em] text-accent">{badge.title}</p>
      </div>
      <p className="pointer-events-none mt-4 font-mono text-[9px] uppercase tracking-[0.25em] text-cream/35">
        drag to spin — click outside to close
      </p>
    </motion.div>
  );
}

/* ── the endless plane of turning cards ─────────────────────────── */

export default function HackathonsClient() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const copyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pos = useRef({ x: 0, y: 0 });
  const vel = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0, t: 0 });
  const moved = useRef(0);
  const travelled = useRef(0);

  const [copies, setCopies] = useState({ nx: 1, ny: 1, scale: 1 });
  const [open, setOpen] = useState<Badge | null>(null);
  const [drift, setDrift] = useState("000");

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const fit = () => {
      const scale = window.innerWidth < 640 ? 0.72 : 1;
      setCopies({
        nx: Math.ceil(window.innerWidth / (PW * scale)) + 1,
        ny: Math.ceil(window.innerHeight / (PH * scale)) + 1,
        scale,
      });
    };
    fit();
    window.addEventListener("resize", fit);

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!dragging.current) {
        if (!reduceMotion) {
          pos.current.x += DRIFT.x * dt;
          pos.current.y += DRIFT.y * dt;
        }
        pos.current.x += vel.current.x * dt;
        pos.current.y += vel.current.y * dt;
        travelled.current +=
          Math.hypot(vel.current.x, vel.current.y) * dt +
          (reduceMotion ? 0 : Math.hypot(DRIFT.x, DRIFT.y) * dt);
        const decay = Math.pow(0.0045, dt);
        vel.current.x *= decay;
        vel.current.y *= decay;
      }
      const s = el.dataset.scale ? Number(el.dataset.scale) : 1;
      const pw = PW * s;
      const ph = PH * s;
      const bx = ((pos.current.x % pw) + pw) % pw - pw;
      const by = ((pos.current.y % ph) + ph) % ph - ph;
      copyRefs.current.forEach((copy) => {
        if (!copy) return;
        const i = Number(copy.dataset.ix);
        const j = Number(copy.dataset.iy);
        copy.style.transform = `translate3d(${bx + i * pw}px, ${by + j * ph}px, 0) scale(${s})`;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const hudTimer = setInterval(() => {
      setDrift(String(Math.round(travelled.current / 100)).padStart(3, "0"));
    }, 500);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(hudTimer);
      window.removeEventListener("resize", fit);
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    moved.current = 0;
    vel.current = { x: 0, y: 0 };
    lastPointer.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    const dt = Math.max(1, performance.now() - lastPointer.current.t);
    pos.current.x += dx;
    pos.current.y += dy;
    travelled.current += Math.hypot(dx, dy);
    moved.current += Math.abs(dx) + Math.abs(dy);
    vel.current = { x: (dx / dt) * 1000, y: (dy / dt) * 1000 };
    lastPointer.current = { x: e.clientX, y: e.clientY, t: performance.now() };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    // pointer capture retargets clicks, so taps are resolved by hand
    if (moved.current > 8) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const tile = el?.closest<HTMLElement>("[data-badge-id]");
    if (tile) {
      const b = BADGES.find((bd) => bd.id === tile.dataset.badgeId);
      if (b) setOpen(b);
    }
  };
  const onWheel = (e: React.WheelEvent) => {
    pos.current.x -= e.deltaX;
    pos.current.y -= e.deltaY;
    travelled.current += Math.hypot(e.deltaX, e.deltaY);
  };

  /* one repeating pattern copy: 21 turning cards */
  const renderPattern = () =>
    Array.from({ length: TOTAL_SLOTS }, (_, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const dx = 55 + ((i * 53) % 70);
      const dy = 26 + ((i * 97) % 60);
      const badge = i < BADGES.length ? BADGES[i] : null;
      const turn = {
        animationDelay: `${-(i * 1.35)}s`,
        animationDuration: `${8 + (i % 5)}s`,
      };
      return (
        <div
          key={i}
          className="absolute"
          style={{ left: col * CW + dx, top: row * CH + dy, width: CARD_W }}
        >
          <div style={{ perspective: 900 }}>
            <div
              className="card-turn relative will-change-transform"
              style={{ width: CARD_W, height: CARD_H, ...turn }}
              data-badge-id={badge?.id}
            >
              {badge ? (
                <>
                  <div
                    className="absolute inset-0 overflow-hidden rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
                    style={{ backfaceVisibility: "hidden", transform: "translateZ(1px)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={badge.front} alt={`${badge.name} — front`} className="h-full w-full object-cover" draggable={false} />
                  </div>
                  <div
                    className="absolute inset-0 overflow-hidden rounded-xl"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg) translateZ(1px)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={badge.back} alt={`${badge.name} — back`} className="h-full w-full object-cover" draggable={false} />
                  </div>
                </>
              ) : (
                [0, 180].map((face) => (
                  <div
                    key={face}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-cream/20 bg-white/[0.03]"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: `rotateY(${face}deg) translateZ(1px)`,
                    }}
                  >
                    <p className="font-display text-4xl font-bold text-cream/15">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-cream/25">
                      awaiting badge
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
          {badge && (
            <div className="pointer-events-none mt-4 text-center">
              <p className="font-display text-lg font-bold tracking-tight text-cream">
                {badge.name}
              </p>
              <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.3em] text-accent">
                {badge.title}
              </p>
            </div>
          )}
        </div>
      );
    });

  const copyList = [];
  for (let i = 0; i < copies.nx + 1; i++)
    for (let j = 0; j < copies.ny + 1; j++) copyList.push([i, j] as const);

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#0E0D0C] text-cream">
      {/* the plane */}
      <div
        ref={wrapRef}
        data-scale={copies.scale}
        data-cursor-label="drag ✦"
        className="absolute inset-0 cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        {copyList.map(([i, j]) => (
          <div
            key={`${i}-${j}`}
            ref={(el) => {
              copyRefs.current[i * (copies.ny + 1) + j] = el;
            }}
            data-ix={i}
            data-iy={j}
            className="absolute left-0 top-0 origin-top-left will-change-transform"
            style={{ width: PW, height: PH }}
          >
            {renderPattern()}
          </div>
        ))}
      </div>

      {/* vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55))]" />

      {/* chrome */}
      <Link
        href="/"
        className="absolute left-5 top-5 z-20 font-mono text-[10px] uppercase tracking-[0.22em] text-cream/50 transition-colors hover:text-accent"
      >
        ← bytejay
      </Link>
      <div className="pointer-events-none absolute bottom-6 left-5 z-20">
        <p className="font-display text-xl font-bold tracking-tight text-cream">
          <span className="text-accent">/</span> HACKATHONS
        </p>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.25em] text-cream/40">
          the badge collection — drag anywhere, click a badge
        </p>
      </div>
      <div className="pointer-events-none absolute bottom-6 right-5 z-20 space-y-1 text-right font-mono text-[9px] uppercase tracking-[0.25em] text-cream/40">
        <p>
          drift <span className="text-cream/80">{drift}</span>
        </p>
        <p>
          collected <span className="text-cream/80">{String(BADGES.length).padStart(2, "0")}</span>
          <span>/{TOTAL_SLOTS}</span>
        </p>
      </div>

      {/* close-up viewer */}
      <AnimatePresence>
        {open && <BadgeViewer badge={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </main>
  );
}
