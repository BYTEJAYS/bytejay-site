/**
 * SoundParticles — a living, audio-reactive nebula in the site nav.
 *
 * Three layers of particles form a breathing, interconnected cloud:
 *   1. DUST — many tiny, barely-visible motes that drift slowly
 *   2. CORE — mid-size dots with connection lines between nearby neighbours
 *   3. EMBERS — a few large, glowing orbs with soft halos that pulse on beats
 *
 * When audio plays the entire system comes alive: the dust accelerates,
 * connection lines brighten and multiply, embers bloom outward and flash,
 * and the whole cloud's colour temperature shifts from cool ink to warm red.
 *
 * Without audio the system is a quiet, elegant, barely-there ambient texture.
 */
(function () {
  'use strict';

  const TAU = Math.PI * 2;
  const PI  = Math.PI;

  // ---- 2D simplex-ish noise (no dependency) ----------------------------
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

  // ---- colour helpers ---------------------------------------------------
  // Lerp between ink (#111) and brand red (#ef3123) based on audio energy.
  function lerpColor(t) {
    // ink  = rgb(17,17,17)
    // red  = rgb(239,49,35)
    // warm = rgb(200,80,50)  — an intermediate ember tone
    const r = Math.round(17 + t * (200 - 17));
    const g = Math.round(17 + t * (80  - 17));
    const b = Math.round(17 + t * (50  - 17));
    return [r, g, b];
  }

  // =====================================================================
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

      this.dust   = [];
      this.core   = [];
      this.embers = [];
      this.width  = 0;
      this.height = 0;
      this.dpr    = 1;
      this.active = false;
      this.pointer = null;
      this.raf     = 0;
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

    // ---- layout --------------------------------------------------------
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

      // ---- dust layer (many, tiny, subtle) ----
      const nDust = mobile ? 120 : tablet ? 180 : 260;
      this.dust = [];
      for (let i = 0; i < nDust; i++) {
        const ang = rand(0, TAU);
        const r = Math.pow(Math.random(), 0.6); // slightly looser spread
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
          enterAt: now + rand(0, 600), enterDur: rand(500, 900),
        });
      }

      // ---- core layer (mid-size, connected) ----
      const nCore = mobile ? 65 : tablet ? 95 : 140;
      this.core = [];
      for (let i = 0; i < nCore; i++) {
        const ang = rand(0, TAU);
        const r = centerBiased();
        const bx = cx + Math.cos(ang) * rx * r;
        const by = cy + Math.sin(ang) * ry * r;
        this.core.push({
          baseX: bx, baseY: by, x: bx, y: by, vx: 0, vy: 0,
          radius: rand(1.2, 2.4),
          baseOpacity: rand(0.4, 0.8),
          phase: rand(0, TAU),
          noiseOff: rand(0, 1000),
          noiseSpd: rand(0.00012, 0.00028),
          amplitude: rand(0.4, 1.6),
          normR: r,
          enterAt: now + rand(60, 440), enterDur: rand(400, 780),
        });
      }

      // ---- ember layer (few, large, glowing) ----
      const nEmber = mobile ? 6 : tablet ? 9 : 14;
      this.embers = [];
      for (let i = 0; i < nEmber; i++) {
        const ang = rand(0, TAU);
        const r = centerBiased() * 0.65; // closer to centre
        const bx = cx + Math.cos(ang) * rx * r;
        const by = cy + Math.sin(ang) * ry * r;
        this.embers.push({
          baseX: bx, baseY: by, x: bx, y: by, vx: 0, vy: 0,
          radius: rand(2.4, 3.6),
          baseOpacity: rand(0.25, 0.55),
          phase: rand(0, TAU),
          noiseOff: rand(0, 1000),
          noiseSpd: rand(0.0001, 0.0002),
          amplitude: rand(0.6, 1.4),
          normR: r,
          enterAt: now + rand(200, 600), enterDur: rand(500, 900),
          // Individual sparkle timer
          sparkleAt: now + rand(2000, 5000),
          sparkleDur: rand(200, 500),
        });
      }
      this.startTime = now;
    }

    // ---- pointer -------------------------------------------------------
    _ptrMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      this.pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    _ptrLeave() { this.pointer = null; }
    _visCb() {
      if (document.hidden) cancelAnimationFrame(this.raf);
      else if (!this.destroyed) this.raf = requestAnimationFrame((t) => this._tick(t));
    }

    // ---- tick ----------------------------------------------------------
    _tick(now) {
      if (this.destroyed) return;
      this.raf = requestAnimationFrame((t) => this._tick(t));

      // Audio analysis
      const raw = this._getLevel();
      this._level = ema(this._level, raw, raw > this._level ? 0.38 : 0.07);
      this._peak  = ema(this._peak, Math.max(raw, this._peak * 0.988), 0.5);

      // Beat detection: a sudden jump in raw level
      const delta = raw - this._prevRaw;
      if (delta > 0.06 && raw > 0.15) this._beatPulse = Math.min(1, this._beatPulse + delta * 3);
      this._beatPulse *= 0.88; // fast decay
      this._prevRaw = raw;

      this._step(now);
      this._draw(now);
    }

    // ---- physics -------------------------------------------------------
    _stepLayer(arr, now, flowMul, springK, dampBase) {
      const level = this._level;
      const beat  = this._beatPulse;
      const hoverK = this.active ? 1.3 : 1;
      const soundK = 1 + level * 3.2 + beat * 2.0;
      const flow   = 0.005 * flowMul * hoverK * soundK;
      const spring = springK;
      const center = 0.0003;
      const damp   = dampBase - (this.active ? 0.012 : 0) - level * 0.01;
      const scatter = level * 0.045 + beat * 0.08;
      const noiseS = 0.045;
      const cx = this.width / 2, cy = this.height / 2;
      const iR = Math.max(46, Math.min(100, this.width * 0.9));

      for (let i = 0; i < arr.length; i++) {
        const p = arr[i];
        if (now < p.enterAt) continue;

        const n = this.noise(p.x * noiseS + p.noiseOff, p.y * noiseS + now * p.noiseSpd);
        const ang = n * TAU;
        p.vx += Math.cos(ang) * flow;
        p.vy += Math.sin(ang) * flow;

        // secondary curl noise for less uniform motion
        const n2 = this.noise2(p.y * noiseS * 0.7 + p.noiseOff, p.x * noiseS * 0.7 + now * p.noiseSpd * 0.6);
        p.vx += Math.sin(n2 * TAU) * flow * 0.25;
        p.vy += Math.cos(n2 * TAU) * flow * 0.25;

        p.vx += (p.baseX - p.x) * spring;
        p.vy += (p.baseY - p.y) * spring;
        p.vx += (cx - p.x) * center;
        p.vy += (cy - p.y) * center;

        if (scatter > 0.0001) {
          const dxb = p.baseX - cx, dyb = p.baseY - cy;
          const db = Math.sqrt(dxb * dxb + dyb * dyb) || 1;
          const sR = 0.3 + p.normR * 0.7;
          p.vx += (dxb / db) * scatter * sR;
          p.vy += (dyb / db) * scatter * sR;
        }

        if (this.pointer) {
          const dx = p.x - this.pointer.x, dy = p.y - this.pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < iR && dist > 0.001) {
            let f = 1 - dist / iR; f *= f;
            const push = f * 0.18;
            p.vx += (dx / dist) * push;
            p.vy += (dy / dist) * push;
          }
        }

        p.vx *= damp; p.vy *= damp;
        p.x += p.vx; p.y += p.vy;
      }
    }

    _step(now) {
      this._stepLayer(this.dust,   now, 0.7, 0.007, 0.975);
      this._stepLayer(this.core,   now, 1.0, 0.010, 0.970);
      this._stepLayer(this.embers, now, 0.5, 0.012, 0.965);
    }

    // ---- rendering -----------------------------------------------------
    _entranceEase(p, now) {
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

      // --- colour temperature: ink → warm red with audio ---------
      const colT = clamp01(level * 0.7 + beat * 0.3);
      const [cr, cg, cb] = lerpColor(colT);
      const colStr = `${cr},${cg},${cb}`;

      // === LAYER 0: ambient glow (audio-reactive) ===
      if (peak > 0.03) {
        const glowR = Math.min(this.width, this.height) * 0.7 * (0.25 + peak * 0.75);
        const ga = peak * 0.10 + beat * 0.06;
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
        grd.addColorStop(0,   `rgba(239,49,35,${ga})`);
        grd.addColorStop(0.4, `rgba(200,60,40,${ga * 0.4})`);
        grd.addColorStop(1,   'rgba(239,49,35,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, this.width, this.height);
      }

      // === LAYER 1: dust ===
      for (let i = 0; i < this.dust.length; i++) {
        const d = this.dust[i];
        const e = this._entranceEase(d, now);
        if (!e) continue;
        const wobX = Math.sin(now * 0.001 + d.phase) * 0.5;
        const wobY = Math.cos(now * 0.0008 + d.phase) * 0.4;
        const x = e.x + wobX, y = e.y + wobY;
        const opBoost = level * 0.2 + beat * 0.15;
        const op = clamp01((d.opacity + opBoost) * e.ex);
        if (op < 0.01) continue;
        ctx.globalAlpha = op;
        ctx.fillStyle = `rgb(${colStr})`;
        ctx.beginPath();
        ctx.arc(x, y, d.radius + peak * 0.4, 0, TAU);
        ctx.fill();
      }

      // === LAYER 2: core — connections first, then dots ===
      // Pre-compute draw positions for connections
      const corePos = [];
      for (let i = 0; i < this.core.length; i++) {
        const p = this.core[i];
        const e = this._entranceEase(p, now);
        if (!e) { corePos.push(null); continue; }
        const wobX = Math.sin(now * 0.0016 + p.phase) * p.amplitude * 0.35;
        const wobY = Math.cos(now * 0.0013 + p.phase) * p.amplitude * 0.25;
        corePos.push({ x: e.x + wobX, y: e.y + wobY, ex: e.ex, p });
      }

      // --- connection lines ---
      // Max connection distance expands with audio
      const connDist = 14 + level * 18 + beat * 8;
      const connDistSq = connDist * connDist;

      ctx.lineWidth = 0.5 + level * 0.4;
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
          const lineOp = t * t * (0.12 + level * 0.25 + beat * 0.2) * Math.min(a.ex, b.ex);
          if (lineOp < 0.005) continue;
          ctx.globalAlpha = lineOp;
          ctx.strokeStyle = `rgb(${colStr})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // --- core dots ---
      for (let i = 0; i < corePos.length; i++) {
        const c = corePos[i];
        if (!c) continue;
        const p = c.p;
        const opBoost = level * 0.3 + beat * 0.2;
        const op = clamp01((p.baseOpacity + opBoost) * c.ex);
        if (op < 0.01) continue;
        const r = p.radius + peak * 0.8 + beat * 0.5;
        ctx.globalAlpha = op;
        ctx.fillStyle = `rgb(${colStr})`;
        ctx.beginPath();
        ctx.arc(c.x, c.y, r, 0, TAU);
        ctx.fill();
      }

      // === LAYER 3: embers — glowing orbs ===
      for (let i = 0; i < this.embers.length; i++) {
        const em = this.embers[i];
        const e = this._entranceEase(em, now);
        if (!e) continue;
        const wobX = Math.sin(now * 0.0014 + em.phase) * em.amplitude * 0.45;
        const wobY = Math.cos(now * 0.0011 + em.phase) * em.amplitude * 0.35;
        const x = e.x + wobX, y = e.y + wobY;

        // Sparkle: periodic bright flash
        let sparkle = 0;
        if (now >= em.sparkleAt) {
          const sT = (now - em.sparkleAt) / em.sparkleDur;
          if (sT < 1) {
            sparkle = Math.sin(sT * PI); // bell-shaped flash
          } else {
            // Schedule next sparkle
            em.sparkleAt = now + rand(1500, 4500);
            em.sparkleDur = rand(200, 500);
          }
        }

        const opBoost = level * 0.35 + beat * 0.3 + sparkle * 0.3;
        const op = clamp01((em.baseOpacity + opBoost) * e.ex);
        if (op < 0.01) continue;

        const r = em.radius + peak * 1.2 + beat * 1.0 + sparkle * 0.8;

        // Soft halo / glow ring around ember
        const haloR = r * (2.2 + level * 1.5 + sparkle * 1.0);
        const haloA = op * (0.10 + level * 0.12 + sparkle * 0.15);
        if (haloA > 0.005) {
          const hGrd = ctx.createRadialGradient(x, y, r * 0.3, x, y, haloR);
          hGrd.addColorStop(0,   `rgba(239,49,35,${haloA})`);
          hGrd.addColorStop(0.5, `rgba(${colStr},${haloA * 0.4})`);
          hGrd.addColorStop(1,   `rgba(${colStr},0)`);
          ctx.globalAlpha = 1;
          ctx.fillStyle = hGrd;
          ctx.beginPath();
          ctx.arc(x, y, haloR, 0, TAU);
          ctx.fill();
        }

        // Solid ember dot
        ctx.globalAlpha = op;
        ctx.fillStyle = `rgb(${colStr})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();

        // Bright inner hot-spot (white-ish at high energy)
        if (level > 0.1 || sparkle > 0) {
          const hotA = (level * 0.35 + sparkle * 0.5) * e.ex;
          if (hotA > 0.01) {
            ctx.globalAlpha = hotA;
            ctx.fillStyle = `rgba(255,240,230,${hotA})`;
            ctx.beginPath();
            ctx.arc(x, y, r * 0.45, 0, TAU);
            ctx.fill();
          }
        }
      }

      ctx.globalAlpha = 1;
    }
  }

  window.SoundParticles = SoundParticles;
})();
