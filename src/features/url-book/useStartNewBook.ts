import { useCallback } from 'react';
import { emptyBook } from '@/core/rules/bookChanges';
import { useCatalogFiltersStore } from '@/features/catalog/useCatalogFilters';
import { useBookStore } from '@/store/useBookStore';

/** Clears the book and the catalog filters, and starts a book for the mage with that id. */
export const useStartNewBook = () => {
  const loadBook = useBookStore((state) => state.loadBook);
  const resetFilters = useCatalogFiltersStore((state) => state.reset);

  return useCallback(
    (mageId: string) => {
      loadBook(emptyBook(mageId));
      resetFilters();
    },
    [loadBook, resetFilters],
  );
};
