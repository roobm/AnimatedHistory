import * as THREE from 'three';
import { flat, glow, box, group } from './lowpoly.js';
import { REST, WORK, mixPose, walkPose, hello, jumpPose, cartwheelPose, cartwheelMotion } from './animations.js';

const SKIN = 0xe0b08c;
const HAIR = 0x5a3a24;
const EYES = 0x3b2414;

const THIGH = 0.42;
const SHIN = 0.42;
const SOLE = 0.1;
const RIGHT = -1; // the character faces +z, so his right side is -x
const LEFT = 1;

const WALK_HEADING = 1.15; // three-quarter view while walking, not a flat profile
const SPIN_SECONDS = 0.5; // quick-change spin when the outfit swaps
const GREETINGS = { wave: 1.4, jump: 0.95, cartwheel: 1.25 }; // seconds. Clicking him cycles through these
const PIVOT = 1.05; // height of the middle of his body, which the cartwheel rolls about

// Colours per chapter. Missing sleeve parts take the top colour, missing
// hands are bare. extras: accessories to show, built in buildRig().
const OUTFITS = {
  supermarket: { top: 0xf1ede2, forearm: SKIN, legs: 0x2b3140, shoes: 0x1c1f28, apron: 0x4caf50, extras: ['apron'] },
  metal: { top: 0x4a5568, hand: 0x8d6e4a, legs: 0x39424e, shoes: 0x1c1f28, apron: 0x6d4c33, extras: ['apron', 'goggles', 'earmuffs'] },
  sausages: { top: 0xf4f4f4, hand: 0x64b5f6, legs: 0xdfe3e8, shoes: 0xf4f4f4, extras: ['coat', 'hairnet'] },
  logistics: { top: 0x37474f, forearm: SKIN, legs: 0x26324a, shoes: 0x4e342e, extras: ['vest'] },
  studies: { top: 0x42a5f5, legs: 0x3b5b8c, shoes: 0xf4f4f4, extras: ['hood', 'backpack'] },
  signage: { top: 0xab47bc, legs: 0x3b5b8c, shoes: 0xf4f4f4, extras: ['hood', 'badge'] },
  'warehouse-ui': { top: 0xdfeaf5, legs: 0x8d7b68, shoes: 0x4e342e, extras: ['vest'] },
  integrations: { top: 0x5c6bc0, forearm: SKIN, legs: 0x8d7b68, shoes: 0x3e2f25, extras: [] },
  'azure-data': { top: 0x0078d4, legs: 0x2b3140, shoes: 0xf4f4f4, extras: ['hood', 'headset'] },
  epilogue: { top: 0x1f2a44, legs: 0x1f2a44, shoes: 0xf4f4f4, extras: ['tie', 'sunglasses'] },
};

