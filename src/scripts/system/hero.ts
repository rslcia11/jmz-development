/*
  Hero state of the system (master plan §19–20, ADR 0002).

  Entrance, ~2.6s: the blueprint appears, scattered modules assemble in
  depth, connections draw, nodes light up and the core's accent is the
  payoff. Then the system rests — motion only answers the visitor (pointer,
  scroll), so nothing moves beside the copy on its own (WCAG 2.2.2).
*/
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MathUtils, type Material } from "three";
import type { System3D } from "./build";

/** Resting 3/4 view: enough angle to read as 3D, flat enough to read as a diagram. */
const REST = { x: 0.14, y: -0.26 };
const HIDDEN = 0.001;

interface HeroOptions {
  /** Skip the entrance and start at rest (the fallback SVG was already seen). */
  assembled?: boolean;
}

/** Plays the hero state; returns a cleanup that stops every trigger it created. */
export function playHero(
  system: System3D,
  slot: Element,
  invalidate: () => void,
  { assembled = false }: HeroOptions = {},
): () => void {
  const { pose, scroll, guides, links, nodes, modules, accent, coreLight } = system;
  const section = slot.closest("section");

  // Start state: everything invisible, modules at their designed offsets.
  pose.rotation.set(0.5, -0.7, 0);
  (guides.material as Material).opacity = 0;
  for (const object of [...links, ...nodes, accent]) object.scale.setScalar(HIDDEN);
  coreLight.intensity = 0;
  for (const { group, home, materials, data } of modules) {
    const [x, y, z, rotate] = data.from;
    const angle = MathUtils.degToRad(rotate);
    group.position.set(home.x + x / 100, home.y - y / 100, z / 100);
    group.rotation.set(angle * 0.4, -angle * 0.6, -angle);
    group.scale.setScalar(0.92);
    for (const material of materials) material.opacity = 0;
  }

  const entrance = gsap.timeline({
    paused: true,
    defaults: { ease: "expo.out", duration: 1.3 },
    onUpdate: invalidate,
    // Opaque again once assembled: no transparency sorting on a still scene.
    onComplete: () => {
      for (const { materials } of modules) {
        for (const material of materials.slice(0, 2)) material.transparent = false;
      }
    },
  });

  entrance
    .to(guides.material, { opacity: 1, duration: 1, ease: "power2.inOut" }, 0)
    .to(pose.rotation, { x: REST.x, y: REST.y, duration: 2.4, ease: "power3.out" }, 0);

  modules.forEach(({ group, home, materials }, index) => {
    const at = 0.3 + index * 0.08;
    entrance
      .to(group.position, { x: home.x, y: home.y, z: 0 }, at)
      .to(group.rotation, { x: 0, y: 0, z: 0 }, at)
      .to(group.scale, { x: 1, y: 1, z: 1 }, at)
      .to(materials, { opacity: 1, duration: 0.8, ease: "power2.out" }, at);
  });

  entrance
    .to(
      links.map(({ scale }) => scale),
      { x: 1, y: 1, z: 1, duration: 0.6, ease: "power2.inOut", stagger: 0.05 },
      1,
    )
    .to(
      nodes.map(({ scale }) => scale),
      { x: 1, y: 1, z: 1, duration: 0.4, ease: "back.out(3)", stagger: 0.04 },
      1.3,
    )
    .to(accent.scale, { x: 1, y: 1, z: 1, duration: 0.8 }, 1.6)
    .to(coreLight, { intensity: 2.5, duration: 1.2, ease: "power2.out" }, 1.6);

  // On phones the slot sits below the copy: assemble when it's actually seen.
  if (assembled) entrance.progress(1);
  const start = ScrollTrigger.create({
    trigger: slot,
    start: "top 75%",
    once: true,
    onEnter: () => entrance.play(),
  });

  // Leaving the hero, the system tips back as if handing over to what's next.
  const handOver = section
    ? gsap.to(scroll.rotation, {
        x: 0.35,
        ease: "none",
        onUpdate: invalidate,
        scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 0.8 },
      })
    : null;

  return () => {
    start.kill();
    handOver?.scrollTrigger?.kill();
    handOver?.kill();
    entrance.kill();
  };
}
