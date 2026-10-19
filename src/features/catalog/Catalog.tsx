import { useMemo } from 'react';
import { EMPTY_FILTERS, filterCards } from '@/core/catalog/filterCards';
import { filterOptions } from '@/core/catalog/filterOptions';
import { groupByType } from '@/core/catalog/groupByType';
import { cardCost } from '@/core/rules/cardCost';
import type { Book, Mage } from '@/core/rules/types';
import { addCopyBlockedReason } from '@/core/rules/validateBook';
import { cards } from '@/data/catalog';
import { CardRow } from '@/features/shared/card-row/CardRow';
import { TypeSection } from '@/features/shared/type-section/TypeSection';
import styles from './Catalog.module.css';
import { FilterBar } from './filter-bar/FilterBar';
import { useCatalogFilters } from './useCatalogFilters';

interface CatalogProps {
  book: Book;
  mage: Mage;
  onAdd: (cardId: string) => void;
  onRemove: (cardId: string) => void;
}

/** Every card the mage can use, filtered and grouped by type, each with its cost and a stepper. */
export const Catalog = ({ book, mage, onAdd, onRemove }: CatalogProps) => {
  const { filters, setQuery, toggle, clearChips } = useCatalogFilters(mage.id);

  const options = useMemo(() => filterOptions(filterCards(cards, EMPTY_FILTERS, mage)), [mage]);
  const groups = useMemo(() => groupByType(filterCards(cards, filters, mage)), [filters, mage]);

  return (
    <div className={styles.catalog}>
      <FilterBar
        filters={filters}
        options={options}
        onQueryChange={setQuery}
        onToggle={toggle}
        onClearChips={clearChips}
      />
      {groups.length === 0 ? <p className={styles.empty}>No cards match.</p> : null}
      {groups.map((group) => (
        <TypeSection key={group.type} title={group.type} count={group.items.length}>
          {group.items.map((card) => (
            <CardRow
              key={card.id}
              card={card}
              count={book.counts[card.id] ?? 0}
              points={cardCost(card, mage)}
              blockedReason={addCopyBlockedReason(book, card, mage)}
              onAdd={onAdd}
              onRemove={onRemove}
            />
          ))}
        </TypeSection>
      ))}
    </div>
  );
};
