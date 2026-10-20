import { type ReactNode, useId, useState } from 'react';
import { Button } from '@/components/button/Button';
import { Segmented, type SegmentedOption } from '@/components/segmented/Segmented';
import { activeFilterCount, type CatalogFilters } from '@/core/catalog/filterCards';
import type { FilterOptions } from '@/core/catalog/filterOptions';
import type { FilterScope } from '@/core/catalog/filterScope';
import type { FilterGroupKey, FilterValue } from '../useCatalogFilters';
import styles from './FilterBar.module.css';
import { FilterGroup } from './filter-group/FilterGroup';

interface FilterBarProps {
  filters: CatalogFilters;
  options: FilterOptions;
  onQueryChange: (query: string) => void;
  onToggle: (group: FilterGroupKey, value: FilterValue) => void;
  /** Null when the school chips were picked by hand. */
  scope: FilterScope | null;
  onScopeChange: (scope: FilterScope) => void;
  onClearChips: () => void;
  /** More controls at the end of the search row, such as the view switch. */
  children?: ReactNode;
}

const SCOPES: SegmentedOption<FilterScope>[] = [
  { value: 'all', label: 'All' },
  { value: 'trained', label: 'Trained' },
  { value: 'only', label: 'Mage only' },
];

// Subtype and Expansion have the most values, so they start folded away.
const GROUPS: { key: FilterGroupKey; title: string; defaultExpanded: boolean }[] = [
  { key: 'types', title: 'Type', defaultExpanded: true },
  { key: 'schools', title: 'School', defaultExpanded: true },
  { key: 'levels', title: 'Level', defaultExpanded: true },
  { key: 'subtypes', title: 'Subtype', defaultExpanded: false },
  { key: 'expansions', title: 'Expansion', defaultExpanded: false },
];

/** The search box, always shown, and the quick picks and filter chips, folded away behind a toggle. */
export const FilterBar = ({
  filters,
  options,
  onQueryChange,
  onToggle,
  scope,
  onScopeChange,
  onClearChips,
  children,
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
        <Button size="small" aria-expanded={open} aria-controls={panelId} onClick={togglePanel}>
          {toggleLabel}
        </Button>
        {children}
      </div>
      {open ? (
        <div id={panelId} className={styles.panel}>
          <Segmented label="Show" options={SCOPES} value={scope} onChange={onScopeChange} />
          <div className={styles.controls}>
            <input
              type="search"
              className={styles.search}
              placeholder="Find a filter"
              aria-label="Find a filter"
              value={optionQuery}
              onChange={(event) => setOptionQuery(event.target.value)}
            />
            {activeCount > 0 ? <Button onClick={onClearChips}>Clear</Button> : null}
          </div>
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
        </div>
      ) : null}
    </div>
  );
};
