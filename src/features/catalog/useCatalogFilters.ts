import { create } from 'zustand';
import { type CatalogFilters, EMPTY_FILTERS, toggleValue } from '@/core/catalog/filterCards';
import { type FilterScope, withScope } from '@/core/catalog/filterScope';
import type { Mage } from '@/core/rules/types';

/** A chip group in the filter bar: every filter but the search query and the "Only" switch. */
export type FilterGroupKey = Exclude<keyof CatalogFilters, 'query' | 'onlyCards'>;

export type FilterValue = CatalogFilters[FilterGroupKey][number];

interface CatalogFiltersStore {
  /** The mage the filters were set for; another mage starts with no filters. */
  mageId: string | null;
  filters: CatalogFilters;
  setFilters: (mageId: string, update: (current: CatalogFilters) => CatalogFilters) => void;
  reset: () => void;
}

/**
 * Kept outside the catalog so the search and chips survive a trip to the Book tab.
 * In memory only: a reload starts with no filters.
 */
export const useCatalogFiltersStore = create<CatalogFiltersStore>()((set, get) => ({
  mageId: null,
  filters: EMPTY_FILTERS,

  setFilters: (mageId, update) => {
    const current = get().mageId === mageId ? get().filters : EMPTY_FILTERS;

    set({ mageId, filters: update(current) });
  },

  reset: () => {
    set({ mageId: null, filters: EMPTY_FILTERS });
  },
}));

export const useCatalogFilters = (mage: Mage) => {
  const mageId = mage.id;
  const storedMageId = useCatalogFiltersStore((state) => state.mageId);
  const storedFilters = useCatalogFiltersStore((state) => state.filters);
  const setFilters = useCatalogFiltersStore((state) => state.setFilters);

  const filters = storedMageId === mageId ? storedFilters : EMPTY_FILTERS;

  const setQuery = (query: string) => {
    setFilters(mageId, (current) => ({ ...current, query }));
  };

  const toggle = (group: FilterGroupKey, value: FilterValue) => {
    setFilters(mageId, (current) => {
      const selected = current[group] as FilterValue[];

      return { ...current, [group]: toggleValue(selected, value) };
    });
  };

  const setScope = (scope: FilterScope) => {
    setFilters(mageId, (current) => withScope(current, scope, mage));
  };

  /** Clears the chips and keeps the search query. */
  const clearChips = () => {
    setFilters(mageId, (current) => ({ ...EMPTY_FILTERS, query: current.query }));
  };

  return { filters, setQuery, toggle, setScope, clearChips };
};
