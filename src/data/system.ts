/*
  JMZ signature system (master plan §15): one layout, drawn twice — as the
  static SVG fallback (HeroSystem.astro) and as the 3D scene
  (src/scripts/system). Change it here and both stay in sync.

  Units: a 400×400 blueprint. 3×3 grid of 96px cells with 24px gaps; the
  empty bottom-middle cell is the channel the core's output runs through.
*/

export interface SystemModule {
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /**
   * Designed (never random) starting offset for the assembly:
   * [x, y, z, rotate]. x/y/z in blueprint units, rotate in degrees.
   * The SVG ignores z.
   */
  from: [number, number, number, number];
  core?: boolean;
}

export const SYSTEM_SIZE = 400;

export const systemModules: SystemModule[] = [
  { label: "context", x: 32, y: 32, w: 216, h: 96, from: [-56, -40, 120, -8] },
  { label: "users", x: 272, y: 32, w: 96, h: 96, from: [48, -56, -80, 12] },
  { label: "process", x: 32, y: 152, w: 96, h: 96, from: [-72, 16, 60, -14] },
  { label: "core", x: 152, y: 152, w: 96, h: 96, from: [0, 32, 200, 45], core: true },
  { label: "data", x: 272, y: 152, w: 96, h: 216, from: [64, 36, -120, 10] },
  { label: "automation", x: 32, y: 272, w: 96, h: 96, from: [-40, 64, 90, -10] },
];

/** Blueprint guides along the grid's cell edges. */
export const systemGuides = [32, 152, 248, 368];

/** Connections bridging the 24px gaps between neighbouring modules. */
export const systemLinks: [number, number, number, number][] = [
  [80, 128, 80, 152],
  [200, 128, 200, 152],
  [320, 128, 320, 152],
  [128, 200, 152, 200],
  [248, 200, 272, 200],
  [80, 248, 80, 272],
];

/** The core's output, exiting through the empty channel to the bottom edge. */
export const systemOutput: [number, number, number, number] = [200, 248, 200, 400];

/** Every line drawn between modules: the connections plus the core's output. */
export const systemLines = [...systemLinks, systemOutput];
