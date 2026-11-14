import * as THREE from 'three';
import { flat, box, ball, group, at, panel, MONO } from '../lowpoly.js';
import { parcel, dark, white } from '../scenery.js';

const COLS = 9;
const ROWS = 4;
const STEP = 0.45; // height of one row of the stand
const FANS = [0xab47bc, 0xfdd835, 0xffffff, 0x26c6da, 0xef5350, 0x7e57c2];

// The slides on the big screen, drawn LED pixel by LED pixel.
function drawLed(ctx, time) {
  const { width: w, height: h } = ctx.canvas;
  const slide = Math.floor(time / 3) % 3;
  const blink = Math.floor(time * 3) % 2 === 0;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (slide === 0) {
    ctx.fillStyle = '#4a148c';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 26px ${MONO}`;
    ctx.fillText('<Ad />', w / 2, h / 2 + 1);
  } else if (slide === 1) {
    ctx.fillStyle = blink ? '#ffeb3b' : '#d50000';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = blink ? '#d50000' : '#ffeb3b';
    ctx.font = 'bold 34px system-ui, sans-serif';
    ctx.fillText('GOAL!', w / 2, h / 2 + 2);
  } else {
    ctx.fillStyle = '#0b1410';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#69f0ae';
    ctx.font = `bold 13px ${MONO}`;
    ctx.fillText(`npm run cheer${blink ? '_' : ' '}`, w / 2, h / 2);
  }
  // Marching lights around the top and bottom edge.
  const step = Math.floor(time * 10);
  for (let i = 0; i < w; i += 4) {
    ctx.fillStyle = (i / 4 + step) % 3 === 0 ? '#ffffff' : 'rgb(0 0 0 / 0.4)';
    ctx.fillRect(i, 0, 3, 2);
    ctx.fillRect(w - i - 3, h - 2, 3, 2);
  }
}

// A ticker that scrolls by moving the texture, so the text has to tile.
function ticker(width, height, text) {
  const strip = panel(width, height, 576);
  const { ctx } = strip;
  const { width: w, height: h } = ctx.canvas;
  ctx.fillStyle = '#12061c';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#ffd54f';
  ctx.font = `bold ${h * 0.6}px system-ui, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.scale(w / ctx.measureText(text).width, 1);
  ctx.fillText(text, 0, h / 2);
  strip.texture.wrapS = THREE.RepeatWrapping;
  strip.texture.needsUpdate = true;
  return strip;
}

// A stand full of fans. Two instanced meshes, so the whole crowd costs
// two draw calls.
function stand(rand) {
  const concrete = flat(0x9aa4ad);
  const g = group();
  for (let r = 0; r < ROWS; r++) g.add(box(4.5, STEP * (r + 1), 0.62, concrete, 0, (STEP * (r + 1)) / 2, -0.62 * r));

  const count = COLS * ROWS;
  const bodies = new THREE.InstancedMesh(new THREE.BoxGeometry(0.28, 0.42, 0.2), flat(0xffffff), count);
  const heads = new THREE.InstancedMesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), flat(0xd9a880), count);
  const color = new THREE.Color();
  for (let i = 0; i < count; i++) bodies.setColorAt(i, color.set(FANS[Math.floor(rand() * FANS.length)]));
  bodies.frustumCulled = false;
  heads.frustumCulled = false;
  g.add(bodies, heads);

  const spot = new THREE.Matrix4();
  function wave(time) {
    for (let i = 0; i < count; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = (col - (COLS - 1) / 2) * 0.47;
      const y = STEP * (row + 1) + Math.pow(Math.max(0, Math.sin(time * 2.4 - col * 0.5)), 4) * 0.4;
      bodies.setMatrixAt(i, spot.makeTranslation(x, y + 0.21, -0.62 * row));
      heads.setMatrixAt(i, spot.makeTranslation(x, y + 0.53, -0.62 * row));
    }
    bodies.instanceMatrix.needsUpdate = true;
    heads.instanceMatrix.needsUpdate = true;
  }
  return { object: g, wave };
}

// His code on the big screen, in front of a crowd.
export function signage(rand) {
  const led = panel(5, 2.3, 120, { pixelated: true });
  const screen = group(
    box(5.2, 2.5, 0.16, dark, 0, 0, -0.09),
    led.mesh,
    box(0.16, 4.5, 0.16, dark, -2.4, -1.1, -0.2),
    box(0.16, 4.5, 0.16, dark, 2.4, -1.1, -0.2),
  );
  screen.position.set(2.6, 3.3, -2.4);
  let drawn = -1;

  const fans = stand(rand);
  fans.object.position.set(-2.7, 0, -2.3);

  const strip = ticker(7.2, 0.5, 'ReactJS  ●  JavaScript  ●  HTML/CSS  ●  UI + UX  ●  ');
  const boards = group(box(7.3, 0.6, 0.08, dark, 0, 0.3, -0.05), at(strip.mesh, 0, 0.3, 0));
  boards.position.set(0.6, 0, -1.2);

  const football = ball(0.17, 1, white, -1.6, 0.17, 1.45);
  const mascot = at(parcel('badge'), -2.7, 0, 1.3, 0.5);

  function update(time) {
    const tick = Math.floor(time * 10);
    if (tick !== drawn) {
      drawn = tick;
      drawLed(led.ctx, time);
      led.texture.needsUpdate = true;
    }
    fans.wave(time);
    strip.texture.offset.x = time * 0.06;
    football.position.y = 0.17 + Math.abs(Math.sin(time * 3)) * 0.8;
    football.rotation.z = -time * 2;
    mascot.rotation.z = Math.sin(time * 3) * 0.05;
  }

  return {
    object: group(box(9.6, 0.02, 0.1, white, 0, 0.01, 1.75), fans.object, boards, screen, mascot, football),
    ground: 0x2e7d32,
    update,
    mascot,
  };
}
