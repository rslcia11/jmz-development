/*
  Understand state (02): disorder → order.

  The section's three steps tell how JMZ works — listen, agree, simplify — so
  the system follows them, scrubbed by the scroll through those steps:

    start    scattered: the modules and the fragments people work with today
             (spreadsheets, whatsapp, paper…), tangled together
    01 Context  everything gathers; the tangle loosens
    02 Goal     the modules snap onto the blueprint; each fragment lands on
                the module that will take over its job
    03 Scope    the fragments sink into their modules, the real connections
                draw and the core lights: the simplest system that solves it

  Motion follows the scroll only, so it rests whenever the visitor does.
*/
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  PointLight,
  Vector3,
} from "three";
import type { Formation3D } from "./formation";
import type { Palette } from "./palette";

const HIDDEN = 0.001;

/** Fixed-seed generator: the scatter is designed once and identical every visit. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function playUnderstand(
  system: Formation3D,
  slot: Element,
  palette: Palette,
  invalidate: () => void,
): () => void {
  const { pose, blocks, links, nodes } = system;
  const modules = blocks.filter(({ data }) => !data.transient);
  const fragments = blocks.filter(({ data }) => data.transient);
  const byLabel = new Map(modules.map((block) => [block.data.label, block]));
  const random = seeded(20260927);
  const spread = (range: number) => (random() * 2 - 1) * range;

  // Where each fragment lands in step 02: stacked on the front of its module.
  const stacks = new Map<string, number>();
  const landing = fragments.map(({ data }) => {
    const target = byLabel.get(data.into)!;
    const index = stacks.get(data.into!) ?? 0;
    stacks.set(data.into!, index + 1);
    const [, h, d] = target.data.size;
    return new Vector3(
      target.home.x + index * 0.08,
      target.home.y + h / 2 - 0.22 - index * 0.14,
      target.home.z + d / 2 + 0.05 + index * 0.05,
    );
  });

  // The disorder: positions and turns, from the fixed seed.
  // Kept inside the slot (perspective enlarges what comes forward) and
  // mostly facing the viewer, like papers tossed on a desk.
  const chaos = blocks.map(() => ({
    position: new Vector3(spread(1.9), spread(1.4), spread(0.5)),
    rotation: new Vector3(spread(0.45), spread(0.5), spread(0.9)),
  }));

  // The tangle: everything wired to everything in no particular order.
  const order = blocks.map((_, index) => index).sort(() => random() - 0.5);
  const pairs = order.map((from, index) => [from, order[(index + 3) % order.length]]);
  const tanglePositions = new Float32Array(pairs.length * 6);
  const tangleGeometry = new BufferGeometry().setAttribute(
    "position",
    new Float32BufferAttribute(tanglePositions, 3),
  );
  const tangleMaterial = new LineBasicMaterial({
    color: new Color(palette.borderDefault),
    transparent: true,
    opacity: 0.9,
  });
  const tangle = new LineSegments(tangleGeometry, tangleMaterial);
  tangle.frustumCulled = false;
  pose.add(tangle);

  const syncTangle = () => {
    pairs.forEach(([from, to], index) => {
      blocks[from].object.position.toArray(tanglePositions, index * 6);
      blocks[to].object.position.toArray(tanglePositions, index * 6 + 3);
    });
    tangleGeometry.attributes.position.needsUpdate = true;
  };

  const core = byLabel.get("core");
  const coreLight = new PointLight(new Color(palette.brand), 0, 3, 1.5);
  coreLight.position.set(0, 0, 0.6);
  core?.object.add(coreLight);

  // Start state.
  const restX = pose.rotation.x;
  const restY = pose.rotation.y;
  pose.rotation.set(restX + 0.2, restY - 0.2, 0);
  blocks.forEach(({ object }, index) => {
    object.position.copy(chaos[index].position);
    object.rotation.setFromVector3(chaos[index].rotation);
  });
  for (const object of [...links, ...nodes]) object.scale.setScalar(HIDDEN);
  syncTangle();

  const timeline = gsap.timeline({
    paused: true,
    defaults: { ease: "power2.inOut", duration: 1 },
    onUpdate: () => {
      syncTangle();
      invalidate();
    },
  });

  // 01 — Context: gather halfway, turns relax.
  blocks.forEach(({ object, home }, index) => {
    const goal = index < modules.length ? home : landing[index - modules.length];
    const halfway = chaos[index].position.clone().lerp(goal, 0.55);
    timeline
      .to(object.position, { x: halfway.x, y: halfway.y, z: halfway.z }, 0)
      .to(
        object.rotation,
        {
          x: chaos[index].rotation.x * 0.35,
          y: chaos[index].rotation.y * 0.35,
          z: chaos[index].rotation.z * 0.35,
        },
        0,
      );
  });
  timeline.to(pose.rotation, { x: restX + 0.15, y: restY - 0.2, duration: 2 }, 0);

  // 02 — Goal: everything finds its place.
  blocks.forEach(({ object, home }, index) => {
    const goal = index < modules.length ? home : landing[index - modules.length];
    const at = 1 + (index % 6) * 0.04;
    timeline
      .to(object.position, { x: goal.x, y: goal.y, z: goal.z, ease: "expo.out" }, at)
      .to(object.rotation, { x: 0, y: 0, z: 0, ease: "expo.out" }, at);
  });
  timeline.to(pose.rotation, { x: restX, y: restY, duration: 1 }, 2);

  // 03 — Scope: only what's needed stays.
  timeline.to(tangleMaterial, { opacity: 0, duration: 0.6 }, 2);
  fragments.forEach(({ object, materials }, index) => {
    const target = byLabel.get(fragments[index].data.into)!;
    const at = 2 + index * 0.03;
    timeline
      .to(object.position, { z: target.home.z, duration: 0.7, ease: "power3.in" }, at)
      .to(object.scale, { x: 0.6, y: 0.6, z: 0.6, duration: 0.7, ease: "power3.in" }, at)
      .to(materials, { opacity: 0, duration: 0.5 }, at + 0.2);
  });
  timeline
    .to(
      links.map(({ scale }) => scale),
      { x: 1, y: 1, z: 1, duration: 0.5, stagger: 0.05 },
      2.3,
    )
    .to(
      nodes.map(({ scale }) => scale),
      { x: 1, y: 1, z: 1, duration: 0.3, ease: "back.out(3)", stagger: 0.04 },
      2.5,
    )
    .to(coreLight, { intensity: 2.5, duration: 0.5, ease: "power2.out" }, 2.5);

  // Desktop: the slot stays beside the steps (sticky), so it starts once the
  // slot is in view and ends as the last step is read. Offsets come from the
  // section and the steps, never from the sticky slot itself. Phones: the
  // slot sits above the steps, so it drives itself while it's on screen.
  const besideSteps = window.matchMedia("(min-width: 64rem)").matches;
  const section = slot.closest("section");
  const steps = section?.querySelector(".understand__process");
  const desktop = besideSteps && section && steps;
  const scrub = ScrollTrigger.create({
    trigger: desktop ? section : slot,
    start: desktop ? "top 20%" : "top 85%",
    endTrigger: desktop ? steps : slot,
    end: desktop ? "bottom 45%" : "bottom 30%",
    scrub: 0.7,
    animation: timeline,
  });

  return () => {
    scrub.kill();
    timeline.kill();
    tangleGeometry.dispose();
    tangleMaterial.dispose();
  };
}
