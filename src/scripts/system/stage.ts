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

export interface Stage {
  scene: Scene;
  /** Ask for one render on the next frame; cheap to call as often as needed. */
  invalidate: () => void;
  /** Place `object` onto `slot`; `width` is the object's width in world units. */
  follow: (slot: Element, object: Object3D, width: number) => void;
  dispose: () => void;
}

export function createStage(canvas: HTMLCanvasElement, onContextLost: () => void): Stage {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.z = CAMERA_Z;

  let slot: Element | null = null;
  let target: Object3D | null = null;
  let targetWidth = 1;
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
    if (!slot || !target) return;
    const rect = slot.getBoundingClientRect();
    const margin = viewHeight * OVERSCAN;
    visible = rect.bottom > -margin && rect.top < viewHeight + margin;

    const centerX = rect.left + rect.width / 2 - viewWidth / 2;
    const centerY = rect.top + rect.height / 2 - viewHeight / 2;
    target.position.x = centerX * worldPerPixel;
    target.position.y = -centerY * worldPerPixel;
    target.scale.setScalar((rect.width * worldPerPixel) / targetWidth);
  };

  const tick = () => {
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
  document.fonts.addEventListener("loadingdone", relayout);
  canvas.addEventListener("webglcontextlost", onLost);
  gsap.ticker.add(tick);

  return {
    scene,
    invalidate,
    follow: (element, object, width) => {
      slot = element;
      target = object;
      targetWidth = width;
      layoutWatcher.observe(element);
      relayout();
    },
    dispose: () => {
      gsap.ticker.remove(tick);
      layoutWatcher.disconnect();
      canvasWatcher.disconnect();
      window.removeEventListener("scroll", relayout);
      document.fonts.removeEventListener("loadingdone", relayout);
      canvas.removeEventListener("webglcontextlost", onLost);
      renderer.dispose();
    },
  };
}
