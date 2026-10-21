import { type CSSProperties, type RefObject, useEffect, useRef } from 'react';
import { letterAnchorId } from '@/core/reference/anchors';
import { useStickyHeight } from '@/features/shared/useStickyHeight';
import { scrollBehavior, scrollToElement } from '../jumpToTerm';
import { letterGroups } from '../sortedGlossary';
import { useCurrentLetter } from './useCurrentLetter';
import { useFoldOnScroll } from './useFoldOnScroll';

export const LETTERS = letterGroups.map((group) => group.letter);

const TOP = 0;
const NO_HEIGHT = 0;

/**
 * Scrolling the Quick reference: the sticky toolbar and the letters floating under it, which
 * fold on the way down, the current letter, letter jumps and the way back to the top.
 */
export const useReferenceScroll = (
  scroller: RefObject<HTMLElement | null>,
  searchRef: RefObject<HTMLInputElement | null>,
  query: string,
) => {
  const showLetters = query === '';
  const { ref: toolbarRef, height: toolbarHeight } = useStickyHeight();
  const { ref: lettersRef, height: measuredLetters } = useStickyHeight();
  const lettersHeight = showLetters ? measuredLetters : NO_HEIGHT;
  // Jumps land under the letters too, since they may unfold over the target.
  const landingHeight = toolbarHeight + lettersHeight;
  const { folded, showBackToTop } = useFoldOnScroll(scroller);
  const currentLetter = useCurrentLetter(scroller, LETTERS, landingHeight);
  const style = {
    '--reference-toolbar-height': `${landingHeight}px`,
    '--reference-letters-height': `${lettersHeight}px`,
  } as CSSProperties;

  // A new search starts at its first result, and clearing it at the top of the list.
  const lastQueryRef = useRef(query);

  useEffect(() => {
    const changed = lastQueryRef.current !== query;

    lastQueryRef.current = query;

    if (changed && scroller.current) {
      scroller.current.scrollTop = TOP;
    }
  }, [scroller, query]);

  const jumpToLetter = (letter: string) => {
    const heading = document.getElementById(letterAnchorId(letter));

    if (heading) {
      scrollToElement(heading);
      heading.focus({ preventScroll: true });
    }
  };

  const backToTop = () => {
    scroller.current?.scrollTo({ top: TOP, behavior: scrollBehavior() });
    searchRef.current?.focus({ preventScroll: true });
  };

  return {
    toolbarRef,
    lettersRef,
    style,
    folded,
    showBackToTop,
    currentLetter,
    jumpToLetter,
    backToTop,
  };
};
