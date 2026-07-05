"use client";

/**
 * SPARK — a tap-through 3D storybook, standalone from the Journey island.
 *
 * A faithful replica of shining.302chanwoo.com's picture-book language:
 * one hue per chapter, a near-black character with big glossy eyes, a warm
 * glowing spark as the only constant, iris page transitions, serif text
 * that arrives word by word, and a single interaction — tap.
 *
 * Fully procedural (zero assets), vanilla three.js on WebGL.
 * ── EDIT THE STORY: the CHAPTER_TEXT array is the whole script. ──
 */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  SERIF,
  hash,
  makeHalo,
  makeSoft,
  beamTexture,
  disposeDeep,
  makeCat,
  makeSpark,
  makeBook,
  catIdle,
  applyEnvironment,
  addLights,
  dropShadow,
  type Built,
  type Tex,
  type ChapterDef,
} from "./storyKit";

/* ── the script ─────────────────────────────────────────────────── */

const CHAPTER_TEXT: {
  lines: string[];
  dark?: boolean; // dark text for light chapters
  align?: "left" | "center";
}[] = [
  { lines: [] }, // 0 — cover
  {
    lines: ["I had long been staring", "at the night screen,", "waiting for a small answer."],
  },
  {
    lines: ["One deep night,", "a small spark", "came down beside me."],
  },
  {
    lines: ["I gave the spark a name.", "It followed me everywhere,", "humming quietly."],
    align: "left",
  },
  {
    lines: ["Some days we dug", "through deserts of sand", "for one line that finally worked."],
    dark: true,
  },
  {
    lines: ["Some nights everything went grey —", "and the spark was", "the only warm thing left."],
  },
  {
    lines: ["Then one morning it pulled me forward,", "faster than I could follow."],
    dark: true,
  },
  {
    lines: ["Until we reached a small green isle,", "and together, piece by piece,", "we began to build a world."],
    dark: true,
  },
  { lines: [] }, // 8 — dedication
];

/* one CSS gradient world per page — the background IS the scenery */
const CHAPTER_BG = [
  "radial-gradient(125% 95% at 50% 38%, #35646a 0%, #1a3d43 46%, #081e23 100%)", // cover teal
  "radial-gradient(135% 105% at 50% 26%, #3d3f75 0%, #23244e 46%, #0c0d26 100%)", // indigo night
  "radial-gradient(135% 105% at 44% 42%, #33184c 0%, #1c0d31 52%, #090313 100%)", // deep violet
  "radial-gradient(135% 115% at 50% 16%, #c9d17e 0%, #a2589c 44%, #55214e 100%)", // magenta forest
  "radial-gradient(135% 115% at 50% 22%, #f7e0ab 0%, #e8bd72 52%, #c39244 100%)", // gold desert
  "radial-gradient(135% 115% at 50% 26%, #787878 0%, #454545 55%, #1d1d1d 100%)", // grey
  "radial-gradient(125% 125% at 50% 48%, #d8f2f4 0%, #f8e6ac 38%, #f4bccb 72%, #b9e6c4 100%)", // pastel rush
  "radial-gradient(135% 110% at 50% 18%, #ffedc8 0%, #ffcfa2 32%, #8ec2b8 64%, #357072 100%)", // dawn isle
  "#f5efe2", // dedication paper
];

/* ── chapter scene builders ─────────────────────────────────────── */

