"use client";

import { useEffect, useRef } from "react";
import CustomCursor from "@/components/CustomCursor";

/* ------------------------------------------------------------------ */
/* Photos — swap `src` in for real pictures (drop them in /public/album
   and set e.g. src: "/album/01.jpg"). Cards without a src render as
   numbered placeholder cards for the demo.                            */
/* ------------------------------------------------------------------ */

type Orientation = "horizontal" | "vertical";

type Photo = {
  src?: string;
  alt: string;
  orientation: Orientation;
  tone: "paper" | "sand" | "blush" | "sage" | "ink" | "accent";
};

const PHOTOS: Photo[] = [
  { src: "/album/jay-01.jpg", alt: "moon crescents", orientation: "horizontal", tone: "paper" },
  { src: "/album/jay-02.jpg", alt: "mirror fit check", orientation: "vertical", tone: "sand" },
  { src: "/album/jay-04.jpg", alt: "beach, back turned", orientation: "horizontal", tone: "sage" },
  { src: "/album/jay-07.jpg", alt: "grey fit, mirror", orientation: "vertical", tone: "paper" },
  { src: "/album/jay-03.jpg", alt: "webcam grin", orientation: "horizontal", tone: "blush" },
  { src: "/album/jay-05.jpg", alt: "white shirt, marble", orientation: "vertical", tone: "sand" },
  { src: "/album/jay-06.jpg", alt: "petting the station cat", orientation: "horizontal", tone: "ink" },
  { src: "/album/jay-08.jpg", alt: "hallway selfie", orientation: "vertical", tone: "sage" },
  { src: "/album/jay-09.jpg", alt: "corridor grin", orientation: "horizontal", tone: "paper" },
  { src: "/album/jay-11.jpg", alt: "deep in the laptop", orientation: "horizontal", tone: "sand" },
  { src: "/album/jay-10.jpg", alt: "flowers in the curls", orientation: "horizontal", tone: "blush" },
];

const HERO_LINES = [
  "BYTEJAY — PHOTO LOG",
  "The Album",
  "Moments, builds and in-betweens.",
  "Move your cursor to spill the photos — stop, and they tidy themselves up.",
];

/* ------------------------------------------------------------------ */
/* Trail tuning — values lifted from the reference site.               */
/* ------------------------------------------------------------------ */

const MOUSE_THRESHOLD = 90; // px the cursor must travel to spawn a card
const TOUCH_THRESHOLD = 80;
const IDLE_DELAY = 600; // ms without movement before cards retreat
const TOUCH_IDLE_DELAY = 500;
const HIDE_SPREAD = 550; // each card vanishes at a random delay within this
const QUICK_HIDE_SPREAD = 275;
const GAP_CHANCE = 0.1; // chance to skip 1–3 beats, for irregular rhythm
const SCALES = [1, 0.64, 0.8, 0.64, 0.8, 0.64]; // cycled by z-index
const HIDE_MS_PER_CHAR = 14; // hero text slices away at this speed
const SHOW_MS_PER_CHAR = 24; // …and types back at this one
const LINE_STAGGER = 60; // ms between hero lines

/* schematic graph lines (cursor → card corners) */
const LINE_MIN_OP = 0.05;
const SCALE_FADE = 0.4; // cards below this scale fade their lines out
const LINE_OP = 0.5; // master stroke opacity
const CORNERS: [number, number][] = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
];
const CORNER_HYSTERESIS = 0.35; // deadzone so the picked corner doesn't flicker

const TONE_STYLES: Record<Photo["tone"], string> = {
  paper: "border-line bg-surface text-ink",
  sand: "border-line bg-[#EDE4D3] text-[#1C1917]",
  blush: "border-accent/20 bg-accent-soft text-ink",
  sage: "border-line bg-[#DFE5DB] text-[#1C1917]",
  ink: "border-ink/15 bg-[#26211E] text-ink",
  accent: "border-accent bg-accent text-white",
};

