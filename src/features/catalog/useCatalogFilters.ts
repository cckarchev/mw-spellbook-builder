import { useState } from 'react';
import { type CatalogFilters, EMPTY_FILTERS, toggleValue } from '@/core/catalog/filterCards';

/** A chip group in the filter bar: every filter but the search query. */
export type FilterGroupKey = Exclude<keyof CatalogFilters, 'query'>;

export type FilterValue = CatalogFilters[FilterGroupKey][number];

export const useCatalogFilters = () => {
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS);

  const setQuery = (query: string) => {
    setFilters((current) => ({ ...current, query }));
  };

  const toggle = (group: FilterGroupKey, value: FilterValue) => {
    setFilters((current) => {
      const selected = current[group] as FilterValue[];

      return { ...current, [group]: toggleValue(selected, value) };
    });
  };

  /** Clears the chips and keeps the search query. */
  const clearChips = () => {
    setFilters((current) => ({ ...EMPTY_FILTERS, query: current.query }));
  };

  return { filters, setQuery, toggle, clearChips };
};
