// 3D lucky cat in the menu panel — waves its paw when the menu opens.
import * as THREE from 'three';
import { GLTFLoader } from './vendor/GLTFLoader.js';

const nav = document.querySelector('.nav');
const canvas = document.querySelector('.nav__cat-canvas');
if (nav && canvas && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let renderer, scene, camera, pivot, raf = 0, booted = false, running = false;
  let waveT = 0, waveDur = 0, pawDeformed = false;
  let dragging = false, lastX = 0, spin = 0, spinVel = 0;

  // paw skinning data (filled once the model loads)
  let pawGeo = null, pawBase = null, pawWeight = null;
  const PIVOT = new THREE.Vector3(-0.30, 0.26, 0.20); // shoulder joint (three.js coords)

  const clock = new THREE.Clock();
  const smooth = (a, b, t) => { t = Math.max(0, Math.min(1, (t - a) / (b - a))); return t * t * (3 - 2 * t); };

  function boot() {
    if (booted) return;
    booted = true;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.12, 3.4);

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0); // transparent — blends with the black menu panel

    scene.add(new THREE.HemisphereLight(0xffffff, 0x121722, 1.0));
    const key = new THREE.DirectionalLight(0xffffff, 2.3);
    key.position.set(2, 3, 2.5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xbfe0ff, 0.7);
    rim.position.set(-2.5, 0.5, -1.5);
    scene.add(rim);

    pivot = new THREE.Group();
    scene.add(pivot);

    new GLTFLoader().load('assets/models/lucky-cat.glb', (gltf) => {
      const model = gltf.scene;
      model.traverse((o) => {
        if (o.isMesh) {
          paintDoraemon(o.geometry);
          buildPawWeights(o.geometry);
          o.material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.42, metalness: 0.0 });
        }
      });
      pivot.add(model);
      wave(); // greet on first appearance
    });

    resize();
    addEventListener('resize', resize);
    if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);

    canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; spinVel = 0; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', (e) => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; spin += dx * 0.01; spinVel = dx * 0.01; });
    const drop = () => { dragging = false; };
    canvas.addEventListener('pointerup', drop);
    canvas.addEventListener('pointercancel', drop);
    canvas.addEventListener('click', () => wave()); // tap the cat to wave again
  }

  // Give the colourless STL a Doraemon paint job via vertex colours:
  // white face / belly / paws (front-facing + lower), blue everywhere else.
  function paintDoraemon(geo) {
    const pos = geo.attributes.position, nor = geo.attributes.normal;
    const n = pos.count;
    const col = new Float32Array(n * 3);
    const blue = new THREE.Color(0x0fa1dd).convertSRGBToLinear();
    const white = new THREE.Color(0xf3f8fb).convertSRGBToLinear();
    const c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const y = pos.getY(i), nz = nor.getZ(i);
      const ny01 = (y + 1) / 2;                       // 0 bottom … 1 top
      const front = smooth(0.45, 0.90, nz);           // only strongly front-facing → white face
      const belly = 1 - smooth(0.20, 0.48, ny01);     // lower body → white
      const w = Math.max(front, belly);
      c.copy(blue).lerp(white, w);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  }

  // Precompute a smooth weight per vertex for the raised front-left paw so we
  // can rotate it about the shoulder without tearing the mesh.
  function buildPawWeights(geo) {
    const pos = geo.attributes.position;
    const n = pos.count;
    pawWeight = new Float32Array(n);
    pawBase = new Float32Array(pos.array); // original positions
    for (let i = 0; i < n; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const fwd = smooth(0.30, 0.62, z);      // forward reach → paw tip
      const left = smooth(0.06, -0.16, x);    // left of centre (excludes the face)
      const yLo = smooth(-0.30, -0.02, y);    // above the lap
      const yHi = smooth(0.62, 0.36, y);      // below the cheeks
      pawWeight[i] = fwd * left * yLo * yHi;
    }
    pawGeo = geo;
  }

  function deformPaw(angle) {
    if (!pawGeo) return;
    const arr = pawGeo.attributes.position.array;
    const px = PIVOT.x, py = PIVOT.y;
    let touched = false;
    for (let i = 0; i < pawWeight.length; i++) {
      const w = pawWeight[i];
      const o = i * 3;
      if (w < 0.002) { // untouched verts stay at base (also resets after a wave)
        if (pawDeformed) { arr[o] = pawBase[o]; arr[o + 1] = pawBase[o + 1]; arr[o + 2] = pawBase[o + 2]; }
        continue;
      }
      const a = angle * w, ca = Math.cos(a), sa = Math.sin(a);
      const dx = pawBase[o] - px, dy = pawBase[o + 1] - py;
      arr[o] = px + dx * ca - dy * sa;      // rotate about the forward (Z) axis
      arr[o + 1] = py + dx * sa + dy * ca;  // → paw swings side-to-side = waving
      arr[o + 2] = pawBase[o + 2];
      touched = true;
    }
    pawGeo.attributes.position.needsUpdate = true;
    pawGeo.computeVertexNormals();
    pawDeformed = touched;
  }

  let lastW = 0, lastH = 0;
  function resize() {
    const r = canvas.getBoundingClientRect();
    const w = Math.round(r.width), h = Math.round(r.height);
    if (w < 2 || h < 2 || (w === lastW && h === lastH)) return;
    lastW = w; lastH = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function wave() { waveT = 0; waveDur = 2.2; }

  function frame() {
    raf = requestAnimationFrame(frame);
    resize();
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    if (pivot) {
      pivot.position.y = Math.sin(t * 1.6) * 0.03;               // gentle idle bob
      if (!dragging) { spin += spinVel; spinVel *= 0.94; }
      pivot.rotation.y = spin + Math.sin(t * 0.6) * 0.10;        // slow look-around

      // paw wave: decaying side-to-side swing of the raised paw
      if (waveDur > 0) {
        waveT += dt;
        const p = Math.min(waveT / waveDur, 1);
        const decay = 1 - p;
        const angle = Math.sin(waveT * 12) * 0.6 * decay;
        deformPaw(angle);
        if (p >= 1) { waveDur = 0; deformPaw(0); } // settle back to rest
      } else if (pawDeformed) {
        deformPaw(0);
      }
    }
    renderer.render(scene, camera);
  }

  function start() {
    boot();
    if (running) return;
    running = true;
    resize();
    clock.getDelta();
    frame();
    wave();
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  const mo = new MutationObserver(() => {
    if (nav.classList.contains('open')) start();
    else stop();
  });
  mo.observe(nav, { attributes: true, attributeFilter: ['class'] });
  if (nav.classList.contains('open')) start();
}
