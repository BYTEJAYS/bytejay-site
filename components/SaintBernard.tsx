"use client";

import { useEffect, useRef } from "react";

type V3 = [number, number, number];
type RGB = [number, number, number];
type Anim = "legFL" | "legFR" | "legBL" | "legBR" | "tail" | "head" | "ear" | "jaw";
type Part = { c: V3; s: V3; color: RGB; anim?: Anim; pivot?: V3 };
type Bubble = {
  text: string;
  x: number;
  y: number;
  rot: number;
  born: number;
  life: number;
  size: number;
  accent: boolean;
};

/* ── the dog, in boxes (x = forward, y = up, z = side) ──────────── */

const CREAM: RGB = [240, 221, 190];
const CREAM_D: RGB = [219, 195, 160];
const BROWN: RGB = [158, 84, 38];
const DARKBROWN: RGB = [90, 53, 28];
const DARK: RGB = [42, 33, 27];
const BARREL: RGB = [224, 68, 32];
const TONGUE: RGB = [232, 112, 110];

const HEAD_PIVOT: V3 = [0.85, 1.4, 0];
const JAW_PIVOT: V3 = [1.2, 1.44, 0];
const SIT_PIVOT: V3 = [-0.62, 0.18, 0];
const SIT_ANGLE = 0.42;
const LEG_LEN = 0.82;
const HIP_Y = 0.98;
const FOOT_Y = HIP_Y - LEG_LEN;

const PARTS: Part[] = [
  { c: [0, 1.02, 0], s: [1.7, 0.85, 0.85], color: CREAM }, // body
  { c: [-0.18, 1.36, 0], s: [1.15, 0.34, 0.9], color: BROWN }, // saddle patch
  { c: [0.98, 1.64, 0], s: [0.6, 0.58, 0.62], color: CREAM, anim: "head" },
  { c: [1.4, 1.56, 0], s: [0.34, 0.24, 0.36], color: CREAM, anim: "head" }, // muzzle
  { c: [1.6, 1.62, 0], s: [0.12, 0.13, 0.16], color: DARK, anim: "head" }, // nose
  { c: [0.92, 1.9, 0], s: [0.5, 0.16, 0.66], color: BROWN, anim: "head" }, // brow patch
  { c: [1.36, 1.38, 0], s: [0.3, 0.12, 0.32], color: CREAM_D, anim: "jaw" }, // jaw
  { c: [0.9, 1.56, 0.36], s: [0.18, 0.42, 0.12], color: DARKBROWN, anim: "ear", pivot: [0.9, 1.77, 0.36] },
  { c: [0.9, 1.56, -0.36], s: [0.18, 0.42, 0.12], color: DARKBROWN, anim: "ear", pivot: [0.9, 1.77, -0.36] },
  { c: [1.12, 1.2, 0], s: [0.26, 0.28, 0.42], color: BARREL, anim: "head" }, // rescue barrel
  { c: [0.62, 0.58, 0.3], s: [0.26, LEG_LEN, 0.26], color: CREAM, anim: "legFL", pivot: [0.62, HIP_Y, 0.3] },
  { c: [0.62, 0.58, -0.3], s: [0.26, LEG_LEN, 0.26], color: CREAM, anim: "legFR", pivot: [0.62, HIP_Y, -0.3] },
  { c: [-0.62, 0.58, 0.3], s: [0.26, LEG_LEN, 0.26], color: BROWN, anim: "legBL", pivot: [-0.62, HIP_Y, 0.3] },
  { c: [-0.62, 0.58, -0.3], s: [0.26, LEG_LEN, 0.26], color: BROWN, anim: "legBR", pivot: [-0.62, HIP_Y, -0.3] },
  { c: [-1.05, 1.5, 0], s: [0.6, 0.17, 0.17], color: BROWN, anim: "tail", pivot: [-0.85, 1.42, 0] },
];

// quad faces of a box, by corner index (idx = x*4 + y*2 + z)
const FACES: [number, number, number, number][] = [
  [4, 5, 7, 6], [0, 1, 3, 2],
  [2, 3, 7, 6], [0, 1, 5, 4],
  [1, 3, 7, 5], [0, 2, 6, 4],
];

