import { useCallback } from 'react';
import { emptyBook } from '@/core/rules/bookChanges';
import type { Mage } from '@/core/rules/types';
import { useCatalogFiltersStore } from '@/features/catalog/useCatalogFilters';
import { useBookStore } from '@/store/useBookStore';

/** Clears the book and the catalog filters, and starts a book for the mage. */
export const useStartNewBook = () => {
  const loadBook = useBookStore((state) => state.loadBook);
  const resetFilters = useCatalogFiltersStore((state) => state.reset);

  return useCallback(
    (mage: Mage) => {
      loadBook(emptyBook(mage.id));
      resetFilters();
    },
    [loadBook, resetFilters],
  );
};
