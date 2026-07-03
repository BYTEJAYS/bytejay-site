"use client";

/**
 * JourneyWorld — a paodao.fr-style playable island telling Jay's journey.
 *
 * One handcrafted-feeling island in a living ocean. A letterboxed cinematic
 * flies you around the island, then the camera settles behind BB-8 and the
 * world is yours: WASD/arrows to roll, shift to boost. Milestone monoliths
 * stand around the island — approach one and its story appears. A lighthouse
 * marks the journey's end.
 *
 * Everything is procedural: terrain heightfield with biome vertex colors,
 * shader ocean with shore foam, instanced trees and rocks, PBR materials,
 * filmic post-processing.
 *
 * ── EDIT YOUR STORY HERE: the MILESTONES array is the whole timeline. ──
 */

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Float,
  Lightformer,
  PerformanceMonitor,
  RoundedBox,
  SoftShadows,
  Sparkles,
  useProgress,
} from "@react-three/drei";
import {
  Bloom,
  BrightnessContrast,
  ChromaticAberration,
  EffectComposer,
  HueSaturation,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";
import { easing } from "maath";
import { sfxGreet, sfxReact, unlockAudio } from "@/lib/robotSfx";

/* ── the story ──────────────────────────────────────────────────── */

type Milestone = { year: string; title: string; text: string; era: number };

const MILESTONES: Milestone[] = [
  { year: "2007", title: "Player One Spawns", text: "Jay enters the world. Curiosity stat: already maxed. Tutorial skipped.", era: 0 },
  { year: "2012", title: "The First Machine", text: "Age 5 — a PC arrives in the house. Other kids got toys; Jay got a boot screen. The obsession installs itself quietly.", era: 0 },
  { year: "2022", title: "First Line of Code", text: "Age 15 — one “Hello, World” and reality forks. Backend follows fast: servers, routes, databases. The invisible half of the internet starts feeling like home.", era: 1 },
  { year: "2023", title: "Side Quests Unlocked", text: "Guitar riffs played properly, songs actually sung well, chess middlegames, stacks of books. Turns out the XP isn't only in the terminal.", era: 1 },
  { year: "2024", title: "Competitive Mode", text: "Age 17 — school-level bug-hunting competitions and online coding contests, one after another. Finding what breaks becomes a sport.", era: 2 },
  { year: "2026", title: "The Advanced Backend Arc", text: "Deeper into architecture, async systems and real engineering — and building this island you're rolling around. Just getting started…", era: 3 },
];

const ERAS = [
  { name: "Origins", numeral: "I" },
  { name: "Discovery", numeral: "II" },
  { name: "The Grind", numeral: "III" },
  { name: "World-Building", numeral: "IV" },
];

const ACCENT = "#FF4D24";
const CREAM = "#E7DEC8";
const UP = new THREE.Vector3(0, 1, 0);

/* ── deterministic value noise ──────────────────────────────────── */

function hash2(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}
function noise2(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

/* ── time of day + weather ──────────────────────────────────────────
   The island lives on your clock: visit at night, it's night. Weather
   is seeded from the date, so some days/nights are rainy, some clear. */

const NOW = new Date();
/* ?mood=night|day and ?wx=rain|clear override the clock (handy for peeking
   at the island's other faces) */
const QS =
  typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
const IS_NIGHT = QS?.get("mood")
  ? QS.get("mood") === "night"
  : NOW.getHours() < 6 || NOW.getHours() >= 18;
const IS_RAINY = QS?.get("wx")
  ? QS.get("wx") === "rain"
  : hash2(
      NOW.getFullYear() * 500 + (NOW.getMonth() + 1) * 40 + NOW.getDate(),
      IS_NIGHT ? 7.3 : 3.7
    ) < 0.5;

const MOOD = (() => {
  const base = IS_NIGHT
    ? {
        skyTop: "#060D1C", skyHorizon: "#1D3550",
        celColor: "#D9E8FF", disc: 0.9, halo: 0.28, stars: 1.05,
        fog: "#101F30", fogNear: 45, fogFar: 250,
        keyColor: "#9FB6E8", keyIntensity: 1.1,
        ambColor: "#7286A8", ambIntensity: 0.22,
        hemiSky: "#3A4C6E", hemiGround: "#141E2A", hemiIntensity: 0.3,
        envA: 0.6, envACol: "#8FA8D8", envB: 0.35, envBCol: "#5E7290",
        oceanDeep: "#06202E", oceanShallow: "#0E3C4A", foam: "#8FAEB8", glint: 0.07,
        bg: "#0A1522", beamOpacity: 0.13, lampIntensity: 42,
        windowGlow: 1.8, windowGlowActive: 5.2, lantern: 5,
      }
    : {
        skyTop: "#3E8EC9", skyHorizon: "#F4DCB0",
        celColor: "#FFF0D0", disc: 1.5, halo: 0.5, stars: 0,
        fog: "#D9E4E4", fogNear: 60, fogFar: 320,
        keyColor: "#FFE3B8", keyIntensity: 2.4,
        ambColor: "#CBD8E4", ambIntensity: 0.52,
        hemiSky: "#FFF2D8", hemiGround: "#7FA0A8", hemiIntensity: 0.6,
        envA: 2.0, envACol: "#FFEAC9", envB: 1.0, envBCol: "#BFD3E6",
        oceanDeep: "#3D9DBC", oceanShallow: "#8FD8DE", foam: "#F6FBF7", glint: 0.16,
        bg: "#CFE3E8", beamOpacity: 0.05, lampIntensity: 8,
        windowGlow: 0.5, windowGlowActive: 2.4, lantern: 1.2,
      };
  if (IS_RAINY) {
    if (IS_NIGHT) {
      Object.assign(base, { stars: 0.3, fogNear: 40, fogFar: 210, keyIntensity: 0.9 });
    } else {
      Object.assign(base, {
        skyTop: "#8A99A6", skyHorizon: "#C7CCC7",
        celColor: "#E8ECEF", disc: 0.5, halo: 0.25,
        fog: "#B9C2C2", fogNear: 45, fogFar: 240,
        keyColor: "#D8DCE0", keyIntensity: 1.3, ambIntensity: 0.5,
        oceanDeep: "#2E6272", oceanShallow: "#6FA4A6", glint: 0.07,
        beamOpacity: 0.12, lampIntensity: 20,
        windowGlow: 1.2, windowGlowActive: 3.6, lantern: 3,
      });
    }
  }
  return { ...base, night: IS_NIGHT, rainy: IS_RAINY };
})();

const UI_CHIP = MOOD.night
  ? "border-white/15 bg-black/30 text-cream/75"
  : "border-ink/20 bg-white/60 text-ink/75";
const UI_HINT = MOOD.night ? "text-cream/60" : "text-ink/60";
const UI_TITLE = MOOD.night ? "text-cream" : "text-ink";
const UI_SUB = MOOD.night ? "text-cream/75" : "text-ink/70";

/* one celestial body drives the sky disc, ocean glints and cloud shading */
const SUN_DIR = new THREE.Vector3(-0.5, 0.42, -0.76).normalize();

/* ── island heightfield ─────────────────────────────────────────── */

const ISLAND_R = 40;
const WATER_Y = 0;

function terrainHeight(x: number, z: number) {
  const d = Math.hypot(x, z);
  const edge = 1 - THREE.MathUtils.clamp(d / ISLAND_R, 0, 1);
  const falloff = THREE.MathUtils.smoothstep(edge, 0, 0.5);
  let h = 0;
  h += noise2(x * 0.045 + 13.7, z * 0.045 + 7.1) * 6.5;
  h += noise2(x * 0.11 + 40.2, z * 0.11 - 17.6) * 2.2;
  h += noise2(x * 0.23 - 9.3, z * 0.23 + 31.8) * 0.7;
  h = (h + 2.2) * falloff;
  // snowy mountain, offset from center like paodao's peak
  const m = Math.max(0, 1 - Math.hypot(x - 7, z + 9) / 17);
  h += m * m * 10.5;
  return h - 1.1;
}

function groundY(x: number, z: number) {
  return Math.max(terrainHeight(x, z), WATER_Y - 1.1);
}

/* milestone spots: a ring around the island, pulled inland until dry */
const SPOTS = MILESTONES.map((_, i) => {
  const a = Math.PI / 2 + (i / MILESTONES.length) * Math.PI * 2;
  let r = 27;
  while (r > 8 && terrainHeight(Math.cos(a) * r, Math.sin(a) * r) < 1.1) r -= 1;
  const x = Math.cos(a) * r;
  const z = Math.sin(a) * r;
  return { x, z, y: terrainHeight(x, z) };
});

/* lighthouse on the shore past the last milestone */
const LIGHTHOUSE = (() => {
  const a = Math.PI / 2 - 0.45;
  let r = 34;
  while (r > 10 && terrainHeight(Math.cos(a) * r, Math.sin(a) * r) < 0.9) r -= 1;
  return { x: Math.cos(a) * r, z: Math.sin(a) * r, y: terrainHeight(Math.cos(a) * r, Math.sin(a) * r) };
})();

/* the hidden pizza shack: far south shore, in the trees between two
   cottages — an easter egg, so no beacon, you have to stumble onto it */
const PIZZA = (() => {
  const a = Math.PI / 2 + Math.PI; // midway between milestones 3 and 4
  let r = 30;
  while (r > 10 && terrainHeight(Math.cos(a) * r, Math.sin(a) * r) < 0.9) r -= 0.5;
  r -= 1.5;
  const x = Math.cos(a) * r;
  const z = Math.sin(a) * r;
  return { x, z, y: terrainHeight(x, z), yaw: Math.atan2(-x, -z) };
})();

const PLAYER_START = { x: 0, z: 15 };
const START_HEADING = Math.atan2(SPOTS[0].x - PLAYER_START.x, SPOTS[0].z - PLAYER_START.z);

/* ── shared mutable store ───────────────────────────────────────── */

type Store = {
  phase: "load" | "cine" | "play";
  playT: number;
  px: number;
  pz: number;
  heading: number;
  speed: number;
  active: number;
  cineStart: number;
  pizza: boolean;
};

/* ── canvas label textures ──────────────────────────────────────── */

function makeLabel(text: string, size = 256) {
  const c = document.createElement("canvas");
  c.width = size * 2;
  c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.font = "700 92px 'Space Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(text, c.width / 2, c.height / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

/* ── sky ────────────────────────────────────────────────────────── */

function SkyDome() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      top: { value: new THREE.Color(MOOD.skyTop) },
      horizon: { value: new THREE.Color(MOOD.skyHorizon) },
      haze: { value: new THREE.Color(MOOD.fog) },
      moon: { value: SUN_DIR.clone() },
      celCol: { value: new THREE.Color(MOOD.celColor) },
    }),
    []
  );
  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;
  });
  return (
    <mesh scale={480}>
      <sphereGeometry args={[1, 48, 28]} />
      <shaderMaterial
        ref={mat}
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 top; uniform vec3 horizon; uniform vec3 haze;
          uniform vec3 moon; uniform vec3 celCol;
          varying vec3 vDir;
          float hash13(vec3 p) {
            return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
          }
          float hash21(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }
          float vnoise(vec2 p) {
            vec2 i = floor(p); vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(
              mix(hash21(i), hash21(i + vec2(1, 0)), u.x),
              mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), u.x), u.y);
          }
          float fbm(vec2 p) {
            float v = 0.0; float a = 0.5;
            for (int k = 0; k < 5; k++) { v += a * vnoise(p); p = p * 2.03 + 17.0; a *= 0.5; }
            return v;
          }
          void main() {
            vec3 nd = normalize(vDir);
            // three-stop atmosphere: warm belt kept low, zenith saturating fast
            float elev = clamp(nd.y, 0.0, 1.0);
            vec3 col = mix(horizon, top, pow(elev, 0.55));
            col = mix(haze, col, smoothstep(-0.05, 0.10, nd.y));
            float md = dot(nd, moon);
            // forward-scattering glow wrapping the light — the "wet air" look
            col += celCol * pow(max(md, 0.0), 6.0) * ${(MOOD.halo * 0.45).toFixed(3)};
            // disc with a soft bloom-friendly core + tight halo
            col += celCol * smoothstep(0.9985, 0.9997, md) * ${MOOD.disc.toFixed(2)};
            col += celCol * 0.8 * smoothstep(0.990, 0.9995, md) * ${MOOD.halo.toFixed(2)};
            // high drifting cirrus, sun-tinted on the lit side
            if (nd.y > 0.02) {
              vec2 cuv = nd.xz / (nd.y + 0.18);
              float cl = fbm(cuv * 1.9 + vec2(uTime * 0.006, uTime * 0.0025));
              float cover = smoothstep(${MOOD.rainy ? "0.40" : "0.62"}, ${MOOD.rainy ? "0.66" : "0.88"}, cl);
              float fade = smoothstep(0.02, 0.24, nd.y);
              vec3 cloudCol = mix(haze, celCol, 0.35 + 0.45 * pow(max(md, 0.0), 3.0));
              col = mix(col, cloudCol, cover * fade * ${MOOD.rainy ? "0.75" : (MOOD.night ? "0.25" : "0.42")});
            }
            // stars: twinkling, fading toward the horizon and hiding behind clouds
            vec3 sp = floor(nd * 240.0);
            float st = step(0.9992, hash13(sp));
            float tw = 0.6 + 0.4 * sin(uTime * (2.0 + hash13(sp + 1.0) * 4.0) + hash13(sp + 2.0) * 6.283);
            col += vec3(0.82, 0.87, 1.0) * st * tw * smoothstep(0.10, 0.45, nd.y) * ${MOOD.stars.toFixed(2)};
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  );
}

