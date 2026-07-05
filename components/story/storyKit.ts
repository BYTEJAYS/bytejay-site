/**
 * storyKit — the shared picture-book vocabulary used by SPARK (/story)
 * and the Project Book (/projects): the near-black cat, the warm spark,
 * canvas glow textures, soft lights and ground shadows.
 * Fully procedural, vanilla three.js.
 */

import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export const SERIF = `"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`;
export const CAT_BLACK = 0x14101c;
export const SPARK_WARM = 0xfff3cf;

export function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export function radialTexture(stops: [number, string][]) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 62);
  for (const [o, col] of stops) g.addColorStop(o, col);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export const makeHalo = () =>
  radialTexture([
    [0, "rgba(255,244,210,1)"],
    [0.25, "rgba(255,238,190,0.5)"],
    [0.6, "rgba(255,232,180,0.13)"],
    [1, "rgba(255,232,180,0)"],
  ]);

export const makeSoft = () =>
  radialTexture([
    [0, "rgba(255,255,255,0.85)"],
    [0.5, "rgba(255,255,255,0.3)"],
    [1, "rgba(255,255,255,0)"],
  ]);

/* vertical-fade beam texture for light shafts */
export function beamTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "rgba(255,250,220,0.55)");
  g.addColorStop(0.6, "rgba(255,250,220,0.12)");
  g.addColorStop(1, "rgba(255,250,220,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 256);
  // soften the sides
  const side = ctx.createLinearGradient(0, 0, 64, 0);
  side.addColorStop(0, "rgba(0,0,0,1)");
  side.addColorStop(0.25, "rgba(0,0,0,0)");
  side.addColorStop(0.75, "rgba(0,0,0,0)");
  side.addColorStop(1, "rgba(0,0,0,1)");
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = side;
  ctx.fillRect(0, 0, 64, 256);
  return new THREE.CanvasTexture(c);
}

export function disposeDeep(root: THREE.Object3D) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
    else if (m) m.dispose();
  });
}

/* the character, matched to the original: a flat matte-black silhouette —
   big head on a tiny bean body, sharp slightly-uneven ears, and two
   enormous oval eyes. No shine, no whiskers; the shape does the work.
   userData: eyes (blink via scale.y), tail (sway via rotation), plus
   head and body for the richer idle in catIdle(). */
export function makeCat(s = 1) {
  const g = new THREE.Group();
  // near-unlit matte black so it reads as a silhouette, not a plastic toy
  const skin = new THREE.MeshStandardMaterial({ color: 0x0e0a14, roughness: 0.96 });
  skin.envMapIntensity = 0.22;
  const white = new THREE.MeshBasicMaterial({ color: 0xf9f6ee });
  const dark = new THREE.MeshBasicMaterial({ color: 0x060409 });

  // the body is a little bean, clearly smaller than the head
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.17, 28, 22), skin);
  body.position.y = 0.2;
  body.scale.set(0.78, 1.08, 0.72);
  body.userData.sy = 1.08;

  // tiny arms resting at the sides, and little feet peeking out
  const armGeo = new THREE.CapsuleGeometry(0.028, 0.08, 6, 10);
  const armL = new THREE.Mesh(armGeo, skin);
  armL.position.set(-0.12, 0.17, 0.05);
  armL.rotation.z = 0.5;
  armL.rotation.x = -0.25;
  const armR = new THREE.Mesh(armGeo, skin);
  armR.position.set(0.12, 0.17, 0.05);
  armR.rotation.z = -0.5;
  armR.rotation.x = -0.25;
  const footGeo = new THREE.SphereGeometry(0.042, 14, 10);
  const footL = new THREE.Mesh(footGeo, skin);
  footL.position.set(-0.062, 0.03, 0.1);
  footL.scale.set(1, 0.7, 1.35);
  const footR = new THREE.Mesh(footGeo, skin);
  footR.position.set(0.062, 0.03, 0.1);
  footR.scale.set(1, 0.7, 1.35);

  /* everything face lives on the head group so it can tilt as one */
  const head = new THREE.Group();
  head.position.y = 0.58;
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.27, 32, 24), skin);
  skull.scale.set(1.12, 0.95, 0.9);
  head.add(skull);
  // sharp ears, a touch asymmetric like the original's
  const earGeo = new THREE.ConeGeometry(0.1, 0.3, 5);
  const earL = new THREE.Mesh(earGeo, skin);
  earL.position.set(-0.18, 0.23, -0.01);
  earL.rotation.z = 0.42;
  const earR = new THREE.Mesh(earGeo, skin);
  earR.scale.setScalar(0.88);
  earR.position.set(0.19, 0.24, -0.01);
  earR.rotation.z = -0.3;
  head.add(earL, earR);
  /* the enormous oval eyes ARE the character */
  const eyes = new THREE.Group();
  for (const ex of [-0.105, 0.105]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.105, 24, 18), white);
    eye.position.set(ex, -0.01, 0.185);
    eye.scale.set(0.76, 1.18, 0.42);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.064, 18, 14), dark);
    pupil.position.set(ex * 0.97, -0.018, 0.238);
    pupil.scale.set(0.78, 1.1, 0.5);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), white);
    glint.position.set(ex * 0.97 + 0.024, 0.03, 0.28);
    eyes.add(eye, pupil, glint);
  }
  head.add(eyes);

  /* tail: a thin curl, pivoted at its base so old sway code still works */
  const tail = new THREE.Group();
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.13, 0),
    new THREE.Vector3(0.02, 0.0, -0.05),
    new THREE.Vector3(0, 0.13, -0.02),
    new THREE.Vector3(-0.035, 0.21, 0.05),
  ]);
  const tailTube = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 24, 0.028, 10), skin);
  const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 10), skin);
  tailTip.position.set(-0.035, 0.21, 0.05);
  tail.add(tailTube, tailTip);
  tail.position.set(0.04, 0.15, -0.18);
  tail.rotation.x = 1.05;

  g.add(body, armL, armR, footL, footR, head, tail);
  g.scale.setScalar(s);
  g.userData.eyes = eyes;
  g.userData.tail = tail;
  g.userData.head = head;
  g.userData.body = body;
  g.userData.arms = [armL, armR];
  return g;
}