const rotY = (p: V3, o: V3, t: number): V3 => {
  const c = Math.cos(t), s = Math.sin(t);
  const x = p[0] - o[0], z = p[2] - o[2];
  return [o[0] + x * c + z * s, p[1], o[2] - x * s + z * c];
};
const rotZ = (p: V3, o: V3, t: number): V3 => {
  const c = Math.cos(t), s = Math.sin(t);
  const x = p[0] - o[0], y = p[1] - o[1];
  return [o[0] + x * c - y * s, o[1] + x * s + y * c, p[2]];
};
const rotXAt = (p: V3, oy: number, t: number): V3 => {
  const c = Math.cos(t), s = Math.sin(t);
  const y = p[1] - oy, z = p[2];
  return [p[0], oy + y * c - z * s, y * s + z * c];
};

const WOOFS = ["WOOF!", "WOOF WOOF!", "BORF!", "AROOO!"];

const HEART_BMP = ["0110110", "1111111", "1111111", "0111110", "0011100", "0001000"];

function drawPixelHeart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  px: number,
  color: string
) {
  ctx.fillStyle = color;
  const w = HEART_BMP[0].length * px;
  for (let y = 0; y < HEART_BMP.length; y++) {
    for (let x = 0; x < HEART_BMP[y].length; x++) {
      if (HEART_BMP[y][x] === "1") {
        ctx.fillRect(cx - w / 2 + x * px, cy + y * px, px + 0.5, px + 0.5);
      }
    }
  }
}

type Mode = "walk" | "pause" | "sniff" | "bark" | "sit" | "lick" | "turn";

