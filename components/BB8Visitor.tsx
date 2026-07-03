"use client";

/**
 * BB8Visitor — all-cream 3D BB-8, the playable gallery guide.
 * Drop-in replacement for the old WALL·E SVG visitor: same props
 * (walking / facing / waving), same wrapper contract. The ball body
 * rolls when walking, the head stays upright, leans into the motion
 * and wiggles when waving.
 */

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Outlines } from "@react-three/drei";
import * as THREE from "three";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ── 3-band toon gradient, warm for a lit gallery ───────────────── */
function useToonGradient() {
  return useMemo(() => {
    const data = new Uint8Array(3 * 4);
    data.set([96, 84, 64, 255], 0); // warm shadow
    data.set([178, 164, 136, 255], 4); // mid
    data.set([230, 221, 198, 255], 8); // highlight — kept below wall white
    const tex = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
    tex.minFilter = tex.magFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }, []);
}

/* ── All-cream palette (depth through shade, not hue) ───────────── */
const C = {
  base: "#DACFB2", // main shell — darker cream so it pops off the wall
  mid: "#C6B891", // panel rings
  deep: "#B09E76", // panel discs / bands
  dark: "#94815C", // lenses / recesses
  lens: "#7A6A4B", // inner lens
};
const INK = "#1C1917"; // matches the site's ink
const OL = { thickness: 0.02, color: INK } as const;
const OL_SM = { thickness: 0.01, color: INK } as const;

function TM({ c, gm }: { c: string; gm: THREE.DataTexture }) {
  return <meshToonMaterial color={c} gradientMap={gm} />;
}

/* ── circular tech panel hugging the body sphere ────────────────── */
function Panel({ dir, gm }: { dir: [number, number, number]; gm: THREE.DataTexture }) {
  const quat = useMemo(() => {
    const n = new THREE.Vector3(...dir).normalize();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
  }, [dir]);

  return (
    <group quaternion={quat}>
      <mesh position={[0, 0, 0.905]}>
        <torusGeometry args={[0.4, 0.032, 10, 48]} />
        <TM c={C.mid} gm={gm} />
        <Outlines {...OL_SM} />
      </mesh>
      <mesh position={[0, 0, 0.925]} scale={[1, 1, 0.22]}>
        <sphereGeometry args={[0.3, 24, 16]} />
        <TM c={C.deep} gm={gm} />
        <Outlines {...OL_SM} />
      </mesh>
      <mesh position={[0, 0, 0.988]}>
        <torusGeometry args={[0.15, 0.016, 8, 32]} />
        <TM c={C.base} gm={gm} />
      </mesh>
      <mesh position={[0, 0, 0.99]} scale={[1, 1, 0.4]}>
        <sphereGeometry args={[0.055, 12, 10]} />
        <TM c={C.dark} gm={gm} />
        <Outlines {...OL_SM} />
      </mesh>
    </group>
  );
}

/* ── small surface bolt ─────────────────────────────────────────── */
function Bolt({ dir, gm }: { dir: [number, number, number]; gm: THREE.DataTexture }) {
  const pos = useMemo(
    () => new THREE.Vector3(...dir).normalize().multiplyScalar(0.99),
    [dir]
  );
  return (
    <mesh position={pos}>
      <sphereGeometry args={[0.045, 10, 8]} />
      <TM c={C.deep} gm={gm} />
      <Outlines {...OL_SM} />
    </mesh>
  );
}

const PANELS: [number, number, number][] = [
  [0, 0.2, 1],
  [0, 1, -0.35],
  [0, -0.85, 0.6],
  [0.9, 0.15, 0.45],
  [-0.9, -0.1, 0.5],
  [0.8, -0.35, -0.55],
  [-0.75, 0.55, -0.45],
];

const BOLTS: [number, number, number][] = [
  [0.45, 0.75, 0.5],
  [-0.5, 0.6, 0.65],
  [0.55, -0.5, 0.68],
  [-0.35, -0.65, -0.68],
  [0.2, 0.35, -0.92],
];

