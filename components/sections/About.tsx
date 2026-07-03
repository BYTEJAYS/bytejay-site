"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
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
import SectionHeading from "../SectionHeading";

const BB8Visitor = dynamic(() => import("../BB8Visitor"), { ssr: false });

/* ── the collection: the person, not the projects ───────────────── */

type Painting = {
  title: string;
  medium: string;
  body: string;
  art: React.ReactNode;
};

const INK = "#1C1917";
const ACCENT = "#FF4D24";

const PAINTINGS: Painting[] = [
  {
    title: "Portrait of the Builder",
    medium: "oil on ambition, 2007 —",
    body: "Jay, 19. College student, aspiring AI engineer, professional asker of “what if?”. Painted mid-refactor, as always.",
    art: (
      <svg viewBox="0 0 120 90" className="h-full w-full">
        <circle cx="60" cy="34" r="20" fill="none" stroke={INK} strokeWidth="2.5" />
        <circle cx="53" cy="31" r="2.2" fill={INK} />
        <circle cx="67" cy="31" r="2.2" fill={INK} />
        <path d="M52 41 Q60 47 68 41" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M42 28 Q47 12 60 14 Q76 10 78 26" fill="none" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" />
        <path d="M38 78 Q45 58 60 58 Q75 58 82 78" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        <text x="92" y="82" fontSize="13" fontWeight="700" fill={ACCENT}>19</text>
      </svg>
    ),
  },
  {
    title: "Composition in Code",
    medium: "curly braces on canvas",
    body: "Other people relax after class. The artist opens a terminal and calls it relaxing. Worryingly, he means it.",
    art: (
      <svg viewBox="0 0 120 90" className="h-full w-full">
        <text x="12" y="62" fontSize="46" fontWeight="700" fill={INK} fontFamily="monospace">{"{"}</text>
        <text x="86" y="62" fontSize="46" fontWeight="700" fill={INK} fontFamily="monospace">{"}"}</text>
        <rect x="42" y="30" width="34" height="5" rx="2.5" fill={INK} opacity="0.25" />
        <rect x="42" y="42" width="26" height="5" rx="2.5" fill={ACCENT} />
        <rect x="42" y="54" width="30" height="5" rx="2.5" fill={INK} opacity="0.25" />
        <rect x="74" y="52" width="7" height="9" fill={ACCENT}>
          <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite" />
        </rect>
      </svg>
    ),
  },
  {
    title: "Boy with Guitar",
    medium: "six strings, mostly tuned",
    body: "Self-taught riffs between compile times. Knows enough chords to be dangerous. The neighbours describe the genre as “experimental”.",
    art: (
      <svg viewBox="0 0 120 90" className="h-full w-full">
        <ellipse cx="42" cy="58" rx="21" ry="17" fill="none" stroke={INK} strokeWidth="2.5" />
        <ellipse cx="56" cy="44" rx="13" ry="11" fill="none" stroke={INK} strokeWidth="2.5" />
        <circle cx="45" cy="55" r="5.5" fill={ACCENT} opacity="0.85" />
        <line x1="63" y1="37" x2="98" y2="14" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        <line x1="48" y1="52" x2="96" y2="18" stroke={INK} strokeWidth="0.8" opacity="0.6" />
        <line x1="50" y1="56" x2="99" y2="21" stroke={INK} strokeWidth="0.8" opacity="0.6" />
        <text x="88" y="66" fontSize="20" fill={ACCENT}>♪</text>
        <text x="102" y="48" fontSize="14" fill={INK} opacity="0.5">♪</text>
      </svg>
    ),
  },
  {
    title: "The Curiosity Room",
    medium: "found objects, ongoing",
    body: "Chess openings, thick books about the origins of the universe, rabbit holes of every diameter. The artist refuses to specialise in being bored.",
    art: (
      <svg viewBox="0 0 120 90" className="h-full w-full">
        <text x="14" y="64" fontSize="44" fill={INK}>♞</text>
        <circle cx="68" cy="34" r="12" fill="none" stroke={ACCENT} strokeWidth="2" />
        <ellipse cx="68" cy="34" rx="19" ry="6" fill="none" stroke={ACCENT} strokeWidth="1.5" transform="rotate(-18 68 34)" />
        <rect x="86" y="44" width="24" height="30" rx="2" fill="none" stroke={INK} strokeWidth="2.5" />
        <line x1="90" y1="44" x2="90" y2="74" stroke={INK} strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: "Self-Portrait at 3 A.M.",
    medium: "caffeine on deadline",
    body: "The bug was declared “literally impossible” at 2:40. It was a missing semicolon. The artist has learned nothing and would do it again.",
    art: (
      <svg viewBox="0 0 120 90" className="h-full w-full">
        <rect x="22" y="38" width="30" height="32" rx="5" fill="none" stroke={INK} strokeWidth="2.5" />
        <path d="M52 46 q12 2 0 16" fill="none" stroke={INK} strokeWidth="2.5" />
        <path d="M30 30 q3 -7 0 -12 M40 30 q3 -7 0 -12" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <text x="70" y="72" fontSize="46" fontWeight="700" fill={ACCENT} fontFamily="monospace">;</text>
        <path d="M95 28 l14 -8 M95 28 l14 8 M95 28 l-6 0" stroke={INK} strokeWidth="1.5" opacity="0.4" />
        <circle cx="95" cy="28" r="5" fill="none" stroke={INK} strokeWidth="2" opacity="0.6" />
      </svg>
    ),
  },
  {
    title: "How the Artist Runs",
    medium: "temperament, in light tones",
    body: "Runs on curiosity, bad puns and big ideas. Laughs at his own jokes — someone has to. Believes ambitious beats safe, every single time.",
    art: (
      <svg viewBox="0 0 120 90" className="h-full w-full">
        <circle cx="46" cy="40" r="17" fill="none" stroke={INK} strokeWidth="2.5" />
        <path d="M40 44 Q46 52 52 44" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="41" cy="36" r="2" fill={INK} />
        <circle cx="51" cy="36" r="2" fill={INK} />
        <path d="M46 23 v-8 M46 15 q0 -6 7 -6 q6 0 6 6 q0 5 -6 7" fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" />
        <text x="74" y="52" fontSize="22" fontWeight="700" fill={ACCENT} fontFamily="var(--font-caveat)">ha!</text>
        <path d="M72 62 l8 -4 l-3 8 l8 -4" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      </svg>
    ),
  },
];

const START_X = 190;
const FIRST_X = 440;
const SPACING = 490;
const END_PAD = 470;
const WORLD_W = FIRST_X + (PAINTINGS.length - 1) * SPACING + END_PAD;
const NEAR = 155;
const SPEED = 270;
const FLOOR_H = 150;

const REACTIONS = [
  "ooh!",
  "*beep* nice",
  "adding to favourites…",
  "heh, relatable",
  "the brushwork! *whirr*",
  "10/10 would compute again",
];

/* ── set dressing ───────────────────────────────────────────────── */

function Bench() {
  return (
    <div className="relative w-52">
      <div className="h-4 rounded-md bg-gradient-to-b from-[#E7DABB] to-[#D3C29E] shadow-[0_2px_4px_rgba(28,25,23,0.2),inset_0_1px_0_rgba(255,255,255,0.7)]" />
      <div className="mx-4 flex justify-between">
        <div className="h-11 w-2.5 rounded-b bg-gradient-to-b from-[#D3C29E] to-[#BFAD87]" />
        <div className="h-11 w-2.5 rounded-b bg-gradient-to-b from-[#D3C29E] to-[#BFAD87]" />
      </div>
      <div className="mx-auto h-2 w-44 rounded-[50%] bg-ink/15 blur-[3px]" />
    </div>
  );
}

function Plant() {
  return (
    <div className="relative flex w-24 flex-col items-center">
      <div className="relative h-20 w-20">
        {[-38, -12, 14, 40].map((r, i) => (
          <div
            key={r}
            className="absolute bottom-0 left-1/2 w-6 origin-bottom rounded-full bg-gradient-to-t from-[#A9B896] to-[#C4D0B2]"
            style={{ transform: `translateX(-50%) rotate(${r}deg)`, height: i % 2 ? 72 : 58 }}
          />
        ))}
      </div>
      <div className="h-12 w-16 rounded-b-xl bg-gradient-to-b from-[#EBDFC6] to-[#D8C8A8] shadow-[inset_0_2px_2px_rgba(255,255,255,0.6),0_2px_4px_rgba(28,25,23,0.18)] [clip-path:polygon(0_0,100%_0,84%_100%,16%_100%)]" />
      <div className="h-2 w-16 rounded-[50%] bg-ink/15 blur-[3px]" />
    </div>
  );
}

function EntranceDoor() {
  return (
    <div className="absolute w-28" style={{ left: 26, bottom: FLOOR_H - 6 }}>
      <div className="rounded-t-md border-[6px] border-[#D9CBA8] bg-gradient-to-b from-[#F2EAD6] to-[#E6DABC] p-1.5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_4px_10px_rgba(28,25,23,0.12)]">
        <div className="flex h-56 flex-col gap-1.5">
          <div className="flex-1 rounded-sm border border-ink/10 bg-[#EFE5CC] shadow-[inset_0_1px_3px_rgba(28,25,23,0.08)]" />
          <div className="flex-1 rounded-sm border border-ink/10 bg-[#EFE5CC] shadow-[inset_0_1px_3px_rgba(28,25,23,0.08)]" />
        </div>
        <div className="absolute right-3 top-1/2 h-2.5 w-2.5 rounded-full bg-[#B9A97F] shadow-[inset_0_-1px_1px_rgba(90,70,40,0.5)]" />
      </div>
      <p className="mt-2 text-center font-mono text-[8px] uppercase tracking-[0.25em] text-muted">
        entrance
      </p>
    </div>
  );
}

/* ── the gallery ────────────────────────────────────────────────── */

export default function About() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const keys = useRef({ left: false, right: false });
  const inViewRef = useRef(false);
  const xRef = useRef(START_X);

  const [walking, setWalking] = useState(false);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [active, setActive] = useState<number | null>(null);
  const [visited, setVisited] = useState(0);
  const [bubble, setBubble] = useState<string | null>(null);
  const [waving, setWaving] = useState(false);
  const [sound, setSound] = useState(true);
  const soundRef = useRef(true);
  soundRef.current = sound;
  const motorOnRef = useRef(false);
  const visitedSet = useRef(new Set<number>());
  const bubbleTO = useRef<ReturnType<typeof setTimeout>>();
  const greetedRef = useRef(false);
  const exitToldRef = useRef(false);

  const say = (text: string, ms = 1900) => {
    clearTimeout(bubbleTO.current);
    setBubble(text);
    bubbleTO.current = setTimeout(() => setBubble(null), ms);
  };
  const sayRef = useRef(say);
  sayRef.current = say;

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const dir = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0);
      if (dir !== 0) {
        xRef.current = Math.min(WORLD_W - 90, Math.max(150, xRef.current + dir * SPEED * dt));
        setFacing(dir as 1 | -1);
      }
      setWalking(dir !== 0);

      // tread motor follows movement
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
      if (worldRef.current)
        worldRef.current.style.transform = `translate3d(${-camX}px,0,0)`;
      if (fgRef.current)
        fgRef.current.style.transform = `translate3d(${-camX * 1.32}px,0,0)`;
      if (playerRef.current)
        playerRef.current.style.transform = `translate3d(${xRef.current - 62}px,0,0)`;

      let near: number | null = null;
      PAINTINGS.forEach((_, i) => {
        if (Math.abs(FIRST_X + i * SPACING - xRef.current) < NEAR) near = i;
      });
      setActive(near);
      if (near !== null && !visitedSet.current.has(near)) {
        visitedSet.current.add(near);
        setVisited(visitedSet.current.size);
        sayRef.current(REACTIONS[visitedSet.current.size % REACTIONS.length]);
        if (soundRef.current) sfxReact();
      }
      if (!exitToldRef.current && xRef.current > WORLD_W - 320) {
        exitToldRef.current = true;
        sayRef.current("that was the tour — go say hi! ✌", 2600);
        if (soundRef.current) sfxFarewell();
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const cleanupMotor = () => {
      if (motorOnRef.current) {
        motorOnRef.current = false;
        stopMotor();
      }
    };

    const down = (e: KeyboardEvent) => {
      if (!inViewRef.current) return;
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
      cleanupMotor();
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const hold = (side: "left" | "right", on: boolean) => () => {
    keys.current[side] = on;
    if (on) unlockAudio();
  };

  return (
    <motion.section
      id="about"
      onViewportEnter={() => {
        inViewRef.current = true;
        if (!greetedRef.current) {
          greetedRef.current = true;
          setWaving(true);
          say("*beep-boop!* i'm BB-8 — your guide ✦", 2800);
          if (soundRef.current) sfxGreet();
          setTimeout(() => setWaving(false), 2600);
        }
      }}
      onViewportLeave={() => {
        inViewRef.current = false;
        keys.current.left = false;
        keys.current.right = false;
      }}
      className="py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="about me — playable"
          title="The ByteJay Gallery"
          blurb="A tiny museum about the artist — hobbies, humour and temperament. Walk in and get close to a painting to read its plaque."
        />
      </div>

      {/* ── the hall ── */}
      <div
        ref={viewportRef}
        data-cursor-label="walk ⟷"
        className="relative mt-14 h-[580px] select-none overflow-hidden border-y border-line bg-gradient-to-b from-[#FAF6EC] via-[#F6F0E2] to-[#F1EAD9]"
      >
        {/* ceiling shadow + crown molding */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-ink/10 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-2.5 bg-[#FDFAF3] shadow-[0_2px_5px_rgba(28,25,23,0.15)]" />
        <div className="absolute inset-0 bg-dots opacity-20" />

        {/* baseboard + glossy floor */}
        <div
          className="absolute inset-x-0 h-3.5 bg-gradient-to-b from-[#FBF7ED] to-[#E9DFC9] shadow-[0_3px_6px_rgba(28,25,23,0.18)]"
          style={{ bottom: FLOOR_H - 6 }}
        />
        <div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-[#E6DBC2] via-[#EFE6D0] to-[#F6EFDE]"
          style={{ height: FLOOR_H }}
        >
          <div className="absolute inset-0 bg-[repeating-linear-gradient(105deg,transparent_0px,transparent_38px,rgba(255,255,255,0.35)_40px,transparent_42px)] opacity-60" />
          <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-ink/10 to-transparent" />
        </div>

        {/* ══ world (wall layer) ══ */}
        <div ref={worldRef} className="absolute inset-0 will-change-transform">
          {/* ceiling light track */}
          <div className="absolute left-0 top-4 h-[5px] rounded-full bg-gradient-to-b from-[#D9CDB2] to-[#C3B591]" style={{ width: WORLD_W }} />

          <EntranceDoor />

          {/* wainscot wall panels between paintings */}
          {PAINTINGS.slice(0, -1).map((_, i) => (
            <div
              key={i}
              className="absolute bottom-[300px] w-32 -translate-x-1/2 rounded-sm border border-ink/10 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
              style={{ left: FIRST_X + (i + 0.5) * SPACING, height: 130 }}
            >
              <div className="h-full w-full rounded-sm border border-ink/[0.07] bg-white/20" />
            </div>
          ))}

          {/* entrance wall text */}
          <div className="absolute bottom-[276px] left-[168px] w-44">
            <p className="font-display text-2xl font-bold leading-tight tracking-tight text-ink/80 [text-shadow:0_1px_0_rgba(255,255,255,0.8)]">
              THE BYTEJAY GALLERY
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              est. 2007 · one visitor at a time
            </p>
            <p className="mt-3 font-hand text-xl text-ink-soft">walk right →</p>
          </div>

          {/* paintings */}
          {PAINTINGS.map((painting, i) => {
            const isNear = active === i;
            return (
              <div
                key={painting.title}
                className="absolute bottom-[236px] w-[240px] -translate-x-1/2"
                style={{ left: FIRST_X + i * SPACING }}
              >
                {/* track-light fixture */}
                <div className="absolute -top-[212px] left-1/2 h-7 w-4 -translate-x-1/2 rounded-b-full bg-gradient-to-b from-[#C9BB98] to-[#B3A47F] shadow-[inset_0_-2px_3px_rgba(255,255,255,0.5)]" />
                {/* light cone */}
                <div
                  className={`pointer-events-none absolute -top-[186px] left-1/2 h-[240px] w-[250px] -translate-x-1/2 blur-[7px] transition-opacity duration-700 [clip-path:polygon(46%_0,54%_0,100%_100%,0_100%)] ${
                    isNear ? "opacity-95" : "opacity-45"
                  }`}
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(255,214,150,0.5), rgba(255,214,150,0.12) 70%, transparent)",
                  }}
                />
                {/* dust motes drifting in the beam */}
                <div
                  className={`pointer-events-none absolute -top-[150px] left-1/2 h-[190px] w-[150px] -translate-x-1/2 transition-opacity duration-700 ${
                    isNear ? "opacity-80" : "opacity-30"
                  }`}
                >
                  {[[18, 22, 0], [72, 58, 900], [40, 105, 1600], [96, 130, 500], [58, 160, 2200]].map(
                    ([x, y, delay]) => (
                      <span
                        key={`${x}-${y}`}
                        className="twinkle absolute h-[3px] w-[3px] rounded-full bg-[#FFE9C4]"
                        style={{ left: x, top: y, animationDelay: `${delay}ms` }}
                      />
                    )
                  )}
                </div>
                {/* warm wall glow behind the frame */}
                <div
                  className={`pointer-events-none absolute -inset-x-14 -inset-y-10 rounded-full transition-opacity duration-700 ${
                    isNear ? "opacity-100" : "opacity-40"
                  }`}
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 40%, rgba(255,222,170,0.4), transparent 70%)",
                  }}
                />
                {/* hanging wires */}
                <div className="absolute -top-[186px] left-[26%] h-[186px] w-px origin-top rotate-[6deg] bg-ink/15" />
                <div className="absolute -top-[186px] right-[26%] h-[186px] w-px origin-top -rotate-[6deg] bg-ink/15" />

                <motion.div
                  animate={
                    isNear
                      ? { y: -8, rotate: 0, scale: 1.05 }
                      : { y: 0, rotate: i % 2 === 0 ? -1.1 : 1.1, scale: 1 }
                  }
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="relative"
                >
                  <div
                    className={`rounded-[5px] bg-gradient-to-br from-[#EADDBE] via-[#DCCCA6] to-[#C9B78D] p-[11px] shadow-[inset_0_2px_3px_rgba(255,255,255,0.8),inset_0_-2px_3px_rgba(90,70,40,0.35),0_16px_36px_rgba(28,25,23,0.22)] ${
                      isNear ? "shadow-[inset_0_2px_3px_rgba(255,255,255,0.8),inset_0_-2px_3px_rgba(90,70,40,0.35),0_26px_54px_rgba(255,120,60,0.28)]" : ""
                    }`}
                  >
                    <div className="rounded-[2px] bg-[#FDFBF5] p-3 shadow-[inset_0_0_0_1px_rgba(28,25,23,0.08)]">
                      <div className="relative flex h-[142px] items-center justify-center overflow-hidden bg-white">
                        {painting.art}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/45 via-transparent to-transparent" />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* brass title plate */}
                <div className="mx-auto mt-3 w-max max-w-full rounded-sm border border-[#B9A97F] bg-gradient-to-b from-[#F0E6C8] to-[#DECFA8] px-3 py-1 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(28,25,23,0.2)]">
                  <p className="font-display text-[11px] font-semibold tracking-wide text-ink/80">
                    {painting.title}
                  </p>
                </div>

                {/* floor reflection */}
                <div
                  className="pointer-events-none absolute left-0 right-0 -scale-y-100 opacity-[0.16] blur-[3px] [mask-image:linear-gradient(to_top,black,transparent_75%)]"
                  style={{ top: "calc(100% + 66px)" }}
                >
                  <div className="rounded-[5px] bg-gradient-to-br from-[#EADDBE] to-[#C9B78D] p-[11px]">
                    <div className="bg-white p-3">
                      <div className="flex h-[142px] items-center justify-center">{painting.art}</div>
                    </div>
                  </div>
                </div>
                {/* floor light pool */}
                <div
                  className={`pointer-events-none absolute left-1/2 h-7 w-64 -translate-x-1/2 rounded-[50%] blur-md transition-opacity duration-700 ${
                    isNear ? "opacity-80" : "opacity-35"
                  }`}
                  style={{
                    top: "calc(100% + 70px)",
                    background: "radial-gradient(ellipse, rgba(255,226,170,0.65), transparent 70%)",
                  }}
                />

                {/* plaque */}
                <AnimatePresence>
                  {isNear && (
                    <motion.div
                      initial={{ opacity: 0, y: 14, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.96 }}
                      transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
                      className="absolute left-1/2 top-full z-20 mt-3 w-[290px] -translate-x-1/2 rounded-xl border border-line bg-surface/95 p-4 shadow-[0_18px_44px_rgba(28,25,23,0.16)] backdrop-blur"
                    >
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
                        {painting.medium}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                        {painting.body}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* exit sign + wall text */}
          <div
            className="absolute top-9 rounded-md border border-[#A9BFA0] bg-[#E4EEDD] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.25em] text-[#5B7A5B] shadow-[0_0_14px_rgba(140,180,130,0.55)]"
            style={{ left: WORLD_W - 180 }}
          >
            exit →
          </div>
          <div className="absolute bottom-[276px] w-52" style={{ left: WORLD_W - 280 }}>
            <p className="font-hand text-2xl leading-snug text-ink-soft">
              the artist is friendly —{" "}
              <a href="#contact" className="text-accent underline decoration-2 underline-offset-4">
                say hi
              </a>
            </p>
          </div>

          {/* the visitor + speech + reflection */}
          <div ref={playerRef} className="absolute bottom-[86px] left-0 will-change-transform">
            <AnimatePresence>
              {bubble && (
                <motion.div
                  key={bubble}
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.9 }}
                  transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="absolute -top-9 left-1/2 z-30 w-max max-w-[220px] -translate-x-1/2 -rotate-2 rounded-xl border border-line bg-surface/95 px-3 py-1 font-hand text-lg leading-tight text-ink shadow-[0_6px_18px_rgba(28,25,23,0.14)]"
                >
                  {bubble}
                  <span className="absolute -bottom-[5px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b border-r border-line bg-surface/95" />
                </motion.div>
              )}
            </AnimatePresence>
            <BB8Visitor walking={walking} facing={facing} waving={waving} />
            <div className="mx-auto -mt-4 h-2.5 w-16 rounded-[50%] bg-ink/20 blur-[3px]" />
            <div className="pointer-events-none -mt-3 -scale-y-100 opacity-[0.14] blur-[2px] [mask-image:linear-gradient(to_top,black,transparent_70%)]">
              <BB8Visitor walking={walking} facing={facing} />
            </div>
          </div>
        </div>

        {/* ══ foreground layer: closer, faster, softly out of focus ══ */}
        <div
          ref={fgRef}
          className="pointer-events-none absolute inset-0 will-change-transform"
          aria-hidden
        >
          <div className="absolute bottom-2 blur-[2.5px]" style={{ left: 360 }}>
            <Plant />
          </div>
          <div className="absolute bottom-3 blur-[2.5px]" style={{ left: 1560 }}>
            <Bench />
          </div>
          <div className="absolute bottom-2 blur-[2.5px]" style={{ left: 2780 }}>
            <Plant />
          </div>
          <div className="absolute bottom-3 blur-[2.5px]" style={{ left: 3980 }}>
            <Bench />
          </div>
          <div className="absolute bottom-2 blur-[2.5px]" style={{ left: 5300 }}>
            <Plant />
          </div>
        </div>

        {/* soft vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_58%,rgba(28,25,23,0.08))]" />

        {/* HUD */}
        <div className="pointer-events-none absolute inset-x-0 top-4 flex items-start justify-between px-5">
          <p className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted sm:flex">
            <span className="rounded border border-ink/20 bg-surface/60 px-1.5 py-0.5">←</span>
            <span className="rounded border border-ink/20 bg-surface/60 px-1.5 py-0.5">→</span>
            or A / D to walk
          </p>
          <span className="pointer-events-auto flex items-center gap-3">
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
              className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors ${
                sound
                  ? "border-accent/50 bg-accent/10 text-accent"
                  : "border-ink/20 bg-surface/60 text-muted"
              }`}
            >
              {sound ? "sfx on" : "sfx off"}
            </button>
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
              <PixelIcon name="spark" className="h-2.5 w-2.5 text-accent" />
              seen {visited}/{PAINTINGS.length}
            </span>
          </span>
        </div>

        {/* touch controls */}
        <div className="absolute bottom-5 right-5 flex gap-3 sm:hidden">
          {(["left", "right"] as const).map((side) => (
            <button
              key={side}
              type="button"
              aria-label={`walk ${side}`}
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
    </motion.section>
  );
}
