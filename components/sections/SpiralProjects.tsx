"use client";

/*
 * Things I'm building — the spiral, now the projects section.
 * pacomepertant.com's WebGL works gallery driving Jay's GitHub repos:
 * cards are canvas-drawn from live GitHub data (baked fallback below),
 * the section pins while page scroll spins the whole collection past,
 * hover reveals the repo's details, click opens it on GitHub.
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import SectionHeading from "../SectionHeading";

/* ── palette ────────────────────────────────────────────────────── */

const INK = "#1C1917";
const ACCENT = "#FF4D24";
const BG = "#0a0a0a";
const WHITE = "#fafafa";
const POP = "#21FFC0";
const PAPER = "#FDFBF5";

/* ── the projects ───────────────────────────────────────────────── */

const GITHUB_USER = "BYTEJAYS";

type Project = {
  name: string;
  description: string;
  language: string;
  stars: number;
  topics: string[];
  url: string;
  homepage: string | null;
  year: number;
  isPrivate?: boolean;
};

/* snapshot of github.com/BYTEJAYS (Jul 2026) — used until the live fetch lands */
const FALLBACK_PROJECTS: Project[] = [
  {
    name: "TRANSACTION-GRAPH-ENGINE",
    description:
      "TGIE — Transaction Graph Intelligence Engine: real-time graph-based fraud detection platform",
    language: "Python",
    stars: 0,
    topics: [],
    url: "https://github.com/BYTEJAYS/TRANSACTION-GRAPH-ENGINE",
    homepage: null,
    year: 2026,
  },
  {
    name: "bling-blue-team",
    description:
      "Forensic fraud detection engine — 3-tier ML pipeline, XGBoost + SHAP explainability, STR report generation · Built for Union Bank of India hackathon",
    language: "Python",
    stars: 0,
    topics: [],
    url: "https://github.com/BYTEJAYS/bling-blue-team",
    homepage: null,
    year: 2026,
  },
  {
    name: "bytejay-site",
    description:
      "ByteJay — personal portfolio. Next.js, Tailwind, Framer Motion, and one 3D Saint Bernard.",
    language: "TypeScript",
    stars: 0,
    topics: [],
    url: "https://github.com/BYTEJAYS/bytejay-site",
    homepage: "https://me-ten-red.vercel.app",
    year: 2026,
  },
  {
    name: "PORTFOLIO-WEBSITE",
    description:
      "Cinematic 3D portfolio — Next.js 14, React Three Fiber, Framer Motion, neural network scenes, ENIAC boot sequence",
    language: "TypeScript",
    stars: 0,
    topics: [],
    url: "https://github.com/BYTEJAYS/PORTFOLIO-WEBSITE",
    homepage: "https://portfolio-website-alpha-ochre-52.vercel.app",
    year: 2026,
  },
  {
    name: "BYTEJAYS",
    description: "BYTEJAY — terminal-style profile",
    language: "Python",
    stars: 0,
    topics: [],
    url: "https://github.com/BYTEJAYS/BYTEJAYS",
    homepage: null,
    year: 2026,
  },
];

