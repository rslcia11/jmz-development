# 0002 — GSAP + Three.js: one scene that travels the whole page

- **Status**: accepted (owner, 2026-09-27)
- **Date**: 2026-09-27
- **Door type**: one-way (every scene and scroll choreography is written against these APIs)
- **Supersedes**: [0001](0001-motion-library.md)

## Context

The owner wants impact from the first second and asked explicitly for GSAP and
Three.js, with one condition: the whole site must "breathe the same air" — no
effect in one section that the others don't share.

The master plan asks for a signature graphic that "evolves according to
context" across hero, services, projects and transitions (§15), and 2–4 wow
moments (§33). Today only the hero has it (SVG); the rest of the page has
plain reveals. §39 does not approve Three.js by default unless it cannot be
done with SVG, adds identity, justifies its cost, works on mobile, has a
fallback and does not hurt performance.

Sizes (bundlephobia, 2026-09-27, whole package): three 0.186 ≈ 181 KB gzip,
gsap 3.15 ≈ 27 KB, animejs 4.5 ≈ 39 KB. GSAP and all its plugins are free for
commercial use (gsap.com/pricing).

## Decision

1. **One persistent WebGL scene** (Three.js) in a fixed canvas behind the
   content. The same modules, links and nodes as the hero graphic, in real 3D,
   change formation per section — one system, one visual language, one
   renderer.
2. **GSAP + ScrollTrigger drives the scene** (entrance, scroll states,
   pointer). HTML reveals stay in CSS + one IntersectionObserver: no library
   needed for them, and they share the same easing tokens.
3. **Anime.js is removed** — one animation library, not two.

## Rules: the system accompanies, it never covers

Owner requirement: the wow must not hide the content or the page's goal.
Evidence: NN/g (people scan for content; peripheral motion distracts;
scrolljacking disorients, worse on mobile), WCAG 2.2.2 (auto motion over 5s
beside content), WCAG 1.4.3 (contrast against the real background), web.dev
LCP (text is what's measured, not canvas).

1. **Never behind text.** The scene maps itself onto `[data-system-slot]`
   elements in the visual column; text always sits on a solid background.
2. **Moves between sections, rests while reading.** Entrances and
   transitions are the wow; afterwards the system is still and only answers
   the visitor (pointer, scroll).
3. **No scrolljacking.** The page scrolls at the visitor's speed; the scene
   follows the scroll, never the other way round. No pinning on mobile.
4. **The message first.** Copy and CTAs render immediately; three.js loads
   on idle into a slot the layout already reserved.

## §39 conditions, and how they are met

| Condition | How |
| --- | --- |
| Not reasonable in HTML/CSS/SVG | Depth, light and a system that morphs continuously across the page |
| Adds identity | It *is* the §15 signature, now spanning the whole site |
| Justifies the cost | One renderer for every section; three loaded after first paint, only the modules used |
| Works on mobile | Pixel ratio capped, lighter formation, same states |
| Has a fallback | No WebGL, `prefers-reduced-motion` or `Save-Data` → static SVG composition; content never depends on the canvas |
| Doesn't hurt performance | Text renders first; canvas is `aria-hidden`, `pointer-events: none`; render loop pauses when hidden or off-screen |

## Alternatives considered

| Option | Why not chosen |
| --- | --- |
| Keep Anime.js + SVG (0001) | Owner wants more impact; no real depth |
| GSAP only | Scroll storytelling yes, but no 3D; less entrance impact |
| Separate 3D scenes per section | Several WebGL contexts, heavier, and sections would not share one system |

## Consequences

- Content stays semantic HTML (SEO, accessibility); the scene is decoration
  with meaning, never information.
- `HeroSystem.astro` (SVG) becomes the static fallback and the hero slot.
  Layout data moved to `src/data/system.ts`, shared by SVG and 3D.
- Code lives in `src/scripts/system/`: `support` (device check, no three),
  `palette` (colors from CSS tokens), `build` (3D objects), `stage`
  (renderer, on-demand rendering, slot mapping), `hero` (choreography),
  `scene` (lazy entry). Each new section state is a new file next to `hero`.
- Rendering is on demand and stops when the slot is off screen: a still
  page costs no GPU work.
- Performance budget and device testing become mandatory in phases 12–14.
- Known risk to verify on real devices: the page scrolls on the compositor
  while the fixed canvas is redrawn on the main thread, so during fast touch
  flings the system may trail its slot by a frame. The slot sits in its own
  column with a grid gap, so a small lag cannot reach the text; if it shows,
  the fix is to move the canvas with the slot (sticky container) instead of
  redrawing its position.
