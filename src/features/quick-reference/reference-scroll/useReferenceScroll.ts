import { type CSSProperties, type RefObject, useEffect, useRef } from 'react';
import { letterAnchorId } from '@/core/reference/anchors';
import { useStickyHeight } from '@/features/shared/useStickyHeight';
import { scrollBehavior, scrollToElement } from '../jumpToTerm';
import { letterGroups } from '../sortedGlossary';
import { useShowBackToTop } from './useShowBackToTop';

export const LETTERS = letterGroups.map((group) => group.letter);

const TOP = 0;

/**
 * Scrolling the Quick reference: the sticky toolbar jumps land under, letter jumps and the way
 * back to the top.
 */
export const useReferenceScroll = (
  scroller: RefObject<HTMLElement | null>,
  searchRef: RefObject<HTMLInputElement | null>,
  query: string,
) => {
  const { ref: toolbarRef, height: toolbarHeight } = useStickyHeight();
  const showBackToTop = useShowBackToTop(scroller);
  const style = { '--reference-toolbar-height': `${toolbarHeight}px` } as CSSProperties;

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
    style,
    showBackToTop,
    jumpToLetter,
    backToTop,
  };
};
