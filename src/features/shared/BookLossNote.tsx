import { copyCount } from '@/core/rules/bookChanges';
import type { Book } from '@/core/rules/types';
import { magesById } from '@/data/catalog';

const CURRENT_MAGE_FALLBACK = 'current';

/** What a confirm says before the book is cleared, and how to keep it. */
export const BookLossNote = ({ book }: { book: Book }) => {
  const mageName = (book.mageId && magesById.get(book.mageId)?.name) ?? CURRENT_MAGE_FALLBACK;
  const copies = copyCount(book);
  const cardsLabel = copies === 1 ? '1 card' : `${copies} cards`;

  return (
    <p>
      Your {mageName} book has {cardsLabel}. It will be cleared. To keep it, cancel and copy its
      link from the Book tab first.
    </p>
  );
};
