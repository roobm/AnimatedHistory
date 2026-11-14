import * as THREE from 'three';
import { flat, glow, box, cyl, group, at, label, MONO } from '../lowpoly.js';
import { parcel, signpost, dark, white } from '../scenery.js';
import { pulse } from '../animations.js';

const PARTY = [0xff5252, 0xffca28, 0x66bb6a, 0x42a5f5, 0xab47bc, 0xff8a65];
const SKILLS = [
  ['C#', 0x7b1fa2],
  ['.NET', 0x512bd4],
  ['Azure', 0x0078d4],
  ['Bicep', 0x00897b],
  ['Python', 0x3572a5],
  ['CI/CD', 0xef6c00],
];
const CONFETTI = 90;

// A certification as a medal on a pedestal.
function trophy(text, color) {
  const face = cyl(0.5, 0.5, 0.12, 6, glow(color, 0.35));
  face.rotation.x = Math.PI / 2;
  const medal = group(face, at(label(text, { width: 0.72, height: 0.26, bg: null, fg: '#ffffff' }), 0, 0, 0.07));
  medal.position.y = 2.2;
  return {
    medal,
    object: group(box(0.9, 0.12, 0.9, white, 0, 0.06, 0), box(0.7, 1.2, 0.7, white, 0, 0.72, 0), box(0.86, 0.1, 0.86, flat(0xffc107), 0, 1.37, 0), medal),
  };
}

// Three, two, one: what the whole road added up to.
function pyramid() {
  const g = group();
  const spots = [[-1.05, 0.3], [0, 0.3], [1.05, 0.3], [-0.525, 0.92], [0.525, 0.92], [0, 1.54]];
  SKILLS.forEach(([name, color], i) => {
    const [x, y] = spots[i];
    g.add(box(1.0, 0.6, 0.6, flat(color), x, y, 0), at(label(name, { width: 0.9, height: 0.4, bg: null, fg: '#ffffff', font: MONO }), x, y, 0.305));
  });
  return g;
}

function bunting(width, sag) {
  const g = group(box(0.1, 4.6, 0.1, dark, -width / 2, 2.3, 0), box(0.1, 4.6, 0.1, dark, width / 2, 2.3, 0));
  const flags = [];
  const count = 19;
  for (let i = 0; i < count; i++) {
    const u = (i / (count - 1)) * 2 - 1;
    const flag = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.34, 3), flat(PARTY[i % PARTY.length]));
    flag.rotation.z = Math.PI; // point down
    flag.scale.z = 0.15;
    const holder = at(group(at(flag, 0, -0.19, 0)), (u * width) / 2, 4.55 - sag * (1 - u * u), 0);
    flags.push(holder);
    g.add(holder);
  }
  return { object: g, flags };
}

function confetti(rand) {
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 0.012, 0.06), flat(0xffffff), CONFETTI);
  mesh.frustumCulled = false;
  const color = new THREE.Color();
  const pieces = [];
  for (let i = 0; i < CONFETTI; i++) {
    mesh.setColorAt(i, color.set(PARTY[i % PARTY.length]));
    pieces.push({ x: (rand() - 0.5) * 10, z: -2.6 + rand() * 4.2, offset: rand(), speed: 0.1 + rand() * 0.08, spin: 1 + rand() * 3, sway: rand() * 6 });
  }

  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const turn = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const size = new THREE.Vector3(1, 1, 1);
  function fall(time) {
    pieces.forEach((piece, i) => {
      const p = (piece.offset + time * piece.speed) % 1;
      position.set(piece.x + Math.sin(time * 1.3 + piece.sway) * 0.25, 5.3 - p * 5.3, piece.z);
      euler.set(time * piece.spin + piece.sway, piece.sway, time * piece.spin * 0.7);
      mesh.setMatrixAt(i, matrix.compose(position, turn.setFromEuler(euler), size));
    });
    mesh.instanceMatrix.needsUpdate = true;
  }
  return { mesh, fall };
}

// The party at the end of the road.
export function epilogue(rand) {
  const first = trophy('AZ-204', 0x0078d4);
  const second = trophy('AZ-400', 0x7e57c2);
  first.object.position.set(-1.65, 0, -1.3);
  second.object.position.set(1.65, 0, -1.3);

  const skills = at(pyramid(), -3.85, 0, -2.5, 0.15);
  skills.scale.setScalar(0.85);

  const flags = bunting(10.2, 0.6);
  flags.object.position.z = -1.7;

  const party = confetti(rand);

  const mascot = at(parcel('shades'), -2.4, 0, 1.25, 0.3);

  const next = at(signpost(label('NEXT →\nyour project?', { width: 1.5, height: 0.7, bg: '#ffe066', fg: '#1b2130' }), 2.9), 3.7, 0, -1.3, -0.15);

  function update(time) {
    [first, second].forEach(({ medal }, i) => {
      medal.position.y = 2.2 + Math.sin(time * 1.4 + i * 2) * 0.1;
      medal.rotation.y = Math.sin(time * 0.9 + i * 2) * 0.5;
    });
    flags.flags.forEach((flag, i) => {
      flag.rotation.x = Math.sin(time * 2.2 + i * 0.6) * 0.3;
    });
    party.fall(time);
    // Hops along with his.
    mascot.position.y = pulse(time, 3.2, 0.7) * 0.35;
    mascot.rotation.z = Math.sin(time * 3) * 0.06;
  }

  return { object: group(flags.object, skills, first.object, second.object, next, mascot, party.mesh), ground: 0x6a3d5a, update, mascot };
}
