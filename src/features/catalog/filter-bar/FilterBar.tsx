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

const GROUPS: { key: FilterGroupKey; title: string }[] = [
  { key: 'types', title: 'Type' },
  { key: 'schools', title: 'School' },
  { key: 'levels', title: 'Level' },
  { key: 'subtypes', title: 'Subtype' },
  { key: 'expansions', title: 'Expansion' },
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

  const activeCount = activeFilterCount(filters);
  const toggleLabel = activeCount > 0 ? `Filters (${activeCount})` : 'Filters';

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
        <Button aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}>
          {toggleLabel}
        </Button>
      </div>
      {open ? (
        <div id={panelId} className={styles.panel}>
          {GROUPS.map((group) => (
            <FilterGroup
              key={group.key}
              title={group.title}
              options={options[group.key]}
              selected={filters[group.key]}
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
