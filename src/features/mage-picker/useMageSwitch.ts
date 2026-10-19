import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Card, Mage, School } from '@/core/rules/types';
import { cardsIllegalFor } from '@/core/rules/validateBook';
import { cardsById } from '@/data/catalog';
import { useBookStore } from '@/store/useBookStore';

const BUILD_PATH = '/build';

export interface PendingSwitch {
  mage: Mage;
  schoolChoice: School | null;
  /** Cards in the book the new mage cannot use; removed if the switch is confirmed. */
  illegalCards: Card[];
}

/**
 * Switches the book's mage and opens the builder. When the book holds cards the new
 * mage cannot use, the switch waits in pendingSwitch until it is confirmed.
 */
export const useMageSwitch = () => {
  const navigate = useNavigate();
  const book = useBookStore((state) => state.book);
  const chooseMage = useBookStore((state) => state.chooseMage);

  const [pendingSwitch, setPendingSwitch] = useState<PendingSwitch | null>(null);

  const switchTo = (mage: Mage, schoolChoice: School | null) => {
    chooseMage(mage.id, schoolChoice);
    navigate(BUILD_PATH);
  };

  const requestSwitch = (mage: Mage, schoolChoice: School | null) => {
    const illegalCards = cardsIllegalFor(book, mage, schoolChoice, cardsById);

    if (illegalCards.length > 0) {
      setPendingSwitch({ mage, schoolChoice, illegalCards });

      return;
    }

    switchTo(mage, schoolChoice);
  };

  const confirmSwitch = () => {
    if (pendingSwitch) {
      switchTo(pendingSwitch.mage, pendingSwitch.schoolChoice);
    }
  };

  const cancelSwitch = () => {
    setPendingSwitch(null);
  };

  return { currentMageId: book.mageId, pendingSwitch, requestSwitch, confirmSwitch, cancelSwitch };
};
