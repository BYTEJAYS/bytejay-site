"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Galekto.com's cursor colour engine, ported 1:1: a WebGL stable-fluids
 * sim (after PavelDoGreat/WebGL-Fluid-Simulation, MIT — the same base
 * galekto's fluid.js credits, with their exact config). Mouse movement
 * splats grey dye; strokes linger, swirl and dissipate like ink, and
 * three streamers orbit on their own when the mouse rests.
 *
 * Display works exactly like galekto's live site: dye density becomes an
 * alpha mask (their hard 0.08→0.09 smoothstep edge) that reveals colour
 * where the fluid flows and stays fully transparent everywhere else. On
 * galekto the mask reveals their Sanity-hosted sunset-marble artwork;
 * here the same palette — coral #F09672, peach #F5AD85, dusty rose
 * #CE8794, lavender #988AB7 — is rebuilt procedurally in the display
 * shader (slow-drifting marble bands), so the exact colours ride the
 * fluid without borrowing their asset. The rest of the viewport stays
 * untouched, which is what makes the splat pop against the dark site.
 *
 * The whole show lives on the home hero only: the canvas fades out as
 * the first screen scrolls away (sim and splats pause once hidden), and
 * the component doesn't mount at all on the other routes.
 */

/* ── engine constants (verbatim from galekto fluid.js CFG / main.js) ── */
const SIM_RESOLUTION = 128;
const DYE_RESOLUTION = 512;
const DENSITY_DISSIPATION = 0.985;
const VELOCITY_DISSIPATION = 0.995;
const PRESSURE = 0.8;
const PRESSURE_ITERATIONS = 20;
const CURL = 25;
const SPLAT_RADIUS = 0.22;
const SPLAT_FORCE = 6000;
const EDGE_LOW = 0.08;
const EDGE_HIGH = 0.09;
const DYE_GRAY = 0.76;
const IDLE_DELAY = 2200;
const IDLE_FLUID_INTERVAL = 0.038;

/* ── shaders (after PavelDoGreat, trimmed to what galekto uses) ── */
const VS = `
precision highp float;
attribute vec2 aPosition;
varying vec2 vUv, vL, vR, vT, vB;
uniform vec2 texelSize;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FS_SPLAT = `
precision highp float; precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main () {
  vec2 p = vUv - point;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  vec3 base = texture2D(uTarget, vUv).xyz;
  gl_FragColor = vec4(base + splat, 1.0);
}`;

const FS_ADVECTION = `
precision highp float; precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;
void main () {
  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
  gl_FragColor = dissipation * texture2D(uSource, coord);
  gl_FragColor.a = 1.0;
}`;

const FS_DIVERGENCE = `
precision highp float; precision highp sampler2D;
varying vec2 vUv, vL, vR, vT, vB;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;
  vec2 C = texture2D(uVelocity, vUv).xy;
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }
  gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;

const FS_CURL = `
precision highp float; precision highp sampler2D;
varying vec2 vUv, vL, vR, vT, vB;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`;

const FS_VORTICITY = `
precision highp float; precision highp sampler2D;
varying vec2 vUv, vL, vR, vT, vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;
void main () {
  float L = texture2D(uCurl, vL).x;
  float R = texture2D(uCurl, vR).x;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;
  vec2 velocity = texture2D(uVelocity, vUv).xy + force * dt;
  velocity = min(max(velocity, -1000.0), 1000.0);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}`;

const FS_CLEAR = `
precision highp float; precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;
void main () { gl_FragColor = value * texture2D(uTexture, vUv); }`;

const FS_PRESSURE = `
precision highp float; precision highp sampler2D;
varying vec2 vUv, vL, vR, vT, vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  float divergence = texture2D(uDivergence, vUv).x;
  gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
}`;

const FS_GRADIENT_SUBTRACT = `
precision highp float; precision highp sampler2D;
varying vec2 vUv, vL, vR, vT, vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}`;

/* galekto's display shader, verbatim mechanics: dye density → alpha mask
   revealing colour. Their live site reveals a sunset-marble artwork; the
   same palette is generated here procedurally. */
