# CV-timeline: Project Plan (v0.5)

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
- **One character, one road (M2):** a single jointed character built from Three.js primitives walks along a road through all chapters, instead of one figure per chapter. No glTF or Mixamo for now
- **Animation (M2):** poses are plain objects of joint angles, blended in code (`src/animations.js`). The walk cycle advances by distance travelled, so fast scrolling makes him run and scrolling back makes him turn around. No animation library
- **Outfit change (M2):** the outfit swaps halfway between two chapters with a quick spin and a squash-and-stretch pop
- **Reduced motion (M2):** the character stands in a frozen work pose, with no walking, spinning or sparks

## Chapters
| # | Chapter | Years | Outfit | Scene idea |
|---|---------|-------|--------|-----------|
| 0 | Supermarket: stocking shelves | hidden | Work apron / store vest | Shelves, boxes of products, price tags |
| 1 | Metal industry: angle grinder | hidden | Goggles, ear protection, gloves, work apron | Cleaning big raw metal plates left from cutting, with a sparks particle effect |
| 2 | Sausage factory: summer packing job | hidden | Hairnet, white coat, gloves | Conveyor line of sausages being packed into trays |
| 3 | Logistics operator | hidden | Hi-vis vest, safety shoes | Sometimes driving a forklift, but mostly order picking: splitting a box of one product into each customer's order |
| 4 | Studies: IT degree + exchange in Germany | 2015-2019 (exchange Sep 2017-Feb 2018) | Hoodie, backpack | Graduation cap, German pretzel easter egg |
| 5 | Digital signage trainee + thesis | Mar-Aug 2018 | Hoodie, ID badge | Stadium LED screens running React |
| 6 | ICT designer: automated warehouse UI | Mar 2019-Aug 2020 | Shirt and hi-vis vest on-site | Callback to logistics: the warehouse is now automated, and Roope trains the operators |
| 7 | Integration developer | Oct 2020-Jan 2024 | Casual shirt, laptop | Dynamics 365 and Azure blocks connected by pipes, Bicep scroll |
| 8 | Software Developer to Senior Software Developer | Jan 2024-Present (Senior since Sep 2026) | Hoodie, headset | Data platform replacing a legacy system, serverless content pipeline (Blob to OpenAI to Copilot), level-up animation |
| 9 | Epilogue | now | Best outfit | AZ-204 and AZ-400 badges as trophies, skills, links |

Running gag: the same box or pallet travels through the whole journey (shelf, sausage line, order picking, warehouse system) and turns into a data packet in the Azure chapters.

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
- [x] **M1 - Skeleton:** Vite project running locally, scroll structure, one placeholder scene per chapter, `cv-data.json` loaded. Done when scrolling moves through all ten placeholder chapters in the local dev server
- [x] **M2 - Character:** low-poly character with idle/work animations and per-chapter outfits
- [ ] **M3 - Scenes:** one polished scene per chapter plus transitions
- [ ] **M4 - Polish:** humor, easter eggs, mobile/performance pass (test on a real phone via the local network), accessibility
- [ ] **M5 - Launch:** GitHub Pages deploy with GitHub Actions, final content review, share link

## Suggested model use
Sonnet for M1 (skeleton). Fable for M2-M4 (camera, animation, scenes). Sonnet again for the M5 deploy if you like.

## M2 notes
- Done: the character walks between chapters as you scroll, then plays a job-specific work animation when a chapter is in view. Outfits follow the chapter table
- Work animations: lifting a box to the shelf, grinding with sparks, a sausage line that keeps speeding up, order picking, reading with a head scratch, presenting the screen, training with a tablet, typing, typing with a fist pump, waving
- Left for M3: the things he works on (shelves, metal plate, conveyor, LED screen and so on). For now he mimes against an empty stage
- Not yet tested on a real phone (M4)

## Open questions
- Custom domain for GitHub Pages?
- Specific jokes and running gags (later)
- Whether to include the forest and boat building as a prologue or hidden easter egg
- Whether to add an email address on the page later
