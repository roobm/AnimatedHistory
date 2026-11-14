import { flat, box, group, at, label } from '../lowpoly.js';
import { parcel, pallet, shelf, cardboard, steel, dark, white } from '../scenery.js';

function cart() {
  const g = group(box(0.9, 0.04, 0.55, steel, 0, 0.35, 0), box(0.04, 0.3, 0.6, flat(0xc62828), -0.52, 0.95, 0));
  for (const side of [-1, 1]) {
    g.add(box(0.9, 0.4, 0.03, steel, 0, 0.57, side * 0.27), box(0.03, 0.4, 0.55, steel, side * 0.45, 0.57, 0));
    for (const end of [-1, 1]) g.add(box(0.04, 0.3, 0.04, steel, end * 0.38, 0.18, side * 0.22), box(0.1, 0.1, 0.06, dark, end * 0.38, 0.05, side * 0.22));
  }
  g.add(box(0.3, 0.3, 0.2, flat(0xfdd835), -0.15, 0.6, 0.05), box(0.25, 0.4, 0.2, flat(0x1e88e5), 0.2, 0.62, -0.05));
  return g;
}

function wetFloorSign() {
  const yellow = flat(0xffd600);
  const g = group();
  for (const side of [-1, 1]) {
    const leaf = box(0.42, 0.72, 0.03, yellow, 0, 0.34, side * 0.1);
    leaf.rotation.x = side * 0.28;
    g.add(leaf);
  }
  g.add(box(0.2, 0.2, 0.01, dark, 0, 0.4, 0.13));
  return g;
}

// Shelves to fill, a pallet of boxes to fill them from, and a till he never sat at.
export function supermarket(rand) {
  const shelves = at(shelf(9.5, 4, rand, 1), 0.3, 0, -1.9);

  // Hangs from the ceiling: the group's origin is up where the strings end.
  const aisle = group(
    at(label('AISLE 1', { width: 1.9, height: 0.55, bg: '#2e7d32', fg: '#ffffff' }), 0, -1.25, 0),
    box(0.03, 1.0, 0.03, dark, -0.8, -0.5, 0),
    box(0.03, 1.0, 0.03, dark, 0.8, -0.5, 0),
  );
  aisle.position.set(-1.5, 5.1, -1.1);

  const mascot = at(parcel('sale'), 0.05, 1.04, 0.05, -0.15);
  const stack = group(
    pallet(),
    box(0.56, 0.44, 0.8, cardboard, -0.3, 0.38, 0),
    box(0.56, 0.44, 0.8, cardboard, 0.3, 0.38, 0),
    box(0.8, 0.44, 0.6, flat(0xb98b5e), 0, 0.82, 0),
    mascot,
  );
  stack.position.set(2.3, 0, 1.05); // clear of the road, like everything else on the floor

  const till = group(
    box(1.7, 0.85, 0.7, flat(0x607d8b), 0, 0.425, 0),
    box(1.1, 0.04, 0.5, dark, -0.25, 0.87, 0),
    box(0.4, 0.3, 0.4, white, 0.6, 1.0, 0),
    box(0.05, 0.6, 0.05, dark, 0.6, 1.45, 0),
    at(label('CLOSED\n(not my job)', { width: 1.0, height: 0.5, bg: '#c62828', fg: '#ffffff' }), 0, 1.95, 0.03),
  );
  at(till, 3.9, 0, 1.1, -0.35);

  function update(time) {
    mascot.position.y = 1.04 + Math.abs(Math.sin(time * 1.2)) * 0.14;
    mascot.rotation.z = Math.sin(time * 2.4) * 0.06;
    aisle.rotation.z = Math.sin(time * 0.9) * 0.03;
  }

  return {
    object: group(shelves, aisle, till, at(cart(), -3.3, 0, -0.95, 0.4), at(wetFloorSign(), -1.7, 0, 1.3, 0.3), stack),
    ground: 0x4a5a50,
    update,
    mascot,
  };
}
