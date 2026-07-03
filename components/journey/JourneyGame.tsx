"use client";

/**
 * JourneyGame — a playable timeline of Jay's journey.
 * Same game grammar as paodao.fr, in ByteJay's 2.5D form: a world you
 * traverse with a character, chapter portals, milestone stations that
 * open quest-style cards, collectible sparks and a progress HUD.
 * BB-8 (the site's resident droid) is the player character.
 *
 * ── EDIT YOUR STORY HERE: the MILESTONES array is the whole timeline. ──
 */

import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  sfxFarewell,
  sfxGreet,
  sfxReact,
  startMotor,
  stopMotor,
  unlockAudio,
} from "@/lib/robotSfx";
import PixelIcon from "../PixelIcon";

const BB8Visitor = dynamic(() => import("../BB8Visitor"), { ssr: false });

/* ── the story ──────────────────────────────────────────────────── */

type Milestone = {
  year: string;
  title: string;
  text: string;
  era: number; // index into ERAS
};

const MILESTONES: Milestone[] = [
  {
    year: "2007",
    title: "Player One Spawns",
    text: "Jay enters the world. Curiosity stat: already maxed. Tutorial skipped.",
    era: 0,
  },
  {
    year: "2019",
    title: "First Line of Code",
    text: "One “Hello, World” and reality forks. Everything after this point is a side effect.",
    era: 0,
  },
  {
    year: "2022",
    title: "Down the Rabbit Hole",
    text: "Discovers AI and machine learning. The sleep schedule takes damage it never recovers from.",
    era: 1,
  },
  {
    year: "2023",
    title: "Competitive Mode",
    text: "DSA grind, chess openings, speedcubes. Systems thinking: unlocked.",
    era: 1,
  },
  {
    year: "2024",
    title: "BYTEJAY Goes Public",
    text: "Starts building in public. First real projects ship — some even on purpose.",
    era: 2,
  },
  {
    year: "2025",
    title: "AI Engineer Era",
    text: "Graph neural networks, voice interfaces, intelligent systems. The ideas start feeling alive.",
    era: 2,
  },
  {
    year: "2026",
    title: "Where Worlds Take Shape",
    text: "Builds this playable world you're rolling through. The journey is just getting started…",
    era: 3,
  },
];

const ERAS = [
  { name: "Origins", numeral: "I", sky: "linear-gradient(to bottom, #FBF8F2, #F5EDDD)", tint: "#D8CCAE" },
  { name: "Discovery", numeral: "II", sky: "linear-gradient(to bottom, #EAF2F5, #F5F1E4)", tint: "#A9C4CE" },
  { name: "The Grind", numeral: "III", sky: "linear-gradient(to bottom, #FBEEDF, #F8F2E4)", tint: "#E8B48E" },
  { name: "World-Building", numeral: "IV", sky: "linear-gradient(to bottom, #F0ECF7, #F9F6EE)", tint: "#B9AFD3" },
];

const REACTIONS = [
  "*beep!* a memory!",
  "logging this one…",
  "*whirr* formative!",
  "achievement unlocked",
  "core memory acquired",
  "*happy beeps*",
  "and then everything changed",
];

/* ── world geometry ─────────────────────────────────────────────── */

const START_X = 170;
const FIRST_X = 560;
const SPACING = 680;
const END_PAD = 760;
const WORLD_W = FIRST_X + (MILESTONES.length - 1) * SPACING + END_PAD;
const NEAR = 165;
const SPEED = 290;
const FLOOR_H = 140;

const mileX = (i: number) => FIRST_X + i * SPACING;

/* portals sit between the last milestone of an era and the first of the next */
const PORTALS = ERAS.slice(1).map((era, idx) => {
  const prevLast = MILESTONES.map((m) => m.era).lastIndexOf(idx);
  return { era: idx + 1, x: (mileX(prevLast) + mileX(prevLast + 1)) / 2, ...era };
});

/* sparks scattered along the road */
const SPARKS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: 380 + i * ((WORLD_W - 900) / 11) + (i % 3) * 46,
  y: 46 + (i % 4) * 22,
}));

/* parallax scenery */
const HILLS = Array.from({ length: Math.ceil(WORLD_W * 0.4 / 420) + 3 }, (_, i) => ({
  x: i * 420 - 120,
  w: 340 + (i % 3) * 120,
  h: 90 + (i % 2) * 46,
}));