const FS_DISPLAY = `
precision highp float; precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uEdgeLow;
uniform float uEdgeHigh;
uniform float uTime;

vec3 sunset(vec2 uv, float t) {
  /* galekto's palette, deepened ~28% so white hero text keeps its punch
     inside the wash (screen blend brightens the backdrop) */
  vec3 coral    = vec3(0.729, 0.408, 0.286); /* burnt #BA6849 */
  vec3 peach    = vec3(0.796, 0.494, 0.341); /* ember #CB7E57 */
  vec3 rose     = vec3(0.608, 0.365, 0.427); /* deep rose #9B5D6D */
  vec3 lavender = vec3(0.427, 0.376, 0.545); /* plum #6D608B */

  vec3 col = mix(coral, rose, smoothstep(0.0, 0.55, uv.y));
  col = mix(col, lavender, smoothstep(0.45, 1.05, uv.y));

  /* slow marble swirls in peach, like the brushed bands in the artwork */
  float w  = sin(uv.x * 7.5 + sin(uv.y * 6.0 + t * 0.18) * 2.2 + uv.y * 5.0 + t * 0.06);
  float w2 = sin(uv.x * 3.1 - uv.y * 9.0 - t * 0.11 + sin(uv.x * 11.0) * 0.8);
  float band = smoothstep(0.62, 0.97, w) + smoothstep(0.75, 0.99, w2) * 0.6;
  col = mix(col, peach, clamp(band, 0.0, 1.0) * 0.85);
  return col;
}

void main () {
  vec3 dye = texture2D(uTexture, vUv).rgb;
  float density = max(dye.r, max(dye.g, dye.b));
  float alpha = smoothstep(uEdgeLow, uEdgeHigh, density);
  if (alpha < 0.004) { gl_FragColor = vec4(0.0); return; }
  vec3 col = sunset(vUv, uTime);
  gl_FragColor = vec4(col * alpha, alpha);
}`;

type FBO = {
  fbo: WebGLFramebuffer;
  tex: WebGLTexture;
  attach: (id: number) => number;
};
type DoubleFBO = {
  read: FBO;
  write: FBO;
  swap: () => void;
  texelSizeX: number;
  texelSizeY: number;
};

