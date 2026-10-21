import { termAnchorId } from "@/core/reference/anchors";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const FLASH_ATTRIBUTE = "data-flash";

const prefersReducedMotion = (): boolean =>
  typeof window.matchMedia === "function" &&
  window.matchMedia(REDUCED_MOTION_QUERY).matches;

/** Smooth scrolling, unless the player asks for less motion. */
export const scrollBehavior = (): ScrollBehavior =>
  prefersReducedMotion() ? "auto" : "smooth";

/** Scrolls an element to the top of the list. */
export const scrollToElement = (element: Element) => {
  element.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
};

/** Scrolls to a term's entry, focuses it and highlights it briefly. */
export const jumpToTerm = (term: string) => {
  const target = document.getElementById(termAnchorId(term));

  if (!target) {
    return;
  }

  scrollToElement(target);
  target.focus({ preventScroll: true });

  // Taken off and put back on the next frame, so a second jump to the same term flashes again.
  target.removeAttribute(FLASH_ATTRIBUTE);
  requestAnimationFrame(() => {
    target.setAttribute(FLASH_ATTRIBUTE, "");
  });
};
