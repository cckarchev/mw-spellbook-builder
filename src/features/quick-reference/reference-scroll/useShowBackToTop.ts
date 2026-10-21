import { type RefObject, useEffect, useRef, useState } from 'react';

/** Scrolled down this far, in pixels, the back to top button shows. */
export const BACK_TO_TOP_AFTER = 1200;

/**
 * Whether the Quick reference is scrolled far enough down for the back to top button. The
 * scroll itself is only compared, never stored in state, so the list renders again only when
 * the button comes or goes, which keeps scrolling smooth on slow phones.
 */
export const useShowBackToTop = (scroller: RefObject<HTMLElement | null>): boolean => {
  const [shown, setShown] = useState(false);
  // What the last render showed, compared before setting state, so a scroll that changes
  // nothing visible does not even start a render.
  const shownRef = useRef(false);

  useEffect(() => {
    const element = scroller.current;

    if (!element) {
      return;
    }

    const handleScroll = () => {
      const farDown = element.scrollTop > BACK_TO_TOP_AFTER;

      if (farDown === shownRef.current) {
        return;
      }

      shownRef.current = farDown;
      setShown(farDown);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [scroller]);

  return shown;
};
