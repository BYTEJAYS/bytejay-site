"use client";

/**
 * THE PROJECT BOOK — a tap-through 3D tour of the shelf, /projects.
 *
 * Same picture-book language as SPARK (/story): the cat, the spark,
 * iris page turns, word-by-word serif text — but every page is one
 * real project from lib/data. Pages are generated from the projects
 * array, one scene per viz type, so new projects slot in on their own.
 */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { projects, type Project } from "@/lib/data";
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
  addRipples,
  addHorizonGlow,
  addTwinkleStars,
  addAurora,
  addSunRays,
  addCloudBank,
  addFireflies,
  addLights,
  enableShadows,
  dropShadow,
  type Built,
  type Tex,
  type ChapterDef,
} from "./storyKit";

/* ── one world per viz type ─────────────────────────────────────── */

const VIZ_BG: Record<Project["viz"], string> = {
  graph:
    "radial-gradient(90% 55% at 50% 74%, rgba(122,132,255,0.28) 0%, transparent 62%), radial-gradient(60% 38% at 72% 20%, rgba(150,140,255,0.14) 0%, transparent 70%), radial-gradient(135% 105% at 50% 26%, #3d3f75 0%, #23244e 46%, #0c0d26 100%)",
  glass:
    "radial-gradient(88% 52% at 50% 78%, rgba(120,228,228,0.24) 0%, transparent 60%), radial-gradient(55% 36% at 26% 18%, rgba(160,240,240,0.1) 0%, transparent 70%), radial-gradient(135% 105% at 50% 30%, #2a6a74 0%, #14424e 50%, #06222b 100%)",
  cortex:
    "radial-gradient(85% 55% at 50% 76%, rgba(196,140,255,0.26) 0%, transparent 62%), radial-gradient(50% 34% at 74% 22%, rgba(230,170,255,0.12) 0%, transparent 70%), radial-gradient(135% 105% at 44% 42%, #33184c 0%, #1c0d31 52%, #090313 100%)",
  ath:
    "radial-gradient(75% 46% at 50% 16%, rgba(255,255,255,0.85) 0%, transparent 62%), radial-gradient(70% 45% at 50% 88%, rgba(245,180,205,0.35) 0%, transparent 65%), radial-gradient(125% 125% at 50% 40%, #e6f2f2 0%, #f6ecd0 48%, #eed6de 100%)",
  backend:
    "radial-gradient(85% 50% at 50% 80%, rgba(255,232,170,0.55) 0%, transparent 62%), radial-gradient(55% 36% at 22% 16%, rgba(255,246,214,0.4) 0%, transparent 70%), radial-gradient(135% 115% at 50% 20%, #f7e0ab 0%, #eec488 52%, #cfa05c 100%)",
};

/* light worlds read better with dark ink */
const VIZ_DARK: Record<Project["viz"], boolean> = {
  graph: false,
  glass: false,
  cortex: false,
  ath: true,
  backend: true,
};

const VIZ_VIGNETTE: Record<Project["viz"], number> = {
  graph: 0.55,
  glass: 0.5,
  cortex: 0.58,
  ath: 0.12,
  backend: 0.24,
};

const COVER_BG =
  "radial-gradient(55% 42% at 50% 52%, rgba(255,196,120,0.22) 0%, transparent 65%), radial-gradient(125% 95% at 50% 38%, #6a4a33 0%, #43301f 46%, #1e130a 100%)";
const PAPER_BG = "#f5efe2";

/* ── the scenes ─────────────────────────────────────────────────── */

