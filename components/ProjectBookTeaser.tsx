"use client";

/**
 * The rotating 3D book — the projects section's centerpiece and the
 * doorway to /projects. Tapping it opens the cover, the pages fan out,
 * and only then does the site turn the page to the Project Book.
 */

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  makeBook,
  makeHalo,
  makeSoft,
  dropShadow,
  disposeDeep,
  applyEnvironment,
} from "./story/storyKit";

const OPEN_MS = 2000; // full open animation; we navigate only once the veil covers

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeOut = (k: number) => 1 - (1 - k) ** 3;
const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);

export default function ProjectBookTeaser({
  size = 560,
  caption = "tap the book ✦ the projects live inside",
  className = "",
}: {
  size?: number;
  caption?: string;
  className?: string;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const openingRef = useRef(false);
  const [opening, setOpening] = useState(false);
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/projects");
  }, [router]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const px = Math.min(size, mount.clientWidth || size);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(px, px);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // the original looks down at the book — steeper camera, more cover
    const camFrom = new THREE.Vector3(0, 4.2, 4.4);
    const camTo = new THREE.Vector3(0, 4.7, 4.9); // ease back so the open book fits whole
    const lookFrom = new THREE.Vector3(0, 0, 0);
    const lookTo = new THREE.Vector3(0, 0.55, 0);
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 30);
    camera.position.copy(camFrom);
    camera.lookAt(lookFrom);

    scene.add(new THREE.HemisphereLight(0xfff4e0, 0x6a4a33, 0.55));
    const key = new THREE.DirectionalLight(0xfff4dd, 1.1);
    key.position.set(3, 6, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffd9a8, 0.6);
    rim.position.set(-4, 3, -3);
    scene.add(rim);
    const env = applyEnvironment(renderer, scene, 0.55);

    const halo = makeHalo();
    const soft = makeSoft();
    const book = makeBook(halo, "PROJECTS", "tap to open", { emblem: false });
    const bookScale = size > 250 ? 1.02 : 0.8;
    book.scale.setScalar(bookScale);
    scene.add(book);
    const coverHinge = book.userData.coverHinge as THREE.Group;
    const flutter = book.userData.flutter as THREE.Group[];

    const shadow = dropShadow(soft, 1.6 * bookScale, 0.3);
    shadow.position.y = -0.6 * bookScale;
    scene.add(shadow);

    // warm light spilling out of the opened pages
    const spill = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: halo,
        color: 0xffe2a8,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    spill.position.set(0.1, 0.45 * bookScale, 0);
    spill.scale.setScalar(2.6 * bookScale);
    scene.add(spill);

    let raf = 0;
    let visible = true;
    let openStart: number | null = null;
    const from = { rx: 0, ry: 0, rz: 0, py: 0 };
    const clock = new THREE.Clock();

    const render = () => {
      const t = clock.elapsedTime;
      if (!openingRef.current) {
        book.rotation.y = t * 0.5; // the slow full spin is the whole point
        book.rotation.x = 0.05 + Math.sin(t * 0.8) * 0.05;
        book.rotation.z = Math.sin(t * 0.5) * 0.04;
        const lift = Math.sin(t * 0.9) * 0.08;
        book.position.y = lift;
        const k = 1 - lift * 0.35;
        shadow.scale.setScalar(k);
        (shadow.material as THREE.MeshBasicMaterial).opacity = 0.3 + (1 - k) * 0.5;
      } else {
        if (openStart === null) {
          openStart = t;
          // shortest way home for the spin, then remember where we were
          from.ry = THREE.MathUtils.euclideanModulo(book.rotation.y + Math.PI, Math.PI * 2) - Math.PI;
          from.rx = book.rotation.x;
          from.rz = book.rotation.z;
          from.py = book.position.y;
        }
        const k = clamp01((t - openStart) / (OPEN_MS / 1000));
        const settle = easeOut(clamp01(k / 0.3));
        book.rotation.y = from.ry + (0.32 - from.ry) * settle;
        book.rotation.x = from.rx + (0.1 - from.rx) * settle;
        book.rotation.z = from.rz * (1 - settle);
        book.position.y = from.py + (0.12 - from.py) * settle;
        // the cover swings open, unhurried…
        const ck = easeInOut(clamp01((k - 0.12) / 0.5));
        coverHinge.rotation.z = ck * 1.95 + Math.sin(ck * Math.PI) * 0.1;
        // …the leaves fan out one by one after it, trembling like paper —
        // capped short of the cover so they never cut through it
        flutter.forEach((h, i) => {
          const fk = easeInOut(clamp01((k - 0.3 - i * 0.11) / 0.4));
          h.rotation.z =
            fk * (1.1 + i * 0.35) + Math.sin(t * 5 + i * 1.9) * 0.05 * fk * (1 - k);
        });
        // …and light blooms off the paper
        spill.material.opacity = ck * 0.8;
        spill.scale.setScalar((2.2 + ck * 1.4) * bookScale);
        const dolly = easeInOut(k);
        camera.position.lerpVectors(camFrom, camTo, dolly);
        camera.lookAt(lookFrom.clone().lerp(lookTo, dolly));
        (shadow.material as THREE.MeshBasicMaterial).opacity = 0.3 * (1 - ck);
      }
      renderer.render(scene, camera);
    };
    const loop = () => {
      raf = requestAnimationFrame(loop);
      clock.getDelta();
      render();
    };
    if (reduced) {
      book.rotation.y = 0.5;
      renderer.render(scene, camera);
    } else {
      // only spend frames while the book is actually on screen.
      // IO batches entries (a hash-jump fires two at once) — only the
      // last one holds the real state.
      const io = new IntersectionObserver((entries) => {
        const entry = entries[entries.length - 1];
        const nowVisible = entry.isIntersecting || openingRef.current;
        if (nowVisible && !visible) loop();
        if (!nowVisible && visible) cancelAnimationFrame(raf);
        visible = nowVisible;
      });
      io.observe(mount);
      loop();
      return () => {
        io.disconnect();
        cleanup();
      };
    }
    function cleanup() {
      cancelAnimationFrame(raf);
      disposeDeep(scene);
      halo.dispose();
      soft.dispose();
      env.dispose();
      renderer.dispose();
      mount!.removeChild(renderer.domElement);
    }
    return cleanup;
  }, [size]);

  const open = () => {
    if (openingRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push("/projects");
      return;
    }
    openingRef.current = true;
    setOpening(true);
    setTimeout(() => router.push("/projects"), OPEN_MS);
  };

  const big = size > 250;
  return (
    <button
      type="button"
      onClick={open}
      aria-label="Open the Project Book"
      data-cursor-label="open ✦"
      className={`group flex w-full max-w-full cursor-pointer flex-col items-center border-0 bg-transparent ${className}`}
      style={{ maxWidth: size }}
    >
      <div className="relative flex w-full items-center justify-center" style={{ maxWidth: size }}>
        {/* the watercolour pond the book floats over */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[-12%]"
          style={{
            background:
              "radial-gradient(circle at 50% 56%, rgba(126,180,174,0.4) 0%, rgba(126,180,174,0.22) 38%, rgba(126,180,174,0.08) 58%, transparent 72%)",
          }}
        />
        {[0, 1].map((i) => (
          <div
            key={i}
            aria-hidden
            className="book-ripple pointer-events-none absolute rounded-full border-2 border-[#7eb4ae]/30"
            style={{
              width: `${66 - i * 20}%`,
              height: `${52 - i * 16}%`,
              top: `${28 + i * 8}%`,
              animationDelay: `${i * 1.3}s`,
            }}
          />
        ))}
        <div
          ref={mountRef}
          className={`relative flex w-full items-center justify-center transition-transform duration-300 ${
            big && !opening ? "group-hover:scale-105" : ""
          }`}
          style={{ maxWidth: size, aspectRatio: "1 / 1" }}
        />
      </div>
      <span
        className={`font-hand text-muted transition-colors group-hover:text-accent ${
          big ? "-mt-8 text-2xl" : "-mt-3 text-lg"
        }`}
      >
        {caption}
      </span>

      {/* the page-turn veil that carries us into /projects */}
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 z-[90] transition-opacity duration-[700ms] ease-in ${
          opening ? "opacity-100 delay-[1300ms]" : "opacity-0"
        }`}
        style={{ background: "radial-gradient(120% 100% at 50% 50%, #f1e7d2 0%, #e2d3b4 100%)" }}
      />

      <style>{`
        .book-ripple { animation: bookRipple 5.2s ease-in-out infinite; }
        @keyframes bookRipple {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          50% { transform: scale(1.07); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .book-ripple { animation: none; }
        }
      `}</style>
    </button>
  );
}
