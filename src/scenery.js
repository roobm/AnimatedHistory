import * as THREE from 'three';
import { flat, glow, box, cyl, ball, group, at, label, panel } from './lowpoly.js';

// Building blocks shared by the chapter scenes. Everything stands on the
// floor with its origin at the bottom centre, unless noted.

// Small deterministic random generator, so a scene looks the same on every load.
export function seeded(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const steel = flat(0xb0bec5, { roughness: 0.5 });
export const dark = flat(0x20242c);
export const wood = flat(0xa9825a);
export const white = flat(0xeef2f5);
export const cardboard = flat(0xc49a6c);
const tape = flat(0x9c7648);
const hiVis = flat(0xffd600);
const reflector = flat(0xcfd8dc);

// The running gag: the same parcel turns up in every chapter, dressed for the job.
export function parcel(outfit, body = cardboard) {
  const g = group(
    box(0.7, 0.5, 0.5, body, 0, 0.25, 0),
    box(0.71, 0.08, 0.51, tape, 0, 0.25, 0),
    box(0.07, 0.09, 0.01, dark, -0.12, 0.39, 0.252),
    box(0.07, 0.09, 0.01, dark, 0.12, 0.39, 0.252),
    box(0.12, 0.12, 0.01, flat(0xe53935), 0.24, 0.11, 0.252),
  );
  const wear = {
    sale: () => [at(label('-30%', { width: 0.3, height: 0.17, bg: '#ffeb3b', fg: '#c62828' }), -0.16, 0.11, 0.256)],
    goggles: () => [box(0.5, 0.14, 0.06, flat(0x263238, { roughness: 0.3 }), 0, 0.39, 0.27), box(0.72, 0.04, 0.52, dark, 0, 0.39, 0)],
    hairnet: () => {
      const net = new THREE.Mesh(new THREE.SphereGeometry(0.42, 7, 3, 0, Math.PI * 2, 0, Math.PI / 2), flat(0xe8f4fb, { transparent: true, opacity: 0.85 }));
      net.position.y = 0.47;
      net.scale.set(1, 0.45, 0.75);
      return [net];
    },
    hivis: () => [box(0.72, 0.16, 0.52, hiVis, 0, 0.1, 0), box(0.73, 0.04, 0.53, reflector, 0, 0.1, 0)],
    cap: () => [box(0.3, 0.1, 0.3, dark, 0, 0.55, 0), at(box(0.62, 0.03, 0.62, dark), 0, 0.615, 0, 0.5), box(0.03, 0.22, 0.03, flat(0xffc857), 0.3, 0.51, 0.1)],
    badge: () => [box(0.02, 0.16, 0.01, dark, -0.2, 0.2, 0.256), box(0.12, 0.14, 0.01, white, -0.2, 0.08, 0.258)],
    barcode: () => {
      const code = panel(0.3, 0.18, 60, { unlit: false });
      code.ctx.fillStyle = '#ffffff';
      code.ctx.fillRect(0, 0, 60, 36);
      code.ctx.fillStyle = '#111111';
      [4, 8, 10, 15, 19, 21, 27, 30, 36, 39, 44, 46, 51].forEach((x, i) => code.ctx.fillRect(x, 5, 1 + (i % 3), 26));
      code.texture.needsUpdate = true;
      return [at(code.mesh, -0.16, 0.11, 0.256)];
    },
    data: () => [box(0.72, 0.09, 0.52, glow(0x4dd0e1, 1), 0, 0.25, 0)],
    shades: () => [box(0.2, 0.12, 0.03, dark, -0.12, 0.39, 0.26), box(0.2, 0.12, 0.03, dark, 0.12, 0.39, 0.26), box(0.1, 0.03, 0.03, dark, 0, 0.42, 0.26)],
  };
  if (wear[outfit]) g.add(...wear[outfit]());
  return g;
}

// What the parcel becomes in the cloud chapters. Origin at its centre.
const packetBody = glow(0x4dd0e1, 0.9);
export function packet() {
  return group(box(0.32, 0.23, 0.23, packetBody), box(0.035, 0.05, 0.01, dark, -0.06, 0.04, 0.118), box(0.035, 0.05, 0.01, dark, 0.06, 0.04, 0.118));
}

export function pallet() {
  const g = group(box(1.2, 0.05, 1.0, wood, 0, 0.135, 0));
  for (const z of [-0.4, 0, 0.4]) g.add(box(1.2, 0.11, 0.14, wood, 0, 0.055, z));
  return g;
}

export const SHELF_LEVEL = 0.72;
const shelfBody = flat(0xd3d9e0);
const PRODUCTS = [0xe53935, 0xfb8c00, 0xfdd835, 0x43a047, 0x1e88e5, 0x8e24aa, 0xf06292, 0x00acc1, 0xf5f5f5].map((c) => flat(c));

// Supermarket shelving. emptyTop: how many of the top levels are still mostly empty.
export function shelf(width, levels, rand, emptyTop = 0) {
  const height = levels * SHELF_LEVEL + 0.15;
  const g = group(box(width, height, 0.05, shelfBody, 0, height / 2, -0.225));
  for (const side of [-1, 1]) g.add(box(0.06, height, 0.5, shelfBody, (side * width) / 2, height / 2, 0));

  for (let level = 0; level < levels; level++) {
    const y = 0.12 + level * SHELF_LEVEL;
    g.add(box(width, 0.05, 0.5, white, 0, y, 0), box(width, 0.07, 0.02, white, 0, y, 0.26));
    const sparse = level >= levels - emptyTop;
    let x = -width / 2 + 0.1;
    while (x < width / 2 - 0.45) {
      const w = 0.2 + rand() * 0.2;
      const h = 0.22 + rand() * 0.3;
      const material = PRODUCTS[Math.floor(rand() * PRODUCTS.length)];
      if (rand() > (sparse ? 0.75 : 0.08)) g.add(box(w, h, 0.32, material, x + w / 2, y + 0.025 + h / 2, 0.02));
      if (rand() > 0.6) g.add(box(0.11, 0.05, 0.01, PRODUCTS[rand() > 0.5 ? 2 : 0], x + w / 2, y, 0.272)); // price tag
      x += w + 0.04;
    }
  }
  return g;
}

const upright = flat(0x1e5aa8);
const beam = flat(0xff7a1a);
const LOADS = [0xc49a6c, 0xb98b5e, 0xd3ad7f, 0x8fb3d9].map((c) => flat(c));

// Warehouse pallet racking with random loads.
export function rack(bays, levels, rand, { bayWidth = 1.5, levelHeight = 1.3, depth = 0.9, fill = 0.75 } = {}) {
  const width = bays * bayWidth;
  const height = levels * levelHeight + 0.2;
  const g = new THREE.Group();
  for (let b = 0; b <= bays; b++) {
    for (const z of [-depth / 2, depth / 2]) g.add(box(0.1, height, 0.1, upright, b * bayWidth - width / 2, height / 2, z));
  }
  for (let level = 0; level < levels; level++) {
    const y = level * levelHeight;
    if (level > 0) g.add(box(width, 0.1, 0.08, beam, 0, y - 0.05, depth / 2), box(width, 0.1, 0.08, beam, 0, y - 0.05, -depth / 2));
    for (let b = 0; b < bays; b++) {
      if (rand() > fill) continue;
      const w = 0.8 + rand() * 0.4;
      const h = 0.5 + rand() * 0.45;
      const x = (b + 0.5) * bayWidth - width / 2;
      g.add(box(1.25, 0.08, depth, wood, x, y + 0.04, 0), box(w, h, depth * 0.8, LOADS[Math.floor(rand() * LOADS.length)], x, y + 0.08 + h / 2, 0));
    }
  }
  return g;
}

// A straight belt conveyor running along x.
export function conveyor(length, { height = 0.9, depth = 0.62 } = {}) {
  const g = group(box(length, 0.06, depth, flat(0x2a2f38), 0, height - 0.03, 0));
  for (const side of [-1, 1]) g.add(box(length, 0.12, 0.05, steel, 0, height - 0.02, side * (depth / 2 + 0.025)));
  const legs = Math.max(2, Math.round(length / 1.6) + 1);
  for (let i = 0; i < legs; i++) {
    const x = -length / 2 + 0.15 + (i * (length - 0.3)) / (legs - 1);
    for (const side of [-1, 1]) g.add(box(0.08, height - 0.08, 0.08, steel, x, (height - 0.08) / 2, side * (depth / 2 - 0.04)));
  }
  return g;
}

// A simple colleague, about as tall as the main character. userData.head nods.
export function buddy(shirt, { vest = false, helmet = null, hair = 0x3a2a1c } = {}) {
  const top = flat(shirt);
  const head = group(ball(0.33, 1, flat(0xd9a880), 0, 0.3, 0), box(0.06, 0.08, 0.03, dark, -0.12, 0.33, 0.3), box(0.06, 0.08, 0.03, dark, 0.12, 0.33, 0.3));
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.36, 7, 3, 0, Math.PI * 2, 0, Math.PI / 2), flat(helmet ?? hair));
  dome.position.y = 0.34;
  head.add(dome);
  if (helmet) head.add(box(0.5, 0.04, 0.3, flat(helmet), 0, 0.36, 0.28));
  head.position.y = 1.8;

  const g = group(
    box(0.56, 0.9, 0.3, flat(0x2b3140), 0, 0.45, 0),
    box(0.72, 0.8, 0.4, top, 0, 1.3, 0),
    box(0.18, 0.75, 0.2, top, -0.46, 1.3, 0),
    box(0.18, 0.75, 0.2, top, 0.46, 1.3, 0),
    box(0.16, 0.1, 0.16, flat(0xd9a880), 0, 1.75, 0),
    head,
  );
  if (vest) g.add(box(0.76, 0.55, 0.44, hiVis, 0, 1.38, 0), box(0.77, 0.06, 0.45, reflector, 0, 1.3, 0));
  g.userData.head = head;
  return g;
}

