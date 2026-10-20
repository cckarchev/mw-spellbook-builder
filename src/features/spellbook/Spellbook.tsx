import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { type BookGroup, bookGroups } from '@/core/catalog/bookGroups';
import { addCopyBlockedReason, type BookSummary } from '@/core/rules/validateBook';
import { bookProblems, cardProblems } from '@/core/share-link/bookNotes';
import { cardsById } from '@/data/catalog';
import { ShareActions } from '@/features/share/share-actions/ShareActions';
import type { BookPanelProps } from '@/features/shared/bookPanelProps';
import { CardItem } from '@/features/shared/card-item/CardItem';
import { TypeSection } from '@/features/shared/type-section/TypeSection';
import { useViewMode, type ViewMode } from '@/features/shared/view-switch/useViewMode';
import { ViewSwitch } from '@/features/shared/view-switch/ViewSwitch';
import styles from './Spellbook.module.css';
import { useLastCopyConfirm } from './useLastCopyConfirm';

interface SpellbookProps extends BookPanelProps {
  summary: BookSummary;
}

interface GroupsProps extends BookPanelProps {
  groups: BookGroup[];
  summary: BookSummary;
  view: ViewMode;
}

/** The book's cards under one section per type, with the problem of each card. */
const Groups = ({ groups, book, mage, summary, view, onAdd, onRemove }: GroupsProps) => {
  const rowProblems = cardProblems(summary.issues, mage);

  return groups.map((group) => (
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
          onRemove={onRemove}
        />
      ))}
    </TypeSection>
  ));
};

/** The book's share buttons and cards, grouped by type with copies and points per group, and what is wrong. */
export const Spellbook = ({ book, mage, summary, onAdd, onRemove }: SpellbookProps) => {
  const { view, setView } = useViewMode('book');
  const groups = bookGroups(book, mage, cardsById);
  const problems = bookProblems(summary.issues, mage, book.counts, cardsById);
  const { pendingCardId, requestRemove, confirmRemove, cancelRemove } = useLastCopyConfirm(
    book,
    onRemove,
  );
  const pendingCard = pendingCardId ? cardsById.get(pendingCardId) : undefined;

  // An empty book has nothing to show either way, so it gets no view switch.
  const isEmpty = groups.length === 0;

  return (
    <div className={styles.spellbook}>
      <div className={styles.toolbar}>
        <ShareActions book={book} mage={mage} summary={summary} />
        {isEmpty ? null : <ViewSwitch view={view} onChange={setView} />}
      </div>
      {isEmpty ? <p className={styles.empty}>No cards yet. Add some from the Cards tab.</p> : null}
      {!isEmpty && problems.length > 0 ? (
        <ul className={styles.problems} aria-label="Problems">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      ) : null}
      <Groups
        groups={groups}
        book={book}
        mage={mage}
        summary={summary}
        view={view}
        onAdd={onAdd}
        onRemove={requestRemove}
      />
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
