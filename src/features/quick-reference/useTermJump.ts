import { useCallback, useEffect, useState } from 'react';
import { jumpToTerm } from './jumpToTerm';

/**
 * Jumps to a term tapped inside a definition: clears the search first, then jumps once the full
 * list is back and the term's entry is on the page.
 */
export const useTermJump = (hasQuery: boolean, setQuery: (next: string) => void) => {
  const [pendingJump, setPendingJump] = useState<string | null>(null);

  useEffect(() => {
    if (pendingJump === null || hasQuery) {
      return;
    }

    jumpToTerm(pendingJump);
    setPendingJump(null);
  }, [pendingJump, hasQuery]);

  // Kept the same across renders, so the memoized list does not render again for it.
  return useCallback(
    (term: string) => {
      setQuery('');
      setPendingJump(term);
    },
    [setQuery],
  );
};
