import { flat, glow, box, cyl, group, at, label, panel } from '../lowpoly.js';
import { parcel, steel, dark, wood } from '../scenery.js';

function hazardStripe(width, height) {
  const stripe = panel(width, height, 512, { unlit: false });
  const { ctx } = stripe;
  const { width: w, height: h } = ctx.canvas;
  ctx.fillStyle = '#ffd600';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#1c1c1c';
  for (let x = -h; x < w; x += h * 2) {
    ctx.beginPath();
    ctx.moveTo(x, h);
    ctx.lineTo(x + h, 0);
    ctx.lineTo(x + 2 * h, 0);
    ctx.lineTo(x + h, h);
    ctx.fill();
  }
  stripe.texture.needsUpdate = true;
  return stripe.mesh;
}

function trestle() {
  const g = group(box(0.1, 0.08, 1.0, wood, 0, 0.7, 0));
  for (const z of [-0.38, 0.38]) {
    for (const side of [-1, 1]) {
      const leg = box(0.07, 0.74, 0.07, wood, side * 0.14, 0.35, z);
      leg.rotation.z = side * 0.3;
      g.add(leg);
    }
  }
  return g;
}

function drum(color) {
  const band = flat(0x2a2f38);
  return group(cyl(0.32, 0.32, 0.9, 10, flat(color), 0, 0.45, 0), cyl(0.335, 0.335, 0.05, 10, band, 0, 0.28, 0), cyl(0.335, 0.335, 0.05, 10, band, 0, 0.62, 0));
}

// Raw plates with glowing cut edges, a crane overhead, and one plate on
// the trestles for him to grind.
export function metal(rand) {
  const hot = glow(0xff6a1a, 1);
  // A freshly cut plate standing upright, origin at the bottom edge.
  const rawPlate = (w, h) => group(box(w, h, 0.04, steel, 0, h / 2, 0), box(w + 0.05, h + 0.05, 0.02, hot, 0, h / 2, 0));

  const wall = group(
    box(9.4, 4.4, 0.2, flat(0x4a4e58), 0, 2.2, -3.2),
    at(hazardStripe(9.4, 0.4), 0, 0.5, -3.09),
    at(label('SAFETY FIRST\ndays without sparks: 0', { width: 2.6, height: 0.9, bg: '#f5f5f5', fg: '#b71c1c' }), 2.9, 3.3, -3.085),
  );

  const yellow = flat(0xf9c22e);
  const load = group(box(0.03, 1.15, 0.03, dark, 0, -0.575, 0), box(0.14, 0.1, 0.1, dark, 0, -1.15, 0), at(rawPlate(1.2, 0.8), 0, -2.0, 0));
  load.position.set(-0.7, 4.3, -1.6);
  const crane = group(
    box(9.4, 0.3, 0.3, yellow, 0, 4.65, -1.6),
    box(0.3, 4.8, 0.3, yellow, -4.55, 2.4, -1.6),
    box(0.3, 4.8, 0.3, yellow, 4.55, 2.4, -1.6),
    box(0.5, 0.25, 0.45, dark, -0.7, 4.42, -1.6),
    load,
  );

  const leaning = group(box(1.7, 0.08, 1.0, dark, 0, 0.04, 0), box(0.1, 1.9, 0.1, dark, -0.7, 0.95, -0.4), box(0.1, 1.9, 0.1, dark, 0.7, 0.95, -0.4), box(1.5, 0.08, 0.08, dark, 0, 1.6, -0.4));
  for (let i = 0; i < 5; i++) {
    const sheet = at(rawPlate(1.1 + rand() * 0.4, 1.4 + rand() * 0.5), (rand() - 0.5) * 0.15, 0.08, -0.2 + i * 0.11);
    sheet.rotation.x = -0.2;
    leaning.add(sheet);
  }
  at(leaning, -2.6, 0, -1.9, 0.25);

  const bench = group(at(trestle(), -0.55, 0, 0), at(trestle(), 0.55, 0, 0), box(1.6, 0.05, 0.9, steel, 0, 0.765, 0), box(1.66, 0.025, 0.96, hot, 0, 0.765, 0));
  at(bench, 0.55, 0, 1.05, 0.25);

  const mascot = at(parcel('goggles'), 0, 0.9, 0, 0.3);
  const drums = group(drum(0x1e88e5), mascot, at(drum(0xc62828), 0.72, 0, -0.15));
  drums.position.set(-3.6, 0, 0.9);

  function update(time) {
    hot.emissiveIntensity = 0.8 + 0.4 * Math.sin(time * 3);
    load.rotation.z = Math.sin(time * 1.1) * 0.12;
    // The grinder makes everything on the shop floor buzz.
    mascot.position.x = Math.sin(time * 40) * 0.006;
    mascot.rotation.z = Math.sin(time * 3) * 0.05;
  }

  return { object: group(wall, crane, leaning, drums, bench), ground: 0x3a3d45, update, mascot };
}
