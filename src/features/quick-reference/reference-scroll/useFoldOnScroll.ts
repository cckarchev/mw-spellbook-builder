import { type RefObject, useEffect, useState } from 'react';
import { type FoldState, foldStep, INITIAL_FOLD } from '@/core/reference/foldOnScroll';

interface FoldOnScroll {
  /** Whether the letters are folded away. */
  folded: boolean;
  scrollTop: number;
}

/** Follows the scroll of the Quick reference, folding the letters away on the way down. */
export const useFoldOnScroll = (scroller: RefObject<HTMLElement | null>): FoldOnScroll => {
  const [fold, setFold] = useState<FoldState>(INITIAL_FOLD);

  useEffect(() => {
    const element = scroller.current;

    if (!element) {
      return;
    }

    const handleScroll = () => {
      setFold((current) => foldStep(current, element.scrollTop));
    };

    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [scroller]);

  return { folded: fold.folded, scrollTop: fold.lastTop };
};
