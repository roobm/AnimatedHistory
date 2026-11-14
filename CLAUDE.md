# AnimatedHistory

Roope's CV as a scroll-driven 3D web page: a low-poly character moves through career chapters. Vite + Three.js, hosted on GitHub Pages (set up in M5).

Read `docs/PLAN.md` first. It holds the goal, decisions, chapters and milestone checklist. Content lives in `src/cv-data.json` (draft: `docs/cv-data-draft.json`).

## Workflow rules
- Never commit directly to `main`. Every new feature, milestone step or fix starts on a new branch: use the `start-feature` skill.
- Finish a feature with the `finish-feature` skill (build check, plan update, push, PR).
- Branch names: `feature/<short-slug>`, `fix/<short-slug>`, `docs/<short-slug>`.
- Small, focused commits with imperative messages (e.g. "Add scroll controller").
- Keep `docs/PLAN.md` current: tick milestones, record new decisions, add open questions.

## Content rules
- No employer names, no phone number and no email on the page. LinkedIn and GitHub links are fine.
- Years are shown only for the IT-era chapters. The early jobs show only their order.
- Page text must stay readable without 3D (accessibility and SEO).

## Commands
- `npm install`: install dependencies
- `npm run dev`: dev server (also reachable from a phone on the same Wi-Fi via the Network URL)
- `npm run build`: production build into `dist/`

## Code layout
- `src/cv-data.json`: all CV content
- `src/chapters.js`: builds the chapter list (adds the epilogue)
- `src/cards.js`: HTML cards, hero and nav dots
- `src/world.js`: Three.js scene, one placeholder scene per chapter, camera follows scroll
- `src/main.js`: wires scroll position to the world and nav
