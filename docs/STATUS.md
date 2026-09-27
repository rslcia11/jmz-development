# Project Status — JMZ Development & Solutions website

_Last updated: 2026-09-25 — update at the close of any Level 2+ change._

## Where we are

Phases 1–2 of the master document (§71) are done: tokens, fonts, layout,
semantic landmarks, sticky navigation with scroll-spy and a native `<dialog>`
mobile menu. Phase 3 (Hero) is in progress: the SYSTEM / MODULE signature
graphic assembles with Anime.js and extends into the next section on scroll.
Sections for phases 4–10 exist as early drafts, built before the hero defined
the visual and motion language; they will be revisited once the hero is polished.

## Roadmap

| Phase | Status | Notes |
| --- | --- | --- |
| 1 — Foundation | ✅ done | Tokens, Geist, layout grid, `<main>`, skip link |
| 2 — Navigation | ✅ done | Sticky header, scroll-spy, `<dialog>` mobile menu, footer |
| 3 — Hero | 🔄 in progress | System graphic + Anime.js timeline ([ADR 0001](adr/0001-motion-library.md)) |
| 4 — Understand | ⏳ pending | Draft exists; must come before Build in the narrative (§16) |
| 5 — Services (Build) | ⏳ pending | Draft exists |
| 6 — Systems | ⏳ pending | Not started; second wow moment |
| 7 — Work | ⏳ pending | Placeholder projects only — needs real projects |
| 8 — Capability | ⏳ pending | Not started |
| 9 — About / Approach | ⏳ pending | Draft exists |
| 10 — Contact | ⏳ pending | CTA exists; form provider undecided |
| 11–14 — Polish, perf, a11y, QA | ⏳ pending | |

## Decisions (§82)

| Topic | Decision | Where |
| --- | --- | --- |
| Motion library | Anime.js v4 for scroll/wow motion; CSS for micro/UI motion | [ADR 0001](adr/0001-motion-library.md) |
| Hero graphic | Modules that assemble into a grid and connect; core module is the single accent; output line continues into the next section | `src/components/HeroSystem.astro` |
| Fonts | Geist + Geist Mono (self-hosted variable woff2) | `src/styles/tokens/typography.css` |
| Theme / accent | Dark base (`#0b0b0a`), single amber accent (`#d6a56b`) | `src/styles/tokens/design-tokens.css` |
| Copy language | Spanish (`lang="es"`), mono technical labels in English | — |
| Copy voice | Clear, objective, specific; commitments over claims; hero: "Construimos sistemas ERP, modelos de IA y sitios web. Pero antes, preguntamos para qué." | [docs/copy.md](copy.md) |
| Page structure | Keep the six current sections (owner decision 2026-09-25), no Systems/Capability sections for now | — |
| Work section | Description-only projects (no client names or metrics), data in `src/data/projects.ts`; no case-study links until pages exist | — |
| Contact | 4-field form shell (§52); mailto transport until a provider is chosen | `src/components/CTA.astro` |
| WebGL / Three.js | Not used (§39) | — |

## Blocked / pending explicit approval

- Confirm each draft project in `src/data/projects.ts` against the real project
  (one real detail each makes the copy stronger); visuals for Work.
- Confirm the process/commitment claims in Understand and About match how JMZ
  actually works.
- Real WhatsApp / LinkedIn; confirm `hello@jmzdevelopment.com` and the GitHub org.
- Contact channel/provider (WhatsApp, form service or booking) and analytics (§52, §56).

## Next steps (ordered)

1. Owner review of the new copy, then close Phase 3.
2. SEO baseline: canonical, Open Graph, sitemap, robots (§53).
3. Connect the contact channel.
4. Custom 404 (§66).

## Motion system

- Scroll reveal: add `data-reveal` to an element; tokens `--reveal-distance`
  and `--reveal-stagger` in `src/styles/motion.css`. Elements entering the
  viewport together cascade; never put it on an element with its own hover
  transitions (wrap it instead).
- Hero copy uses the same tokens via a CSS keyframe (no JS needed).
- Scroll/wow scenes use Anime.js ([ADR 0001](adr/0001-motion-library.md)).
