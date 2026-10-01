/*
  Builds any formation from src/data/formations.ts with the hero's visual
  language: the same bodies, edges, mono labels, links and nodes, so every
  section shows the same system in a new shape.

  Object tree, as in build.ts (each level owns one kind of motion):
    root    → follows the slot                      — stage.ts
    scroll  → reacts to scrolling                   — the section state
    pointer → leans toward the cursor               — pointer.ts
    pose    → entrance and resting view             — the section state
      groups[n] → blocks that move together (a layer, a copy)
*/
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SphereGeometry,
  Vector3,
  type Scene,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { Block, Formation } from "../../data/formations";
import { LABEL_ASPECT, LABEL_HEIGHT, labelTexture } from "./build";
import type { Palette } from "./palette";
import { formationBounds } from "./projection";
import type { Frame } from "./stage";

export interface Block3D {
  data: Block;
  object: Group;
  home: Vector3;
  body: MeshStandardMaterial;
  edges: LineBasicMaterial;
  label: MeshBasicMaterial | null;
  /** Every material, for fading the block as one piece. */
  materials: (MeshStandardMaterial | LineBasicMaterial | MeshBasicMaterial)[];
}

export interface Formation3D {
  root: Group;
  scroll: Group;
  pointer: Group;
  pose: Group;
  groups: Group[];
  blocks: Block3D[];
  links: Line[];
  nodes: Mesh[];
  /** The resting picture, for stage.follow(). */
  frame: Frame;
}

const nodeGeometry = new SphereGeometry(0.03, 12, 12);

function buildBlock(data: Block, palette: Palette): Block3D {
  const [w, h, d] = data.size;
  const home = new Vector3(...data.at);
  const object = new Group();
  object.position.copy(home);

  const body = new MeshStandardMaterial({
    color: data.tone === "muted" ? palette.background : palette.surface,
    roughness: 0.55,
    metalness: 0.15,
    transparent: true,
  });
  const radius = Math.min(0.02, w / 4, h / 4, d / 4);
  object.add(new Mesh(new RoundedBoxGeometry(w, h, d, 2, radius), body));

  const edges = new LineBasicMaterial({
    color:
      data.tone === "core"
        ? palette.brand
        : data.tone === "muted"
          ? palette.borderSubtle
          : palette.borderDefault,
    transparent: true,
  });
  object.add(new LineSegments(new EdgesGeometry(new BoxGeometry(w, h, d)), edges));

  let label: MeshBasicMaterial | null = null;
  if (data.label) {
    label = new MeshBasicMaterial({
      map: labelTexture(
        data.label,
        data.tone === "core" ? palette.brand : palette.textMuted,
        palette.fontMono,
      ),
      transparent: true,
      depthWrite: false,
    });
    const plane = new Mesh(new PlaneGeometry(LABEL_HEIGHT * LABEL_ASPECT, LABEL_HEIGHT), label);
    const left = -w / 2 + 0.1 + (LABEL_HEIGHT * LABEL_ASPECT) / 2;
    if (data.labelFace === "top") {
      plane.rotation.x = -Math.PI / 2;
      plane.position.set(left, h / 2 + 0.002, d / 2 - 0.14);
    } else {
      plane.position.set(left, h / 2 - 0.14, d / 2 + 0.002);
    }
    object.add(plane);
  }

  return {
    data,
    object,
    home,
    body,
    edges,
    label,
    materials: label ? [body, edges, label] : [body, edges],
  };
}

/** A two-point line drawn from its start, so scaling 0→1 "draws" it. */
function buildLink([from, to]: Formation["links"][number], color: string): Line {
  const start = new Vector3(...from);
  const end = new Vector3(...to).sub(start);
  const line = new Line(
    new BufferGeometry().setAttribute(
      "position",
      new Float32BufferAttribute([0, 0, 0, end.x, end.y, end.z], 3),
    ),
    new LineBasicMaterial({ color, transparent: true }),
  );
  line.position.copy(start);
  return line;
}

export function buildFormation(scene: Scene, formation: Formation, palette: Palette): Formation3D {
  const root = new Group();
  const scroll = new Group();
  const pointer = new Group();
  const pose = new Group();
  root.add(scroll);
  scroll.add(pointer);
  pointer.add(pose);
  pose.rotation.set(formation.rest[0], formation.rest[1], 0);
  root.visible = false;
  scene.add(root);

  const groups: Group[] = [];
  const groupOf = (index = 0) => {
    if (!groups[index]) {
      groups[index] = new Group();
      pose.add(groups[index]);
    }
    return groups[index];
  };

  const blocks = formation.blocks.map((data) => {
    const block = buildBlock(data, palette);
    groupOf(data.group).add(block.object);
    return block;
  });

  const links = formation.links.map((link) => buildLink(link, palette.textMuted));
  const nodeMaterial = new MeshBasicMaterial({ color: new Color(palette.textSecondary) });
  const nodes = formation.links.map(([from, to]) => {
    const node = new Mesh(nodeGeometry, nodeMaterial);
    node.position.set((from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2);
    return node;
  });
  // add() with no arguments logs an error: some shapes have no links.
  if (links.length) pose.add(...links, ...nodes);

  const bounds = formationBounds(formation);
  return {
    root,
    scroll,
    pointer,
    pose,
    groups,
    blocks,
    links,
    nodes,
    frame: {
      width: bounds.width,
      height: bounds.height,
      centerX: bounds.minX + bounds.width / 2,
      // Bounds are in SVG space (y down); the scene is y up.
      centerY: -(bounds.minY + bounds.height / 2),
    },
  };
}