function buildRig() {
  const mats = {
    skin: flat(SKIN),
    top: flat(0xffffff),
    sleeve: flat(0xffffff),
    forearm: flat(SKIN),
    hand: flat(SKIN),
    legs: flat(0x2b3140),
    shoes: flat(0x1c1f28),
    apron: flat(0x4caf50),
  };
  const dark = flat(0x20242c);
  const extras = {};

  const root = new THREE.Group();
  const body = new THREE.Group(); // the hips; raised every frame so the feet touch the ground
  const torso = new THREE.Group();
  root.add(body);
  body.add(torso);
  torso.add(box(0.8, 0.85, 0.44, mats.top, 0, 0.425, 0));

  // Head: skull centre sits 0.42 above the neck joint.
  const head = new THREE.Group();
  head.position.y = 0.85;
  torso.add(head);
  const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(0.36, 1), mats.skin);
  skull.position.y = 0.42;
  const hairDome = new THREE.SphereGeometry(0.39, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2);
  const hair = new THREE.Mesh(hairDome, flat(HAIR));
  hair.position.set(0, 0.44, -0.03);
  hair.rotation.x = -0.3; // hairline up at the front, down at the back
  const eyeMat = flat(EYES);
  const eyes = group(box(0.07, 0.09, 0.04, eyeMat, -0.13, 0, 0), box(0.07, 0.09, 0.04, eyeMat, 0.13, 0, 0));
  eyes.position.set(0, 0.46, 0.325);
  head.add(box(0.2, 0.12, 0.2, mats.skin, 0, 0.03, 0), skull, hair, eyes, box(0.16, 0.035, 0.03, eyeMat, 0, 0.3, 0.325));

  function makeArm(side) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.51, 0.76, 0);
    shoulder.add(box(0.2, 0.42, 0.22, mats.sleeve, 0, -0.17, 0));
    const elbow = new THREE.Group();
    elbow.position.y = -0.36;
    elbow.add(box(0.18, 0.34, 0.2, mats.forearm, 0, -0.17, 0), box(0.17, 0.15, 0.19, mats.hand, 0, -0.4, 0));
    const grip = new THREE.Group(); // props are attached here
    grip.position.y = -0.42;
    elbow.add(grip);
    shoulder.add(elbow);
    torso.add(shoulder);
    return { side, shoulder, elbow, grip };
  }

  function makeLeg(side) {
    const hip = new THREE.Group();
    hip.position.x = side * 0.2;
    hip.add(box(0.28, THIGH + 0.06, 0.3, mats.legs, 0, -THIGH / 2, 0));
    const knee = new THREE.Group();
    knee.position.y = -THIGH;
    knee.add(box(0.24, SHIN, 0.26, mats.legs, 0, -SHIN / 2, 0));
    const foot = new THREE.Group();
    foot.position.y = -SHIN;
    foot.add(box(0.26, SOLE + 0.04, 0.42, mats.shoes, 0, 0.02 - SOLE / 2, 0.07));
    knee.add(foot);
    hip.add(knee);
    body.add(hip);
    return { side, hip, knee, foot };
  }

  const arms = { R: makeArm(RIGHT), L: makeArm(LEFT) };
  const legs = { R: makeLeg(RIGHT), L: makeLeg(LEFT) };

  // Accessories on the torso.
  const stripe = flat(0xcfd8dc);
  extras.apron = box(0.6, 0.7, 0.04, mats.apron, 0, 0.3, 0.245);
  extras.vest = group(
    box(0.84, 0.6, 0.48, flat(0xffd600), 0, 0.52, 0),
    box(0.85, 0.06, 0.49, stripe, 0, 0.34, 0),
    box(0.85, 0.06, 0.49, stripe, 0, 0.5, 0),
  );
  extras.coat = box(0.84, 0.4, 0.48, mats.top, 0, -0.14, 0);
  extras.hood = box(0.5, 0.2, 0.2, mats.top, 0, 0.82, -0.26);
  extras.backpack = box(0.56, 0.62, 0.26, flat(0x8b3a3a), 0, 0.45, -0.35);
  extras.badge = group(box(0.03, 0.3, 0.02, dark, 0.1, 0.62, 0.225), box(0.13, 0.17, 0.02, flat(0xf4f4f4), 0.1, 0.4, 0.232));
  extras.tie = group(box(0.24, 0.62, 0.02, flat(0xf4f4f4), 0, 0.52, 0.222), box(0.09, 0.46, 0.02, flat(0xf06292), 0, 0.5, 0.236));
  torso.add(extras.apron, extras.vest, extras.coat, extras.hood, extras.backpack, extras.badge, extras.tie);

  // Accessories on the head.
  const cup = new THREE.CylinderGeometry(0.14, 0.14, 0.1, 8).rotateZ(Math.PI / 2);
  const arc = new THREE.TorusGeometry(0.42, 0.03, 4, 8, Math.PI); // ear to ear, over the hair
  const headband = (material, cups) => {
    const band = new THREE.Mesh(arc, material);
    band.position.y = 0.42;
    const ears = [-0.4, 0.4].map((x) => {
      const mesh = new THREE.Mesh(cup, cups);
      mesh.position.set(x, 0.42, 0);
      return mesh;
    });
    return group(band, ...ears);
  };
  const strap = new THREE.Mesh(new THREE.CylinderGeometry(0.375, 0.375, 0.05, 10, 1, true), flat(0x20242c, { side: THREE.DoubleSide }));
  strap.position.y = 0.47;
  extras.goggles = group(box(0.56, 0.15, 0.1, flat(0x263238, { roughness: 0.3 }), 0, 0.47, 0.31), strap);
  extras.earmuffs = headband(dark, flat(0xff7043));
  extras.headset = headband(dark, dark);
  const mic = box(0.03, 0.03, 0.3, dark, 0.38, 0.33, 0.16);
  mic.rotation.x = 0.35;
  extras.headset.add(mic);
  extras.hairnet = new THREE.Mesh(hairDome, flat(0xe8f4fb, { transparent: true, opacity: 0.8 }));
  extras.hairnet.position.set(0, 0.44, -0.03);
  extras.hairnet.rotation.x = -0.3;
  extras.hairnet.scale.setScalar(1.06);
  extras.sunglasses = group(
    box(0.22, 0.13, 0.04, dark, -0.14, 0.46, 0.335),
    box(0.22, 0.13, 0.04, dark, 0.14, 0.46, 0.335),
    box(0.1, 0.03, 0.04, dark, 0, 0.49, 0.335),
  );
  head.add(extras.goggles, extras.earmuffs, extras.headset, extras.hairnet, extras.sunglasses);

  return { root, body, torso, head, eyes, arms, legs, mats, extras };
}

