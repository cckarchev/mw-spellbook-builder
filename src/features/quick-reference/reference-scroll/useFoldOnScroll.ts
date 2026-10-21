import { type RefObject, useEffect, useRef, useState } from 'react';
import {
  BACK_TO_TOP_AFTER,
  type FoldState,
  foldStep,
  INITIAL_FOLD,
} from '@/core/reference/foldOnScroll';

interface FoldOnScroll {
  /** Whether the letters are folded away. */
  folded: boolean;
  /** Whether the list is far enough down for the back to top button. */
  showBackToTop: boolean;
}

const AT_TOP: FoldOnScroll = { folded: false, showBackToTop: false };

/**
 * Follows the scroll of the Quick reference, folding the letters away on the way down. The
 * scroll itself is kept in a ref, so the list renders again only when something it shows
 * changes, which keeps scrolling smooth on slow phones.
 */
export const useFoldOnScroll = (scroller: RefObject<HTMLElement | null>): FoldOnScroll => {
  const foldRef = useRef<FoldState>(INITIAL_FOLD);
  const [shown, setShown] = useState<FoldOnScroll>(AT_TOP);
  // What the last render showed, compared before setting state, so a scroll that changes
  // nothing visible does not even start a render.
  const shownRef = useRef<FoldOnScroll>(AT_TOP);

  useEffect(() => {
    const element = scroller.current;

    if (!element) {
      return;
    }

    const handleScroll = () => {
      const fold = foldStep(foldRef.current, element.scrollTop);
      const folded = fold.folded;
      const showBackToTop = fold.lastTop > BACK_TO_TOP_AFTER;

      const current = shownRef.current;
      const unchanged = current.folded === folded && current.showBackToTop === showBackToTop;

      foldRef.current = fold;

      if (unchanged) {
        return;
      }

      shownRef.current = { folded, showBackToTop };
      setShown(shownRef.current);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [scroller]);

  return shown;
};
