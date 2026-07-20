"use client";

/*
 * The ByteJay Gallery — spiral edition.
 * A recreation of pacomepertant.com's WebGL works gallery:
 * cylindrical spiral of image planes, hover darken+zoom, spiral/list view
 * switch, cursor-trail previews. The artworks are the gallery's original six
 * "paintings" about the artist. The section pins while page scroll spins the
 * spiral through the whole collection, then releases into the next section.
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
const POP = "#21ffc0";
const PAPER = "#FDFBF5";

/* ── the collection ─────────────────────────────────────────────── */

type Painting = {
  title: string;
  medium: string;
  body: string;
  svg: string;
};

const PAINTINGS: Painting[] = [
  {
    title: "Portrait of the Builder",
    medium: "oil on ambition, 2007 —",
    body: "Jay, 19. First PC at five, first line of code at fifteen, professional asker of “what if?” ever since. Painted mid-refactor, as always.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90">
      <circle cx="60" cy="34" r="20" fill="none" stroke="${INK}" stroke-width="2.5"/>
      <circle cx="53" cy="31" r="2.2" fill="${INK}"/>
      <circle cx="67" cy="31" r="2.2" fill="${INK}"/>
      <path d="M52 41 Q60 47 68 41" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M42 28 Q47 12 60 14 Q76 10 78 26" fill="none" stroke="${ACCENT}" stroke-width="3" stroke-linecap="round"/>
      <path d="M38 78 Q45 58 60 58 Q75 58 82 78" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
      <text x="92" y="82" font-size="13" font-weight="700" fill="${ACCENT}">19</text>
    </svg>`,
  },
  {
    title: "Composition in Code",
    medium: "curly braces on canvas",
    body: "Other people relax after class. The artist opens a terminal and calls it relaxing. Worryingly, he means it.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90">
      <text x="12" y="62" font-size="46" font-weight="700" fill="${INK}" font-family="monospace">{</text>
      <text x="86" y="62" font-size="46" font-weight="700" fill="${INK}" font-family="monospace">}</text>
      <rect x="42" y="30" width="34" height="5" rx="2.5" fill="${INK}" opacity="0.25"/>
      <rect x="42" y="42" width="26" height="5" rx="2.5" fill="${ACCENT}"/>
      <rect x="42" y="54" width="30" height="5" rx="2.5" fill="${INK}" opacity="0.25"/>
      <rect x="74" y="52" width="7" height="9" fill="${ACCENT}"/>
    </svg>`,
  },
  {
    title: "Boy with Guitar",
    medium: "six strings & one voice",
    body: "Plays properly, sings properly too — the rare developer whose live demo works. Takes requests between compile times.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90">
      <ellipse cx="42" cy="58" rx="21" ry="17" fill="none" stroke="${INK}" stroke-width="2.5"/>
      <ellipse cx="56" cy="44" rx="13" ry="11" fill="none" stroke="${INK}" stroke-width="2.5"/>
      <circle cx="45" cy="55" r="5.5" fill="${ACCENT}" opacity="0.85"/>
      <line x1="63" y1="37" x2="98" y2="14" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      <line x1="48" y1="52" x2="96" y2="18" stroke="${INK}" stroke-width="0.8" opacity="0.6"/>
      <line x1="50" y1="56" x2="99" y2="21" stroke="${INK}" stroke-width="0.8" opacity="0.6"/>
      <text x="88" y="66" font-size="20" fill="${ACCENT}">♪</text>
      <text x="102" y="48" font-size="14" fill="${INK}" opacity="0.5">♪</text>
    </svg>`,
  },
  {
    title: "The Curiosity Room",
    medium: "found objects, ongoing",
    body: "Chess games he usually wins, thick books he actually finishes, rabbit holes of every diameter. The artist refuses to specialise in being bored.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90">
      <text x="14" y="64" font-size="44" fill="${INK}">♞</text>
      <circle cx="68" cy="34" r="12" fill="none" stroke="${ACCENT}" stroke-width="2"/>
      <ellipse cx="68" cy="34" rx="19" ry="6" fill="none" stroke="${ACCENT}" stroke-width="1.5" transform="rotate(-18 68 34)"/>
      <rect x="86" y="44" width="24" height="30" rx="2" fill="none" stroke="${INK}" stroke-width="2.5"/>
      <line x1="90" y1="44" x2="90" y2="74" stroke="${INK}" stroke-width="2"/>
    </svg>`,
  },
  {
    title: "Self-Portrait at 3 A.M.",
    medium: "caffeine on deadline",
    body: "The bug was declared “literally impossible” at 2:40. It was a missing semicolon. The artist has learned nothing and would do it again.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90">
      <rect x="22" y="38" width="30" height="32" rx="5" fill="none" stroke="${INK}" stroke-width="2.5"/>
      <path d="M52 46 q12 2 0 16" fill="none" stroke="${INK}" stroke-width="2.5"/>
      <path d="M30 30 q3 -7 0 -12 M40 30 q3 -7 0 -12" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
      <text x="70" y="72" font-size="46" font-weight="700" fill="${ACCENT}" font-family="monospace">;</text>
      <path d="M95 28 l14 -8 M95 28 l14 8 M95 28 l-6 0" stroke="${INK}" stroke-width="1.5" opacity="0.4" fill="none"/>
      <circle cx="95" cy="28" r="5" fill="none" stroke="${INK}" stroke-width="2" opacity="0.6"/>
    </svg>`,
  },
  {
    title: "How the Artist Runs",
    medium: "temperament, in light tones",
    body: "Runs on curiosity, bad puns and big ideas. Laughs at his own jokes — someone has to. Believes ambitious beats safe, every single time.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90">
      <circle cx="46" cy="40" r="17" fill="none" stroke="${INK}" stroke-width="2.5"/>
      <path d="M40 44 Q46 52 52 44" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="41" cy="36" r="2" fill="${INK}"/>
      <circle cx="51" cy="36" r="2" fill="${INK}"/>
      <path d="M46 23 v-8 M46 15 q0 -6 7 -6 q6 0 6 6 q0 5 -6 7" fill="none" stroke="${ACCENT}" stroke-width="2.5" stroke-linecap="round"/>
      <text x="72" y="54" font-size="22" font-weight="700" fill="${ACCENT}" font-family="cursive" font-style="italic">ha!</text>
      <path d="M72 62 l8 -4 l-3 8 l8 -4" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
    </svg>`,
  },
];

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
    color = mix(color, vec4(0.0, 0.0, 0.0, 1.0), uColorStrength);
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

  gl_FragColor = vec4(color.rgb, alpha);
}
`;

/* ── spiral constants (ported verbatim) ─────────────────────────── */

const PLANE_W = 1.7;
const PLANE_H = 1;
const VERTICAL_GAP = 0.5;
const ANGLE_GAP = 0.85;
const BASE_RADIUS = 2;
const COUNT = PAINTINGS.length * 2; // list duplicated so the loop never shows a seam
const CENTER_INDEX = Math.floor(COUNT / 2);
const TEX_W = 1088;
const TEX_H = 640;
// pinned scroll: how far the page must scroll (in vh) to walk the whole collection
const SCROLL_VH_PER_CARD = 55;
const PIN_EXTRA_VH = PAINTINGS.length * SCROLL_VH_PER_CARD;

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
  interactive: boolean; // false while list mode / plaque open
  inView: boolean;
  sfx: boolean;
  hovered: number | null;
  planes: PlaneState[];
};

function createStore(): GalleryStore {
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
    planes: Array.from({ length: COUNT }, () => ({
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

/* ── textures: paint each SVG artwork onto framed paper ────────── */

function usePaintingTextures() {
  const [assets, setAssets] = useState<{ textures: THREE.Texture[]; images: string[] } | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      PAINTINGS.map(
        (painting) =>
          new Promise<{ texture: THREE.Texture; url: string }>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = TEX_W;
              canvas.height = TEX_H;
              const ctx = canvas.getContext("2d");
              if (!ctx) return reject(new Error("2d context unavailable"));

              ctx.fillStyle = PAPER;
              ctx.fillRect(0, 0, TEX_W, TEX_H);
              // faint plate edge
              ctx.strokeStyle = "rgba(28,25,23,0.10)";
              ctx.lineWidth = 2;
              ctx.strokeRect(14, 14, TEX_W - 28, TEX_H - 28);

              const artH = TEX_H * 0.78;
              const artW = artH * (120 / 90);
              ctx.drawImage(img, (TEX_W - artW) / 2, (TEX_H - artH) / 2, artW, artH);

              const texture = new THREE.CanvasTexture(canvas);
              texture.colorSpace = THREE.SRGBColorSpace;
              texture.anisotropy = 4;
              resolve({ texture, url: canvas.toDataURL("image/png") });
            };
            img.onerror = () => reject(new Error(`could not rasterise "${painting.title}"`));
            img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(painting.svg)}`;
          })
      )
    )
      .then((results) => {
        if (cancelled) return;
        setAssets({
          textures: results.map((r) => r.texture),
          images: results.map((r) => r.url),
        });
      })
      .catch(() => {
        /* textures failed — the section falls back to the list view content */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return assets;
}

/* ── the WebGL spiral ───────────────────────────────────────────── */

function SpiralScene({
  store,
  textures,
  wrapperRef,
  onHover,
  onOpen,
  onFront,
}: {
  store: GalleryStore;
  textures: THREE.Texture[];
  wrapperRef: React.RefObject<HTMLDivElement>;
  onHover: (index: number | null) => void;
  onOpen: (index: number) => void;
  onFront: (index: number) => void;
}) {
  const { camera, gl, size } = useThree();
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1, 8, 8), []);

  const materials = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => {
        const tex = textures[i % PAINTINGS.length];
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
    [textures]
  );

  useEffect(
    () => () => {
      geometry.dispose();
      materials.forEach((m) => m.dispose());
    },
    [geometry, materials]
  );

  // responsive fov, same breakpoint as the reference
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = size.width < 900 ? 45 : 35;
    cam.position.set(0, 0, 8);
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
        onOpen(store.hovered % PAINTINGS.length);
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
        onOpen(idx % PAINTINGS.length);
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
  }, [gl, camera, raycaster, store, onOpen]);

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

    // page scroll drives the tour: pinned progress 0→1 walks every painting once
    const wrapper = wrapperRef.current;
    if (wrapper) {
      const rect = wrapper.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      if (range > 0) {
        const progress = clamp(-rect.top / range, 0, 1);
        store.scrollDriven = progress * PAINTINGS.length;
      }
    }

    const total = store.scrollOffset + store.scrollDriven;
    store.speed = lerp(store.speed, clamp(total - store.lastTotal, -2, 2), 0.12);
    store.lastTotal = total;

    const front = ((Math.round(total) % PAINTINGS.length) + PAINTINGS.length) % PAINTINGS.length;
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
      onHover(hovered === null ? null : hovered % PAINTINGS.length);
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
      n = ((n % COUNT) + COUNT) % COUNT;
      const b = n - CENTER_INDEX;
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

