/*
  The system leans slightly toward the cursor, wherever it is on the page —
  a system-wide behavior, not a section state, so one listener serves all.
  Only where there is a real cursor; touch gets no tilt.
*/
import { gsap } from "gsap";
import type { Object3D } from "three";

/** Maximum lean in radians: noticeable, never enough to distort the diagram. */
const LEAN = { x: 0.1, y: 0.16 };

export function leanTowardPointer(pivots: Object3D[], invalidate: () => void): () => void {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return () => undefined;

  const follow = { duration: 1.2, ease: "power3.out", onUpdate: invalidate };
  const leans = pivots.map((pivot) => ({
    toX: gsap.quickTo(pivot.rotation, "x", follow),
    toY: gsap.quickTo(pivot.rotation, "y", follow),
  }));

  const onMove = ({ clientX, clientY }: PointerEvent) => {
    const y = (clientX / window.innerWidth - 0.5) * LEAN.y;
    const x = (clientY / window.innerHeight - 0.5) * LEAN.x;
    for (const { toX, toY } of leans) {
      toY(y);
      toX(x);
    }
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  return () => window.removeEventListener("pointermove", onMove);
}
