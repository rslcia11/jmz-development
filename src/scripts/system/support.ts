/*
  Decides whether this visit gets the 3D scene or the static SVG (ADR 0002).
  Runs before three.js is downloaded, so a "no" costs nothing.
*/

interface NetworkInformation {
  saveData?: boolean;
}

interface NavigatorHints {
  connection?: NetworkInformation;
  deviceMemory?: number;
}

export function supports3D(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;

  const hints = navigator as Navigator & NavigatorHints;
  if (hints.connection?.saveData) return false;
  // deviceMemory is coarse (0.25–8 GB) and Chromium-only; absent means unknown, not weak.
  if (hints.deviceMemory !== undefined && hints.deviceMemory < 4) return false;

  try {
    const context = document.createElement("canvas").getContext("webgl2");
    // Free the probe context right away; browsers cap live contexts.
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return context !== null;
  } catch {
    return false;
  }
}
