// Builds the HTML side of the page. It is real text, so the CV stays
// readable (and indexable) even when WebGL is unavailable.

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderHero(cv) {
  document.getElementById('name').textContent = cv.name;
  document.getElementById('title').textContent = cv.title;
  document.getElementById('tagline').textContent = cv.tagline;
}

export function renderChapters(chapters) {
  const main = document.getElementById('chapters');
  chapters.forEach((chapter, i) => {
    const section = el('section', 'chapter');
    section.id = chapter.id;
    section.dataset.index = String(i);

    const card = el('article', 'card');
    card.append(el('p', 'step', `${String(i + 1).padStart(2, '0')} / ${String(chapters.length).padStart(2, '0')}`));
    card.append(el('h2', null, chapter.title));
    if (chapter.years) card.append(el('p', 'years', chapter.years));
    if (chapter.role) card.append(el('p', 'role', chapter.role));

    if (chapter.highlights?.length) {
      const list = el('ul', 'highlights');
      chapter.highlights.forEach((h) => list.append(el('li', null, h)));
      card.append(list);
    }

    if (chapter.tech?.length) {
      const chips = el('ul', 'chips');
      chapter.tech.forEach((t) => chips.append(el('li', null, t)));
      card.append(chips);
    }

    if (chapter.links) {
      const links = el('p', 'links');
      for (const [label, href] of Object.entries(chapter.links)) {
        const a = el('a', null, label);
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        links.append(a);
      }
      card.append(links);
    }

    section.append(card);
    main.append(section);
  });
}

export function renderNav(chapters, onSelect) {
  const nav = document.getElementById('nav');
  const buttons = chapters.map((chapter, i) => {
    const button = el('button');
    button.type = 'button';
    button.title = chapter.title;
    button.setAttribute('aria-label', `Go to ${chapter.title}`);
    button.addEventListener('click', () => onSelect(i));
    nav.append(button);
    return button;
  });

  return function setActive(index) {
    buttons.forEach((b, i) => {
      if (i === index) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });
  };
}
