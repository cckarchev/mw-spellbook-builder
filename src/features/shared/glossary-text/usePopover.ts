import { type RefObject, useEffect, useLayoutEffect, useState } from 'react';
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

/** Closes the open popover on a tap outside it and its term, or on Escape, which refocuses the term. */
export const useDismiss = (
  isOpen: boolean,
  { termRef, popoverRef }: PopoverRefs,
  onClose: () => void,
): void => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // A tap on another term closes this one here, then opens the other with its own click.
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      const isInside = termRef.current?.contains(target) || popoverRef.current?.contains(target);

      if (!isInside) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        termRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, termRef, popoverRef, onClose]);
};
