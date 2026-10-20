import { type RefObject, useLayoutEffect, useState } from 'react';
import { type Placement, placePopover } from '@/core/layout/placePopover';

// In px, matching --space-xs and --space-xxs.
const VIEWPORT_GUTTER = 8;
const TERM_GAP = 4;

interface PopoverRefs {
  termRef: RefObject<HTMLButtonElement | null>;
  popoverRef: RefObject<HTMLDivElement | null>;
}

/** Where the open popover goes, kept next to its term while the page scrolls or resizes. */
export const usePlacement = (
  isOpen: boolean,
  { termRef, popoverRef }: PopoverRefs,
): Placement | null => {
  const [placement, setPlacement] = useState<Placement | null>(null);

  useLayoutEffect(() => {
    if (!isOpen) {
      setPlacement(null);

      return;
    }

    const place = () => {
      const term = termRef.current;
      const popover = popoverRef.current;

      if (!(term && popover)) {
        return;
      }

      setPlacement(
        placePopover({
          anchor: term.getBoundingClientRect(),
          popover: { width: popover.offsetWidth, height: popover.offsetHeight },
          viewport: { width: window.innerWidth, height: window.innerHeight },
          gutter: VIEWPORT_GUTTER,
          gap: TERM_GAP,
        }),
      );
    };

    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);

    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [isOpen, termRef, popoverRef]);

  return placement;
};