// A pipe through a list of [x, y, z] points. along(t, out) gives the point
// at t (0..1, wraps around) of the way through it.
export function pipe(points, radius, material) {
  const path = points.map((p) => new THREE.Vector3(...p));
  const up = new THREE.Vector3(0, 1, 0);
  const g = new THREE.Group();
  const lengths = [];
  for (let i = 0; i < path.length - 1; i++) {
    const length = path[i].distanceTo(path[i + 1]);
    const segment = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 6), material);
    segment.position.copy(path[i]).lerp(path[i + 1], 0.5);
    segment.quaternion.setFromUnitVectors(up, path[i + 1].clone().sub(path[i]).normalize());
    g.add(segment);
    if (i > 0) g.add(ball(radius * 1.3, 0, material, path[i].x, path[i].y, path[i].z));
    lengths.push(length);
  }
  const total = lengths.reduce((sum, length) => sum + length, 0);

  function along(t, out) {
    let d = (((t % 1) + 1) % 1) * total;
    for (let i = 0; i < lengths.length; i++) {
      if (d <= lengths[i]) return out.copy(path[i]).lerp(path[i + 1], d / lengths[i]);
      d -= lengths[i];
    }
    return out.copy(path[path.length - 1]);
  }
  return { object: g, along };
}

const sausageSkin = flat(0xd9806f);
const linkShape = new THREE.CapsuleGeometry(0.055, 0.22, 2, 6);