/* one call per frame makes the cat feel alive: blink, breath,
   head sway, tail curl. seed staggers cats across scenes. */
export function catIdle(cat: THREE.Group, t: number, seed = 0) {
  (cat.userData.eyes as THREE.Group).scale.y = blink(t, seed);
  const tail = cat.userData.tail as THREE.Group;
  tail.rotation.x = 1.05 + Math.sin(t * 2.3 + seed) * 0.16;
  tail.rotation.z = Math.sin(t * 1.6 + seed * 1.3) * 0.12;
  const head = cat.userData.head as THREE.Group;
  head.rotation.z = Math.sin(t * 0.6 + seed) * 0.05;
  head.rotation.x = Math.sin(t * 0.45 + seed * 1.7) * 0.05;
  head.rotation.y = Math.sin(t * 0.35 + seed * 2.1) * 0.07;
  const body = cat.userData.body as THREE.Mesh;
  body.scale.y = (body.userData.sy ?? 1.08) + Math.sin(t * 1.8 + seed) * 0.018;
  const arms = cat.userData.arms as THREE.Mesh[] | undefined;
  if (arms) {
    arms[0].rotation.z = 0.5 + Math.sin(t * 1.4 + seed) * 0.06;
    arms[1].rotation.z = -0.5 - Math.sin(t * 1.4 + seed + 1.2) * 0.06;
  }
}

/* faint concentric rings on the ground — the watercolour ripple the
   original paints under every scene. Returns the group for slow spins. */
export function addRipples(scene: THREE.Scene, color: number, opacity = 0.12) {
  const g = new THREE.Group();
  for (const [r, o] of [
    [3.6, 1],
    [5.4, 0.66],
    [7.4, 0.4],
  ] as const) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(r, r + 0.16, 80),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: opacity * o,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.015;
    g.add(ring);
  }
  scene.add(g);
  return g;
}

/* a broad glow low on the horizon — gives each world a light source
   and depth instead of a flat gradient backdrop */
export function addHorizonGlow(
  scene: THREE.Scene,
  halo: THREE.Texture,
  color: number,
  pos: [number, number, number],
  scale = 16,
  opacity = 0.55
) {
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: halo,
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    })
  );
  glow.position.set(...pos);
  glow.scale.set(scale, scale * 0.62, 1);
  scene.add(glow);
  return glow;
}

/* studio reflections — makes leather, gold and glass read as material
   instead of flat colour. Cheap: one PMREM bake per renderer. */
export function applyEnvironment(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  intensity = 0.5
) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = intensity;
  pmrem.dispose();
  return env;
}

/* the spark: warm core + layered additive halos + real light */
export function makeSpark(halo: THREE.Texture, s = 1, lit = true) {
  const g = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 16, 12),
    new THREE.MeshBasicMaterial({ color: SPARK_WARM })
  );
  const tight = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: halo,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.95,
    })
  );
  tight.scale.setScalar(0.85);
  const wide = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: halo,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.4,
    })
  );
  wide.scale.setScalar(2.6);
  g.add(core, tight, wide);
  if (lit) {
    const light = new THREE.PointLight(0xffe2a8, 3.2, 7, 1.8);
    g.add(light);
  }
  g.scale.setScalar(s);
  g.userData.glow = tight;
  g.userData.wide = wide;
  return g;
}

