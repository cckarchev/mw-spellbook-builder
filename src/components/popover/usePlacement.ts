import { type RefObject, useLayoutEffect, useState } from "react";
import { type Placement, placePopover } from "@/core/layout/placePopover";

// In px, matching --space-xs and --space-2xs.
const VIEWPORT_GUTTER = 8;
const ANCHOR_GAP = 4;

interface PopoverRefs {
  anchorRef: RefObject<HTMLButtonElement | null>;
  popoverRef: RefObject<HTMLDivElement | null>;
}

/**
 * Where the open popover goes, kept next to its button while the page scrolls
 * or resizes.
 */
export const usePlacement = (
  isOpen: boolean,
  { anchorRef, popoverRef }: PopoverRefs,
): Placement | null => {
  const [placement, setPlacement] = useState<Placement | null>(null);

  useLayoutEffect(() => {
    if (!isOpen) {
      setPlacement(null);

      return;
    }

    const place = () => {
      const anchor = anchorRef.current;
      const popover = popoverRef.current;

      if (!(anchor && popover)) {
        return;
      }

      setPlacement(
        placePopover({
          anchor: anchor.getBoundingClientRect(),
          popover: { width: popover.offsetWidth, height: popover.offsetHeight },
          viewport: { width: window.innerWidth, height: window.innerHeight },
          gutter: VIEWPORT_GUTTER,
          gap: ANCHOR_GAP,
        }),
      );
    };

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);

    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [isOpen, anchorRef, popoverRef]);

  return placement;
};
