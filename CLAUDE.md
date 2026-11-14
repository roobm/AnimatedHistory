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
- `npm run build`: production build into `dist/` (base path `/AnimatedHistory/`). Pushes to `main` deploy it to GitHub Pages through `.github/workflows/deploy.yml`

## Code layout
- `src/cv-data.json`: all CV content
- `src/chapters.js`: builds the chapter list (adds the epilogue)
- `src/cards.js`: HTML cards (long highlight lists fold on small screens), hero and nav dots
- `src/world.js`: Three.js renderer, the road, one floor per chapter, level gates, prop pop-up, camera follows scroll, click picking of the parcel and the character, confetti
- `src/scenes/`: one scene per chapter (`index.js` maps chapter ids to builders). A builder returns `{ object, ground, update?(time, dt), mascot? }`. The world animates the scale of `object`'s direct children, so scenes only animate nested objects
- `src/scenery.js`: props shared by scenes: the parcel mascot, data packet, racks, conveyor, forklift, pipes, signposts, bystanders
- `src/character.js`: the jointed character: rig, outfits, hand props, sparks, walk/work state
- `src/animations.js`: poses (joint angles), walk cycle, one work animation per chapter
- `src/lowpoly.js`: flat and glowing materials, box/cylinder/ball helpers, canvas panels and text labels
- `src/eggs.js`: easter eggs: speech bubbles with the one-liners, the parcel hunt counter
- `src/main.js`: wires scroll position to the world, nav and progress bar. Loads the world lazily and falls back to a text-only page
