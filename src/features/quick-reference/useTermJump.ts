import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { termAnchorId, termOfHash } from "@/core/reference/anchors";
import { jumpToTerm } from "./jumpToTerm";
import { sortedGlossary } from "./sortedGlossary";

const TERMS = sortedGlossary.map((entry) => entry.term);

/**
 * Jumps to a term: the one a shared link points at on opening, or one the player taps. A tap
 * clears the search first, then jumps once the full list is back and the term's entry is on the
 * page, and puts the term in the address, ready to share.
 */
export const useTermJump = (
  hasQuery: boolean,
  setQuery: (next: string) => void,
) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingJump, setPendingJump] = useState(() =>
    termOfHash(location.hash, TERMS),
  );
  // Read through a ref, so a new state object after an address write keeps the callback the same.
  const stateRef = useRef(location.state);

  stateRef.current = location.state;

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
      // Replaces the history entry and drops the search, as the cleared field will.
      navigate(
        { hash: termAnchorId(term) },
        { replace: true, state: stateRef.current },
      );
      setQuery("");
      setPendingJump(term);
    },
    [navigate, setQuery],
  );
};