/* ── half-dome head with lenses + antennae ──────────────────────── */
function Head({ gm }: { gm: THREE.DataTexture }) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.62, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <TM c={C.base} gm={gm} />
        <Outlines {...OL} />
      </mesh>
      <mesh position={[0, -0.005, 0]}>
        <cylinderGeometry args={[0.605, 0.58, 0.045, 32]} />
        <TM c={C.deep} gm={gm} />
      </mesh>
      <mesh position={[0, 0.035, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.026, 10, 48]} />
        <TM c={C.mid} gm={gm} />
        <Outlines {...OL_SM} />
      </mesh>
      <mesh position={[0, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.013, 8, 48]} />
        <TM c={C.deep} gm={gm} />
      </mesh>

      {/* main photoreceptor — looks along +X, the walk direction */}
      <group position={[0.54, 0.26, 0]} rotation={[0, 0, -Math.atan2(0.92, 0.4)]}>
        <mesh>
          <cylinderGeometry args={[0.13, 0.145, 0.1, 24]} />
          <TM c={C.mid} gm={gm} />
          <Outlines {...OL_SM} />
        </mesh>
        <mesh position={[0, 0.055, 0]}>
          <cylinderGeometry args={[0.095, 0.095, 0.025, 20]} />
          <TM c={C.lens} gm={gm} />
          <Outlines {...OL_SM} />
        </mesh>
        <mesh position={[0.03, 0.072, 0.03]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#FFFDF6" />
        </mesh>
      </group>

      {/* secondary lens */}
      <group position={[0.48, 0.13, 0.3]} rotation={[0.5, 0, -Math.atan2(0.85, 0.24)]}>
        <mesh>
          <cylinderGeometry args={[0.055, 0.062, 0.06, 16]} />
          <TM c={C.dark} gm={gm} />
          <Outlines {...OL_SM} />
        </mesh>
      </group>

      {/* antennae */}
      <mesh position={[0, 0.82, 0.1]}>
        <cylinderGeometry args={[0.011, 0.011, 0.48, 8]} />
        <TM c={C.dark} gm={gm} />
        <Outlines {...OL_SM} />
      </mesh>
      <mesh position={[0.05, 0.74, -0.09]}>
        <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
        <TM c={C.deep} gm={gm} />
      </mesh>
      <mesh position={[0.05, 0.9, -0.09]}>
        <sphereGeometry args={[0.025, 10, 8]} />
        <TM c={C.dark} gm={gm} />
        <Outlines {...OL_SM} />
      </mesh>
    </group>
  );
}

/* ── idle behavior brain ────────────────────────────────────────── */
type Mood =
  | "rest"
  | "look-viewer"
  | "glance-back"
  | "glance-ahead"
  | "curious"
  | "scan"
  | "droop";

const MOODS: [Mood, number][] = [
  ["look-viewer", 0.3],
  ["glance-back", 0.13],
  ["glance-ahead", 0.13],
  ["curious", 0.15],
  ["scan", 0.12],
  ["droop", 0.05],
  ["rest", 0.12],
];

function pickMood(): Mood {
  let r = Math.random();
  for (const [m, w] of MOODS) {
    r -= w;
    if (r <= 0) return m;
  }
  return "rest";
}

