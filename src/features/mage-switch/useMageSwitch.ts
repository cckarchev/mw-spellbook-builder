import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { builderPath } from '@/core/routing/builderPath';
import { mageSwitchKind } from '@/core/rules/bookChanges';
import type { Mage } from '@/core/rules/types';
import { useCatalogFiltersStore } from '@/features/catalog/useCatalogFilters';
import { useBookStore } from '@/store/useBookStore';

/**
 * Switches the book's mage and opens the builder. When the switch would clear the book,
 * the new mage waits in pendingSwitch until it is confirmed.
 */
export const useMageSwitch = () => {
  const navigate = useNavigate();
  const book = useBookStore((state) => state.book);
  const loadBook = useBookStore((state) => state.loadBook);
  const resetFilters = useCatalogFiltersStore((state) => state.reset);

  const [pendingSwitch, setPendingSwitch] = useState<Mage | null>(null);

  const requestSwitch = (mage: Mage) => {
    const kind = mageSwitchKind(book, mage.id);

    if (kind === 'newBook') {
      setPendingSwitch(mage);

      return;
    }

    if (kind === 'direct') {
      loadBook({ mageId: mage.id, counts: {} });
    }

    navigate(builderPath(mage.name, 'cards'));
  };

  const confirmSwitch = () => {
    if (!pendingSwitch) {
      return;
    }

    loadBook({ mageId: pendingSwitch.id, counts: {} });
    resetFilters();
    setPendingSwitch(null);
    navigate(builderPath(pendingSwitch.name, 'cards'));
  };

  const cancelSwitch = () => {
    setPendingSwitch(null);
  };

  return { book, pendingSwitch, requestSwitch, confirmSwitch, cancelSwitch };
};