const CHAPTERS: ChapterDef[] = [
  /* 0 — cover: the closed book and the cat */
  {
    cam: [0.3, 2.35, 5.6],
    look: [0, 0.5, 0],
    build(scene, { halo, soft }) {
      addLights(scene, 1.0, 0.55, 0xdaf2ef, 0x1c3a3c);
      const warm = new THREE.PointLight(0xffe2a8, 2.6, 9, 1.6);
      warm.position.set(0, 2.4, 1.4);
      scene.add(warm);

      const book = makeBook(halo, "SPARK", "a small story", { emblem: false });
      book.rotation.y = 0.45;
      book.position.y = 0.62;
      scene.add(book);

      const shadow = dropShadow(soft, 2.2, 0.4);
      shadow.position.y = -0.32;
      scene.add(shadow);
      const haloRing = new THREE.Mesh(
        new THREE.RingGeometry(2.35, 2.5, 72),
        new THREE.MeshBasicMaterial({
          color: 0xa8dcd6,
          transparent: true,
          opacity: 0.22,
          side: THREE.DoubleSide,
        })
      );
      haloRing.rotation.x = -Math.PI / 2;
      haloRing.position.y = -0.33;
      scene.add(haloRing);

      const cat = makeCat(1.25);
      cat.position.set(2.05, -0.34, 0.55);
      cat.rotation.y = -0.65;
      scene.add(cat);
      const catShadow = dropShadow(soft, 0.5, 0.35);
      catShadow.position.set(2.05, -0.32, 0.55);
      scene.add(catShadow);

      // drifting dust motes catching the light
      const moteGeo = new THREE.BufferGeometry();
      const mp = new Float32Array(60 * 3);
      for (let i = 0; i < 60; i++) {
        mp[i * 3] = (hash(i) - 0.5) * 8;
        mp[i * 3 + 1] = hash(i + 30) * 4 - 0.3;
        mp[i * 3 + 2] = (hash(i + 60) - 0.5) * 5;
      }
      moteGeo.setAttribute("position", new THREE.BufferAttribute(mp, 3));
      const motes = new THREE.Points(
        moteGeo,
        new THREE.PointsMaterial({
          map: soft,
          color: 0xf6e9c2,
          size: 0.075,
          transparent: true,
          opacity: 0.8,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      );
      scene.add(motes);

      return {
        tick(t) {
          book.position.y = 0.62 + Math.sin(t * 0.8) * 0.07;
          book.rotation.y = 0.45 + Math.sin(t * 0.25) * 0.09;
          cat.position.y = -0.34 + Math.sin(t * 1.1 + 2) * 0.05;
          catIdle(cat, t, 1);
          haloRing.rotation.z = t * 0.06;
          motes.rotation.y = t * 0.02;
          motes.position.y = Math.sin(t * 0.3) * 0.15;
        },
      };
    },
  },

  /* 1 — a floating rock island under drifting stars */
  {
    cam: [0.4, 1.7, 7.8],
    look: [0, 1.0, 0],
    build(scene, { halo, soft }) {
      addLights(scene, 0.5, 0.5, 0x8f97d8, 0x14142e);
      scene.fog = new THREE.Fog(0x23244e, 26, 60);
      const rockMat = new THREE.MeshStandardMaterial({
        color: 0x6f6a94,
        roughness: 0.95,
        flatShading: true,
      });
      const darkMat = new THREE.MeshStandardMaterial({
        color: 0x353155,
        roughness: 0.95,
        flatShading: true,
      });

      const island = new THREE.Group();
      const top = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), rockMat);
      top.scale.set(2.7, 0.9, 2.3);
      const pos = top.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        pos.setXYZ(
          i,
          pos.getX(i) * (0.92 + hash(i) * 0.16),
          pos.getY(i) * (0.9 + hash(i + 40) * 0.2),
          pos.getZ(i) * (0.92 + hash(i + 80) * 0.16)
        );
      }
      top.geometry.computeVertexNormals();
      island.add(top);
      for (let i = 0; i < 5; i++) {
        const chunk = new THREE.Mesh(
          new THREE.ConeGeometry(0.5 + hash(i) * 0.55, 1.7 + hash(i + 9) * 1.6, 5),
          darkMat
        );
        chunk.rotation.x = Math.PI;
        chunk.position.set((hash(i + 3) - 0.5) * 2.8, -1.0 - hash(i + 6) * 0.6, (hash(i + 5) - 0.5) * 2);
        island.add(chunk);
      }
      // a few pebbles floating loose around the island
      const pebbles: THREE.Mesh[] = [];
      for (let i = 0; i < 5; i++) {
        const p = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09 + hash(i + 44) * 0.1, 0), darkMat);
        p.position.set((hash(i + 11) - 0.5) * 7, -0.4 + hash(i + 21) * 2.4, (hash(i + 31) - 0.5) * 4);
        scene.add(p);
        pebbles.push(p);
      }
      scene.add(island);

      const cat = makeCat(1.05);
      cat.position.set(0.25, 0.72, 0.45);
      cat.rotation.y = 0.3;
      cat.rotation.x = -0.16; // gazing up
      island.add(cat);

      /* two star layers, breathing in counter-phase = cheap twinkle */
      const starLayers: THREE.Points[] = [];
      for (let L = 0; L < 2; L++) {
        const starGeo = new THREE.BufferGeometry();
        const n = 260;
        const sp = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) {
          const a = hash(i + L * 500) * Math.PI * 2;
          const e = hash(i + 900 + L * 500) * Math.PI - Math.PI / 2;
          const r = 36;
          sp[i * 3] = Math.cos(a) * Math.cos(e) * r;
          sp[i * 3 + 1] = Math.sin(e) * r * 0.75 + 7;
          sp[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r;
        }
        starGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
        const stars = new THREE.Points(
          starGeo,
          new THREE.PointsMaterial({
            color: 0xe6ecff,
            size: 0.1 + L * 0.05,
            transparent: true,
            opacity: 0.9,
            map: soft,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          })
        );
        stars.userData.fog = false;
        scene.add(stars);
        starLayers.push(stars);
      }

      /* the moon: soft disc + wide glow, up right */
      const moon = new THREE.Group();
      const moonDisc = new THREE.Mesh(
        new THREE.CircleGeometry(1.5, 40),
        new THREE.MeshBasicMaterial({ color: 0xf2ecda, fog: false })
      );
      const moonGlow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: halo,
          color: 0xdfe4ff,
          transparent: true,
          opacity: 0.55,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          fog: false,
        })
      );
      moonGlow.scale.setScalar(9);
      moon.add(moonDisc, moonGlow);
      moon.position.set(-9, 10.5, -26);
      scene.add(moon);

      const far = makeSpark(halo, 0.9, false);
      far.position.set(4.2, 5.2, -12);
      scene.add(far);

      return {
        tick(t) {
          island.position.y = Math.sin(t * 0.5) * 0.14;
          island.rotation.y = Math.sin(t * 0.11) * 0.05;
          pebbles.forEach((p, i) => {
            p.position.y += Math.sin(t * (0.6 + hash(i) * 0.5) + i * 2) * 0.0022;
            p.rotation.y = t * (0.2 + hash(i) * 0.3);
          });
          (starLayers[0].material as THREE.PointsMaterial).opacity = 0.55 + Math.sin(t * 1.4) * 0.3;
          (starLayers[1].material as THREE.PointsMaterial).opacity = 0.55 + Math.sin(t * 1.4 + Math.PI) * 0.3;
          far.userData.glow.material.opacity = 0.6 + Math.sin(t * 1.3) * 0.3;
          far.position.y = 5.2 + Math.sin(t * 0.7) * 0.25;
          far.position.x = 4.2 - (t % 40) * 0.02;
          catIdle(cat, t, 4);
        },
      };
    },
  },

  /* 2 — the spark descends; light pools and rings ripple out */
  {
    cam: [0, 2.4, 7.2],
    look: [0, 1.15, 0],
    build(scene, { halo, soft }) {
      addLights(scene, 0.22, 0.32, 0x6a5090, 0x0e0618);
      scene.fog = new THREE.Fog(0x150927, 12, 34);
      const ground = new THREE.Mesh(
        new THREE.CircleGeometry(24, 48),
        new THREE.MeshStandardMaterial({ color: 0x241338, roughness: 1 })
      );
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);

      // pool of light where the spark lands
      const pool = new THREE.Mesh(
        new THREE.CircleGeometry(3.2, 40),
        new THREE.MeshBasicMaterial({
          map: soft,
          color: 0xffe2b0,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      );
      pool.rotation.x = -Math.PI / 2;
      pool.position.y = 0.015;
      scene.add(pool);

      const rings: THREE.Mesh[] = [];
      for (let i = 0; i < 5; i++) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.96, 1.02, 72),
          new THREE.MeshBasicMaterial({
            color: 0xf0dcf8,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.03;
        scene.add(ring);
        rings.push(ring);
      }

      const spark = makeSpark(halo, 1.6);
      spark.position.set(0, 7.5, 0);
      scene.add(spark);

      const trail: THREE.Sprite[] = [];
      for (let i = 0; i < 7; i++) {
        const s = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: halo,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          })
        );
        s.scale.setScalar(0.8 - i * 0.09);
        scene.add(s);
        trail.push(s);
      }

      // faint rising dust in the dark
      const dustGeo = new THREE.BufferGeometry();
      const dp = new Float32Array(90 * 3);
      for (let i = 0; i < 90; i++) {
        dp[i * 3] = (hash(i) - 0.5) * 16;
        dp[i * 3 + 1] = hash(i + 50) * 5;
        dp[i * 3 + 2] = (hash(i + 99) - 0.5) * 12;
      }
      dustGeo.setAttribute("position", new THREE.BufferAttribute(dp, 3));
      const dust = new THREE.Points(
        dustGeo,
        new THREE.PointsMaterial({
          map: soft,
          color: 0xcbaef0,
          size: 0.08,
          transparent: true,
          opacity: 0.5,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      );
      scene.add(dust);

      const cat = makeCat(1.1);
      cat.position.set(-1.85, 0, 0.7);
      cat.rotation.y = 0.85;
      scene.add(cat);
      const catShadow = dropShadow(soft, 0.5, 0.4);
      catShadow.position.set(-1.85, 0.02, 0.7);
      scene.add(catShadow);

      let landed = 0;
      return {
        tick(t, dt) {
          const y = Math.max(1.15, 7.5 - t * 1.7);
          spark.position.y = y + (y <= 1.16 ? Math.sin(t * 1.6) * 0.12 : 0);
          if (y <= 1.16 && !landed) landed = t;
          spark.userData.glow.material.opacity = 0.75 + Math.sin(t * 2.2) * 0.2;
          pool.material.opacity = landed ? Math.min(0.4, (t - landed) * 0.3) * (0.85 + Math.sin(t * 1.6) * 0.15) : 0;
          trail.forEach((s, i) => {
            s.position.set(0, spark.position.y + (i + 1) * 0.55, 0);
            s.material.opacity = y > 1.2 ? 0.4 - i * 0.05 : Math.max(0, s.material.opacity - dt * 0.5);
          });
          rings.forEach((r, i) => {
            if (!landed) return;
            const life = ((t - landed) * 0.38 + i * 0.2) % 1;
            r.scale.setScalar(0.4 + life * 8);
            (r.material as THREE.MeshBasicMaterial).opacity = (1 - life) * 0.55;
          });
          dust.position.y = (t * 0.14) % 1.5;
          catIdle(cat, t, 2);
          cat.rotation.x = -Math.min(0.35, Math.max(0, (spark.position.y - 1) * 0.08));
        },
      };
    },
  },

  /* 3 — magenta forest: bare trunks, shafts of green light */
  {
    cam: [0.6, 1.8, 8.8],
    look: [0, 2.2, 0],
    build(scene, { halo, soft, beam }) {
      addLights(scene, 0.6, 0.55, 0xd8b0d0, 0x40163a);
      scene.fog = new THREE.Fog(0xa2589c, 5, 25);
      const ground = new THREE.Mesh(
        new THREE.CircleGeometry(34, 48),
        new THREE.MeshStandardMaterial({ color: 0x571f4e, roughness: 1 })
      );
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);

      const trunkGeo = new THREE.CylinderGeometry(0.17, 0.28, 18, 8);
      const trunks = new THREE.InstancedMesh(
        trunkGeo,
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }),
        52
      );
      const dummy = new THREE.Object3D();
      const col = new THREE.Color();
      const dark = new THREE.Color(0x33102e);
      const lit = new THREE.Color(0x8a4b7e);
      let n = 0;
      let guard = 0;
      while (n < 52 && guard < 600) {
        guard++;
        const x = (hash(guard) - 0.5) * 30;
        const z = -1.5 - hash(guard + 55) * 22;
        if (Math.abs(x) < 1.7 && z > -9) continue; // keep the walking path clear
        dummy.position.set(x, 9, z);
        dummy.rotation.z = (hash(guard + 90) - 0.5) * 0.07;
        const th = 1 + hash(guard + 30) * 1.1;
        dummy.scale.set(th, 1, th);
        dummy.updateMatrix();
        trunks.setMatrixAt(n, dummy.matrix);
        // trunks nearer the light gap glow warmer
        trunks.setColorAt(n, col.copy(dark).lerp(lit, hash(guard + 7) * 0.75 + (x > -2 && x < 5 ? 0.25 : 0)));
        n++;
      }
      scene.add(trunks);

      /* slanting light shafts through the gap — wide, gauzy, barely-there */
      const shafts: THREE.Mesh[] = [];
      for (let i = 0; i < 3; i++) {
        const shaft = new THREE.Mesh(
          new THREE.PlaneGeometry(2.6 + hash(i) * 2.2, 9),
          new THREE.MeshBasicMaterial({
            map: beam,
            color: 0xe8f0a8,
            transparent: true,
            opacity: 0.06 + hash(i + 5) * 0.04,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
          })
        );
        shaft.position.set(-1 + i * 2.4 + hash(i + 9), 5.2, -6 - hash(i + 13) * 4);
        shaft.rotation.z = -0.32;
        scene.add(shaft);
        shafts.push(shaft);
      }

      const sun = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: halo,
          color: 0xdfe88e,
          transparent: true,
          opacity: 0.9,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          fog: false,
        })
      );
      sun.position.set(1.2, 8.4, -16);
      sun.scale.setScalar(6);
      scene.add(sun);

      // floating glow-motes between the trees
      const moteGeo = new THREE.BufferGeometry();
      const mp = new Float32Array(70 * 3);
      for (let i = 0; i < 70; i++) {
        mp[i * 3] = (hash(i) - 0.5) * 18;
        mp[i * 3 + 1] = 0.4 + hash(i + 44) * 5;
        mp[i * 3 + 2] = -hash(i + 88) * 16 + 3;
      }
      moteGeo.setAttribute("position", new THREE.BufferAttribute(mp, 3));
      const motes = new THREE.Points(
        moteGeo,
        new THREE.PointsMaterial({
          map: soft,
          color: 0xf0d8a8,
          size: 0.11,
          transparent: true,
          opacity: 0.75,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      );
      scene.add(motes);

      const cat = makeCat(1.1);
      cat.position.set(-0.4, 0, 3.2);
      cat.rotation.y = Math.PI - 0.15;
      scene.add(cat);
      const catShadow = dropShadow(soft, 0.5, 0.35);
      catShadow.position.set(-0.4, 0.02, 3.2);
      scene.add(catShadow);
      const spark = makeSpark(halo, 1.25);
      spark.position.set(0.9, 1.5, 2.1);
      scene.add(spark);

      return {
        tick(t) {
          cat.position.y = Math.abs(Math.sin(t * 3.0)) * 0.05;
          catIdle(cat, t, 3);
          spark.position.y = 1.5 + Math.sin(t * 1.4) * 0.14;
          spark.position.x = 0.9 + Math.sin(t * 0.5) * 0.25;
          spark.userData.glow.material.opacity = 0.75 + Math.sin(t * 1.9) * 0.2;
          shafts.forEach((s, i) => {
            (s.material as THREE.MeshBasicMaterial).opacity =
              (0.06 + hash(i + 5) * 0.04) * (0.8 + Math.sin(t * 0.5 + i * 1.7) * 0.25);
            s.rotation.z = -0.32 + Math.sin(t * 0.22 + i) * 0.02;
          });
          motes.position.x = Math.sin(t * 0.1) * 0.8;
          motes.position.y = Math.sin(t * 0.23) * 0.3;
        },
      };
    },
  },

  /* 4 — gold desert: towers of old work buried in the dunes */
  {
    cam: [0, 2.9, 12.5],
    look: [0, 2.3, 0],
    build(scene, { halo, soft }) {
      addLights(scene, 1.1, 0.7, 0xfff2d0, 0xa0763c);
      scene.fog = new THREE.Fog(0xe8bd72, 12, 52);
      const duneMat = new THREE.MeshStandardMaterial({ color: 0xf6e4b4, roughness: 1 });
      const duneFar = new THREE.MeshStandardMaterial({ color: 0xecd193, roughness: 1 });
      for (const [dx, dz, s, far] of [
        [-8, -6, 11, 0],
        [8, -11, 13, 0],
        [0, -22, 20, 1],
        [-18, -18, 16, 1],
      ] as const) {
        const dune = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), far ? duneFar : duneMat);
        dune.scale.set(s, s * 0.2, s);
        dune.position.set(dx, -s * 0.09, dz);
        scene.add(dune);
      }
      // foreground dune the pair stands on
      const home = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), duneMat);
      home.scale.set(9, 1.9, 7);
      home.position.set(-1, -0.6, 3.5);
      scene.add(home);

      const towerMat = new THREE.MeshStandardMaterial({ color: 0xcfa45c, roughness: 0.8 });
      const bandMat = new THREE.MeshStandardMaterial({ color: 0xb0813e, roughness: 0.8 });
      const capMat = new THREE.MeshStandardMaterial({ color: 0x94682d, roughness: 0.75 });
      const towers = new THREE.Group();
      for (const [tx, tz, h, tilt] of [
        [-4.6, -4.5, 6.5, 0.3],
        [3.2, -9, 6.8, -0.14],
        [7.2, -3.5, 4.6, 0.4],
      ] as const) {
        const tw = new THREE.Group();
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.8, h, 10), towerMat);
        shaft.position.y = h / 2;
        tw.add(shaft);
        for (let k = 1; k <= 3; k++) {
          const band = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.24, 1.6), bandMat);
          band.position.y = (h / 4) * k;
          band.rotation.y = k * 0.5;
          tw.add(band);
        }
        const cap = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.7, 10), capMat);
        cap.position.y = h + 0.3;
        tw.add(cap);
        // little dark windows
        for (let k = 0; k < 3; k++) {
          const w = new THREE.Mesh(
            new THREE.BoxGeometry(0.16, 0.24, 0.05),
            new THREE.MeshBasicMaterial({ color: 0x6e4c1e })
          );
          w.position.set(0.28, h * 0.35 + k * h * 0.2, 0.62);
          tw.add(w);
        }
        tw.position.set(tx, 0.2, tz);
        tw.rotation.z = tilt;
        towers.add(tw);
      }
      scene.add(towers);

      // the low sun
      const sun = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: halo,
          color: 0xfff0c0,
          transparent: true,
          opacity: 0.95,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          fog: false,
        })
      );
      sun.position.set(-10, 9, -30);
      sun.scale.setScalar(10);
      scene.add(sun);

      const dustGeo = new THREE.BufferGeometry();
      const dp = new Float32Array(160 * 3);
      for (let i = 0; i < 160; i++) {
        dp[i * 3] = (hash(i) - 0.5) * 28;
        dp[i * 3 + 1] = hash(i + 50) * 9;
        dp[i * 3 + 2] = -hash(i + 99) * 24 + 6;
      }
      dustGeo.setAttribute("position", new THREE.BufferAttribute(dp, 3));
      const dust = new THREE.Points(
        dustGeo,
        new THREE.PointsMaterial({
          map: soft,
          color: 0xfff2cf,
          size: 0.1,
          transparent: true,
          opacity: 0.65,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      );
      scene.add(dust);

      const cat = makeCat(1.15);
      cat.position.set(-2.5, 1.42, 4.4);
      cat.rotation.y = 2.7;
      scene.add(cat);
      const catShadow = dropShadow(soft, 0.55, 0.22);
      catShadow.position.set(-2.5, 1.44, 4.4);
      catShadow.rotation.x = -Math.PI / 2 + 0.12; // hug the dune's curve
      scene.add(catShadow);
      const spark = makeSpark(halo, 1.2);
      spark.position.set(-1.4, 2.6, 4.0);
      scene.add(spark);

      return {
        tick(t) {
          dust.position.x = Math.sin(t * 0.12) * 2;
          dust.rotation.y = t * 0.012;
          spark.position.y = 2.6 + Math.sin(t * 1.2) * 0.16;
          spark.userData.glow.material.opacity = 0.75 + Math.sin(t * 1.8) * 0.2;
          catIdle(cat, t, 5);
        },
      };
    },
  },

  /* 5 — the grey chapter: line-art ridges, slow falling bars */
  {
    cam: [0, 2.8, 10.5],
    look: [0, 1.9, 0],
    build(scene, { halo, soft }) {
      addLights(scene, 0.75, 0.7, 0xd8d8d8, 0x2c2c2c);
      scene.fog = new THREE.Fog(0x4a4a4a, 14, 40);
      const ridge = new THREE.Group();
      for (let i = 0; i < 11; i++) {
        const white = 0.42 + hash(i + 4) * 0.55;
        const shardMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(white, white, white),
          roughness: 0.95,
          flatShading: true,
        });
        const shard = new THREE.Mesh(
          new THREE.ConeGeometry(1.2 + hash(i) * 0.9, 1.8 + hash(i + 30) * 2.6, 4),
          shardMat
        );
        shard.position.set(-9 + i * 1.8 + (hash(i + 60) - 0.5), 0.5, -2.5 - hash(i + 90) * 4);
        shard.rotation.y = hash(i + 8) * Math.PI;
        shard.rotation.z = (hash(i + 77) - 0.5) * 0.24;
        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(shard.geometry as THREE.ConeGeometry),
          new THREE.LineBasicMaterial({ color: 0x101010 })
        );
        shard.add(edges);
        ridge.add(shard);
      }
      scene.add(ridge);
      // ground sheet so the ridge doesn't float
      const ground = new THREE.Mesh(
        new THREE.CircleGeometry(30, 40),
        new THREE.MeshStandardMaterial({ color: 0x3c3c3c, roughness: 1 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.4;
      scene.add(ground);

      // horizontal drifting fog banks
      const banks: THREE.Sprite[] = [];
      for (let i = 0; i < 5; i++) {
        const b = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: soft,
            color: 0x9c9c9c,
            transparent: true,
            opacity: 0.16,
            depthWrite: false,
          })
        );
        b.position.set((hash(i + 3) - 0.5) * 18, 0.8 + hash(i + 8) * 1.6, -1 - hash(i + 13) * 6);
        b.scale.set(9 + hash(i) * 6, 2.4, 1);
        scene.add(b);
        banks.push(b);
      }

      const bars = new THREE.InstancedMesh(
        new THREE.BoxGeometry(0.05, 3.2, 0.05),
        new THREE.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.5 }),
        44
      );
      const barState = Array.from({ length: 44 }, (_, i) => ({
        x: (hash(i) - 0.5) * 26,
        z: -1 - hash(i + 31) * 12,
        y: hash(i + 62) * 18,
        sp: 0.8 + hash(i + 93) * 1.6,
      }));
      scene.add(bars);
      const dummy = new THREE.Object3D();

      const cat = makeCat(1.2);
      cat.position.set(-0.3, 1.35, 2.6);
      cat.rotation.y = Math.PI * 0.9;
      scene.add(cat);
      const spark = makeSpark(halo, 1.5);
      spark.position.set(0.75, 2.5, 2.6);
      scene.add(spark);

      return {
        tick(t, dt) {
          for (let i = 0; i < barState.length; i++) {
            const b = barState[i];
            b.y -= b.sp * dt;
            if (b.y < -2) b.y = 15 + hash(i * 3 + 1) * 4;
            dummy.position.set(b.x, b.y, b.z);
            dummy.updateMatrix();
            bars.setMatrixAt(i, dummy.matrix);
          }
          bars.instanceMatrix.needsUpdate = true;
          banks.forEach((b, i) => {
            b.position.x += dt * (0.14 + hash(i) * 0.12);
            if (b.position.x > 12) b.position.x = -12;
          });
          spark.position.y = 2.5 + Math.sin(t * 1.5) * 0.13;
          spark.userData.glow.material.opacity = 0.85 + Math.sin(t * 2.3) * 0.15;
          catIdle(cat, t, 6);
        },
      };
    },
  },

  /* 6 — the pastel rush: flying through soft shapes after the spark */
  {
    cam: [0, 0.2, 6],
    look: [0, 0, -12],
    build(scene, { halo, soft }) {
      scene.fog = new THREE.Fog(0xf3ead0, 6, 55);
      addLights(scene, 0.9, 0.9, 0xffffff, 0xd8c8b0);
      const pastels = [0xf59db8, 0x8fd8a5, 0xf2cd72, 0x8fcbe0, 0xbfa3e8];
      const blobs: { mesh: THREE.Mesh; sp: number }[] = [];
      for (let i = 0; i < 34; i++) {
        // self-lit pastel so near blobs never turn muddy in their own shade
        const mat = new THREE.MeshStandardMaterial({
          color: pastels[i % pastels.length],
          roughness: 0.85,
          emissive: pastels[i % pastels.length],
          emissiveIntensity: 0.38,
        });
        const a = hash(i + 40) * Math.PI * 2;
        const r = 3.2 + hash(i + 80) * 8;
        // blobs near the flight path stay small so they can't swallow the frame
        const maxSize = r < 6 ? 1.3 : 2.9;
        const blob = new THREE.Mesh(
          new THREE.SphereGeometry(Math.min(0.9 + hash(i) * 2.0, maxSize), 20, 16),
          mat
        );
        blob.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.75, -12 - hash(i + 120) * 66);
        blob.scale.y = 0.5 + hash(i + 160) * 0.55;
        blob.rotation.z = hash(i + 200) * Math.PI;
        scene.add(blob);
        blobs.push({ mesh: blob, sp: 10 + hash(i + 240) * 10 });
      }
      // soft glow puffs floating between the blobs
      const puffs: THREE.Sprite[] = [];
      for (let i = 0; i < 14; i++) {
        const p = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: soft,
            color: 0xffffff,
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
          })
        );
        const a = hash(i + 7) * Math.PI * 2;
        const r = 2.5 + hash(i + 17) * 7;
        p.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.7, -8 - hash(i + 27) * 50);
        p.scale.setScalar(3 + hash(i + 37) * 4);
        scene.add(p);
        puffs.push(p);
      }
      // petals whipping past
      const petals = new THREE.InstancedMesh(
        new THREE.SphereGeometry(0.09, 8, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        60
      );
      const petalState = Array.from({ length: 60 }, (_, i) => ({
        x: (hash(i + 5) - 0.5) * 12,
        y: (hash(i + 15) - 0.5) * 7,
        z: -hash(i + 25) * 50,
        sp: 22 + hash(i + 35) * 26,
        ph: hash(i + 45) * Math.PI * 2,
      }));
      const pcol = new THREE.Color();
      for (let i = 0; i < 60; i++) petals.setColorAt(i, pcol.set(pastels[i % pastels.length]).lerp(new THREE.Color(1, 1, 1), 0.3));
      scene.add(petals);
      const dummy = new THREE.Object3D();

      // the spark, well ahead, trailing light
      const spark = makeSpark(halo, 2.6);
      spark.position.set(0, 0.4, -16);
      scene.add(spark);
      const trail: THREE.Sprite[] = [];
      for (let i = 0; i < 8; i++) {
        const s = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: halo,
            transparent: true,
            opacity: 0.4 - i * 0.045,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          })
        );
        s.scale.setScalar(1.3 - i * 0.12);
        scene.add(s);
        trail.push(s);
      }

      const cat = makeCat(1.0);
      cat.position.set(1.1, -1.1, -4.5);
      cat.rotation.x = -0.55;
      cat.rotation.y = Math.PI;
      scene.add(cat);

      return {
        tick(t, dt) {
          for (const b of blobs) {
            b.mesh.position.z += b.sp * dt;
            b.mesh.rotation.z += dt * 0.1;
            if (b.mesh.position.z > 9) b.mesh.position.z = -75;
          }
          for (const p of puffs) {
            p.position.z += 14 * dt;
            if (p.position.z > 9) p.position.z = -55;
          }
          for (let i = 0; i < petalState.length; i++) {
            const p = petalState[i];
            p.z += p.sp * dt;
            if (p.z > 7) p.z = -50;
            dummy.position.set(p.x + Math.sin(t * 2 + p.ph) * 0.4, p.y + Math.cos(t * 1.6 + p.ph) * 0.4, p.z);
            dummy.scale.set(1, 0.5, 2.2); // stretched by speed
            dummy.updateMatrix();
            petals.setMatrixAt(i, dummy.matrix);
          }
          petals.instanceMatrix.needsUpdate = true;
          spark.position.x = Math.sin(t * 0.6) * 1.6;
          spark.position.y = 0.4 + Math.sin(t * 0.9 + 1) * 1.0;
          spark.userData.glow.material.opacity = 0.85 + Math.sin(t * 2.6) * 0.15;
          trail.forEach((s, i) => {
            s.position.set(
              spark.position.x * (1 + (i + 1) * 0.06),
              spark.position.y + Math.sin(t * 0.9 + 1 - i * 0.24) * 0.2,
              spark.position.z - (i + 1) * 1.5
            );
          });
          cat.position.x = 1.1 + Math.sin(t * 0.7) * 0.55;
          cat.position.y = -1.1 + Math.sin(t * 1.1 + 2) * 0.4;
          cat.rotation.z = Math.sin(t * 0.8) * 0.22;
          catIdle(cat, t, 7);
        },
      };
    },
  },

  /* 7 — dawn landfall: a small green isle to build a world on */
  {
    cam: [0, 2.3, 10],
    look: [0, 1.35, 0],
    build(scene, { halo, soft }) {
      addLights(scene, 1.0, 0.7, 0xfff0d4, 0x2f6b64);
      scene.fog = new THREE.Fog(0x8ec2b8, 16, 46);

      // the sea — a broad calm disc catching the dawn
      const sea = new THREE.Mesh(
        new THREE.CircleGeometry(40, 56),
        new THREE.MeshStandardMaterial({ color: 0x3f8f8c, roughness: 0.55, metalness: 0.1 })
      );
      sea.rotation.x = -Math.PI / 2;
      scene.add(sea);

      const isle = new THREE.Group();
      const sand = new THREE.Mesh(
        new THREE.SphereGeometry(1, 28, 18),
        new THREE.MeshStandardMaterial({ color: 0xefdcac, roughness: 1 })
      );
      sand.scale.set(4.6, 0.55, 3.6);
      sand.position.y = 0.08;
      const grass = new THREE.Mesh(
        new THREE.SphereGeometry(1, 28, 18),
        new THREE.MeshStandardMaterial({ color: 0x7ab06a, roughness: 1 })
      );
      grass.scale.set(3.6, 0.85, 2.7);
      grass.position.y = 0.3;
      isle.add(sand, grass);

      // the lighthouse — white with a warm lamp, the isle's promise
      const lighthouse = new THREE.Group();
      const lhBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.42, 1.7, 12),
        new THREE.MeshStandardMaterial({ color: 0xf6f0e2, roughness: 0.7 })
      );
      lhBody.position.y = 0.85;
      const lhBand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.4, 0.3, 12),
        new THREE.MeshStandardMaterial({ color: 0xd8574a, roughness: 0.7 })
      );
      lhBand.position.y = 0.6;
      const lhCap = new THREE.Mesh(
        new THREE.ConeGeometry(0.34, 0.42, 12),
        new THREE.MeshStandardMaterial({ color: 0xd8574a, roughness: 0.7 })
      );
      lhCap.position.y = 2.05;
      const lamp = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.3, 10),
        new THREE.MeshBasicMaterial({ color: 0xffe2a8 })
      );
      lamp.position.y = 1.8;
      const lampGlow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: halo,
          transparent: true,
          opacity: 0.8,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      );
      lampGlow.scale.setScalar(1.5);
      lampGlow.position.y = 1.8;
      lighthouse.add(lhBody, lhBand, lhCap, lamp, lampGlow);
      // out on the sandy point, clear of the chapter text
      lighthouse.position.set(-3.05, 0.42, -0.7);
      isle.add(lighthouse);

      // a half-built cottage — walls up, roof beams still bare
      const cottage = new THREE.Group();
      const walls = new THREE.Mesh(
        new THREE.BoxGeometry(1.15, 0.7, 0.9),
        new THREE.MeshStandardMaterial({ color: 0xe8c88e, roughness: 0.9 })
      );
      walls.position.y = 0.35;
      cottage.add(walls);
      for (const bz of [-0.3, 0, 0.3]) {
        const beamBar = new THREE.Mesh(
          new THREE.BoxGeometry(1.3, 0.05, 0.06),
          new THREE.MeshStandardMaterial({ color: 0x8a5a34, roughness: 0.9 })
        );
        beamBar.position.set(0, 0.74, bz);
        cottage.add(beamBar);
      }
      const window1 = new THREE.Mesh(
        new THREE.PlaneGeometry(0.2, 0.24),
        new THREE.MeshBasicMaterial({ color: 0xffd9a0 })
      );
      window1.position.set(0.2, 0.38, 0.46);
      cottage.add(window1);
      cottage.position.set(1.5, 1.02, 0.2);
      cottage.rotation.y = -0.4;
      isle.add(cottage);

      // two young trees
      for (const [tx, tz, s, ty] of [
        [0.1, -1.1, 0.9, 1.02],
        [2.6, -0.6, 0.7, 0.82],
      ] as const) {
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.07, 0.5, 6),
          new THREE.MeshStandardMaterial({ color: 0x7a5232, roughness: 1 })
        );
        trunk.position.y = 0.25;
        const crown = new THREE.Mesh(
          new THREE.SphereGeometry(0.34, 12, 10),
          new THREE.MeshStandardMaterial({ color: 0x5f9e52, roughness: 1 })
        );
        crown.position.y = 0.68;
        crown.scale.y = 1.15;
        tree.add(trunk, crown);
        tree.scale.setScalar(s);
        tree.position.set(tx, ty, tz);
        isle.add(tree);
      }
      scene.add(isle);

      // gentle rings spreading from the shore
      const rings: THREE.Mesh[] = [];
      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.98, 1.01, 64),
          new THREE.MeshBasicMaterial({
            color: 0xdff2ec,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            depthWrite: false,
          })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.02;
        scene.add(ring);
        rings.push(ring);
      }

      // the low dawn sun + drifting clouds
      const sun = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: halo,
          color: 0xffe0b0,
          transparent: true,
          opacity: 0.95,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          fog: false,
        })
      );
      sun.position.set(6, 7.5, -28);
      sun.scale.setScalar(9);
      scene.add(sun);
      const clouds: THREE.Sprite[] = [];
      for (let i = 0; i < 4; i++) {
        const c = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: soft,
            color: 0xfff2dc,
            transparent: true,
            opacity: 0.4,
            depthWrite: false,
          })
        );
        c.position.set((hash(i + 2) - 0.5) * 26, 4.5 + hash(i + 12) * 3, -18 - hash(i + 22) * 8);
        c.scale.set(6 + hash(i) * 5, 1.7, 1);
        scene.add(c);
        clouds.push(c);
      }

      // cat on the grass slope, spark hovering at its side — both facing the build
      const cat = makeCat(1.05);
      cat.position.set(-0.2, 0.86, 1.9);
      cat.rotation.y = Math.PI - 0.35;
      scene.add(cat);
      const spark = makeSpark(halo, 1.25);
      spark.position.set(-0.7, 2.0, 2.2);
      scene.add(spark);

      return {
        tick(t, dt) {
          isle.position.y = Math.sin(t * 0.4) * 0.02;
          rings.forEach((r, i) => {
            const life = (t * 0.22 + i / 3) % 1;
            r.scale.setScalar(4.8 + life * 6);
            (r.material as THREE.MeshBasicMaterial).opacity = (1 - life) * 0.3;
          });
          clouds.forEach((c, i) => {
            c.position.x += dt * (0.08 + hash(i) * 0.08);
            if (c.position.x > 16) c.position.x = -16;
          });
          spark.position.y = 2.0 + Math.sin(t * 1.3) * 0.15;
          spark.position.x = -0.7 + Math.sin(t * 0.55) * 0.3;
          spark.userData.glow.material.opacity = 0.75 + Math.sin(t * 2.0) * 0.2;
          lampGlow.material.opacity = 0.65 + Math.sin(t * 1.1) * 0.2;
          catIdle(cat, t, 8);
        },
      };
    },
  },

  /* 8 — dedication (paper page, scene stays empty) */
  {
    cam: [0, 0, 6],
    look: [0, 0, 0],
    build() {
      return { tick() {} };
    },
  },
];

