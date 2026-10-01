/*
  One fixed, full-viewport canvas behind the content (ADR 0002). The system
  never floats freely: it is placed onto a DOM "slot" — an element in the
  layout's visual column — so it can never sit behind text, and the layout
  (not the scene) decides where it lives.

  Rendering is on demand: nothing is drawn unless something changed (a
  tween, a scroll, a resize, the pointer) and the slot is on screen. A still
  page costs no GPU work.
*/
import { gsap } from "gsap";
import { MathUtils, PerspectiveCamera, Scene, WebGLRenderer, type Object3D } from "three";

const FOV = 28;
const CAMERA_Z = 12;
/** Full-viewport canvas: the pixel ratio is the main GPU cost, so cap it. */
const MAX_PIXEL_RATIO = 1.5;
/** Keep rendering a little beyond the viewport so the system never pops in. */
const OVERSCAN = 0.25;
/** Longest layout-moving transition (motion.css: reveal 1000ms + stagger). */
const SETTLE_MS = 1600;

/** What the object looks like on screen at rest, in world units (projection.ts). */
export interface Frame {
  width: number;
  height: number;
  /** Center of that picture relative to the object's origin (y up). */
  centerX?: number;
  centerY?: number;
}

export interface Stage {
  scene: Scene;
  /** Ask for one render on the next frame; cheap to call as often as needed. */
  invalidate: () => void;
  /** Place `object` onto `slot`, fitting `frame` inside it. Any number of slots. */
  follow: (slot: Element, object: Object3D, frame: Frame) => void;
  dispose: () => void;
}

interface Follower {
  slot: Element;
  object: Object3D;
  frame: Required<Frame>;
}

export function createStage(canvas: HTMLCanvasElement, onContextLost: () => void): Stage {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.z = CAMERA_Z;

  const followers: Follower[] = [];
  // The canvas's own box, not window.inner*: that one includes the scrollbar.
  let viewWidth = 1;
  let viewHeight = 1;
  let worldPerPixel = 0;
  let visible = false;
  let wasVisible = false;
  let needsRender = true;
  // Layout reads only when the slot can have moved, not on every tween frame.
  let needsPlacement = true;

  const invalidate = () => {
    needsRender = true;
  };

  const relayout = () => {
    needsPlacement = true;
    needsRender = true;
  };

  const resize = () => {
    viewWidth = canvas.clientWidth || 1;
    viewHeight = canvas.clientHeight || 1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    renderer.setSize(viewWidth, viewHeight, false);
    camera.aspect = viewWidth / viewHeight;
    camera.updateProjectionMatrix();
    // Height of the z = 0 plane in world units, divided into pixels.
    worldPerPixel = (2 * CAMERA_Z * Math.tan(MathUtils.degToRad(FOV) / 2)) / viewHeight;
    relayout();
  };

  const place = () => {
    needsPlacement = false;
    const margin = viewHeight * OVERSCAN;
    visible = false;

    // Off-screen states are hidden, so a frame only draws what can be seen.
    for (const { slot, object, frame } of followers) {
      const rect = slot.getBoundingClientRect();
      object.visible =
        rect.width > 0 && rect.bottom > -margin && rect.top < viewHeight + margin;
      if (!object.visible) continue;
      visible = true;

      const scale = Math.min(
        (rect.width * worldPerPixel) / frame.width,
        (rect.height * worldPerPixel) / frame.height,
      );
      const centerX = rect.left + rect.width / 2 - viewWidth / 2;
      const centerY = rect.top + rect.height / 2 - viewHeight / 2;
      object.position.x = centerX * worldPerPixel - frame.centerX * scale;
      object.position.y = -centerY * worldPerPixel - frame.centerY * scale;
      object.scale.setScalar(scale);
    }
  };

  // CSS transitions (the [data-reveal] entrance) move slots without a scroll
  // or resize: keep re-measuring every frame until they have settled.
  let settleUntil = 0;
  const settle = () => {
    settleUntil = performance.now() + SETTLE_MS;
  };

  const tick = () => {
    if (performance.now() < settleUntil) relayout();
    if (!needsRender) return;
    needsRender = false;
    if (needsPlacement) place();
    // One last frame when leaving the screen clears the canvas; then idle.
    if (visible || wasVisible) renderer.render(scene, camera);
    wasVisible = visible;
  };

  const onLost = (event: Event) => {
    event.preventDefault();
    onContextLost();
  };

  // The slot can also move without a scroll or resize: late web fonts reflow
  // the copy beside it, and the page height changes. Re-measure then too.
  const layoutWatcher = new ResizeObserver(relayout);
  layoutWatcher.observe(document.body);
  // Watching the canvas itself (not window resize) also catches the
  // scrollbar appearing or disappearing, which changes its width.
  const canvasWatcher = new ResizeObserver(resize);
  canvasWatcher.observe(canvas);

  resize();
  window.addEventListener("scroll", relayout, { passive: true });
  document.addEventListener("transitionrun", settle);
  document.fonts.addEventListener("loadingdone", relayout);
  canvas.addEventListener("webglcontextlost", onLost);
  gsap.ticker.add(tick);

  return {
    scene,
    invalidate,
    follow: (slot, object, { width, height, centerX = 0, centerY = 0 }) => {
      followers.push({ slot, object, frame: { width, height, centerX, centerY } });
      layoutWatcher.observe(slot);
      relayout();
    },
    dispose: () => {
      gsap.ticker.remove(tick);
      layoutWatcher.disconnect();
      canvasWatcher.disconnect();
      window.removeEventListener("scroll", relayout);
      document.removeEventListener("transitionrun", settle);
      document.fonts.removeEventListener("loadingdone", relayout);
      canvas.removeEventListener("webglcontextlost", onLost);
      renderer.dispose();
    },
  };
}
