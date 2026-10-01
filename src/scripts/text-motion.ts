/*
  Text motion (motion.css grammar, no library):
  - [data-split]  headings rise word by word from behind a mask.
  - [data-decode] mono eyebrows resolve from scrambled characters, like a
                  system booting; screen readers get the real text at once.
  - [data-step]   in a list, the item crossing the middle of the screen is
                  "being read": its rule and number light up — the same
                  moment the 3D system answers it.
  Reduced motion: no split, no decode; the reading highlight stays (it is a
  color change, not motion).
*/
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Run `play` once, when `element` first enters the screen. */
function onceInView(elements: Element[], play: (element: Element) => void) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue;
        observer.unobserve(target);
        play(target);
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  elements.forEach((element) => observer.observe(element));
}

function split(heading: HTMLElement) {
  let index = 0;
  const wrap = (node: Node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType !== Node.TEXT_NODE) {
        if (child.nodeName !== "BR") wrap(child);
        continue;
      }
      const parts = (child.textContent ?? "").split(/(\s+)/);
      const fragment = document.createDocumentFragment();
      for (const part of parts) {
        if (!part) continue;
        if (/^\s+$/.test(part)) {
          fragment.append(" ");
          continue;
        }
        const word = document.createElement("span");
        const inner = document.createElement("span");
        word.className = "split-word";
        word.style.setProperty("--i", String(index++));
        inner.textContent = part;
        word.append(inner);
        fragment.append(word);
      }
      child.replaceWith(fragment);
    }
  };
  wrap(heading);
  heading.classList.add("is-split");
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#<>_";
const DECODE_MS = 900;

function decode(label: HTMLElement) {
  const text = label.textContent?.trim() ?? "";
  const real = document.createElement("span");
  real.className = "sr-only";
  real.textContent = text;
  const shown = document.createElement("span");
  shown.setAttribute("aria-hidden", "true");
  label.replaceChildren(real, shown);

  const start = performance.now();
  const frame = (now: number) => {
    const progress = Math.min(1, (now - start) / DECODE_MS);
    // Left to right: each character settles at its own moment.
    shown.textContent = [...text]
      .map((char, index) => {
        if (/[\s—·&]/.test(char) || progress >= (index + 1) / text.length) return char;
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      })
      .join("");
    if (progress < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

if (!reduced) {
  const headings = [...document.querySelectorAll<HTMLElement>("[data-split]")];
  headings.forEach(split);
  onceInView(headings, (heading) => heading.classList.add("is-in"));

  const labels = [...document.querySelectorAll<HTMLElement>("[data-decode]")];
  onceInView(labels, (label) => decode(label as HTMLElement));
}

// Reading highlight: a thin band across the middle of the viewport.
const steps = document.querySelectorAll("[data-step]");
const reading = new IntersectionObserver(
  (entries) => {
    for (const { target, isIntersecting } of entries) {
      target.classList.toggle("is-current", isIntersecting);
    }
  },
  { rootMargin: "-45% 0px -45% 0px" },
);
steps.forEach((step) => reading.observe(step));