// Things he holds while working. Two-handed props hang off the right hand
// and reach across to the left one.
function buildProps(rig) {
  const props = {};
  const reach = 0.51; // from the right hand to the middle of the body

  props.box = group(box(0.8, 0.42, 0.46, flat(0xc49a6c)), box(0.81, 0.07, 0.47, flat(0x9c7648)));
  props.box.position.set(reach, -0.02, 0.14);
  rig.arms.R.grip.add(props.box);

  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 10).rotateZ(Math.PI / 2), flat(0xb0bec5, { roughness: 0.4 }));
  disc.position.y = -0.45;
  const tip = new THREE.Object3D(); // sparks start here
  tip.position.y = -0.64;
  props.grinder = group(box(0.16, 0.5, 0.16, flat(0x2e7d6b), 0, -0.15, 0), disc, tip);
  props.grinder.position.set(0.2, 0, 0.05);
  rig.arms.R.grip.add(props.grinder);

  const link = new THREE.CapsuleGeometry(0.07, 0.2, 2, 6);
  const sausageMat = flat(0xd9806f);
  const first = new THREE.Mesh(link, sausageMat);
  first.rotation.z = Math.PI / 2;
  const second = new THREE.Mesh(link, sausageMat);
  second.position.set(0.24, -0.14, 0);
  second.rotation.z = 0.3;
  props.sausage = group(first, second);
  props.sausage.position.set(0, -0.06, 0.06);
  rig.arms.R.grip.add(props.sausage);

  props.book = group(box(0.42, 0.04, 0.3, flat(0x2f5d8a)), box(0.38, 0.03, 0.26, flat(0xf5f0e1), 0, 0.03, 0));
  props.book.position.set(0.16, -0.06, 0);
  rig.arms.R.grip.add(props.book);

  // He holds the tablet up for the trainees, so the screen faces away from him.
  const ink = flat(0x0d3b4a);
  props.tablet = group(
    box(0.34, 0.03, 0.46, flat(0x20242c)),
    box(0.3, 0.01, 0.42, glow(0x26c6da), 0, -0.02, 0),
    box(0.22, 0.012, 0.05, ink, 0, -0.022, -0.13),
    box(0.1, 0.012, 0.1, ink, -0.06, -0.022, 0.02),
    box(0.1, 0.012, 0.1, ink, 0.06, -0.022, 0.02),
  );
  props.tablet.position.set(-0.1, -0.06, 0);
  rig.arms.L.grip.add(props.tablet);

  const metal = flat(0x9aa4b2);
  const lid = group(box(0.62, 0.4, 0.03, metal, 0, 0.2, 0), box(0.1, 0.1, 0.01, glow(0x7fd4ff), 0, 0.2, 0.02));
  lid.position.z = 0.21;
  lid.rotation.x = 0.25;
  props.laptop = group(box(0.62, 0.03, 0.42, metal), lid);
  props.laptop.position.set(0, 0.47, 0.62);
  rig.torso.add(props.laptop);

  return { props, sparkSource: tip };
}

