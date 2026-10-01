# 0003 — The system takes one formation per section

- **Status**: proposed (awaiting owner review, 2026-10-01)
- **Date**: 2026-10-01
- **Door type**: two-way (formations are data; the states are small files)
- **Builds on**: [0002](0002-gsap-three-single-scene.md)

## Context

ADR 0002 set one 3D system for the whole page and left the sections after the
hero pending: Understand (disorder → order), Services (the JMZ map, wow 2),
Work (a shape per project, wow 3) and Contact (convergence). Its first rule is
that the system **never sits behind text**.

A single object flying from slot to slot would break that rule: the hero's
visual column is on the right, Build's and Understand's on the left, so every
hand-over would cross the copy. The page also needs the system in up to seven
places at once in Work.

## Decision

1. **One renderer, one canvas, one visual language; one formation per
   slot.** Each `[data-system-slot="<state>"]` gets the system rebuilt in that
   section's shape, from the same pieces (surface bodies, edges, mono labels,
   links, nodes, the brand core). The stage fits each one onto its slot and
   hides whichever are off screen, so a frame draws only what can be seen.
2. **Formations are data** (`src/data/formations.ts`). The same description
   builds the 3D scene (`formation.ts`) and the static SVG fallback
   (`SystemFallback.astro`), projected with the pose the scene rests in
   (`projection.ts`). The slot's aspect ratio comes from that projection, so
   swapping SVG → 3D never shifts the layout.
3. **States**, each a file next to `hero.ts`:

   | Slot | Formation | What moves it |
   | --- | --- | --- |
   | `services` | Seen from above, one flat plan; it tilts and opens into three layers — operations, AI & data, web — joined by one spine. The layer of the capability being read lifts and lights. | Scroll (scrub) and which capability is read |
   | `understand` | The six modules plus twelve fragments people work with today (spreadsheets, whatsapp, paper…), scattered and tangled. 01 gather · 02 each fragment lands on the module that takes over its job · 03 they sink in, the real links draw, the core lights. | Scroll through the three steps |
   | `work:<shape>` | Seven shapes: ERP with the companies behind it, catalogue + panel, pins on a map, prices and the trusted band, a voice, a camera counting people, ports around a host. | Assembles once on arrival; pointer (or the card centred on touch) shows what the project does |
   | `contact` | The modules leave their hero places and close into one block, output pointing at the form. Each field filled wakes its module; a complete form lights the core; sending runs a pulse down the output. | Scroll, then the visitor's typing |

4. **Desktop: intros are sticky** beside their lists (Build, Understand) when
   the screen is tall enough (`min-height: 46rem`), so the system answers each
   item as it's read. Scroll offsets come from the section and the list,
   never from the sticky slot.

## Rules kept from 0002

- Never behind text: every slot is in a visual column or above a card's text.
- Rests while reading: nothing moves on its own; motion is scroll, pointer or
  typing.
- No scrolljacking, no pinning: sticky is plain CSS and the page scrolls at
  the visitor's speed.
- Fallback: no WebGL, reduced motion or Save-Data → every slot shows its SVG.

## Cost

Measured on the production build (2026-10-01): the lazy scene chunk is
672 KB minified / **185 KB gzip**, of which all four new states add ~5 KB;
the rest is three.js's WebGL renderer (tree-shaking already drops what isn't
imported). The HTML grows to 15 KB gzip with the inline SVG fallbacks. The
initial page JS is still the 1 KB loader.

## Consequences

- A new shape is a new entry in `formations.ts` (and a choreography file only
  if it needs one); the fallback comes for free.
- Up to eight systems can be visible at once in Work on wide screens; each is
  a few dozen meshes, but real-device testing (phase 12–14) must cover it.
- Work cards now carry a picture: the project's shape, drawn — never a fake
  screenshot.
