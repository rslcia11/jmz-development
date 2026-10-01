/*
  Services state (01 — Build): the system opens into the JMZ map.

  Seen from above it is one flat plan. As the section arrives, the view tilts
  and the plan opens into three layers — operations, AI & data, web — joined
  by one spine: three fronts, one system. Then, as each capability is read,
  its layer lifts and lights while the others step back.

  Opening is scrubbed by the scroll; the highlight answers which capability
  the visitor is reading. Nothing moves on its own.
*/
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Color, Group } from "three";
import type { Formation3D } from "./formation";
import type { Palette } from "./palette";

const HIDDEN = 0.001;
const LIFT = 0.22;
const DIMMED = 0.35;

export function playServices(
  system: Formation3D,
  slot: Element,
  palette: Palette,
  invalidate: () => void,
): () => void {
  const { pose, groups, blocks, links, nodes } = system;
  const section = slot.closest("section");

  // A lifter around each layer: opening moves the layer, the highlight the lifter.
  const lifters = groups.map((layer) => {
    const lifter = new Group();
    pose.add(lifter);
    lifter.add(layer);
    return lifter;
  });
  const layerBlocks = groups.map((_, index) => blocks.filter(({ data }) => data.group === index));
  const plateEdges = layerBlocks.map((layer) => layer.find(({ data }) => data.tone === "muted")!);
  // Links inside a layer travel with it (formations.ts: two spine links, then two per layer).
  groups.forEach((layer, index) => {
    for (const at of [2 + index * 2, 3 + index * 2]) layer.add(links[at], nodes[at]);
  });
  const brand = new Color(palette.brand);
  const subtle = new Color(palette.borderSubtle);

  // Start: one flat plan seen from above, the layers pressed together.
  const restX = pose.rotation.x;
  const restY = pose.rotation.y;
  pose.rotation.set(1.42, -0.1, 0);
  groups.forEach((layer, index) => {
    const y = layer.children[0]?.position.y ?? 0;
    layer.position.y = -y + (1 - index) * 0.12;
  });
  for (const { data, object } of blocks) {
    if (data.tone !== "muted") object.scale.set(1, HIDDEN, 1);
  }
  for (const object of [...links, ...nodes]) object.scale.setScalar(HIDDEN);

  const open = gsap.timeline({
    paused: true,
    defaults: { ease: "power2.inOut", duration: 1 },
    onUpdate: invalidate,
  });
  open.to(pose.rotation, { x: restX, y: restY, duration: 2 }, 0);
  groups.forEach((layer, index) => {
    open.to(layer.position, { y: 0, duration: 1.4, ease: "power3.inOut" }, 0.4 + index * 0.1);
  });
  open
    .to(
      blocks.filter(({ data }) => data.tone !== "muted").map(({ object }) => object.scale),
      { y: 1, duration: 0.8, ease: "back.out(2)", stagger: 0.04 },
      1,
    )
    .to(
      links.map(({ scale }) => scale),
      { x: 1, y: 1, z: 1, duration: 0.5, stagger: 0.05 },
      1.5,
    )
    .to(
      nodes.map(({ scale }) => scale),
      { x: 1, y: 1, z: 1, duration: 0.3, ease: "back.out(3)" },
      1.8,
    );

  // Offsets come from the section, not the slot: on desktop the slot is
  // sticky, and a sticky element's own scroll positions are not stable.
  // These match the moments its slot is fully in view.
  const besideList = window.matchMedia("(min-width: 64rem)").matches;
  const scrub = ScrollTrigger.create({
    trigger: besideList && section ? section : slot,
    start: besideList ? "top 35%" : "top 90%",
    end: besideList ? "top -15%" : "center 45%",
    scrub: 0.7,
    animation: open,
  });

  // Highlight the layer of the capability being read (null: none, all equal).
  let active: number | null = null;
  const highlight = (next: number | null) => {
    if (next === active) return;
    active = next;
    lifters.forEach((lifter, index) => {
      const on = next === index;
      const quiet = next !== null && !on;
      const settings = { duration: 0.8, ease: "expo.out", onUpdate: invalidate };
      gsap.to(lifter.position, { y: on ? LIFT : 0, ...settings });
      gsap.to(
        layerBlocks[index].flatMap(({ materials }) => materials),
        { opacity: quiet ? DIMMED : 1, ...settings },
      );
      const target = on ? brand : subtle;
      gsap.to(plateEdges[index].edges.color, { r: target.r, g: target.g, b: target.b, ...settings });
    });
  };

  const capabilities = section ? [...section.querySelectorAll(".build__capability")] : [];
  const readers = capabilities.map((capability, index) =>
    ScrollTrigger.create({
      trigger: capability,
      // One line across the screen: only one capability is "being read".
      start: "top 55%",
      end: "bottom 55%",
      onToggle: ({ isActive }) => {
        if (isActive) highlight(index);
        else if (active === index) highlight(null);
      },
    }),
  );

  return () => {
    scrub.kill();
    open.kill();
    for (const reader of readers) reader.kill();
  };
}
