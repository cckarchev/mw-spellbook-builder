import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mageSwitchKind } from '@/core/rules/bookChanges';
import type { Card, Mage, School } from '@/core/rules/types';
import { cardsIllegalFor } from '@/core/rules/validateBook';
import { cardsById, magesById } from '@/data/catalog';
import { useBookStore } from '@/store/useBookStore';

const BUILD_PATH = '/build';

export type PendingSwitch =
  | {
      /** Another mage: the current book is cleared if confirmed. */
      kind: 'newBook';
      mage: Mage;
      schoolChoice: School | null;
      /** The mage of the book that would be cleared. */
      currentMage: Mage | undefined;
      copies: number;
    }
  | {
      /** The same mage with another school: these cards leave the book if confirmed. */
      kind: 'removeCards';
      mage: Mage;
      schoolChoice: School | null;
      illegalCards: Card[];
    };

const sumCopies = (counts: Record<string, number>): number =>
  Object.values(counts).reduce((total, count) => total + count, 0);

/**
 * Switches the book's mage and opens the builder. When the switch would clear the book
 * or remove cards from it, it waits in pendingSwitch until it is confirmed.
 */
export const useMageSwitch = () => {
  const navigate = useNavigate();
  const book = useBookStore((state) => state.book);
  const chooseMage = useBookStore((state) => state.chooseMage);
  const loadBook = useBookStore((state) => state.loadBook);

  const [pendingSwitch, setPendingSwitch] = useState<PendingSwitch | null>(null);

  const switchTo = (mage: Mage, schoolChoice: School | null) => {
    chooseMage(mage.id, schoolChoice);
    navigate(BUILD_PATH);
  };

  const startNewBook = (mage: Mage, schoolChoice: School | null) => {
    loadBook({ mageId: mage.id, schoolChoice, counts: {} });
    navigate(BUILD_PATH);
  };

  const requestSwitch = (mage: Mage, schoolChoice: School | null) => {
    const kind = mageSwitchKind(book, mage.id);
    const illegalCards = cardsIllegalFor(book, mage, schoolChoice, cardsById);

    if (kind === 'newBook') {
      const currentMage = book.mageId === null ? undefined : magesById.get(book.mageId);

      setPendingSwitch({ kind, mage, schoolChoice, currentMage, copies: sumCopies(book.counts) });

      return;
    }

    if (illegalCards.length > 0) {
      setPendingSwitch({ kind: 'removeCards', mage, schoolChoice, illegalCards });

      return;
    }

    switchTo(mage, schoolChoice);
  };

  const confirmSwitch = () => {
    if (!pendingSwitch) {
      return;
    }

    if (pendingSwitch.kind === 'newBook') {
      startNewBook(pendingSwitch.mage, pendingSwitch.schoolChoice);
    } else {
      switchTo(pendingSwitch.mage, pendingSwitch.schoolChoice);
    }
  };

  const cancelSwitch = () => {
    setPendingSwitch(null);
  };

  return { currentMageId: book.mageId, pendingSwitch, requestSwitch, confirmSwitch, cancelSwitch };
};
