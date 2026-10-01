# JMZ Development & Solutions — website

Landing page for JMZ: custom software (management systems and ERP, AI, websites).
Built with [Astro](https://astro.build) as a static site; a single Three.js scene
driven by GSAP carries the JMZ "system" through every section.

## Commands

| Command | Action |
| --- | --- |
| `npm install` | Install dependencies (Node ≥ 22.12) |
| `npx astro dev --background` | Dev server at `localhost:4321` (`astro dev stop` / `status` / `logs`) |
| `npm run build` | Production build to `./dist/` |
| `npm run preview` | Preview the build |

## Where things live

- `src/components/` — one component per section, plus `SystemStage` (the 3D
  canvas), `SystemSlot` and `SystemFallback` (where the system appears, and its
  static SVG).
- `src/data/` — copy-free data: navigation, projects, the system layout
  (`system.ts`) and its per-section formations (`formations.ts`).
- `src/scripts/system/` — the 3D scene: stage, builders and one file per
  section state.
- `src/styles/` — design tokens and one stylesheet per section.
- `docs/` — [project status](docs/STATUS.md), [decisions (ADR)](docs/adr/),
  [copy rules](docs/copy.md), [SEO plan](docs/seo-plan.md).
