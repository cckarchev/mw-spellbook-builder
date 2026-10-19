import { useId, useState } from 'react';
import { Button } from '@/components/button/Button';
import { activeFilterCount, type CatalogFilters } from '@/core/catalog/filterCards';
import type { FilterOptions } from '@/core/catalog/filterOptions';
import type { FilterGroupKey, FilterValue } from '../useCatalogFilters';
import styles from './FilterBar.module.css';
import { FilterGroup } from './filter-group/FilterGroup';

interface FilterBarProps {
  filters: CatalogFilters;
  options: FilterOptions;
  onQueryChange: (query: string) => void;
  onToggle: (group: FilterGroupKey, value: FilterValue) => void;
  onClearChips: () => void;
}

// Subtype and Expansion have the most values, so they start folded away.
const GROUPS: { key: FilterGroupKey; title: string; defaultExpanded: boolean }[] = [
  { key: 'types', title: 'Type', defaultExpanded: true },
  { key: 'schools', title: 'School', defaultExpanded: true },
  { key: 'levels', title: 'Level', defaultExpanded: true },
  { key: 'subtypes', title: 'Subtype', defaultExpanded: false },
  { key: 'expansions', title: 'Expansion', defaultExpanded: false },
];

/** The search box, always shown, and the filter chips, folded away behind a toggle. */
export const FilterBar = ({
  filters,
  options,
  onQueryChange,
  onToggle,
  onClearChips,
}: FilterBarProps) => {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [optionQuery, setOptionQuery] = useState('');

  const activeCount = activeFilterCount(filters);
  const toggleLabel = activeCount > 0 ? `Filters (${activeCount})` : 'Filters';

  // A closed panel forgets its filter search.
  const togglePanel = () => {
    setOpen(!open);
    setOptionQuery('');
  };

  return (
    <div className={styles.bar}>
      <div className={styles.controls}>
        <input
          type="search"
          className={styles.search}
          placeholder="Search name or text"
          aria-label="Search cards"
          value={filters.query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <Button aria-expanded={open} aria-controls={panelId} onClick={togglePanel}>
          {toggleLabel}
        </Button>
      </div>
      {open ? (
        <div id={panelId} className={styles.panel}>
          <input
            type="search"
            className={styles.search}
            placeholder="Find a filter, such as a subtype"
            aria-label="Find a filter"
            value={optionQuery}
            onChange={(event) => setOptionQuery(event.target.value)}
          />
          {GROUPS.map((group) => (
            <FilterGroup
              key={group.key}
              title={group.title}
              options={options[group.key]}
              selected={filters[group.key]}
              query={optionQuery}
              defaultExpanded={group.defaultExpanded}
              onToggle={(value) => onToggle(group.key, value)}
            />
          ))}
          {activeCount > 0 ? (
            <Button className={styles.clear} onClick={onClearChips}>
              Clear filters
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
