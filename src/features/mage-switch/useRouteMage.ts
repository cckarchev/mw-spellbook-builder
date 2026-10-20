import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { BuilderTab } from '@/core/routing/builderPath';
import { emptyBook, mageSwitchKind } from '@/core/rules/bookChanges';
import type { Mage } from '@/core/rules/types';
import { BOOK_PARAM } from '@/core/share-link/shareUrl';
import { useCatalogFiltersStore } from '@/features/catalog/useCatalogFilters';
import { useBookStore } from '@/store/useBookStore';
import { currentBookPath } from './currentBookPath';

/**
 * Makes the book follow the mage in the URL, as picking that mage would: a book with no
 * cards switches right away, one with cards waits in isPending until the player confirms.
 * Cancelling goes back to the book's own mage.
 */
export const useRouteMage = (routeMage: Mage | undefined, tab: BuilderTab) => {
  const location = useLocation();
  const navigate = useNavigate();
  const book = useBookStore((state) => state.book);
  const loadBook = useBookStore((state) => state.loadBook);
  const resetFilters = useCatalogFiltersStore((state) => state.reset);

  // A share link brings its own book and mage; the incoming link handles those.
  const opensShareLink = new URLSearchParams(location.search).has(BOOK_PARAM);
  const kind = routeMage && !opensShareLink ? mageSwitchKind(book, routeMage.id) : 'sameMage';

  // Runs when the URL names a mage, not on every book change: a book cleared on the way out
  // of the builder must not bring the URL's mage back.
  useEffect(() => {
    if (!routeMage || opensShareLink) {
      return;
    }

    const current = useBookStore.getState().book;

    if (mageSwitchKind(current, routeMage.id) === 'direct') {
      loadBook(emptyBook(routeMage.id));
    }
  }, [routeMage, opensShareLink, loadBook]);

  const confirm = () => {
    if (!routeMage) {
      return;
    }

    loadBook(emptyBook(routeMage.id));
    resetFilters();
  };

  const cancel = () => {
    navigate(currentBookPath(book, tab), { replace: true });
  };

  return { isPending: kind === 'newBook', confirm, cancel };
};