/* ── volumetric-feeling puff clouds drifting over the sea ───────── */

function makePuffTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 62);
  g.addColorStop(0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.45, "rgba(255,255,255,0.55)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

const CLOUDS = Array.from({ length: MOOD.rainy ? 11 : 8 }, (_, i) => ({
  a: (i / (MOOD.rainy ? 11 : 8)) * Math.PI * 2 + hash2(i, 51) * 1.2,
  r: 110 + hash2(i, 52) * 130,
  y: (MOOD.rainy ? 34 : 46) + hash2(i, 53) * 22,
  speed: 0.7 + hash2(i, 54) * 0.9,
  puffs: Array.from({ length: 6 + Math.floor(hash2(i, 55) * 4) }, (_, k) => ({
    x: (hash2(i * 9 + k, 56) - 0.5) * 34,
    y: (hash2(i * 9 + k, 57) - 0.5) * 7,
    z: (hash2(i * 9 + k, 58) - 0.5) * 16,
    s: 13 + hash2(i * 9 + k, 59) * 17,
  })),
}));

function Clouds() {
  const groups = useRef<(THREE.Group | null)[]>([]);
  const tex = useMemo(() => makePuffTexture(), []);
  const tint = MOOD.rainy
    ? MOOD.night ? "#1E2836" : "#AEB6BE"
    : MOOD.night ? "#2C3A52" : "#FFFFFF";
  const opacity = MOOD.rainy ? 0.85 : MOOD.night ? 0.4 : 0.62;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    CLOUDS.forEach((cl, i) => {
      const g = groups.current[i];
      if (!g) return;
      // slow orbital drift so clouds never leave the dome
      const a = cl.a + t * 0.0016 * cl.speed;
      g.position.set(Math.cos(a) * cl.r, cl.y + Math.sin(t * 0.05 + i) * 1.5, Math.sin(a) * cl.r);
    });
  });

  return (
    <>
      {CLOUDS.map((cl, i) => (
        <group
          key={i}
          ref={(g) => {
            groups.current[i] = g;
          }}
        >
          {cl.puffs.map((p, k) => (
            <sprite key={k} position={[p.x, p.y, p.z]} scale={[p.s * 1.4, p.s * 0.8, 1]}>
              <spriteMaterial
                map={tex}
                color={tint}
                transparent
                opacity={opacity}
                depthWrite={false}
                fog={false}
                rotation={hash2(i, k) * 0.6}
              />
            </sprite>
          ))}
        </group>
      ))}
    </>
  );
}

/* ── rain: instanced streaks falling around the player ──────────── */

function Rain({ store, count }: { store: Store; count: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const drops = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (hash2(i, 1) - 0.5) * 150,
        z: (hash2(i, 2) - 0.5) * 150,
        y: hash2(i, 3) * 30,
        sp: 20 + hash2(i, 4) * 12,
        len: 0.8 + hash2(i, 5) * 0.9,
      })),
    [count]
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const slant = useMemo(() => new THREE.Euler(0, 0, -0.20), []);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    if (!ref.current) return;
    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      d.y -= d.sp * dt;
      d.x += 4.5 * dt; // wind drift
      if (d.y < -0.5) d.y = 28 + hash2(i, 7) * 4;
      // keep the field wrapped around the player
      const rx = ((d.x - store.px + 75) % 150 + 150) % 150 - 75;
      const rz = ((d.z - store.pz + 75) % 150 + 150) % 150 - 75;
      dummy.position.set(store.px + rx, d.y, store.pz + rz);
      dummy.rotation.copy(slant);
      dummy.scale.set(1, d.len, 1);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[0.02, 0.7, 0.02]} />
      <meshBasicMaterial color="#AFC8DC" transparent opacity={0.32} depthWrite={false} />
    </instancedMesh>
  );
}

/* ── ocean ──────────────────────────────────────────────────────── */

function Ocean() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      deep: { value: new THREE.Color(MOOD.oceanDeep) },
      shallow: { value: new THREE.Color(MOOD.oceanShallow) },
      foam: { value: new THREE.Color(MOOD.foam) },
      skyTop: { value: new THREE.Color(MOOD.skyTop) },
      skyHorizon: { value: new THREE.Color(MOOD.skyHorizon) },
      sunDir: { value: SUN_DIR.clone() },
      sunCol: { value: new THREE.Color(MOOD.celColor) },
    }),
    []
  );
  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WATER_Y, 0]}>
      <planeGeometry args={[900, 900, 128, 128]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        transparent
        vertexShader={`
          uniform float uTime;
          varying vec2 vXZ;
          varying float vWave;
          float waveH(vec2 q, float t) {
            return sin(q.x * 0.12 + t * 0.9) * 0.14
                 + sin(q.y * 0.16 - t * 0.7) * 0.12
                 + sin((q.x + q.y) * 0.07 + t * 0.5) * 0.10
                 + sin(q.x * 0.32 - q.y * 0.21 + t * 1.4) * 0.05
                 + sin(q.y * 0.45 + q.x * 0.13 - t * 1.9) * 0.03;
          }
          void main() {
            vec3 p = position;
            vec2 q = vec2(position.x, -position.y);
            float w = waveH(q, uTime);
            p.z += w;
            vWave = w;
            vXZ = q;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 deep; uniform vec3 shallow; uniform vec3 foam;
          uniform vec3 skyTop; uniform vec3 skyHorizon;
          uniform vec3 sunDir; uniform vec3 sunCol;
          varying vec2 vXZ;
          varying float vWave;
          float hash21(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }
          float vnoise(vec2 p) {
            vec2 i = floor(p); vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(
              mix(hash21(i), hash21(i + vec2(1, 0)), u.x),
              mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), u.x), u.y);
          }
          void main() {
            float d = length(vXZ);
            float shore = smoothstep(${(ISLAND_R + 16).toFixed(1)}, ${(ISLAND_R - 8).toFixed(1)}, d);

            // ── surface normal: analytic swell slope + two scrolling detail layers
            float e = 0.6;
            float t = uTime;
            #define WH(q) (sin((q).x * 0.12 + t * 0.9) * 0.14 + sin((q).y * 0.16 - t * 0.7) * 0.12 + sin(((q).x + (q).y) * 0.07 + t * 0.5) * 0.10 + sin((q).x * 0.32 - (q).y * 0.21 + t * 1.4) * 0.05)
            float hC = WH(vXZ);
            float hX = WH(vXZ + vec2(e, 0.0));
            float hZ = WH(vXZ + vec2(0.0, e));
            vec2 slope = vec2(hX - hC, hZ - hC) / e;
            vec3 wp = vec3(vXZ.x, ${WATER_Y.toFixed(1)} + vWave, vXZ.y);
            vec3 V = normalize(cameraPosition - wp);
            float camd = distance(cameraPosition, wp);
            // fine ripples fade with distance — far water stays glassy
            float da = clamp(1.0 - camd / 110.0, 0.0, 1.0);
            float r1 = vnoise(vXZ * 1.35 + vec2(t * 0.55, t * 0.30));
            float r2 = vnoise(vXZ * 2.30 - vec2(t * 0.42, t * 0.66));
            slope += (vec2(r1 - 0.5, r2 - 0.5)) * 0.55 * (0.08 + 0.92 * da);
            vec3 N = normalize(vec3(-slope.x, 1.0, -slope.y));

            // ── base color: depth gradient + wave-top subsurface glow
            vec3 col = mix(deep, shallow, shore);
            col += shallow * max(vWave, 0.0) * 0.35;

            // ── fresnel sky reflection
            float fres = pow(1.0 - max(dot(N, V), 0.0), 5.0);
            fres = 0.05 + 0.55 * fres;
            vec3 R = reflect(-V, N);
            vec3 skyRef = mix(skyHorizon, skyTop, pow(clamp(R.y * 1.8, 0.0, 1.0), 0.6));
            col = mix(col, skyRef, fres);

            // ── the light's glitter path: tight spec + broad streak
            vec3 H = normalize(V + sunDir);
            float spec = pow(max(dot(N, H), 0.0), 340.0);
            float streak = pow(max(dot(N, H), 0.0), 28.0);
            col += sunCol * (spec * ${(MOOD.night ? 2.6 : 3.2).toFixed(1)} + streak * ${(MOOD.night ? 0.22 : 0.30).toFixed(2)}) * ${MOOD.rainy ? "0.35" : "1.0"};

            // ── whitecaps riding the tallest swell crests only
            float crest = smoothstep(0.24, 0.40, vWave + (r1 - 0.5) * 0.06 * da);
            col = mix(col, foam, crest * ${MOOD.rainy ? "0.40" : "0.25"});

            // ── breathing foam ring hugging the shore, broken up by noise
            float ang = atan(vXZ.y, vXZ.x);
            float wob = sin(ang * 7.0 + uTime * 0.6) * 1.3 + sin(ang * 17.0 - uTime * 0.4) * 0.6;
            float ring = abs(d - (${ISLAND_R.toFixed(1)} - 2.5 + wob + sin(uTime * 0.8) * 0.7));
            float lace = vnoise(vXZ * 1.7 + vec2(0.0, uTime * 0.25));
            col = mix(col, foam, smoothstep(1.8, 0.15, ring) * smoothstep(0.25, 0.6, lace) * 0.9);
            // a second, fainter ring further out
            float ring2 = abs(d - (${ISLAND_R.toFixed(1)} + 2.6 + wob * 0.7 - sin(uTime * 0.55) * 1.1));
            col = mix(col, foam, smoothstep(1.1, 0.1, ring2) * smoothstep(0.35, 0.7, lace) * 0.4);

            // shallows go glassy so the sand reads through
            float alpha = mix(0.97, 0.62, smoothstep(${(ISLAND_R - 2).toFixed(1)}, ${(ISLAND_R - 9).toFixed(1)}, d));
            gl_FragColor = vec4(col, alpha);
          }
        `}
      />
    </mesh>
  );
}

/* ── terrain ────────────────────────────────────────────────────── */

const COL_SAND = new THREE.Color("#E9DCAE");
const COL_SAND_WET = new THREE.Color("#B3A176");
const COL_GRASS = new THREE.Color("#2F5C28");
const COL_GRASS2 = new THREE.Color("#3D7031");
const COL_GRASS3 = new THREE.Color("#5A8438");
const COL_ROCK = new THREE.Color("#6E6052");
const COL_ROCK2 = new THREE.Color("#847666");
const COL_SNOW = new THREE.Color("#F7F4EC");

