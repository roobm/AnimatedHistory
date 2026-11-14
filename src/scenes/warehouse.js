import { flat, glow, box, group, at, label, panel, MONO } from '../lowpoly.js';
import { parcel, rack, buddy, forklift, signpost, steel, dark } from '../scenery.js';
import { pulse } from '../animations.js';

const BAYS = 6;
const LEVELS = 4;
const BAY_WIDTH = 1.4;
const LEVEL_HEIGHT = 1.05;
const REACH = 3.3; // how far the crane travels from the middle of the rack

// The operator screen: every bin of the rack, with the crane's bin lit up.
function drawControl(ctx, col, row) {
  const { width: w, height: h } = ctx.canvas;
  ctx.fillStyle = '#0d1b2a';
  ctx.fillRect(0, 0, w, h);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#e0f2f1';
  ctx.font = `bold ${h * 0.11}px ${MONO}`;
  ctx.fillText('WAREHOUSE CONTROL', w * 0.05, h * 0.1);

  const cell = (w * 0.9) / BAYS;
  const cellHeight = (h * 0.58) / LEVELS;
  for (let r = 0; r < LEVELS; r++) {
    for (let c = 0; c < BAYS; c++) {
      const here = c === col && r === row;
      ctx.fillStyle = here ? '#ffca28' : (c * 7 + r * 3) % 5 ? '#26a69a' : '#1b3a4b';
      ctx.fillRect(w * 0.05 + c * cell + 2, h * 0.2 + (LEVELS - 1 - r) * cellHeight + 2, cell - 4, cellHeight - 4);
    }
  }
  ctx.fillStyle = '#ffca28';
  ctx.font = `bold ${h * 0.1}px ${MONO}`;
  ctx.fillText(`CRANE 1 > BIN ${'ABCD'[row]}-0${col + 1}`, w * 0.05, h * 0.9);
}

// The automated warehouse: a stacker crane that never stops, the screen
// that runs it, and the operators he is training.
export function warehouse(rand) {
  const racking = at(rack(BAYS, LEVELS, rand, { bayWidth: BAY_WIDTH, levelHeight: LEVEL_HEIGHT, fill: 0.7 }), 0.4, 0, -3.2);

  const mascot = parcel('barcode');
  mascot.scale.setScalar(0.8);
  mascot.position.set(0, 0.06, 0.12);
  const lift = group(box(0.95, 0.06, 0.7, steel, 0, 0.03, 0.12), box(0.3, 0.3, 0.2, flat(0xffb300), 0, 0.15, -0.2), mascot);
  const mast = group(
    box(1.1, 0.18, 0.5, flat(0xffb300), 0, 0.14, 0),
    box(0.16, 4.5, 0.16, flat(0xffb300), 0, 2.3, -0.2),
    box(0.3, 0.14, 0.3, dark, 0, 4.6, -0.2),
    lift,
  );
  const crane = group(box(BAYS * BAY_WIDTH + 0.6, 0.05, 0.12, steel, 0, 0.025, 0), mast);
  crane.position.set(0.4, 0, -2.3);

  const control = panel(2.3, 1.4, 230);
  const screen = group(
    box(2.46, 1.56, 0.1, dark, 0, 0, -0.06),
    control.mesh,
    box(0.14, 2.25, 0.14, dark, 0, -1.88, -0.08),
    box(0.9, 0.08, 0.5, dark, 0, -3.01, -0.08),
    box(0.08, 0.08, 0.04, glow(0x66ff88, 1), 1.08, -0.68, 0.02),
  );
  at(screen, 3.6, 3.05, -1.3, -0.3);
  let shown = '';

  const question = label('?', { width: 0.45, height: 0.5, bg: null, fg: '#ffe066', screen: true });
  const trainees = [buddy(0x546e7a, { vest: true, helmet: 0xffffff }), buddy(0x6d4c41, { vest: true, helmet: 0xfdd835, hair: 0x1c1c1c })];
  const operators = group(at(trainees[0], 0, 0, 0, -1.0), at(trainees[1], 0.95, 0, -0.15, -1.15), question);
  operators.position.set(1.55, 0, -1.2);

  const retired = group(forklift(0x8d99a6), at(signpost(label('RETIRED', { width: 0.9, height: 0.3, bg: '#fff3e0', fg: '#bf360c' }), 2.75), -0.1, 0, 0.55));
  at(retired, -3.3, 0, -1.4, 0.2);

  function update(time) {
    const x = REACH * Math.sin(time * 0.4);
    const y = 0.3 + 1.55 * (1 + Math.sin(time * 0.63 + 1));
    mast.position.x = x;
    lift.position.y = y;
    mascot.rotation.y = Math.sin(time * 1.4) * 0.2;

    const half = (BAYS * BAY_WIDTH) / 2;
    const col = Math.min(BAYS - 1, Math.max(0, Math.floor((x + half) / BAY_WIDTH)));
    const row = Math.min(LEVELS - 1, Math.floor(y / LEVEL_HEIGHT));
    if (`${col}${row}` !== shown) {
      shown = `${col}${row}`;
      drawControl(control.ctx, col, row);
      control.texture.needsUpdate = true;
    }

    trainees.forEach((trainee, i) => {
      trainee.userData.head.rotation.x = Math.max(0, Math.sin(time * 2.2 + i * 1.7)) * 0.22;
    });
    const wonder = pulse(time + 3, 6, 1.5);
    question.visible = wonder > 0.01;
    question.material.opacity = wonder;
    question.position.set(0.95, 2.75 + wonder * 0.2, -0.15);
  }

  return { object: group(racking, crane, retired, screen, operators), ground: 0x455a64, update, mascot };
}