const VIZ_CHAPTERS: Record<Project["viz"], ChapterDef> = {
  /* TGIE — a living transaction graph in the night; one account runs hot */
  graph: {
    cam: [0, 2.3, 8.2],
    look: [0, 2.1, 0],
    build(scene, { halo, soft }) {
      addLights(scene, 0.5, 0.5, 0x8f97d8, 0x14142e);
      scene.fog = new THREE.Fog(0x23244e, 18, 46);
      const ground = new THREE.Mesh(
        new THREE.CircleGeometry(26, 48),
        new THREE.MeshStandardMaterial({ color: 0x191a3c, roughness: 1 })
      );
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);

      /* the graph: a constellation of accounts */
      const net = new THREE.Group();
      const nodePos: THREE.Vector3[] = [];
      for (let i = 0; i < 13; i++) {
        const a = hash(i + 3) * Math.PI * 2;
        const r = 0.9 + hash(i + 23) * 1.9;
        nodePos.push(
          new THREE.Vector3(
            Math.cos(a) * r,
            2.1 + (hash(i + 43) - 0.5) * 2.2,
            Math.sin(a) * r * 0.7
          )
        );
      }
      nodePos.push(new THREE.Vector3(0, 2.4, 0)); // 13 — the mule, dead centre
      const MULE = 13;
      const nodeMat = new THREE.MeshStandardMaterial({
        color: 0xaeb8ff,
        emissive: 0x6a78e8,
        emissiveIntensity: 0.55,
        roughness: 0.25,
        metalness: 0.3,
      });
      for (let i = 0; i < nodePos.length; i++) {
        const isMule = i === MULE;
        const node = new THREE.Mesh(
          new THREE.SphereGeometry(isMule ? 0.16 : 0.07 + hash(i) * 0.05, 12, 10),
          isMule
            ? new THREE.MeshStandardMaterial({
                color: 0xff7a50,
                emissive: 0xff5a2a,
                emissiveIntensity: 1.4,
                roughness: 0.3,
              })
            : nodeMat
        );
        node.position.copy(nodePos[i]);
        net.add(node);
        if (isMule) {
          const glow = new THREE.Sprite(
            new THREE.SpriteMaterial({
              map: halo,
              color: 0xff8a5a,
              transparent: true,
              opacity: 0.85,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
            })
          );
          glow.scale.setScalar(1.5);
          glow.position.copy(nodePos[i]);
          net.add(glow);
          net.userData.muleGlow = glow;
        }
      }
      /* edges: every account feeds the mule, plus a few side deals */
      const pairs: [number, number][] = [];
      for (let i = 0; i < 13; i++) if (hash(i + 7) > 0.25) pairs.push([i, MULE]);
      for (let i = 0; i < 6; i++)
        pairs.push([Math.floor(hash(i + 91) * 13), Math.floor(hash(i + 191) * 13)]);
      const ep = new Float32Array(pairs.length * 6);
      pairs.forEach(([a, b], i) => {
        nodePos[a].toArray(ep, i * 6);
        nodePos[b].toArray(ep, i * 6 + 3);
      });
      const edgeGeo = new THREE.BufferGeometry();
      edgeGeo.setAttribute("position", new THREE.BufferAttribute(ep, 3));
      const edges = new THREE.LineSegments(
        edgeGeo,
        new THREE.LineBasicMaterial({
          color: 0x8a96e8,
          transparent: true,
          opacity: 0.3,
          blending: THREE.AdditiveBlending,
        })
      );
      net.add(edges);
      scene.add(net);
      addHorizonGlow(scene, halo, 0x6a78e8, [0, 1.6, -15], 17, 0.5);
      addRipples(scene, 0x8a96e8, 0.1);
      // the data plane: a fine polar grid the graph hovers over
      const grid = new THREE.Group();
      const gridMat = new THREE.LineBasicMaterial({
        color: 0x7a86e0,
        transparent: true,
        opacity: 0.16,
      });
      for (let r = 1.6; r <= 8; r += 1.6) {
        const pts: THREE.Vector3[] = [];
        for (let a = 0; a <= 64; a++)
          pts.push(new THREE.Vector3(Math.cos((a / 64) * Math.PI * 2) * r, 0.03, Math.sin((a / 64) * Math.PI * 2) * r));
        grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
      }
      for (let a = 0; a < 12; a++) {
        const dir = (a / 12) * Math.PI * 2;
        grid.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(Math.cos(dir) * 1.6, 0.03, Math.sin(dir) * 1.6),
              new THREE.Vector3(Math.cos(dir) * 8, 0.03, Math.sin(dir) * 8),
            ]),
            gridMat
          )
        );
      }
      scene.add(grid);
      const stars = addTwinkleStars(scene, soft, { color: 0xdae0ff, count: 260 });
      const aurora = addAurora(scene, halo, [0x7a6ae8, 0x4a8ae0, 0xb06ae0], { y: 10, opacity: 0.14 });

      /* payments sliding along the wires into the mule */
      const pulses: { s: THREE.Sprite; pair: [number, number]; ph: number; sp: number }[] = [];
      for (let i = 0; i < 7; i++) {
        const s = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: halo,
            color: 0xd8e0ff,
            transparent: true,
            opacity: 0.9,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          })
        );
        s.scale.setScalar(0.3);
        scene.add(s);
        pulses.push({
          s,
          pair: pairs[Math.floor(hash(i + 55) * pairs.length)],
          ph: hash(i + 65),
          sp: 0.25 + hash(i + 75) * 0.3,
        });
      }

      /* alert rings rippling out under the hot account */
      const rings: THREE.Mesh[] = [];
      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.96, 1.02, 64),
          new THREE.MeshBasicMaterial({
            color: 0xff9a70,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.02;
        scene.add(ring);
        rings.push(ring);
      }

      const cat = makeCat(1.15);
      cat.position.set(-2.5, 0, 2.3);
      cat.rotation.y = 0.55;
      cat.rotation.x = -0.22;
      scene.add(cat);
      const catShadow = dropShadow(soft, 0.5, 0.4);
      catShadow.position.set(-2.5, 0.02, 2.3);
      scene.add(catShadow);
      const spark = makeSpark(halo, 1.2);
      spark.position.set(-1.7, 1.6, 2.0);
      scene.add(spark);

      const v = new THREE.Vector3();
      return {
        tick(t, dt) {
          net.rotation.y = t * 0.1;
          const muleGlow = net.userData.muleGlow as THREE.Sprite;
          muleGlow.material.opacity = 0.6 + Math.sin(t * 3.2) * 0.3;
          muleGlow.scale.setScalar(1.3 + Math.sin(t * 3.2) * 0.25);
          for (const p of pulses) {
            const k = (t * p.sp + p.ph) % 1;
            v.lerpVectors(nodePos[p.pair[0]], nodePos[p.pair[1]], k);
            v.applyAxisAngle(new THREE.Vector3(0, 1, 0), net.rotation.y);
            p.s.position.copy(v);
            p.s.material.opacity = Math.sin(k * Math.PI) * 0.9;
          }
          rings.forEach((r, i) => {
            const life = (t * 0.3 + i / 3) % 1;
            r.scale.setScalar(0.4 + life * 6);
            (r.material as THREE.MeshBasicMaterial).opacity = (1 - life) * 0.4;
          });
          spark.position.y = 1.6 + Math.sin(t * 1.4) * 0.14;
          spark.userData.glow.material.opacity = 0.75 + Math.sin(t * 1.9) * 0.2;
          catIdle(cat, t, 2);
          stars.tick(t, dt);
          aurora.tick(t, dt);
          grid.rotation.y = t * 0.02;
        },
      };
    },
  },

  /* Lumen Glass — bytes crystallising inside a slab of virtual glass */
  glass: {
    cam: [0, 2.2, 7.6],
    look: [0, 1.9, 0],
    build(scene, { halo, soft, beam }) {
      addLights(scene, 0.7, 0.55, 0xbde8ee, 0x0d3038);
      scene.fog = new THREE.Fog(0x14424e, 16, 44);
      const ground = new THREE.Mesh(
        new THREE.CircleGeometry(26, 48),
        new THREE.MeshStandardMaterial({ color: 0x0e343d, roughness: 1 })
      );
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);

      const rig = new THREE.Group();
      /* the glass tablet */
      const slab = new THREE.Mesh(
        new THREE.BoxGeometry(2.7, 1.7, 0.55),
        new THREE.MeshPhysicalMaterial({
          color: 0xd8f4f6,
          transmission: 0.92,
          thickness: 0.8,
          ior: 1.45,
          roughness: 0.08,
          transparent: true,
          opacity: 1,
        })
      );
      const slabEdges = new THREE.LineSegments(
        new THREE.EdgesGeometry(slab.geometry as THREE.BoxGeometry),
        new THREE.LineBasicMaterial({ color: 0xbdf0f4, transparent: true, opacity: 0.5 })
      );
      slab.add(slabEdges);
      rig.add(slab);

      /* voxel planes inside — data lighting up layer by layer */
      const NX = 9,
        NY = 5,
        NZ = 2;
      const vox = new THREE.InstancedMesh(
        new THREE.BoxGeometry(0.13, 0.13, 0.13),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.9 }),
        NX * NY * NZ
      );
      const dummy = new THREE.Object3D();
      let vi = 0;
      for (let x = 0; x < NX; x++)
        for (let y = 0; y < NY; y++)
          for (let z = 0; z < NZ; z++) {
            dummy.position.set((x - (NX - 1) / 2) * 0.27, (y - (NY - 1) / 2) * 0.29, (z - 0.5) * 0.24);
            dummy.updateMatrix();
            vox.setMatrixAt(vi, dummy.matrix);
            vox.setColorAt(vi, new THREE.Color(0x0d3d46));
            vi++;
          }
      rig.add(vox);
      rig.position.set(0, 2.0, -0.4);
      scene.add(rig);
      addHorizonGlow(scene, halo, 0x5fc4c8, [0, 1.4, -15], 15, 0.5);
      addRipples(scene, 0x9fd8dc, 0.12);
      const stars = addTwinkleStars(scene, soft, { color: 0xbdf0f4, count: 170, size: 0.08 });
      const sheen = addAurora(scene, halo, [0x4ac8c8, 0x62dce0], { y: 8, opacity: 0.12 });
      const plankton = addFireflies(scene, soft, { color: 0x9df0e8, count: 20, spread: 16, yMax: 5, size: 0.11 });

      const slabShadow = dropShadow(soft, 2.0, 0.35);
      slabShadow.position.set(0, 0.02, -0.4);
      scene.add(slabShadow);

      /* ice shards grown around the rig, catching the env light */
      const shardMat = new THREE.MeshPhysicalMaterial({
        color: 0xbfeef0,
        transmission: 0.75,
        thickness: 0.4,
        roughness: 0.2,
        transparent: true,
      });
      for (let i = 0; i < 9; i++) {
        const shard = new THREE.Mesh(
          new THREE.ConeGeometry(0.1 + hash(i + 5) * 0.16, 0.5 + hash(i + 15) * 1.1, 5),
          shardMat
        );
        const a = hash(i + 25) * Math.PI * 2;
        const r = 2.4 + hash(i + 35) * 2.6;
        shard.position.set(Math.cos(a) * r, 0.2, Math.sin(a) * r * 0.7 - 0.5);
        shard.rotation.z = (hash(i + 45) - 0.5) * 0.4;
        scene.add(shard);
      }

      /* the writing laser: a beam sweeping the slab */
      const shaft = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5, 6),
        new THREE.MeshBasicMaterial({
          map: beam,
          color: 0xc0f4e8,
          transparent: true,
          opacity: 0.2,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
        })
      );
      shaft.position.set(0, 4.6, -0.4);
      scene.add(shaft);

      // drifting motes
      const moteGeo = new THREE.BufferGeometry();
      const mp = new Float32Array(50 * 3);
      for (let i = 0; i < 50; i++) {
        mp[i * 3] = (hash(i) - 0.5) * 12;
        mp[i * 3 + 1] = hash(i + 30) * 5;
        mp[i * 3 + 2] = (hash(i + 60) - 0.5) * 8;
      }
      moteGeo.setAttribute("position", new THREE.BufferAttribute(mp, 3));
      const motes = new THREE.Points(
        moteGeo,
        new THREE.PointsMaterial({
          map: soft,
          color: 0xbfeef0,
          size: 0.08,
          transparent: true,
          opacity: 0.6,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      );
      scene.add(motes);

      const cat = makeCat(1.15);
      cat.position.set(2.4, 0, 1.9);
      cat.rotation.y = -0.75;
      cat.rotation.x = -0.14;
      scene.add(cat);
      const catShadow = dropShadow(soft, 0.5, 0.4);
      catShadow.position.set(2.4, 0.02, 1.9);
      scene.add(catShadow);
      const spark = makeSpark(halo, 1.2);
      spark.position.set(1.6, 1.7, 1.6);
      scene.add(spark);

      const col = new THREE.Color();
      const litCol = new THREE.Color(0x8ef0e8);
      const dimCol = new THREE.Color(0x0d3d46);
      return {
        tick(t, dt) {
          rig.rotation.y = Math.sin(t * 0.4) * 0.35;
          /* crystallisation wave: voxels glow column by column */
          let i = 0;
          for (let x = 0; x < NX; x++)
            for (let y = 0; y < NY; y++)
              for (let z = 0; z < NZ; z++) {
                const w = Math.max(0, Math.sin(t * 1.6 - x * 0.55 - y * 0.2 + z));
                vox.setColorAt(i, col.copy(dimCol).lerp(litCol, Math.pow(w, 3)));
                i++;
              }
          vox.instanceColor!.needsUpdate = true;
          shaft.position.x = Math.sin(t * 0.8) * 1.1;
          shaft.material.opacity = 0.14 + Math.sin(t * 1.6) * 0.06;
          motes.rotation.y = t * 0.03;
          spark.position.y = 1.7 + Math.sin(t * 1.3) * 0.15;
          spark.userData.glow.material.opacity = 0.75 + Math.sin(t * 2.0) * 0.2;
          catIdle(cat, t, 3);
          stars.tick(t, dt);
          sheen.tick(t, dt);
          plankton.tick(t, dt);
        },
      };
    },
  },

  /* PRL / CORTEX — a lifetime orbiting a warm core, queryable */
  cortex: {
    cam: [0, 2.5, 8.4],
    look: [0, 2.2, 0],
    build(scene, { halo, soft }) {
      addLights(scene, 0.35, 0.4, 0x9a70c8, 0x140a24);
      scene.fog = new THREE.Fog(0x1c0d31, 16, 42);
      const ground = new THREE.Mesh(
        new THREE.CircleGeometry(26, 48),
        new THREE.MeshStandardMaterial({ color: 0x241338, roughness: 1 })
      );
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);

      /* the core: everything you were, still warm */
      const core = new THREE.Group();
      const heart = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 24, 18),
        new THREE.MeshBasicMaterial({ color: 0xe8d4ff })
      );
      const coreGlow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: halo,
          color: 0xc8a8ff,
          transparent: true,
          opacity: 0.8,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      );
      coreGlow.scale.setScalar(3.4);
      const coreLight = new THREE.PointLight(0xc09aff, 2.6, 9, 1.7);
      core.add(heart, coreGlow, coreLight);
      const gyros: THREE.Mesh[] = [];
      for (const tilt of [0.4, -0.8, 1.3]) {
        const g = new THREE.Mesh(
          new THREE.TorusGeometry(0.75 + gyros.length * 0.14, 0.012, 8, 60),
          new THREE.MeshBasicMaterial({
            color: 0xd8bcff,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        );
        g.rotation.x = tilt;
        core.add(g);
        gyros.push(g);
      }
      core.position.set(0, 2.6, -0.5);
      scene.add(core);
      // a still, dark mirror pool under the mind — catches the core's light
      const pool = new THREE.Mesh(
        new THREE.CircleGeometry(3.4, 56),
        new THREE.MeshStandardMaterial({
          color: 0x2a1544,
          roughness: 0.12,
          metalness: 0.85,
        })
      );
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(0, 0.02, -0.5);
      scene.add(pool);
      addHorizonGlow(scene, halo, 0x9a70d8, [0, 1.8, -14], 16, 0.5);
      addRipples(scene, 0xc8a8ff, 0.1);
      const stars = addTwinkleStars(scene, soft, { color: 0xe8d8ff, count: 320, size: 0.09 });
      const nebula = addAurora(scene, halo, [0xb06ae0, 0x7a4ae0, 0xe06ab8], { y: 9, opacity: 0.17 });

      /* memories: pale pages circling the core */
      const panes: { s: THREE.Sprite; r: number; y: number; ph: number; sp: number }[] = [];
      for (let i = 0; i < 9; i++) {
        const s = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: soft,
            color: 0xefe2ff,
            transparent: true,
            opacity: 0.55,
            depthWrite: false,
          })
        );
        s.scale.set(0.5, 0.36, 1);
        scene.add(s);
        panes.push({
          s,
          r: 1.5 + hash(i + 9) * 1.3,
          y: 1.7 + hash(i + 19) * 2.0,
          ph: hash(i + 29) * Math.PI * 2,
          sp: 0.16 + hash(i + 39) * 0.18,
        });
      }

      /* the timeline: a spiral of little lights climbing into the core */
      const trailGeo = new THREE.BufferGeometry();
      const N = 70;
      const tp = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const k = i / N;
        const a = k * Math.PI * 5;
        const r = 4.4 - k * 3.9;
        tp[i * 3] = Math.cos(a) * r;
        tp[i * 3 + 1] = 0.15 + k * 2.4;
        tp[i * 3 + 2] = Math.sin(a) * r * 0.7 - 0.5;
      }
      trailGeo.setAttribute("position", new THREE.BufferAttribute(tp, 3));
      const trail = new THREE.Points(
        trailGeo,
        new THREE.PointsMaterial({
          map: soft,
          color: 0xcdaef8,
          size: 0.12,
          transparent: true,
          opacity: 0.7,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      );
      scene.add(trail);

      const cat = makeCat(1.15);
      cat.position.set(-2.2, 0, 2.4);
      cat.rotation.y = 0.6;
      cat.rotation.x = -0.2;
      scene.add(cat);
      const catShadow = dropShadow(soft, 0.5, 0.45);
      catShadow.position.set(-2.2, 0.02, 2.4);
      scene.add(catShadow);
      const spark = makeSpark(halo, 1.1);
      spark.position.set(-1.5, 1.5, 2.1);
      scene.add(spark);

      return {
        tick(t, dt) {
          heart.scale.setScalar(1 + Math.sin(t * 1.2) * 0.06);
          coreGlow.material.opacity = 0.65 + Math.sin(t * 1.2) * 0.2;
          gyros.forEach((g, i) => {
            g.rotation.z = t * (0.3 + i * 0.16) * (i % 2 ? -1 : 1);
          });
          for (const p of panes) {
            const a = t * p.sp + p.ph;
            p.s.position.set(
              core.position.x + Math.cos(a) * p.r,
              p.y + Math.sin(t * 0.7 + p.ph) * 0.15,
              core.position.z + Math.sin(a) * p.r * 0.7
            );
            p.s.material.opacity = 0.35 + Math.sin(a * 2) * 0.2;
          }
          trail.rotation.y = t * 0.12;
          (trail.material as THREE.PointsMaterial).opacity = 0.55 + Math.sin(t * 1.5) * 0.2;
          spark.position.y = 1.5 + Math.sin(t * 1.4) * 0.13;
          spark.userData.glow.material.opacity = 0.75 + Math.sin(t * 2.1) * 0.2;
          catIdle(cat, t, 4);
          stars.tick(t, dt);
          nebula.tick(t, dt);
        },
      };
    },
  },

  /* ATH — a calm dial for the mind; three modes circling a quiet ring */
  ath: {
    cam: [0, 2.4, 8.0],
    look: [0, 2.2, 0],
    build(scene, { halo, soft, beam }) {
      addLights(scene, 0.95, 0.9, 0xffffff, 0xd8c8c0);
      scene.fog = new THREE.Fog(0xf0e6d6, 18, 48);
      const ground = new THREE.Mesh(
        new THREE.CircleGeometry(28, 48),
        new THREE.MeshStandardMaterial({ color: 0xe8dcc4, roughness: 1 })
      );
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);

      /* the dial: a standing ring, the interface at rest */
      const dial = new THREE.Group();
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.45, 0.05, 16, 96),
        new THREE.MeshStandardMaterial({ color: 0x6a6280, roughness: 0.12, metalness: 0.92 })
      );
      const inner = new THREE.Mesh(
        new THREE.CircleGeometry(1.38, 48),
        new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transmission: 0.85,
          thickness: 0.15,
          roughness: 0.25,
          transparent: true,
          side: THREE.DoubleSide,
        })
      );
      const ticks = new THREE.Group();
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const tick = new THREE.Mesh(
          new THREE.BoxGeometry(0.02, 0.12, 0.02),
          new THREE.MeshBasicMaterial({ color: 0x8a7f96 })
        );
        tick.position.set(Math.cos(a) * 1.28, Math.sin(a) * 1.28, 0);
        tick.rotation.z = a + Math.PI / 2;
        ticks.add(tick);
      }
      dial.add(ring, inner, ticks);
      dial.position.set(0, 2.35, -0.8);
      scene.add(dial);
      addHorizonGlow(scene, halo, 0xffe8c8, [7, 3.2, -18], 10, 0.22);
      addRipples(scene, 0x9a8fb8, 0.16);
      const clouds = addCloudBank(scene, soft, { color: 0xffffff, count: 6, y: 6.5, opacity: 0.5, speed: 0.14 });
      const rays = addSunRays(scene, beam, { color: 0xfff6dc, pos: [-7.5, 10, -17], count: 4, length: 10, opacity: 0.045 });
      const dialShadow = dropShadow(soft, 1.7, 0.2);
      dialShadow.position.set(0, 0.02, -0.8);
      scene.add(dialShadow);

      /* the three modes: focus, explore, untangle */
      const modes: { g: THREE.Group; ph: number }[] = [];
      for (const [i, c] of [0xf59db8, 0x8fd8a5, 0x8fcbe0].entries()) {
        const g = new THREE.Group();
        const orb = new THREE.Mesh(
          new THREE.SphereGeometry(0.14, 14, 12),
          new THREE.MeshStandardMaterial({
            color: c,
            roughness: 0.6,
            emissive: c,
            emissiveIntensity: 0.5,
          })
        );
        const glow = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: halo,
            color: c,
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          })
        );
        glow.scale.setScalar(0.9);
        g.add(orb, glow);
        scene.add(g);
        modes.push({ g, ph: (i / 3) * Math.PI * 2 });
      }

      /* stray thoughts, drifting up and dissolving */
      const puffs: THREE.Sprite[] = [];
      for (let i = 0; i < 8; i++) {
        const p = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: soft,
            color: 0xffffff,
            transparent: true,
            opacity: 0.4,
            depthWrite: false,
          })
        );
        p.position.set((hash(i + 4) - 0.5) * 9, hash(i + 14) * 4, -2 - hash(i + 24) * 4);
        p.scale.setScalar(0.7 + hash(i + 34) * 1.2);
        scene.add(p);
        puffs.push(p);
      }

      const cat = makeCat(1.2);
      cat.position.set(-2.3, 0, 2.2);
      cat.rotation.y = 0.5;
      cat.rotation.x = -0.18;
      scene.add(cat);
      const catShadow = dropShadow(soft, 0.55, 0.25);
      catShadow.position.set(-2.3, 0.02, 2.2);
      scene.add(catShadow);
      const spark = makeSpark(halo, 1.2);
      scene.add(spark);

      return {
        tick(t, dt) {
          dial.rotation.z = t * 0.08;
          modes.forEach((m, i) => {
            const a = t * (0.5 + i * 0.09) + m.ph;
            m.g.position.set(
              dial.position.x + Math.cos(a) * 1.45,
              dial.position.y + Math.sin(a) * 1.45,
              dial.position.z + Math.sin(a * 2) * 0.14
            );
          });
          /* the spark threads the ring in a slow figure-eight */
          spark.position.set(
            Math.sin(t * 0.55) * 0.9,
            2.35 + Math.sin(t * 1.1) * 0.75,
            -0.8 + Math.cos(t * 0.55) * 0.9
          );
          spark.userData.glow.material.opacity = 0.75 + Math.sin(t * 2.2) * 0.2;
          for (const p of puffs) {
            p.position.y += dt * 0.25;
            if (p.position.y > 5) p.position.y = 0;
            p.material.opacity = 0.4 * Math.sin((p.position.y / 5) * Math.PI);
          }
          catIdle(cat, t, 5);
          clouds.tick(t, dt);
          rays.tick(t, dt);
        },
      };
    },
  },

  /* Café & Backend Lab — orders glowing their way through the kitchen */
  backend: {
    cam: [0, 2.6, 8.6],
    look: [0, 1.6, 0],
    build(scene, { halo, soft, beam }) {
      addLights(scene, 1.05, 0.7, 0xfff2d0, 0xa0763c);
      scene.fog = new THREE.Fog(0xeec488, 16, 46);
      const ground = new THREE.Mesh(
        new THREE.CircleGeometry(28, 48),
        new THREE.MeshStandardMaterial({ color: 0xe2bd7e, roughness: 1 })
      );
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);

      const wood = new THREE.MeshStandardMaterial({ color: 0x8a5a34, roughness: 0.85 });
      const woodLight = new THREE.MeshStandardMaterial({ color: 0xa9744a, roughness: 0.85 });
      const cream = new THREE.MeshStandardMaterial({ color: 0xf6eede, roughness: 0.8 });

      /* the counter, heart of the café */
      const counter = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.75, 1.0), wood);
      base.position.y = 0.375;
      const slab = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.09, 1.15), woodLight);
      slab.position.y = 0.8;
      counter.add(base, slab);
      /* espresso machine */
      const machine = new THREE.Group();
      const mBody = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.42, 0.5), cream);
      mBody.position.y = 1.06;
      const mTop = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.4), wood);
      mTop.position.y = 1.32;
      machine.add(mBody, mTop);
      machine.position.x = -0.75;
      counter.add(machine);
      /* the cup */
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.085, 0.17, 14), cream);
      cup.position.set(0.35, 0.93, 0.15);
      counter.add(cup);
      counter.position.set(0.4, 0, -0.3);
      scene.add(counter);

      /* pendant lamps hanging over the counter, warm and glowing */
      const lampGlows: THREE.Sprite[] = [];
      for (const [lx, lz] of [
        [-0.4, -0.4],
        [0.75, -0.5],
        [1.9, -0.3],
      ] as const) {
        const cord = new THREE.Mesh(
          new THREE.CylinderGeometry(0.012, 0.012, 2.2, 6),
          new THREE.MeshStandardMaterial({ color: 0x4a3320, roughness: 0.9 })
        );
        cord.position.set(lx, 3.5, lz);
        scene.add(cord);
        const shade = new THREE.Mesh(
          new THREE.ConeGeometry(0.16, 0.18, 18, 1, true),
          new THREE.MeshStandardMaterial({
            color: 0x8a5a34,
            roughness: 0.6,
            metalness: 0.3,
            side: THREE.DoubleSide,
          })
        );
        shade.position.set(lx, 2.4, lz);
        scene.add(shade);
        const bulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 12, 10),
          new THREE.MeshBasicMaterial({ color: 0xffe2a8 })
        );
        bulb.position.set(lx, 2.33, lz);
        scene.add(bulb);
        const lampGlow = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: halo,
            color: 0xffd9a0,
            transparent: true,
            opacity: 0.6,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          })
        );
        lampGlow.position.set(lx, 2.33, lz);
        lampGlow.scale.setScalar(0.9);
        scene.add(lampGlow);
        lampGlows.push(lampGlow);
        const pt = new THREE.PointLight(0xffd9a0, 1.6, 4, 1.8);
        pt.position.set(lx, 2.3, lz);
        scene.add(pt);
      }
      addHorizonGlow(scene, halo, 0xffd9a0, [0, 1.6, -16], 17, 0.5);
      addRipples(scene, 0xb0813e, 0.18);
      const clouds = addCloudBank(scene, soft, { color: 0xfff0d4, count: 5, y: 6, opacity: 0.42, speed: 0.1 });
      const rays = addSunRays(scene, beam, { color: 0xffdf9e, pos: [-4, 8.5, -15], count: 5, length: 11, opacity: 0.09 });
      const flies = addFireflies(scene, soft, { color: 0xffe2a0, count: 14, spread: 13, yMax: 3 });

      /* steam over the cup */
      const steam: THREE.Sprite[] = [];
      for (let i = 0; i < 4; i++) {
        const s = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: soft,
            color: 0xffffff,
            transparent: true,
            opacity: 0.4,
            depthWrite: false,
          })
        );
        s.scale.setScalar(0.22);
        scene.add(s);
        steam.push(s);
      }

      /* the order pipeline: client → API → kitchen, as little kiosks */
      const stations: THREE.Vector3[] = [
        new THREE.Vector3(-3.6, 0.9, 0.8),
        new THREE.Vector3(-2.0, 1.5, -0.9),
        new THREE.Vector3(0.4, 1.15, -0.75),
        new THREE.Vector3(2.6, 0.9, 0.3),
      ];
      for (const [i, p] of stations.entries()) {
        if (i === 2) continue; // the counter already stands there
        const kiosk = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), i === 3 ? woodLight : wood);
        kiosk.position.set(p.x, 0.25, p.z);
        scene.add(kiosk);
        const lamp = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 10, 8),
          new THREE.MeshBasicMaterial({ color: 0xffd9a0 })
        );
        lamp.position.set(p.x, 0.58, p.z);
        scene.add(lamp);
      }
      const route = new THREE.CatmullRomCurve3(stations);
      /* faint route line so the flow reads */
      const routeGeo = new THREE.BufferGeometry().setFromPoints(route.getPoints(60));
      const routeLine = new THREE.Line(
        routeGeo,
        new THREE.LineBasicMaterial({ color: 0xb0813e, transparent: true, opacity: 0.5 })
      );
      scene.add(routeLine);

      /* the orders themselves: warm dots riding the pipeline */
      const orders: { s: THREE.Sprite; ph: number }[] = [];
      for (let i = 0; i < 6; i++) {
        const s = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: halo,
            color: 0xffdf9e,
            transparent: true,
            opacity: 0.95,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          })
        );
        s.scale.setScalar(0.34);
        scene.add(s);
        orders.push({ s, ph: i / 6 });
      }

      const cat = makeCat(1.15);
      cat.position.set(1.35, 0.84, -0.35);
      cat.rotation.y = -0.35;
      scene.add(cat); // barista on duty, up on the counter
      const spark = makeSpark(halo, 1.1);
      spark.position.set(0.75, 1.75, -0.15);
      scene.add(spark);

      return {
        tick(t, dt) {
          for (const o of orders) {
            const k = (t * 0.09 + o.ph) % 1;
            o.s.position.copy(route.getPoint(k));
            o.s.material.opacity = Math.sin(k * Math.PI) * 0.95;
          }
          steam.forEach((s, i) => {
            const k = (t * 0.3 + i / 4) % 1;
            s.position.set(
              0.75 + Math.sin(k * 7 + i) * 0.05,
              1.05 + k * 0.8,
              -0.15 + Math.cos(k * 5) * 0.04
            );
            s.material.opacity = Math.sin(k * Math.PI) * 0.4;
            s.scale.setScalar(0.16 + k * 0.3);
          });
          spark.position.y = 1.75 + Math.sin(t * 1.3) * 0.12;
          spark.userData.glow.material.opacity = 0.75 + Math.sin(t * 2.0) * 0.2;
          catIdle(cat, t, 6);
          lampGlows.forEach((g, i) => {
            g.material.opacity = 0.5 + Math.sin(t * 1.7 + i * 2.1) * 0.15;
          });
          clouds.tick(t, dt);
          rays.tick(t, dt);
          flies.tick(t, dt);
        },
      };
    },
  },
};

