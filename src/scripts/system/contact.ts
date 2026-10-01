/*
  Contact state (05): the system converges, ready for your case.

  As the section arrives, the modules leave their hero places and close into
  one compact block, its output pointing at the form. Then the form drives
  it: each field you fill wakes its module (formations.ts maps them), a
  complete form lights the core, and sending runs a pulse down the output.
  Scroll and the visitor's own typing are the only things that move it.
*/
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Color, Mesh, MeshBasicMaterial, PointLight, SphereGeometry, Vector3 } from "three";
import { contactFieldModules, heroPositions } from "../../data/formations";
import type { Block3D, Formation3D } from "./formation";
import type { Palette } from "./palette";

const HIDDEN = 0.001;
/** How much an awake module glows: a warm hint, never a filled block. */
const GLOW = 0.06;

export function playContact(
  system: Formation3D,
  slot: Element,
  palette: Palette,
  invalidate: () => void,
): () => void {
  const { pose, blocks, links, nodes } = system;
  const section = slot.closest("section");
  const form = section?.querySelector<HTMLFormElement>("[data-contact-form]");
  const byLabel = new Map(blocks.map((block) => [block.data.label ?? "", block]));
  const core = byLabel.get("core");
  const brand = new Color(palette.brand);

  // Start: the modules where the hero had them, spread out and flat.
  const center = new Vector3(-0.9, 0, 0);
  const restY = pose.rotation.y;
  pose.rotation.y = restY + 0.5;
  for (const { object, data } of blocks) {
    const from = heroPositions[data.label ?? ""] ?? [0, 0, 0];
    object.position.set(from[0] * 1.15 + center.x, from[1] * 1.15, -0.6);
    object.scale.set(1, 1, 0.25);
    object.rotation.z = (from[0] - from[1]) * 0.12;
  }
  for (const object of [...links, ...nodes]) object.scale.setScalar(HIDDEN);

  const coreLight = new PointLight(brand, 0, 3, 1.5);
  coreLight.position.set(0, 0, 0.7);
  core?.object.add(coreLight);

  const converge = gsap.timeline({
    paused: true,
    defaults: { ease: "power3.inOut", duration: 1 },
    onUpdate: invalidate,
  });
  blocks.forEach(({ object, home }, index) => {
    const at = index * 0.06;
    converge
      .to(object.position, { x: home.x, y: home.y, z: home.z }, at)
      .to(object.scale, { z: 1 }, at)
      .to(object.rotation, { z: 0 }, at);
  });
  converge
    .to(pose.rotation, { y: restY, duration: 1.4 }, 0)
    .to(links[0].scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: "power2.out" }, 1.1)
    .to(nodes[0].scale, { x: 1, y: 1, z: 1, duration: 0.3, ease: "back.out(3)" }, 1.4);

  const scrub = ScrollTrigger.create({
    trigger: slot,
    start: "top 95%",
    end: "center 70%",
    scrub: 0.7,
    animation: converge,
  });

  // The form wakes the system.
  const settings = { duration: 0.6, ease: "power2.out", onUpdate: invalidate };
  const awake = new Set<Block3D>();
  const wake = (block: Block3D | undefined, on: boolean) => {
    if (!block || awake.has(block) === on || block === core) return;
    if (on) awake.add(block);
    else awake.delete(block);
    const edge = on ? brand : new Color(palette.borderDefault);
    gsap.to(block.edges.color, { r: edge.r, g: edge.g, b: edge.b, ...settings });
    gsap.to(block.body.emissive, {
      r: on ? brand.r * GLOW : 0,
      g: on ? brand.g * GLOW : 0,
      b: on ? brand.b * GLOW : 0,
      ...settings,
    });
  };

  let complete = false;
  const read = () => {
    if (!form) return;
    for (const [name, module] of Object.entries(contactFieldModules)) {
      const field = form.elements.namedItem(name) as HTMLInputElement | null;
      wake(byLabel.get(module), Boolean(field?.value.trim()) && Boolean(field?.checkValidity()));
    }
    const ready = form.checkValidity();
    wake(byLabel.get("automation"), ready);
    if (ready !== complete) {
      complete = ready;
      gsap.to(coreLight, { intensity: ready ? 1.6 : 0, ...settings });
    }
  };

  // Sending: a pulse leaves the core down the output.
  const pulse = new Mesh(
    new SphereGeometry(0.06, 16, 16),
    new MeshBasicMaterial({ color: brand, transparent: true, opacity: 0 }),
  );
  const [from, to] = [links[0].position.clone(), links[0].position.clone()];
  const end = links[0].geometry.attributes.position;
  to.add(new Vector3(end.getX(1), end.getY(1), end.getZ(1)));
  pose.add(pulse);
  const send = () => {
    if (!form?.checkValidity()) return;
    pulse.position.copy(from);
    gsap
      .timeline({ onUpdate: invalidate })
      .set(pulse.material, { opacity: 1 })
      .to(pulse.position, { x: to.x, y: to.y, z: to.z, duration: 0.7, ease: "power2.in" })
      .to(pulse.material, { opacity: 0, duration: 0.2 })
      .fromTo(nodes[0].scale, { x: 3, y: 3, z: 3 }, { x: 1, y: 1, z: 1, duration: 0.6 }, "<");
  };

  form?.addEventListener("input", read);
  form?.addEventListener("submit", send);

  return () => {
    scrub.kill();
    converge.kill();
    form?.removeEventListener("input", read);
    form?.removeEventListener("submit", send);
  };
}
