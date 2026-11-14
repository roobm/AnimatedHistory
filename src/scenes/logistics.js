import { flat, box, group, at, label, MONO } from '../lowpoly.js';
import { parcel, pallet, rack, forklift, signpost } from '../scenery.js';

const product = flat(0x26a69a);
const productTape = flat(0x1c7d74);

// A pallet with a number of identical product boxes, stacked four to a layer.
function loadedPallet(count) {
  const g = pallet();
  for (let i = 0; i < count; i++) {
    const x = ((i % 2) - 0.5) * 0.54;
    const z = ((Math.floor(i / 2) % 2) - 0.5) * 0.46;
    const y = 0.34 + Math.floor(i / 4) * 0.37;
    g.add(box(0.5, 0.36, 0.42, product, x, y, z), box(0.51, 0.06, 0.43, productTape, x, y, z));
  }
  return g;
}

function customerPallet(letter, count) {
  const sign = label(letter, { width: 0.46, height: 0.46, bg: '#ffffff', fg: '#111111' });
  return group(loadedPallet(count), at(signpost(sign, 1.9), 0, 0, -0.56));
}

// Order picking: one pallet of the same product, split over the customers'
// pallets. The forklift behind him never gets anywhere.
export function logistics(rand) {
  const racking = at(rack(6, 3, rand), 0, 0, -3.1);

  const line = flat(0xffd600);
  const lanes = group(box(9.6, 0.02, 0.08, line, 0, 0.01, -1.05), box(9.6, 0.02, 0.08, line, 0, 0.01, -2.3));

  const truck = forklift();
  const mascot = parcel('hivis');
  mascot.scale.setScalar(0.9);
  mascot.position.set(0.5, 0.06, 0);
  truck.userData.carriage.add(mascot);
  truck.position.z = -1.65;

  const list = label('PICK LIST\nA ×3\nB ×2\nC ×4', { width: 1.0, height: 1.2, bg: '#fafafa', fg: '#1a237e', font: MONO });
  const board = at(signpost(group(box(1.1, 1.3, 0.05, flat(0x8d6e63), 0, 0, -0.03), list), 2.5), 3.7, 0, -0.6, -0.2);

  function update(time) {
    truck.position.x = 3.0 * Math.sin(time * 0.4);
    truck.userData.carriage.position.y = 0.1 + 0.55 * (1 + Math.sin(time * 0.9));
    mascot.rotation.y = Math.sin(time * 1.7) * 0.25;
  }

  return {
    object: group(
      racking,
      lanes,
      truck,
      board,
      at(customerPallet('C', 4), -4.15, 0, 1.0),
      at(customerPallet('B', 2), -2.75, 0, 1.0),
      at(loadedPallet(10), -1.35, 0, 1.0),
      at(customerPallet('A', 3), 1.35, 0, 1.0),
    ),
    ground: 0x4b4f58,
    update,
    mascot,
  };
}
