/**
 * "Are You OK?" — 3D Cat Model Integration Component
 * 
 * Provides an isolated Three.js environment configured to load
 * and display the user-provided 3D cat model (GLB / GLTF).
 * 
 * Drop-in path for model: /assets/models/cat.glb
 */

import * as THREE from '/assets/vendor/three.module.min.js';
import { audio } from './Audio.js';

export class CatModel {
  constructor(canvasElement, containerElement) {
    this.canvas = canvasElement;
    this.container = containerElement;
    this.model = null;
    this.mixer = null;
    this.clock = new THREE.Clock();
    this.pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isReacting = false;

    if (!this.canvas || !this.container) return;

    try {
      this.initScene();
      this.initLighting();
      this.initShadowPlane();
      this.bindEvents();
      this.tryLoadGLB('/assets/models/cat.glb');
      this.animate();
    } catch (e) {
      console.warn('Three.js canvas init note:', e);
    }
  }

  initScene() {
    this.scene = new THREE.Scene();

    const width = this.container.clientWidth || 340;
    const height = this.container.clientHeight || 300;

    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    this.camera.position.set(0, 1.2, 3.2);
    this.camera.lookAt(0, 0.4, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  initLighting() {
    const hemiLight = new THREE.HemisphereLight(0xfff8ed, 0xe8dcce, 1.3);
    hemiLight.position.set(0, 10, 0);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffaee, 1.8);
    sunLight.position.set(2.5, 5, 3);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    this.scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xedd9c4, 0.6);
    fillLight.position.set(-3, 2, -2);
    this.scene.add(fillLight);
  }

  initShadowPlane() {
    // Subtle shadow receiver plane that only shows shadow under the 3D model
    const planeGeo = new THREE.PlaneGeometry(4, 4);
    const planeMat = new THREE.ShadowMaterial({ opacity: 0.12 });
    this.shadowPlane = new THREE.Mesh(planeGeo, planeMat);
    this.shadowPlane.rotation.x = -Math.PI / 2;
    this.shadowPlane.position.y = 0;
    this.shadowPlane.receiveShadow = true;
    this.scene.add(this.shadowPlane);
  }

  async tryLoadGLB(url) {
    try {
      // Check if file exists first
      const res = await fetch(url, { method: 'HEAD' });
      if (!res.ok) {
        console.info(
          '%c🐾 [CatModel] Drop your 3D cat model at: /assets/models/cat.glb',
          'color:#80c4c7;font-weight:bold;font-size:12px;'
        );
        return;
      }

      // If model exists, load dynamically
      const { GLTFLoader } = await import('/assets/vendor/GLTFLoader.js');
      const loader = new GLTFLoader();
      loader.load(url, (gltf) => {
        if (this.model) this.scene.remove(this.model);
        this.model = gltf.scene;

        const bbox = new THREE.Box3().setFromObject(this.model);
        const size = bbox.getSize(new THREE.Vector3());
        const center = bbox.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetScale = 1.0 / (maxDim || 1);
        this.model.scale.setScalar(targetScale);

        this.model.position.x = -center.x * targetScale;
        this.model.position.y = -bbox.min.y * targetScale;
        this.model.position.z = -center.z * targetScale;

        if (gltf.animations && gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(this.model);
          this.mixer.clipAction(gltf.animations[0]).play();
        }

        this.scene.add(this.model);
      });
    } catch (e) {
      console.info(
        '%c🐾 [CatModel] Ready for custom GLB at: /assets/models/cat.glb',
        'color:#80c4c7;font-weight:bold;font-size:12px;'
      );
    }
  }

  react() {
    if (this.isReacting) return;
    this.isReacting = true;
    audio.playCatPurr();

    if (this.model) {
      const origY = this.model.position.y;
      let progress = 0;
      const jump = () => {
        progress += 0.08;
        this.model.position.y = origY + Math.sin(progress * Math.PI) * 0.12;
        if (progress < 1) {
          requestAnimationFrame(jump);
        } else {
          this.model.position.y = origY;
          this.isReacting = false;
        }
      };
      jump();
    } else {
      setTimeout(() => { this.isReacting = false; }, 350);
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.onResize());

    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      this.pointer.targetX = x * 0.35;
      this.pointer.targetY = y * 0.25;
    });

    if (this.canvas) {
      this.canvas.addEventListener('click', () => this.react());
    }
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || 340;
    const height = this.container.clientHeight || 300;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate = () => {
    requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    if (this.mixer) this.mixer.update(delta);

    this.pointer.x += (this.pointer.targetX - this.pointer.x) * 0.05;
    this.pointer.y += (this.pointer.targetY - this.pointer.y) * 0.05;

    if (this.model) {
      this.model.rotation.y = -Math.PI / 8 + this.pointer.x * 0.5;
      this.model.rotation.x = -this.pointer.y * 0.2;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };
}
