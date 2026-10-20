import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PICKER_PATH } from '@/core/routing/builderPath';
import { hasCards } from '@/core/rules/bookChanges';
import { useCatalogFiltersStore } from '@/features/catalog/useCatalogFilters';
import { useBookStore } from '@/store/useBookStore';

/**
 * Goes back to the mage picker with a new book: the book and the catalog filters are cleared.
 * A book with cards waits in askingToClear until the player confirms.
 */
export const useGoHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const book = useBookStore((state) => state.book);
  const clearBook = useBookStore((state) => state.clear);
  const resetFilters = useCatalogFiltersStore((state) => state.reset);

  const [askingToClear, setAskingToClear] = useState(false);

  const goHome = () => {
    clearBook();
    resetFilters();
    setAskingToClear(false);
    // Already home: replace the entry, so Back does not seem to do nothing.
    navigate(PICKER_PATH, { replace: location.pathname === PICKER_PATH });
  };

  const requestHome = () => {
    if (hasCards(book)) {
      setAskingToClear(true);

      return;
    }

    goHome();
  };

  const cancelHome = () => {
    setAskingToClear(false);
  };

  return { book, askingToClear, requestHome, confirmHome: goHome, cancelHome };
};
