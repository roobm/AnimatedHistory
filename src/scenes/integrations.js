import * as THREE from 'three';
import { flat, glow, box, cyl, ball, group, at, label, panel, MONO } from '../lowpoly.js';
import { parcel, packet, pipe, cloud, steel, dark, wood } from '../scenery.js';

const BICEP = ["resource sb 'ServiceBus' = {", "  name: 'sb-${env}'", "  sku: 'Standard'", '}'];
const STAGES = ['build', 'test', 'deploy'];

// Infrastructure as code, on parchment.
function scroll() {
  const sheet = panel(1.5, 1.3, 330, { unlit: false });
  const { ctx } = sheet;
  const { width: w, height: h } = ctx.canvas;
  ctx.fillStyle = '#f3e5c0';
  ctx.fillRect(0, 0, w, h);
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#8d5524';
  ctx.font = `bold ${h * 0.11}px ${MONO}`;
  ctx.fillText('main.bicep', w * 0.07, h * 0.14);
  ctx.fillRect(w * 0.07, h * 0.22, w * 0.86, 2);
  ctx.fillStyle = '#3e2723';
  ctx.font = `bold ${h * 0.075}px ${MONO}`;
  BICEP.forEach((line, i) => ctx.fillText(line, w * 0.07, h * (0.38 + i * 0.14)));
  sheet.texture.needsUpdate = true;

  const rod = (y) => {
    const mesh = cyl(0.06, 0.06, 1.7, 6, wood, 0, y, 0);
    mesh.rotation.z = Math.PI / 2;
    return mesh;
  };
  return group(sheet.mesh, rod(0.68), rod(-0.68));
}

// build → test → deploy, one lamp at a time.
function pipeline() {
  const lamps = STAGES.map((name, i) => {
    const material = glow(0x37474f, 0);
    const x = (i - 1) * 0.5;
    return {
      material,
      object: group(box(0.2, 0.2, 0.06, material, x, 0.06, 0.04), at(label(name, { width: 0.44, height: 0.14, bg: null, fg: '#cfd8dc', font: MONO }), x, -0.13, 0.04)),
    };
  });
  const object = group(box(1.6, 0.52, 0.06, dark), ...lamps.map((lamp) => lamp.object));

  function run(time) {
    const step = Math.floor(time * 0.8) % 5;
    lamps.forEach(({ material }, i) => {
      const done = step > i;
      const busy = step === i;
      material.color.set(done ? 0x43a047 : busy ? 0xffb300 : 0x37474f);
      material.emissive.copy(material.color);
      material.emissiveIntensity = done ? 1 : busy ? 0.5 + 0.5 * Math.sin(time * 14) : 0;
    });
  }
  return { object, run };
}

// Business data goes up to the cloud and comes back, through pipes he
// described as code.
export function integrations(rand) {
  const mascot = at(parcel('data'), -0.35, 1.6, 0, 0.2);
  const erp = group(
    box(1.7, 1.6, 1.1, flat(0x3949ab), 0, 0.8, 0),
    box(1.74, 0.08, 1.14, flat(0x283593), 0, 0.04, 0),
    at(label('Dynamics 365', { width: 1.4, height: 0.34, bg: '#283593', fg: '#ffffff' }), 0, 1.05, 0.555),
    box(0.1, 0.1, 0.02, glow(0x66ff88, 1), -0.6, 0.45, 0.56),
    box(0.1, 0.1, 0.02, glow(0x4dd0e1, 1), -0.42, 0.45, 0.56),
    mascot,
  );
  erp.position.set(-3.4, 0, -1.8);

  const sky = group(cloud(), at(label('Azure', { width: 0.7, height: 0.26, bg: '#0078d4', fg: '#ffffff' }), 0.05, -0.5, 0.45));
  sky.scale.setScalar(1.5);
  sky.position.set(2.7, 3.55, -1.8);

  const tube = flat(0x7986cb);
  const up = pipe([[-2.9, 1.6, -1.8], [-2.9, 3.3, -1.8], [2.0, 3.3, -1.8]], 0.07, tube);
  const down = pipe([[2.1, 3.0, -1.8], [2.1, 2.5, -1.8], [-2.2, 2.5, -1.8], [-2.2, 1.0, -1.8], [-2.55, 1.0, -1.8]], 0.07, tube);
  const hub = group(box(0.8, 0.5, 0.5, steel), at(label('API', { width: 0.6, height: 0.3, bg: '#263238', fg: '#80deea', font: MONO }), 0, 0, 0.255));
  hub.position.set(-0.5, 3.3, -1.8);
  const flows = [up, down].map((line) => ({ line, packets: [0, 1, 2].map(() => packet()) }));
  const plumbing = group(up.object, down.object, hub, ...flows.flatMap((flow) => flow.packets));

  const stages = pipeline();
  const easel = group(
    box(0.1, 2.9, 0.1, wood, -0.6, 1.45, -0.12),
    box(0.1, 2.9, 0.1, wood, 0.6, 1.45, -0.12),
    at(scroll(), 0, 2.05, 0),
    at(stages.object, 0, 0.95, 0),
  );
  at(easel, -1.35, 0, -1.2, 0.15);

  // He works for the whole map now.
  const pin = glow(0xffe066, 1);
  const globe = group(ball(0.6, 1, flat(0x1e88e5)), cyl(0.75, 0.75, 0.03, 12, flat(0x90caf9)));
  for (let i = 0; i < 7; i++) {
    const spot = new THREE.Vector3().setFromSphericalCoords(0.62, 0.7 + rand() * 1.6, rand() * Math.PI * 2);
    globe.add(box(0.08, 0.08, 0.08, pin, spot.x, spot.y, spot.z));
  }
  globe.rotation.z = 0.35;
  const world = group(globe);
  world.position.set(0.3, 4.45, -2.6);

  function update(time) {
    flows.forEach(({ line, packets }) => {
      packets.forEach((p, k) => line.along(time * 0.12 + k / packets.length, p.position));
    });
    stages.run(time);
    globe.rotation.y = time * 0.5;
    world.position.y = 4.45 + Math.sin(time * 0.9) * 0.08;
    pin.emissiveIntensity = 0.7 + 0.5 * Math.sin(time * 4);
    mascot.rotation.z = Math.sin(time * 2.3) * 0.05;
  }

  return { object: group(erp, plumbing, sky, easel, world), ground: 0x2a3158, update, mascot };
}