export default function LiquidReveal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  /* home page only — /projects, /journey, /album and /hackathons keep
     their original colours with no grey veil */
  const active = pathname === "/";

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* front screen only — the veil thins as the hero scrolls away and is
       gone past it, so the sections below keep their full colours */
    let veil = 1;
    const applyFade = () => {
      veil = Math.max(0, 1 - window.scrollY / (window.innerHeight * 0.65));
      const vis = veil <= 0 ? "hidden" : "visible";
      canvas.style.opacity = String(veil);
      canvas.style.visibility = vis;
    };
    applyFade();
    window.addEventListener("scroll", applyFade, { passive: true });
    const removeFade = () => window.removeEventListener("scroll", applyFade);

    if (
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return removeFade;
    }

    /* ── pointer / idle state (main.js) ── */
    let idleT = 0, idleFluidTimer = 0;
    let isIdle = true;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let prevMouseX = 0, prevMouseY = 0, hasPrev = false;

    /* ── WebGL fluid sim ── */
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      premultipliedAlpha: true,
    }) as WebGL2RenderingContext | null;
    const floatExt = gl?.getExtension("EXT_color_buffer_float");
    const fluidOn = !!gl && !!floatExt;

    let velocity: DoubleFBO, dye: DoubleFBO;
    let divergence: FBO, curlFBO: FBO, pressure: DoubleFBO;
    const programs: Record<
      string,
      { prog: WebGLProgram; uniforms: Record<string, WebGLUniformLocation> }
    > = {};

    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }
    function program(name: string, fsSrc: string) {
      const p = gl!.createProgram()!;
      gl!.attachShader(p, compile(gl!.VERTEX_SHADER, VS));
      gl!.attachShader(p, compile(gl!.FRAGMENT_SHADER, fsSrc));
      gl!.linkProgram(p);
      const uniforms: Record<string, WebGLUniformLocation> = {};
      const n = gl!.getProgramParameter(p, gl!.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) {
        const info = gl!.getActiveUniform(p, i)!;
        uniforms[info.name] = gl!.getUniformLocation(p, info.name)!;
      }
      programs[name] = { prog: p, uniforms };
    }

    let quad: WebGLBuffer;
    function blit(target: FBO | null, w?: number, h?: number) {
      if (target) {
        gl!.viewport(0, 0, w ?? 0, h ?? 0);
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, target.fbo);
      } else {
        gl!.viewport(0, 0, canvas!.width, canvas!.height);
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      }
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    function createFBO(w: number, h: number): FBO {
      const tex = gl!.createTexture()!;
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA16F, w, h, 0, gl!.RGBA, gl!.HALF_FLOAT, null);
      const fbo = gl!.createFramebuffer()!;
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, tex, 0);
      gl!.clearColor(0, 0, 0, 1);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      return {
        fbo,
        tex,
        attach(id: number) {
          gl!.activeTexture(gl!.TEXTURE0 + id);
          gl!.bindTexture(gl!.TEXTURE_2D, tex);
          return id;
        },
      };
    }
    function createDoubleFBO(w: number, h: number): DoubleFBO {
      let read = createFBO(w, h);
      let write = createFBO(w, h);
      return {
        get read() { return read; },
        get write() { return write; },
        swap() { const t = read; read = write; write = t; },
        texelSizeX: 1 / w,
        texelSizeY: 1 / h,
      } as DoubleFBO;
    }

    function getResolution(base: number) {
      let aspect = gl!.drawingBufferWidth / gl!.drawingBufferHeight;
      if (aspect < 1) aspect = 1 / aspect;
      const min = Math.round(base);
      const max = Math.round(base * aspect);
      return gl!.drawingBufferWidth > gl!.drawingBufferHeight
        ? { w: max, h: min }
        : { w: min, h: max };
    }

    let simW = 0, simH = 0, dyeW = 0, dyeH = 0;
    function initFramebuffers() {
      const sim = getResolution(SIM_RESOLUTION);
      const dyeRes = getResolution(DYE_RESOLUTION);
      simW = sim.w; simH = sim.h; dyeW = dyeRes.w; dyeH = dyeRes.h;
      velocity = createDoubleFBO(simW, simH);
      dye = createDoubleFBO(dyeW, dyeH);
      divergence = createFBO(simW, simH);
      curlFBO = createFBO(simW, simH);
      pressure = createDoubleFBO(simW, simH);
    }

    if (fluidOn) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      quad = gl!.createBuffer()!;
      gl!.bindBuffer(gl!.ARRAY_BUFFER, quad);
      gl!.bufferData(
        gl!.ARRAY_BUFFER,
        new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1]),
        gl!.STATIC_DRAW
      );
      gl!.enableVertexAttribArray(0);
      gl!.vertexAttribPointer(0, 2, gl!.FLOAT, false, 0, 0);

      program("splat", FS_SPLAT);
      program("advection", FS_ADVECTION);
      program("divergence", FS_DIVERGENCE);
      program("curl", FS_CURL);
      program("vorticity", FS_VORTICITY);
      program("clear", FS_CLEAR);
      program("pressure", FS_PRESSURE);
      program("gradSubtract", FS_GRADIENT_SUBTRACT);
      program("display", FS_DISPLAY);
      initFramebuffers();
    }

    function bind(name: string) {
      gl!.useProgram(programs[name].prog);
      return programs[name].uniforms;
    }

    function doSplat(x: number, y: number, dx: number, dy: number) {
      const ar = canvas!.width / canvas!.height;
      const radius = (SPLAT_RADIUS / 100) * (ar > 1 ? ar : 1);
      let u = bind("splat");
      gl!.uniform1i(u.uTarget, velocity.read.attach(0));
      gl!.uniform1f(u.aspectRatio, ar);
      gl!.uniform2f(u.point, x / canvas!.width, 1 - y / canvas!.height);
      gl!.uniform3f(u.color, dx * SPLAT_FORCE, -dy * SPLAT_FORCE, 0);
      gl!.uniform1f(u.radius, radius);
      blit(velocity.write, simW, simH);
      velocity.swap();

      gl!.uniform1i(u.uTarget, dye.read.attach(0));
      gl!.uniform3f(u.color, DYE_GRAY, DYE_GRAY, DYE_GRAY);
      blit(dye.write, dyeW, dyeH);
      dye.swap();
    }

    function stepFluid(dt: number) {
      gl!.disable(gl!.BLEND);

      let u = bind("curl");
      gl!.uniform2f(u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(u.uVelocity, velocity.read.attach(0));
      blit(curlFBO, simW, simH);

      u = bind("vorticity");
      gl!.uniform2f(u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(u.uVelocity, velocity.read.attach(0));
      gl!.uniform1i(u.uCurl, curlFBO.attach(1));
      gl!.uniform1f(u.curl, CURL);
      gl!.uniform1f(u.dt, dt);
      blit(velocity.write, simW, simH);
      velocity.swap();

      u = bind("divergence");
      gl!.uniform2f(u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(u.uVelocity, velocity.read.attach(0));
      blit(divergence, simW, simH);

      u = bind("clear");
      gl!.uniform1i(u.uTexture, pressure.read.attach(0));
      gl!.uniform1f(u.value, PRESSURE);
      blit(pressure.write, simW, simH);
      pressure.swap();

      u = bind("pressure");
      gl!.uniform2f(u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(u.uDivergence, divergence.attach(0));
      for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
        gl!.uniform1i(u.uPressure, pressure.read.attach(1));
        blit(pressure.write, simW, simH);
        pressure.swap();
      }

      u = bind("gradSubtract");
      gl!.uniform2f(u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(u.uPressure, pressure.read.attach(0));
      gl!.uniform1i(u.uVelocity, velocity.read.attach(1));
      blit(velocity.write, simW, simH);
      velocity.swap();

      u = bind("advection");
      gl!.uniform2f(u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(u.uVelocity, velocity.read.attach(0));
      gl!.uniform1i(u.uSource, velocity.read.attach(0));
      gl!.uniform1f(u.dt, dt);
      gl!.uniform1f(u.dissipation, VELOCITY_DISSIPATION);
      blit(velocity.write, simW, simH);
      velocity.swap();

      gl!.uniform1i(u.uVelocity, velocity.read.attach(0));
      gl!.uniform1i(u.uSource, dye.read.attach(1));
      gl!.uniform1f(u.dissipation, DENSITY_DISSIPATION);
      blit(dye.write, dyeW, dyeH);
      dye.swap();
    }

    let simTime = 0;
    function renderFluid() {
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.enable(gl!.BLEND);
      gl!.blendFunc(gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA);
      const u = bind("display");
      gl!.uniform1i(u.uTexture, dye.read.attach(0));
      gl!.uniform1f(u.uEdgeLow, EDGE_LOW);
      gl!.uniform1f(u.uEdgeHigh, EDGE_HIGH);
      gl!.uniform1f(u.uTime, simTime);
      blit(null);
    }

    /* ── main loop (main.js loop, trimmed to the two engines) ── */
    let raf = 0;
    let lastTs = 0;
    let stopped = false;
    function loop(ts: number) {
      if (stopped) return;
      const dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;
      simTime += dt;

      if (isIdle && veil > 0) {
        idleT += dt;
        /* idle: three fluid streamers orbit like on galekto */
        if (fluidOn) {
          idleFluidTimer += dt;
          if (idleFluidTimer >= IDLE_FLUID_INTERVAL) {
            idleFluidTimer = 0;
            const cx = window.innerWidth * 0.5;
            const cy = window.innerHeight * 0.44;
            const baseR = Math.min(window.innerWidth, window.innerHeight) * 0.15;
            (
              [
                { spd: 0.52, r: baseR * 1.0, ph: 0.0 },
                { spd: 0.33, r: baseR * 1.55, ph: Math.PI * 0.667 },
                { spd: 0.74, r: baseR * 0.72, ph: Math.PI * 1.333 },
              ] as const
            ).forEach((s) => {
              const ang = idleT * s.spd + s.ph;
              const sx = cx + Math.cos(ang) * s.r;
              const sy = cy + Math.sin(ang) * s.r;
              const vx = -Math.sin(ang) * s.spd * 0.0018;
              const vy = Math.cos(ang) * s.spd * 0.0018;
              doSplat(sx, sy, vx, vy);
            });
          }
        }
      }

      if (fluidOn && veil > 0) {
        stepFluid(dt);
        renderFluid();
      }

      raf = requestAnimationFrame(loop);
    }

    /* ── events (main.js setupEvents) ── */
    const onMove = (e: MouseEvent) => {
      if (fluidOn && hasPrev && veil > 0) {
        const dx = (e.clientX - prevMouseX) / window.innerWidth;
        const dy = (e.clientY - prevMouseY) / window.innerHeight;
        doSplat(e.clientX, e.clientY, dx, dy);
      }
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      hasPrev = true;

      isIdle = false;
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { isIdle = true; }, IDLE_DELAY);
    };
    const onLeave = () => { isIdle = true; };
    const onResize = () => {
      if (!fluidOn) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initFramebuffers();
    };

    if (fluidOn) renderFluid();

    document.addEventListener("mousemove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onResize);
    idleTimer = setTimeout(() => { isIdle = true; }, 1800);
    raf = requestAnimationFrame((ts) => {
      lastTs = ts;
      raf = requestAnimationFrame(loop);
    });

    return () => {
      removeFade();
      stopped = true;
      cancelAnimationFrame(raf);
      if (idleTimer) clearTimeout(idleTimer);
      document.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [active]);

  if (!active) return null;

  return (
    /* screen blend = the dye behaves like light cast onto the page: the
       dark backdrop takes the sunset colour while text and objects under
       the splat stay visible, tinted into the same palette — nothing is
       painted over or lost */
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 block h-full w-full mix-blend-screen"
    />
  );
}