/* cover — the closed PROJECTS tome in a lamplit study */
const COVER: ChapterDef = {
  cam: [0.3, 2.35, 5.6],
  look: [0, 0.5, 0],
  build(scene, { halo, soft }) {
    addLights(scene, 1.0, 0.5, 0xf2dcc4, 0x3a2414);
    const warm = new THREE.PointLight(0xffe2a8, 2.8, 9, 1.6);
    warm.position.set(0, 2.4, 1.4);
    scene.add(warm);

    const book = makeBook(halo, "PROJECTS", "the things I build", { emblem: false });
    book.rotation.y = 0.45;
    book.position.y = 0.62;
    scene.add(book);

    const shadow = dropShadow(soft, 2.2, 0.4);
    shadow.position.y = -0.32;
    scene.add(shadow);
    const haloRing = new THREE.Mesh(
      new THREE.RingGeometry(2.35, 2.5, 72),
      new THREE.MeshBasicMaterial({
        color: 0xe8c89a,
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
};

const END: ChapterDef = {
  cam: [0, 0, 6],
  look: [0, 0, 0],
  build() {
    return { tick() {} };
  },
};

/* ── assembled book ─────────────────────────────────────────────── */

const CHAPTERS: ChapterDef[] = [COVER, ...projects.map((p) => VIZ_CHAPTERS[p.viz]), END];
const PAGE_BG = [COVER_BG, ...projects.map((p) => VIZ_BG[p.viz]), PAPER_BG];
const VIGNETTE = [0.5, ...projects.map((p) => VIZ_VIGNETTE[p.viz]), 0];
const LAST = CHAPTERS.length - 1;

const WORD_MS = 45;
const descWords = (p: Project) => p.description.split(" ").length;

export default function ProjectBook() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [veil, setVeil] = useState(true);
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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const env = applyEnvironment(renderer, scene, 0.5);
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
      enableShadows(scene);
    };
    setChapter(0);
    const arrive = setTimeout(() => setVeil(false), 600);

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
      // each page settles in: the camera glides the last step forward
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
        clearTimeout(arrive);
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
    const words = idx >= 1 && idx < LAST ? descWords(projects[idx - 1]) : 0;
    const t = setTimeout(() => setDotReady(true), idx === 0 ? 1400 : 900 + words * WORD_MS);
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

  const project = idx >= 1 && idx < LAST ? projects[idx - 1] : null;
  const dark = project ? VIZ_DARK[project.viz] : idx === LAST;
  const textColor = dark ? "#4a3416" : "#f6efdd";
  let wordDelay = 0;

  return (
    <div
      className="fixed inset-0 select-none overflow-hidden"
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("a")) return;
        advance();
      }}
      style={{ cursor: idx < LAST ? "pointer" : "auto", background: "#1e130a" }}
    >
      {/* stacked gradient worlds — the active one fades in */}
      {PAGE_BG.map((bg, i) => (
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
          style={{ fontFamily: SERIF, color: textColor, opacity: 0.9 }}
        >
          THE PROJECT BOOK ✦
        </span>
        <Link
          href="/#projects"
          className="rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] transition-opacity hover:opacity-70"
          style={{ color: textColor, borderColor: `${dark ? "#4a3416" : "#f6efdd"}44` }}
        >
          back to the site →
        </Link>
      </div>

      {/* cover title */}
      {idx === 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-[13vh] z-20 text-center">
          <h1
            className="text-5xl font-semibold tracking-[0.18em] sm:text-7xl"
            style={{ fontFamily: SERIF, color: "#f4e0b8", textShadow: "0 2px 30px rgba(242,206,138,0.35)" }}
          >
            PROJECTS
          </h1>
          <p className="mt-3 text-lg italic" style={{ fontFamily: SERIF, color: "#dcc09a" }}>
            {projects.length} builds from the Isle of Jay — the cat will show you around
          </p>
        </div>
      )}

      {/* cover hint */}
      {idx === 0 && dotReady && (
        <p
          className="projbook-hint pointer-events-none absolute inset-x-0 top-[82vh] z-20 text-center text-sm italic"
          style={{ fontFamily: SERIF, color: "#dcc09a" }}
        >
          tap the book
        </p>
      )}

      {/* one project per page */}
      {project && (
        <div key={idx} className="pointer-events-none absolute inset-x-0 top-[13vh] z-20 mx-auto max-w-2xl px-8 text-center">
          <p
            className="projbook-rise font-mono text-[11px] uppercase tracking-[0.3em]"
            style={{ color: textColor, opacity: 0.7 }}
          >
            project {project.index}
          </p>
          <h2
            className="projbook-rise mt-2 text-4xl font-semibold sm:text-5xl"
            style={{
              fontFamily: SERIF,
              color: textColor,
              animationDelay: "120ms",
              textShadow: dark ? "none" : "0 1px 16px rgba(0,0,0,0.35)",
            }}
          >
            {project.name}
          </h2>
          <p
            className="projbook-rise mt-2 text-xl italic sm:text-2xl"
            style={{ fontFamily: SERIF, color: textColor, opacity: 0.85, animationDelay: "260ms" }}
          >
            {project.tagline}
          </p>
          <p
            className="mt-5 text-base leading-relaxed sm:text-lg"
            style={{
              fontFamily: SERIF,
              color: textColor,
              textShadow: dark ? "none" : "0 1px 12px rgba(0,0,0,0.35)",
            }}
          >
            {project.description.split(" ").map((w, wi) => {
              wordDelay += WORD_MS;
              return (
                <span key={wi} className="projbook-word" style={{ animationDelay: `${450 + wordDelay}ms` }}>
                  {w}{" "}
                </span>
              );
            })}
          </p>
          <div
            className="projbook-rise mt-6 flex flex-wrap items-center justify-center gap-2"
            style={{ animationDelay: `${700 + descWords(project) * WORD_MS}ms` }}
          >
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em]"
                style={{ color: textColor, borderColor: `${dark ? "#4a3416" : "#f6efdd"}55`, opacity: 0.85 }}
              >
                {tag}
              </span>
            ))}
            <a
              href="https://github.com/BYTEJAYS"
              target="_blank"
              rel="noreferrer"
              className="pointer-events-auto rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-opacity hover:opacity-70"
              style={{
                color: dark ? "#f6efdd" : "#1e130a",
                background: dark ? "#4a3416" : "#f6efdd",
                borderColor: "transparent",
              }}
            >
              GitHub ↗
            </a>
          </div>
        </div>
      )}

      {/* the next-dot */}
      {dotReady && idx >= 1 && idx < LAST && (
        <button
          type="button"
          aria-label="next page"
          onPointerDown={advance}
          className="projbook-dot absolute left-1/2 top-[78vh] z-30 -translate-x-1/2"
          style={{ ["--dot" as string]: dark ? "#4a3416" : "#f8f0da" }}
        />
      )}

      {/* page number */}
      {idx >= 1 && idx < LAST && (
        <p
          className="absolute inset-x-0 bottom-6 z-20 text-center font-mono text-[11px] tracking-[0.3em]"
          style={{ color: `${dark ? "#4a3416" : "#f6efdd"}88` }}
        >
          - {String(idx).padStart(2, "0")} / {String(LAST - 1).padStart(2, "0")} -
        </p>
      )}

      {/* the last page: the shelf keeps growing */}
      {idx === LAST && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-8 text-center">
          <p className="text-3xl" style={{ fontFamily: SERIF, color: "#c9a14e" }}>
            ✦
          </p>
          <p
            className="mt-6 max-w-md text-xl leading-relaxed text-[#3a2f1e] sm:text-2xl"
            style={{ fontFamily: SERIF }}
          >
            That&apos;s the shelf — for now.
            <br />
            Every one of these started as a &ldquo;what if?&rdquo;
            <br />
            The book keeps getting thicker.
          </p>
          <p className="mt-6 text-base italic text-[#8a7a5c]" style={{ fontFamily: SERIF }}>
            — Jay &amp; the cat
          </p>
          <div className="pointer-events-auto mt-12 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full border border-[#3a2f1e44] px-5 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#3a2f1e] transition-colors hover:bg-[#3a2f1e] hover:text-[#f5efe2]"
            >
              read again ↺
            </button>
            <a
              href="https://github.com/BYTEJAYS"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[#3a2f1e44] px-5 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#3a2f1e] transition-colors hover:bg-[#3a2f1e] hover:text-[#f5efe2]"
            >
              see the code ↗
            </a>
            <Link
              href="/#projects"
              className="rounded-full bg-[#3a2f1e] px-5 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#f5efe2] transition-opacity hover:opacity-80"
            >
              back to the site →
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
        .projbook-word {
          display: inline-block;
          opacity: 0;
          animation: projbookWord 0.7s ease-out forwards;
          white-space: pre;
        }
        @keyframes projbookWord {
          from { opacity: 0; transform: translateY(10px); filter: blur(8px); }
          60% { filter: blur(2px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .projbook-rise {
          opacity: 0;
          animation: projbookRise 0.9s ease-out forwards;
        }
        @keyframes projbookRise {
          from { opacity: 0; transform: translateY(16px); filter: blur(10px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .projbook-dot {
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: var(--dot);
          pointer-events: auto;
          animation: projbookDot 2.6s ease-in-out infinite;
        }
        @keyframes projbookDot {
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
        .projbook-hint { animation: projbookHint 2.4s ease-in-out infinite; }
        @keyframes projbookHint {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .projbook-word, .projbook-rise { animation-duration: 0.01s; }
          .projbook-dot, .projbook-hint { animation: none; }
        }
      `}</style>
    </div>
  );
}
