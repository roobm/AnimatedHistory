// Poses for the character rig. A pose is a plain object of joint angles in
// radians; missing keys fall back to REST. Arms and legs: positive = forward.
// "Out" lifts an arm sideways, away from the body. R and L are the
// character's own right and left.

export const REST = {
  lean: 0, // torso forward
  twist: 0, // torso around the spine
  headX: 0, // nod down
  headY: 0, // turn towards the character's left
  headZ: 0, // tilt
  armR: 0,
  armL: 0,
  armROut: 0.08,
  armLOut: 0.08,
  elbowR: 0.15,
  elbowL: 0.15,
  legR: 0,
  legL: 0,
  kneeR: 0,
  kneeL: 0,
  stance: 0, // legs apart
  lift: 0, // jump height
};
const KEYS = Object.keys(REST);

export function mixPose(out, a, b, w) {
  for (const key of KEYS) {
    const from = a[key] ?? REST[key];
    const to = b[key] ?? REST[key];
    out[key] = from + (to - from) * w;
  }
  return out;
}

// stride: 0 = standing, 1 = full walk. run: 0..1 on top of a full walk.
export function walkPose(phase, stride, run) {
  const amp = stride * (0.55 + 0.35 * run);
  const s = Math.sin(phase);
  const c = Math.cos(phase);
  const elbow = 0.15 + stride * 0.2 + run * 1.1;
  return {
    lean: stride * 0.05 + run * 0.25,
    twist: s * amp * 0.15,
    legR: s * amp,
    legL: -s * amp,
    // A knee bends while its leg swings forward.
    kneeR: Math.max(0, c) * amp * 1.5,
    kneeL: Math.max(0, -c) * amp * 1.5,
    armR: -s * amp * 0.9,
    armL: s * amp * 0.9,
    elbowR: elbow,
    elbowL: elbow,
  };
}

const wave = (t, speed) => 0.5 - 0.5 * Math.cos(t * speed); // 0..1..0
// A single bump of the given length at the start of every period, else 0.
// Exported so the scenes can stay in step with the work animations.
export const pulse = (t, period, length) => {
  const u = t % period;
  return u < length ? Math.sin((u / length) * Math.PI) : 0;
};

// Clicked: he stops working, hops and waves with the hand that is free
// (hand: 'R' or 'L') while the other one keeps hold of his prop. hop: 0..1.
export function hello(t, hand, hop) {
  const other = hand === 'R' ? 'L' : 'R';
  return {
    headZ: hand === 'R' ? -0.12 : 0.12,
    headX: -0.08,
    [`arm${hand}`]: 0.1,
    [`arm${hand}Out`]: 2.4 + Math.sin(t * 13) * 0.28,
    [`elbow${hand}`]: 0.25,
    [`arm${other}`]: 0.5,
    [`arm${other}Out`]: 0,
    [`elbow${other}`]: 1.1,
    legR: 0.2 * hop,
    legL: 0.2 * hop,
    kneeR: 0.5 * hop,
    kneeL: 0.5 * hop,
    lift: 0.45 * hop,
  };
}

function typing(t) {
  const tap = Math.sin(t * 19) * 0.07;
  return {
    lean: 0.1,
    headX: 0.3,
    headY: Math.sin(t * 0.9) * 0.08,
    armR: 0.55,
    armL: 0.55,
    armROut: -0.12,
    armLOut: -0.12,
    elbowR: 1.25 + tap,
    elbowL: 1.25 - tap,
  };
}