const TREES = Array.from({ length: Math.ceil(WORLD_W * 0.75 / 340) + 3 }, (_, i) => ({
  x: i * 340 + (i % 2) * 90,
  s: 0.75 + (i % 3) * 0.2,
}));

/* ── scenery pieces ─────────────────────────────────────────────── */

function DoodleTree({ s }: { s: number }) {
  return (
    <div className="relative flex flex-col items-center" style={{ transform: `scale(${s})`, transformOrigin: "bottom" }}>
      <div className="h-14 w-14 rounded-full bg-[#B7C4A4] shadow-[inset_-4px_-4px_0_rgba(28,25,23,0.06)]" />
      <div className="-mt-2 h-9 w-1.5 rounded-full bg-[#C9B78D]" />
    </div>
  );
}

function Monument({ m, isNear, seen }: { m: Milestone; isNear: boolean; seen: boolean }) {
  return (
    <div className="relative flex flex-col items-center">
      {/* pennant flag */}
      <motion.div
        animate={isNear ? { rotate: [0, -4, 0] } : {}}
        transition={{ repeat: Infinity, duration: 1.6 }}
        className="relative"
      >
        <div className="h-40 w-1 rounded-full bg-ink/25" />
        <div
          className={`absolute left-1 top-1 h-6 w-12 transition-colors duration-500 [clip-path:polygon(0_0,100%_50%,0_100%)] ${
            seen ? "bg-accent" : "bg-ink/20"
          }`}
        />
      </motion.div>
      {/* year plate */}
      <div className="z-10 -mt-2 rounded-sm border border-[#B9A97F] bg-gradient-to-b from-[#F0E6C8] to-[#DECFA8] px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-[0.15em] text-ink/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(28,25,23,0.2)]">
        {m.year}
      </div>
      {/* base */}
      <div className="mt-1 h-3 w-16 rounded-sm bg-gradient-to-b from-[#EADDBE] to-[#C9B78D] shadow-[0_2px_4px_rgba(28,25,23,0.15)]" />
    </div>
  );
}

function Portal({ p }: { p: (typeof PORTALS)[number] }) {
  return (
    <div className="relative flex flex-col items-center">
      <div
        className="flex h-48 w-36 items-start justify-center rounded-t-full border-[6px] border-b-0 transition-colors"
        style={{ borderColor: p.tint, background: `linear-gradient(to bottom, ${p.tint}22, transparent)` }}
      >
        <span className="mt-5 font-display text-lg font-bold" style={{ color: p.tint }}>
          {p.numeral}
        </span>
      </div>
      <div className="mt-2 rounded-full border border-line bg-surface/80 px-3 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-muted backdrop-blur">
        chapter {p.numeral} · {p.name}
      </div>
    </div>
  );
}

/* ── the game ───────────────────────────────────────────────────── */

