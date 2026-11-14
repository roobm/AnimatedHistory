import * as THREE from 'three';
import { flat, glow, box, group, at, label } from './lowpoly.js';
import { createCharacter } from './character.js';
import { buildScene } from './scenes/index.js';

const SPACING = 14; // distance between chapter scenes along the x axis
const DARK = new THREE.Color(0x0e1117);

// Sky tint per chapter.
const COLORS = {
  supermarket: 0x4caf50,
  metal: 0xff7043,
  sausages: 0xe57373,
  logistics: 0xffc107,
  studies: 0x42a5f5,
  signage: 0xab47bc,
  'warehouse-ui': 0x26c6da,
  integrations: 0x5c6bc0,
  'azure-data': 0x0078d4,
  epilogue: 0xf06292,
};

const WORK_RADIUS = 0.6; // this close to a chapter's centre the character starts working
const FLOOR_RADIUS = 6.2;
const GATE_REACH = 1.5; // the gate lamps flash while he is this close

const clamp01 = (v) => Math.min(1, Math.max(0, v));
// Overshoots a little before settling, so things pop.
const easeOutBack = (v) => 1 + 2.4 * (v - 1) ** 3 + 1.4 * (v - 1) ** 2;

function octagon(radius, y, color) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.3, 8), flat(color));
  mesh.position.y = y;
  mesh.rotation.y = Math.PI / 8; // a flat side towards the viewer
  return mesh;
}

function makeChapterScene(chapter, index) {
  const built = buildScene(chapter.id, index);
  const root = group(octagon(FLOOR_RADIUS + 0.25, -0.22, 0x1b2130), octagon(FLOOR_RADIUS, -0.15, built.ground), built.object);
  root.position.x = index * SPACING;

  // The scene's direct children pop up one by one, so remember their size.
  const props = built.object.children.map((object) => ({ object, base: object.scale.clone() }));
  built.update?.(0, 0);
  return { ...built, root, props, shown: -1, color: new THREE.Color(COLORS[chapter.id] ?? 0xffffff) };
}

// How much of a scene has popped up: 0 = nothing, 1 = everything.
function showProps(chapterScene, amount) {
  if (amount === chapterScene.shown) return;
  chapterScene.shown = amount;
  const last = Math.max(1, chapterScene.props.length - 1);
  chapterScene.props.forEach(({ object, base }, k) => {
    const local = clamp01(amount * 1.5 - (0.5 * k) / last);
    object.scale.copy(base).multiplyScalar(Math.max(easeOutBack(local), 0.001));
  });
}

// The road the character walks along, from the first chapter to the last.
function makeRoad(length) {
  const road = box(length + 10, 0.1, 1.8, flat(0x262f42), length / 2, -0.04, 0);

  const count = Math.floor((length + 10) / 1.4);
  const dashes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.55, 0.02, 0.07), flat(0x4a5878), count);
  const spot = new THREE.Matrix4();
  for (let i = 0; i < count; i++) dashes.setMatrixAt(i, spot.makeTranslation(-5 + 0.7 + i * 1.4, 0.015, 0));
  dashes.frustumCulled = false;
  return group(road, dashes);
}

// He changes outfit under a gate halfway between two chapters.
function makeGate(index) {
  const post = flat(0x39445c);
  const lamp = glow(0xffe066, 0.3);
  // Only a low bollard on the viewer's side, so nothing hides him as he passes.
  const gate = group(
    box(0.16, 3.3, 0.16, post, 0, 1.65, -1.25),
    box(0.22, 0.22, 2.72, post, 0, 3.3, 0),
    box(0.2, 0.45, 0.2, post, 0, 0.225, 1.25),
    box(0.14, 0.14, 0.14, lamp, 0, 0.52, 1.25),
    at(label(`LEVEL ${index + 2}`, { width: 1.5, height: 0.42, bg: '#141a26', fg: '#ffe066', screen: true }), 0, 2.95, 1.34),
  );
  for (const z of [-0.8, 0, 0.8]) gate.add(box(0.14, 0.14, 0.14, lamp, 0, 3.12, z));
  gate.position.x = (index + 0.5) * SPACING;
  return { object: gate, lamp, at: index + 0.5 };
}

export function createWorld(canvas, chapters) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.background = DARK.clone();
  scene.fog = new THREE.Fog(DARK.clone(), 16, 34);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 3.2, 9);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x223044, 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(4, 8, 6);
  scene.add(sun);

  const scenes = chapters.map(makeChapterScene);
  const gates = chapters.slice(1).map((_, i) => makeGate(i));
  scene.add(makeRoad((chapters.length - 1) * SPACING), ...scenes.map((s) => s.root), ...gates.map((g) => g.object));

  const character = createCharacter();
  scene.add(character.object);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tint = new THREE.Color();

  let target = 0; // chapter position the page is scrolled to (0..n-1)
  let current = 0; // smoothed position the camera follows
  let last = performance.now();

  function resize() {
    const { innerWidth: w, innerHeight: h } = window;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Pull the camera back on narrow screens so the scene still fits.
    camera.position.z = w / h < 0.8 ? 12 : 9;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    const time = now / 1000;

    current = reduceMotion ? target : current + (target - current) * (1 - Math.pow(0.002, dt));

    camera.position.x = current * SPACING;
    camera.lookAt(camera.position.x, 1.3, 0);

    // Blend the sky between neighbouring chapter colours.
    const a = Math.floor(current);
    const b = Math.min(a + 1, scenes.length - 1);
    tint.copy(scenes[a].color).lerp(scenes[b].color, current - a);
    scene.background.copy(DARK).lerp(tint, 0.28);
    scene.fog.color.copy(scene.background);

    // A scene pops up as the camera gets near and folds away behind it.
    scenes.forEach((s, i) => {
      const distance = Math.abs(current - i);
      if (reduceMotion) {
        s.object.visible = distance < 1.6;
        return;
      }
      const amount = 1 - clamp01((distance - 0.3) / 0.5);
      s.object.visible = amount > 0;
      if (!s.object.visible) return;
      showProps(s, amount);
      s.update?.(time, dt);
    });

    if (!reduceMotion) {
      for (const gate of gates) {
        const flash = Math.max(0, 1 - (Math.abs(current - gate.at) * SPACING) / GATE_REACH);
        gate.lamp.emissiveIntensity = 0.3 + 2.2 * flash * (0.6 + 0.4 * Math.sin(time * 30));
      }
    }

    // The character changes outfit halfway between two chapters.
    const nearest = Math.round(current);
    character.update({
      x: current * SPACING,
      id: chapters[nearest].id,
      atChapter: Math.abs(current - nearest) * SPACING < WORK_RADIUS,
      time,
      dt,
      still: reduceMotion,
    });

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return {
    setPosition(t) {
      target = t;
    },
  };
}
