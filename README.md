# AnimatedHistory

**A CV you walk through.** A low-poly Roope strolls along a road through ten chapters of a career, from stocking supermarket shelves to Senior Software Developer on Azure. Scroll and he walks, scroll faster and he runs, stop and he gets to work.

**Live:** https://roobm.github.io/AnimatedHistory/

## The idea

You know those evolution videos where a single atom becomes a cell, then a fish, a mammal, and finally a human, all in one continuous journey? This is that, for a career. Same character, same road, a new form at every step: apron, goggles, hairnet, hi-vis vest, hoodie, headset, and finally a suit and shades at the party.

The chapters, in order:

1. Supermarket: shelf stocker
2. Metal industry: angle grinder (with sparks)
3. Sausage factory: summer packing job
4. Logistics: order picking and the odd forklift
5. Studies: IT degree and an exchange in Germany
6. Digital signage: stadium LED screens running React
7. Automated warehouse UI: the stacker crane is now the thing he builds
8. Cloud integrations: pipes between Dynamics and Azure
9. Azure and data platforms: a legacy system migrating to a data platform
10. Epilogue: certifications as trophies, and a confetti party

A cardboard parcel follows him through every chapter. It wears the sale sticker, the goggles, the hairnet, the barcode, and turns into a data packet in the cloud chapters. There are ten of them to find.

## Controls

| Input | What happens |
|---|---|
| Scroll | He walks through the chapters, and runs if you scroll fast |
| Left / Right arrows | Walk (hold Shift to run) |
| Up arrow or Space | Jump. Twice in a row: cartwheel |
| Click or tap him | Wave, then jump, then cartwheel |
| Click or tap the parcel | It hops and says something. Find all ten for confetti |
| Nav dots on the right | Jump to a chapter |

It also works on a phone, with reduced motion, and with no WebGL at all (you get the plain CV text). All the CV text is real HTML, so it reads fine without the 3D.

## Run it

```sh
npm install
npm run dev      # http://localhost:5173, also reachable from a phone on the same Wi-Fi
npm run build    # production build into dist/
```

You need Node 20.19 or newer.

## Make it your own

All the content lives in one file, `src/cv-data.json`. Edit the text there and the cards, the hero and the navigation follow. The scenes, outfits and animations are in `src/` (see `CLAUDE.md` for the code layout and `docs/PLAN.md` for the plan and every decision).

## How it was built

- **Vite + Three.js + plain JavaScript.** No framework, no animation library, no 3D models or textures. The character, props and scenes are all built from boxes, cylinders and spheres, and the text on the signs is drawn on canvases.
- **Poses are plain objects of joint angles**, blended in code. The walk cycle advances by distance travelled, so the feet match the ground and fast scrolling turns into running.
- **About 2,900 lines of JavaScript.** The 3D part is a separate chunk (about 150 kB gzipped) that loads after the text is on screen.
- **Hosted on GitHub Pages**, deployed by a GitHub Actions workflow on every push to `main`.

### How easy was it?

Easier than it sounds. It was built in conversation with [Claude Code](https://claude.com/claude-code), working from a plan document and a milestone checklist:

- **One Saturday, start to live site.** The first commit was at 12:06 and the live page was published at 22:19, with five milestones in between: skeleton, character, scenes, polish, launch. The jump, cartwheel and arrow-key controls came a few days later.
- **Nothing exotic to set up.** `npm install`, one Vite config line for the Pages path, and one workflow file. The only manual step on GitHub was switching the Pages source to "GitHub Actions".
- **A strict workflow kept it tidy.** Every feature got its own branch and a pull request, and the repository's `.claude/skills/` hold the two small recipes for starting and finishing a feature.
- **Checked in a real browser.** Each milestone was looked at in headless Chrome at desktop and phone size, with reduced motion, and with WebGL switched off.
