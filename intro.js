// intro.js — robust viewer with fallbacks
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/OBJLoader.js";
import { FBXLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/FBXLoader.js";

const canvas = document.getElementById("rubble-canvas");
const fig = canvas.closest(".viewer-card");
const caption = fig?.querySelector("figcaption");

const PATHS = {
  glb: "assets/rubble1.glb",     // (best) if you export one later
  obj: "assets/rubble1.obj",     // you have this
  fbx: "assets/rubble1.fbx",     // you also have this
  poster: "assets/rubble1.png"   // optional
};

let renderer, scene, camera, controls, loopId;

boot().catch(showPoster);

async function boot() {
  addLoading("Loading scan…");

  // scene / renderer
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  camera = new THREE.PerspectiveCamera(45, 2, 0.01, 500);
  camera.position.set(1.8, 1.4, 2.2);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  sizeToCanvas();

  const hemi = new THREE.HemisphereLight(0xffffff, 0xdcdcdc, 0.9);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(2, 3, 2);
  scene.add(dir);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 0.35;
  controls.maxDistance = 8;

  window.addEventListener("resize", sizeToCanvas);

  // Try GLB → OBJ → FBX
  let obj3d = null;

  if (await exists(PATHS.glb)) {
    const gltf = await new GLTFLoader().loadAsync(PATHS.glb);
    obj3d = gltf.scene;
  } else if (await exists(PATHS.obj)) {
    obj3d = await new OBJLoader().loadAsync(PATHS.obj);
  } else if (await exists(PATHS.fbx)) {
    obj3d = await new FBXLoader().loadAsync(PATHS.fbx);
  } else {
    throw new Error("No model file found in /assets");
  }

  // Give plain material if missing (scans often have none)
  obj3d.traverse((c) => {
    if (c.isMesh) {
      if (!c.material || Array.isArray(c.material)) {
        c.material = new THREE.MeshStandardMaterial({
          color: 0xbec3c7,
          roughness: 0.96,
          metalness: 0.0
        });
      }
      c.castShadow = c.receiveShadow = true;
    }
  });

  // Center & scale to a comfortable size
  const box = new THREE.Box3().setFromObject(obj3d);
  const size = box.getSize(new THREE.Vector3()).length() || 1;
  const center = box.getCenter(new THREE.Vector3());
  obj3d.position.sub(center);
  obj3d.scale.multiplyScalar(1.4 / size);
  scene.add(obj3d);

  controls.target.set(0, 0, 0);
  controls.update();

  removeLoading();
  tick();
}

function tick() {
  loopId = requestAnimationFrame(tick);
  controls?.update();
  renderer.render(scene, camera);
}

function sizeToCanvas() {
  const w = canvas.clientWidth || canvas.parentElement.clientWidth;
  const h = canvas.clientHeight || Math.min(window.innerHeight * 0.6, 520);
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

async function exists(url) {
  try {
    const r = await fetch(url, { method: "HEAD", cache: "no-store" });
    return r.ok;
  } catch {
    return false;
  }
}

function addLoading(text) {
  if (!fig) return;
  const ld = document.createElement("div");
  ld.className = "intro-loading";
  ld.textContent = text;
  fig.appendChild(ld);
}

function removeLoading() {
  fig?.querySelector(".intro-loading")?.remove();
}

function showPoster(err) {
  console.warn("3D load failed:", err);
  removeLoading();
  // Draw poster image so the layout remains pleasant
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.onload = () => {
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    const ratio = Math.min(canvas.clientWidth / img.width, canvas.clientHeight / img.height);
    const w = img.width * ratio, h = img.height * ratio;
    ctx.drawImage(img, (canvas.clientWidth - w)/2, (canvas.clientHeight - h)/2, w, h);
    if (caption) caption.textContent = "Rubble scan (image fallback)";
  };
  img.src = PATHS.poster;
}
