import { flat, glow, box, cyl, group, at, panel, MONO } from '../lowpoly.js';
import { parcel, conveyor, sausage, sausageString, steel, dark, white } from '../scenery.js';

const PERIOD = 2.5 * Math.PI; // his packing loop, see animations.js
const SLOTS = 9;
const GAP = 0.8; // distance between two things on the belt
const SPAN = SLOTS * GAP;
const PACK_AT = -0.15; // where on the belt his hands are

function tiledWall(width, height) {
  const tiles = panel(width, height, 512, { unlit: false });
  const { ctx } = tiles;
  const { width: w, height: h } = ctx.canvas;
  ctx.fillStyle = '#e6eef2';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#1e88e5';
  ctx.fillRect(0, h * 0.62, w, 16);
  ctx.fillStyle = '#c9d6de';
  for (let x = 0; x < w; x += 16) ctx.fillRect(x, 0, 1, h);
  for (let y = 0; y < h; y += 16) ctx.fillRect(0, y, w, 1);
  tiles.texture.needsUpdate = true;
  return group(box(width, height, 0.2, white, 0, 0, -0.11), tiles.mesh);
}

// Loose sausages before his hands, a packed tray after them.
function beltSlot() {
  const loose = group(sausage(-0.1, 0.955, 0.03, 0.3), sausage(0.09, 0.955, -0.1, -0.5), sausage(0.03, 0.955, 0.12, 1.0));
  const tray = group(box(0.46, 0.04, 0.4, white, 0, 0.92, 0));
  for (const x of [-0.13, 0, 0.13]) tray.add(sausage(x, 0.995, 0, Math.PI / 2));
  return { object: group(loose, tray), loose, tray };
}

function machine() {
  const hopper = cyl(0.62, 0.22, 0.7, 4, steel, 0, 1.75, 0);
  hopper.rotation.y = Math.PI / 4;
  return group(
    box(1.5, 1.4, 1.0, steel, 0, 0.7, 0),
    hopper,
    box(0.5, 0.3, 0.03, dark, -0.35, 1.0, 0.51),
    box(0.1, 0.1, 0.04, glow(0x66ff88, 1), 0.3, 1.1, 0.51),
    box(0.1, 0.1, 0.04, glow(0xff5252, 1), 0.48, 1.1, 0.51),
    box(0.35, 0.16, 0.16, dark, 0.9, 0.95, 0.2),
    at(sausageString(2), 1.05, 0.93, 0.2),
  );
}

function crates() {
  const blue = flat(0x1565c0);
  const g = group();
  for (let i = 0; i < 3; i++) g.add(at(group(box(0.7, 0.3, 0.5, blue, 0, 0.15, 0), box(0.74, 0.05, 0.54, blue, 0, 0.3, 0)), 0, i * 0.34, 0, (i - 1) * 0.12));
  return g;
}

// A belt that keeps speeding up with him, and a counter that keeps score.
export function sausages(rand) {
  const wall = at(tiledWall(9.4, 4.4), 0, 2.2, -2.8);

  const counter = panel(2.2, 0.75, 220);
  const board = group(box(2.36, 0.91, 0.1, dark, 0, 0, -0.06), counter.mesh);
  board.position.set(2.6, 3.85, -2.68);
  let shown = -1;
  function drawCounter(count) {
    const { ctx } = counter;
    const { width: w, height: h } = ctx.canvas;
    ctx.fillStyle = '#0b0f14';
    ctx.fillRect(0, 0, w, h);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffb300';
    ctx.font = `bold ${h * 0.2}px ${MONO}`;
    ctx.fillText('PACKED TODAY', w / 2, h * 0.22);
    ctx.fillStyle = '#ff5252';
    ctx.font = `bold ${h * 0.52}px ${MONO}`;
    ctx.fillText(String(count).padStart(6, '0'), w / 2, h * 0.66);
    counter.texture.needsUpdate = true;
    shown = count;
  }

  const rail = group(box(5.8, 0.06, 0.06, steel, 0, 0, 0), box(0.05, 2.6, 0.05, steel, -2.6, 1.3, 0), box(0.05, 2.6, 0.05, steel, 2.6, 1.3, 0));
  const strings = [];
  for (let i = 0; i < 9; i++) {
    const string = at(sausageString(3 + Math.floor(rand() * 3)), -2.5 + i * 0.62, 0, 0);
    strings.push(string);
    rail.add(string);
  }
  rail.position.set(-0.7, 3.1, -2.0);

  const mascot = parcel('hairnet');
  mascot.scale.setScalar(0.72);
  mascot.position.y = 0.9;
  const slots = [];
  for (let k = 0; k < SLOTS; k++) slots.push(k === 4 ? { object: mascot } : beltSlot());
  const line = group(conveyor(SPAN + 0.8), ...slots.map((slot) => slot.object));
  // The belt wraps around inside these.
  for (const side of [-1, 1]) line.add(box(0.9, 0.62, 0.76, steel, (side * SPAN) / 2, 1.2, 0), box(0.04, 0.4, 0.5, dark, side * (SPAN / 2 - 0.44), 1.12, 0));
  line.position.set(0.4, 0, 0.82);

  function update(time) {
    // The same phase as his arms: one thing packed per stroke.
    const u = time % PERIOD;
    const phase = Math.floor(time / PERIOD) * 20 * Math.PI + 5 * u + (3 / PERIOD) * u * u;
    const travel = (phase * GAP) / (2 * Math.PI);
    slots.forEach((slot, k) => {
      const x = ((k * GAP + travel) % SPAN) - SPAN / 2;
      slot.object.position.x = x;
      if (slot.loose) {
        slot.loose.visible = x < PACK_AT;
        slot.tray.visible = !slot.loose.visible;
      }
    });
    const count = 4800 + Math.floor(travel / GAP);
    if (count !== shown) drawCounter(count);

    strings.forEach((string, i) => {
      string.rotation.z = Math.sin(time * 1.3 + i * 0.9) * 0.07;
    });
    mascot.rotation.y = Math.sin(time * 2) * 0.2;
  }

  return {
    object: group(wall, board, rail, at(machine(), -2.9, 0, -1.3), line, at(crates(), 5.0, 0, 0.82)),
    ground: 0x6d7f88,
    update,
    mascot,
  };
}
