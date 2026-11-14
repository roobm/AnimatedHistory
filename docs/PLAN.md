# CV-timeline: Project Plan (v0.4)

Living plan. Update the milestone checklist and "Decisions" whenever a feature lands (the `finish-feature` skill does this).

## Goal
An online CV as a scroll-driven 3D journey. A low-poly character playing "Roope" moves through career chapters, from the shop floor to Senior Software Developer on Azure. It is very playful and funny, but still professional enough to share with recruiters and clients. Hosted on GitHub Pages.

## Decisions
- **Character:** stylized low-poly man with brown hair and brown eyes, dressed for each chapter. Props and scene change per chapter
- **Navigation:** scroll-driven. Scrolling moves through time and drives the animations
- **Tech:** Three.js + plain JS + Vite, static build
- **Hosting:** GitHub Pages via GitHub Actions, set up at the end (M5). Until then the page runs locally
- **Language:** English
- **Tone:** very playful (jokes, easter eggs, character reactions), still shareable with recruiters. Specific gags come later
- **Detail level:** a mix of highlights, skills/tech stack and certifications per chapter
- **Title:** "Senior Software Developer" (as in the CV)
- **Privacy:** no employer names on the page (use generic labels). No phone number. No email for now. LinkedIn and GitHub links are fine
- **Years:** shown only for the IT-era chapters. The earlier jobs are shown only in order

## Chapters
| # | Chapter | Years | Outfit | Scene idea |
|---|---------|-------|--------|-----------|
| 0 | Supermarket: stocking shelves | hidden | Work apron / store vest | Shelves, boxes of products, price tags |
| 1 | Metal industry: angle grinder | hidden | Goggles, ear protection, gloves, work apron | Cleaning big raw metal plates left from cutting, with a sparks particle effect |
| 2 | Logistics operator | hidden | Hi-vis vest, safety shoes | Sometimes driving a forklift, but mostly order picking: splitting a box of one product into each customer's order |
| 3 | Studies: IT degree + exchange in Germany | 2015-2019 (exchange Sep 2017-Feb 2018) | Hoodie, backpack | Graduation cap, German pretzel easter egg |
| 4 | Digital signage trainee + thesis | Mar-Aug 2018 | Hoodie, ID badge | Stadium LED screens running React |
| 5 | ICT designer: automated warehouse UI | Mar 2019-Aug 2020 | Shirt and hi-vis vest on-site | Callback to logistics: the warehouse is now automated, and Roope trains the operators |
| 6 | Integration developer | Oct 2020-Jan 2024 | Casual shirt, laptop | Dynamics 365 and Azure blocks connected by pipes, Bicep scroll |
| 7 | Software Developer to Senior Software Developer | Jan 2024-Present (Senior since Sep 2026) | Hoodie, headset | Data platform replacing a legacy system, serverless content pipeline (Blob to OpenAI to Copilot), level-up animation |
| 8 | Epilogue | now | Best outfit | AZ-204 and AZ-400 badges as trophies, skills, links |

Running gag: the same box or pallet travels through the whole journey (shelf, order picking, warehouse system) and turns into a data packet in the Azure chapters.

## Page structure
- Fixed full-screen canvas (3D scene) with HTML overlay text cards per chapter
- Scroll progress drives the camera path, scene transitions and character animation
- Progress bar / mini timeline
- Skill/tech chips appear on each chapter card
- Easter eggs: click the character, hidden objects, reactions
- Mobile-friendly: simplified scenes, lower pixel ratio, reduced-motion fallback
- Text readable without 3D (accessibility and SEO)

## Tech plan
- Vite + Three.js (ES modules), GSAP ScrollTrigger or a custom scroll controller
- Models: first from Three.js primitives (low-poly), later optionally free glTF/GLB or Mixamo animations
- Content in `src/cv-data.json` (draft in `docs/cv-data-draft.json`), so the CV can be edited without touching 3D code
- Deploy (M5): GitHub Actions builds `dist/` and publishes to GitHub Pages. Set the Vite `base` path to `/AnimatedHistory/` at that point
- Performance: small bundle, compressed assets, lazy-loaded scenes

## Milestones
- [x] **M0 - Content:** CV and early-job details captured in `docs/cv-data-draft.json`
- [ ] **M1 - Skeleton:** Vite project running locally, scroll structure, one placeholder scene per chapter, `cv-data.json` loaded. Done when scrolling moves through all nine placeholder chapters in the local dev server
- [ ] **M2 - Character:** low-poly character with idle/work animations and per-chapter outfits
- [ ] **M3 - Scenes:** one polished scene per chapter plus transitions
- [ ] **M4 - Polish:** humor, easter eggs, mobile/performance pass (test on a real phone via the local network), accessibility
- [ ] **M5 - Launch:** GitHub Pages deploy with GitHub Actions, final content review, share link

## Suggested model use
Sonnet for M1 (skeleton). Fable for M2-M4 (camera, animation, scenes). Sonnet again for the M5 deploy if you like.

## Open questions
- Custom domain for GitHub Pages?
- Specific jokes and running gags (later)
- Whether to include the forest and boat building as a prologue or hidden easter egg
- Whether to add an email address on the page later
