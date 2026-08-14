/**
 * SakuraDrift — Falling cherry blossom petals and atmospheric drifting breeze.
 *
 * Inspired by the Three.js Journey / Folio baseline cherry tree ecosystem.
 * Generates fluttering 3D-rotated organic petals that curl through wind vectors,
 * respond to cursor turbulence, and settle/drift across the page sections.
 */
(function () {
  'use strict';

  const TAU = Math.PI * 2;

  class SakuraDrift {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.petals = [];
      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.wind = { x: 0.6, y: 0.9, targetX: 0.6, targetY: 0.9 };
      this.mouse = { x: -1000, y: -1000, vx: 0, vy: 0, px: -1000, py: -1000 };
      this.lastTime = performance.now();
      this.raf = 0;

      // Palette of soft cherry blossom shades
      this.palette = [
        { fill: 'rgba(255, 192, 203, 0.65)', edge: 'rgba(240, 140, 165, 0.85)', dark: 'rgba(220, 110, 140, 0.7)' },
        { fill: 'rgba(255, 215, 225, 0.75)', edge: 'rgba(250, 160, 185, 0.85)', dark: 'rgba(230, 130, 155, 0.7)' },
        { fill: 'rgba(255, 180, 195, 0.60)', edge: 'rgba(235, 120, 150, 0.80)', dark: 'rgba(210, 95, 130, 0.65)' },
        { fill: 'rgba(255, 240, 245, 0.85)', edge: 'rgba(245, 175, 195, 0.75)', dark: 'rgba(225, 145, 165, 0.6)' },
        { fill: 'rgba(250, 165, 185, 0.70)', edge: 'rgba(230, 105, 135, 0.90)', dark: 'rgba(200, 80, 115, 0.75)' }
      ];

      this._onResize = this.resize.bind(this);
      this._onMouseMove = this.onMouseMove.bind(this);
      this._onScroll = this.onScroll.bind(this);

      this.init();
    }

    init() {
      this.resize();
      window.addEventListener('resize', this._onResize, { passive: true });
      window.addEventListener('mousemove', this._onMouseMove, { passive: true });
      window.addEventListener('scroll', this._onScroll, { passive: true });

      const count = this.width < 768 ? 28 : 55;
      for (let i = 0; i < count; i++) {
        this.petals.push(this.createPetal(true));
      }

      this.loop();
    }

    createPetal(initial = false) {
      const size = 6 + Math.random() * 9;
      return {
        x: Math.random() * this.width,
        y: initial ? Math.random() * this.height : -30 - Math.random() * 50,
        z: 0.3 + Math.random() * 0.7, // depth layer
        size: size,
        length: size * (1.3 + Math.random() * 0.5),
        color: this.palette[Math.floor(Math.random() * this.palette.length)],
        rotation: Math.random() * TAU,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        tilt: Math.random() * TAU,
        tiltSpeed: 0.015 + Math.random() * 0.025,
        swing: Math.random() * TAU,
        swingSpeed: 0.01 + Math.random() * 0.02,
        vx: 0,
        vy: 0.7 + Math.random() * 1.1,
        curl: 0.2 + Math.random() * 0.4,
        notch: Math.random() > 0.4
      };
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.canvas.style.width = this.width + 'px';
      this.canvas.style.height = this.height + 'px';
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    onMouseMove(e) {
      this.mouse.vx = (e.clientX - this.mouse.px) * 0.3;
      this.mouse.vy = (e.clientY - this.mouse.py) * 0.3;
      this.mouse.px = e.clientX;
      this.mouse.py = e.clientY;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;

      // Subtle breeze shift with cursor
      this.wind.targetX = 0.5 + (e.clientX / this.width - 0.5) * 0.8;
    }

    onScroll() {
      // Wind gust down on fast scroll
      this.wind.targetY = 1.6;
      clearTimeout(this._scrollTimeout);
      this._scrollTimeout = setTimeout(() => {
        this.wind.targetY = 0.9;
      }, 300);
    }

    loop() {
      this.raf = requestAnimationFrame(() => this.loop());
      const now = performance.now();
      const dt = Math.min((now - this.lastTime) / 16.67, 2);
      this.lastTime = now;

      this.update(dt);
      this.render();
    }

    update(dt) {
      // Smooth wind transition
      this.wind.x += (this.wind.targetX - this.wind.x) * 0.03 * dt;
      this.wind.y += (this.wind.targetY - this.wind.y) * 0.03 * dt;

      const mx = this.mouse.x;
      const my = this.mouse.y;

      for (let i = 0; i < this.petals.length; i++) {
        const p = this.petals[i];

        p.rotation += p.rotSpeed * dt;
        p.tilt += p.tiltSpeed * dt;
        p.swing += p.swingSpeed * dt;

        // Flutter oscillation
        const swingForce = Math.sin(p.swing) * 0.6 * p.z;
        p.vx = (this.wind.x * p.z + swingForce) * dt;
        p.vy = (this.wind.y * p.z + 0.3) * dt;

        // Mouse turbulence deflection
        const dx = p.x - mx;
        const dy = p.y - my;
        const distSq = dx * dx + dy * dy;
        if (distSq < 16000 && distSq > 4) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / 126) * 3.5 * p.z;
          p.x += (dx / dist) * force * dt;
          p.y += (dy / dist) * force * dt;
          p.rotation += (this.mouse.vx * 0.02) * dt;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Reset if offscreen
        if (p.y > this.height + 40 || p.x > this.width + 50 || p.x < -50) {
          this.petals[i] = this.createPetal(false);
          this.petals[i].x = Math.random() * (this.width + 100) - 50;
        }
      }
    }

    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);

      for (let i = 0; i < this.petals.length; i++) {
        const p = this.petals[i];

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        // 3D tumble perspective scale
        const scaleX = Math.cos(p.tilt);
        const scaleY = Math.sin(p.swing * 0.8) * 0.2 + 0.9;
        ctx.scale(scaleX * p.z, scaleY * p.z);

        // Draw organic petal shape
        const w = p.size;
        const h = p.length;

        ctx.beginPath();
        ctx.moveTo(0, -h * 0.5);
        ctx.bezierCurveTo(w * 0.8, -h * 0.3, w * 0.9, h * 0.3, 0, h * 0.5);
        if (p.notch) {
          // Small sakura petal notch at the tip
          ctx.lineTo(-w * 0.15, h * 0.42);
        }
        ctx.bezierCurveTo(-w * 0.9, h * 0.3, -w * 0.8, -h * 0.3, 0, -h * 0.5);
        ctx.closePath();

        // Subtle gradient on petal
        const grad = ctx.createLinearGradient(0, -h * 0.5, 0, h * 0.5);
        grad.addColorStop(0, p.color.fill);
        grad.addColorStop(0.7, p.color.edge);
        grad.addColorStop(1, p.color.dark);

        ctx.fillStyle = grad;
        ctx.fill();

        // Subtle center vein
        ctx.strokeStyle = p.color.dark;
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.moveTo(0, -h * 0.3);
        ctx.lineTo(0, h * 0.25);
        ctx.stroke();

        ctx.restore();
      }
    }
  }

  window.SakuraDrift = SakuraDrift;
})();
