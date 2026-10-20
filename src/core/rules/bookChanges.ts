import type { Book } from './types';

/** Whether a book holds at least one card; a book with only a mage counts as empty. */
export const hasCards = (book: Book): boolean => Object.keys(book.counts).length > 0;

/** Copies of every card in the book. */
export const copyCount = (book: Book): number =>
  Object.values(book.counts).reduce((total, count) => total + count, 0);

/** The same mage and copies, in any order. */
export const sameBook = (first: Book, second: Book): boolean => {
  const firstEntries = Object.entries(first.counts);
  const sameCardCount = firstEntries.length === Object.keys(second.counts).length;
  const sameCopies = firstEntries.every(([cardId, count]) => second.counts[cardId] === count);

  return first.mageId === second.mageId && sameCardCount && sameCopies;
};

/**
 * How picking a mage changes the book: another mage starts a new book (after a confirm
 * when there are cards to lose); the same mage keeps its book.
 */
type MageSwitchKind = 'newBook' | 'direct' | 'sameMage';

export const mageSwitchKind = (book: Book, mageId: string): MageSwitchKind => {
  if (book.mageId === mageId) {
    return 'sameMage';
  }

  return hasCards(book) ? 'newBook' : 'direct';
};

/** A new book for the mage, with no cards yet. */
export const emptyBook = (mageId: string): Book => ({ mageId, counts: {} });

/**
 * Whether the book would lose work if replaced. `saved` is the saved copy of the book's
 * name, null when it has no name: then any card counts as unsaved work.
 */
export const hasUnsavedChanges = (book: Book, saved: Book | null): boolean => {
  if (saved === null) {
    return hasCards(book);
  }

  return !sameBook(book, saved);
};
