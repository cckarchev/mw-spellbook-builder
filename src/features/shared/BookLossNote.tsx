import { copyCount } from '@/core/rules/bookChanges';
import type { Book } from '@/core/rules/types';
import { plural } from '@/core/text/plural';
import { bookMage } from '@/data/catalog';

/** What a confirm calls a book whose mage is unknown. */
export const CURRENT_MAGE_FALLBACK = 'current';

/** How to keep a book that a confirm is about to clear or replace. */
export const KEEP_BOOK_HINT = 'To keep it, cancel and save it first.';

/** What a confirm says before the book is cleared, and how to keep it. */
export const BookLossNote = ({ book }: { book: Book }) => {
  const mageName = bookMage(book)?.name ?? CURRENT_MAGE_FALLBACK;
  const cardsLabel = plural(copyCount(book), 'card', 'cards');

  return (
    <p>
      Your {mageName} book has {cardsLabel}. It will be cleared. {KEEP_BOOK_HINT}
    </p>
  );
};
