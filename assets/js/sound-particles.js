/**
 * SoundParticles — Audio-Reactive Celestial Nebula, Sakura Petals & Dew Droplet Engine
 *
 * Inspired by the Three.js Journey / Folio baseline ecosystem:
 *   1. RESONANCE RINGS — Ethereal water-ripple frequency rings expanding on beats
 *   2. DUST MOTES — Sub-pixel drifting micro-stardust reacting to audio turbulence
 *   3. CONSTELLATION MESH — Interconnected core nodes with branching harmonic web
 *   4. EMBERS & STAR CROSSES (✦) — Radiant glowing nodes and glinting celestial stars
 *   5. SAKURA PETALS & SPRING FOLIAGE — Tumbling pink petals & young birch leaves
 *   6. DEW DROPLETS & SPLASH MIST — Liquid glass droplets with caustic reflections,
 *      surface tension wobble, and audio beat fountain splashes
 *   7. ORBITAL VORTEX — Fluid cursor gravity & audio-driven swirl
 */
(function () {
  'use strict';

  const TAU = Math.PI * 2;
  const PI  = Math.PI;

  // ---- 2D simplex noise helper ----
  function makeNoise2D(seed) {
    const perm = new Uint8Array(512);
    const p    = new Uint8Array(256);
    let s = seed >>> 0 || 1;
    const rng = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 1000) / 1000; };
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = p[i]; p[i] = p[j]; p[j] = t; }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
    const grad2 = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    const lerp = (a, b, t) => a + t * (b - a);
    const dot  = (g, x, y) => g[0] * x + g[1] * y;
    return function (x, y) {
      const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
      const xf = x - Math.floor(x), yf = y - Math.floor(y);
      const u = fade(xf), v = fade(yf);
      const g00 = grad2[perm[X + perm[Y]] & 7];
      const g10 = grad2[perm[X + 1 + perm[Y]] & 7];
      const g01 = grad2[perm[X + perm[Y + 1]] & 7];
      const g11 = grad2[perm[X + 1 + perm[Y + 1]] & 7];
      return lerp(lerp(dot(g00, xf, yf), dot(g10, xf - 1, yf), u), lerp(dot(g01, xf, yf - 1), dot(g11, xf - 1, yf - 1), u), v);
    };
  }

  function rand(lo, hi) { return lo + Math.random() * (hi - lo); }
  function centerBiased() { return (Math.random() + Math.random() + Math.random()) / 3; }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ema(prev, next, a) { return prev + a * (next - prev); }

  // Multi-tone spectral gradient
  function getSpectrumColor(t) {
    if (t < 0.35) {
      const f = t / 0.35;
      return [
        Math.round(28 + f * (244 - 28)),
        Math.round(26 + f * (143 - 26)),
        Math.round(24 + f * (177 - 24))
      ];
    } else if (t < 0.75) {
      const f = (t - 0.35) / 0.4;
      return [
        Math.round(244 + f * (239 - 244)),
        Math.round(143 - f * (143 - 49)),
        Math.round(177 - f * (177 - 35))
      ];
    } else {
      const f = (t - 0.75) / 0.25;
      return [
        Math.round(239 + f * (255 - 239)),
        Math.round(49  + f * (204 - 49)),
        Math.round(35  + f * (85  - 35))
      ];
    }
  }

  class SoundParticles {
    constructor(canvas, opts) {
      this.canvas = canvas;
      this.ctx    = canvas.getContext('2d');
      this.opts   = opts || {};
      this.noise  = makeNoise2D((this.opts.seed || 1337) * 2654435761);
      this.noise2 = makeNoise2D((this.opts.seed || 7919) * 1597334677);

      this._getLevel   = typeof this.opts.getAudioLevel === 'function' ? this.opts.getAudioLevel : () => 0;
      this._level      = 0;   // smoothed amplitude 0..1
      this._peak       = 0;   // smoothed peak 0..1
      this._beatPulse  = 0;   // fast-decay beat flash 0..1
      this._prevRaw    = 0;   // for beat detection

      this.dust     = [];
      this.core     = [];
      this.embers   = [];
      this.petals   = [];
      this.leaves   = [];     // fresh birch & foliage leaves
      this.droplets = [];     // liquid dew drops
      this.splashes = [];     // beat splash micro-beads
      this.rings    = [];     // acoustic resonance ripples
      this.width    = 0;
      this.height   = 0;
      this.dpr      = 1;
      this.active   = false;
      this.pointer  = null;
      this.raf      = 0;
      this.startTime = performance.now();
      this.destroyed = false;

      this._onResize       = this._resize.bind(this);
      this._onPointerMove  = this._ptrMove.bind(this);
      this._onPointerLeave = this._ptrLeave.bind(this);
      this._onVisibility   = this._visCb.bind(this);

      this._resize();
      window.addEventListener('resize', this._onResize, { passive: true });
      document.addEventListener('visibilitychange', this._onVisibility);
      const host = canvas.closest('[data-playground-nav]') || canvas;
      host.addEventListener('pointermove',  this._onPointerMove);
      host.addEventListener('pointerleave', this._onPointerLeave);

      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.raf = requestAnimationFrame((t) => this._tick(t));
      } else {
        this._build();
        this._draw(performance.now());
      }
    }

    setActive(a) { this.active = !!a; }

    destroy() {
      this.destroyed = true;
      cancelAnimationFrame(this.raf);
      window.removeEventListener('resize', this._onResize);
      document.removeEventListener('visibilitychange', this._onVisibility);
      const host = this.canvas.closest('[data-playground-nav]') || this.canvas;
      host.removeEventListener('pointermove',  this._onPointerMove);
      host.removeEventListener('pointerleave', this._onPointerLeave);
    }

    _resize() {
      const rect = this.canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      if (w === this.width && h === this.height && this.core.length) return;
      this.width = w; this.height = h;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width  = Math.round(w * this.dpr);
      this.canvas.height = Math.round(h * this.dpr);
      this.canvas.style.width  = w + 'px';
      this.canvas.style.height = h + 'px';
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this._build();
    }

    _build() {
      const cx = this.width / 2, cy = this.height / 2;
      const rx = this.width / 2, ry = this.height / 2;
      const now = performance.now();
      const area = this.width * this.height;
      const mobile  = area < 900;
      const tablet  = area < 1500;

      // ---- 1. Dust motes ----
      const nDust = mobile ? 110 : tablet ? 170 : 230;
      this.dust = [];
      for (let i = 0; i < nDust; i++) {
        const ang = rand(0, TAU);
        const r = Math.pow(Math.random(), 0.6);
        const bx = cx + Math.cos(ang) * rx * r;
        const by = cy + Math.sin(ang) * ry * r;
        this.dust.push({
          baseX: bx, baseY: by, x: bx, y: by, vx: 0, vy: 0,
          radius: rand(0.5, 1.1),
          opacity: rand(0.12, 0.35),
          phase: rand(0, TAU),
          noiseOff: rand(0, 1000),
          noiseSpd: rand(0.00008, 0.00016),
          normR: r,
          enterAt: now + rand(0, 500), enterDur: rand(450, 800)
        });
      }

      // ---- 2. Core constellation nodes ----
      const nCore = mobile ? 55 : tablet ? 85 : 125;
      this.core = [];
      for (let i = 0; i < nCore; i++) {
        const ang = rand(0, TAU);
        const r = centerBiased();
        const bx = cx + Math.cos(ang) * rx * r;
        const by = cy + Math.sin(ang) * ry * r;
        this.core.push({
          baseX: bx, baseY: by, x: bx, y: by, vx: 0, vy: 0,
          radius: rand(1.1, 2.3),
          baseOpacity: rand(0.4, 0.8),
          phase: rand(0, TAU),
          noiseOff: rand(0, 1000),
          noiseSpd: rand(0.00012, 0.00028),
          amplitude: rand(0.4, 1.6),
          normR: r,
          enterAt: now + rand(50, 400), enterDur: rand(350, 700),
          isStar: Math.random() > 0.78
        });
      }

      // ---- 3. Glowing Embers ----
      const nEmber = mobile ? 7 : tablet ? 10 : 15;
      this.embers = [];
      for (let i = 0; i < nEmber; i++) {
        const ang = rand(0, TAU);
        const r = centerBiased() * 0.65;
        const bx = cx + Math.cos(ang) * rx * r;
        const by = cy + Math.sin(ang) * ry * r;
        this.embers.push({
          baseX: bx, baseY: by, x: bx, y: by, vx: 0, vy: 0,
          radius: rand(2.2, 3.8),
          baseOpacity: rand(0.3, 0.65),
          phase: rand(0, TAU),
          noiseOff: rand(0, 1000),
          noiseSpd: rand(0.0001, 0.0002),
          amplitude: rand(0.6, 1.4),
          normR: r,
          enterAt: now + rand(150, 500), enterDur: rand(450, 800),
          sparkleAt: now + rand(1500, 4000),
          sparkleDur: rand(200, 450)
        });
      }

      // ---- 4. Sakura Blossom Petals ----
      const nPetals = mobile ? 6 : 12;
      this.petals = [];
      for (let i = 0; i < nPetals; i++) {
        const ang = rand(0, TAU);
        const r = rand(0.2, 0.85);
        const bx = cx + Math.cos(ang) * rx * r;
        const by = cy + Math.sin(ang) * ry * r;
        this.petals.push({
          baseX: bx, baseY: by, x: bx, y: by, vx: 0, vy: 0,
          size: rand(3.8, 6.5),
          rotation: rand(0, TAU),
          rotSpeed: rand(-0.03, 0.03),
          phase: rand(0, TAU),
          noiseOff: rand(0, 1000),
          noiseSpd: rand(0.00015, 0.0003),
          opacity: rand(0.4, 0.85),
          hasDewdrop: Math.random() > 0.45 // carries a tiny dewdrop
        });
      }

      // ---- 5. Fresh Spring Birch & Foliage Leaves ----
      const nLeaves = mobile ? 4 : 8;
      this.leaves = [];
      for (let i = 0; i < nLeaves; i++) {
        const ang = rand(0, TAU);
        const r = rand(0.25, 0.8);
        const bx = cx + Math.cos(ang) * rx * r;
        const by = cy + Math.sin(ang) * ry * r;
        const isGold = Math.random() > 0.5;
        this.leaves.push({
          baseX: bx, baseY: by, x: bx, y: by, vx: 0, vy: 0,
          size: rand(4.0, 7.0),
          rotation: rand(0, TAU),
          rotSpeed: rand(-0.025, 0.025),
          phase: rand(0, TAU),
          noiseOff: rand(0, 1000),
          noiseSpd: rand(0.00012, 0.00025),
          opacity: rand(0.45, 0.85),
          color: isGold ? 'rgba(217,203,168,0.85)' : 'rgba(169,191,160,0.85)',
          tipColor: isGold ? 'rgba(185,169,127,0.9)' : 'rgba(126,180,174,0.9)'
        });
      }

      // ---- 6. Liquid Glass Dew Droplets ----
      const nDroplets = mobile ? 8 : 16;
      this.droplets = [];
      for (let i = 0; i < nDroplets; i++) {
        const ang = rand(0, TAU);
        const r = rand(0.15, 0.75);
        const bx = cx + Math.cos(ang) * rx * r;
        const by = cy + Math.sin(ang) * ry * r;
        this.droplets.push({
          baseX: bx, baseY: by, x: bx, y: by, vx: 0, vy: 0,
          radius: rand(1.8, 3.4),
          wobblePhase: rand(0, TAU),
          wobbleSpeed: rand(0.003, 0.006),
          noiseOff: rand(0, 1000),
          noiseSpd: rand(0.0001, 0.00022),
          opacity: rand(0.55, 0.9)
        });
      }

      this.splashes = [];
      this.rings = [];
      this.startTime = now;
    }

    _ptrMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      this.pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    _ptrLeave() { this.pointer = null; }
    _visCb() {
      if (document.hidden) cancelAnimationFrame(this.raf);
      else if (!this.destroyed) this.raf = requestAnimationFrame((t) => this._tick(t));
    }

    _spawnSplash(cx, cy, raw) {
      const count = 5 + Math.floor(raw * 8);
      for (let i = 0; i < count; i++) {
        const ang = rand(0, TAU);
        const spd = (1.2 + Math.random() * 2.5) * (0.8 + raw * 1.5);
        this.splashes.push({
          x: cx + Math.cos(ang) * 4,
          y: cy + Math.sin(ang) * 4,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          radius: rand(0.7, 1.8),
          alpha: 0.85,
          decay: rand(0.025, 0.045)
        });
      }
    }

    _tick(now) {
      if (this.destroyed) return;
      this.raf = requestAnimationFrame((t) => this._tick(t));

      const raw = this._getLevel();
      this._level = ema(this._level, raw, raw > this._level ? 0.38 : 0.07);
      this._peak  = ema(this._peak, Math.max(raw, this._peak * 0.988), 0.5);

      // Beat detection -> spawn expanding resonance ring + dew splash
      const delta = raw - this._prevRaw;
      if (delta > 0.055 && raw > 0.14) {
        this._beatPulse = Math.min(1, this._beatPulse + delta * 3.2);
        const cx = this.width / 2;
        const cy = this.height / 2;

        if (this.rings.length < 5) {
          this.rings.push({
            x: cx + (Math.random() - 0.5) * 20,
            y: cy + (Math.random() - 0.5) * 16,
            radius: 4,
            maxRadius: Math.min(this.width, this.height) * 0.65 * (0.6 + raw * 0.8),
            opacity: 0.6 + raw * 0.4,
            speed: 0.8 + raw * 1.5,
            birth: now
          });
        }

        // Spawn liquid droplet splash
        this._spawnSplash(cx + (Math.random() - 0.5) * 30, cy + (Math.random() - 0.5) * 20, raw);
      }
      this._beatPulse *= 0.88;
      this._prevRaw = raw;

      this._step(now);
      this._draw(now);
    }

    _stepLayer(arr, now, flowMul, springK, dampBase) {
      const level  = this._level;
      const beat   = this._beatPulse;
      const hoverK = this.active ? 1.35 : 1;
      const soundK = 1 + level * 3.4 + beat * 2.2;
      const flow   = 0.005 * flowMul * hoverK * soundK;
      const spring = springK;
      const center = 0.0003;
      const damp   = dampBase - (this.active ? 0.012 : 0) - level * 0.01;
      const scatter = level * 0.045 + beat * 0.08;
      const noiseS = 0.045;
      const cx = this.width / 2, cy = this.height / 2;
      const iR = Math.max(46, Math.min(110, this.width * 0.9));

      for (let i = 0; i < arr.length; i++) {
        const p = arr[i];
        if (p.enterAt && now < p.enterAt) continue;

        const n = this.noise(p.x * noiseS + p.noiseOff, p.y * noiseS + now * p.noiseSpd);
        const ang = n * TAU;
        p.vx += Math.cos(ang) * flow;
        p.vy += Math.sin(ang) * flow;

        const n2 = this.noise2(p.y * noiseS * 0.7 + p.noiseOff, p.x * noiseS * 0.7 + now * p.noiseSpd * 0.6);
        p.vx += Math.sin(n2 * TAU) * flow * 0.3;
        p.vy += Math.cos(n2 * TAU) * flow * 0.3;

        p.vx += (p.baseX - p.x) * spring;
        p.vy += (p.baseY - p.y) * spring;
        p.vx += (cx - p.x) * center;
        p.vy += (cy - p.y) * center;

        // Fluid vortex swirl when audio is active
        if (level > 0.04) {
          const dx = p.x - cx;
          const dy = p.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const vortexForce = (level * 0.012 + beat * 0.02) * (1 - Math.min(dist / (this.width * 0.5), 1));
          p.vx += -dy * vortexForce;
          p.vy +=  dx * vortexForce;
        }

        if (scatter > 0.0001) {
          const dxb = p.baseX - cx, dyb = p.baseY - cy;
          const db = Math.sqrt(dxb * dxb + dyb * dyb) || 1;
          const sR = 0.3 + (p.normR || 0.5) * 0.7;
          p.vx += (dxb / db) * scatter * sR;
          p.vy += (dyb / db) * scatter * sR;
        }

        if (this.pointer) {
          const dx = p.x - this.pointer.x, dy = p.y - this.pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < iR && dist > 0.001) {
            let f = 1 - dist / iR; f *= f;
            const push = f * 0.20;
            p.vx += (dx / dist) * push;
            p.vy += (dy / dist) * push;
          }
        }

        p.vx *= damp; p.vy *= damp;
        p.x += p.vx; p.y += p.vy;

        if (p.rotation !== undefined) {
          p.rotation += (p.rotSpeed + p.vx * 0.05) * (1 + level * 1.5);
        }
      }
    }

    _step(now) {
      this._stepLayer(this.dust,     now, 0.7, 0.007, 0.975);
      this._stepLayer(this.core,     now, 1.0, 0.010, 0.970);
      this._stepLayer(this.embers,   now, 0.5, 0.012, 0.965);
      this._stepLayer(this.petals,   now, 0.9, 0.008, 0.970);
      this._stepLayer(this.leaves,   now, 0.85, 0.009, 0.970);
      this._stepLayer(this.droplets, now, 0.6, 0.011, 0.965);

      // Advance resonance rings
      for (let i = this.rings.length - 1; i >= 0; i--) {
        const ring = this.rings[i];
        ring.radius += ring.speed;
        const progress = ring.radius / ring.maxRadius;
        if (progress >= 1) this.rings.splice(i, 1);
      }

      // Advance splash beads
      for (let i = this.splashes.length - 1; i >= 0; i--) {
        const sp = this.splashes[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.04; // subtle gravity
        sp.vx *= 0.96;
        sp.alpha -= sp.decay;
        if (sp.alpha <= 0) this.splashes.splice(i, 1);
      }
    }

    _entranceEase(p, now) {
      if (!p.enterAt) return { x: p.x, y: p.y, ex: 1 };
      if (now < p.enterAt) return null;
      const t = (now - p.enterAt) / p.enterDur;
      if (t >= 1) return { x: p.x, y: p.y, ex: 1 };
      const ex = 1 - Math.pow(1 - t, 3);
      const sx = p.baseX + Math.cos(p.phase) * 10;
      const sy = p.baseY + Math.sin(p.phase) * 10;
      return { x: sx + (p.baseX - sx) * ex, y: sy + (p.baseY - sy) * ex, ex };
    }

    _draw(now) {
      const ctx   = this.ctx;
      const level = this._level;
      const peak  = this._peak;
      const beat  = this._beatPulse;
      const cx = this.width / 2, cy = this.height / 2;

      ctx.clearRect(0, 0, this.width, this.height);

      // Multi-tone spectrum color
      const colT = clamp01(level * 0.65 + beat * 0.35);
      const [cr, cg, cb] = getSpectrumColor(colT);
      const colStr = `${cr},${cg},${cb}`;

      // === LAYER 0: Ambient Bloom ===
      if (peak > 0.02) {
        const glowR = Math.min(this.width, this.height) * 0.75 * (0.28 + peak * 0.72);
        const ga = peak * 0.12 + beat * 0.08;
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
        grd.addColorStop(0,   `rgba(${cr},${cg},${cb},${ga})`);
        grd.addColorStop(0.4, `rgba(255,183,197,${ga * 0.45})`);
        grd.addColorStop(1,   'rgba(239,49,35,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, this.width, this.height);
      }

      // === LAYER 0.5: Resonance Waves ===
      for (let i = 0; i < this.rings.length; i++) {
        const ring = this.rings[i];
        const prog = ring.radius / ring.maxRadius;
        const ringAlpha = (1 - prog) * ring.opacity * 0.32;
        if (ringAlpha <= 0) continue;

        ctx.strokeStyle = `rgba(${colStr},${ringAlpha})`;
        ctx.lineWidth = 1.0 + (1 - prog) * 1.5;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, TAU);
        ctx.stroke();
      }

      // === LAYER 1: Dust Motes ===
      for (let i = 0; i < this.dust.length; i++) {
        const d = this.dust[i];
        const e = this._entranceEase(d, now);
        if (!e) continue;
        const wobX = Math.sin(now * 0.001 + d.phase) * 0.5;
        const wobY = Math.cos(now * 0.0008 + d.phase) * 0.4;
        const x = e.x + wobX, y = e.y + wobY;
        const opBoost = level * 0.22 + beat * 0.16;
        const op = clamp01((d.opacity + opBoost) * e.ex);
        if (op < 0.01) continue;
        ctx.globalAlpha = op;
        ctx.fillStyle = `rgb(${colStr})`;
        ctx.beginPath();
        ctx.arc(x, y, d.radius + peak * 0.45, 0, TAU);
        ctx.fill();
      }

      // === LAYER 2: Core Constellation Web ===
      const corePos = [];
      for (let i = 0; i < this.core.length; i++) {
        const p = this.core[i];
        const e = this._entranceEase(p, now);
        if (!e) { corePos.push(null); continue; }
        const wobX = Math.sin(now * 0.0016 + p.phase) * p.amplitude * 0.35;
        const wobY = Math.cos(now * 0.0013 + p.phase) * p.amplitude * 0.25;
        corePos.push({ x: e.x + wobX, y: e.y + wobY, ex: e.ex, p });
      }

      const connDist = 15 + level * 20 + beat * 10;
      const connDistSq = connDist * connDist;
      ctx.lineWidth = 0.5 + level * 0.45;

      for (let i = 0; i < corePos.length; i++) {
        const a = corePos[i];
        if (!a) continue;
        for (let j = i + 1; j < corePos.length; j++) {
          const b = corePos[j];
          if (!b) continue;
          const dx = a.x - b.x, dy = a.y - b.y;
          const dSq = dx * dx + dy * dy;
          if (dSq > connDistSq) continue;
          const d = Math.sqrt(dSq);
          const t = 1 - d / connDist;
          const lineOp = t * t * (0.14 + level * 0.30 + beat * 0.25) * Math.min(a.ex, b.ex);
          if (lineOp < 0.005) continue;
          ctx.globalAlpha = lineOp;
          ctx.strokeStyle = `rgb(${colStr})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Core Nodes
      for (let i = 0; i < corePos.length; i++) {
        const c = corePos[i];
        if (!c) continue;
        const p = c.p;
        const opBoost = level * 0.32 + beat * 0.22;
        const op = clamp01((p.baseOpacity + opBoost) * c.ex);
        if (op < 0.01) continue;

        ctx.globalAlpha = op;
        ctx.fillStyle = `rgb(${colStr})`;

        if (p.isStar && (level > 0.08 || beat > 0.2)) {
          const sSize = (p.radius + peak * 1.6 + beat * 1.2) * 1.8;
          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.beginPath();
          ctx.moveTo(0, -sSize);
          ctx.quadraticCurveTo(0, 0, sSize, 0);
          ctx.quadraticCurveTo(0, 0, 0, sSize);
          ctx.quadraticCurveTo(0, 0, -sSize, 0);
          ctx.quadraticCurveTo(0, 0, 0, -sSize);
          ctx.fill();
          ctx.restore();
        } else {
          const r = p.radius + peak * 0.85 + beat * 0.55;
          ctx.beginPath();
          ctx.arc(c.x, c.y, r, 0, TAU);
          ctx.fill();
        }
      }

      // === LAYER 3: Spring Foliage Leaves ===
      if (level > 0.03 || this.active) {
        for (let i = 0; i < this.leaves.length; i++) {
          const lf = this.leaves[i];
          const wobX = Math.sin(now * 0.0011 + lf.phase) * 0.5;
          const wobY = Math.cos(now * 0.0009 + lf.phase) * 0.5;
          const x = lf.x + wobX, y = lf.y + wobY;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(lf.rotation);
          ctx.globalAlpha = clamp01(lf.opacity * (0.5 + level * 0.5));

          const lw = lf.size * 0.7;
          const lh = lf.size * 1.6;

          // Fresh pointed leaf shape
          ctx.beginPath();
          ctx.moveTo(0, -lh * 0.5);
          ctx.bezierCurveTo(lw * 0.9, -lh * 0.1, lw * 0.7, lh * 0.4, 0, lh * 0.5);
          ctx.bezierCurveTo(-lw * 0.7, lh * 0.4, -lw * 0.9, -lh * 0.1, 0, -lh * 0.5);
          ctx.fillStyle = lf.color;
          ctx.fill();

          // Leaf center vein
          ctx.strokeStyle = lf.tipColor;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(0, -lh * 0.35);
          ctx.lineTo(0, lh * 0.35);
          ctx.stroke();

          ctx.restore();
        }
      }

      // === LAYER 4: Sakura Blossom Petals ===
      if (level > 0.03 || this.active) {
        for (let i = 0; i < this.petals.length; i++) {
          const pt = this.petals[i];
          const wobX = Math.sin(now * 0.0012 + pt.phase) * 0.6;
          const wobY = Math.cos(now * 0.0009 + pt.phase) * 0.5;
          const x = pt.x + wobX, y = pt.y + wobY;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(pt.rotation);
          ctx.globalAlpha = clamp01(pt.opacity * (0.4 + level * 0.6));

          const pw = pt.size * (0.8 + peak * 0.4);
          const ph = pt.size * 1.4 * (0.8 + peak * 0.4);

          ctx.beginPath();
          ctx.moveTo(0, -ph * 0.5);
          ctx.bezierCurveTo(pw * 0.8, -ph * 0.3, pw * 0.8, ph * 0.3, 0, ph * 0.5);
          ctx.bezierCurveTo(-pw * 0.8, ph * 0.3, -pw * 0.8, -ph * 0.3, 0, -ph * 0.5);
          ctx.fillStyle = `rgba(255,183,197,${0.6 + level * 0.35})`;
          ctx.fill();

          // Dewdrop perched on petal
          if (pt.hasDewdrop) {
            ctx.beginPath();
            ctx.arc(pw * 0.25, -ph * 0.2, 1.2, 0, TAU);
            ctx.fillStyle = 'rgba(255,255,255,0.92)';
            ctx.fill();
          }

          ctx.restore();
        }
      }

      // === LAYER 5: Liquid Glass Dew Droplets ===
      for (let i = 0; i < this.droplets.length; i++) {
        const dp = this.droplets[i];
        const wob = Math.sin(now * dp.wobbleSpeed + dp.wobblePhase);
        const wobR = dp.radius * (1 + wob * (0.12 + level * 0.25));
        const x = dp.x;
        const y = dp.y;

        ctx.save();
        ctx.globalAlpha = dp.opacity * (0.55 + level * 0.45);

        // Soft outer droplet glow
        const dGrd = ctx.createRadialGradient(x, y, wobR * 0.2, x, y, wobR * 1.8);
        dGrd.addColorStop(0,   `rgba(255,230,240,${0.4 + level * 0.4})`);
        dGrd.addColorStop(0.6, `rgba(${colStr},${0.25 + level * 0.3})`);
        dGrd.addColorStop(1,   'rgba(255,255,255,0)');
        ctx.fillStyle = dGrd;
        ctx.beginPath();
        ctx.arc(x, y, wobR * 1.8, 0, TAU);
        ctx.fill();

        // Droplet body
        ctx.fillStyle = `rgba(255,245,250,${0.75 + level * 0.2})`;
        ctx.beginPath();
        ctx.arc(x, y, wobR, 0, TAU);
        ctx.fill();

        // Specular glass gleam reflection
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.beginPath();
        ctx.arc(x - wobR * 0.32, y - wobR * 0.32, wobR * 0.35, 0, TAU);
        ctx.fill();

        ctx.restore();
      }

      // === LAYER 6: Audio Splash Mist Droplets ===
      for (let i = 0; i < this.splashes.length; i++) {
        const sp = this.splashes[i];
        ctx.save();
        ctx.globalAlpha = clamp01(sp.alpha);
        ctx.fillStyle = 'rgba(255,245,250,0.92)';
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.radius, 0, TAU);
        ctx.fill();
        ctx.restore();
      }

      // === LAYER 7: Glowing Embers ===
      for (let i = 0; i < this.embers.length; i++) {
        const em = this.embers[i];
        const e = this._entranceEase(em, now);
        if (!e) continue;
        const wobX = Math.sin(now * 0.0014 + em.phase) * em.amplitude * 0.45;
        const wobY = Math.cos(now * 0.0011 + em.phase) * em.amplitude * 0.35;
        const x = e.x + wobX, y = e.y + wobY;

        let sparkle = 0;
        if (now >= em.sparkleAt) {
          const sT = (now - em.sparkleAt) / em.sparkleDur;
          if (sT < 1) sparkle = Math.sin(sT * PI);
          else {
            em.sparkleAt = now + rand(1500, 4500);
            em.sparkleDur = rand(200, 500);
          }
        }

        const opBoost = level * 0.38 + beat * 0.35 + sparkle * 0.35;
        const op = clamp01((em.baseOpacity + opBoost) * e.ex);
        if (op < 0.01) continue;

        const r = em.radius + peak * 1.3 + beat * 1.1 + sparkle * 0.9;
        const haloR = r * (2.4 + level * 1.8 + sparkle * 1.2);
        const haloA = op * (0.12 + level * 0.15 + sparkle * 0.18);

        if (haloA > 0.005) {
          const hGrd = ctx.createRadialGradient(x, y, r * 0.2, x, y, haloR);
          hGrd.addColorStop(0,   `rgba(${cr},${cg},${cb},${haloA * 1.2})`);
          hGrd.addColorStop(0.5, `rgba(255,183,197,${haloA * 0.5})`);
          hGrd.addColorStop(1,   `rgba(${colStr},0)`);
          ctx.globalAlpha = 1;
          ctx.fillStyle = hGrd;
          ctx.beginPath();
          ctx.arc(x, y, haloR, 0, TAU);
          ctx.fill();
        }

        ctx.globalAlpha = op;
        ctx.fillStyle = `rgb(${colStr})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();

        if (level > 0.08 || sparkle > 0) {
          const hotA = (level * 0.4 + sparkle * 0.6) * e.ex;
          if (hotA > 0.01) {
            ctx.globalAlpha = hotA;
            ctx.fillStyle = 'rgba(255,250,240,0.95)';
            ctx.beginPath();
            ctx.arc(x, y, r * 0.42, 0, TAU);
            ctx.fill();
          }
        }
      }

      ctx.globalAlpha = 1;
    }
  }

  window.SoundParticles = SoundParticles;
})();
