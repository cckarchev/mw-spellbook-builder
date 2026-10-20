import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import type { Mage } from '@/core/rules/types';
import { BOOK_PARAM } from '@/core/share-link/shareUrl';
import { useBookStore } from '@/store/useBookStore';

/** Makes the book follow the mage in the URL, as picking that mage would: it opens its draft. */
export const useRouteMage = (routeMage: Mage | undefined) => {
  const location = useLocation();
  const openMage = useBookStore((state) => state.openMage);

  // A share link brings its own book and mage; the incoming link handles those.
  const opensShareLink = new URLSearchParams(location.search).has(BOOK_PARAM);

  useEffect(() => {
    if (!routeMage || opensShareLink) {
      return;
    }

    openMage(routeMage.id);
  }, [routeMage, opensShareLink, openMage]);
};