/* per-chapter vignette strength — the cinema edge-darkening */
const VIGNETTE = [0.5, 0.55, 0.62, 0.45, 0.3, 0.45, 0.18, 0.26, 0];

/* index of the dedication page */
const LAST = CHAPTERS.length - 1;

/* ── the storybook ──────────────────────────────────────────────── */

export default function SparkStory() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [veil, setVeil] = useState(false);
  const [dotReady, setDotReady] = useState(false);
  const busy = useRef(false);
  const idxRef = useRef(0);
  const three = useRef<{
    setChapter: (i: number) => void;
    dispose: () => void;
  } | null>(null);

  /* boot three */
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const env = applyEnvironment(renderer, scene, 0.45);
    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 220);
    const tex: Tex = { halo: makeHalo(), soft: makeSoft(), beam: beamTexture() };

    const clock = new THREE.Clock();
    let built: Built = { tick: () => {} };
    let camBase = new THREE.Vector3(...CHAPTERS[0].cam);
    let lookAt = new THREE.Vector3(...CHAPTERS[0].look);
    let chapterAt = 0; // when the page opened — drives the settle-in

    const setChapter = (i: number) => {
      chapterAt = clock.elapsedTime;
      disposeDeep(scene);
      scene.clear();
      scene.fog = null;
      const def = CHAPTERS[i];
      camBase = new THREE.Vector3(...def.cam);
      lookAt = new THREE.Vector3(...def.look);
      built = def.build(scene, tex);
    };
    setChapter(0);

    const pointer = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      built.tick(t, dt);
      // gentle drift + pointer parallax — plus a settle-in glide per page
      const settle = Math.min(1, (t - chapterAt) / 1.6);
      const glide = (1 - settle) ** 3 * 0.9;
      camera.position.set(
        camBase.x + pointer.x * 0.4 + Math.sin(t * 0.3) * 0.1,
        camBase.y - pointer.y * 0.22 + Math.sin(t * 0.47) * 0.07 + glide * 0.18,
        camBase.z + glide
      );
      camera.lookAt(lookAt);
      renderer.render(scene, camera);
    };
    loop();

    three.current = {
      setChapter,
      dispose: () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("resize", onResize);
        disposeDeep(scene);
        tex.halo.dispose();
        tex.soft.dispose();
        tex.beam.dispose();
        env.dispose();
        renderer.dispose();
        mount.removeChild(renderer.domElement);
      },
    };
    return () => three.current?.dispose();
  }, []);

  /* the next-dot appears once the page's words have all arrived */
  useEffect(() => {
    idxRef.current = idx;
    setDotReady(false);
    const words = CHAPTER_TEXT[idx]?.lines.join(" ").split(" ").length ?? 0;
    const t = setTimeout(() => setDotReady(true), idx === 0 ? 1400 : 900 + words * 90);
    return () => clearTimeout(t);
  }, [idx]);

  const advance = useCallback(() => {
    const i = idxRef.current;
    if (busy.current || i >= LAST) return;
    busy.current = true;
    setVeil(true); // iris floods in
    setTimeout(() => {
      three.current?.setChapter(i + 1);
      setIdx(i + 1);
      setVeil(false); // iris opens on the new page
      setTimeout(() => {
        busy.current = false;
      }, 700);
    }, 720);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") advance();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance]);

  const chapter = CHAPTER_TEXT[idx];
  const textColor = chapter.dark ? "#4a3416" : "#f6efdd";
  const chromeDark = !!chapter.dark || idx === LAST;
  let wordDelay = 0;

  return (
    <div
      className="fixed inset-0 select-none overflow-hidden"
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("a")) return;
        advance();
      }}
      style={{ cursor: idx < LAST ? "pointer" : "auto", background: "#081e23" }}
    >
      {/* stacked gradient worlds — the active one fades in */}
      {CHAPTER_BG.map((bg, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{ background: bg, opacity: idx === i ? 1 : 0, transition: "opacity 1100ms ease" }}
        />
      ))}

      {/* the 3D stage */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* cinema vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(118% 92% at 50% 44%, rgba(0,0,0,0) 52%, rgba(6,4,14,0.55) 100%)",
          opacity: VIGNETTE[idx],
          transition: "opacity 1100ms ease",
        }}
      />

      {/* wordmark + escape hatch */}
      <div className="absolute inset-x-0 top-0 z-30 flex items-start justify-between p-6">
        <span
          className="text-sm font-bold tracking-[0.35em]"
          style={{ fontFamily: SERIF, color: chromeDark ? "#4a3416" : "#f6efdd", opacity: 0.9 }}
        >
          SPARK ✦
        </span>
        <Link
          href="/journey"
          className="rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] transition-opacity hover:opacity-70"
          style={{
            color: chromeDark ? "#4a3416" : "#f6efdd",
            borderColor: chromeDark ? "#4a341644" : "#f6efdd44",
          }}
        >
          the isle →
        </Link>
      </div>

      {/* cover title */}
      {idx === 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-[13vh] z-20 text-center">
          <h1
            className="text-6xl font-semibold tracking-[0.2em] sm:text-7xl"
            style={{ fontFamily: SERIF, color: "#f4e8c8", textShadow: "0 2px 30px rgba(242,216,148,0.35)" }}
          >
            SPARK
          </h1>
          <p className="mt-3 text-lg italic" style={{ fontFamily: SERIF, color: "#bcd8d2" }}>
            a small story from the Isle of Jay
          </p>
        </div>
      )}

      {/* cover hint — below the book, clear of the emblem's glow */}
      {idx === 0 && dotReady && (
        <p
          className="spark-hint pointer-events-none absolute inset-x-0 top-[82vh] z-20 text-center text-sm italic"
          style={{ fontFamily: SERIF, color: "#bcd8d2" }}
        >
          tap the book
        </p>
      )}

      {/* chapter text, word by word */}
      {idx >= 1 && idx < LAST && (
        <div
          key={idx}
          className={`pointer-events-none absolute z-20 max-w-xl ${
            chapter.align === "left" ? "left-[8vw] top-[24vh] text-left" : "inset-x-0 top-[21vh] mx-auto text-center"
          }`}
        >
          {chapter.lines.map((line, li) => (
            <p
              key={li}
              className="text-2xl leading-relaxed sm:text-[28px]"
              style={{
                fontFamily: SERIF,
                color: textColor,
                textShadow: chapter.dark ? "0 1px 10px rgba(255,244,214,0.35)" : "0 1px 16px rgba(0,0,0,0.35)",
              }}
            >
              {line.split(" ").map((w, wi) => {
                wordDelay += 90;
                return (
                  <span key={wi} className="spark-word" style={{ animationDelay: `${400 + wordDelay}ms` }}>
                    {w}{" "}
                  </span>
                );
              })}
            </p>
          ))}
        </div>
      )}

      {/* the next-dot: a small breathing halo, the only affordance */}
      {dotReady && idx >= 1 && idx < LAST && (
        <button
          type="button"
          aria-label="next page"
          onPointerDown={advance}
          className="spark-dot absolute left-1/2 top-[76vh] z-30 -translate-x-1/2"
          style={{ ["--dot" as string]: chapter.dark ? "#4a3416" : "#f8f0da" }}
        />
      )}

      {/* page number */}
      {idx >= 1 && idx < LAST && (
        <p
          className="absolute inset-x-0 bottom-6 z-20 text-center font-mono text-[11px] tracking-[0.3em]"
          style={{ color: chapter.dark ? "#4a341688" : "#f6efdd88" }}
        >
          - 0{idx} -
        </p>
      )}

      {/* dedication */}
      {idx === LAST && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-8 text-center">
          <p className="text-3xl" style={{ fontFamily: SERIF, color: "#c9a14e" }}>
            ✦
          </p>
          <p
            className="mt-6 max-w-md text-xl leading-relaxed text-[#3a2f1e] sm:text-2xl"
            style={{ fontFamily: SERIF }}
          >
            “Spark” is a small story about the day curiosity moved in.
            <br />
            It never left.
          </p>
          <p className="mt-6 text-base italic text-[#8a7a5c]" style={{ fontFamily: SERIF }}>
            — Jay
          </p>
          <div className="pointer-events-auto mt-12 flex items-center gap-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full border border-[#3a2f1e44] px-5 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#3a2f1e] transition-colors hover:bg-[#3a2f1e] hover:text-[#f5efe2]"
            >
              read again ↺
            </button>
            <Link
              href="/journey"
              className="rounded-full bg-[#3a2f1e] px-5 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#f5efe2] transition-opacity hover:opacity-80"
            >
              explore the isle →
            </Link>
          </div>
        </div>
      )}

      {/* iris page-turn veil */}
      <div
        className="pointer-events-none absolute inset-0 z-40"
        style={{
          background: "radial-gradient(120% 100% at 50% 50%, #f1e7d2 0%, #e2d3b4 100%)",
          clipPath: veil ? "circle(120% at 50% 50%)" : "circle(0% at 50% 50%)",
          transition: "clip-path 720ms cubic-bezier(0.65, 0, 0.35, 1)",
        }}
      />

      <style>{`
        .spark-word {
          display: inline-block;
          opacity: 0;
          animation: sparkWord 0.7s ease-out forwards;
          white-space: pre;
        }
        @keyframes sparkWord {
          from { opacity: 0; transform: translateY(10px); filter: blur(8px); }
          60% { filter: blur(2px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .spark-dot {
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: var(--dot);
          pointer-events: auto;
          animation: sparkDot 2.6s ease-in-out infinite;
        }
        @keyframes sparkDot {
          0%, 100% {
            box-shadow: 0 0 0 6px color-mix(in srgb, var(--dot) 18%, transparent),
              0 0 24px 4px color-mix(in srgb, var(--dot) 35%, transparent);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 13px color-mix(in srgb, var(--dot) 10%, transparent),
              0 0 34px 8px color-mix(in srgb, var(--dot) 45%, transparent);
            transform: scale(1.12);
          }
        }
        .spark-hint { animation: sparkHint 2.4s ease-in-out infinite; }
        @keyframes sparkHint {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .spark-word { animation-duration: 0.01s; }
          .spark-dot, .spark-hint { animation: none; }
        }
      `}</style>
    </div>
  );
}
