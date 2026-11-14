import * as THREE from 'three';
import { flat, box, cyl, group, at, label, panel, MONO } from '../lowpoly.js';
import { parcel, dark, wood, white } from '../scenery.js';
import { pulse } from '../animations.js';

function blackboard() {
  const board = panel(4.2, 2.2, 512, { unlit: false });
  const { ctx } = board;
  const { width: w, height: h } = ctx.canvas;
  ctx.fillStyle = '#21402f';
  ctx.fillRect(0, 0, w, h);
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#eef3ea';
  ctx.font = `bold ${h * 0.11}px ${MONO}`;
  ['while (!graduated) {', '  study();', '  coffee++;', '}'].forEach((line, i) => ctx.fillText(line, w * 0.07, h * (0.18 + i * 0.15)));
  ctx.fillStyle = '#ffe082';
  ctx.textAlign = 'right';
  ctx.font = `bold ${h * 0.1}px ${MONO}`;
  ctx.fillText('2015 → 2019', w * 0.94, h * 0.86);
  board.texture.needsUpdate = true;

  return group(
    box(4.4, 2.4, 0.1, wood, 0, 0, -0.06),
    board.mesh,
    box(4.4, 0.08, 0.2, wood, 0, -1.2, 0.05),
    box(0.16, 0.04, 0.04, white, -1.2, -1.14, 0.08),
    box(0.1, 1.2, 0.1, wood, -1.9, -1.75, -0.06),
    box(0.1, 1.2, 0.1, wood, 1.9, -1.75, -0.06),
  );
}

function pretzel() {
  const dough = flat(0x9a5b2a);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.035, 5, 10), dough);
  ring.position.y = -0.45;
  const g = group(box(0.015, 0.26, 0.015, dark, 0, -0.13, 0), ring);
  for (const side of [-1, 1]) {
    const twist = box(0.06, 0.36, 0.06, dough, side * 0.04, -0.44, 0.01);
    twist.rotation.z = side * 0.55;
    g.add(twist, box(0.025, 0.025, 0.025, white, side * 0.15, -0.36, 0.04), box(0.025, 0.025, 0.025, white, side * 0.08, -0.6, 0.04));
  }
  return g;
}

function gradCap() {
  return group(box(0.3, 0.12, 0.3, dark), box(0.56, 0.03, 0.56, dark, 0, 0.075, 0), box(0.025, 0.2, 0.025, flat(0xffc857), 0.26, -0.02, 0.26));
}

// A fading thought next to his head.
function thought(text, fg) {
  const mesh = label(text, { width: 0.6, height: 0.5, bg: null, fg, screen: true });
  return {
    mesh,
    show(amount, x, y) {
      mesh.visible = amount > 0.01;
      mesh.material.opacity = amount;
      mesh.position.set(x, y + amount * 0.25, 0.3);
    },
  };
}

// Code on the blackboard, an exchange semester, a lot of coffee.
export function studies(rand) {
  const board = at(blackboard(), 1.7, 2.3, -2.3);

  const snack = pretzel();
  snack.position.set(-1.1, 2.77, 0.02);
  const signs = group(
    box(0.1, 3.3, 0.1, wood, 0, 1.65, 0),
    at(label('Aschaffenburg', { width: 1.7, height: 0.36, bg: '#f5f0e1', fg: '#222222' }), -0.45, 2.95, 0.06),
    box(0.3, 0.08, 0.02, flat(0x111111), -1.5, 3.03, 0.075),
    box(0.3, 0.08, 0.02, flat(0xdd0000), -1.5, 2.95, 0.075),
    box(0.3, 0.08, 0.02, flat(0xffce00), -1.5, 2.87, 0.075),
    at(label('Thesis: ReactJS →', { width: 1.7, height: 0.36, bg: '#20232a', fg: '#61dafb' }), 0.55, 2.42, 0.06),
    snack,
  );
  signs.position.set(-2.9, 0, -1.4);

  const covers = [0xc62828, 0x1565c0, 0x2e7d32, 0xf9a825, 0x6a1b9a, 0x00838f, 0xd84315];
  const books = group();
  covers.forEach((color, i) => {
    books.add(at(group(box(0.72, 0.14, 0.5, flat(color)), box(0.68, 0.1, 0.02, white, 0, 0, 0.25)), (rand() - 0.5) * 0.1, 0.07 + i * 0.145, 0, (rand() - 0.5) * 0.5));
  });
  const mascot = at(parcel('cap'), 0, covers.length * 0.145, 0, -0.2);
  books.add(mascot);
  books.position.set(2.9, 0, 0.95);

  const cups = group();
  for (let i = 0; i < 7; i++) cups.add(cyl(0.1, 0.075, 0.2, 8, white, Math.sin(i * 1.9) * 0.02, 0.1 + i * 0.13, 0), cyl(0.102, 0.102, 0.03, 8, flat(0x6d4c41), Math.sin(i * 1.9) * 0.02, 0.2 + i * 0.13, 0));
  const tipped = cyl(0.1, 0.075, 0.2, 8, white, 0.3, 0.09, 0.1);
  tipped.rotation.z = Math.PI / 2;
  cups.add(tipped);
  cups.position.set(1.45, 0, 1.15);

  // Thrown over and over. The scale lives on the inner caps, the outer
  // group belongs to the pop-up.
  const caps = [0, 1, 2].map(() => gradCap());
  const toss = group(...caps);
  toss.position.set(4.0, 0, -1.1);

  const puzzled = thought('?', '#ffe066');
  const idea = thought('{ }', '#7fdbff');
  const thoughts = group(puzzled.mesh, idea.mesh);

  function update(time) {
    snack.rotation.z = Math.sin(time * 1.6) * 0.18;
    caps.forEach((cap, i) => {
      const p = (time * 0.4 + i / 3) % 1;
      cap.position.set((i - 1) * 0.55 + Math.sin(p * Math.PI) * 0.2 * (i - 1), 0.5 + 3.4 * 4 * p * (1 - p), 0);
      cap.rotation.set(time * 3 + i, 0, time * 2.2 + i * 2);
      cap.scale.setScalar(Math.max(0.001, Math.min(1, p * 8, (1 - p) * 8)));
    });
    puzzled.show(pulse(time, 5, 1.6), 0.85, 2.55);
    idea.show(pulse(time + 2.5, 5, 1.4), -0.85, 2.55);
    mascot.rotation.z = Math.sin(time * 1.2) * 0.04;
  }

  return { object: group(board, signs, toss, books, cups, thoughts), ground: 0x5a4a3c, update, mascot };
}