/* private / local builds — not visible on the public GitHub API, curated here */
const PRIVATE_PROJECTS: Project[] = [
  {
    name: "personal reality layer",
    description:
      "PRL / CORTEX — what if a lifetime was queryable? Memories, journals, wisdom and life patterns captured into an interactive digital brain: part archive, part biopic, part time machine",
    language: "AI",
    stars: 0,
    topics: ["memory-systems", "timelines", "ai"],
    url: `https://github.com/${GITHUB_USER}`,
    homepage: null,
    year: 2026,
    isPrivate: true,
  },
  {
    name: "lumen glass",
    description:
      "Software-defined holographic glass storage — data written into virtual glass as voxel planes with compression, error correction and GlassOS, a studio for watching your bytes crystallise",
    language: "Python",
    stars: 0,
    topics: ["simulation", "compression", "5d-storage"],
    url: `https://github.com/${GITHUB_USER}`,
    homepage: null,
    year: 2026,
    isPrivate: true,
  },
  {
    name: "growthdesk",
    description:
      "Multi-tenant AI agent-team SaaS — FastAPI backend + Next.js dashboard: billing, security hardening, GDPR export/erasure, agency white-label · 139 tests",
    language: "Python",
    stars: 0,
    topics: ["fastapi", "nextjs", "saas", "ai-agents"],
    url: `https://github.com/${GITHUB_USER}`,
    homepage: null,
    year: 2026,
    isPrivate: true,
  },
  {
    name: "ath",
    description:
      "Wearable multi-brain AI companion — FastAPI decision engine with pluggable brains and a hardware dial UI · 36 tests",
    language: "Python",
    stars: 0,
    topics: ["fastapi", "wearable", "ai"],
    url: `https://github.com/${GITHUB_USER}`,
    homepage: null,
    year: 2026,
    isPrivate: true,
  },
  {
    name: "autopark ai receptionist",
    description:
      "AI phone receptionist backend — pluggable telephony/STT/TTS/LLM pipeline speaking hindi, english, marathi & gujarati · 50 tests",
    language: "Python",
    stars: 0,
    topics: ["fastapi", "voice", "telephony", "llm"],
    url: `https://github.com/${GITHUB_USER}`,
    homepage: null,
    year: 2026,
    isPrivate: true,
  },
  {
    name: "niveshsaathi",
    description:
      "Retail investing awareness MVP — education-first investing companion with risk & suitability engines, Groww-inspired UI",
    language: "TypeScript",
    stars: 0,
    topics: ["nextjs", "fintech", "education"],
    url: `https://github.com/${GITHUB_USER}`,
    homepage: null,
    year: 2026,
    isPrivate: true,
  },
  {
    name: "kitchenflow cafe",
    description:
      "Cinematic 3D café gameplay — scripted single-customer journey with dialogue, camera direction and menu systems in React Three Fiber",
    language: "TypeScript",
    stars: 0,
    topics: ["r3f", "threejs", "game"],
    url: `https://github.com/${GITHUB_USER}`,
    homepage: null,
    year: 2026,
    isPrivate: true,
  },
  {
    name: "cafe sim",
    description:
      "3D café simulation frontend — command → adapter → event → store architecture built to swap a mock backend for a real one",
    language: "TypeScript",
    stars: 0,
    topics: ["r3f", "zustand", "architecture"],
    url: `https://github.com/${GITHUB_USER}`,
    homepage: null,
    year: 2026,
    isPrivate: true,
  },
  {
    name: "mangalamsweets",
    description:
      "A storefront website built for a real sweet shop — Mangalam Sweets, served fresh on the web",
    language: "TypeScript",
    stars: 0,
    topics: ["storefront", "business"],
    url: `https://github.com/${GITHUB_USER}`,
    homepage: null,
    year: 2026,
    isPrivate: true,
  },
  {
    name: "party racer",
    description: "A chaotic little party-racing game experiment — built for laughs, kept for the lessons",
    language: "JavaScript",
    stars: 0,
    topics: ["game", "experiment"],
    url: `https://github.com/${GITHUB_USER}`,
    homepage: null,
    year: 2026,
    isPrivate: true,
  },
  {
    name: "leet code",
    description: "The daily grind — data structures & algorithms, one problem at a time",
    language: "Python",
    stars: 0,
    topics: ["dsa", "practice"],
    url: `https://github.com/${GITHUB_USER}`,
    homepage: null,
    year: 2026,
    isPrivate: true,
  },
  {
    name: "constellation",
    description: "Under wraps — a private build in progress. Ask me about it",
    language: "secret",
    stars: 0,
    topics: [],
    url: `https://github.com/${GITHUB_USER}`,
    homepage: null,
    year: 2026,
    isPrivate: true,
  },
  {
    name: "ascension",
    description: "Under wraps — a private build in progress. Ask me about it",
    language: "secret",
    stars: 0,
    topics: [],
    url: `https://github.com/${GITHUB_USER}`,
    homepage: null,
    year: 2026,
    isPrivate: true,
  },
  {
    name: "synthetic genesis",
    description: "Under wraps — a private build in progress. Ask me about it",
    language: "secret",
    stars: 0,
    topics: [],
    url: `https://github.com/${GITHUB_USER}`,
    homepage: null,
    year: 2026,
    isPrivate: true,
  },
  {
    name: "legacy",
    description: "Under wraps — a private build in progress. Ask me about it",
    language: "secret",
    stars: 0,
    topics: [],
    url: `https://github.com/${GITHUB_USER}`,
    homepage: null,
    year: 2026,
    isPrivate: true,
  },
  {
    name: "lumi",
    description: "Under wraps — a private build in progress. Ask me about it",
    language: "secret",
    stars: 0,
    topics: [],
    url: `https://github.com/${GITHUB_USER}`,
    homepage: null,
    year: 2026,
    isPrivate: true,
  },
];