// Grinder sparks: a small pool of points with gravity, in world space.
function makeSparks(count = 40) {
  const positions = new Float32Array(count * 3).fill(-100);
  const velocity = new Float32Array(count * 3);
  const life = new Float32Array(count);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xffc04d, size: 0.09, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  // origin: where new sparks start, or null to let the live ones die out.
  function update(dt, origin) {
    for (let i = 0; i < count; i++) {
      const p = i * 3;
      life[i] -= dt;
      if (life[i] <= 0) {
        positions[p + 1] = -100;
        if (!origin || Math.random() > 0.3) continue;
        positions[p] = origin.x;
        positions[p + 1] = origin.y;
        positions[p + 2] = origin.z;
        velocity[p] = 1.5 + Math.random() * 2.5;
        velocity[p + 1] = 1 + Math.random() * 2;
        velocity[p + 2] = Math.random() * 1.6 - 0.3;
        life[i] = 0.25 + Math.random() * 0.35;
      }
      velocity[p + 1] -= 9 * dt;
      positions[p] += velocity[p] * dt;
      positions[p + 1] += velocity[p + 1] * dt;
      positions[p + 2] += velocity[p + 2] * dt;
    }
    geometry.attributes.position.needsUpdate = true;
  }

  return { points, update };
}

const damp = (rate, dt) => 1 - Math.exp(-rate * dt);
const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
const smooth = (v) => v * v * (3 - 2 * v);

function applyPose(rig, pose) {
  rig.torso.rotation.set(pose.lean, pose.twist, 0);
  rig.head.rotation.set(pose.headX, pose.headY, pose.headZ);

  let reach = 0; // how far the lower foot is below the hips
  for (const key of ['R', 'L']) {
    const arm = rig.arms[key];
    arm.shoulder.rotation.set(-pose[`arm${key}`], 0, arm.side * pose[`arm${key}Out`]);
    arm.elbow.rotation.x = -pose[`elbow${key}`];

    const leg = rig.legs[key];
    const swing = pose[`leg${key}`];
    const bend = pose[`knee${key}`];
    leg.hip.rotation.set(-swing, 0, leg.side * pose.stance);
    leg.knee.rotation.x = bend;
    leg.foot.rotation.x = (swing - bend) * 0.8; // keep the sole roughly flat
    reach = Math.max(reach, (THIGH * Math.cos(swing) + SHIN * Math.cos(bend - swing)) * Math.cos(pose.stance));
  }
  rig.body.position.y = reach + SOLE + pose.lift;
}

