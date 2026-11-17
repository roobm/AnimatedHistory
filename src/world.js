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
const PHONE_SHIFT = 0.17; // portrait phones: move the picture up, clear of the card
const HOP_SECONDS = 0.9; // the parcel's hop and spin when it is clicked
const PARTY = [0xff5252, 0xffca28, 0x66bb6a, 0x42a5f5, 0xab47bc, 0xff8a65];

const clamp01 = (v) => Math.min(1, Math.max(0, v));
// Overshoots a little before settling, so things pop.
const easeOutBack = (v) => 1 + 2.4 * (v - 1) ** 3 + 1.4 * (v - 1) ** 2;
const smooth = (v) => v * v * (3 - 2 * v);

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
  // poked: 0..1 progress of the mascot's hop, 1 = done. hop and turn are
  // what the hop added last frame, taken off again before the scene updates.
  return { ...built, root, props, shown: -1, poked: 1, hop: 0, turn: 0, color: new THREE.Color(COLORS[chapter.id] ?? 0xffffff) };
}

function hopMascot(chapterScene, dt) {
  const { mascot } = chapterScene;
  const p = Math.min(chapterScene.poked + dt / HOP_SECONDS, 1);
  chapterScene.poked = p;
  chapterScene.hop = p < 1 ? Math.abs(Math.sin(p * Math.PI * 2)) * 0.45 * (1 - 0.5 * p) : 0;
  chapterScene.turn = p < 1 ? smooth(p) * Math.PI * 2 : 0;
  mascot.position.y += chapterScene.hop;
  mascot.rotation.y += chapterScene.turn;
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

// A fountain of confetti, for when every parcel has been found.
function makeBurst(count = 140) {
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.014, 0.07), flat(0xffffff), count);
  mesh.frustumCulled = false;
  mesh.visible = false;
  const color = new THREE.Color();
  const pieces = [];
  for (let i = 0; i < count; i++) {
    mesh.setColorAt(i, color.set(PARTY[i % PARTY.length]));
    pieces.push({ position: new THREE.Vector3(), velocity: new THREE.Vector3(), spin: 2 + Math.random() * 5, tilt: Math.random() * 6 });
  }

  const matrix = new THREE.Matrix4();
  const turn = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const size = new THREE.Vector3(1, 1, 1);
  let age = 0;

  function start(x) {
    age = 0;
    mesh.visible = true;
    for (const { position, velocity } of pieces) {
      position.set(x + (Math.random() - 0.5) * 1.5, 0.3, 1.3 + Math.random() * 0.6);
      velocity.set((Math.random() - 0.5) * 8, 6 + Math.random() * 5.5, (Math.random() - 0.5) * 3);
    }
  }

  function update(dt) {
    if (!mesh.visible) return;
    age += dt;
    if (age > 5) {
      mesh.visible = false;
      return;
    }
    pieces.forEach(({ position, velocity, spin, tilt }, i) => {
      velocity.y = Math.max(velocity.y - 9 * dt, -1.8); // paper flutters down, it does not drop
      velocity.x *= 1 - Math.min(1, 1.2 * dt);
      position.addScaledVector(velocity, dt);
      euler.set(age * spin + tilt, tilt, age * spin * 0.7);
      mesh.setMatrixAt(i, matrix.compose(position, turn.setFromEuler(euler), size));
    });
    mesh.instanceMatrix.needsUpdate = true;
  }

  return { mesh, start, update };
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

// start: the chapter position the page is scrolled to when the world is built.
export function createWorld(canvas, chapters, start = 0) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

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
  const burst = makeBurst();
  scene.add(character.object, burst.mesh);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tint = new THREE.Color();

  let target = start; // chapter position the page is scrolled to (0..n-1)
  let current = start; // smoothed position the camera follows
  let last = performance.now();

  function resize() {
    const { innerWidth: w, innerHeight: h } = window;
    // Phones have dense screens and small GPUs: render fewer pixels there.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, w < 640 ? 1.5 : 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Pull the camera back on narrow screens so the scene still fits, and
    // lift the picture so he stands above the card instead of behind it.
    const portrait = w / h < 0.8;
    camera.position.z = portrait ? 12 : 9;
    if (portrait) camera.setViewOffset(w, h, 0, Math.round(h * PHONE_SHIFT), w, h);
    else camera.clearViewOffset();
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
      if (s.mascot) {
        s.mascot.position.y -= s.hop;
        s.mascot.rotation.y -= s.turn;
      }
      s.update?.(time, dt);
      if (s.mascot) hopMascot(s, dt);
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

    burst.update(dt);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Clicks: the parcel of the chapter he is at, or the character himself.
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const bounds = new THREE.Box3();
  const spot = new THREE.Vector3();

  // The chapter whose scene is up, or -1 between two chapters.
  function chapterHere() {
    const index = Math.round(current);
    return Math.abs(current - index) < 0.45 ? index : -1;
  }

  // What is under a point of the window. The boxes are a little generous,
  // so a small parcel is still easy to hit with a thumb.
  function pick(x, y) {
    pointer.set((x / window.innerWidth) * 2 - 1, 1 - (y / window.innerHeight) * 2);
    raycaster.setFromCamera(pointer, camera);
    const index = chapterHere();
    const mascot = index >= 0 ? scenes[index].mascot : null;
    if (mascot && raycaster.ray.intersectsBox(bounds.setFromObject(mascot).expandByScalar(0.18))) return { kind: 'parcel', index };
    if (raycaster.ray.intersectsBox(bounds.setFromObject(character.body).expandByScalar(0.06))) return { kind: 'character', index: Math.round(current) };
    return null;
  }

  // Where the top of an object is in the window, for the speech bubble.
  function topOf(object) {
    bounds.setFromObject(object);
    spot.set((bounds.min.x + bounds.max.x) / 2, bounds.max.y, (bounds.min.z + bounds.max.z) / 2).project(camera);
    return { x: ((spot.x + 1) / 2) * window.innerWidth, y: ((1 - spot.y) / 2) * window.innerHeight };
  }

  function react(hit) {
    if (hit.kind === 'parcel') {
      const { mascot } = scenes[hit.index];
      const place = topOf(mascot); // before it starts hopping
      if (!reduceMotion) scenes[hit.index].poked = 0;
      return { ...hit, ...place };
    }
    character.poke();
    return { ...hit, ...topOf(character.body) };
  }

  if (import.meta.env.DEV) window.__three = { renderer, scene, camera };

  return {
    setPosition(t) {
      target = t;
    },
    // Is there something to click under this point?
    hover(x, y) {
      return pick(x, y) !== null;
    },
    // Click or tap: returns { kind: 'parcel' | 'character', index, x, y } or null.
    tap(x, y) {
      const hit = pick(x, y);
      return hit && react(hit);
    },
    // Makes the parcel of the current chapter hop, so it can be found without a pointer.
    nudge() {
      const index = chapterHere();
      return index >= 0 && scenes[index].mascot ? react({ kind: 'parcel', index }) : null;
    },
    // Space: 'jump', and twice in a row 'flip' (a somersault).
    perform(kind) {
      character.poke(kind);
    },
    celebrate() {
      character.poke('flip');
      if (!reduceMotion) burst.start(current * SPACING);
    },
  };
}
