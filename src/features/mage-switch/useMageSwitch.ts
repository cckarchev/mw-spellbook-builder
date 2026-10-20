import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { builderPath } from '@/core/routing/paths';
import { emptyBook, mageSwitchKind } from '@/core/rules/bookChanges';
import type { Mage } from '@/core/rules/types';
import { useBookStore } from '@/store/useBookStore';
import { useStartNewBook } from './useStartNewBook';

/**
 * Switches the book's mage and opens the builder. When the switch would clear the book,
 * the new mage waits in pendingSwitch until it is confirmed.
 */
export const useMageSwitch = () => {
  const navigate = useNavigate();
  const book = useBookStore((state) => state.book);
  const loadBook = useBookStore((state) => state.loadBook);
  const startNewBook = useStartNewBook();

  const [pendingSwitch, setPendingSwitch] = useState<Mage | null>(null);

  const requestSwitch = (mage: Mage) => {
    const kind = mageSwitchKind(book, mage.id);

    if (kind === 'newBook') {
      setPendingSwitch(mage);

      return;
    }

    if (kind === 'direct') {
      loadBook(emptyBook(mage.id));
    }

    navigate(builderPath(mage.name, 'cards'));
  };

  const confirmSwitch = () => {
    if (!pendingSwitch) {
      return;
    }

    startNewBook(pendingSwitch);
    setPendingSwitch(null);
    navigate(builderPath(pendingSwitch.name, 'cards'));
  };

  const cancelSwitch = () => {
    setPendingSwitch(null);
  };

  return { book, pendingSwitch, requestSwitch, confirmSwitch, cancelSwitch };
};
