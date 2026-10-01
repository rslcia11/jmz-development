/*
  Work state (03): the system takes the shape of each project.

  Every project card carries the system rebuilt as what that project does —
  an ERP for several companies, a catalogue and its panel, pins on a map,
  prices and the band the model trusts, a voice, a camera counting people,
  ports around a host. Each assembles once when its card arrives, then
  rests. Pointing at a card shows what the project does (the copies of the
  ERP fan out, the outliers step back, the exposed ports pop out); on touch
  screens the card in the middle of the screen does the same.
*/
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Formation3D } from "./formation";

const HIDDEN = 0.001;

export function playWork(system: Formation3D, slot: Element, invalidate: () => void): () => void {
  const { pose, blocks, links, nodes } = system;
  const card = slot.closest("article") ?? slot;
  const restY = pose.rotation.y;

  // Start: pieces lowered and invisible, links undrawn.
  for (const { object, home, materials } of blocks) {
    object.position.set(home.x, home.y - 0.5, home.z);
    for (const material of materials) material.opacity = 0;
  }
  for (const object of [...links, ...nodes]) object.scale.setScalar(HIDDEN);

  // Assemble left to right, like reading the card.
  const byX = [...blocks].sort((a, b) => a.home.x - b.home.x);
  const entrance = gsap.timeline({ paused: true, onUpdate: invalidate });
  byX.forEach(({ object, home, materials }, index) => {
    const at = index * 0.035;
    entrance
      .to(object.position, { y: home.y, duration: 1, ease: "expo.out" }, at)
      .to(materials, { opacity: 1, duration: 0.6, ease: "power2.out" }, at);
  });
  if (links.length) {
    entrance
      .to(
        links.map(({ scale }) => scale),
        { x: 1, y: 1, z: 1, duration: 0.5, ease: "power2.inOut", stagger: 0.03 },
        0.4,
      )
      .to(
        nodes.map(({ scale }) => scale),
        { x: 1, y: 1, z: 1, duration: 0.3, ease: "back.out(3)" },
        0.7,
      );
  }

  const start = ScrollTrigger.create({
    trigger: slot,
    start: "top 88%",
    once: true,
    onEnter: () => entrance.play(),
  });

  // Emphasis: what the project does.
  const lifted = blocks.filter(({ data }) => data.lift);
  const emphasise = (on: boolean) => {
    entrance.progress(1);
    const settings = { duration: 0.9, ease: "expo.out", onUpdate: invalidate };
    lifted.forEach(({ object, home, data }, index) => {
      const [x, y, z] = on ? data.lift! : [0, 0, 0];
      gsap.to(object.position, {
        x: home.x + x,
        y: home.y + y,
        z: home.z + z,
        delay: on ? index * 0.025 : 0,
        ...settings,
      });
    });
    gsap.to(pose.rotation, { y: restY + (on ? 0.22 : 0), ...settings });
  };

  const cleanups: (() => void)[] = [];
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const enter = () => emphasise(true);
    const leave = () => emphasise(false);
    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointerleave", leave);
    cleanups.push(() => {
      card.removeEventListener("pointerenter", enter);
      card.removeEventListener("pointerleave", leave);
    });
  } else {
    const middle = ScrollTrigger.create({
      trigger: slot,
      start: "top 55%",
      end: "bottom 35%",
      onToggle: ({ isActive }) => emphasise(isActive),
    });
    cleanups.push(() => middle.kill());
  }

  return () => {
    start.kill();
    entrance.kill();
    for (const cleanup of cleanups) cleanup();
  };
}
