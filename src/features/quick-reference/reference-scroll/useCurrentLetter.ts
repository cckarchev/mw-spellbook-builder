import { type RefObject, useEffect, useState } from 'react';
import { letterAnchorId } from '@/core/reference/anchors';

// A heading this close under the toolbar already counts as reached, past rounding.
const REACHED_SLACK = 1;
const NO_LETTER = '';

/**
 * The letter whose heading last went under the toolbar, as the Quick reference scrolls, or the
 * first letter at the top.
 */
export const useCurrentLetter = (
  scroller: RefObject<HTMLElement | null>,
  letters: readonly string[],
  toolbarHeight: number,
): string => {
  const firstLetter = letters[0] ?? NO_LETTER;
  const [current, setCurrent] = useState(firstLetter);

  useEffect(() => {
    const element = scroller.current;

    if (!element) {
      return;
    }

    let frame = 0;

    const measure = () => {
      const line = element.getBoundingClientRect().top + toolbarHeight + REACHED_SLACK;
      const reached = letters.filter((letter) => {
        const heading = document.getElementById(letterAnchorId(letter));

        return heading !== null && heading.getBoundingClientRect().top <= line;
      });

      setCurrent(reached.at(-1) ?? firstLetter);
    };

    const handleScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener('scroll', handleScroll);
    };
  }, [scroller, letters, firstLetter, toolbarHeight]);

  return current;
};
