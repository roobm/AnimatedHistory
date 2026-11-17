// The easter eggs: click the parcel or the character and they answer in a
// speech bubble. Finding the parcel in every chapter throws a small party.

const PARCEL = {
  supermarket: '-30% and still nobody picks me.',
  metal: 'Safety first. I am 100% cardboard.',
  sausages: 'I am not a sausage. Please stop packing me.',
  logistics: 'Wheee! Best seat in the warehouse.',
  studies: 'I graduated too. Major: being a box.',
  signage: 'I only came for the half-time snacks.',
  'warehouse-ui': 'Bin C-04, please. I know the system.',
  integrations: "I've been serialised. It tickles.",
  'azure-data': 'Fully migrated. Zero bytes lost.',
  epilogue: 'We made it! Hire him, he delivers.',
};

const CHARACTER = {
  supermarket: "Shelves don't stock themselves.",
  metal: 'Sparks are a feature.',
  sausages: 'One summer. Many sausages.',
  logistics: 'Forklift licence: unlocked.',
  studies: 'Coffee in, code out.',
  signage: 'First real code in production!',
  'warehouse-ui': 'I used to drive these. Now I code them.',
  integrations: "It's all pipes, really.",
  'azure-data': 'Legacy out, platform in.',
  epilogue: 'Thanks for scrolling this far!',
};

const BUBBLE_SECONDS = 2.8;
const IGNORE = '.card, #nav, a, button, summary'; // clicks here are not for the scene
const DOUBLE_TAP_MS = 380;
const WALK_SPEED = 3.5; // world units per second, a brisk walk
const RUN_SPEED = 10; // with Shift: a run
const CHAPTER_UNITS = 14; // distance between two chapters, see SPACING in world.js
const EDGE = 16; // px: a parcel closer to the side of the window than this counts as out of view

// getWorld: returns the 3D world, or null while it is loading or unavailable.
export function createEggs(chapters, getWorld) {
  const bubble = document.getElementById('bubble');
  const hunt = document.getElementById('hunt');
  const found = new Set();
  let pokes = 0;
  let timer = 0;

  // Shows a line of text above a point of the window, or as a banner at
  // the top when no point is given.
  function say(text, at) {
    bubble.textContent = text;
    bubble.classList.toggle('banner', !at);
    if (at) {
      const half = bubble.offsetWidth / 2 + 8;
      const left = Math.min(Math.max(at.x, half), window.innerWidth - half);
      const reach = half - 26; // how far the tail can move from the middle
      bubble.style.left = `${left}px`;
      bubble.style.setProperty('--tail', `${Math.min(Math.max(at.x - left, -reach), reach)}px`);
      bubble.style.top = `${Math.max(at.y - 10, bubble.offsetHeight + 8)}px`;
    } else {
      bubble.style.left = '';
      bubble.style.top = '';
    }
    bubble.classList.add('shown');
    clearTimeout(timer);
    timer = setTimeout(hush, (at ? BUBBLE_SECONDS : BUBBLE_SECONDS * 2) * 1000);
  }

  function hush() {
    bubble.classList.remove('shown');
  }

  function count() {
    hunt.textContent = `Parcels ${found.size}/${chapters.length}`;
    hunt.setAttribute('aria-label', `Parcels found: ${found.size} of ${chapters.length}. Find the parcel in this chapter.`);
  }

  function findParcel(hit) {
    const { id } = chapters[hit.index];
    const first = !found.has(id);
    found.add(id);
    count();
    if (first && found.size === chapters.length) {
      getWorld()?.celebrate();
      say('All ten parcels found! You would make a great order picker.');
    } else {
      say(PARCEL[id], hit);
    }
  }

  function answer(hit) {
    if (hit.kind === 'parcel') {
      findParcel(hit);
    } else {
      pokes += 1;
      say(pokes % 3 === 0 ? 'Hey, that tickles!' : CHARACTER[chapters[hit.index].id], hit);
    }
  }

  document.addEventListener('click', (event) => {
    if (event.target.closest(IGNORE)) return;
    const hit = getWorld()?.tap(event.clientX, event.clientY);
    if (hit) answer(hit);
  });

  // Keyboard: Left and Right walk (hold Shift to run), Up or Space jumps and
  // twice in a row is a somersault. Walking is done by scrolling the page, so
  // it works like the wheel. These keys are left alone on anything that
  // already uses them (buttons, links, the folding lists, text fields), and
  // without the 3D scene they keep their normal job.
  const FIELDS = 'button, a, summary, input, textarea, select, [contenteditable]';
  const held = new Set();
  let lastHop = 0;
  let lastFrame = 0;
  let walking = 0;

  function hop() {
    const now = performance.now();
    getWorld()?.perform(now - lastHop < DOUBLE_TAP_MS ? 'flip' : 'jump');
    lastHop = now;
  }

  function walk(now) {
    const dir = (held.has('ArrowRight') ? 1 : 0) - (held.has('ArrowLeft') ? 1 : 0);
    const dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;
    if (!dir) {
      walking = 0;
      return;
    }
    // World units per second, turned into pixels: one chapter is a screen tall and 14 units wide.
    const units = held.has('Shift') ? RUN_SPEED : WALK_SPEED;
    window.scrollBy(0, (dir * units * window.innerHeight * dt) / CHAPTER_UNITS);
    walking = requestAnimationFrame(walk);
  }

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Shift') held.add('Shift');
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target.closest?.(FIELDS)) return;
    const jump = event.code === 'Space' || event.key === 'ArrowUp';
    const step = event.key === 'ArrowLeft' || event.key === 'ArrowRight';
    if (!jump && !step) return;
    if (jump && event.shiftKey) return; // Shift+Space still scrolls up
    if (!getWorld()) return; // text only: the keys keep scrolling
    event.preventDefault();
    if (jump) {
      if (!event.repeat) hop();
    } else {
      held.add(event.key);
      if (!walking) {
        lastFrame = performance.now();
        walking = requestAnimationFrame(walk);
      }
    }
  });

  window.addEventListener('keyup', (event) => held.delete(event.key));
  window.addEventListener('blur', () => held.clear());

  // The counter doubles as the way in without a pointer: pressing it with
  // the keyboard finds this chapter's parcel. A click only makes the parcel
  // hop, unless it is outside a narrow screen and cannot be clicked at all.
  hunt.addEventListener('click', (event) => {
    const hit = getWorld()?.nudge();
    if (!hit) return;
    const outside = hit.x < EDGE || hit.x > window.innerWidth - EDGE;
    if (event.detail === 0 || outside) findParcel(hit);
    else say('Psst, over here!', hit);
  });

  // A pointer cursor over the things that answer.
  let checking = false;
  window.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' || checking) return;
    checking = true;
    requestAnimationFrame(() => {
      checking = false;
      const over = !event.target.closest?.(IGNORE) && Boolean(getWorld()?.hover(event.clientX, event.clientY));
      document.body.classList.toggle('can-poke', over);
    });
  });

  window.addEventListener('scroll', () => {
    if (!bubble.classList.contains('banner')) hush();
  }, { passive: true });

  count();
  hunt.hidden = false;
}