function useGithubProjects() {
  const [projects, setProjects] = useState<Project[]>([
    ...FALLBACK_PROJECTS,
    ...PRIVATE_PROJECTS,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`, {
      signal: controller.signal,
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((repos: Record<string, unknown>[]) => {
        const mapped: Project[] = repos
          .map((r) => ({
            name: String(r.name),
            description: String(r.description ?? "no description yet — the code speaks for itself"),
            language: String(r.language ?? "…"),
            stars: Number(r.stargazers_count ?? 0),
            topics: Array.isArray(r.topics) ? (r.topics as string[]).slice(0, 4) : [],
            url: String(r.html_url),
            homepage: r.homepage ? String(r.homepage) : null,
            year: new Date(String(r.created_at)).getFullYear(),
          }));
        if (
          mapped.length > 0 &&
          JSON.stringify(mapped.map((p) => p.name)) !==
            JSON.stringify(FALLBACK_PROJECTS.map((p) => p.name))
        ) {
          setProjects([...mapped, ...PRIVATE_PROJECTS]);
        }
      })
      .catch(() => {
        /* offline or rate-limited — the baked snapshot stands in */
      });
    return () => controller.abort();
  }, []);

  return projects;
}

/* ── shaders (ported from the reference site) ───────────────────── */

const VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;
#define PI 3.14159265359

uniform float uScrollSpeed;

void main() {
  vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  vec3 newPosition = position;
  newPosition.z = sin(uv.x * PI) * 0.2;

  vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  viewPosition.x += pow(worldPosition.y, 2.0) * 0.1;
  viewPosition.x += sin(uv.y * PI) * uScrollSpeed * 2.0;
  gl_Position = projectionMatrix * viewPosition;

  vUv = uv;
}
`;

const FRAGMENT_SHADER = /* glsl */ `
uniform sampler2D uTexture;
uniform float uColorStrength;
uniform float uZoom;
uniform vec2 uPlaneSizes;
uniform vec2 uImageSizes;
uniform float uRevealProgress;

varying vec2 vUv;

float roundedRectSDF(vec2 uv, vec2 size, float radius) {
  vec2 d = abs(uv - 0.5) - size * 0.5 + radius;
  return length(max(d, 0.0)) - radius;
}

void main() {
  vec2 ratio = vec2(
    min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
    min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
  );

  vec2 uv = vec2(
    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );

  vec2 zoomedUv = (uv - 0.5) / uZoom + 0.5;

  vec4 color;

  if (gl_FrontFacing) {
    color = texture2D(uTexture, zoomedUv);
    color = vec4(mix(color.rgb, vec3(0.0), uColorStrength), color.a);
  } else {
    float offset = 40.0 / 1024.0;
    vec4 c = vec4(0.0);
    c += texture2D(uTexture, uv + vec2(-offset, -offset)) * 1.0;
    c += texture2D(uTexture, uv + vec2( 0.0,    -offset)) * 2.0;
    c += texture2D(uTexture, uv + vec2( offset, -offset)) * 1.0;
    c += texture2D(uTexture, uv + vec2(-offset,  0.0))    * 2.0;
    c += texture2D(uTexture, uv)                          * 4.0;
    c += texture2D(uTexture, uv + vec2( offset,  0.0))    * 2.0;
    c += texture2D(uTexture, uv + vec2(-offset,  offset)) * 1.0;
    c += texture2D(uTexture, uv + vec2( 0.0,     offset)) * 2.0;
    c += texture2D(uTexture, uv + vec2( offset,  offset)) * 1.0;
    c /= 16.0;
    color = c;
  }

  float reveal = clamp(uRevealProgress, 0.0, 1.0);
  vec2 revealSize = vec2(reveal);
  float radius = 0.05 * reveal;
  float sdf = roundedRectSDF(vUv, revealSize, radius);
  float alpha = 1.0 - smoothstep(0.0, 0.002, sdf);
  alpha *= smoothstep(0.1, 1.0, uRevealProgress);

  /* liquid glass: the card texture carries its own translucency */
  gl_FragColor = vec4(color.rgb, alpha * color.a);
}
`;

/* ── spiral constants (ported verbatim) ─────────────────────────── */

const PLANE_W = 2.15;
const PLANE_H = 1.26;
const VERTICAL_GAP = 0.58;
const ANGLE_GAP = 0.92;
const BASE_RADIUS = 2.45;
const TEX_W = 1088;
const TEX_H = 640;
// pinned scroll: how far the page must scroll (in vh) per card of the tour
const SCROLL_VH_PER_CARD = 28;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/* ── tiny synth (hover ticks & clicks, no audio files) ──────────── */

let audioCtx: AudioContext | null = null;
function blip(freq: number, dur: number, gain: number, sweep = 1) {
  try {
    audioCtx ??= new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (audioCtx.state === "suspended") void audioCtx.resume();
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    if (sweep !== 1) osc.frequency.exponentialRampToValueAtTime(freq * sweep, t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  } catch {
    /* audio unavailable — stay silent */
  }
}

/* ── shared mutable state between the R3F scene and the overlay ── */

type PlaneState = {
  hoverTarget: number;
  hoverProgress: number;
  hiddenTarget: number;
  hiddenProgress: number;
  isHidden: boolean;
};

type GalleryStore = {
  targetWheelDeltaY: number;
  wheelDeltaY: number;
  scrollOffset: number;
  scrollDriven: number; // rotation contributed by the pinned page scroll
  lastTotal: number;
  speed: number; // smoothed per-frame rotation, feeds the bend shader
  frontIndex: number;
  wheelDirection: 1 | -1;
  mouse: THREE.Vector2;
  pointerInside: boolean;
  dragMoved: number;
  interactive: boolean; // false while list mode is up
  inView: boolean;
  sfx: boolean;
  hovered: number | null;
  planes: PlaneState[];
};

function createStore(planeCount: number): GalleryStore {
  return {
    targetWheelDeltaY: 0,
    wheelDeltaY: 0,
    scrollOffset: 0,
    scrollDriven: 0,
    lastTotal: 0,
    speed: 0,
    frontIndex: 0,
    wheelDirection: 1,
    mouse: new THREE.Vector2(-10, -10),
    pointerInside: false,
    dragMoved: 0,
    interactive: true,
    inView: false,
    sfx: true,
    hovered: null,
    planes: Array.from({ length: planeCount }, () => ({
      hoverTarget: 0,
      hoverProgress: 0,
      hiddenTarget: 1,
      hiddenProgress: 1,
      isHidden: true,
    })),
  };
}

function revealPlanes(store: GalleryStore) {
  store.planes.forEach((p, i) => {
    setTimeout(() => {
      p.isHidden = false;
      p.hiddenTarget = 0;
    }, (i % 4) * 50);
  });
}

function hidePlanes(store: GalleryStore) {
  store.planes.forEach((p, i) => {
    setTimeout(() => {
      p.isHidden = true;
      p.hiddenTarget = 1;
    }, (i % 4) * 30);
  });
}

/* ── textures: each repo painted as a gallery card ──────────────── */

function fitTitleLines(
  ctx: CanvasRenderingContext2D,
  title: string,
  maxWidth: number,
  displayFont: string
): { lines: string[]; size: number } {
  const words = title.split(" ");
  for (let size = 104; size >= 44; size -= 4) {
    ctx.font = `600 ${size}px ${displayFont}`;
    if (ctx.measureText(title).width <= maxWidth) return { lines: [title], size };
    if (words.length > 1) {
      // balanced two-line split
      let best: string[] | null = null;
      for (let cut = 1; cut < words.length; cut++) {
        const a = words.slice(0, cut).join(" ");
        const b = words.slice(cut).join(" ");
        if (ctx.measureText(a).width <= maxWidth && ctx.measureText(b).width <= maxWidth) {
          best = [a, b];
          break;
        }
      }
      if (best) return { lines: best, size };
    }
  }
  return { lines: [title], size: 44 };
}

/* each card gets its own dreamy hue pair, cycled through the collection */
const CARD_HUES: [string, string][] = [
  ["#8B7BD8", "#E58BA8"], // violet / rose
  ["#5FD4C4", "#7BB8E8"], // mint / sky
  ["#FF8A65", "#F5C97B"], // coral / gold
  ["#E58BA8", "#7BB8E8"], // rose / sky
  ["#7BB8E8", "#8B7BD8"], // sky / violet
  ["#F5C97B", "#5FD4C4"], // gold / mint
];

function hexToRgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function roundedPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawProjectCard(
  canvas: HTMLCanvasElement,
  project: Project,
  index: number,
  displayFont: string,
  monoFont: string
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const [hueA, hueB] = CARD_HUES[index % CARD_HUES.length];

  ctx.clearRect(0, 0, TEX_W, TEX_H);
  roundedPath(ctx, 6, 6, TEX_W - 12, TEX_H - 12, 46);
  ctx.save();
  ctx.clip();

  // smoked glass base — translucent, so the spiral shows through
  ctx.fillStyle = "rgba(13,13,20,0.58)";
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // aurora blobs drifting in the glass
  let g = ctx.createRadialGradient(TEX_W * 0.16, TEX_H * 0.92, 0, TEX_W * 0.16, TEX_H * 0.92, TEX_W * 0.62);
  g.addColorStop(0, hexToRgba(hueA, 0.55));
  g.addColorStop(1, hexToRgba(hueA, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  g = ctx.createRadialGradient(TEX_W * 0.9, TEX_H * 0.1, 0, TEX_W * 0.9, TEX_H * 0.1, TEX_W * 0.55);
  g.addColorStop(0, hexToRgba(hueB, 0.42));
  g.addColorStop(1, hexToRgba(hueB, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  g = ctx.createRadialGradient(TEX_W * 0.55, TEX_H * 0.5, 0, TEX_W * 0.55, TEX_H * 0.5, TEX_W * 0.7);
  g.addColorStop(0, "rgba(255,255,255,0.06)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // diagonal sheen
  g = ctx.createLinearGradient(0, 0, TEX_W, TEX_H);
  g.addColorStop(0.32, "rgba(255,255,255,0)");
  g.addColorStop(0.44, "rgba(255,255,255,0.09)");
  g.addColorStop(0.56, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  ctx.restore();

  // glass rim + top highlight
  roundedPath(ctx, 8, 8, TEX_W - 16, TEX_H - 16, 44);
  ctx.strokeStyle = "rgba(255,255,255,0.26)";
  ctx.lineWidth = 3;
  ctx.stroke();
  g = ctx.createLinearGradient(0, 8, 0, 120);
  g.addColorStop(0, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  roundedPath(ctx, 10, 10, TEX_W - 20, TEX_H - 20, 42);
  ctx.strokeStyle = g;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // header row — plate number & year, language
  ctx.font = `500 24px ${monoFont}`;
  ctx.fillStyle = "rgba(255,255,255,0.62)";
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.fillText(`${String(index + 1).padStart(2, "0")} — ${project.year}`, 56, 54);
  ctx.textAlign = "right";
  ctx.fillText(project.language.toUpperCase(), TEX_W - 56, 54);

  // title, auto-fitted, lowercase, glowing softly in the glass
  const title = project.name.replace(/[-_]/g, " ").toLowerCase();
  const { lines, size } = fitTitleLines(ctx, title, TEX_W - 140, displayFont);
  ctx.textAlign = "left";
  ctx.font = `600 ${size}px ${displayFont}`;
  const lineH = size * 1.08;
  const blockH = lines.length * lineH;
  const top = (TEX_H - blockH) / 2 - 12;
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  lines.forEach((line, i) => ctx.fillText(line, 68, top + i * lineH));
  ctx.shadowBlur = 0;

  // hue underline
  ctx.fillStyle = hueA;
  ctx.fillRect(70, top + blockH + 18, 64, 9);

  // one-line description, ellipsised
  ctx.font = `400 23px ${monoFont}`;
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  let desc = project.description;
  while (desc.length > 3 && ctx.measureText(desc).width > TEX_W - 240) {
    desc = desc.slice(0, -4) + "…";
  }
  ctx.fillText(desc, 56, TEX_H - 84);

  // stars or the private mark, bottom-right
  if (project.stars > 0 || project.isPrivate) {
    ctx.textAlign = "right";
    ctx.fillStyle = hueB;
    ctx.fillText(project.isPrivate ? "private" : `★ ${project.stars}`, TEX_W - 56, TEX_H - 84);
  }
}

function useProjectTextures(projects: Project[]) {
  const [assets, setAssets] = useState<{ textures: THREE.Texture[]; images: string[] } | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await document.fonts.ready.catch(() => undefined);
      if (cancelled) return;
      const root = getComputedStyle(document.documentElement);
      const displayFont = root.getPropertyValue("--font-space").trim() || "sans-serif";
      const monoFont = root.getPropertyValue("--font-mono").trim() || "monospace";

      const textures: THREE.Texture[] = [];
      const images: string[] = [];
      for (const [i, project] of projects.entries()) {
        const canvas = document.createElement("canvas");
        canvas.width = TEX_W;
        canvas.height = TEX_H;
        drawProjectCard(canvas, project, i, displayFont, monoFont);
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        textures.push(texture);
        images.push(canvas.toDataURL("image/png"));
      }
      if (!cancelled) setAssets({ textures, images });
    })();

    return () => {
      cancelled = true;
    };
  }, [projects]);

  return assets;
}

/* ── the WebGL spiral ───────────────────────────────────────────── */

function SpiralScene({
  store,
  textures,
  projectCount,
  wrapperRef,
  onHover,
  onOpen,
  onFront,
}: {
  store: GalleryStore;
  textures: THREE.Texture[];
  projectCount: number;
  wrapperRef: React.RefObject<HTMLDivElement>;
  onHover: (index: number | null) => void;
  onOpen: (index: number) => void;
  onFront: (index: number) => void;
}) {
  const { camera, gl, size } = useThree();
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1, 8, 8), []);
  const planeCount = projectCount * 2; // duplicated so the loop never shows a seam
  const centerIndex = Math.floor(planeCount / 2);

  const materials = useMemo(
    () =>
      Array.from({ length: planeCount }, (_, i) => {
        const tex = textures[i % projectCount];
        return new THREE.ShaderMaterial({
          uniforms: {
            uTexture: new THREE.Uniform(tex),
            uColorStrength: new THREE.Uniform(0),
            uZoom: new THREE.Uniform(1),
            uPlaneSizes: new THREE.Uniform(new THREE.Vector2(PLANE_W, PLANE_H)),
            uImageSizes: new THREE.Uniform(new THREE.Vector2(TEX_W, TEX_H)),
            uRevealProgress: new THREE.Uniform(0),
            uScrollSpeed: new THREE.Uniform(0),
          },
          vertexShader: VERTEX_SHADER,
          fragmentShader: FRAGMENT_SHADER,
          transparent: true,
          side: THREE.DoubleSide,
        });
      }),
    [textures, planeCount, projectCount]
  );

  useEffect(
    () => () => {
      geometry.dispose();
      materials.forEach((m) => m.dispose());
    },
    [geometry, materials]
  );

  // responsive fov, camera pulled in so the cards fill the stage
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = size.width < 900 ? 45 : 35;
    cam.position.set(0, 0, 7.1);
    cam.updateProjectionMatrix();
  }, [camera, size.width]);

  // pointer + drag controls on the canvas element
  useEffect(() => {
    const el = gl.domElement;
    let dragging = false;
    let lastX = 0;
    let velocity = 0;
    let isTouchDrag = false;

    const updateMouse = (clientX: number, clientY: number) => {
      const rect = el.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;
      const inside = x >= -1 && x <= 1 && y >= -1 && y <= 1;
      store.pointerInside = inside;
      store.mouse.set(inside ? x : -10, inside ? y : -10);
    };

    const applyDrag = (dx: number) => {
      const m = -dx * 0.5;
      store.targetWheelDeltaY -= m * 0.003;
      store.targetWheelDeltaY = clamp(store.targetWheelDeltaY, -2, 2);
      store.wheelDirection = m < 0 ? 1 : -1;
      velocity = m;
    };

    const onMouseMove = (e: MouseEvent) => {
      updateMouse(e.clientX, e.clientY);
      if (dragging) {
        const dx = e.clientX - lastX;
        store.dragMoved += Math.abs(dx);
        applyDrag(dx);
        lastX = e.clientX;
      }
    };
    const onMouseDown = (e: MouseEvent) => {
      dragging = true;
      lastX = e.clientX;
      velocity = 0;
      store.dragMoved = 0;
    };
    const onMouseUp = () => {
      if (!dragging) return;
      dragging = false;
      if (store.dragMoved > 8) {
        store.targetWheelDeltaY -= velocity * 0.002;
        store.targetWheelDeltaY = clamp(store.targetWheelDeltaY, -2, 2);
      } else if (store.hovered !== null && store.interactive) {
        onOpen(store.hovered % projectCount);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      lastX = t.clientX;
      velocity = 0;
      store.dragMoved = 0;
      isTouchDrag = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const dx = t.clientX - lastX;
      store.dragMoved += Math.abs(dx);
      if (!isTouchDrag && store.dragMoved > 8) isTouchDrag = true;
      if (isTouchDrag) {
        if (e.cancelable) e.preventDefault();
        applyDrag(dx);
      }
      lastX = t.clientX;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (isTouchDrag) {
        store.targetWheelDeltaY -= velocity * 0.002;
        store.targetWheelDeltaY = clamp(store.targetWheelDeltaY, -2, 2);
        isTouchDrag = false;
        return;
      }
      // tap → raycast the touched point
      const touch = e.changedTouches[0];
      if (!touch || !store.interactive) return;
      updateMouse(touch.clientX, touch.clientY);
      raycaster.setFromCamera(store.mouse, camera);
      const meshes = meshRefs.current.filter(Boolean) as THREE.Mesh[];
      const hit = raycaster.intersectObjects(meshes, false)[0];
      if (!hit || !hit.face) return;
      const idx = meshes.indexOf(hit.object as THREE.Mesh);
      const state = store.planes[idx];
      const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
      if (state && state.hiddenProgress < 0.01 && normal.dot(raycaster.ray.direction) < 0) {
        onOpen(idx % projectCount);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [gl, camera, raycaster, store, onOpen, projectCount]);

  useFrame((_, delta) => {
    if (!store.inView) return;
    const dt = Math.min(50, delta * 1000);

    // drag/idle controls — easing, idle drift, friction (ported verbatim)
    store.wheelDeltaY += (store.targetWheelDeltaY - store.wheelDeltaY) * 0.1;
    store.scrollOffset += store.wheelDeltaY;
    if (Math.abs(store.targetWheelDeltaY) < 0.002) {
      store.targetWheelDeltaY = store.wheelDirection * 0.002;
    }
    store.targetWheelDeltaY *= 0.9;

    // page scroll drives the tour: pinned progress 0→1 walks every project once
    const wrapper = wrapperRef.current;
    if (wrapper) {
      const rect = wrapper.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      if (range > 0) {
        const progress = clamp(-rect.top / range, 0, 1);
        store.scrollDriven = progress * projectCount;
      }
    }

    const total = store.scrollOffset + store.scrollDriven;
    store.speed = lerp(store.speed, clamp(total - store.lastTotal, -2, 2), 0.12);
    store.lastTotal = total;

    const front = ((Math.round(total) % projectCount) + projectCount) % projectCount;
    if (front !== store.frontIndex) {
      store.frontIndex = front;
      onFront(front);
    }

    // hover raycast every frame, front faces only
    let hovered: number | null = null;
    if (store.interactive && store.pointerInside) {
      raycaster.setFromCamera(store.mouse, camera);
      const meshes = meshRefs.current.filter(Boolean) as THREE.Mesh[];
      const hit = raycaster.intersectObjects(meshes, false)[0];
      if (hit && hit.face) {
        const idx = meshes.indexOf(hit.object as THREE.Mesh);
        const state = store.planes[idx];
        const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
        if (state && state.hiddenProgress < 0.01 && normal.dot(raycaster.ray.direction) < 0) {
          hovered = idx;
        }
      }
    }
    if (hovered !== store.hovered) {
      store.hovered = hovered;
      gl.domElement.style.cursor = hovered !== null ? "pointer" : "default";
      if (hovered !== null && store.sfx) blip(1500, 0.05, 0.045);
      onHover(hovered === null ? null : hovered % projectCount);
    }
    store.planes.forEach((p, i) => {
      p.hoverTarget = i === hovered ? 1 : 0;
    });

    // per-plane update (ported verbatim)
    store.planes.forEach((p, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;

      const hiddenShift = p.isHidden ? 1.5 : -1.5;
      const hoverEase = 1 - Math.pow(1 - (p.hoverTarget === 1 ? 0.09 : 0.07), dt * 0.2);
      p.hoverProgress = lerp(p.hoverProgress, p.hoverTarget, hoverEase);
      const hiddenEase = 1 - Math.pow(1 - 0.05, dt * 0.15);
      p.hiddenProgress = lerp(p.hiddenProgress, p.hiddenTarget, hiddenEase);

      let n = i - total;
      n = ((n % planeCount) + planeCount) % planeCount;
      const b = n - centerIndex;
      const y = b * VERTICAL_GAP - 0.8 - p.hiddenProgress * hiddenShift;
      const radius = BASE_RADIUS * (1 - p.hiddenProgress / 2);
      const angle = b * ANGLE_GAP;
      mesh.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      mesh.rotation.y = -angle + Math.PI / 2;

      const u = materials[i].uniforms;
      u.uColorStrength.value = 0.55 * p.hoverProgress;
      u.uZoom.value = 1 + 0.05 * p.hoverProgress;
      u.uRevealProgress.value = (1 - p.hoverProgress * 0.05) * (1 - p.hiddenProgress);
      u.uScrollSpeed.value = store.speed;
    });
  });

  return (
    <>
      {materials.map((material, i) => (
        <mesh
          key={i}
          ref={(m) => {
            meshRefs.current[i] = m;
          }}
          geometry={geometry}
          material={material}
          scale={[PLANE_W, PLANE_H, 1]}
        />
      ))}
    </>
  );
}

/* ── list mode: trailing cursor previews (ported behaviour) ─────── */

function CursorTrail({
  hovered,
  images,
  containerRef,
}: {
  hovered: number | null;
  images: string[];
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [stack, setStack] = useState<{ id: string; index: number }[]>([]);
  const hoveredRef = useRef<number | null>(null);
  hoveredRef.current = hovered;

  useEffect(() => {
    if (hovered === null) return;
    setStack((prev) => {
      if (prev[prev.length - 1]?.index === hovered) return prev;
      const next = prev.length >= 5 ? prev.slice(1) : prev.slice();
      next.push({ id: `${hovered}-${Date.now()}`, index: hovered });
      return next;
    });
  }, [hovered]);

  useEffect(() => {
    const pos = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let scale = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
    };
    const loop = () => {
      pos.x = lerp(pos.x, target.x, 0.1);
      pos.y = lerp(pos.y, target.y, 0.1);
      scale = lerp(scale, hoveredRef.current !== null ? 1 : 0.5, 0.07);
      if (wrapperRef.current) {
        wrapperRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-25%, -75%) scale(${scale})`;
      }
      if (scale <= 0.01 && hoveredRef.current === null) setStack([]);
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [containerRef]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden
      className={`pointer-events-none absolute left-0 top-0 z-0 w-[300px] transition-opacity duration-300 ${
        hovered === null ? "opacity-0" : "opacity-100"
      }`}
    >
      {stack.map((item) => (
        <img
          key={item.id}
          src={images[item.index]}
          alt=""
          className="absolute left-0 top-0 aspect-[17/10] w-[300px] rounded-xl object-cover"
          style={{ animation: "sg-pop .5s cubic-bezier(0.16,1,0.3,1) forwards" }}
        />
      ))}
    </div>
  );
}

/* ── the section ────────────────────────────────────────────────── */

export default function SpiralProjects() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const projects = useGithubProjects();
  const assets = useProjectTextures(projects);
  const store = useMemo(() => createStore(projects.length * 2), [projects]);

  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"spiral" | "list">("spiral");
  const [front, setFront] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [listHovered, setListHovered] = useState<number | null>(null);
  const [sfx, setSfx] = useState(true);
  const revealedRef = useRef(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    store.sfx = sfx;
  }, [sfx, store]);
  useEffect(() => {
    store.interactive = mode === "spiral";
  }, [mode, store]);

  // reveal once the section scrolls into view; pause updates outside it
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !assets) return;
    revealedRef.current = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        store.inView = entry.isIntersecting;
        if (entry.isIntersecting && !revealedRef.current) {
          revealedRef.current = true;
          revealPlanes(store);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [assets, store]);

  const handleFront = (index: number) => {
    setFront(index);
    if (store.sfx && store.inView) blip(980, 0.04, 0.03);
  };

  const openRepo = (index: number) => {
    const project = projects[index];
    if (!project) return;
    if (store.sfx) blip(340, 0.14, 0.06, 2.2);
    window.open(project.url, "_blank", "noopener,noreferrer");
  };

  const switchMode = (next: "spiral" | "list") => {
    if (next === mode) return;
    setMode(next);
    setHovered(null);
    setListHovered(null);
    if (sfx) blip(next === "spiral" ? 700 : 500, 0.09, 0.05, 1.6);
    if (next === "list") hidePlanes(store);
    else setTimeout(() => revealPlanes(store), 300);
  };

  const hoveredProject = hovered !== null ? projects[hovered] : null;

  return (
    <section id="projects" className="relative">
      <style>{`@keyframes sg-pop { from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: scale(1); } }`}</style>

      {/* heading rides in the normal page flow, like every other section */}
      <div className="mx-auto max-w-6xl px-6 pt-28">
        <SectionHeading
          eyebrow="the good stuff"
          title="Things I'm building"
          blurb="Every card is a live repo from my GitHub. Scroll — the spiral turns past each one. Hover for the story, click to open the code."
        />
      </div>

      {/* tall wrapper pins the spiral while scroll walks the collection */}
      <div
        ref={wrapperRef}
        className="relative"
        style={{ height: `calc(100svh + ${projects.length * SCROLL_VH_PER_CARD}vh)` }}
      >
        <div
          ref={sectionRef}
          data-cursor-label="spin ⟷"
          className="sticky top-0 h-[100svh] min-h-[560px] w-full select-none overflow-hidden"
          style={{ color: WHITE }}
        >
          {/* WebGL spiral */}
          {mounted && assets && (
            <Canvas
              key={projects.length}
              className="!absolute inset-0"
              dpr={[1, 2]}
              camera={{ fov: 35, position: [0, 0, 7.1], near: 0.1, far: 100 }}
              gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
            >
              <SpiralScene
                store={store}
                textures={assets.textures}
                projectCount={projects.length}
                wrapperRef={wrapperRef}
                onHover={setHovered}
                onOpen={openRepo}
                onFront={handleFront}
              />
            </Canvas>
          )}

          {/* edge dissolve, standing in for the reference's noise post-pass */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[22%]"
            style={{ background: `linear-gradient(to bottom, ${BG}, transparent)` }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%]"
            style={{ background: `linear-gradient(to top, ${BG}, transparent)` }}
          />

          {/* spiral / list switch */}
          <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-end px-6 pt-6 sm:px-10">
            <div className="flex items-center gap-3 font-mono text-[11px] lowercase tracking-[0.18em]">
              <button
                type="button"
                onClick={() => switchMode("spiral")}
                className="transition-opacity duration-300"
                style={{ color: WHITE, opacity: mode === "spiral" ? 1 : 0.35 }}
              >
                spiral
              </button>
              <span className="h-1 w-1 rounded-full" style={{ backgroundColor: POP }} />
              <button
                type="button"
                onClick={() => switchMode("list")}
                className="transition-opacity duration-300"
                style={{ color: WHITE, opacity: mode === "list" ? 1 : 0.35 }}
              >
                list
              </button>
            </div>
          </div>

          {/* list mode */}
          <AnimatePresence>
            {mode === "list" && assets && (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.25 } }}
                className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden text-center"
              >
                <CursorTrail hovered={listHovered} images={assets.images} containerRef={sectionRef} />
                <div className="flex min-h-full flex-col items-center justify-center py-24">
                {projects.map((project, i) => (
                  <motion.button
                    key={project.name}
                    type="button"
                    initial={{ y: -30, opacity: 0, scaleY: 0.5 }}
                    animate={{
                      y: 0,
                      opacity: listHovered === null || listHovered === i ? 1 : 0.4,
                      scaleY: 1,
                      transition: { duration: 0.5, ease: [0.215, 0.61, 0.355, 1], delay: 0.2 + i * 0.05 },
                    }}
                    exit={{ y: 50, opacity: 0, scaleY: 0.5, transition: { duration: 0.3, delay: i * 0.05 } }}
                    onMouseEnter={() => {
                      setListHovered(i);
                      if (sfx) blip(1500, 0.05, 0.045);
                    }}
                    onMouseLeave={() => setListHovered(null)}
                    onClick={() => openRepo(i)}
                    className={`relative z-10 py-1.5 font-display font-medium lowercase tracking-tight ${
                      projects.length > 9 ? "text-xl sm:text-3xl" : "text-3xl sm:text-5xl"
                    }`}
                    style={{ color: WHITE }}
                  >
                    {project.name.replace(/[-_]/g, " ").toLowerCase()}
                  </motion.button>
                ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* hovered repo — full details, bottom centre */}
          <AnimatePresence>
            {mode === "spiral" && hoveredProject && (
              <motion.div
                key={`hover-${hovered}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="pointer-events-none absolute inset-x-0 bottom-16 z-20 flex justify-center px-6"
              >
                <div
                  className="w-full max-w-xl rounded-2xl px-5 py-4 backdrop-blur-md"
                  style={{
                    backgroundColor: "#0d0d14cc",
                    border: `1px solid ${hexToRgba(CARD_HUES[(hovered ?? 0) % CARD_HUES.length][0], 0.45)}`,
                    boxShadow: `0 10px 44px ${hexToRgba(CARD_HUES[(hovered ?? 0) % CARD_HUES.length][0], 0.22)}`,
                  }}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h4 className="font-display text-lg font-semibold lowercase tracking-tight">
                      {hoveredProject.name.replace(/[-_]/g, " ").toLowerCase()}
                    </h4>
                    <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: `${WHITE}66` }}>
                      {hoveredProject.language} · {hoveredProject.year}
                      {hoveredProject.stars > 0 && (
                        <span style={{ color: ACCENT }}> · ★ {hoveredProject.stars}</span>
                      )}
                      {hoveredProject.isPrivate && (
                        <span style={{ color: "#8B7BD8" }}> · private</span>
                      )}
                    </p>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: `${WHITE}a6` }}>
                    {hoveredProject.description}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-1.5">
                      {hoveredProject.topics.map((topic) => (
                        <span
                          key={topic}
                          className="rounded-full px-2 py-0.5 font-mono text-[9px] lowercase tracking-[0.15em]"
                          style={{ border: `1px solid ${WHITE}26`, color: `${WHITE}80` }}
                        >
                          {topic}
                        </span>
                      ))}
                      {hoveredProject.homepage && (
                        <span
                          className="rounded-full px-2 py-0.5 font-mono text-[9px] lowercase tracking-[0.15em]"
                          style={{ border: `1px solid ${POP}40`, color: POP }}
                        >
                          live demo
                        </span>
                      )}
                    </div>
                    <p className="shrink-0 font-mono text-[10px] lowercase tracking-[0.2em]" style={{ color: POP }}>
                      {hoveredProject.isPrivate ? "private build — ask me about it" : "click to open ↗"}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* HUD */}
          <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between px-6 pb-5 sm:px-10">
            <p className="font-mono text-[10px] lowercase tracking-[0.2em]" style={{ color: `${WHITE}59` }}>
              {mode === "spiral" ? (
                <>
                  <span style={{ color: WHITE }}>{String(front + 1).padStart(2, "0")}</span>
                  <span className="mx-1.5" style={{ color: `${WHITE}40` }}>
                    / {String(projects.length).padStart(2, "0")}
                  </span>
                  — scroll to tour · drag to spin · click a card
                </>
              ) : (
                "click a repo"
              )}
            </p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setSfx((s) => !s)}
                className="font-mono text-[10px] lowercase tracking-[0.2em] transition-colors"
                style={{ color: sfx ? POP : `${WHITE}59` }}
              >
                {sfx ? "sfx on" : "sfx off"}
              </button>
              <a
                href={`https://github.com/${GITHUB_USER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] lowercase tracking-[0.2em] underline decoration-1 underline-offset-4 transition-colors hover:text-white"
                style={{ color: `${WHITE}8c` }}
              >
                all of github ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
