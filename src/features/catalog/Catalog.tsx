import { useMemo } from 'react';
import { type BookGroup, bookGroups } from '@/core/catalog/bookGroups';
import { EMPTY_FILTERS, filterCards, isFiltering } from '@/core/catalog/filterCards';
import { filterOptions } from '@/core/catalog/filterOptions';
import { groupByType } from '@/core/catalog/groupByType';
import { cardCost } from '@/core/rules/cardCost';
import { addCopyBlockedReason } from '@/core/rules/validateBook';
import { cards, cardsById } from '@/data/catalog';
import type { BookPanelProps } from '@/features/shared/bookPanelProps';
import { CardRow } from '@/features/shared/card-row/CardRow';
import { TypeSection } from '@/features/shared/type-section/TypeSection';
import styles from './Catalog.module.css';
import { FilterBar } from './filter-bar/FilterBar';
import { useCatalogFilters } from './useCatalogFilters';

/** What the book already has of one type, such as "5 in book · 16 pts". Nothing when it has none. */
const inBookLabel = (bookGroup: BookGroup | undefined): string | undefined => {
  if (!bookGroup) {
    return undefined;
  }

  return `${bookGroup.copies} in book · ${bookGroup.points} pts`;
};

/** Every card the mage can use, filtered and grouped by type, each with its cost and a stepper. */
export const Catalog = ({ book, mage, onAdd, onRemove }: BookPanelProps) => {
  const { filters, setQuery, toggle, clearChips } = useCatalogFilters(mage.id);

  const options = useMemo(() => filterOptions(filterCards(cards, EMPTY_FILTERS, mage)), [mage]);
  const groups = useMemo(() => groupByType(filterCards(cards, filters, mage)), [filters, mage]);
  const bookGroupsByType = new Map(
    bookGroups(book, mage, cardsById).map((bookGroup) => [bookGroup.type, bookGroup]),
  );

  // Collapsed to browse by type; open while searching or filtering, so the matches show.
  const filtering = isFiltering(filters);

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
        <TypeSection
          key={`${group.type}:${filtering}`}
          title={group.type}
          count={group.items.length}
          meta={inBookLabel(bookGroupsByType.get(group.type))}
          defaultExpanded={filtering}
        >
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