// One work animation per chapter. heading: where he faces while working
// (0 = the viewer, positive = towards the pallet). prop: see character.js.
export const WORK = {
  // Box from the floor up to the top shelf, over and over.
  supermarket: {
    heading: 0.35,
    prop: 'box',
    pose(t) {
      const up = wave(t, 2.4);
      const down = 1 - up;
      return {
        lean: 0.45 * down - 0.08 * up,
        headX: 0.2 * down - 0.3 * up,
        armR: 0.7 + 1.8 * up,
        armL: 0.7 + 1.8 * up,
        armROut: 0,
        armLOut: 0,
        elbowR: 0.15 + 0.5 * down,
        elbowL: 0.15 + 0.5 * down,
        legR: 0.55 * down,
        legL: 0.55 * down,
        kneeR: 1.1 * down,
        kneeL: 1.1 * down,
      };
    },
  },

  // Angle grinder: braced, buzzing, sweeping slowly across the plate.
  metal: {
    heading: 0.6,
    prop: 'grinder',
    sparks: true,
    pose(t) {
      const buzz = Math.sin(t * 55) * 0.015;
      return {
        lean: 0.5,
        twist: Math.sin(t * 1.3) * 0.22,
        headX: 0.25,
        armR: 0.75 + buzz,
        armL: 0.75 - buzz,
        armROut: -0.3,
        armLOut: -0.3,
        elbowR: 0.45,
        elbowL: 0.45,
        legR: 0.3,
        legL: 0.3,
        kneeR: 0.6,
        kneeL: 0.6,
        stance: 0.22,
      };
    },
  },

  // The line keeps speeding up, then resets. The phase covers exactly
  // 20π per period, so the loop is seamless.
  sausages: {
    heading: 0,
    prop: 'sausage',
    pose(t) {
      const period = 2.5 * Math.PI;
      const u = t % period;
      const s = Math.sin(5 * u + (3 / period) * u * u);
      return {
        lean: 0.28,
        twist: s * 0.12,
        headX: 0.3,
        headY: s * 0.15,
        armR: 0.95 + 0.45 * s,
        armL: 0.95 - 0.45 * s,
        armROut: -0.05,
        armLOut: -0.05,
        elbowR: 0.9 - 0.3 * s,
        elbowL: 0.9 + 0.3 * s,
      };
    },
  },

  // Order picking: the same box from one side to the other.
  logistics: {
    heading: 0,
    prop: 'box',
    pose(t) {
      const side = Math.sin(t * 2.2);
      const dip = side * side;
      return {
        twist: side * 0.75,
        lean: 0.12 + 0.2 * dip,
        headY: side * 0.2,
        armR: 0.95,
        armL: 0.95,
        armROut: 0,
        armLOut: 0,
        elbowR: 0.55,
        elbowL: 0.55,
        legR: 0.25 * dip,
        legL: 0.25 * dip,
        kneeR: 0.5 * dip,
        kneeL: 0.5 * dip,
      };
    },
  },

  // Reading, with a regular head scratch.
  studies: {
    heading: -0.3,
    prop: 'book',
    pose(t) {
      const scratch = pulse(t, 5, 1.6);
      return {
        lean: 0.06 + Math.sin(t * 1.1) * 0.03,
        headX: 0.32 - 0.15 * scratch,
        headZ: 0.12 * scratch,
        armR: 0.75,
        armROut: -0.1,
        elbowR: 1.5,
        armL: 2.3 * scratch,
        armLOut: 0.08 + 0.35 * scratch,
        elbowL: 0.15 + (1.9 + Math.sin(t * 22) * 0.12) * scratch,
      };
    },
  },

  // Presenting the LED screen: pointing up at it, glancing back at the viewer.
  signage: {
    heading: 0.3,
    pose(t) {
      const look = wave(t, 1.6);
      return {
        lean: -0.05,
        twist: 0.25 * look,
        headY: 0.5 * look,
        headX: -0.3 * look,
        armL: 2.2 + Math.sin(t * 3.2) * 0.08,
        armLOut: 0.45,
        elbowL: 0.1,
        armR: 0.5,
        armROut: 0.35,
        elbowR: 1.1 + Math.sin(t * 3.2) * 0.2,
      };
    },
  },

  // Training the operators: tablet in one hand, explaining with the other.
  'warehouse-ui': {
    heading: 0,
    prop: 'tablet',
    pose(t) {
      const room = Math.sin(t * 0.8);
      return {
        twist: room * 0.3,
        headY: room * 0.25,
        headX: 0.05 + Math.sin(t * 5.2) * 0.06,
        armL: 0.7,
        armLOut: -0.05,
        elbowL: 1.35,
        armR: 0.75 + Math.sin(t * 2.6) * 0.25,
        armROut: 0.35 + Math.cos(t * 2.6) * 0.15,
        elbowR: 1.0 + Math.sin(t * 5.2) * 0.35,
      };
    },
  },

  integrations: {
    heading: -0.4,
    prop: 'laptop',
    pose: typing,
  },

  // Typing, plus a fist pump and a hop whenever a pipeline goes green.
  'azure-data': {
    heading: -0.4,
    prop: 'laptop',
    pose(t) {
      const win = pulse(t, 4.5, 1.1);
      const pose = typing(t);
      pose.armR += 2.3 * win;
      pose.armROut += 0.4 * win;
      pose.elbowR += (0.5 - pose.elbowR) * win;
      pose.headX -= 0.45 * win;
      pose.lift = 0.25 * win;
      return pose;
    },
  },

  // Waving at the viewer, with a little hop.
  epilogue: {
    heading: 0,
    pose(t) {
      const hop = pulse(t, 3.2, 0.7);
      return {
        headZ: Math.sin(t * 3.5) * 0.1,
        twist: Math.sin(t * 1.75) * 0.1,
        armR: 0.1,
        armROut: 2.45 + Math.sin(t * 7) * 0.3,
        elbowR: 0.25,
        armL: -0.1,
        armLOut: 0.2,
        elbowL: 0.3,
        legR: 0.2 * hop,
        legL: 0.2 * hop,
        kneeR: 0.5 * hop,
        kneeL: 0.5 * hop,
        lift: 0.3 * hop,
      };
    },
  },
};
