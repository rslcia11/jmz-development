/*
  Builds the 3D signature system from src/data/system.ts — the same layout the
  SVG fallback draws. 1 world unit = 100 blueprint units, centered, y up.

  Object tree (each level owns one kind of motion, so they never fight):
    root    → follows the page slot (position, scale)      — stage.ts
    scroll  → reacts to scrolling                          — hero.ts
    pointer → leans toward the cursor                      — hero.ts
    pose    → entrance and resting 3/4 view                — hero.ts
      guides, links, nodes, modules
*/
import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
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
  PointLight,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
  type Material,
  type Scene,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import {
  SYSTEM_SIZE,
  systemGuides,
  systemLines,
  systemLinks,
  systemModules,
  type SystemModule,
} from "../../data/system";
import type { Palette } from "./palette";

const UNIT = 100;
/** Width of the whole blueprint in world units: what a slot's width maps onto. */
export const SYSTEM_WORLD_WIDTH = SYSTEM_SIZE / UNIT;
const DEPTH = 0.16;
/** Sized so the 3D labels match the SVG's 9px-in-400 mono text. */
export const LABEL_HEIGHT = 0.14;
export const LABEL_ASPECT = 4;

/** Blueprint (x right, y down, 0..400) → world (x right, y up, centered). */
const toWorld = (x: number, y: number) =>
  new Vector3((x - SYSTEM_SIZE / 2) / UNIT, -(y - SYSTEM_SIZE / 2) / UNIT, 0);

export interface SystemModule3D {
  data: SystemModule;
  group: Group;
  /** Resting position; the entrance animates from `data.from` back to here. */
  home: Vector3;
  materials: Material[];
}

export interface System3D {
  root: Group;
  scroll: Group;
  pointer: Group;
  pose: Group;
  guides: LineSegments;
  links: Line[];
  nodes: Mesh[];
  modules: SystemModule3D[];
  accent: Mesh;
  coreLight: PointLight;
}

const labelCache = new Map<string, CanvasTexture>();

/** Mono label drawn once per text and color, shared by every state that shows it. */
export function labelTexture(text: string, color: string, font: string): CanvasTexture {
  const key = `${text}|${color}`;
  const cached = labelCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512 / LABEL_ASPECT;
  const context = canvas.getContext("2d");
  if (context) {
    context.font = `500 80px ${font}`;
    context.fillStyle = color;
    context.textBaseline = "middle";
    context.fillText(text.toUpperCase(), 0, canvas.height / 2);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  labelCache.set(key, texture);
  return texture;
}

function buildModule(data: SystemModule, palette: Palette): SystemModule3D {
  const w = data.w / UNIT;
  const h = data.h / UNIT;
  const home = toWorld(data.x + data.w / 2, data.y + data.h / 2);
  const group = new Group();
  group.position.copy(home);

  const body = new Mesh(
    new RoundedBoxGeometry(w, h, DEPTH, 2, 0.02),
    new MeshStandardMaterial({
      color: palette.surface,
      roughness: 0.55,
      metalness: 0.15,
      transparent: true,
    }),
  );

  // Crisp outline on the true box edges, like the SVG stroke.
  const edges = new LineSegments(
    new EdgesGeometry(new BoxGeometry(w, h, DEPTH)),
    new LineBasicMaterial({
      color: data.core ? palette.brand : palette.borderDefault,
      transparent: true,
    }),
  );

  const label = new Mesh(
    new PlaneGeometry(LABEL_HEIGHT * LABEL_ASPECT, LABEL_HEIGHT),
    new MeshBasicMaterial({
      map: labelTexture(data.label, data.core ? palette.brand : palette.textMuted, palette.fontMono),
      transparent: true,
      depthWrite: false,
    }),
  );
  // Top-left of the front face, mirroring the SVG text position.
  label.position.set(
    -w / 2 + 0.12 + (LABEL_HEIGHT * LABEL_ASPECT) / 2,
    h / 2 - 0.16,
    DEPTH / 2 + 0.002,
  );

  group.add(body, edges, label);

  return {
    data,
    group,
    home,
    materials: [body.material, edges.material, label.material],
  };
}

/** A two-point line drawn from its start, so scaling 0→1 "draws" it. */
function buildLink([x1, y1, x2, y2]: (typeof systemLines)[number], color: string): Line {
  const start = toWorld(x1, y1);
  const end = toWorld(x2, y2).sub(start);
  const geometry = new BufferGeometry().setAttribute(
    "position",
    new Float32BufferAttribute([0, 0, 0, end.x, end.y, 0], 3),
  );
  const line = new Line(geometry, new LineBasicMaterial({ color }));
  line.position.copy(start);
  return line;
}

export function buildSystem(scene: Scene, palette: Palette): System3D {
  const root = new Group();
  const scroll = new Group();
  const pointer = new Group();
  const pose = new Group();
  root.add(scroll);
  scroll.add(pointer);
  pointer.add(pose);
  scene.add(root);

  // Guides sit slightly behind the modules: a blueprint under the system.
  const guidePoints: number[] = [];
  for (const at of systemGuides) {
    const vertical = [toWorld(at, 0), toWorld(at, SYSTEM_SIZE)];
    const horizontal = [toWorld(0, at), toWorld(SYSTEM_SIZE, at)];
    for (const point of [...vertical, ...horizontal]) guidePoints.push(point.x, point.y, -0.3);
  }
  const guides = new LineSegments(
    new BufferGeometry().setAttribute("position", new Float32BufferAttribute(guidePoints, 3)),
    new LineBasicMaterial({ color: palette.borderSubtle, transparent: true }),
  );

  const links = systemLines.map((line) => buildLink(line, palette.textMuted));

  const nodeGeometry = new SphereGeometry(0.03, 12, 12);
  const nodeMaterial = new MeshBasicMaterial({ color: palette.textSecondary });
  const nodes = systemLinks.map(([x1, y1, x2, y2]) => {
    const node = new Mesh(nodeGeometry, nodeMaterial);
    node.position.copy(toWorld((x1 + x2) / 2, (y1 + y2) / 2));
    return node;
  });

  const modules = systemModules.map((data) => buildModule(data, palette));

  // The payoff: a lit brand accent on the core, bottom-right like the SVG.
  const core = modules.find(({ data }) => data.core);
  const accent = new Mesh(
    new BoxGeometry(0.12, 0.12, 0.04),
    new MeshBasicMaterial({ color: palette.brand }),
  );
  const coreLight = new PointLight(new Color(palette.brand), 0, 3, 1.5);
  if (core) {
    const w = core.data.w / UNIT;
    const h = core.data.h / UNIT;
    accent.position.set(w / 2 - 0.18, -h / 2 + 0.18, DEPTH / 2 + 0.02);
    coreLight.position.set(0, 0, 0.6);
    core.group.add(accent, coreLight);
  }

  pose.add(guides, ...links, ...nodes, ...modules.map(({ group }) => group));

  // Soft key light from the top-left, matching the SVG's flat reading.
  const key = new DirectionalLight(0xffffff, 1.6);
  key.position.set(-3, 4, 6);
  scene.add(new AmbientLight(0xffffff, 0.9), key);

  return {
    root,
    scroll,
    pointer,
    pose,
    guides,
    links,
    nodes,
    modules,
    accent,
    coreLight,
  };
}