export const blink = (t: number, seed: number) => (Math.sin(t * 0.5 + seed) > 0.984 ? 0.1 : 1);

export type Built = { tick: (t: number, dt: number) => void };
export type Tex = { halo: THREE.Texture; soft: THREE.Texture; beam: THREE.Texture };
export type ChapterDef = {
  cam: [number, number, number];
  look: [number, number, number];
  build: (scene: THREE.Scene, tex: Tex) => Built;
};

export function addLights(
  scene: THREE.Scene,
  key = 0.9,
  amb = 0.65,
  sky = 0xffffff,
  ground = 0x555566
) {
  scene.add(new THREE.HemisphereLight(sky, ground, amb));
  const d = new THREE.DirectionalLight(0xfff4dd, key);
  d.position.set(4, 7, 5);
  scene.add(d);
}

/* soft ground-contact shadow */
export function dropShadow(soft: THREE.Texture, size: number, opacity = 0.3) {
  const m = new THREE.Mesh(
    new THREE.CircleGeometry(size, 32),
    new THREE.MeshBasicMaterial({
      map: soft,
      transparent: true,
      opacity,
      color: 0x000000,
      depthWrite: false,
    })
  );
  m.rotation.x = -Math.PI / 2;
  return m;
}

/* soft blotchy grain — bump map that makes flat leather read as leather */
function leatherTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2400; i++) {
    const v = 112 + hash(i * 2) * 48;
    ctx.fillStyle = `rgba(${v},${v},${v},0.35)`;
    ctx.beginPath();
    ctx.arc(hash(i) * 256, hash(i + 999) * 256, 1 + hash(i + 555) * 2.4, 0, 7);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/* the cover face: title, gold frames, and (optionally) the glowing
   orb pressed flat into the leather — like the original, nothing floats */
function coverArt(title: string, subtitle: string, orb: boolean) {
  const c = document.createElement("canvas");
  c.width = 640;
  c.height = 480;
  const ctx = c.getContext("2d")!;
  ctx.strokeStyle = "rgba(233,200,120,0.55)";
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 36, 560, 408);
  ctx.strokeStyle = "rgba(233,200,120,0.28)";
  ctx.lineWidth = 2;
  ctx.strokeRect(54, 50, 532, 380);
  ctx.textAlign = "center";
  ctx.fillStyle = "#f2e3c2";
  const size = title.length > 7 ? 60 : 76;
  ctx.font = `700 ${size}px ${SERIF}`;
  ctx.letterSpacing = "12px";
  ctx.shadowColor = "rgba(255,220,150,0.8)";
  ctx.shadowBlur = 20;
  ctx.fillText(title, 326, 136);
  ctx.shadowBlur = 0;
  if (orb) {
    const g = ctx.createRadialGradient(320, 272, 6, 320, 272, 118);
    g.addColorStop(0, "rgba(255,242,205,1)");
    g.addColorStop(0.17, "rgba(255,226,160,0.95)");
    g.addColorStop(0.38, "rgba(255,198,110,0.5)");
    g.addColorStop(0.7, "rgba(235,160,80,0.16)");
    g.addColorStop(1, "rgba(235,160,80,0)");
    ctx.fillStyle = g;
    ctx.fillRect(150, 102, 340, 340);
    ctx.strokeStyle = "rgba(255,228,170,0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(320, 272, 62, 57, 0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,228,170,0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(320, 272, 85, 76, -0.4, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.font = `italic 30px ${SERIF}`;
  ctx.fillStyle = "rgba(233,200,120,0.85)";
  ctx.fillText(subtitle, 320, 420);
  return new THREE.CanvasTexture(c);
}

/* the closed storybook itself — shared by the SPARK cover, the /projects
   cover and the home teaser. `title` is painted on the cover.
   { emblem: true }  → the floating spark + gold rings (SPARK's cover)
   { emblem: false } → the orb glows flat ON the cover instead.
   userData.coverHinge + userData.flutter drive the open animation. */
export function makeBook(
  halo: THREE.Texture,
  title: string,
  subtitle: string,
  { emblem: withEmblem = true }: { emblem?: boolean } = {}
) {
  const book = new THREE.Group();
  const grain = leatherTexture();
  const leather = new THREE.MeshStandardMaterial({
    color: 0x4a2a18,
    roughness: 0.6,
    bumpMap: grain,
    bumpScale: 0.65,
  });
  const leatherDark = new THREE.MeshStandardMaterial({
    color: 0x36200f,
    roughness: 0.66,
    bumpMap: grain,
    bumpScale: 0.5,
  });
  const pagesMat = new THREE.MeshStandardMaterial({ color: 0xf0e6cb, roughness: 0.9 });
  const pageLine = new THREE.MeshStandardMaterial({ color: 0xd9caa6, roughness: 0.95 });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xdcb45e,
    roughness: 0.32,
    metalness: 0.65,
  });
  const goldDark = new THREE.MeshStandardMaterial({
    color: 0xb08a3a,
    roughness: 0.38,
    metalness: 0.65,
  });

  // page block, with groove lines so the paper reads as stacked leaves
  const pages = new THREE.Group();
  const block = new THREE.Mesh(new RoundedBoxGeometry(2.0, 0.34, 1.44, 3, 0.05), pagesMat);
  pages.add(block);
  for (const gy of [-0.09, 0.02, 0.115]) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(2.005, 0.014, 1.445), pageLine);
    line.position.y = gy;
    pages.add(line);
  }
  pages.position.y = 0.05;
  book.add(pages);

  const bottom = new THREE.Mesh(new RoundedBoxGeometry(2.18, 0.1, 1.58, 3, 0.035), leather);
  bottom.position.y = -0.175;
  book.add(bottom);

  const spine = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 1.58, 18, 1, false),
    leatherDark
  );
  spine.rotation.x = Math.PI / 2;
  spine.position.set(-1.07, 0.05, 0);
  book.add(spine);

  // loose leaves that fan out when the cover opens
  const flutter: THREE.Group[] = [];
  for (let i = 0; i < 3; i++) {
    const hinge = new THREE.Group();
    hinge.position.set(-0.98, 0.225 + i * 0.006, 0);
    const sheet = new THREE.Mesh(
      new THREE.PlaneGeometry(1.94, 1.38),
      new THREE.MeshStandardMaterial({
        color: 0xf6ecd2,
        roughness: 0.95,
        side: THREE.DoubleSide,
      })
    );
    sheet.rotation.x = -Math.PI / 2;
    sheet.position.x = 0.97;
    hinge.add(sheet);
    book.add(hinge);
    flutter.push(hinge);
  }

  // top cover on a hinge at the spine, with a raised panel + ridges
  const coverHinge = new THREE.Group();
  coverHinge.position.set(-1.07, 0.29, 0);
  const top = new THREE.Mesh(new RoundedBoxGeometry(2.18, 0.1, 1.58, 3, 0.035), leather);
  top.position.x = 1.07;
  coverHinge.add(top);
  const panel = new THREE.Mesh(new RoundedBoxGeometry(1.8, 0.035, 1.24, 2, 0.02), leatherDark);
  panel.position.set(1.12, 0.058, 0);
  coverHinge.add(panel);
  for (const rx of [0.14, 0.24]) {
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.022, 1.52), leatherDark);
    ridge.position.set(rx, 0.058, 0);
    coverHinge.add(ridge);
  }
  const art = new THREE.Mesh(
    new THREE.PlaneGeometry(1.74, 1.3),
    new THREE.MeshBasicMaterial({
      map: coverArt(title, subtitle, !withEmblem),
      transparent: true,
      depthWrite: false,
    })
  );
  art.rotation.x = -Math.PI / 2;
  art.position.set(1.12, 0.082, 0);
  coverHinge.add(art);
  book.add(coverHinge);

  // chunky notched corner caps on the free edge + the strap clasp
  for (const cz of [0.62, -0.62]) {
    const cap = new THREE.Group();
    const capMain = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.56, 0.3, 2, 0.05), goldMat);
    const capNotch = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.09, 0.32), goldDark);
    capNotch.position.y = 0.09;
    cap.add(capMain, capNotch);
    cap.position.set(1.03, 0.05, cz);
    book.add(cap);
  }
  const clasp = new THREE.Group();
  const claspBody = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.6, 0.38, 2, 0.05), goldMat);
  const strap = new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.05, 0.3, 2, 0.02), goldDark);
  strap.position.set(-0.3, 0.31, 0);
  clasp.add(claspBody, strap);
  clasp.position.set(1.08, 0.05, 0.1);
  book.add(clasp);

  book.userData.coverHinge = coverHinge;
  book.userData.flutter = flutter;
  if (withEmblem) {
    // the emblem spark, orbited by two thin gold rings
    const emblem = makeSpark(halo, 1.25);
    emblem.position.set(0, 0.5, 0.18);
    book.add(emblem);
    const rings: THREE.Mesh[] = [];
    for (const tilt of [0.5, -0.7]) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.34, 0.008, 8, 48),
        new THREE.MeshBasicMaterial({
          color: 0xf2d894,
          transparent: true,
          opacity: 0.75,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      ring.position.copy(emblem.position);
      ring.rotation.x = tilt;
      book.add(ring);
      rings.push(ring);
    }
    book.userData.emblem = emblem;
    book.userData.rings = rings;
  }
  return book;
}
