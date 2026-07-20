// 3D lucky cat in the menu panel — waves when the menu opens.
import * as THREE from 'three';
import { GLTFLoader } from './vendor/GLTFLoader.js';

const nav = document.querySelector('.nav');
const canvas = document.querySelector('.nav__cat-canvas');
if (nav && canvas && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let renderer, scene, camera, pivot, raf = 0, booted = false, running = false;
  // wave state: a decaying oscillation applied to roll (reads as a paw wave)
  let waveT = 0, waveDur = 0;
  // drag-to-rotate
  let dragging = false, lastX = 0, spin = 0, spinVel = 0;

  const clock = new THREE.Clock();

  function boot() {
    if (booted) return;
    booted = true;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.15, 3.5);

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa3ad, 1.15));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(2, 3, 2.5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffe6c4, 0.8);
    rim.position.set(-2.5, 1, -2);
    scene.add(rim);

    pivot = new THREE.Group();
    scene.add(pivot);

    new GLTFLoader().load('assets/models/lucky-cat.glb', (gltf) => {
      const model = gltf.scene;
      model.traverse((o) => {
        if (o.isMesh) {
          o.material = new THREE.MeshStandardMaterial({ color: 0xf2f5f8, roughness: 0.55, metalness: 0.05 });
        }
      });
      pivot.add(model);
      wave(); // greet on first appearance
    });

    resize();
    addEventListener('resize', resize);

    // drag to spin
    canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; spinVel = 0; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', (e) => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; spin += dx * 0.01; spinVel = dx * 0.01; });
    const drop = () => { dragging = false; };
    canvas.addEventListener('pointerup', drop);
    canvas.addEventListener('pointercancel', drop);
    canvas.addEventListener('click', () => wave()); // tap the cat to make it wave
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, r.width), h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function wave() { waveT = 0; waveDur = 1.5; }

  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    if (pivot) {
      // gentle idle bob + breathing
      pivot.position.y = Math.sin(t * 1.6) * 0.03;
      // momentum spin from dragging
      if (!dragging) { spin += spinVel; spinVel *= 0.94; }
      // waving: decaying roll oscillation (the paw wave)
      let roll = 0;
      if (waveDur > 0) {
        waveT += dt;
        const p = Math.min(waveT / waveDur, 1);
        const decay = 1 - p;
        roll = Math.sin(waveT * 22) * 0.5 * decay * decay;
        pivot.position.y += Math.sin(waveT * 22) * 0.02 * decay;
        if (p >= 1) waveDur = 0;
      }
      pivot.rotation.y = spin + Math.sin(t * 0.6) * 0.12;
      pivot.rotation.z = roll;
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
    wave(); // wave every time the menu opens
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  // react to the menu opening/closing (script.js toggles .nav.open)
  const mo = new MutationObserver(() => {
    if (nav.classList.contains('open')) start();
    else stop();
  });
  mo.observe(nav, { attributes: true, attributeFilter: ['class'] });
  if (nav.classList.contains('open')) start();
}
