/*
  Entry of the lazily loaded 3D chunk (three.js + GSAP live here, not in the
  initial page JS). Mounted by SystemStage.astro only after supports3D().

  Every [data-system-slot] names the state it shows ("hero", "services",
  "understand", "work:<shape>", "contact"). One renderer draws them all; the
  stage hides whichever are off screen.
*/
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Object3D } from "three";
import {
  contactFormation,
  servicesFormation,
  understandFormation,
  workFormations,
  type WorkShape,
} from "../../data/formations";
import { buildSystem, SYSTEM_WORLD_WIDTH } from "./build";
import { playContact } from "./contact";
import { buildFormation } from "./formation";
import { playHero } from "./hero";
import { readPalette } from "./palette";
import { leanTowardPointer } from "./pointer";
import { playServices } from "./services";
import { createStage } from "./stage";
import { playUnderstand } from "./understand";
import { playWork } from "./work";

gsap.registerPlugin(ScrollTrigger);

export async function mountSystem(canvas: HTMLCanvasElement, slots: HTMLElement[]): Promise<void> {
  const root = document.documentElement;
  const palette = readPalette();

  // Labels are drawn into textures once: the mono font must be ready first.
  await document.fonts.load(`500 80px ${palette.fontMono}`).catch(() => undefined);

  const cleanups: (() => void)[] = [];
  let failed = false;
  const fallBack = () => {
    failed = true;
    root.classList.remove("system-live");
    root.classList.add("system-fallback");
    for (const cleanup of cleanups) cleanup();
  };

  const stage = createStage(canvas, fallBack);
  const { scene, invalidate } = stage;
  const pivots: Object3D[] = [];

  for (const slot of slots) {
    const [state, variant] = (slot.dataset.systemSlot ?? "").split(":");

    if (state === "hero") {
      // Slow load: the CSS failsafe already showed the finished SVG. Assembling
      // again from nothing would be a double take, so start assembled instead.
      const alreadyShown = getComputedStyle(slot).opacity !== "0";
      const system = buildSystem(scene, palette);
      stage.follow(slot, system.root, { width: SYSTEM_WORLD_WIDTH, height: SYSTEM_WORLD_WIDTH });
      pivots.push(system.pointer);
      cleanups.push(playHero(system, slot, invalidate, { assembled: alreadyShown }));
      continue;
    }

    const formation =
      state === "services"
        ? servicesFormation
        : state === "understand"
          ? understandFormation
          : state === "contact"
            ? contactFormation
            : state === "work"
              ? workFormations[variant as WorkShape]
              : undefined;
    if (!formation) continue;

    const system = buildFormation(scene, formation, palette);
    stage.follow(slot, system.root, system.frame);
    pivots.push(system.pointer);

    if (state === "services") cleanups.push(playServices(system, slot, palette, invalidate));
    if (state === "understand") cleanups.push(playUnderstand(system, slot, palette, invalidate));
    if (state === "contact") cleanups.push(playContact(system, slot, palette, invalidate));
    if (state === "work") cleanups.push(playWork(system, slot, invalidate));
  }

  cleanups.push(leanTowardPointer(pivots, invalidate), stage.dispose);

  // Web fonts reflow the copy, which moves every trigger below it.
  document.fonts.ready.then(() => ScrollTrigger.refresh());

  // The first frame shows the start states; only then hand over from the
  // SVGs, so the swap is never visible. Never after a fallback (context lost).
  requestAnimationFrame(() => {
    if (!failed) root.classList.add("system-live");
  });
}
