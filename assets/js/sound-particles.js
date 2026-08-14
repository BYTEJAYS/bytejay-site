/**
 * SoundParticles — the tiny particle field beside "PLAYGROUND".
 *
 * A compact, center-weighted cloud of ~80-180 near-invisible dots that never
 * sits still: a slow noise-driven flow field, a spring pulling each particle
 * back toward its own resting spot, a very weak pull toward the cloud's
 * center, gentle pointer disturbance, and (once audio is playing) a small
 * amount of energy from the track's live amplitude. Nothing here is meant to
 * read as "a particle animation" — it should read as "something small is
 * quietly alive there."
 *
 * Usage:
 *   const sp = new SoundParticles(canvasEl, { getAudioLevel: () => 0..1 });
 *   sp.setActive(true);   // hover — the field gets slightly more energetic
 *   sp.destroy();
 *
 * Everything here lives on plain objects inside one rAF loop — no React
 * state, no DOM per particle, no per-frame allocation once the field is
 * built.
 */
(function () {
  'use strict';

  const TAU = Math.PI * 2;

  // ---- tiny 2D simplex-style value noise (no dependency) -----------------
  // A standard permutation-table gradient noise: smooth, non-repeating,
  // cheap. This is the "flow field" the particles drift through.
  function makeNoise2D(seed) {
    const perm = new Uint8Array(512);
    const p = new Uint8Array(256);
    let s = seed >>> 0 || 1;
    const rand = () => {
      s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
      return ((s >>> 0) % 1000) / 1000;
    };
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const t = p[i]; p[i] = p[j]; p[j] = t;
    }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

    const grad2 = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    const lerp = (a, b, t) => a + t * (b - a);
    const dot = (g, x, y) => g[0] * x + g[1] * y;

    return function noise2D(x, y) {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const xf = x - Math.floor(x);
      const yf = y - Math.floor(y);
      const u = fade(xf);
      const v = fade(yf);
      const g00 = grad2[perm[X + perm[Y]] & 7];
      const g10 = grad2[perm[X + 1 + perm[Y]] & 7];
      const g01 = grad2[perm[X + perm[Y + 1]] & 7];
      const g11 = grad2[perm[X + 1 + perm[Y + 1]] & 7];
      const n00 = dot(g00, xf, yf);
      const n10 = dot(g10, xf - 1, yf);
      const n01 = dot(g01, xf, yf - 1);
      const n11 = dot(g11, xf - 1, yf - 1);
      return lerp(lerp(n00, n10, u), lerp(n01, n11, u), v); // roughly [-1, 1]
    };
  }

  function rand(min, max) { return min + Math.random() * (max - min); }

  // Sum of three uniforms approximates a bell curve — cheap way to get a
  // centre-weighted, irregular (never gridded) cloud instead of a uniform fill.
  function centerBiased() {
    return (Math.random() + Math.random() + Math.random()) / 3;
  }

  class SoundParticles {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {Object} [opts]
     * @param {() => number} [opts.getAudioLevel] returns 0..1, live
     * @param {number} [opts.seed]
     */
    constructor(canvas, opts) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.opts = opts || {};
      this.noise = makeNoise2D((this.opts.seed || 1337) * 2654435761);

      this.particles = [];
      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.active = false;      // hover state
      this.pointer = null;      // {x, y} in canvas-local px, or null
      this.pointerTarget = null; // eased toward `pointer`
      this.raf = 0;
      this.startTime = performance.now();
      this.destroyed = false;
      this._displayAudio = 0;   // eased copy of getAudioLevel()

      this._onResize = this._resize.bind(this);
      this._onPointerMove = this._handlePointerMove.bind(this);
      this._onPointerLeave = this._handlePointerLeave.bind(this);
      this._onVisibility = this._handleVisibility.bind(this);

      this._resize();
      window.addEventListener('resize', this._onResize, { passive: true });
      document.addEventListener('visibilitychange', this._onVisibility);

      const host = canvas.closest('[data-playground]') || canvas;
      host.addEventListener('pointermove', this._onPointerMove);
      host.addEventListener('pointerleave', this._onPointerLeave);

      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.raf = requestAnimationFrame((t) => this._tick(t));
      } else {
        this._buildParticles(); // static field, drawn once
        this._draw(performance.now());
      }
    }

    setActive(active) { this.active = !!active; }

    destroy() {
      this.destroyed = true;
      cancelAnimationFrame(this.raf);
      window.removeEventListener('resize', this._onResize);
      document.removeEventListener('visibilitychange', this._onVisibility);
      const host = this.canvas.closest('[data-playground]') || this.canvas;
      host.removeEventListener('pointermove', this._onPointerMove);
      host.removeEventListener('pointerleave', this._onPointerLeave);
    }

    // ---- layout ------------------------------------------------------
    _resize() {
      const rect = this.canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      if (w === this.width && h === this.height && this.particles.length) return;
      this.width = w;
      this.height = h;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(w * this.dpr);
      this.canvas.height = Math.round(h * this.dpr);
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = h + 'px';
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this._buildParticles();
    }

    _particleCount() {
      // Responsive density: full field on desktop, thinner on smaller canvases
      // — recomputed from the canvas itself, not just scaled visually.
      const area = this.width * this.height;
      if (this.width < 40) return 0;
      if (area < 900) return Math.round(rand(70, 90));      // mobile-sized canvas
      if (area < 1500) return Math.round(rand(105, 125));   // tablet-sized
      return Math.round(rand(150, 178));                    // desktop
    }

    _buildParticles() {
      const cx = this.width / 2;
      const cy = this.height / 2;
      // Horizontal cloud: wider than tall, matching a small word-height field.
      const rx = this.width / 2;
      const ry = this.height / 2;
      const n = this._particleCount();
      const particles = new Array(n);
      const now = performance.now();
      for (let i = 0; i < n; i++) {
        const ang = rand(0, TAU);
        const r = centerBiased(); // 0..1, center-weighted
        const bx = cx + Math.cos(ang) * rx * r;
        const by = cy + Math.sin(ang) * ry * r;
        particles[i] = {
          baseX: bx, baseY: by,
          x: bx, y: by,
          vx: 0, vy: 0,
          radius: rand(0.6, 1.4),
          baseOpacity: rand(0.15, 0.75),
          phase: rand(0, TAU),
          noiseOffset: rand(0, 1000),
          noiseSpeed: rand(0.00012, 0.00028),
          amplitude: rand(0.4, 1.6),
          // staggered, individually-timed entrance — not a single fade
          enterAt: now + rand(0, 480),
          enterDur: rand(420, 820),
        };
      }
      this.particles = particles;
      this.startTime = now;
    }

    // ---- pointer -------------------------------------------------------
    _handlePointerMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      // Interaction field extends slightly beyond the canvas itself, so the
      // cloud notices the cursor approaching before it's directly overhead.
      this.pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    _handlePointerLeave() {
      this.pointer = null;
    }

    _handleVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(this.raf);
      } else if (!this.destroyed) {
        this.raf = requestAnimationFrame((t) => this._tick(t));
      }
    }

    // ---- animation -------------------------------------------------------
    _tick(now) {
      if (this.destroyed) return;
      this.raf = requestAnimationFrame((t) => this._tick(t));
      this._step(now);
      this._draw(now);
    }

    _step(now) {
      const audioRaw = this.opts.getAudioLevel ? this.opts.getAudioLevel() : 0;
      // Ease the audio reading so it nudges the field rather than flickering
      // it — this is meant to feel alive, not like a level meter.
      this._displayAudio += (audioRaw - this._displayAudio) * 0.06;

      const hoverBoost = this.active ? 1.18 : 1;
      const audioBoost = 1 + this._displayAudio * 0.35; // stays subtle even loud
      const flowForce = 0.0026 * hoverBoost * audioBoost;
      const springStrength = 0.010;
      const centerAttract = 0.00035;
      const damping = 0.965 - (this.active ? 0.01 : 0); // a touch livelier on hover
      const noiseScale = 0.045;
      const cx = this.width / 2;
      const cy = this.height / 2;
      const interactionRadius = Math.max(46, Math.min(100, this.width * 0.9));

      const particles = this.particles;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // entrance: not yet started, or mid-entrance — skip physics, handled in draw
        if (now < p.enterAt) continue;

        // flow field
        const n = this.noise(
          p.x * noiseScale + p.noiseOffset,
          p.y * noiseScale + now * p.noiseSpeed
        );
        const angle = n * TAU;
        p.vx += Math.cos(angle) * flowForce;
        p.vy += Math.sin(angle) * flowForce;

        // spring back toward this particle's own resting position
        p.vx += (p.baseX - p.x) * springStrength;
        p.vy += (p.baseY - p.y) * springStrength;

        // very weak whole-cloud cohesion
        p.vx += (cx - p.x) * centerAttract;
        p.vy += (cy - p.y) * centerAttract;

        // pointer disturbance — soft falloff, never a hard boundary
        if (this.pointer) {
          const dx = p.x - this.pointer.x;
          const dy = p.y - this.pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < interactionRadius && dist > 0.001) {
            let force = 1 - dist / interactionRadius;
            force *= force; // eased falloff, per spec
            const push = force * 0.16;
            p.vx += (dx / dist) * push;
            p.vy += (dy / dist) * push;
          }
        }

        p.vx *= damping;
        p.vy *= damping;
        p.x += p.vx;
        p.y += p.vy;
      }
    }

    _draw(now) {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);
      const particles = this.particles;
      const audioOpacity = 1 + this._displayAudio * 0.25;

      ctx.fillStyle = 'currentColor';
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        let ex = 1; // entrance progress 0..1
        let drawX = p.x;
        let drawY = p.y;
        if (now < p.enterAt) continue; // not born yet
        const t = (now - p.enterAt) / p.enterDur;
        if (t < 1) {
          ex = 1 - Math.pow(1 - t, 3); // ease-out cubic
          // drift in from a small random offset outside its resting spot
          const startX = p.baseX + Math.cos(p.phase) * 10;
          const startY = p.baseY + Math.sin(p.phase) * 10;
          drawX = startX + (p.baseX - startX) * ex;
          drawY = startY + (p.baseY - startY) * ex;
        }

        // tiny render-only wobble on top of the physics position — the
        // "phase / amplitude" fields the spec calls out separately.
        const wobble = Math.sin(now * 0.0016 + p.phase) * p.amplitude * 0.35;
        const x = drawX + wobble;
        const y = drawY + Math.cos(now * 0.0013 + p.phase) * p.amplitude * 0.25;

        const opacity = Math.min(0.85, p.baseOpacity * audioOpacity * ex);
        if (opacity <= 0.01) continue;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(x, y, p.radius, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  window.SoundParticles = SoundParticles;
})();
