# Project Status — JMZ Development & Solutions website

_Last updated: 2026-09-27 — update at the close of any Level 2+ change._

## Where we are

Phases 1–3 of the master document (§71) are done in structure and copy. The
page had only one wow moment (the hero), so the design phases 4–10 are being
rebuilt around **one 3D system that travels the whole page**
([ADR 0002](adr/0002-gsap-three-single-scene.md)): Three.js + GSAP, the
system beside the content (never behind text), moving between sections and
resting while people read. Phase 1 of that work (3D base + hero) is built and
awaiting the owner's visual review. SEO is planned ([seo-plan.md](seo-plan.md))
and parked until there is a domain.

## Roadmap

| Phase | Status | Notes |
| --- | --- | --- |
| 1 — Foundation | ✅ done | Tokens, Geist, layout grid, `<main>`, skip link |
| 2 — Navigation | ✅ done | Sticky header, scroll-spy, `<dialog>` mobile menu, footer |
| 3 — Hero | 🔄 review | 3D system assembles on entry; SVG fallback |
| 4 — Understand | ⏳ next | System: disorder → order |
| 5–6 — Services + Systems | ⏳ pending | System opens into the JMZ map (wow 2), inside Services |
| 7 — Work (+ Capability) | ⏳ pending | Real projects done; system changes shape per project (wow 3) |
| 9 — About / Approach | ✅ copy | System rests |
| 10 — Contact | 🔄 partial | Form shell; system converges by the form; channel deferred |
| 11–14 — Polish, perf, a11y, QA | ⏳ pending | Real-device testing mandatory (ADR 0002) |
| SEO (§53) | 📋 planned | Implement when the domain exists |
| 404 (§66) | ⏳ pending | |

## Decisions (§82)

| Topic | Decision | Where |
| --- | --- | --- |
| Motion | One persistent Three.js scene driven by GSAP + ScrollTrigger; reveals in CSS; Anime.js removed | [ADR 0002](adr/0002-gsap-three-single-scene.md) |
| System rules | Never behind text; moves between sections, rests while reading; no scrolljacking; message first | ADR 0002 |
| Signature system data | One layout for SVG fallback and 3D | `src/data/system.ts` |
| Fonts | Geist + Geist Mono (self-hosted variable woff2) | `src/styles/tokens/typography.css` |
| Theme / accent | Dark base (`#0b0b0a`), single amber accent (`#d6a56b`); the 3D reads these tokens | `src/styles/tokens/design-tokens.css` |
| Copy | Hero "Convertimos tu idea en software."; global audience; every headline web-verified as original | [docs/copy.md](copy.md) |
| Page structure | Six sections (owner); Systems and Capability live inside Services and Work | — |
| Work section | Real projects only, ERPs without client names | `src/data/projects.ts` |
| Contact | 4-field form shell (§52); mailto until a provider is chosen | `src/components/CTA.astro` |
| SEO | WebSite + Organization JSON-LD, canonical, OG/X, sitemap, robots | [seo-plan.md](seo-plan.md) |

## Blocked / pending owner

- Domain (blocks SEO implementation and deploy).
- "ERP multiempresa" wording — confirm.
- Real WhatsApp / LinkedIn; contact channel and analytics (§52, §56) — deferred.

## Next steps

1. Owner review of the 3D hero.
2. Understand: disorder → order.
3. Services + Systems map.
4. Work: per-project shapes.
5. Contact: convergence.
6. Phases 11–14, 404, SEO, deploy.

## Motion system

- 3D: `src/scripts/system/` — `support` (device check), `palette` (tokens),
  `build` (objects), `stage` (renderer, on-demand render, slot mapping),
  `pointer` (system-wide lean), `hero` (section state), `scene` (lazy entry).
  A new section state is a new file next to `hero`, placed via a
  `[data-system-slot]` element in that section's visual column.
- Scroll reveal: `data-reveal` + tokens in `src/styles/motion.css`; never on
  an element with its own hover transitions (wrap it instead).
- Hero copy entrance: CSS keyframes, same tokens, no JS.
