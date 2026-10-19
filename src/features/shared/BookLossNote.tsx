import { copyCount } from '@/core/rules/bookChanges';
import type { Book } from '@/core/rules/types';
import { plural } from '@/core/text/plural';
import { magesById } from '@/data/catalog';

const CURRENT_MAGE_FALLBACK = 'current';

/** How to keep a book that a confirm is about to clear or replace. */
export const KEEP_BOOK_HINT = 'To keep it, cancel and copy its link from the Book tab first.';

/** What a confirm says before the book is cleared, and how to keep it. */
export const BookLossNote = ({ book }: { book: Book }) => {
  const mageName = (book.mageId && magesById.get(book.mageId)?.name) ?? CURRENT_MAGE_FALLBACK;
  const cardsLabel = plural(copyCount(book), 'card', 'cards');

  return (
    <p>
      Your {mageName} book has {cardsLabel}. It will be cleared. {KEEP_BOOK_HINT}
    </p>
  );
};