export default function SaintBernard({ dark = false }: { dark?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const darkRef = useRef(dark);
  darkRef.current = dark;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const caveat =
      getComputedStyle(document.body).getPropertyValue("--font-caveat").trim() ||
      "cursive";
    const mono =
      getComputedStyle(document.body).getPropertyValue("--font-mono").trim() ||
      "monospace";

    let w = 0, h = 0, S = 46, groundY = 0;
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      S = Math.max(30, Math.min(52, w * 0.038));
      groundY = h * 0.84;
    };
    resize();

    // ── roaming brain ──
    const wFreq = 7;
    let posX = w * 0.32;
    let dir = 1;
    let yaw = -0.14;
    let mode: Mode = "walk";
    let amp = 1; // leg swing amplitude
    let sitA = 0; // eased 0→1 while sitting
    let lickA = 0; // eased 0→1 while licking a paw
    let lickLeg: Anim = "legFL";
    let nextIdle = 4 + Math.random() * 4;
    let modeUntil = 0;
    let modeStart = 0;
    let turnFrom = 0;
    let barkTimes: number[] = [];
    let jawOpen = 0;
    let lastFire = -10;
    let nextBlink = 2;
    let blinkUntil = -1;
    let smallTold = false;
    let nextFlick = 3;
    let flickUntil = -1;
    let flickLeft = true;
    let clock = 0;
    let last = performance.now();
    let raf = 0;
    let running = true;
    let tagUntil = -10; // nametag shows only after the dog is clicked
    let tagA = 0;
    const bubbles: Bubble[] = [];
    let noseAnchor = { x: 0, y: 0 };

    const yawFor = (d: number) => (d === 1 ? -0.14 : Math.PI + 0.14);

    const spawn = (text: string, size: number, accent: boolean, life = 1.1) => {
      bubbles.push({
        text,
        x: noseAnchor.x + (Math.random() - 0.5) * 14,
        y: noseAnchor.y - 8 - Math.random() * 10,
        rot: (Math.random() - 0.5) * 0.3,
        born: clock,
        life,
        size,
        accent,
      });
    };

    const drawFrame = () => {
      const isDark = darkRef.current;

      // ── secondary motion ──
      const bob =
        (0.035 * Math.sin(clock * wFreq * 2) * amp +
          (mode === "bark" && clock - lastFire < 0.2 ? 0.05 : 0)) *
        (1 - sitA);
      const roll = Math.sin(clock * wFreq + Math.PI / 2) * 0.028 * amp;
      const wagSpeed =
        mode === "pause" || mode === "bark" ? 15 : mode === "sit" ? 12 : 9;
      const wagAmp = (mode === "walk" ? 0.3 : 0.45) + 0.3 * sitA;
      const wag = Math.sin(clock * wagSpeed) * wagAmp;

      let headTilt = 0.02 * Math.sin(clock * wFreq) * amp;
      if (mode === "pause") headTilt = 0.1 + Math.sin(clock * 2.2) * 0.04;
      if (mode === "sniff") headTilt = 0.58 + Math.sin(clock * 18) * 0.025;
      if (mode === "bark") headTilt = -0.3;
      headTilt += (0.45 + Math.sin(clock * 16) * 0.05 - headTilt) * lickA; // nose to paw
      headTilt -= 0.06 * sitA; // sitting tall

      const headYaw = Math.sin(clock * 0.7) * 0.28 * sitA * (1 - lickA); // look around
      const flick =
        clock < flickUntil
          ? Math.sin(((flickUntil - clock) / 0.18) * Math.PI) * 0.5
          : 0;
      const earBase =
        Math.sin(clock * wFreq - 0.7) * 0.1 * amp -
        headTilt * 0.45 +
        jawOpen * 0.2 -
        0.12 * sitA;
      const blink = clock < blinkUntil ? 0.12 : 1;
      const pant = mode === "pause" || mode === "sit" || jawOpen > 0.12;
      const camPitch = 0.16;
      const sitRotA = SIT_ANGLE * sitA;

      // dynamic parts: eyes + tongue
      const parts: Part[] = [
        ...PARTS,
        { c: [1.26, 1.76, 0.2], s: [0.05, 0.13 * blink + 0.01, 0.1], color: DARK, anim: "head" },
        { c: [1.26, 1.76, -0.2], s: [0.05, 0.13 * blink + 0.01, 0.1], color: DARK, anim: "head" },
      ];
      if (pant || lickA > 0.2) {
        parts.push({
          c: [1.42, 1.32 - jawOpen * 0.12, 0],
          s: [0.11, 0.05, 0.13],
          color: TONGUE,
          anim: "jaw",
        });
      }

      type Face = { pts: { x: number; y: number }[]; z: number; n: V3; color: RGB };
      const faces: Face[] = [];

      for (const part of parts) {
        const [cx, cy, cz] = part.c;
        const [sx, sy, sz] = part.s;
        let verts: V3[] = [];
        for (const dx of [-0.5, 0.5])
          for (const dy of [-0.5, 0.5])
            for (const dz of [-0.5, 0.5])
              verts.push([cx + dx * sx, cy + dy * sy, cz + dz * sz]);
        let center: V3 = [cx, cy, cz];
        const apply = (fn: (p: V3) => V3) => {
          verts = verts.map(fn);
          center = fn(center);
        };
        const sitRot = (p: V3) => rotZ(p, SIT_PIVOT, sitRotA);
        const headChain = (p: V3) =>
          rotY(rotZ(p, HEAD_PIVOT, -headTilt), HEAD_PIVOT, headYaw);

        const anim = part.anim;
        if (anim === "legFL" || anim === "legFR") {
          // front legs: swing (or lift to lick), then stay planted while the torso sits up
          const pv = part.pivot!;
          const swing =
            (anim === "legFL" ? 1 : -1) * Math.sin(clock * wFreq) * 0.5 * amp;
          const lift = anim === lickLeg ? -1.2 * lickA : 0;
          apply((p) => rotZ(p, pv, swing + lift));
          if (sitA > 0.001) {
            const pv2 = sitRot(pv);
            apply(sitRot);
            apply((p) => rotZ(p, pv2, -sitRotA)); // back to vertical
            const stretch = (pv2[1] - FOOT_Y) / LEG_LEN;
            apply((p) => [p[0], pv2[1] + (p[1] - pv2[1]) * stretch, p[2]]);
          }
        } else if (anim === "legBL" || anim === "legBR") {
          // back legs: swing, follow the torso, then fold into a haunch
          const pv = part.pivot!;
          const swing =
            (anim === "legBR" ? 1 : -1) * Math.sin(clock * wFreq) * 0.5 * amp;
          apply((p) => rotZ(p, pv, swing));
          if (sitA > 0.001) {
            const pv2 = sitRot(pv);
            apply(sitRot);
            apply((p) => rotZ(p, pv2, 0.9 * sitA)); // fold forward
          }
        } else if (anim === "tail") {
          const pv = part.pivot!;
          apply((p) => rotY(rotZ(p, pv, 0.55 - 0.4 * sitA + wag * 0.2), pv, wag));
          apply(sitRot);
        } else if (anim === "head") {
          apply(headChain);
          apply(sitRot);
        } else if (anim === "ear") {
          const pv = part.pivot!;
          const side = pv[2] > 0;
          const ear = earBase + (side === flickLeft ? flick : 0);
          apply((p) => rotZ(p, pv, ear));
          apply(headChain);
          apply(sitRot);
        } else if (anim === "jaw") {
          apply((p) => rotZ(p, JAW_PIVOT, jawOpen));
          apply(headChain);
          apply(sitRot);
        } else {
          apply(sitRot); // body + saddle
        }

        apply((p) => rotXAt(p, 1.0, roll));
        apply((p) => rotY(p, [0, 0, 0], yaw));
        apply((p) => [p[0], p[1] + bob, p[2]]);
        apply((p) => rotXAt(p, 0, camPitch));

        const proj = verts.map((p) => {
          const f = 1 + p[2] * 0.05;
          return { x: posX + p[0] * S * f, y: groundY - p[1] * S * f, z: p[2] };
        });

        for (const q of FACES) {
          const [a, b, c2] = [verts[q[0]], verts[q[1]], verts[q[2]]];
          const u: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
          const v: V3 = [c2[0] - a[0], c2[1] - a[1], c2[2] - a[2]];
          let n: V3 = [
            u[1] * v[2] - u[2] * v[1],
            u[2] * v[0] - u[0] * v[2],
            u[0] * v[1] - u[1] * v[0],
          ];
          const fcx = (a[0] + verts[q[3]][0]) / 2 - center[0];
          const fcy = (a[1] + verts[q[3]][1]) / 2 - center[1];
          const fcz = (a[2] + verts[q[3]][2]) / 2 - center[2];
          if (n[0] * fcx + n[1] * fcy + n[2] * fcz < 0) n = [-n[0], -n[1], -n[2]];
          if (n[2] <= 0) continue;
          faces.push({
            pts: q.map((i) => proj[i]),
            z: (verts[q[0]][2] + verts[q[1]][2] + verts[q[2]][2] + verts[q[3]][2]) / 4,
            n,
            color: part.color,
          });
        }
      }

      faces.sort((a, b) => a.z - b.z);

      // track the muzzle for speech bubbles
      {
        let p: V3 = [1.75, 1.85, 0];
        p = rotY(rotZ(p, HEAD_PIVOT, -headTilt), HEAD_PIVOT, headYaw);
        p = rotZ(p, SIT_PIVOT, sitRotA);
        p = rotY(p, [0, 0, 0], yaw);
        p = [p[0], p[1] + bob, p[2]];
        p = rotXAt(p, 0, camPitch);
        noseAnchor = { x: posX + p[0] * S, y: groundY - p[1] * S };
      }

      ctx.clearRect(0, 0, w, h);

      // shadow (shrinks toward the haunches while sitting)
      ctx.beginPath();
      ctx.fillStyle = isDark ? "rgba(0,0,0,0.4)" : "rgba(28,25,23,0.12)";
      ctx.ellipse(
        posX - Math.cos(yaw) * S * 0.3 * sitA,
        groundY + 6,
        S * (1.6 - bob * 2 - 0.35 * sitA),
        S * 0.28,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // flat-shaded faces with cel outline
      const L: V3 = [0.45, 0.75, 0.5];
      for (const f of faces) {
        const len = Math.hypot(...f.n) || 1;
        const lit = Math.max(0, (f.n[0] * L[0] + f.n[1] * L[1] + f.n[2] * L[2]) / len);
        const shade = 0.55 + 0.45 * lit;
        const [r, g, b] = f.color.map((c) => Math.round(c * shade));
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.strokeStyle = `rgb(${Math.round(r * 0.66)},${Math.round(g * 0.66)},${Math.round(b * 0.66)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(f.pts[0].x, f.pts[0].y);
        for (let i = 1; i < 4; i++) ctx.lineTo(f.pts[i].x, f.pts[i].y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // player nametag — only while recently clicked (game-console style)
      if (tagA > 0.02) {
        let p: V3 = [-0.1, 2.5, 0];
        p = rotZ(p, SIT_PIVOT, sitRotA);
        p = rotY(p, [0, 0, 0], yaw);
        p = rotXAt(p, 0, camPitch);
        const tx = posX + p[0] * S;
        const ty = groundY - p[1] * S - 6 + Math.sin(clock * 2) * 2.5;
        ctx.textAlign = "center";
        ctx.globalAlpha = 0.9 * tagA;
        ctx.font = `700 ${Math.max(9, S * 0.22)}px ${mono}, monospace`;
        ctx.fillStyle = isDark ? "rgba(251,248,242,0.8)" : "rgba(87,83,78,0.9)";
        ctx.fillText("BRUNO · Lv.3", tx, ty - S * 0.3);
        const px = Math.max(1.4, S * 0.032);
        const gap = px * 7 + Math.max(3, S * 0.09);
        for (const k of [-1, 0, 1]) {
          drawPixelHeart(ctx, tx + k * gap, ty - S * 0.18, px, "#FF4D24");
        }
        ctx.globalAlpha = 1;
      }

      // speech bubbles (WOOF! / sniff sniff… / lick lick…)
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const bb = bubbles[i];
        const age = clock - bb.born;
        if (age > bb.life) {
          bubbles.splice(i, 1);
          continue;
        }
        const fadeIn = Math.min(1, age / 0.12);
        const fadeOut = 1 - Math.max(0, (age - bb.life * 0.55) / (bb.life * 0.45));
        const pop = 0.7 + 0.3 * Math.min(1, age * 7);
        ctx.save();
        ctx.translate(bb.x, bb.y - age * 30);
        ctx.rotate(bb.rot);
        ctx.globalAlpha = fadeIn * fadeOut;
        ctx.font = `700 ${bb.size * pop}px ${caveat}, cursive`;
        ctx.textAlign = "center";
        ctx.lineWidth = 5;
        ctx.lineJoin = "round";
        ctx.strokeStyle = isDark ? "#1C1917" : "#FBF8F2";
        ctx.strokeText(bb.text, 0, 0);
        ctx.fillStyle = bb.accent
          ? "#FF4D24"
          : isDark
            ? "rgba(251,248,242,0.65)"
            : "rgba(87,83,78,0.75)";
        ctx.fillText(bb.text, 0, 0);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    };

    const startIdle = () => {
      const r = Math.random();
      modeStart = clock;
      smallTold = false;
      if (r < 0.18) {
        mode = "pause";
        modeUntil = clock + 1.6 + Math.random() * 1.4;
      } else if (r < 0.38) {
        mode = "sniff";
        modeUntil = clock + 2 + Math.random() * 1.4;
      } else if (r < 0.56) {
        mode = "bark";
        const n = Math.random() < 0.45 ? 3 : 2;
        barkTimes = [0.15, 0.55, 0.95].slice(0, n);
        modeUntil = clock + 0.5 + n * 0.45;
      } else if (r < 0.8) {
        mode = "sit";
        modeUntil = clock + 3.4 + Math.random() * 2;
      } else {
        mode = "lick";
        lickLeg = dir === 1 ? "legFL" : "legFR";
        modeUntil = clock + 2.4 + Math.random() * 0.8;
      }
    };

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      clock += dt;

      // nametag fades in/out around clicks
      tagA += ((clock < tagUntil ? 1 : 0) - tagA) * Math.min(1, dt * 8);

      // blinking + random ear flicks (any mode)
      if (clock > nextBlink) {
        blinkUntil = clock + 0.13;
        nextBlink = clock + 1.8 + Math.random() * 3.2;
      }
      if (clock > nextFlick) {
        flickUntil = clock + 0.18;
        flickLeft = Math.random() < 0.5;
        nextFlick = clock + 2.5 + Math.random() * 4.5;
      }

      // eased pose weights
      sitA += ((mode === "sit" ? 1 : 0) - sitA) * Math.min(1, dt * 3.5);
      lickA += ((mode === "lick" ? 1 : 0) - lickA) * Math.min(1, dt * 5);

      // jaw spring
      let jawTarget = 0.02;
      if (mode === "bark") jawTarget = clock - lastFire < 0.2 ? 0.55 : 0.08;
      else if (mode === "pause" || mode === "sit")
        jawTarget = 0.14 + Math.sin(clock * 10) * 0.05;
      else if (mode === "lick") jawTarget = 0.18 + Math.sin(clock * 16) * 0.06;
      jawOpen += (jawTarget - jawOpen) * Math.min(1, dt * 18);

      if (mode === "walk") {
        amp = Math.min(1, amp + dt * 3);
        posX += 42 * dir * dt;
        if (clock > nextIdle) startIdle();
        const margin = Math.max(90, w * 0.08);
        if ((dir === 1 && posX > w - margin) || (dir === -1 && posX < margin)) {
          mode = "turn";
          turnFrom = yaw;
          modeStart = clock;
        }
      } else if (mode === "turn") {
        amp = Math.max(0.25, amp - dt * 2);
        const p = Math.min(1, (clock - modeStart) / 0.8);
        const eased = 0.5 - 0.5 * Math.cos(p * Math.PI);
        yaw = turnFrom + (yawFor(-dir) - turnFrom) * eased;
        if (p >= 1) {
          dir = -dir;
          yaw = yawFor(dir);
          mode = "walk";
          nextIdle = clock + 4 + Math.random() * 6;
        }
      } else {
        amp = Math.max(0, amp - dt * 3);
        if (mode === "bark" && barkTimes.length) {
          if (clock - modeStart >= barkTimes[0]) {
            barkTimes.shift();
            lastFire = clock;
            spawn(WOOFS[Math.floor(Math.random() * WOOFS.length)], S * 0.62, true);
          }
        }
        if (mode === "sniff" && !smallTold && clock - modeStart > 0.7) {
          smallTold = true;
          spawn("sniff sniff…", S * 0.4, false, 1.4);
        }
        if (mode === "lick" && !smallTold && clock - modeStart > 0.6) {
          smallTold = true;
          spawn("lick lick…", S * 0.38, false, 1.4);
        }
        // leave sit/lick only once the pose has eased back
        const posed =
          (mode === "sit" && sitA > 0.05) || (mode === "lick" && lickA > 0.05);
        if (clock > modeUntil) {
          if (mode === "sit") mode = "pause"; // stand up first
          else if (!posed || mode === "lick") mode = "walk";
          if (mode === "walk" || mode === "pause") {
            modeUntil = clock + 0.5;
            nextIdle = clock + 4 + Math.random() * 6;
            if (mode === "pause") modeStart = clock;
          }
        }
      }

      drawFrame();
      raf = requestAnimationFrame(step);
    };

    if (reduced) {
      amp = 0;
      drawFrame();
    } else {
      raf = requestAnimationFrame((t) => {
        last = t;
        step(t);
      });
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running && !reduced) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(step);
      } else if (!entry.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    observer.observe(canvas);

    const onResize = () => {
      resize();
      posX = Math.min(Math.max(posX, w * 0.1), w * 0.9);
      drawFrame();
    };
    window.addEventListener("resize", onResize);

    // click Bruno → his nametag appears for a few seconds (+ ear flick)
    const onClick = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest("a, button")) return;
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const hit =
        Math.abs(x - posX) < S * 2.1 &&
        y > groundY - S * 2.7 &&
        y < groundY + S * 0.4;
      if (!hit) return;
      tagUntil = clock + 4;
      flickUntil = clock + 0.18;
      flickLeft = Math.random() < 0.5;
      if (reduced) {
        tagA = 1;
        drawFrame();
        setTimeout(() => {
          tagA = 0;
          drawFrame();
        }, 4000);
      }
    };
    window.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="h-full w-full" />;
}
