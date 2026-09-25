# 0001 — Anime.js v4 as the motion library

- **Status**: accepted
- **Date**: 2026-09-25
- **Door type**: one-way (every choreographed sequence will be written against its API)

## Context

The master document asks for premium, purposeful motion (§33) with 2–4 "wow"
moments: hero system construction, systems visualization, project
transformation and the final CTA. It also forbids installing a library by
default (§33, §45, §79) and lists the scroll/motion library as an open
decision to document before freezing (§82).

The visual signature (§15, §40) is SVG-based: modules, lines and connections
that assemble into a system. The core needs are therefore timelines,
staggering, SVG line drawing, text splitting and scroll-synced playback.
Pinned scroll scenes can be solved with `position: sticky` in CSS.

## Decision

Use Anime.js v4 for level 3–4 motion (scroll-linked scenes and wow moments),
importing only the modules each script needs; levels 1–2 (micro and UI
motion) stay in CSS and native browser APIs.

## Alternatives considered

| Option | Pros | Cons | Why not chosen |
|--------|------|------|----------------|
| Anime.js v4 | Modular ESM imports, tree-shakeable; timelines, `stagger`, `svg.createDrawable`, `splitText`, `onScroll` sync in one package; MIT | No built-in pinning; smaller community than GSAP | — chosen |
| GSAP + ScrollTrigger | Industry standard; most robust pin/scrub; all plugins free | Heavier bundle; its main advantage (pinning) is covered by `position: sticky` | Cost not justified for this scope (§33) |
| Native (CSS scroll-driven animations + WAAPI) | Zero dependencies | Complex multi-step choreography gets hard to maintain; uneven cross-browser support for scroll timelines | Maintainability of the wow moments |

## Consequences

- Motion scripts import from `animejs` and ship only the parts they use.
- Every animated component must render its final state in HTML/CSS and treat
  JavaScript as enhancement: no-JS and `prefers-reduced-motion: reduce` users
  see the finished composition, never hidden content.
- Pinning is done with CSS `position: sticky` plus `onScroll` sync, not a
  library pin.
- Revisit only if a scene needs capabilities Anime.js lacks (e.g. complex
  pin spacing); switching later means rewriting the scene scripts.
