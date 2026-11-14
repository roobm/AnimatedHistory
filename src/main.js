import './style.css';
import cv from './cv-data.json';
import { buildChapters } from './chapters.js';
import { renderHero, renderChapters, renderNav } from './cards.js';
import { createEggs } from './eggs.js';

const chapters = buildChapters(cv);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

renderHero(cv);
const cards = renderChapters(chapters);
const sections = [...document.querySelectorAll('.chapter')];
const progress = document.getElementById('progress');

const setActive = renderNav(chapters, (i) => {
  window.scrollTo({ top: sections[i].offsetTop, behavior: reduceMotion ? 'auto' : 'smooth' });
});

// The chapter position (0 = first chapter, n-1 = epilogue) is how far the
// page has scrolled from one section's top to the next. With the 3D scene
// every section is one screen tall; in text-only mode they are as tall as
// their cards.
function chapterPosition() {
  const y = window.scrollY;
  const last = sections.length - 1;
  let i = 0;
  while (i < last && sections[i + 1].offsetTop <= y) i++;
  if (i === last) return last;
  const top = sections[i].offsetTop;
  return Math.max(0, i + (y - top) / (sections[i + 1].offsetTop - top));
}

let world = null;
let activeIndex = -1;
function onScroll() {
  const t = chapterPosition();
  world?.setPosition(t);
  progress.style.transform = `scaleX(${t / (chapters.length - 1)})`;
  document.body.classList.toggle('scrolled', window.scrollY > 40);
  const index = Math.round(t);
  if (index !== activeIndex) {
    activeIndex = index;
    setActive(index);
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

function textOnly(error) {
  // No WebGL: the CV text still works on its own.
  console.warn('3D scene unavailable, showing text only.', error);
  document.body.classList.add('no-webgl');
  cards.refold();
  onScroll();
}

// The 3D scene is the heavy part, so it loads after the text is on screen.
import('./world.js')
  .then(({ createWorld }) => {
    world = createWorld(document.getElementById('scene'), chapters, chapterPosition());
    createEggs(chapters, () => world);
  })
  .catch(textOnly);
