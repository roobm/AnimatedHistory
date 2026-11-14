import * as THREE from 'three';
import { flat } from './lowpoly.js';
import { createCharacter } from './character.js';

const SPACING = 14; // distance between chapter scenes along the x axis
const DARK = new THREE.Color(0x0e1117);

// Placeholder colours per chapter. Real scenes replace these in M3.
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

// From here on the pallet has turned into a data packet, so it glows.
const GLOWING_PALLET = new Set(['integrations', 'azure-data', 'epilogue']);

const WORK_RADIUS = 0.6; // this close to a chapter's centre the character starts working

// The running gag: the same pallet shows up in every chapter.
function makePallet(color, glow) {
  const material = flat(color, glow ? { emissive: color, emissiveIntensity: 0.6 } : {});
  const pallet = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), material);
  pallet.position.set(2.2, 0.8, 0.3);
  return pallet;
}

function makeChapterScene(chapter, index) {
  const color = COLORS[chapter.id] ?? 0xffffff;
  const group = new THREE.Group();
  group.position.x = index * SPACING;

  const floor = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 0.3, 8), flat(0x1b2130));
  floor.position.y = -0.15;

  const pallet = makePallet(color, GLOWING_PALLET.has(chapter.id));

  group.add(floor, pallet);
  group.userData = { pallet, color: new THREE.Color(color) };
  return group;
}

// The road the character walks along, from the first chapter to the last.
function makeRoad(length) {
  const road = new THREE.Mesh(new THREE.BoxGeometry(length + 10, 0.1, 1.8), flat(0x262f42));
  road.position.set(length / 2, -0.04, 0);
  return road;
}

export function createWorld(canvas, chapters) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.background = DARK.clone();

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 3.2, 9);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x223044, 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(4, 8, 6);
  scene.add(sun);

  const scenes = chapters.map(makeChapterScene);
  scene.add(...scenes, makeRoad((chapters.length - 1) * SPACING));

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

    current = reduceMotion ? target : current + (target - current) * (1 - Math.pow(0.002, dt));

    camera.position.x = current * SPACING;
    camera.lookAt(camera.position.x, 1.3, 0);

    // Blend the background between neighbouring chapter colours.
    const a = Math.floor(current);
    const b = Math.min(a + 1, scenes.length - 1);
    tint.copy(scenes[a].userData.color).lerp(scenes[b].userData.color, current - a);
    scene.background.copy(DARK).lerp(tint, 0.28);

    if (!reduceMotion) {
      const time = now / 1000;
      scenes.forEach((s, i) => {
        s.userData.pallet.rotation.y = time * 0.8 + i;
        s.userData.pallet.position.y = 0.8 + Math.sin(time * 1.5 + i) * 0.1;
      });
    }

    // The character changes outfit halfway between two chapters.
    const nearest = Math.round(current);
    character.update({
      x: current * SPACING,
      id: chapters[nearest].id,
      atChapter: Math.abs(current - nearest) * SPACING < WORK_RADIUS,
      time: now / 1000,
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