/* ── droid: rolls when walking; idle he looks around & at you ───── */
function Droid({
  gm,
  walking,
  waving,
}: {
  gm: THREE.DataTexture;
  walking: boolean;
  waving: boolean;
}) {
  const droidRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const speed = useRef(0);
  const mood = useRef<Mood>("look-viewer");
  const moodUntil = useRef(2.5);
  const wasWalking = useRef(false);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Ball rolls "forward" (+X); the wrapper's scaleX flip handles facing.
    speed.current = lerp(speed.current, walking ? 6.0 : 0, 0.08);
    if (bodyRef.current) bodyRef.current.rotation.z -= delta * speed.current;

    // behavior scheduling
    if (walking) {
      wasWalking.current = true;
    } else if (wasWalking.current) {
      // just stopped: check in with the viewer
      wasWalking.current = false;
      mood.current = "look-viewer";
      moodUntil.current = t + 1.6 + Math.random();
    }
    if (!walking && t > moodUntil.current) {
      mood.current = pickMood();
      moodUntil.current = t + 1.3 + Math.random() * 1.8;
    }

    // head pose from mood
    const m = mood.current;
    let yaw = 0; // rotation.y — photoreceptor toward viewer (-) / away (+)
    let tilt = 0; // rotation.x — ear-to-shoulder
    let lean = 0; // rotation.z — forward (-) / up (+)
    let rise = 0; // magnetic hover height

    if (walking) {
      lean = -0.22;
    } else if (waving) {
      yaw = -0.85; // wave AT the viewer
      lean = Math.sin(t * 9) * 0.22;
    } else {
      switch (m) {
        case "look-viewer":
          yaw = -0.95;
          tilt = Math.sin(t * 1.3) * 0.05;
          break;
        case "glance-back":
          yaw = 0.6;
          lean = 0.05;
          break;
        case "glance-ahead":
          yaw = -0.15;
          lean = -0.06;
          break;
        case "curious":
          yaw = -0.5;
          tilt = 0.18;
          lean = 0.05;
          break;
        case "scan":
          rise = 0.07; // dome lifts off the ball a touch
          yaw = Math.sin(t * 0.9) * 0.5;
          lean = 0.1;
          break;
        case "droop":
          lean = -0.2;
          rise = -0.03;
          break;
        case "rest":
          yaw = Math.sin(t * 0.5) * 0.1;
          break;
      }
    }

    if (headRef.current) {
      const h = headRef.current;
      h.rotation.y = lerp(h.rotation.y, yaw, 0.07);
      h.rotation.x = lerp(h.rotation.x, tilt, 0.08);
      h.rotation.z = lerp(h.rotation.z, lean, 0.1);
      h.position.x = lerp(h.position.x, walking ? 0.24 : 0, 0.1);
      h.position.y =
        1.93 +
        rise -
        h.position.x * h.position.x * 0.35 +
        Math.sin(t * (walking ? 9 : 1.6)) * (walking ? 0.02 : 0.012);
    }

    // idle sway / rolling jitter / excited wave rock
    if (droidRef.current) {
      const r = droidRef.current;
      r.position.y = walking ? Math.abs(Math.sin(t * 9)) * 0.03 : 0;
      const sway = Math.sin(t * 0.9) * 0.025;
      const excite = waving ? Math.sin(t * 9) * 0.02 : 0;
      r.rotation.z = walking ? 0 : sway + excite;
      // the ball shuffles a little toward whoever he's looking at
      const bodyYaw = !walking && (m === "look-viewer" || waving) ? -0.18 : 0;
      r.rotation.y = lerp(r.rotation.y, bodyYaw, 0.05);
    }
  });

  return (
    <group position={[0, -1.22, 0]}>
      <group ref={droidRef}>
        <group ref={bodyRef} position={[0, 1, 0]}>
          <mesh>
            <sphereGeometry args={[1, 48, 32]} />
            <TM c={C.base} gm={gm} />
            <Outlines {...OL} />
          </mesh>
          {PANELS.map((d, i) => (
            <Panel key={i} dir={d} gm={gm} />
          ))}
          {BOLTS.map((d, i) => (
            <Bolt key={i} dir={d} gm={gm} />
          ))}
        </group>

        <group ref={headRef} position={[0, 1.93, 0]}>
          <Head gm={gm} />
        </group>
      </group>
    </group>
  );
}

function Scene({ walking, waving }: { walking: boolean; waving: boolean }) {
  const gm = useToonGradient();
  return (
    <>
      <ambientLight color="#ffffff" intensity={2.1} />
      <pointLight color="#ffe2b8" intensity={5.0} position={[2.5, 3.5, 3.0]} distance={10} decay={2} />
      <pointLight color="#e8e0d0" intensity={2.0} position={[-3.0, 2.0, -1.5]} distance={9} decay={2} />
      <pointLight color="#fff2dc" intensity={1.2} position={[0, 0.6, 3.2]} distance={7} decay={2} />
      <Droid gm={gm} walking={walking} waving={waving} />
    </>
  );
}

export default function BB8Visitor({
  walking,
  facing,
  waving = false,
}: {
  walking: boolean;
  facing: 1 | -1;
  waving?: boolean;
}) {
  return (
    <div
      className="h-[124px] w-[124px]"
      style={{ transform: `scaleX(${facing})` }}
    >
      <Canvas
        camera={{ position: [0, 0.55, 4.35], fov: 38 }}
        onCreated={({ camera }) => camera.lookAt(0, -0.05, 0)}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        dpr={[1, 2]}
        style={{ width: "100%", height: "100%" }}
      >
        <Scene walking={walking} waving={waving} />
      </Canvas>
    </div>
  );
}
