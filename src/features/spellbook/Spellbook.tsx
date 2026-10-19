import { bookGroups } from '@/core/catalog/bookGroups';
import type { Book, Mage } from '@/core/rules/types';
import { addCopyBlockedReason } from '@/core/rules/validateBook';
import { cardsById } from '@/data/catalog';
import { CardRow } from '@/features/shared/card-row/CardRow';
import { TypeSection } from '@/features/shared/type-section/TypeSection';
import styles from './Spellbook.module.css';

interface SpellbookProps {
  book: Book;
  mage: Mage;
  onAdd: (cardId: string) => void;
  onRemove: (cardId: string) => void;
}

/** The cards in the book, grouped by type with copies and points per group. */
export const Spellbook = ({ book, mage, onAdd, onRemove }: SpellbookProps) => {
  const groups = bookGroups(book, mage, cardsById);

  if (groups.length === 0) {
    return <p className={styles.empty}>No cards yet. Add some from the Cards tab.</p>;
  }

  return (
    <div className={styles.spellbook}>
      {groups.map((group) => (
        <TypeSection
          key={group.type}
          title={group.type}
          count={group.copies}
          meta={`${group.points} pts`}
        >
          {group.entries.map((entry) => (
            <CardRow
              key={entry.card.id}
              card={entry.card}
              count={entry.count}
              points={entry.points}
              blockedReason={addCopyBlockedReason(book, entry.card, mage)}
              onAdd={onAdd}
              onRemove={onRemove}
            />
          ))}
        </TypeSection>
      ))}
    </div>
  );
};