// One sausage, lying flat. turn: its direction on the table.
export function sausage(x = 0, y = 0, z = 0, turn = 0) {
  const mesh = new THREE.Mesh(linkShape, sausageSkin);
  mesh.position.set(x, y, z);
  mesh.rotation.set(0, turn, Math.PI / 2);
  return mesh;
}

// A string of links hanging down from its origin.
export function sausageString(count) {
  const g = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const link = new THREE.Mesh(linkShape, sausageSkin);
    link.position.set(0, -0.19 - i * 0.34, 0);
    link.rotation.z = i % 2 ? 0.2 : -0.2;
    g.add(link);
  }
  return g;
}

// A sign on a pole. The middle of the sign ends up at the given height.
export function signpost(sign, height) {
  return group(box(0.08, height, 0.08, dark, 0, height / 2, 0), at(sign, 0, height, 0.05));
}

// A forklift facing +x. userData.carriage (the forks) slides up the mast.
export function forklift(color = 0xff8f00) {
  const paint = flat(color);
  const carriage = group(box(0.08, 0.5, 0.9, dark, 0, 0.25, 0), box(0.9, 0.05, 0.12, steel, 0.45, 0.03, -0.28), box(0.9, 0.05, 0.12, steel, 0.45, 0.03, 0.28));
  carriage.position.set(0.95, 0.1, 0);

  const g = group(
    box(1.5, 0.55, 1.0, paint, 0, 0.5, 0),
    box(0.5, 0.5, 1.0, dark, -0.6, 0.95, 0), // counterweight
    box(0.45, 0.12, 0.6, dark, -0.1, 0.84, 0), // seat
    box(0.4, 0.55, 0.45, flat(0x3f6fb5), -0.1, 1.17, 0), // driver
    ball(0.2, 1, flat(0xd9a880), -0.1, 1.62, 0),
    box(1.15, 0.06, 1.0, dark, -0.05, 2.0, 0), // roof
    box(0.1, 2.4, 0.1, dark, 0.86, 1.3, -0.32), // mast
    box(0.1, 2.4, 0.1, dark, 0.86, 1.3, 0.32),
    box(0.1, 0.08, 0.74, dark, 0.86, 2.5, 0),
    carriage,
  );
  for (const x of [-0.5, 0.5]) {
    for (const z of [-0.47, 0.47]) {
      g.add(box(0.06, 1.25, 0.06, dark, x - 0.05, 1.37, z)); // cab post
      const wheel = cyl(0.28, 0.28, 0.2, 10, dark, x, 0.28, z * 1.1);
      wheel.rotation.x = Math.PI / 2;
      g.add(wheel);
    }
  }
  g.userData.carriage = carriage;
  return g;
}

export function cloud() {
  const g = group(ball(0.55, 1, white, 0, 0, 0), ball(0.42, 1, white, 0.55, -0.05, 0.05), ball(0.36, 1, white, -0.5, -0.08, 0), ball(0.3, 1, white, 0.15, 0.25, -0.1));
  g.scale.y = 0.75;
  return g;
}
