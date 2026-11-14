# CV-timeline: Project Plan (v0.8)

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
- **Scenes (M3):** one module per chapter in `src/scenes/`, all built from primitives with a shared kit (`src/scenery.js`). Each returns `{ object, ground, update(time, dt), mascot }`. No per-scene lights: glowing things use emissive materials, and text is drawn on canvas textures
- **Stage layout (M3):** every chapter is an octagonal floor (radius 6.2) on the road. Props stay off the road (z beyond about ±1.05) so he can always walk through, and tall things stay away from the card's side
- **Transitions (M3):** a scene's props pop up one by one as the chapter scrolls into view, and a "LEVEL n" gate stands between two chapters. With reduced motion the scenes are simply there, frozen
- **Running gag (M3):** the same cardboard parcel is somewhere in every chapter (sale sticker, goggles, hairnet, hi-vis, graduation cap, badge, barcode), turns into a data packet in the cloud chapters and wears shades at the party. Each scene exposes it as `mascot` for the M4 easter egg
- **Easter eggs (M4):** clicking the parcel makes it hop and spin, clicking the character makes him hop and wave, and both answer with a one-liner per chapter in an HTML speech bubble (`src/eggs.js`). The bubble is a live region, so screen readers hear it too
- **Parcel hunt (M4):** a "Parcels n/10" counter in the top right corner. Finding all ten throws confetti. The counter is also a button: pressed with the keyboard it finds the current chapter's parcel, clicked it makes the parcel hop, and when the parcel is outside a narrow screen it counts as found
- **Phone layout (M4):** on a portrait screen the picture is shifted up (camera view offset) so he stands above the card. Cards stay under 44% of the screen height, and a highlight list longer than 80 characters folds into a "What I did" toggle. On big screens the list is always open
- **Loading (M4):** the text renders first and the 3D scene (the Three.js chunk) is loaded after it with a dynamic import. If WebGL or the chunk fails, the page becomes a plain text CV with every list open
- **Scroll position (M4):** computed from the sections' offsets instead of the window height, so it also holds in text-only mode. No scroll library
- **Pixel ratio (M4):** capped at 1.5 on screens narrower than 640 px, 2 elsewhere
- **Deploy (M5):** `.github/workflows/deploy.yml` builds with Node 22 on every pull request to `main` (build check only) and publishes `dist/` to GitHub Pages on every push to `main`. `vite.config.js` sets `base` to `/AnimatedHistory/` for builds only, so the dev server stays at the root. The address is https://roobm.github.io/AnimatedHistory/
- **Sharing (M5):** title, description, theme colour, canonical URL and Open Graph tags in `index.html`, plus an inline SVG parcel favicon. No preview image yet

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
- [x] **M3 - Scenes:** one polished scene per chapter plus transitions
- [x] **M4 - Polish:** humor, easter eggs, mobile/performance pass, accessibility. The test on a real phone is still to do (see M4 notes)
- [ ] **M5 - Launch:** GitHub Pages deploy with GitHub Actions, final content review, share link. Tick this once the first deploy from `main` is live (see M5 notes)

## Suggested model use
Sonnet for M1 (skeleton). Fable for M2-M4 (camera, animation, scenes). Sonnet again for the M5 deploy if you like.

## M2 notes
- Done: the character walks between chapters as you scroll, then plays a job-specific work animation when a chapter is in view. Outfits follow the chapter table
- Work animations: lifting a box to the shelf, grinding with sparks, a sausage line that keeps speeding up, order picking, reading with a head scratch, presenting the screen, training with a tablet, typing, typing with a fist pump, waving
- Left for M3: the things he works on (shelves, metal plate, conveyor, LED screen and so on). For now he mimes against an empty stage
- Not yet tested on a real phone (M4)

## M3 notes
- Done: ten scenes. Supermarket aisle, grinding workshop, sausage line, picking warehouse, lecture room with a pretzel, stadium LED screen, automated stacker crane with a live control screen, Dynamics-to-Azure plumbing with a Bicep scroll, legacy mainframe migrating to a medallion data platform with a Blob to OpenAI to Copilot line and a "LEVEL UP!", and a confetti party with the two certifications
- Checked in headless Chrome at 1280x800: all ten chapters, two transitions and reduced motion, with no console errors
- Left for M4: on a phone the card covers the lower half, so the character's legs and the floor props are hidden. The tall IT-era cards clip their tag rows. The tablet shows its back to the camera. Clicking the parcel does nothing yet
- Not yet tested on a real phone (M4)

## M4 notes
- Done: click easter eggs with speech bubbles, the parcel hunt with a confetti finale, a progress bar, a "Scroll to walk" hint, a shade behind the name, the tablet now shows its screen, phone framing and folding cards, a narrower card for a phone on its side, 24 px nav targets, visible keyboard focus, a `<noscript>` message and a tidier text-only mode
- Checked in headless Chrome, with no console errors: desktop 1280x800, phone portrait 390x844, phone landscape 844x390, reduced motion (bubbles only, nothing moves) and WebGL switched off (text-only page, all lists open, no hunt button). Clicks on the parcel and the character, the hover cursor, the keyboard path of the counter and the all-found party were exercised
- Performance sample: 86 draw calls and about 3 200 triangles in the busiest chapter. The 3D chunk is 590 kB (153 kB gzipped) and loads after the text
- Not checked: a real phone (touch, frame rate, the browser's collapsing address bar), a screen reader, and browsers other than Chrome. Do this before the M5 launch with `npm run dev` and the Network URL
- Known limits: on a portrait phone only the middle of a scene fits, so most parcels are out of view and are found with the counter button instead of a tap. In the studies chapter the "?" thought briefly overlaps the blackboard text

## M5 notes
- Done in code: the Pages workflow, the base path, share meta tags and a favicon. Content review: `src/cv-data.json` has no employer names, phone number or email, and years appear only on the IT-era chapters
- Checked: `npm run build` passes. The build served from a plain static server under `/AnimatedHistory/` loads its script, stylesheet and lazy 3D chunk and renders the scene (the same layout GitHub Pages uses). The workflow itself has not run yet, because that needs GitHub
- One manual step for Roope: in the repository on GitHub, go to Settings > Pages and set Source to "GitHub Actions". Without it the deploy job fails. After the merge, check the Actions tab and open the address above
- Not checked: the live site, and `vite preview` (it answered 404 to the browser's script request under the subpath, while a static server and curl worked, so this looks like a preview quirk and not a build problem)
- To do after launch: a preview image for link sharing, and a real-phone test (see M4 notes)

## Open questions
- Should the parcels move closer to the middle on portrait phones, so they can be tapped instead of found with the counter?
- Custom domain for GitHub Pages? The default address is used for now
- More jokes? The one-liners live in `src/eggs.js` and are easy to swap
- Whether to include the forest and boat building as a prologue or hidden easter egg
- Whether to add an email address on the page later
