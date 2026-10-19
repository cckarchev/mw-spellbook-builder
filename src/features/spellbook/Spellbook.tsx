import { bookGroups } from '@/core/catalog/bookGroups';
import type { Book, Mage } from '@/core/rules/types';
import { addCopyBlockedReason, type BookSummary } from '@/core/rules/validateBook';
import { bookProblems, cardProblems } from '@/core/share-link/bookNotes';
import { cardsById } from '@/data/catalog';
import { CardRow } from '@/features/shared/card-row/CardRow';
import { TypeSection } from '@/features/shared/type-section/TypeSection';
import styles from './Spellbook.module.css';

interface SpellbookProps {
  book: Book;
  mage: Mage;
  summary: BookSummary;
  onAdd: (cardId: string) => void;
  onRemove: (cardId: string) => void;
}

/** The cards in the book, grouped by type with copies and points per group, and what is wrong. */
export const Spellbook = ({ book, mage, summary, onAdd, onRemove }: SpellbookProps) => {
  const groups = bookGroups(book, mage, cardsById);
  const problems = bookProblems(summary.issues, mage, book.counts, cardsById);
  const rowProblems = cardProblems(summary.issues, mage);

  if (groups.length === 0) {
    return <p className={styles.empty}>No cards yet. Add some from the Cards tab.</p>;
  }

  return (
    <div className={styles.spellbook}>
      {problems.length > 0 ? (
        <ul className={styles.problems} aria-label="Problems">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      ) : null}
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
              problem={rowProblems.get(entry.card.id) ?? null}
              onAdd={onAdd}
              onRemove={onRemove}
            />
          ))}
        </TypeSection>
      ))}
    </div>
  );
};