export default function AlbumClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    const lines = lineRefs.current.filter(Boolean) as HTMLSpanElement[];
    const sizes = cards.map((el) => ({
      w: el.offsetWidth,
      h: el.offsetHeight,
    }));
    const measure = () => {
      cards.forEach((el, i) => {
        sizes[i] = { w: el.offsetWidth, h: el.offsetHeight };
      });
    };
    window.addEventListener("resize", measure);

    /* -------- typewriter: slice hero lines away / type them back ---- */

    const rafIds = new Map<HTMLElement, number>();
    const typeTo = (
      el: HTMLElement,
      target: number, // 0 = fully sliced away, 1 = full text
      msPerChar: number,
      delay: number,
    ) => {
      const full = el.dataset.full ?? "";
      const prev = rafIds.get(el);
      if (prev) cancelAnimationFrame(prev);
      const startLen = (el.textContent ?? "").length;
      const targetLen = Math.round(full.length * target);
      const duration = Math.abs(targetLen - startLen) * msPerChar;
      const t0 = performance.now() + delay;
      const step = (now: number) => {
        if (now < t0) {
          rafIds.set(el, requestAnimationFrame(step));
          return;
        }
        const p = duration === 0 ? 1 : Math.min(1, (now - t0) / duration);
        const len = Math.round(startLen + (targetLen - startLen) * p);
        el.textContent = full.slice(0, len);
        if (p < 1) rafIds.set(el, requestAnimationFrame(step));
        else rafIds.delete(el);
      };
      rafIds.set(el, requestAnimationFrame(step));
    };

    const hideHero = () =>
      lines.forEach((el, i) => typeTo(el, 0, HIDE_MS_PER_CHAR, i * LINE_STAGGER));
    const showHero = () =>
      lines.forEach((el, i) =>
        typeTo(el, 1, SHOW_MS_PER_CHAR, (lines.length - 1 - i) * LINE_STAGGER),
      );

    /* -------- image trail ------------------------------------------ */

    const state = {
      pos: -1, // index of the last shown card
      zIndex: 1,
      gapLeft: 0,
      active: [] as number[], // indices of visible cards, oldest first
      last: { x: 0, y: 0 },
      mouse: { x: 0, y: 0 },
      seeded: false,
      heroHidden: false,
      hiding: false,
      hideGen: 0,
      idleTimer: 0,
    };
    // mirrors what the styles say, so the line ticker never reads the DOM
    const placed = cards.map(() => ({ x: 0, y: 0, scale: 1, visible: false }));
    const timeouts = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timeouts.delete(id);
        fn();
      }, ms);
      timeouts.add(id);
    };

    const showNextImage = (x: number, y: number) => {
      // Occasionally skip a few beats so the trail feels hand-placed.
      if (state.active.length > 0) {
        if (state.gapLeft > 0) {
          state.gapLeft--;
          return;
        }
        if (Math.random() < GAP_CHANCE) {
          state.gapLeft = Math.floor(Math.random() * 3);
          return;
        }
      }
      state.zIndex++;
      state.pos = (state.pos + 1) % cards.length;
      const el = cards[state.pos];
      const { w, h } = sizes[state.pos];
      const held = state.active.indexOf(state.pos);
      if (held !== -1) state.active.splice(held, 1);
      state.active.push(state.pos);
      const scale = SCALES[state.zIndex % SCALES.length];
      const px = Math.round(x - w / 2);
      const py = Math.round(y - h / 2);
      el.style.zIndex = String(state.zIndex);
      el.style.transform = `translate(${px}px, ${py}px) scale(${scale})`;
      el.style.opacity = "1";
      placed[state.pos] = { x: px, y: py, scale, visible: true };
    };

    const hideImages = (quick: boolean) => {
      const gen = ++state.hideGen;
      state.hiding = true;
      const shown = [...state.active];
      const spread = quick ? QUICK_HIDE_SPREAD : HIDE_SPREAD;
      const delays = shown.map(() => Math.random() * spread);
      shown.forEach((idx, i) =>
        later(() => {
          if (state.hideGen !== gen) return;
          cards[idx].style.opacity = "0";
          placed[idx].visible = false;
          const at = state.active.indexOf(idx);
          if (at !== -1) state.active.splice(at, 1);
        }, delays[i]),
      );
      later(
        () => {
          if (state.hideGen !== gen) return;
          state.hiding = false;
          state.heroHidden = false;
          showHero();
        },
        shown.length ? Math.max(...delays) + 100 : 0,
      );
    };

    const cancelHiding = () => {
      if (state.hiding) {
        state.hideGen++;
        state.hiding = false;
      }
    };

    const step = (x: number, y: number, threshold: number) => {
      state.mouse = { x, y };
      if (!state.seeded) {
        state.seeded = true;
        state.last = { x, y };
        return;
      }
      if (state.heroHidden) {
        window.clearTimeout(state.idleTimer);
        cancelHiding();
      }
      if (Math.hypot(x - state.last.x, y - state.last.y) > threshold) {
        if (!state.heroHidden) {
          state.heroHidden = true;
          hideHero();
        }
        showNextImage(x, y);
        state.last = { x, y };
      }
      if (state.heroHidden) {
        window.clearTimeout(state.idleTimer);
        state.idleTimer = window.setTimeout(
          () => hideImages(false),
          IDLE_DELAY,
        );
      }
    };

    /* -------- schematic graph lines (cursor → card corners) --------- */
    /* 4 lines from the cursor to the corners of the newest card, plus
       one to the nearest corner of the oldest — redrawn every frame,
       exactly like the reference site.                                 */

    const SVG_NS = "http://www.w3.org/2000/svg";
    const linePool: SVGLineElement[] = [];
    const getLine = (i: number) => {
      let el = linePool[i];
      if (!el) {
        el = document.createElementNS(SVG_NS, "line");
        linePool[i] = el;
        svg.appendChild(el);
      }
      return el;
    };
    const cornerMemory = new Map<number, { sx: number; sy: number }>();

    let tickerId = 0;
    const tick = () => {
      type Node = {
        cx: number;
        cy: number;
        hw: number;
        hh: number;
        op: number;
        idx: number;
      };
      const nodes: Node[] = [];
      // state.active is ordered oldest → newest, which matches z-order
      for (const idx of state.active) {
        const p = placed[idx];
        if (!p.visible) {
          cornerMemory.delete(idx);
          continue;
        }
        const op = Math.min(1, p.scale / SCALE_FADE);
        if (op <= LINE_MIN_OP) {
          cornerMemory.delete(idx);
          continue;
        }
        const { w, h } = sizes[idx];
        nodes.push({
          cx: p.x + w / 2,
          cy: p.y + h / 2,
          hw: (w * p.scale) / 2,
          hh: (h * p.scale) / 2,
          op,
          idx,
        });
      }
      let used = 0;
      if (nodes.length > 0) {
        const mx = state.mouse.x;
        const my = state.mouse.y;
        const draw = (x2: number, y2: number, op: number) => {
          const el = getLine(used++);
          el.setAttribute("x1", mx.toFixed(1));
          el.setAttribute("y1", my.toFixed(1));
          el.setAttribute("x2", x2.toFixed(1));
          el.setAttribute("y2", y2.toFixed(1));
          el.setAttribute("stroke-opacity", (op * LINE_OP).toFixed(3));
          el.style.display = "";
        };
        const newest = nodes[nodes.length - 1];
        for (const [sx, sy] of CORNERS)
          draw(newest.cx + sx * newest.hw, newest.cy + sy * newest.hh, newest.op);
        if (nodes.length > 1) {
          const oldest = nodes[0];
          const mem = cornerMemory.get(oldest.idx);
          let sx = mx >= oldest.cx ? 1 : -1;
          let sy = my >= oldest.cy ? 1 : -1;
          if (mem) {
            if (Math.abs(mx - oldest.cx) < CORNER_HYSTERESIS * oldest.hw)
              sx = mem.sx;
            if (Math.abs(my - oldest.cy) < CORNER_HYSTERESIS * oldest.hh)
              sy = mem.sy;
          }
          cornerMemory.set(oldest.idx, { sx, sy });
          draw(oldest.cx + sx * oldest.hw, oldest.cy + sy * oldest.hh, oldest.op);
        }
      }
      for (let i = used; i < linePool.length; i++)
        linePool[i].style.display = "none";
      tickerId = requestAnimationFrame(tick);
    };
    tickerId = requestAnimationFrame(tick);

    /* -------- events ------------------------------------------------ */

    const onMouseMove = (e: MouseEvent) =>
      step(e.clientX, e.clientY, MOUSE_THRESHOLD);
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      state.seeded = true;
      state.last = { x: t.clientX, y: t.clientY };
      state.mouse = { x: t.clientX, y: t.clientY };
      cancelHiding();
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      const t = e.touches[0];
      step(t.clientX, t.clientY, TOUCH_THRESHOLD);
    };
    const onTouchEnd = () => {
      window.clearTimeout(state.idleTimer);
      state.idleTimer = window.setTimeout(
        () => hideImages(true),
        TOUCH_IDLE_DELAY,
      );
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("resize", measure);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      window.clearTimeout(state.idleTimer);
      timeouts.forEach((id) => window.clearTimeout(id));
      rafIds.forEach((id) => cancelAnimationFrame(id));
      cancelAnimationFrame(tickerId);
      linePool.forEach((el) => el.remove());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 touch-none overflow-clip bg-[#131110]"
      style={{
        ["--trail-unit" as string]: "clamp(9rem, 17vw, 15rem)",
        backgroundImage:
          "radial-gradient(circle, rgba(251,248,242,0.07) 1px, transparent 1px)",
        backgroundSize: "26px 26px",
      }}
    >
      <CustomCursor dark />

      {/* hero — sliced away while the trail is live, typed back on idle */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center px-6">
        <div className="max-w-xl text-center">
          <HeroLine
            index={0}
            refs={lineRefs}
            className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink/40"
          />
          <HeroLine
            index={1}
            refs={lineRefs}
            className="mt-4 block font-display text-6xl font-bold tracking-tight text-ink sm:text-7xl"
          />
          <HeroLine
            index={2}
            refs={lineRefs}
            className="mt-5 block text-base text-ink/60"
          />
          <HeroLine
            index={3}
            refs={lineRefs}
            className="mt-8 block font-mono text-xs text-ink/40"
          />
        </div>
      </div>

      {/* photo trail */}
      <div aria-hidden className="absolute inset-0 z-10">
        {PHOTOS.map((photo, i) => (
          <div
            key={i}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="pointer-events-none absolute left-0 top-0 opacity-0 will-change-transform"
            style={{
              width:
                photo.orientation === "horizontal"
                  ? "var(--trail-unit)"
                  : "calc(var(--trail-unit) * 3 / 4)",
              height:
                photo.orientation === "horizontal"
                  ? "calc(var(--trail-unit) * 3 / 4)"
                  : "var(--trail-unit)",
            }}
          >
            {photo.src ? (
              <img
                src={photo.src}
                alt=""
                draggable={false}
                className="h-full w-full rounded-xl border border-ink/15 object-cover shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
              />
            ) : (
              <PlaceholderCard photo={photo} index={i} />
            )}
          </div>
        ))}
      </div>

      {/* schematic graph lines — white strokes inverting over the cards */}
      <svg
        ref={svgRef}
        aria-hidden
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible mix-blend-difference [&_line]:stroke-white [&_line]:[stroke-width:1] [&_line]:[vector-effect:non-scaling-stroke]"
      />

      {/* nav */}
      <div className="absolute inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5">
        <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink/40">
          album / {String(PHOTOS.length).padStart(2, "0")} frames
        </span>
        <a
          href="/"
          className="rounded-full border border-ink/15 bg-ink/5 px-4 py-1.5 text-sm text-ink/70 backdrop-blur-md transition-colors hover:text-ink"
        >
          ← home
        </a>
      </div>
    </div>
  );
}

/* Ghost span keeps the layout stable while the visible copy is sliced. */
function HeroLine({
  index,
  refs,
  className,
}: {
  index: number;
  refs: React.MutableRefObject<(HTMLSpanElement | null)[]>;
  className: string;
}) {
  const text = HERO_LINES[index];
  return (
    <span className={`relative block ${className}`}>
      <span className="invisible">{text}</span>
      <span
        aria-hidden
        data-full={text}
        ref={(el) => {
          refs.current[index] = el;
        }}
        className="absolute inset-0"
      >
        {text}
      </span>
    </span>
  );
}

function PlaceholderCard({ photo, index }: { photo: Photo; index: number }) {
  return (
    <div
      className={`flex h-full w-full flex-col justify-between rounded-xl border p-3 shadow-[0_8px_30px_rgba(0,0,0,0.5)] ${TONE_STYLES[photo.tone]}`}
    >
      <div className="flex items-start justify-between font-mono text-[9px] uppercase tracking-[0.2em] opacity-60">
        <span>img</span>
        <span>{photo.orientation === "horizontal" ? "4:3" : "3:4"}</span>
      </div>
      <span className="font-display text-4xl font-bold leading-none">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-60">
        placeholder
      </span>
    </div>
  );
}
