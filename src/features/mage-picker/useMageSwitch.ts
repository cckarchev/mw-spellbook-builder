import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mageSwitchKind } from '@/core/rules/bookChanges';
import type { Mage } from '@/core/rules/types';
import { magesById } from '@/data/catalog';
import { useBookStore } from '@/store/useBookStore';

const BUILD_PATH = '/build';

/** A switch to another mage that would clear the current book, waiting for a confirm. */
export interface PendingSwitch {
  mage: Mage;
  /** The mage of the book that would be cleared. */
  currentMage: Mage | undefined;
  copies: number;
}

const sumCopies = (counts: Record<string, number>): number =>
  Object.values(counts).reduce((total, count) => total + count, 0);

/**
 * Switches the book's mage and opens the builder. When the switch would clear the book,
 * it waits in pendingSwitch until it is confirmed.
 */
export const useMageSwitch = () => {
  const navigate = useNavigate();
  const book = useBookStore((state) => state.book);
  const chooseMage = useBookStore((state) => state.chooseMage);
  const loadBook = useBookStore((state) => state.loadBook);

  const [pendingSwitch, setPendingSwitch] = useState<PendingSwitch | null>(null);

  const requestSwitch = (mage: Mage) => {
    const kind = mageSwitchKind(book, mage.id);

    if (kind === 'newBook') {
      const currentMage = book.mageId === null ? undefined : magesById.get(book.mageId);

      setPendingSwitch({ mage, currentMage, copies: sumCopies(book.counts) });

      return;
    }

    if (kind === 'direct') {
      chooseMage(mage.id);
    }

    navigate(BUILD_PATH);
  };

  const confirmSwitch = () => {
    if (!pendingSwitch) {
      return;
    }

    loadBook({ mageId: pendingSwitch.mage.id, counts: {} });
    navigate(BUILD_PATH);
  };

  const cancelSwitch = () => {
    setPendingSwitch(null);
  };

  return { currentMageId: book.mageId, pendingSwitch, requestSwitch, confirmSwitch, cancelSwitch };
};