function Terrain() {
  const geo = useMemo(() => {
    const size = 170;
    const seg = 200;
    const g = new THREE.PlaneGeometry(size, size, seg, seg);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    const tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = terrainHeight(x, z);
      pos.setY(i, h);
    }
    g.computeVertexNormals();
    const nrm = g.attributes.normal as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = pos.getY(i);
      const slope = 1 - nrm.getY(i);
      const n = noise2(x * 0.35, z * 0.35);
      const n2 = noise2(x * 1.1 + 50, z * 1.1 - 30);
      if (h < 0.55) {
        // beach: dry sand fading into a dark wet band at the waterline
        const wet = THREE.MathUtils.smoothstep(0.32 - h, 0, 0.45);
        c.copy(COL_SAND).lerp(COL_SAND_WET, wet * (MOOD.rainy ? 1 : 0.85));
      } else if (h > 8.2 && slope < 0.45) {
        c.copy(COL_SNOW);
        // blue-ish shadowed crevices in the snowfield
        c.lerp(tmp.set("#C9D4E4"), THREE.MathUtils.clamp(slope * 1.6, 0, 0.5));
      } else if (slope > 0.28 || h > 6.4) {
        c.copy(COL_ROCK).lerp(COL_ROCK2, n2);
        // sun-bleached striations on the steepest faces
        if (slope > 0.5) c.multiplyScalar(0.82 + noise2(x * 2.4, z * 2.4) * 0.3);
      } else {
        // meadow: three-way grass blend + dry patches on knolls
        c.copy(n > 0.5 ? COL_GRASS : COL_GRASS2).lerp(COL_GRASS3, n2 * n2 * 0.7);
        if (h > 4.2) c.lerp(tmp.set("#6E7A38"), THREE.MathUtils.smoothstep(h, 4.2, 6.2) * 0.5);
        // moist, darker grass right above the sand line
        if (h < 1.1) c.multiplyScalar(0.86);
      }
      // large-scale valley shading fakes ambient occlusion
      const ao = 0.86 + noise2(x * 0.06 + 90, z * 0.06 + 40) * 0.2;
      c.multiplyScalar((0.92 + n * 0.13) * ao);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  const mat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.94, metalness: 0.02 });
    // world-space micro grain so the ground has tooth up close
    m.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec3 vWPos;"
        )
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;"
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
          varying vec3 vWPos;
          float thash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float tnoise(vec2 p) {
            vec2 i = floor(p); vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(mix(thash(i), thash(i + vec2(1, 0)), u.x),
                       mix(thash(i + vec2(0, 1)), thash(i + vec2(1, 1)), u.x), u.y);
          }`
        )
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
          float grain = tnoise(vWPos.xz * 3.1) * 0.6 + tnoise(vWPos.xz * 9.7) * 0.4;
          float dfade = clamp(1.0 - length(vWPos.xz - cameraPosition.xz) / 70.0, 0.0, 1.0);
          diffuseColor.rgb *= 1.0 + (grain - 0.5) * 0.16 * dfade;`
        );
    };
    return m;
  }, []);

  return <mesh geometry={geo} material={mat} receiveShadow castShadow />;
}

/* underwater skirt so the island reads as a landmass, not a crust */
function IslandBase() {
  return (
    <mesh position={[0, -7.5, 0]}>
      <cylinderGeometry args={[ISLAND_R * 0.86, ISLAND_R * 0.55, 15, 48]} />
      <meshStandardMaterial color="#5E5244" roughness={0.95} />
    </mesh>
  );
}

/* ── vegetation & rocks (instanced) ─────────────────────────────── */

function scatter(count: number, seed: number, ok: (h: number, slope: number) => boolean) {
  const out: { x: number; z: number; y: number; s: number; r: number }[] = [];
  let i = 0;
  let guard = 0;
  while (out.length < count && guard < count * 40) {
    guard++;
    const x = (hash2(i * 3 + seed, i + 1) - 0.5) * 2 * (ISLAND_R - 3);
    const z = (hash2(i + seed * 7, i * 5 + 2) - 0.5) * 2 * (ISLAND_R - 3);
    i++;
    const h = terrainHeight(x, z);
    const e = 0.6;
    const slope =
      Math.abs(terrainHeight(x + e, z) - h) / e + Math.abs(terrainHeight(x, z + e) - h) / e;
    const nearSpot = SPOTS.some((s) => Math.hypot(s.x - x, s.z - z) < 8);
    const nearLight = Math.hypot(LIGHTHOUSE.x - x, LIGHTHOUSE.z - z) < 7;
    const nearStart = Math.hypot(PLAYER_START.x - x, PLAYER_START.z - z) < 7;
    const nearPizza = Math.hypot(PIZZA.x - x, PIZZA.z - z) < 4;
    if (!nearSpot && !nearLight && !nearStart && !nearPizza && ok(h, slope)) {
      out.push({ x, z, y: h, s: 0.7 + hash2(i, seed) * 0.7, r: hash2(i * 2, seed) * Math.PI * 2 });
    }
  }
  return out;
}

const TREE_SPOTS = scatter(110, 3, (h, slope) => h > 0.9 && h < 6.2 && slope < 0.5).map(
  (t, i) => ({ ...t, conifer: hash2(i * 7 + 3, 19) > 0.35 })
);
const CONIFERS = TREE_SPOTS.filter((t) => t.conifer);
const LEAFY = TREE_SPOTS.filter((t) => !t.conifer);

/* static colliders: monolith bases + lighthouse + tree trunks */
const SOLIDS = [
  ...SPOTS.map((s) => ({ x: s.x, z: s.z, r: 2.4 })),
  { x: LIGHTHOUSE.x, z: LIGHTHOUSE.z, r: 2.6 },
  { x: PIZZA.x, z: PIZZA.z, r: 1.5 },
  ...TREE_SPOTS.map((t) => ({ x: t.x, z: t.z, r: 0.26 * t.s })),
];