// The one character that travels through every chapter.
export function createCharacter() {
  const rig = buildRig();
  const { props, sparkSource } = buildProps(rig);
  const sparks = makeSparks();
  const object = group(rig.root, sparks.points);

  const pose = { ...REST };
  const sparkOrigin = new THREE.Vector3();
  let chapterId = null;
  let lastX = null;
  let direction = 1; // +1 walking towards later chapters, -1 back in time
  let heading = 0;
  let speed = 0;
  let phase = 0; // walk cycle, advanced by distance so the feet match the ground
  let work = 1; // 0 = walking, 1 = working
  let spin = 1; // 0..1 progress of the quick-change spin, 1 = done
  let greet = 1; // 0..1 progress of the wave, jump or cartwheel, 1 = done
  let greeting = 'wave';
  let pokes = 0;
  rig.root.rotation.order = 'YXZ'; // the cartwheel rolls about his own front-to-back axis

  function setOutfit(id) {
    const outfit = OUTFITS[id] ?? OUTFITS.supermarket;
    const { mats } = rig;
    mats.top.color.setHex(outfit.top);
    mats.sleeve.color.setHex(outfit.top);
    mats.forearm.color.setHex(outfit.forearm ?? outfit.top);
    mats.hand.color.setHex(outfit.hand ?? SKIN);
    mats.legs.color.setHex(outfit.legs);
    mats.shoes.color.setHex(outfit.shoes);
    if (outfit.apron) mats.apron.color.setHex(outfit.apron);
    for (const [name, extra] of Object.entries(rig.extras)) extra.visible = outfit.extras.includes(name);
  }

  // x: position along the timeline. id: the chapter he is dressed for.
  // atChapter: close enough to a chapter to work. still: reduced motion.
  function update({ x, id, atChapter, time, dt, still }) {
    const dx = lastX === null ? 0 : x - lastX;
    lastX = x;
    if (Math.abs(dx) > 1e-4) direction = Math.sign(dx);

    if (id !== chapterId) {
      if (chapterId !== null && !still) spin = 0;
      chapterId = id;
      setOutfit(id);
    }
    const job = WORK[chapterId] ?? WORK.epilogue;

    if (still) {
      // Reduced motion: a frozen work pose, no walking, spinning or sparks.
      mixPose(pose, job.pose(0), REST, 0);
      heading = job.heading;
      work = 1;
    } else {
      speed += ((dt > 0 ? Math.abs(dx) / dt : 0) - speed) * damp(10, dt);
      const stride = clamp01(speed / 2);
      const run = clamp01((speed - 5) / 9);
      phase += (Math.abs(dx) * Math.PI * 2) / (1.9 + 3.6 * run); // longer strides when running

      work += ((atChapter ? 1 : 0) - work) * damp(7, dt);
      mixPose(pose, walkPose(phase, stride, run), job.pose(time), smooth(work));
      pose.lean += Math.sin(time * 2.1) * 0.012; // breathing
      // Standing on the road between chapters: look back at the viewer.
      pose.headY -= heading * 0.6 * (1 - stride) * (1 - work);

      if (greet < 1) {
        greet = Math.min(greet + dt / GREETINGS[greeting], 1);
        if (greeting === 'wave') {
          const hop = Math.sin(clamp01(greet * 3) * Math.PI);
          const hand = job.prop === 'tablet' ? 'R' : 'L'; // the one without a prop
          mixPose(pose, pose, hello(time, hand, hop), smooth(clamp01(Math.sin(greet * Math.PI) * 2.5)));
        } else {
          const move = greeting === 'jump' ? jumpPose(greet) : cartwheelPose(greet);
          mixPose(pose, pose, move, smooth(clamp01(Math.min(greet, 1 - greet) * 10)));
        }
      }

      const facing = greet < 1 ? 0 : atChapter ? job.heading : direction * WALK_HEADING;
      heading += (facing - heading) * damp(9, dt);
      spin = Math.min(spin + dt / SPIN_SECONDS, 1);
      rig.eyes.scale.y = time % 3.7 < 0.12 ? 0.15 : 1; // blink
    }

    applyPose(rig, pose);

    const unwind = 1 - spin;
    const pop = Math.sin(spin * Math.PI);
    const turn = heading + direction * Math.PI * 2 * unwind * unwind * unwind;
    rig.root.rotation.y = turn;
    if (greet < 1 && greeting === 'cartwheel' && !still) {
      // Roll about the middle of the body, not the feet, towards the right of the screen,
      // and lift him as a whole.
      const { angle, height } = cartwheelMotion(greet);
      const roll = -angle;
      rig.root.rotation.z = roll;
      rig.root.position.set(
        x + PIVOT * Math.sin(roll) * Math.cos(turn),
        height + PIVOT * (1 - Math.cos(roll)),
        -PIVOT * Math.sin(roll) * Math.sin(turn),
      );
    } else {
      rig.root.rotation.z = 0;
      rig.root.position.set(x, 0, 0);
    }
    rig.root.scale.set(1 - 0.08 * pop, 1 + 0.16 * pop, 1 - 0.08 * pop);

    const shown = smooth(clamp01(work));
    for (const [name, prop] of Object.entries(props)) {
      prop.visible = name === job.prop && shown > 0.02;
      prop.scale.setScalar(shown);
    }

    const grinding = job.sparks && work > 0.8 && !still;
    if (grinding) sparkSource.getWorldPosition(sparkOrigin);
    sparks.update(dt, grinding ? sparkOrigin : null);
  }

  // Clicked or tapped: turn to the viewer and wave, then jump, then cartwheel.
  // kind: 'wave' | 'jump' | 'cartwheel' to pick one.
  function poke(kind) {
    if (kind && greet < 1) {
      if (greeting === 'cartwheel' || kind === 'jump') return; // let him land first
      if (greeting === 'jump' && greet > 0.5) return; // too late to turn the jump into a cartwheel
    }
    greeting = kind ?? ['wave', 'jump', 'cartwheel'][pokes++ % 3];
    greet = 0;
  }

  return { object, body: rig.root, update, poke };
}
