/*
  Orthographic projection of a formation at its resting pose — no three.js.
  The static SVG fallbacks (SystemFallback.astro) are drawn with it at build
  time, and the 3D scene uses the same bounds to fit each formation into its
  slot, so the fallback and the live scene always frame the same picture.

  Rotation order matches three.js's default Euler "XYZ" on the pose group:
  a point is turned around Y first, then around X.
*/
import type { Formation, Vec3 } from "../../data/formations";

export interface Projected {
  x: number;
  /** SVG y (down). */
  y: number;
  /** Depth toward the viewer: larger is closer. */
  z: number;
}

export function project([x, y, z]: Vec3, [rx, ry]: [number, number]): Projected {
  const x1 = x * Math.cos(ry) + z * Math.sin(ry);
  const z1 = -x * Math.sin(ry) + z * Math.cos(ry);
  const y2 = y * Math.cos(rx) - z1 * Math.sin(rx);
  const z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
  return { x: x1, y: -y2, z: z2 };
}

/** The 8 corners of a block, indexed by bit (x: 1, y: 2, z: 4). */
export function corners({ at, size }: { at: Vec3; size: Vec3 }): Vec3[] {
  return Array.from({ length: 8 }, (_, bit) => [
    at[0] + (bit & 1 ? 0.5 : -0.5) * size[0],
    at[1] + (bit & 2 ? 0.5 : -0.5) * size[1],
    at[2] + (bit & 4 ? 0.5 : -0.5) * size[2],
  ]);
}

/** Faces as corner indices, counter-clockwise seen from outside, with their normal. */
export const FACES: { corners: [number, number, number, number]; normal: Vec3 }[] = [
  { corners: [4, 5, 7, 6], normal: [0, 0, 1] },
  { corners: [1, 0, 2, 3], normal: [0, 0, -1] },
  { corners: [2, 6, 7, 3], normal: [0, 1, 0] },
  { corners: [0, 1, 5, 4], normal: [0, -1, 0] },
  { corners: [1, 3, 7, 5], normal: [1, 0, 0] },
  { corners: [0, 4, 6, 2], normal: [-1, 0, 0] },
];

export interface Bounds {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

/** Screen-space box of everything that stays at rest (transient blocks excluded). */
export function formationBounds(formation: Formation): Bounds {
  const points: Projected[] = [];
  for (const block of formation.blocks) {
    if (block.transient) continue;
    for (const corner of corners(block)) points.push(project(corner, formation.rest));
  }
  for (const [from, to] of formation.links) {
    points.push(project(from, formation.rest), project(to, formation.rest));
  }

  const xs = points.map(({ x }) => x);
  const ys = points.map(({ y }) => y);
  const pad = formation.padding ?? 0.15;
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  return {
    minX,
    minY,
    width: Math.max(...xs) + pad - minX,
    height: Math.max(...ys) + pad - minY,
  };
}