export default function SpiralGallery() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const storeRef = useRef<GalleryStore>();
  if (!storeRef.current) storeRef.current = createStore();
  const store = storeRef.current;

  const assets = usePaintingTextures();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"spiral" | "list">("spiral");
  const [front, setFront] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [listHovered, setListHovered] = useState<number | null>(null);
  const [plaque, setPlaque] = useState<number | null>(null);
  const [sfx, setSfx] = useState(true);
  const revealedRef = useRef(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    store.sfx = sfx;
  }, [sfx, store]);
  useEffect(() => {
    store.interactive = mode === "spiral" && plaque === null;
  }, [mode, plaque, store]);

  // reveal once the section scrolls into view; pause updates outside it
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !assets) return;
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

  useEffect(() => {
    if (plaque === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePlaque();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plaque]);

  const handleFront = (index: number) => {
    setFront(index);
    if (store.sfx && store.inView) blip(980, 0.04, 0.03);
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

  const openPlaque = (index: number) => {
    if (sfx) blip(340, 0.14, 0.06, 2.2);
    setPlaque(index);
    setHovered(null);
    hidePlanes(store);
  };

  const closePlaque = () => {
    setPlaque(null);
    if (mode === "spiral") setTimeout(() => revealPlanes(store), 200);
  };

  return (
    <section id="about" className="relative">
      <style>{`@keyframes sg-pop { from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: scale(1); } }`}</style>

      {/* heading rides in the normal page flow, like every other section */}
      <div className="mx-auto max-w-6xl px-6 pt-28">
        <SectionHeading
          eyebrow="about me — the collection"
          title="The ByteJay Gallery"
          blurb="Six paintings about the artist. Keep scrolling — the spiral turns past every frame, then the page carries on."
        />
      </div>

      {/* tall wrapper pins the spiral while scroll walks the collection */}
      <div
        ref={wrapperRef}
        className="relative"
        style={{ height: `calc(100svh + ${PIN_EXTRA_VH}vh)` }}
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
            className="!absolute inset-0"
            dpr={[1, 2]}
            camera={{ fov: 35, position: [0, 0, 8], near: 0.1, far: 100 }}
            gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
          >
            <SpiralScene
              store={store}
              textures={assets.textures}
              wrapperRef={wrapperRef}
              onHover={setHovered}
              onOpen={openPlaque}
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
              className="absolute inset-0 z-10 flex flex-col items-center justify-center overflow-hidden text-center"
            >
              <CursorTrail hovered={listHovered} images={assets.images} containerRef={sectionRef} />
              {PAINTINGS.map((painting, i) => (
                <motion.button
                  key={painting.title}
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
                  onClick={() => openPlaque(i)}
                  className="relative z-10 py-2 font-display text-3xl font-medium lowercase tracking-tight sm:text-5xl"
                  style={{ color: WHITE }}
                >
                  {painting.title}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* hovered painting — bottom-centre infos, like the reference */}
        <AnimatePresence>
          {mode === "spiral" && hovered !== null && plaque === null && assets && (
            <motion.div
              key={`hover-${hovered}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="pointer-events-none absolute inset-x-0 bottom-14 z-20 flex justify-center"
            >
              <div
                className="flex items-center gap-3 rounded-full px-4 py-2 backdrop-blur"
                style={{ backgroundColor: "#0a0a0a99", border: `1px solid ${WHITE}1a` }}
              >
                <img
                  src={assets.images[hovered]}
                  alt=""
                  className="h-8 w-12 rounded object-cover"
                />
                <h4 className="font-display text-sm font-medium lowercase tracking-tight">
                  {PAINTINGS[hovered].title}
                </h4>
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
                  / {String(PAINTINGS.length).padStart(2, "0")}
                </span>
                — scroll to tour · drag to spin · click a frame
              </>
            ) : (
              "click a title"
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
              href="#contact"
              className="font-mono text-[10px] lowercase tracking-[0.2em] underline decoration-1 underline-offset-4 transition-colors hover:text-white"
              style={{ color: `${WHITE}8c` }}
            >
              say hi ↗
            </a>
          </div>
        </div>

        {/* plaque — opens in place of the reference's project pages */}
        <AnimatePresence>
          {plaque !== null && assets && (
            <motion.div
              key="plaque"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-30 flex items-center justify-center px-6"
              style={{ backgroundColor: "#0a0a0ae6" }}
              onClick={closePlaque}
            >
              <motion.div
                initial={{ y: 26, opacity: 0, scale: 0.97 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 18, opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="w-full max-w-md rounded-2xl p-5 sm:p-6"
                style={{ backgroundColor: "#141414", border: `1px solid ${WHITE}1a` }}
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={assets.images[plaque]}
                  alt={PAINTINGS[plaque].title}
                  className="aspect-[17/10] w-full rounded-lg object-cover"
                />
                <p
                  className="mt-4 font-mono text-[9px] uppercase tracking-[0.25em]"
                  style={{ color: `${WHITE}59` }}
                >
                  {PAINTINGS[plaque].medium}
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold lowercase tracking-tight">
                  {PAINTINGS[plaque].title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: `${WHITE}b3` }}>
                  {PAINTINGS[plaque].body}
                </p>
                <button
                  type="button"
                  onClick={closePlaque}
                  className="mt-5 font-mono text-[10px] lowercase tracking-[0.25em] underline decoration-1 underline-offset-4"
                  style={{ color: POP }}
                >
                  close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
