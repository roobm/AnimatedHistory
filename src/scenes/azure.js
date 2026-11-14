import { flat, glow, box, cyl, ball, group, at, label, MONO } from '../lowpoly.js';
import { packet, pipe, steel, dark, white } from '../scenery.js';
import { pulse } from '../animations.js';

// The old system he is replacing: beige, loud and still running.
function mainframe() {
  const beige = flat(0xd7ccb0);
  const reels = [-0.4, 0.4].map((x) => {
    const reel = cyl(0.28, 0.28, 0.06, 8, dark, x, 2.25, 0.52);
    reel.rotation.x = Math.PI / 2;
    reel.add(box(0.5, 0.02, 0.06, steel)); // a spoke, so the spinning shows
    return reel;
  });
  const lights = [0, 1, 2, 3, 4, 5].map((i) => glow(i % 2 ? 0xffb300 : 0x66ff88, 1));
  const alarm = glow(0xff1744, 1);
  const object = group(
    box(1.7, 3.2, 1.0, beige, 0, 1.6, 0),
    box(1.5, 0.75, 0.04, flat(0x8d8468), 0, 2.25, 0.5),
    ...reels,
    ...lights.map((light, i) => box(0.12, 0.1, 0.04, light, -0.5 + i * 0.2, 1.65, 0.51)),
    at(label('LEGACY', { width: 1.1, height: 0.3, bg: '#5d4037', fg: '#ffe0b2', font: MONO }), 0, 2.9, 0.51),
    box(1.3, 0.04, 0.04, dark, 0, 0.55, 0.51),
    box(1.3, 0.04, 0.04, dark, 0, 0.42, 0.51),
    box(1.3, 0.04, 0.04, dark, 0, 0.29, 0.51),
    cyl(0.1, 0.1, 0.14, 8, alarm, 0.6, 3.27, 0),
  );
  return { object, reels, lights, alarm };
}

function eyes(y, z) {
  return [box(0.07, 0.1, 0.03, dark, -0.12, y, z), box(0.07, 0.1, 0.03, dark, 0.12, y, z)];
}

// Out with the legacy system, in with a data platform. Up top, documents
// go through OpenAI and come out as answers for Copilot.
export function azureData(rand) {
  const old = mainframe();
  old.object.position.set(-2.6, 0, -1.6);

  const mascot = packet();
  mascot.scale.setScalar(1.5);
  const platform = group(
    box(2.5, 0.45, 1.5, flat(0xb87333), 0, 0.225, 0),
    box(2.1, 0.45, 1.25, flat(0xc0c9d1), 0, 0.675, 0),
    box(1.7, 0.45, 1.0, flat(0xffc107), 0, 1.125, 0),
    at(label('bronze', { width: 0.8, height: 0.22, bg: null, fg: '#ffffff', font: MONO }), 0, 0.225, 0.76),
    at(label('silver', { width: 0.8, height: 0.22, bg: null, fg: '#ffffff', font: MONO }), 0, 0.675, 0.635),
    at(label('gold', { width: 0.8, height: 0.22, bg: null, fg: '#ffffff', font: MONO }), 0, 1.125, 0.51),
    box(0.9, 0.5, 0.6, steel, 0, 1.6, 0),
    at(label('API', { width: 0.6, height: 0.3, bg: '#263238', fg: '#80deea', font: MONO }), 0, 1.6, 0.305),
    mascot,
  );
  platform.position.set(2.7, 0, -1.3);

  const migration = pipe([[-1.75, 2.25, -1.6], [-0.3, 2.75, -1.8], [1.6, 2.75, -1.6], [2.7, 1.9, -1.3]], 0.07, flat(0x4fc3f7));
  const moving = [0, 1, 2, 3].map(() => packet());
  const move = group(migration.object, ...moving);

  // Blob Storage → OpenAI → Copilot.
  const brain = ball(0.42, 0, glow(0x10a37f, 0.5), 2.4, 0, 0);
  const copilot = group(ball(0.42, 1, glow(0x7c4dff, 0.5)), ...eyes(0.05, 0.4));
  copilot.position.x = 4.8;
  const paper = flat(0xffffff);
  const answer = glow(0xffe066, 1);
  const documents = [0, 1, 2, 3, 4].map(() => box(0.2, 0.26, 0.03, paper));
  const tag = (text, x) => at(label(text, { width: 1.1, height: 0.26, bg: null, fg: '#e3f2fd', font: MONO }), x, -0.72, 0.1);
  const content = group(
    box(4.8, 0.05, 0.05, flat(0x90a4ae), 2.4, 0, -0.1),
    cyl(0.4, 0.4, 0.7, 10, flat(0x0288d1)),
    cyl(0.42, 0.42, 0.08, 10, white, 0, 0.15, 0),
    brain,
    copilot,
    tag('Blob', 0),
    tag('OpenAI', 2.4),
    tag('Copilot', 4.8),
    ...documents,
  );
  content.position.set(-1.6, 4.3, -2.6);

  const star = glow(0xffe066, 1);
  const stars = [0, 1, 2, 3, 4].map(() => box(0.1, 0.1, 0.02, star));
  const banner = group(label('LEVEL UP!', { width: 1.5, height: 0.4, bg: null, fg: '#ffe066', screen: true }), ...stars);
  const levelUp = group(banner);

  function update(time) {
    old.reels.forEach((reel, i) => {
      reel.rotation.y = time * (i ? -1.6 : 2.1);
    });
    old.lights.forEach((light, i) => {
      light.emissiveIntensity = Math.sin(time * (2 + i * 0.7) + i) > 0 ? 1 : 0.1;
    });
    old.alarm.emissiveIntensity = 0.4 + 0.8 * Math.abs(Math.sin(time * 2.5));

    moving.forEach((p, k) => migration.along(time * 0.1 + k / moving.length, p.position));
    mascot.position.set(0, 2.25 + Math.sin(time * 1.8) * 0.1, 0);
    mascot.rotation.y = Math.sin(time * 0.9) * 0.5;

    documents.forEach((doc, k) => {
      const p = (time * 0.11 + k / documents.length) % 1;
      doc.position.set(p * 4.8, 0.1 + Math.sin(p * Math.PI * 6) * 0.06, 0.25);
      doc.rotation.z = Math.sin(time * 2 + k) * 0.15;
      doc.material = p > 0.5 ? answer : paper;
      doc.visible = p > 0.08 && p < 0.92 && Math.abs(p - 0.5) > 0.06;
    });
    brain.rotation.y = time * 0.7;
    brain.rotation.x = time * 0.4;
    copilot.position.y = Math.sin(time * 1.5) * 0.06;

    // In time with his fist pump.
    const up = pulse(time, 4.5, 1.1);
    banner.visible = up > 0.01;
    banner.position.set(0.1, 2.75 + up * 0.5, 0.3);
    banner.scale.setScalar(Math.max(0.001, up));
    stars.forEach((s, i) => {
      const angle = (i / stars.length) * Math.PI * 2 + time * 2;
      s.position.set(Math.cos(angle) * 0.95, Math.sin(angle) * 0.42, 0);
      s.rotation.z = time * 4;
    });
  }

  return { object: group(old.object, platform, move, content, levelUp), ground: 0x1d3557, update, mascot };
}
