import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { bookGroups } from '@/core/catalog/bookGroups';
import { addCopyBlockedReason, type BookSummary } from '@/core/rules/validateBook';
import { bookProblems, cardProblems } from '@/core/share-link/bookNotes';
import { cardsById } from '@/data/catalog';
import type { BookPanelProps } from '@/features/shared/bookPanelProps';
import { CardItem } from '@/features/shared/CardItem';
import { TypeSection } from '@/features/shared/type-section/TypeSection';
import type { ViewMode } from '@/features/shared/view-switch/useViewMode';
import styles from './Spellbook.module.css';
import { useLastCopyConfirm } from './useLastCopyConfirm';

interface SpellbookProps extends BookPanelProps {
  summary: BookSummary;
  view: ViewMode;
}

/** The cards in the book, grouped by type with copies and points per group, and what is wrong. */
export const Spellbook = ({ book, mage, summary, view, onAdd, onRemove }: SpellbookProps) => {
  const groups = bookGroups(book, mage, cardsById);
  const problems = bookProblems(summary.issues, mage, book.counts, cardsById);
  const rowProblems = cardProblems(summary.issues, mage);
  const { pendingCardId, requestRemove, confirmRemove, cancelRemove } = useLastCopyConfirm(
    book,
    onRemove,
  );
  const pendingCard = pendingCardId ? cardsById.get(pendingCardId) : undefined;

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
          layout={view}
        >
          {group.entries.map((entry) => (
            <CardItem
              key={entry.card.id}
              view={view}
              card={entry.card}
              count={entry.count}
              points={entry.points}
              blockedReason={addCopyBlockedReason(book, entry.card, mage)}
              problem={rowProblems.get(entry.card.id) ?? null}
              onAdd={onAdd}
              onRemove={requestRemove}
            />
          ))}
        </TypeSection>
      ))}
      <ConfirmDialog
        open={pendingCard !== undefined}
        title={`Remove ${pendingCard?.name ?? 'card'}?`}
        body={<p>It is the last copy, so the card leaves the book.</p>}
        confirmLabel="Remove"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
      />
    </div>
  );
};
