import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { Book } from '@/core/rules/types';

const LAST_COPY = 1;

/**
 * Removes a copy right away while others stay. The last copy waits in pendingCardId
 * until the player confirms, since the card then leaves the book.
 */
export const useLastCopyConfirm = (book: Book, onRemove: (cardId: string) => void) => {
  const [pendingCardId, setPendingCardId] = useState<string | null>(null);
  const bookRef = useRef(book);

  useLayoutEffect(() => {
    bookRef.current = book;
  }, [book]);

  // Reads the book through a ref, so it stays the same function and memoized card rows skip
  // re-rendering when the book changes elsewhere.
  const requestRemove = useCallback(
    (cardId: string) => {
      if (bookRef.current.counts[cardId] === LAST_COPY) {
        setPendingCardId(cardId);

        return;
      }

      onRemove(cardId);
    },
    [onRemove],
  );

  const confirmRemove = () => {
    if (pendingCardId) {
      onRemove(pendingCardId);
    }

    setPendingCardId(null);
  };

  const cancelRemove = () => {
    setPendingCardId(null);
  };

  return { pendingCardId, requestRemove, confirmRemove, cancelRemove };
};
