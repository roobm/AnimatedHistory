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
Add the real commands here when the Vite project exists (M1): `npm install`, `npm run dev`, `npm run build`.
