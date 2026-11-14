import './style.css';
import cv from './cv-data.json';
import { buildChapters } from './chapters.js';
import { renderHero, renderChapters, renderNav } from './cards.js';
import { createWorld } from './world.js';

const chapters = buildChapters(cv);

renderHero(cv);
renderChapters(chapters);
const firstSection = document.querySelector('.chapter');
const sectionHeight = () => firstSection.offsetHeight;

const setActive = renderNav(chapters, (i) => {
  window.scrollTo({ top: i * sectionHeight(), behavior: 'smooth' });
});

// Every chapter section is one screen tall, so scrollY / section height is the
// chapter position directly (0 = first chapter, n-1 = epilogue).
function chapterPosition() {
  const max = chapters.length - 1;
  return Math.min(Math.max(window.scrollY / sectionHeight(), 0), max);
}

let world = null;
try {
  world = createWorld(document.getElementById('scene'), chapters);
} catch (error) {
  // No WebGL: the CV text still works on its own.
  console.warn('3D scene unavailable, showing text only.', error);
  document.body.classList.add('no-webgl');
}

let activeIndex = -1;
function onScroll() {
  const t = chapterPosition();
  world?.setPosition(t);
  const index = Math.round(t);
  if (index !== activeIndex) {
    activeIndex = index;
    setActive(index);
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();
