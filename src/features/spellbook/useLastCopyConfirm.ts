import { useState } from 'react';
import type { Book } from '@/core/rules/types';

const LAST_COPY = 1;

/**
 * Removes a copy right away while others stay. The last copy waits in pendingCardId
 * until the player confirms, since the card then leaves the book.
 */
export const useLastCopyConfirm = (book: Book, onRemove: (cardId: string) => void) => {
  const [pendingCardId, setPendingCardId] = useState<string | null>(null);

  const requestRemove = (cardId: string) => {
    if (book.counts[cardId] === LAST_COPY) {
      setPendingCardId(cardId);

      return;
    }

    onRemove(cardId);
  };

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