export default function JourneyGame() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const hillsRef = useRef<HTMLDivElement>(null);
  const treesRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const keys = useRef({ left: false, right: false });
  const xRef = useRef(START_X);

  const [walking, setWalking] = useState(false);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [active, setActive] = useState<number | null>(null);
  const [seen, setSeen] = useState<Set<number>>(new Set());
  const [collected, setCollected] = useState<Set<number>>(new Set());
  const [era, setEra] = useState(0);
  const [moved, setMoved] = useState(false);
  const [done, setDone] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const [waving, setWaving] = useState(false);
  const [sound, setSound] = useState(true);

  const soundRef = useRef(true);
  soundRef.current = sound;
  const motorOnRef = useRef(false);
  const seenRef = useRef(new Set<number>());
  const collectedRef = useRef(new Set<number>());
  const portalToldRef = useRef(new Set<number>());
  const movedRef = useRef(false);
  const doneRef = useRef(false);
  const bubbleTO = useRef<ReturnType<typeof setTimeout>>();

  const say = (text: string, ms = 2000) => {
    clearTimeout(bubbleTO.current);
    setBubble(text);
    bubbleTO.current = setTimeout(() => setBubble(null), ms);
  };
  const sayRef = useRef(say);
  sayRef.current = say;

  /* greet once */
  useEffect(() => {
    setWaving(true);
    const t1 = setTimeout(() => sayRef.current("*beep!* walk with me →", 2600), 900);
    const t2 = setTimeout(() => setWaving(false), 3200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const dir = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0);
      if (dir !== 0) {
        xRef.current = Math.min(WORLD_W - 110, Math.max(130, xRef.current + dir * SPEED * dt));
        setFacing(dir as 1 | -1);
        if (!movedRef.current) {
          movedRef.current = true;
          setMoved(true);
        }
      }
      setWalking(dir !== 0);

      const wantMotor = dir !== 0 && soundRef.current;
      if (wantMotor && !motorOnRef.current) {
        motorOnRef.current = true;
        startMotor();
      } else if (!wantMotor && motorOnRef.current) {
        motorOnRef.current = false;
        stopMotor();
      }

      const vw = viewportRef.current?.clientWidth ?? 0;
      const camX = Math.min(Math.max(xRef.current - vw / 2, 0), Math.max(0, WORLD_W - vw));
      if (worldRef.current) worldRef.current.style.transform = `translate3d(${-camX}px,0,0)`;
      if (hillsRef.current) hillsRef.current.style.transform = `translate3d(${-camX * 0.35}px,0,0)`;
      if (treesRef.current) treesRef.current.style.transform = `translate3d(${-camX * 0.7}px,0,0)`;
      if (playerRef.current)
        playerRef.current.style.transform = `translate3d(${xRef.current - 62}px,0,0)`;
      if (progressRef.current)
        progressRef.current.style.width = `${(xRef.current / WORLD_W) * 100}%`;

      /* milestones */
      let near: number | null = null;
      MILESTONES.forEach((_, i) => {
        if (Math.abs(mileX(i) - xRef.current) < NEAR) near = i;
      });
      setActive(near);
      if (near !== null && !seenRef.current.has(near)) {
        seenRef.current.add(near);
        setSeen(new Set(seenRef.current));
        sayRef.current(REACTIONS[near % REACTIONS.length]);
        if (soundRef.current) sfxReact();
      }

      /* era from furthest milestone passed */
      let e = 0;
      MILESTONES.forEach((m, i) => {
        if (xRef.current > mileX(i) - 80) e = m.era;
      });
      setEra(e);

      /* portal callouts */
      PORTALS.forEach((p) => {
        if (!portalToldRef.current.has(p.era) && Math.abs(p.x - xRef.current) < 90) {
          portalToldRef.current.add(p.era);
          sayRef.current(`entering ${p.name.toLowerCase()}…`, 2200);
          if (soundRef.current) sfxGreet();
        }
      });

      /* sparks */
      SPARKS.forEach((s) => {
        if (!collectedRef.current.has(s.id) && Math.abs(s.x - xRef.current) < 62) {
          collectedRef.current.add(s.id);
          setCollected(new Set(collectedRef.current));
          if (soundRef.current) sfxReact();
        }
      });

      /* the end */
      if (!doneRef.current && xRef.current > WORLD_W - 300) {
        doneRef.current = true;
        setDone(true);
        sayRef.current("to be continued… ✌", 2800);
        if (soundRef.current) sfxFarewell();
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const down = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "d") keys.current.right = true;
      if (e.key === "ArrowLeft" || e.key === "a") keys.current.left = true;
      unlockAudio();
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "d") keys.current.right = false;
      if (e.key === "ArrowLeft" || e.key === "a") keys.current.left = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      cancelAnimationFrame(raf);
      if (motorOnRef.current) {
        motorOnRef.current = false;
        stopMotor();
      }
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const hold = (side: "left" | "right", on: boolean) => () => {
    keys.current[side] = on;
    if (on) unlockAudio();
  };

  return (
    <div ref={viewportRef} className="fixed inset-0 select-none overflow-hidden">
      {/* era skies (crossfade) */}
      {ERAS.map((e, i) => (
        <div
          key={e.name}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ background: e.sky, opacity: era === i ? 1 : 0 }}
        />
      ))}
      <div className="absolute inset-0 bg-dots opacity-20" />

      {/* floor */}
      <div
        className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-[#E6DBC2] via-[#EFE6D0] to-[#F6EFDE]"
        style={{ height: FLOOR_H }}
      >
        <div className="absolute inset-0 bg-[repeating-linear-gradient(105deg,transparent_0px,transparent_38px,rgba(255,255,255,0.35)_40px,transparent_42px)] opacity-60" />
        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-ink/10 to-transparent" />
      </div>
      <div
        className="absolute inset-x-0 h-3.5 bg-gradient-to-b from-[#FBF7ED] to-[#E9DFC9] shadow-[0_3px_6px_rgba(28,25,23,0.18)]"
        style={{ bottom: FLOOR_H - 6 }}
      />

      {/* ══ parallax: hills ══ */}
      <div ref={hillsRef} className="absolute inset-0 will-change-transform" aria-hidden>
        {HILLS.map((h, i) => (
          <div
            key={i}
            className="absolute rounded-[50%] bg-[#EDE4CE] opacity-70"
            style={{ left: h.x, bottom: FLOOR_H - 20, width: h.w, height: h.h }}
          />
        ))}
      </div>

      {/* ══ parallax: trees ══ */}
      <div ref={treesRef} className="absolute inset-0 will-change-transform" aria-hidden>
        {TREES.map((t, i) => (
          <div key={i} className="absolute" style={{ left: t.x, bottom: FLOOR_H - 10 }}>
            <DoodleTree s={t.s} />
          </div>
        ))}
      </div>

      {/* ══ world layer ══ */}
      <div ref={worldRef} className="absolute inset-0 will-change-transform">
        {/* start sign */}
        <div className="absolute w-48" style={{ left: 120, bottom: FLOOR_H + 108 }}>
          <p className="font-display text-2xl font-bold leading-tight tracking-tight text-ink/80 [text-shadow:0_1px_0_rgba(255,255,255,0.8)]">
            THE JOURNEY OF JAY
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            2007 — present · one droid, one timeline
          </p>
          <p className="mt-3 font-hand text-xl text-ink-soft">roll right →</p>
        </div>

        {/* portals */}
        {PORTALS.map((p) => (
          <div key={p.era} className="absolute -translate-x-1/2" style={{ left: p.x, bottom: FLOOR_H - 6 }}>
            <Portal p={p} />
          </div>
        ))}

        {/* sparks */}
        {SPARKS.map((s) => (
          <AnimatePresence key={s.id}>
            {!collected.has(s.id) && (
              <motion.div
                exit={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="twinkle absolute"
                style={{ left: s.x, bottom: FLOOR_H + s.y }}
              >
                <PixelIcon name="spark" className="h-3.5 w-3.5 text-accent" />
              </motion.div>
            )}
          </AnimatePresence>
        ))}

        {/* milestones */}
        {MILESTONES.map((m, i) => {
          const isNear = active === i;
          return (
            <div key={m.year} className="absolute -translate-x-1/2" style={{ left: mileX(i), bottom: FLOOR_H - 6 }}>
              {/* light pool */}
              <div
                className={`pointer-events-none absolute -bottom-2 left-1/2 h-6 w-56 -translate-x-1/2 rounded-[50%] blur-md transition-opacity duration-700 ${
                  isNear ? "opacity-80" : "opacity-25"
                }`}
                style={{ background: "radial-gradient(ellipse, rgba(255,226,170,0.7), transparent 70%)" }}
              />
              <Monument m={m} isNear={isNear} seen={seen.has(i)} />

              {/* quest card */}
              <AnimatePresence>
                {isNear && (
                  <motion.div
                    initial={{ opacity: 0, y: 14, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="absolute bottom-[212px] left-1/2 z-20 w-[300px] -translate-x-1/2 rounded-xl border border-line bg-surface/95 p-4 shadow-[0_18px_44px_rgba(28,25,23,0.16)] backdrop-blur"
                  >
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent">
                      {m.year} · chapter {ERAS[m.era].numeral}
                    </p>
                    <p className="mt-1 font-display text-base font-bold text-ink">{m.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{m.text}</p>
                    <span className="absolute -bottom-[5px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b border-r border-line bg-surface/95" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* the end */}
        <div className="absolute w-64 -translate-x-1/2" style={{ left: WORLD_W - 170, bottom: FLOOR_H + 40 }}>
          <p className="font-display text-3xl font-bold tracking-tight text-ink/80">
            TO BE
            <br />
            CONTINUED<span className="animate-pulse text-accent">_</span>
          </p>
          <Link
            href="/#contact"
            className="mt-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-ink"
          >
            say hi →
          </Link>
        </div>

        {/* player */}
        <div ref={playerRef} className="absolute left-0 will-change-transform" style={{ bottom: FLOOR_H - 64 }}>
          <AnimatePresence>
            {bubble && (
              <motion.div
                key={bubble}
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.9 }}
                transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="absolute -top-8 left-1/2 z-30 w-max max-w-[230px] -translate-x-1/2 -rotate-2 rounded-xl border border-line bg-surface/95 px-3 py-1 font-hand text-lg leading-tight text-ink shadow-[0_6px_18px_rgba(28,25,23,0.14)]"
              >
                {bubble}
                <span className="absolute -bottom-[5px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b border-r border-line bg-surface/95" />
              </motion.div>
            )}
          </AnimatePresence>
          <BB8Visitor walking={walking} facing={facing} waving={waving} />
          <div className="mx-auto -mt-4 h-2.5 w-16 rounded-[50%] bg-ink/20 blur-[3px]" />
        </div>
      </div>

      {/* ══ HUD ══ */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-between p-5">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="pointer-events-auto flex h-9 items-center gap-2 rounded-full border border-line bg-surface/80 px-3.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft backdrop-blur transition-colors hover:text-ink"
          >
            ← bytejay
          </Link>
          <span className="hidden rounded-full border border-line bg-surface/60 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted backdrop-blur sm:block">
            the journey — playable timeline
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              unlockAudio();
              const next = !sound;
              setSound(next);
              if (next) sfxReact();
              else if (motorOnRef.current) {
                motorOnRef.current = false;
                stopMotor();
              }
            }}
            aria-label={sound ? "Mute BB-8" : "Unmute BB-8"}
            className={`pointer-events-auto rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] backdrop-blur transition-colors ${
              sound ? "border-accent/50 bg-accent/10 text-accent" : "border-line bg-surface/60 text-muted"
            }`}
          >
            {sound ? "sfx on" : "sfx off"}
          </button>
          <span className="flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted backdrop-blur">
            <PixelIcon name="spark" className="h-2.5 w-2.5 text-accent" />
            {collected.size}/{SPARKS.length}
          </span>
          <span className="rounded-full border border-line bg-surface/60 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted backdrop-blur">
            memories {seen.size}/{MILESTONES.length}
          </span>
        </div>
      </div>

      {/* era name + progress bar */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40">
        <p className="mb-2 text-center font-mono text-[9px] uppercase tracking-[0.3em] text-muted">
          chapter {ERAS[era].numeral} — {ERAS[era].name}
        </p>
        <div className="h-1 w-full bg-ink/10">
          <div ref={progressRef} className="h-full bg-accent transition-[width] duration-150" style={{ width: 0 }} />
        </div>
      </div>

      {/* intro overlay */}
      <AnimatePresence>
        {!moved && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="pointer-events-none absolute inset-x-0 top-[16%] z-30 flex flex-col items-center text-center"
          >
            <p className="font-hand text-2xl text-accent">a playable timeline</p>
            <h1 className="mt-1 font-display text-5xl font-bold tracking-tight text-ink sm:text-6xl">
              The Journey
            </h1>
            <p className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
              <span className="rounded border border-ink/20 bg-surface/60 px-1.5 py-0.5">←</span>
              <span className="rounded border border-ink/20 bg-surface/60 px-1.5 py-0.5">→</span>
              or A / D to travel · collect the sparks
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* completion toast */}
      <AnimatePresence>
        {done && seen.size === MILESTONES.length && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-none absolute bottom-16 left-1/2 z-40 -translate-x-1/2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-accent backdrop-blur"
          >
            timeline 100% — thanks for walking it ✦
          </motion.div>
        )}
      </AnimatePresence>

      {/* touch controls */}
      <div className="absolute bottom-8 right-5 z-40 flex gap-3 sm:hidden">
        {(["left", "right"] as const).map((side) => (
          <button
            key={side}
            type="button"
            aria-label={`travel ${side}`}
            onPointerDown={hold(side, true)}
            onPointerUp={hold(side, false)}
            onPointerLeave={hold(side, false)}
            onPointerCancel={hold(side, false)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/20 bg-surface/90 text-lg text-ink shadow-md active:bg-accent active:text-white"
          >
            {side === "left" ? "←" : "→"}
          </button>
        ))}
      </div>
    </div>
  );
}
