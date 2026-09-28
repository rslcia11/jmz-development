/*
  Entry of the lazily loaded 3D chunk (three.js + GSAP live here, not in the
  initial page JS). Mounted by SystemStage.astro only after supports3D().
*/
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { buildSystem, SYSTEM_WORLD_WIDTH } from "./build";
import { playHero } from "./hero";
import { readPalette } from "./palette";
import { leanTowardPointer } from "./pointer";
import { createStage } from "./stage";

gsap.registerPlugin(ScrollTrigger);

export async function mountSystem(canvas: HTMLCanvasElement, slot: Element): Promise<void> {
  const root = document.documentElement;
  const palette = readPalette();

  // Labels are drawn into textures once: the mono font must be ready first.
  await document.fonts.load(`500 56px ${palette.fontMono}`).catch(() => undefined);

  const cleanups: (() => void)[] = [];
  let failed = false;
  const fallBack = () => {
    failed = true;
    root.classList.remove("system-live");
    root.classList.add("system-fallback");
    for (const cleanup of cleanups) cleanup();
  };

  // Slow load: the CSS failsafe already showed the finished SVG. Assembling
  // again from nothing would be a double take, so start assembled instead.
  const alreadyShown = getComputedStyle(slot).opacity !== "0";

  const stage = createStage(canvas, fallBack);
  const system = buildSystem(stage.scene, palette);
  stage.follow(slot, system.root, SYSTEM_WORLD_WIDTH);

  cleanups.push(
    leanTowardPointer(system.pointer, stage.invalidate),
    playHero(system, slot, stage.invalidate, { assembled: alreadyShown }),
    stage.dispose,
  );

  // The first frame shows the start state; only then hand over from the SVG,
  // so the swap is never visible. Never after a fallback (e.g. context lost).
  requestAnimationFrame(() => {
    if (!failed) root.classList.add("system-live");
  });
}