function Trees() {
  const trunkC = useRef<THREE.InstancedMesh>(null);
  const tier1 = useRef<THREE.InstancedMesh>(null);
  const tier2 = useRef<THREE.InstancedMesh>(null);
  const tier3 = useRef<THREE.InstancedMesh>(null);
  const trunkL = useRef<THREE.InstancedMesh>(null);
  const blob1 = useRef<THREE.InstancedMesh>(null);
  const blob2 = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    const col = new THREE.Color();
    /* conifers: tapered trunk + colors per tier (darker at the base) */
    CONIFERS.forEach((p, i) => {
      dummy.position.set(p.x, p.y + 0.55 * p.s, p.z);
      dummy.rotation.set(0, p.r, 0);
      dummy.scale.setScalar(p.s);
      dummy.updateMatrix();
      trunkC.current!.setMatrixAt(i, dummy.matrix);
      const shade = 0.85 + hash2(i, 4) * 0.3;
      tier1.current!.setColorAt(i, col.set("#2C4E22").multiplyScalar(shade));
      tier2.current!.setColorAt(i, col.set("#37602A").multiplyScalar(shade));
      tier3.current!.setColorAt(i, col.set("#437434").multiplyScalar(shade));
    });
    /* leafy trees: taller trunk + warm-green canopy blobs */
    LEAFY.forEach((p, i) => {
      dummy.position.set(p.x, p.y + 0.8 * p.s, p.z);
      dummy.rotation.set(0, p.r, (hash2(i, 6) - 0.5) * 0.14);
      dummy.scale.setScalar(p.s);
      dummy.updateMatrix();
      trunkL.current!.setMatrixAt(i, dummy.matrix);
      const shade = 0.85 + hash2(i, 8) * 0.3;
      blob1.current!.setColorAt(i, col.set("#3E6B2C").multiplyScalar(shade));
      blob2.current!.setColorAt(i, col.set("#4E7F36").multiplyScalar(shade));
    });
    for (const r of [trunkC, trunkL]) r.current!.instanceMatrix.needsUpdate = true;
    for (const r of [tier1, tier2, tier3, blob1, blob2])
      if (r.current!.instanceColor) r.current!.instanceColor.needsUpdate = true;
  }, [dummy]);

  /* wind: canopies lean and sway, tiers with a slight phase lag */
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const base = MOOD.rainy ? 0.14 : 0.05;
    const amp = MOOD.rainy ? 0.07 : 0.03;
    const place = (
      mesh: THREE.InstancedMesh | null,
      p: { x: number; y: number; z: number; s: number; r: number },
      i: number,
      yOff: number,
      scale: number,
      lag: number,
      xOff = 0,
      zOff = 0
    ) => {
      if (!mesh) return;
      const sway = base + Math.sin(t * 1.7 + p.x * 0.35 + p.z * 0.22 - lag) * amp;
      dummy.position.set(p.x + xOff * p.s, p.y + yOff * p.s, p.z + zOff * p.s);
      dummy.rotation.set(0, p.r, -sway);
      dummy.scale.setScalar(p.s * scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    };
    CONIFERS.forEach((p, i) => {
      place(tier1.current, p, i, 1.45, 1.0, 0);
      place(tier2.current, p, i, 2.25, 0.74, 0.35);
      place(tier3.current, p, i, 2.95, 0.5, 0.7);
    });
    LEAFY.forEach((p, i) => {
      place(blob1.current, p, i, 1.85, 1.0, 0);
      place(blob2.current, p, i, 2.5, 0.62, 0.4, 0.25, 0.12);
    });
    for (const r of [tier1, tier2, tier3, blob1, blob2])
      if (r.current) r.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      {/* conifers */}
      <instancedMesh ref={trunkC} args={[undefined, undefined, CONIFERS.length]} castShadow>
        <cylinderGeometry args={[0.08, 0.16, 1.2, 6]} />
        <meshStandardMaterial color="#6E4A2C" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={tier1} args={[undefined, undefined, CONIFERS.length]} castShadow>
        <coneGeometry args={[0.95, 1.5, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.85} flatShading />
      </instancedMesh>
      <instancedMesh ref={tier2} args={[undefined, undefined, CONIFERS.length]} castShadow>
        <coneGeometry args={[0.95, 1.5, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.85} flatShading />
      </instancedMesh>
      <instancedMesh ref={tier3} args={[undefined, undefined, CONIFERS.length]} castShadow>
        <coneGeometry args={[0.95, 1.5, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.85} flatShading />
      </instancedMesh>
      {/* leafy trees */}
      <instancedMesh ref={trunkL} args={[undefined, undefined, LEAFY.length]} castShadow>
        <cylinderGeometry args={[0.07, 0.13, 1.7, 6]} />
        <meshStandardMaterial color="#7A5A38" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={blob1} args={[undefined, undefined, LEAFY.length]} castShadow>
        <icosahedronGeometry args={[0.85, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.85} flatShading />
      </instancedMesh>
      <instancedMesh ref={blob2} args={[undefined, undefined, LEAFY.length]} castShadow>
        <icosahedronGeometry args={[0.85, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.85} flatShading />
      </instancedMesh>
    </>
  );
}

function Rocks() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const spots = useMemo(() => scatter(46, 11, (h) => h > 0.25 && h < 8), []);
  useEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const col = new THREE.Color();
    spots.forEach((p, i) => {
      q.setFromEuler(new THREE.Euler(p.r, p.r * 1.7, 0));
      m.compose(new THREE.Vector3(p.x, p.y + 0.12, p.z), q, new THREE.Vector3(p.s * 0.5, p.s * 0.38, p.s * 0.5));
      ref.current!.setMatrixAt(i, m);
      col.set("#9A8C74").multiplyScalar(0.85 + hash2(i, 5) * 0.3);
      ref.current!.setColorAt(i, col);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
    if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
  }, [spots]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, spots.length]} castShadow>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#ffffff" flatShading roughness={0.92} />
    </instancedMesh>
  );
}

/* ── birds wheeling over the island (day only) ──────────────────── */

const BIRDS = Array.from({ length: 9 }, (_, i) => ({
  r: 22 + hash2(i, 61) * 26,
  y: 16 + hash2(i, 62) * 14,
  speed: (0.045 + hash2(i, 63) * 0.05) * (i % 3 === 0 ? -1 : 1),
  phase: hash2(i, 64) * Math.PI * 2,
  flap: 7 + hash2(i, 65) * 4,
  s: 0.7 + hash2(i, 66) * 0.6,
}));

function Birds() {
  const roots = useRef<(THREE.Group | null)[]>([]);
  const wingsL = useRef<(THREE.Mesh | null)[]>([]);
  const wingsR = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    BIRDS.forEach((b, i) => {
      const g = roots.current[i];
      if (!g) return;
      const a = b.phase + t * b.speed;
      const x = Math.cos(a) * b.r;
      const z = Math.sin(a) * b.r;
      g.position.set(x, b.y + Math.sin(t * 0.7 + i * 2.1) * 1.6, z);
      // face along the flight path
      g.rotation.y = -a + (b.speed > 0 ? 0 : Math.PI);
      const flap = Math.sin(t * b.flap + i) * 0.75;
      if (wingsL.current[i]) wingsL.current[i]!.rotation.z = flap;
      if (wingsR.current[i]) wingsR.current[i]!.rotation.z = -flap;
    });
  });

  return (
    <>
      {BIRDS.map((b, i) => (
        <group
          key={i}
          ref={(g) => {
            roots.current[i] = g;
          }}
          scale={b.s}
        >
          <mesh>
            <capsuleGeometry args={[0.05, 0.26, 3, 6]} />
            <meshStandardMaterial color="#23282F" roughness={0.9} />
          </mesh>
          <mesh
            ref={(m) => {
              wingsL.current[i] = m;
            }}
            position={[0, 0.02, 0]}
          >
            <boxGeometry args={[0.04, 0.015, 0.55]} />
            <meshStandardMaterial color="#2B313A" roughness={0.9} />
          </mesh>
          <mesh
            ref={(m) => {
              wingsR.current[i] = m;
            }}
            position={[0, 0.02, 0]}
            rotation={[0, Math.PI, 0]}
          >
            <boxGeometry args={[0.04, 0.015, 0.55]} />
            <meshStandardMaterial color="#2B313A" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/* ── faraway sister islands, mostly eaten by the haze ───────────── */

const FAR_ISLES = [
  { a: 0.7, d: 195, w: 26, h: 7 },
  { a: 2.6, d: 235, w: 42, h: 11 },
  { a: 4.4, d: 205, w: 20, h: 5.5 },
];

function DistantIsles() {
  return (
    <>
      {FAR_ISLES.map((f, i) => (
        <group key={i} position={[Math.cos(f.a) * f.d, 0, Math.sin(f.a) * f.d]}>
          <mesh position={[0, f.h * 0.28, 0]} scale={[f.w, f.h, f.w * 0.8]}>
            <sphereGeometry args={[1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={MOOD.night ? "#22303E" : "#5E7566"} roughness={1} />
          </mesh>
          <mesh position={[f.w * 0.35, f.h * 0.5, 0]} scale={[f.w * 0.45, f.h * 0.9, f.w * 0.4]}>
            <sphereGeometry args={[1, 10, 7, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={MOOD.night ? "#1C2836" : "#54695C"} roughness={1} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/* ── wavy grass: instanced blades bending in the storm wind ─────── */

/* half a million blades: precompute an eligibility grid once (cheap),
   then place blades by jittered cell picks + bilinear height lookup —
   no per-blade noise evaluation, packed flat to keep memory sane. */
const GRASS_STRIDE = 8; // x, y, z, s, r, c, lx, lz
const GRASS_TOTAL = 600000; // × 20 baked blades = 12M blades

const GRASS_DATA = (() => {
  const RES = 300;
  const span = ISLAND_R - 2;
  const cell = (span * 2) / RES;
  const hs = new Float32Array((RES + 1) * (RES + 1));
  for (let j = 0; j <= RES; j++)
    for (let i = 0; i <= RES; i++)
      hs[j * (RES + 1) + i] = terrainHeight(-span + i * cell, -span + j * cell);

  const eligible: number[] = [];
  for (let j = 0; j < RES; j++)
    for (let i = 0; i < RES; i++) {
      const h = hs[j * (RES + 1) + i];
      if (h < 0.55 || h > 6.4) continue;
      const hx = hs[j * (RES + 1) + i + 1];
      const hz = hs[(j + 1) * (RES + 1) + i];
      if (Math.abs(hx - h) / cell > 0.6 || Math.abs(hz - h) / cell > 0.6) continue;
      const x = -span + (i + 0.5) * cell;
      const z = -span + (j + 0.5) * cell;
      if (SPOTS.some((s) => (s.x - x) ** 2 + (s.z - z) ** 2 < 3.1 ** 2)) continue;
      if ((LIGHTHOUSE.x - x) ** 2 + (LIGHTHOUSE.z - z) ** 2 < 3.2 ** 2) continue;
      if ((PIZZA.x - x) ** 2 + (PIZZA.z - z) ** 2 < 2.6 ** 2) continue;
      eligible.push(j * RES + i);
    }

  const data = new Float32Array(GRASS_TOTAL * GRASS_STRIDE);
  const rowW = RES + 1;
  for (let k = 0; k < GRASS_TOTAL; k++) {
    const cellIdx = eligible[Math.min((hash2(k, 3) * eligible.length) | 0, eligible.length - 1)];
    const ci = cellIdx % RES;
    const cj = (cellIdx / RES) | 0;
    const fx = hash2(k * 2 + 1, 7);
    const fz = hash2(k * 3 + 2, 11);
    const x = -span + (ci + fx) * cell;
    const z = -span + (cj + fz) * cell;
    const h00 = hs[cj * rowW + ci];
    const h10 = hs[cj * rowW + ci + 1];
    const h01 = hs[(cj + 1) * rowW + ci];
    const h11 = hs[(cj + 1) * rowW + ci + 1];
    const y = (h00 * (1 - fx) + h10 * fx) * (1 - fz) + (h01 * (1 - fx) + h11 * fx) * fz;
    const o = k * GRASS_STRIDE;
    data[o] = x;
    data[o + 1] = y - 0.02;
    data[o + 2] = z;
    data[o + 3] = 0.5 + hash2(k, 17) * 0.55;
    data[o + 4] = (hash2(k, 13) - 0.5) * 1.6;
    data[o + 5] = hash2(k, 23);
    data[o + 6] = (hash2(k, 29) - 0.5) * 0.36;
    data[o + 7] = (hash2(k, 41) - 0.5) * 0.36;
  }
  return data;
})();

/* meadow flowers dotted through the lawn, like paodao's */
const FLOWER_SPOTS = (() => {
  const out: { x: number; y: number; z: number; c: number }[] = [];
  for (let k = 0; k < GRASS_TOTAL; k += 600) {
    const o = k * GRASS_STRIDE;
    out.push({ x: GRASS_DATA[o], y: GRASS_DATA[o + 1], z: GRASS_DATA[o + 2], c: GRASS_DATA[o + 5] });
  }
  return out;
})();

/* spatial chunks so off-screen / far grass is skipped entirely */
const GRASS_CHUNK_GRID = 5;
const GRASS_CHUNKS = (() => {
  const span = ISLAND_R - 2;
  const buckets: number[][] = Array.from(
    { length: GRASS_CHUNK_GRID * GRASS_CHUNK_GRID },
    () => []
  );
  for (let k = 0; k < GRASS_TOTAL; k++) {
    const o = k * GRASS_STRIDE;
    const gx = Math.min(
      GRASS_CHUNK_GRID - 1,
      Math.max(0, Math.floor(((GRASS_DATA[o] + span) / (span * 2)) * GRASS_CHUNK_GRID))
    );
    const gz = Math.min(
      GRASS_CHUNK_GRID - 1,
      Math.max(0, Math.floor(((GRASS_DATA[o + 2] + span) / (span * 2)) * GRASS_CHUNK_GRID))
    );
    buckets[gz * GRASS_CHUNK_GRID + gx].push(k);
  }
  return buckets
    .filter((b) => b.length > 0)
    .map((idx) => {
      let minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9, minY = 1e9, maxY = -1e9;
      for (const k of idx) {
        const o = k * GRASS_STRIDE;
        minX = Math.min(minX, GRASS_DATA[o]);
        maxX = Math.max(maxX, GRASS_DATA[o]);
        minY = Math.min(minY, GRASS_DATA[o + 1]);
        maxY = Math.max(maxY, GRASS_DATA[o + 1]);
        minZ = Math.min(minZ, GRASS_DATA[o + 2]);
        maxZ = Math.max(maxZ, GRASS_DATA[o + 2]);
      }
      return {
        idx,
        cx: (minX + maxX) / 2,
        cy: (minY + maxY) / 2 + 0.3,
        cz: (minZ + maxZ) / 2,
        r: Math.hypot((maxX - minX) / 2, (maxY - minY) / 2 + 0.6, (maxZ - minZ) / 2) + 0.8,
      };
    });
})();

function Grass({ dense }: { dense: boolean }) {
  const refs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const shaderRef = useRef<{ uniforms: { uTime: { value: number } } } | null>(null);
  const frustum = useMemo(() => new THREE.Frustum(), []);
  const projView = useMemo(() => new THREE.Matrix4(), []);
  const sphere = useMemo(() => new THREE.Sphere(), []);

  const geo = useMemo(() => {
    // a tuft of 20 curved blades baked into one geometry; with 500k
    // instanced tufts that's 10,000,000 blades across the chunks
    const BLADES = 20;
    const pos: number[] = [];
    const nrm: number[] = [];
    const idx: number[] = [];
    // blade template: two segments tapering to a tip
    const template = [
      [-0.011, 0], [0.011, 0], [-0.007, 0.15], [0.007, 0.15], [0, 0.3],
    ];
    for (let b = 0; b < BLADES; b++) {
      const dx = (hash2(b * 3 + 1, 5) - 0.5) * 0.46;
      const dz = (hash2(b * 5 + 2, 9) - 0.5) * 0.46;
      const rot = hash2(b, 3) * Math.PI;
      const sc = 0.65 + hash2(b, 4) * 0.7;
      const lx = (hash2(b, 6) - 0.5) * 0.34;
      const lz = (hash2(b, 8) - 0.5) * 0.34;
      const cr = Math.cos(rot);
      const sr = Math.sin(rot);
      const base = b * 5;
      for (const [tx, ty] of template) {
        const y = ty * sc;
        pos.push(dx + cr * tx + y * lx, y, dz + sr * tx + y * lz);
        nrm.push(-sr, 0, cr);
      }
      idx.push(base, base + 1, base + 2, base + 1, base + 3, base + 2, base + 2, base + 3, base + 4);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
    g.setIndex(idx);
    return g;
  }, []);

  const mat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: "#4F9440",
      side: THREE.DoubleSide,
      roughness: 0.85,
    });
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      shader.vertexShader = ("uniform float uTime;\nvarying float vTip;\n" + shader.vertexShader).replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vTip = position.y;
        #ifdef USE_INSTANCING
          vec2 ip = vec2(instanceMatrix[3][0], instanceMatrix[3][2]);
          // calm traveling wave + per-blade phase from its offset in the tuft
          float ph = ip.x * 0.38 + ip.y * 0.30 + (position.x + position.z) * 2.4;
          float w = sin(uTime * 1.6 + ph) * 0.60
                  + sin(uTime * 2.9 + ip.x * 1.15 - ip.y * 0.8 + position.x * 5.0) * 0.25
                  + ${(MOOD.rainy ? 0.3 : 0.12).toFixed(2)};
          // blades bow from the tip, not the root
          float bend = position.y * position.y * 1.9;
          transformed.x += w * bend;
          transformed.z += cos(uTime * 1.2 + ip.y * 0.5 + position.z * 4.0) * 0.25 * bend;
        #endif`
      );
      shader.fragmentShader = ("varying float vTip;\n" + shader.fragmentShader).replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        // shadowed roots, sunlit tips — the classic meadow gradient
        float tip = smoothstep(0.0, 0.32, vTip);
        diffuseColor.rgb *= 0.84 + tip * 0.42;
        diffuseColor.g += tip * 0.05;`
      );
      shaderRef.current = shader as unknown as { uniforms: { uTime: { value: number } } };
    };
    return m;
  }, []);

  useEffect(() => {
    const dummy = new THREE.Object3D();
    const colA = new THREE.Color("#3B7A2E");
    const colB = new THREE.Color("#4E9440");
    const col = new THREE.Color();
    const step = dense ? 1 : 3;
    GRASS_CHUNKS.forEach((chunk, ci) => {
      const mesh = refs.current[ci];
      if (!mesh) return;
      let n = 0;
      for (let j = 0; j < chunk.idx.length; j += step) {
        const o = chunk.idx[j] * GRASS_STRIDE;
        dummy.position.set(GRASS_DATA[o], GRASS_DATA[o + 1], GRASS_DATA[o + 2]);
        dummy.rotation.set(GRASS_DATA[o + 6], GRASS_DATA[o + 4], GRASS_DATA[o + 7]);
        dummy.scale.set(1, GRASS_DATA[o + 3], 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(n, dummy.matrix);
        const c = GRASS_DATA[o + 5];
        col.copy(c > 0.5 ? colA : colB).multiplyScalar(0.72 + c * 0.5);
        mesh.setColorAt(n, col);
        n++;
      }
      mesh.count = n;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });
  }, [dense]);

  /* per-chunk culling: skip chunks outside the view or far away */
  useFrame(({ clock, camera }) => {
    if (shaderRef.current) shaderRef.current.uniforms.uTime.value = clock.elapsedTime;
    projView.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projView);
    GRASS_CHUNKS.forEach((chunk, ci) => {
      const mesh = refs.current[ci];
      if (!mesh) return;
      sphere.center.set(chunk.cx, chunk.cy, chunk.cz);
      sphere.radius = chunk.r;
      const near =
        Math.hypot(camera.position.x - chunk.cx, camera.position.z - chunk.cz) <
        MOOD.fogFar * 0.8;
      mesh.visible = near && frustum.intersectsSphere(sphere);
    });
  });

  return (
    <>
      {GRASS_CHUNKS.map((chunk, ci) => (
        <instancedMesh
          key={`${ci}-${dense ? "d" : "l"}`}
          ref={(m) => {
            refs.current[ci] = m;
          }}
          args={[geo, mat, chunk.idx.length]}
          frustumCulled={false}
        />
      ))}
    </>
  );
}

function Flowers() {
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    if (!ref.current) return;
    const dummy = new THREE.Object3D();
    const col = new THREE.Color();
    FLOWER_SPOTS.forEach((p, i) => {
      dummy.position.set(p.x + 0.1, p.y + 0.05, p.z + 0.1);
      dummy.scale.setScalar(0.8 + p.c * 0.6);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
      col.set(p.c > 0.35 ? "#D8C94E" : "#DCDCCE");
      ref.current!.setColorAt(i, col);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, FLOWER_SPOTS.length]} frustumCulled={false}>
      <sphereGeometry args={[0.028, 6, 5]} />
      <meshStandardMaterial color="#ffffff" emissive="#8A7F30" emissiveIntensity={0.35} roughness={0.7} />
    </instancedMesh>
  );
}

/* ── milestone cottage: warm windows in the storm ───────────────── */

function Station({ i, m, store }: { i: number; m: Milestone; store: Store }) {
  const spot = SPOTS[i];
  const winMat = useRef<THREE.MeshStandardMaterial>(null);
  const ringRef = useRef<THREE.Group>(null);
  const yearTex = useMemo(() => makeLabel(m.year), [m.year]);
  const yaw = Math.atan2(-spot.x, -spot.z); // door faces the island interior

  useFrame(({ clock }, dt) => {
    const isActive = store.active === i;
    if (winMat.current)
      easing.damp(
        winMat.current,
        "emissiveIntensity",
        isActive ? MOOD.windowGlowActive : MOOD.windowGlow,
        0.35,
        dt
      );
    if (ringRef.current) ringRef.current.rotation.y = clock.elapsedTime * 0.4 + i;
  });

  return (
    <group position={[spot.x, spot.y, spot.z]} rotation={[0, yaw, 0]}>
      {/* stone platform */}
      <mesh receiveShadow castShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[2.3, 2.7, 0.5, 8]} />
        <meshStandardMaterial color="#8F8268" flatShading roughness={0.9} />
      </mesh>

      {/* cottage — honey walls, amber shingle roofs, porch, mullions */}
      <group position={[0, 0.42, 0]}>
        {/* main walls */}
        <RoundedBox args={[2.3, 1.6, 1.7]} radius={0.05} position={[0, 0.8, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#C79742" roughness={0.8} />
        </RoundedBox>
        {/* tall gable roof, ridge along X */}
        <mesh position={[0, 2.0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.85, 1, 0.86]} castShadow>
          <cylinderGeometry args={[1.12, 1.12, 2.75, 3, 1]} />
          <meshStandardMaterial color="#8A5A2E" flatShading roughness={0.85} />
        </mesh>
        {/* side annex with its own little roof */}
        <RoundedBox args={[0.9, 1.1, 1.1]} radius={0.04} position={[1.45, 0.55, 0]} castShadow>
          <meshStandardMaterial color="#C79742" roughness={0.8} />
        </RoundedBox>
        <mesh position={[1.45, 1.32, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.55, 1, 0.62]} castShadow>
          <cylinderGeometry args={[1.0, 1.0, 1.15, 3, 1]} />
          <meshStandardMaterial color="#8A5A2E" flatShading roughness={0.85} />
        </mesh>
        {/* stone footing */}
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <boxGeometry args={[2.44, 0.24, 1.84]} />
          <meshStandardMaterial color="#8F8268" flatShading roughness={0.95} />
        </mesh>
        {/* timber corner posts + beam under the eaves */}
        {(
          [
            [-1.12, -0.82], [1.12, -0.82], [-1.12, 0.82], [1.12, 0.82],
          ] as const
        ).map(([px, pz]) => (
          <mesh key={`${px}${pz}`} position={[px, 0.8, pz]} castShadow>
            <boxGeometry args={[0.1, 1.6, 0.1]} />
            <meshStandardMaterial color="#8A5A2E" roughness={0.85} />
          </mesh>
        ))}
        {[-0.84, 0.84].map((bz) => (
          <mesh key={bz} position={[0, 1.55, bz]}>
            <boxGeometry args={[2.36, 0.1, 0.08]} />
            <meshStandardMaterial color="#8A5A2E" roughness={0.85} />
          </mesh>
        ))}
        {/* ridge cap */}
        <mesh position={[0, 2.94, 0]} castShadow>
          <boxGeometry args={[2.5, 0.1, 0.18]} />
          <meshStandardMaterial color="#6E4423" roughness={0.85} />
        </mesh>
        {/* brick chimney on the ridge */}
        <mesh position={[-0.55, 2.6, 0]} castShadow>
          <boxGeometry args={[0.28, 0.85, 0.28]} />
          <meshStandardMaterial color="#A45F33" roughness={0.9} />
        </mesh>
        <mesh position={[-0.55, 3.03, 0]}>
          <boxGeometry args={[0.36, 0.1, 0.36]} />
          <meshStandardMaterial color="#8A4C28" roughness={0.9} />
        </mesh>
        {/* porch awning over the door */}
        <mesh position={[0, 1.42, 0.99]} rotation={[0, 0, Math.PI / 2]} scale={[0.32, 1, 0.42]} castShadow>
          <cylinderGeometry args={[0.85, 0.85, 1.0, 3, 1]} />
          <meshStandardMaterial color="#8A5A2E" flatShading roughness={0.85} />
        </mesh>
        {/* door with orange frame */}
        <mesh position={[0, 0.55, 0.86]}>
          <boxGeometry args={[0.56, 0.98, 0.05]} />
          <meshStandardMaterial color="#C87C33" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.53, 0.9]}>
          <boxGeometry args={[0.42, 0.86, 0.05]} />
          <meshStandardMaterial color="#5A3A22" roughness={0.8} />
        </mesh>
        {/* knob, stone step, hanging door lantern */}
        <mesh position={[0.14, 0.5, 0.94]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#D8B25E" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.03, 1.06]} receiveShadow>
          <boxGeometry args={[0.62, 0.1, 0.34]} />
          <meshStandardMaterial color="#8F8268" flatShading roughness={0.95} />
        </mesh>
        <group position={[0.44, 1.12, 0.95]}>
          <mesh>
            <boxGeometry args={[0.08, 0.11, 0.08]} />
            <meshStandardMaterial color="#2E2A24" roughness={0.6} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.05, 0.07, 0.05]} />
            <meshStandardMaterial color="#FFC96B" emissive="#FFB95E" emissiveIntensity={MOOD.windowGlow} />
          </mesh>
        </group>
        {/* windows: orange frames, glowing panes, cross mullions */}
        {[-0.72, 0.72].map((wx, wi) => (
          <group key={wx} position={[wx, 0.95, 0.86]}>
            <mesh>
              <boxGeometry args={[0.46, 0.46, 0.05]} />
              <meshStandardMaterial color="#C87C33" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0, 0.02]}>
              <boxGeometry args={[0.36, 0.36, 0.04]} />
              {wi === 0 ? (
                <meshStandardMaterial ref={winMat} color="#5A452A" emissive="#FFC66B" emissiveIntensity={MOOD.windowGlow} />
              ) : (
                <meshStandardMaterial color="#5A452A" emissive="#FFC66B" emissiveIntensity={MOOD.windowGlow * 0.9} />
              )}
            </mesh>
            <mesh position={[0, 0, 0.045]}>
              <boxGeometry args={[0.035, 0.38, 0.02]} />
              <meshStandardMaterial color="#C87C33" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0, 0.045]}>
              <boxGeometry args={[0.38, 0.035, 0.02]} />
              <meshStandardMaterial color="#C87C33" roughness={0.8} />
            </mesh>
            {/* sill + shutters */}
            <mesh position={[0, -0.27, 0.02]} castShadow>
              <boxGeometry args={[0.54, 0.05, 0.1]} />
              <meshStandardMaterial color="#8A5A2E" roughness={0.85} />
            </mesh>
            {[-0.3, 0.3].map((sx) => (
              <mesh key={sx} position={[sx, 0, 0.01]}>
                <boxGeometry args={[0.1, 0.44, 0.03]} />
                <meshStandardMaterial color="#8A5A2E" roughness={0.85} />
              </mesh>
            ))}
          </group>
        ))}
        {/* annex window */}
        <mesh position={[1.45, 0.6, 0.57]}>
          <boxGeometry args={[0.3, 0.3, 0.04]} />
          <meshStandardMaterial color="#5A452A" emissive="#FFC66B" emissiveIntensity={MOOD.windowGlow * 0.8} />
        </mesh>
        {/* year board above the door */}
        <mesh position={[0, 1.78, 0.9]}>
          <boxGeometry args={[0.95, 0.42, 0.05]} />
          <meshStandardMaterial color="#6E4423" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.78, 0.94]}>
          <planeGeometry args={[0.82, 0.4]} />
          <meshStandardMaterial
            transparent
            alphaMap={yearTex}
            emissiveMap={yearTex}
            emissive={ACCENT}
            emissiveIntensity={1.6}
            color="#000000"
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* orbiting shards */}
      <group ref={ringRef} position={[0, 1.7, 0]}>
        {[0, 1, 2].map((k) => (
          <mesh key={k} position={[Math.cos((k / 3) * Math.PI * 2) * 2.1, 0.4 + (k % 2) * 0.5, Math.sin((k / 3) * Math.PI * 2) * 2.1]} scale={0.13}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={1.8} roughness={0.3} />
          </mesh>
        ))}
      </group>
      <pointLight position={[0, 1.5, 1.9]} intensity={7} distance={10} decay={2} color="#FFC98E" />
      <Sparkles count={10} scale={[4, 3, 4]} size={2.2} speed={0.3} color={ACCENT} position={[0, 2, 0]} />
    </group>
  );
}

/* ── the hidden pizza shack (easter egg) ────────────────────────── */

function PizzaShack() {
  const sign = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (sign.current) sign.current.rotation.y = Math.sin(clock.elapsedTime * 0.9) * 0.18;
  });
  return (
    <group position={[PIZZA.x, PIZZA.y, PIZZA.z]} rotation={[0, PIZZA.yaw, 0]}>
      {/* stone pad */}
      <mesh receiveShadow position={[0, 0.12, 0]}>
        <cylinderGeometry args={[1.7, 2.0, 0.34, 8]} />
        <meshStandardMaterial color="#8F8268" flatShading roughness={0.95} />
      </mesh>
      {/* shack */}
      <RoundedBox args={[1.7, 1.3, 1.4]} radius={0.04} position={[0, 0.92, 0]} castShadow>
        <meshStandardMaterial color="#D9C9A0" roughness={0.85} />
      </RoundedBox>
      <mesh position={[0, 1.62, 0]} castShadow>
        <boxGeometry args={[1.9, 0.14, 1.6]} />
        <meshStandardMaterial color="#4A3226" roughness={0.85} />
      </mesh>
      {/* serving window, warm and lit */}
      <mesh position={[0, 0.95, 0.69]}>
        <boxGeometry args={[0.85, 0.5, 0.06]} />
        <meshStandardMaterial color="#5A452A" emissive="#FFC66B" emissiveIntensity={MOOD.windowGlow} />
      </mesh>
      <mesh position={[0, 0.66, 0.76]} castShadow>
        <boxGeometry args={[1.0, 0.08, 0.24]} />
        <meshStandardMaterial color="#8A5A2E" roughness={0.85} />
      </mesh>
      {/* striped awning */}
      {[-0.36, -0.18, 0, 0.18, 0.36].map((ax, i) => (
        <mesh key={ax} position={[ax * 2, 1.36, 0.92]} rotation={[0.5, 0, 0]} castShadow>
          <boxGeometry args={[0.36, 0.04, 0.55]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#C0392B" : "#EFE6D2"} roughness={0.8} />
        </mesh>
      ))}
      {/* swinging pizza sign on a pole */}
      <mesh position={[1.05, 1.1, 0.6]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 2.2, 8]} />
        <meshStandardMaterial color="#6E4A2C" roughness={0.9} />
      </mesh>
      <group ref={sign} position={[1.05, 2.28, 0.6]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.46, 0.46, 0.07, 20]} />
          <meshStandardMaterial color="#D8A85A" roughness={0.75} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.045]}>
          <cylinderGeometry args={[0.36, 0.36, 0.02, 20]} />
          <meshStandardMaterial color="#F2C94C" emissive="#B8862E" emissiveIntensity={0.4} roughness={0.7} />
        </mesh>
        {[0, 1, 2, 3, 4].map((k) => (
          <mesh
            key={k}
            rotation={[Math.PI / 2, 0, 0]}
            position={[
              Math.cos((k / 5) * Math.PI * 2 + 0.6) * 0.19,
              Math.sin((k / 5) * Math.PI * 2 + 0.6) * 0.19,
              0.058,
            ]}
          >
            <cylinderGeometry args={[0.055, 0.055, 0.015, 10]} />
            <meshStandardMaterial color="#B03A2E" roughness={0.7} />
          </mesh>
        ))}
      </group>
      <pointLight position={[0, 1.1, 1.2]} intensity={2.2} distance={5} decay={2} color="#FFC98E" />
    </group>
  );
}

/* ── lighthouse (the journey's end) ─────────────────────────────── */

function Lighthouse() {
  const lamp = useRef<THREE.PointLight>(null);
  const beam = useRef<THREE.Group>(null);
  /* beams die off along their length like light through damp air */
  const beamTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 2;
    c.height = 64;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, 64);
    g.addColorStop(0, "rgba(255,255,255,0)"); // wide far end
    g.addColorStop(0.25, "rgba(255,255,255,0.08)");
    g.addColorStop(0.6, "rgba(255,255,255,0.32)");
    g.addColorStop(1, "rgba(255,255,255,1)"); // apex (at the lamp)
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 2, 64);
    return new THREE.CanvasTexture(c);
  }, []);
  useFrame(({ clock }) => {
    if (lamp.current) lamp.current.intensity = 14 + Math.sin(clock.elapsedTime * 2.4) * 5;
    if (beam.current) beam.current.rotation.y = clock.elapsedTime * 0.5;
  });
  const rings = [
    { y: 0.9, r0: 1.35, r1: 1.2, h: 1.8, c: "#F4EFE0" },
    { y: 2.6, r0: 1.2, r1: 1.05, h: 1.6, c: ACCENT },
    { y: 4.1, r0: 1.05, r1: 0.92, h: 1.4, c: "#F4EFE0" },
    { y: 5.4, r0: 0.92, r1: 0.82, h: 1.2, c: ACCENT },
  ];
  return (
    <group position={[LIGHTHOUSE.x, LIGHTHOUSE.y, LIGHTHOUSE.z]}>
      <mesh receiveShadow position={[0, 0.15, 0]}>
        <cylinderGeometry args={[2.4, 2.9, 0.5, 10]} />
        <meshStandardMaterial color="#B4A585" flatShading roughness={0.9} />
      </mesh>
      {rings.map((r, i) => (
        <mesh key={i} castShadow position={[0, r.y, 0]}>
          <cylinderGeometry args={[r.r1, r.r0, r.h, 20]} />
          <meshStandardMaterial color={r.c} roughness={0.55} />
        </mesh>
      ))}
      {/* lamp room */}
      <mesh position={[0, 6.45, 0]}>
        <cylinderGeometry args={[0.75, 0.75, 0.9, 12]} />
        <meshPhysicalMaterial color="#FFF3D0" emissive="#FFDf9E" emissiveIntensity={1.6} roughness={0.2} transmission={0.5} thickness={0.5} />
      </mesh>
      <mesh position={[0, 7.15, 0]} castShadow>
        <coneGeometry args={[0.95, 0.75, 12]} />
        <meshStandardMaterial color="#3A342C" roughness={0.6} />
      </mesh>
      <pointLight ref={lamp} position={[0, 6.5, 0]} intensity={MOOD.lampIntensity} distance={46} decay={2} color="#FFE2A8" />
      {/* rotating light beams — invisible in clear daylight, hero of the night storm */}
      <group ref={beam} position={[0, 6.45, 0]} visible={MOOD.night || MOOD.rainy}>
        {[0, Math.PI].map((a) => (
          <mesh key={a} rotation={[0, a, Math.PI / 2]} position={[Math.cos(a) * 3.2, 0, Math.sin(a) * 3.2]}>
            <coneGeometry args={[0.55, 6.4, 12, 1, true]} />
            <meshBasicMaterial
              color="#FFE9C0"
              transparent
              opacity={MOOD.beamOpacity * 0.9}
              alphaMap={beamTex}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ── BB-8: the playable character ───────────────────────────────── */

const KEYS = { f: false, b: false, l: false, r: false, boost: false };

function Player({ store }: { store: Store }) {
  const root = useRef<THREE.Group>(null);
  const bodyG = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const vel = useRef(new THREE.Vector2(0, 0));
  const phase = useRef(0);
  const R = 0.42; // body radius for collisions

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    if (!root.current) return;

    // camera-relative input
    const fwd = new THREE.Vector3();
    state.camera.getWorldDirection(fwd);
    fwd.y = 0;
    fwd.normalize();
    const side = new THREE.Vector3().crossVectors(fwd, UP).negate();
    const input = new THREE.Vector2(
      (KEYS.r ? 1 : 0) - (KEYS.l ? 1 : 0),
      (KEYS.f ? 1 : 0) - (KEYS.b ? 1 : 0)
    );
    const playing = store.phase === "play";
    const max = KEYS.boost ? 12 : 6.5;
    const want = new THREE.Vector2(
      (fwd.x * input.y - side.x * input.x) * max,
      (fwd.z * input.y - side.z * input.x) * max
    );
    if (!playing || input.lengthSq() === 0) want.set(0, 0);
    vel.current.lerp(want, 1 - Math.pow(0.0018, dt));

    // integrate + keep on land
    let nx = store.px + vel.current.x * dt;
    let nz = store.pz + vel.current.y * dt;
    if (terrainHeight(nx, nz) < 0.35) {
      if (terrainHeight(nx, store.pz) >= 0.35) nz = store.pz;
      else if (terrainHeight(store.px, nz) >= 0.35) nx = store.px;
      else {
        nx = store.px;
        nz = store.pz;
      }
      vel.current.multiplyScalar(0.4);
    }
    // push out of solid props
    for (const s of SOLIDS) {
      const ddx = nx - s.x;
      const ddz = nz - s.z;
      const d = Math.hypot(ddx, ddz);
      const min = s.r + R;
      if (d > 0.0001 && d < min) {
        nx = s.x + (ddx / d) * min;
        nz = s.z + (ddz / d) * min;
      }
    }
    store.px = nx;
    store.pz = nz;
    const speed = vel.current.length();
    store.speed = speed;

    const gy = terrainHeight(nx, nz);
    const amp = Math.min(speed / 6.5, 1);
    root.current.position.set(nx, gy + Math.abs(Math.sin(phase.current)) * 0.05 * amp, nz);

    // heading: the whole hiker turns toward the walk direction
    if (speed > 0.4) {
      store.heading = THREE.MathUtils.damp(
        store.heading,
        store.heading + THREE.MathUtils.euclideanModulo(Math.atan2(vel.current.x, vel.current.y) - store.heading + Math.PI, Math.PI * 2) - Math.PI,
        8,
        dt
      );
    }
    root.current.rotation.y = store.heading;

    // walk cycle
    phase.current += speed * dt * 2.4;
    const t = state.clock.elapsedTime;
    const swing = Math.sin(phase.current) * 0.75 * amp;
    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
    if (armL.current) armL.current.rotation.x = -swing * 0.7 + (1 - amp) * Math.sin(t * 1.8) * 0.05;
    if (armR.current) armR.current.rotation.x = swing * 0.7;
    if (bodyG.current) {
      bodyG.current.rotation.x = amp * 0.10; // lean into the walk
      bodyG.current.rotation.z = Math.sin(phase.current * 2) * 0.03 * amp;
    }
  });

  return (
    <group ref={root} position={[PLAYER_START.x, 2, PLAYER_START.z]}>
      <group ref={bodyG}>
        {/* legs (pivot at hips) */}
        <group ref={legL} position={[-0.11, 0.38, 0]}>
          <mesh castShadow position={[0, -0.17, 0]}>
            <boxGeometry args={[0.11, 0.34, 0.11]} />
            <meshStandardMaterial color="#4E3A28" roughness={0.85} />
          </mesh>
          <mesh castShadow position={[0, -0.36, 0.03]}>
            <boxGeometry args={[0.12, 0.09, 0.18]} />
            <meshStandardMaterial color="#2E2318" roughness={0.85} />
          </mesh>
        </group>
        <group ref={legR} position={[0.11, 0.38, 0]}>
          <mesh castShadow position={[0, -0.17, 0]}>
            <boxGeometry args={[0.11, 0.34, 0.11]} />
            <meshStandardMaterial color="#4E3A28" roughness={0.85} />
          </mesh>
          <mesh castShadow position={[0, -0.36, 0.03]}>
            <boxGeometry args={[0.12, 0.09, 0.18]} />
            <meshStandardMaterial color="#2E2318" roughness={0.85} />
          </mesh>
        </group>

        {/* torso + rain cloak */}
        <RoundedBox args={[0.4, 0.46, 0.26]} radius={0.06} position={[0, 0.62, 0]} castShadow>
          <meshStandardMaterial color="#B98B52" roughness={0.85} />
        </RoundedBox>
        <mesh castShadow position={[0, 0.62, -0.16]}>
          <boxGeometry args={[0.3, 0.34, 0.1]} />
          <meshStandardMaterial color="#6E4F33" roughness={0.9} />
        </mesh>

        {/* arms (pivot at shoulders) */}
        <group ref={armL} position={[-0.26, 0.78, 0]}>
          <mesh castShadow position={[0, -0.16, 0]}>
            <boxGeometry args={[0.09, 0.34, 0.09]} />
            <meshStandardMaterial color="#A97D48" roughness={0.85} />
          </mesh>
        </group>
        <group ref={armR} position={[0.26, 0.78, 0]}>
          <mesh castShadow position={[0, -0.16, 0]}>
            <boxGeometry args={[0.09, 0.34, 0.09]} />
            <meshStandardMaterial color="#A97D48" roughness={0.85} />
          </mesh>
          {/* lantern swinging from the right hand */}
          <group position={[0.02, -0.38, 0.06]}>
            <mesh>
              <boxGeometry args={[0.11, 0.15, 0.11]} />
              <meshStandardMaterial color="#2E2A24" roughness={0.6} />
            </mesh>
            <mesh>
              <boxGeometry args={[0.07, 0.1, 0.07]} />
              <meshStandardMaterial color="#FFC96B" emissive="#FFB95E" emissiveIntensity={MOOD.night ? 3.4 : 1.2} />
            </mesh>
            <pointLight intensity={MOOD.lantern} distance={9} decay={2} color="#FFDCA0" />
          </group>
        </group>

        {/* head + rain hat */}
        <mesh castShadow position={[0, 1.0, 0]}>
          <sphereGeometry args={[0.14, 20, 14]} />
          <meshStandardMaterial color="#E9BE93" roughness={0.7} />
        </mesh>
        {[-0.05, 0.05].map((ex) => (
          <mesh key={ex} position={[ex, 1.02, 0.125]}>
            <sphereGeometry args={[0.016, 8, 8]} />
            <meshStandardMaterial color="#1C1917" roughness={0.4} />
          </mesh>
        ))}
        <group position={[0, 1.1, 0]} rotation={[-0.08, 0, 0.05]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.24, 0.26, 0.035, 12]} />
            <meshStandardMaterial color="#C9A55C" flatShading roughness={0.85} />
          </mesh>
          <mesh castShadow position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.11, 0.14, 0.13, 10]} />
            <meshStandardMaterial color="#B8934E" flatShading roughness={0.85} />
          </mesh>
        </group>
      </group>

      {/* contact shadow blob */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[0.42, 20]} />
        <meshBasicMaterial color="#05080D" transparent opacity={0.3} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ── the dog: a little saint-bernard pup trotting after the hiker ── */

function Dog({ store }: { store: Store }) {
  const root = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Mesh>(null);
  const head = useRef<THREE.Group>(null);
  const legFL = useRef<THREE.Group>(null);
  const legFR = useRef<THREE.Group>(null);
  const legBL = useRef<THREE.Group>(null);
  const legBR = useRef<THREE.Group>(null);
  const pos = useRef(new THREE.Vector2(PLAYER_START.x - 1.2, PLAYER_START.z + 0.8));
  const heading = useRef(START_HEADING);
  const phase = useRef(0);

  useFrame(({ clock }, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    if (!root.current) return;
    const t = clock.elapsedTime;

    // heel position: behind-left of the hiker
    const hx = Math.sin(store.heading);
    const hz = Math.cos(store.heading);
    const tx = store.px - hx * 1.15 - hz * 0.85;
    const tz = store.pz - hz * 1.15 + hx * 0.85;
    const dx = tx - pos.current.x;
    const dz = tz - pos.current.y;
    const dist = Math.hypot(dx, dz);
    const speed = Math.min(dist * 3.2, 11);
    if (dist > 0.25) {
      const nx = pos.current.x + (dx / dist) * speed * dt;
      const nz = pos.current.y + (dz / dist) * speed * dt;
      if (terrainHeight(nx, nz) >= 0.3) {
        pos.current.set(nx, nz);
      }
      heading.current = THREE.MathUtils.damp(
        heading.current,
        heading.current +
          THREE.MathUtils.euclideanModulo(Math.atan2(dx, dz) - heading.current + Math.PI, Math.PI * 2) -
          Math.PI,
        10,
        dt
      );
    } else {
      // idle: face where the hiker faces
      heading.current = THREE.MathUtils.damp(heading.current, store.heading, 3, dt);
    }

    const amp = Math.min(speed / 9, 1);
    phase.current += speed * dt * 3.2;
    const gy = terrainHeight(pos.current.x, pos.current.y);
    root.current.position.set(
      pos.current.x,
      gy + Math.abs(Math.sin(phase.current)) * 0.04 * amp,
      pos.current.y
    );
    root.current.rotation.y = heading.current;

    const swing = Math.sin(phase.current) * 0.7 * amp;
    if (legFL.current) legFL.current.rotation.x = swing;
    if (legBR.current) legBR.current.rotation.x = swing;
    if (legFR.current) legFR.current.rotation.x = -swing;
    if (legBL.current) legBL.current.rotation.x = -swing;
    if (tail.current) tail.current.rotation.z = Math.sin(t * (5 + amp * 5)) * 0.4;
    if (head.current) {
      head.current.rotation.x = Math.sin(t * 2.1) * 0.05 - amp * 0.08;
      head.current.rotation.y = Math.sin(t * 0.7) * 0.15 * (1 - amp);
    }
  });

  const white = "#EDE6D8";
  const brown = "#8A5A33";
  const dark = "#2A2018";

  return (
    <group ref={root} position={[PLAYER_START.x - 1.2, 2, PLAYER_START.z + 0.8]}>
      {/* body: white with a brown saddle */}
      <mesh castShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[0.24, 0.22, 0.46]} />
        <meshStandardMaterial color={white} roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0, 0.38, -0.06]}>
        <boxGeometry args={[0.25, 0.1, 0.3]} />
        <meshStandardMaterial color={brown} roughness={0.85} />
      </mesh>
      {/* head */}
      <group ref={head} position={[0, 0.44, 0.26]}>
        <mesh castShadow>
          <boxGeometry args={[0.2, 0.18, 0.18]} />
          <meshStandardMaterial color={brown} roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.03, 0.12]}>
          <boxGeometry args={[0.11, 0.1, 0.1]} />
          <meshStandardMaterial color={white} roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.01, 0.175]}>
          <boxGeometry args={[0.045, 0.04, 0.03]} />
          <meshStandardMaterial color={dark} roughness={0.5} />
        </mesh>
        {[-0.055, 0.055].map((ex) => (
          <mesh key={ex} position={[ex, 0.035, 0.095]}>
            <sphereGeometry args={[0.016, 8, 8]} />
            <meshStandardMaterial color={dark} roughness={0.4} />
          </mesh>
        ))}
        {/* floppy ears */}
        {[-0.115, 0.115].map((ex) => (
          <mesh key={ex} castShadow position={[ex, 0.02, -0.01]} rotation={[0, 0, ex > 0 ? -0.25 : 0.25]}>
            <boxGeometry args={[0.05, 0.14, 0.1]} />
            <meshStandardMaterial color="#6E4526" roughness={0.85} />
          </mesh>
        ))}
      </group>
      {/* legs */}
      {(
        [
          [legFL, -0.08, 0.16],
          [legFR, 0.08, 0.16],
          [legBL, -0.08, -0.16],
          [legBR, 0.08, -0.16],
        ] as const
      ).map(([ref2, lx, lz], i) => (
        <group key={i} ref={ref2} position={[lx, 0.2, lz]}>
          <mesh castShadow position={[0, -0.1, 0]}>
            <boxGeometry args={[0.07, 0.2, 0.07]} />
            <meshStandardMaterial color={i < 2 ? white : brown} roughness={0.85} />
          </mesh>
        </group>
      ))}
      {/* tail */}
      <mesh ref={tail} castShadow position={[0, 0.42, -0.26]} rotation={[0.7, 0, 0]}>
        <boxGeometry args={[0.05, 0.2, 0.05]} />
        <meshStandardMaterial color={white} roughness={0.85} />
      </mesh>
      {/* contact blob */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.28, 16]} />
        <meshBasicMaterial color="#05080D" transparent opacity={0.25} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ── camera: cinematic orbit → third-person chase ───────────────── */

function CameraRig({ store, light }: { store: Store; light: React.RefObject<THREE.DirectionalLight> }) {
  const look = useRef(new THREE.Vector3(0, 4, 0));

  useFrame((state, dt) => {
    easing.damp(store, "playT", store.phase === "play" ? 1 : 0, 1.4, dt);
    const pt = THREE.MathUtils.smoothstep(store.playT, 0, 1);
    const t = state.clock.elapsedTime;

    // cinematic orbit pose
    const a = (t - store.cineStart) * 0.1 + Math.PI * 0.2;
    const orbit = new THREE.Vector3(Math.sin(a) * 62, 15 + Math.sin(t * 0.3) * 2, Math.cos(a) * 62);
    const orbitLook = new THREE.Vector3(0, 4.5, 0);

    // chase pose
    const py = terrainHeight(store.px, store.pz) + 0.62;
    const back = new THREE.Vector3(Math.sin(store.heading), 0, Math.cos(store.heading)).negate();
    const chase = new THREE.Vector3(store.px, py, store.pz)
      .addScaledVector(back, 6.4)
      .add(new THREE.Vector3(0, 3.1, 0));
    // pull in when a tree blocks the line of sight
    let cut = 1;
    const dx = chase.x - store.px;
    const dz = chase.z - store.pz;
    const len2 = dx * dx + dz * dz;
    for (const s of TREE_SPOTS) {
      if (Math.hypot(s.x - store.px, s.z - store.pz) > 9.5) continue;
      const tt = ((s.x - store.px) * dx + (s.z - store.pz) * dz) / len2;
      if (tt < 0.12 || tt > 1) continue;
      const cx = store.px + dx * tt;
      const cz = store.pz + dz * tt;
      if (Math.hypot(s.x - cx, s.z - cz) < 1.15 * s.s) cut = Math.min(cut, Math.max(tt - 0.14, 0.3));
    }
    if (cut < 1) {
      chase.set(store.px + dx * cut, py + (chase.y - py) * (0.4 + 0.6 * cut), store.pz + dz * cut);
    }
    // never sink under terrain
    chase.y = Math.max(chase.y, terrainHeight(chase.x, chase.z) + 1.4);
    const chaseLook = new THREE.Vector3(store.px, py + 1.1, store.pz).addScaledVector(back, -2.5);
    chaseLook.x += state.pointer.x * 1.4;
    chaseLook.y += state.pointer.y * 0.8 + Math.sin(t * 0.85) * 0.05;

    const goal = orbit.lerp(chase, pt);
    const lookGoal = orbitLook.lerp(chaseLook, pt);
    easing.damp3(state.camera.position, goal, store.phase === "play" ? 0.28 : 0.9, dt);
    easing.damp3(look.current, lookGoal, store.phase === "play" ? 0.22 : 0.8, dt);
    state.camera.lookAt(look.current);

    // proximity → active milestone
    let active = -1;
    SPOTS.forEach((s, i) => {
      if (Math.hypot(s.x - store.px, s.z - store.pz) < 5.2) active = i;
    });
    store.active = store.phase === "play" ? active : -1;
    store.pizza =
      store.phase === "play" &&
      Math.hypot(PIZZA.x - store.px, PIZZA.z - store.pz) < 4.2;

    // sun follows for tight shadow frustum
    if (light.current) {
      light.current.position.set(store.px - 14, 22, store.pz + 10);
      light.current.target.position.set(store.px, 0, store.pz);
      light.current.target.updateMatrixWorld();
    }
  });

  return null;
}

/* ── bridge scene → overlay ─────────────────────────────────────── */

function Bridge({
  store,
  onActive,
  onPizza,
}: {
  store: Store;
  onActive: (i: number) => void;
  onPizza: (near: boolean) => void;
}) {
  const last = useRef(-2);
  const lastPizza = useRef(false);
  useFrame(() => {
    if (store.active !== last.current) {
      last.current = store.active;
      onActive(store.active);
    }
    if (store.pizza !== lastPizza.current) {
      lastPizza.current = store.pizza;
      onPizza(store.pizza);
    }
  });
  return null;
}

/* ── scene ──────────────────────────────────────────────────────── */

function World({
  store,
  onActive,
  onPizza,
  quality,
}: {
  store: Store;
  onActive: (i: number) => void;
  onPizza: (near: boolean) => void;
  quality: "high" | "low";
}) {
  const light = useRef<THREE.DirectionalLight>(null);
  const aberration = useMemo(() => new THREE.Vector2(0.0004, 0.00035), []);
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new THREE.Fog(new THREE.Color(MOOD.fog), MOOD.fogNear, MOOD.fogFar);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  return (
    <>
      {quality === "high" && <SoftShadows size={16} samples={12} focus={0.55} />}
      <SkyDome />
      <Clouds />
      {!MOOD.night && <Birds />}
      <DistantIsles />

      <directionalLight
        ref={light}
        castShadow
        intensity={MOOD.keyIntensity}
        color={MOOD.keyColor}
        shadow-mapSize={quality === "high" ? [4096, 4096] : [2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0004}
      />
      <ambientLight intensity={MOOD.ambIntensity} color={MOOD.ambColor} />
      <hemisphereLight intensity={MOOD.hemiIntensity} color={MOOD.hemiSky} groundColor={MOOD.hemiGround} />
      {/* cool rim light opposite the sun carves the silhouettes out */}
      <directionalLight
        intensity={MOOD.night ? 0.35 : 0.5}
        color={MOOD.night ? "#4E6FA8" : "#BFD8F2"}
        position={[26, 14, 30]}
      />
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={MOOD.envA} color={MOOD.envACol} position={[8, 6, 4]} scale={[10, 6, 1]} />
        <Lightformer intensity={MOOD.envB} color={MOOD.envBCol} position={[-9, 4, -4]} scale={[8, 5, 1]} />
        <Lightformer intensity={MOOD.envB * 0.6} color={MOOD.skyTop} position={[0, 10, 0]} scale={[14, 14, 1]} rotation={[Math.PI / 2, 0, 0]} />
      </Environment>

      <CameraRig store={store} light={light} />
      <Bridge store={store} onActive={onActive} onPizza={onPizza} />

      <Ocean />
      <Terrain />
      <IslandBase />
      <Grass dense={quality === "high"} />
      <Flowers />
      <Trees />
      <Rocks />
      {MILESTONES.map((m, i) => (
        <Station key={m.title} i={i} m={m} store={store} />
      ))}
      <Lighthouse />
      <PizzaShack />
      <Player store={store} />
      <Dog store={store} />

      {MOOD.rainy && <Rain store={store} count={quality === "high" ? 750 : 320} />}
      {MOOD.night && !MOOD.rainy && (
        <Sparkles count={90} scale={[55, 5, 55]} position={[0, 2.5, 0]} size={2.8} speed={0.35} color="#FFD98A" opacity={0.85} />
      )}

      {quality === "high" ? (
        <EffectComposer multisampling={4}>
          <Bloom intensity={0.55} luminanceThreshold={0.78} luminanceSmoothing={0.25} mipmapBlur />
          <ChromaticAberration offset={aberration} radialModulation modulationOffset={0.42} />
          <HueSaturation saturation={0.14} />
          <BrightnessContrast brightness={0.015} contrast={0.09} />
          <Noise opacity={0.025} />
          <Vignette eskil={false} offset={0.22} darkness={0.5} />
        </EffectComposer>
      ) : (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.5} luminanceThreshold={0.8} luminanceSmoothing={0.2} mipmapBlur />
          <Vignette eskil={false} offset={0.22} darkness={0.5} />
        </EffectComposer>
      )}
    </>
  );
}

/* ── ambient wind + waves (procedural) ──────────────────────────── */

function useWind(enabled: boolean, started: boolean) {
  const nodes = useRef<{ ctx: AudioContext; gain: GainNode } | null>(null);
  useEffect(() => {
    if (!started) return;
    if (!nodes.current) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctor();
      const len = ctx.sampleRate * 4;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      let l = 0;
      for (let i = 0; i < len; i++) {
        l = l * 0.986 + (Math.random() * 2 - 1) * 0.014;
        const swell = 0.6 + 0.4 * Math.sin((i / ctx.sampleRate) * 0.9 * Math.PI);
        d[i] = l * 6 * swell;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 620;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      src.connect(filter).connect(gain).connect(ctx.destination);
      src.start();
      // rain hiss layer: same noise, highpassed
      const hiss = ctx.createBufferSource();
      hiss.buffer = buf;
      hiss.loop = true;
      hiss.playbackRate.value = 1.7;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 1800;
      const hissGain = ctx.createGain();
      hissGain.gain.value = MOOD.rainy ? 0.35 : 0.06;
      hiss.connect(hp).connect(hissGain).connect(gain);
      hiss.start();
      nodes.current = { ctx, gain };
    }
    const { ctx, gain } = nodes.current;
    void ctx.resume();
    gain.gain.linearRampToValueAtTime(enabled ? (MOOD.rainy ? 0.085 : 0.035) : 0, ctx.currentTime + 1.2);
  }, [enabled, started]);
}

/* ── the experience ─────────────────────────────────────────────── */

export default function JourneyWorld() {
  const store = useRef<Store>({
    phase: "load",
    playT: 0,
    px: PLAYER_START.x,
    pz: PLAYER_START.z,
    heading: START_HEADING,
    speed: 0,
    active: -1,
    cineStart: 0,
    pizza: false,
  }).current;

  const { progress, active: loading } = useProgress();
  const [minWait, setMinWait] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMinWait(true), 1600);
    return () => clearTimeout(t);
  }, []);
  const ready = minWait && !loading;
  const readyRef = useRef(false);
  readyRef.current = ready;
  const shownProgress = ready ? 100 : Math.max(progress, minWait ? 88 : 30);

  const [phase, setPhase] = useState<"load" | "cine" | "play">("load");
  const [active, setActive] = useState(-1);
  const [sound, setSound] = useState(true);
  const [quality, setQuality] = useState<"high" | "low">("high");
  const seenRef = useRef(new Set<number>());
  const [seenCount, setSeenCount] = useState(0);
  const soundRef = useRef(sound);
  soundRef.current = sound;

  useWind(sound && phase !== "load", phase !== "load");

  const begin = (next: "cine" | "play") => {
    unlockAudio();
    store.phase = next;
    if (next === "cine") store.cineStart = performance.now() / 1000;
    setPhase(next);
  };

  /* keyboard: movement + skip */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (["ArrowUp", "w"].includes(e.key)) KEYS.f = true;
      if (["ArrowDown", "s"].includes(e.key)) KEYS.b = true;
      if (["ArrowLeft", "a"].includes(e.key)) KEYS.l = true;
      if (["ArrowRight", "d"].includes(e.key)) KEYS.r = true;
      if (e.key === "Shift") KEYS.boost = true;
      if (e.key === "Enter" && store.phase === "load" && readyRef.current) begin("cine");
      else if (e.key === "Enter" && store.phase === "cine") begin("play");
      unlockAudio();
    };
    const up = (e: KeyboardEvent) => {
      if (["ArrowUp", "w"].includes(e.key)) KEYS.f = false;
      if (["ArrowDown", "s"].includes(e.key)) KEYS.b = false;
      if (["ArrowLeft", "a"].includes(e.key)) KEYS.l = false;
      if (["ArrowRight", "d"].includes(e.key)) KEYS.r = false;
      if (e.key === "Shift") KEYS.boost = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* auto-end the cinematic */
  useEffect(() => {
    if (phase !== "cine") return;
    const t = setTimeout(() => begin("play"), 14000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const onActive = (i: number) => {
    setActive(i);
    if (i >= 0 && !seenRef.current.has(i)) {
      seenRef.current.add(i);
      setSeenCount(seenRef.current.size);
      if (soundRef.current) sfxReact();
    }
  };

  const [pizza, setPizza] = useState(false);
  const pizzaFoundRef = useRef(false);
  const onPizza = (near: boolean) => {
    setPizza(near);
    if (near && !pizzaFoundRef.current) {
      pizzaFoundRef.current = true;
      if (soundRef.current) sfxGreet();
    }
  };

  const hold = (k: keyof typeof KEYS, on: boolean) => () => {
    KEYS[k] = on;
    if (on) unlockAudio();
  };

  const m = active >= 0 ? MILESTONES[active] : null;

  return (
    <div className="fixed inset-0 select-none" style={{ backgroundColor: MOOD.bg }}>
      <Canvas
        shadows
        dpr={quality === "high" ? [1, 2] : 1}
        camera={{ position: [30, 16, 55], fov: 40, near: 0.1, far: 900 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = MOOD.night ? 1.02 : 1.12;
        }}
      >
        <PerformanceMonitor onDecline={() => setQuality("low")}>
          <World store={store} onActive={onActive} onPizza={onPizza} quality={quality} />
        </PerformanceMonitor>
      </Canvas>

      {/* ══ loader ══ */}
      <AnimatePresence>
        {phase === "load" && (
          <motion.div
            exit={{ opacity: 0, transition: { duration: 1.4, ease: "easeInOut" } }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#14110E]"
          >
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1 }} className="font-hand text-2xl text-accent">
              an island, not a webpage
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1 }} className="mt-2 font-display text-6xl font-bold tracking-tight text-cream sm:text-7xl">
              The Journey
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-cream/50">
              bytejay — a playable island
            </motion.p>
            <div className="mt-10 h-px w-56 overflow-hidden bg-cream/15">
              <div className="h-full bg-accent transition-[width] duration-700" style={{ width: `${shownProgress}%` }} />
            </div>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-cream/40">
              {!ready ? `raising the island · ${Math.round(shownProgress)}%` : "island ready"}
            </p>
            {ready && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                onClick={() => begin("cine")}
                className="mt-8 rounded-full bg-accent px-7 py-2.5 font-medium text-white transition-colors hover:bg-cream hover:text-ink"
              >
                travel ⏎
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ cinematic letterbox ══ */}
      <AnimatePresence>
        {phase === "cine" && (
          <>
            <motion.div initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }} transition={{ duration: 1.1, ease: [0.21, 0.47, 0.32, 0.98] }} className="absolute inset-x-0 top-0 z-40 h-[12vh] bg-[#0C0A08]" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 1.1, ease: [0.21, 0.47, 0.32, 0.98] }} className="absolute inset-x-0 bottom-0 z-40 flex h-[12vh] items-center justify-center bg-[#0C0A08]">
              <button
                type="button"
                onClick={() => begin("play")}
                className="pointer-events-auto rounded-full border border-cream/30 px-5 py-1.5 font-medium text-cream/90 transition-colors hover:bg-cream hover:text-ink"
              >
                Skip ⏎
              </button>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 1, duration: 1.2 }} className="pointer-events-none absolute left-1/2 top-[16vh] z-40 -translate-x-1/2 text-center">
              <p className={`font-hand text-2xl ${UI_SUB}`}>
                {MOOD.rainy ? "a rainy" : "a clear"} {MOOD.night ? "night" : "day"} in the sea of ideas…
              </p>
              <p className={`mt-1 font-display text-3xl font-bold tracking-tight ${UI_TITLE}`}>The Isle of Jay</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══ HUD ══ */}
      {phase === "play" && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-between p-5">
            <Link
              href="/"
              className={`pointer-events-auto flex h-9 items-center gap-2 rounded-full border px-3.5 font-mono text-[10px] uppercase tracking-[0.2em] backdrop-blur transition-colors ${UI_CHIP}`}
            >
              ← bytejay
            </Link>
            <span className={`hidden rounded-full border px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.22em] backdrop-blur sm:block ${UI_CHIP}`}>
              {MOOD.rainy ? "rainy" : "clear"} {MOOD.night ? "night" : "day"}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  unlockAudio();
                  setSound((s) => !s);
                }}
                className={`pointer-events-auto rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] backdrop-blur transition-colors ${
                  sound ? "border-accent/50 bg-accent/15 text-accent" : UI_CHIP
                }`}
              >
                {sound ? "sound on" : "sound off"}
              </button>
              <span className={`rounded-full border px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.22em] backdrop-blur ${UI_CHIP}`}>
                memories {seenCount}/{MILESTONES.length}
              </span>
            </div>
          </div>

          {/* controls hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: seenCount === 0 ? 1 : 0 }}
            transition={{ delay: 1.6, duration: 1 }}
            className={`pointer-events-none absolute bottom-8 left-1/2 z-40 hidden -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] sm:block ${UI_HINT}`}
          >
            wasd / arrows to walk · shift to run · follow the lights
          </motion.p>

          {/* completion */}
          <AnimatePresence>
            {seenCount === MILESTONES.length && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="pointer-events-none absolute bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-accent backdrop-blur"
              >
                every memory found — to be continued… ✦
              </motion.div>
            )}
          </AnimatePresence>

          {/* pizza easter egg */}
          <AnimatePresence>
            {pizza && (
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.9, rotate: -2 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, y: 12, scale: 0.94 }}
                transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="pointer-events-none absolute bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-2xl border border-accent/40 bg-surface/95 px-6 py-4 text-center shadow-[0_18px_44px_rgba(28,25,23,0.2)] backdrop-blur-md"
              >
                <p className="font-display text-xl font-bold text-ink">🍕 JAY loves pizza!</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.25em] text-accent">
                  secret found · the hidden slice shack
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* milestone lower-third */}
          <AnimatePresence mode="wait">
            {m && (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, x: -28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="absolute bottom-12 left-6 z-40 max-w-sm rounded-2xl border border-line bg-surface/90 p-5 shadow-[0_18px_44px_rgba(28,25,23,0.18)] backdrop-blur-md sm:left-10"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
                  {m.year} · chapter {ERAS[m.era].numeral} — {ERAS[m.era].name}
                </p>
                <h2 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{m.title}</h2>
                <p className="mt-2 border-l-2 border-accent/60 pl-3 text-sm leading-relaxed text-ink/75">{m.text}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* touch d-pad */}
          <div className="absolute bottom-6 right-5 z-40 grid grid-cols-3 gap-1.5 sm:hidden">
            <span />
            <button type="button" aria-label="forward" onPointerDown={hold("f", true)} onPointerUp={hold("f", false)} onPointerLeave={hold("f", false)} className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 bg-white/70 text-ink shadow-md active:bg-accent active:text-white">↑</button>
            <span />
            <button type="button" aria-label="left" onPointerDown={hold("l", true)} onPointerUp={hold("l", false)} onPointerLeave={hold("l", false)} className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 bg-white/70 text-ink shadow-md active:bg-accent active:text-white">←</button>
            <button type="button" aria-label="back" onPointerDown={hold("b", true)} onPointerUp={hold("b", false)} onPointerLeave={hold("b", false)} className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 bg-white/70 text-ink shadow-md active:bg-accent active:text-white">↓</button>
            <button type="button" aria-label="right" onPointerDown={hold("r", true)} onPointerUp={hold("r", false)} onPointerLeave={hold("r", false)} className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 bg-white/70 text-ink shadow-md active:bg-accent active:text-white">→</button>
          </div>
        </>
      )}
    </div>
  );
}
