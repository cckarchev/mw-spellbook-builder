import { useState } from 'react';
import { readStored, writeStored } from '@/core/persistence/storage';

export type CatalogView = 'list' | 'grid';

export const CATALOG_VIEW_STORAGE_KEY = 'mw-spellbook-builder:catalog-view';

const DEFAULT_VIEW: CatalogView = 'list';

const readView = (): CatalogView => {
  const stored = readStored(CATALOG_VIEW_STORAGE_KEY);

  if (stored === 'grid' || stored === 'list') {
    return stored;
  }

  return DEFAULT_VIEW;
};

/** Whether the catalog shows rows or card images, remembered on this device. */
export const useCatalogView = () => {
  const [view, setViewState] = useState(readView);

  const setView = (next: CatalogView) => {
    setViewState(next);
    writeStored(CATALOG_VIEW_STORAGE_KEY, next);
  };

  return { view, setView };
};
