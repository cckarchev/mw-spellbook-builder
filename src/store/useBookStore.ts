import { create } from 'zustand';
import { readStored, writeStored } from '@/core/persistence/storage';
import type { Book } from '@/core/rules/types';
import { canAddCopy, cardsIllegalFor } from '@/core/rules/validateBook';
import { decodeBook, encodeBook } from '@/core/share-link/bookCodec';
import { cardsById, magesById } from '@/data/catalog';

/** The book being built, kept as an encodeBook string so it survives a reload. */
export const BOOK_STORAGE_KEY = 'mw-deck-builder:current';

interface BookStore {
  book: Book;
  /** Switches mage and drops the cards the new mage cannot use. */
  chooseMage: (mageId: string) => void;
  /** Adds one copy, unless the + control would be disabled for it. */
  addCopy: (cardId: string) => void;
  removeCopy: (cardId: string) => void;
  loadBook: (book: Book) => void;
  clear: () => void;
}

const emptyBook = (): Book => ({ mageId: null, counts: {} });

const readInitialBook = (): Book => {
  const stored = readStored(BOOK_STORAGE_KEY);
  const decoded = stored === null ? null : decodeBook(stored);

  return decoded?.book ?? emptyBook();
};

const withoutCards = (counts: Book['counts'], cardIds: string[]): Book['counts'] => {
  const remaining = { ...counts };

  for (const cardId of cardIds) {
    delete remaining[cardId];
  }

  return remaining;
};

export const createBookStore = () => {
  const store = create<BookStore>()((set, get) => ({
    book: readInitialBook(),

    chooseMage: (mageId) => {
      const mage = magesById.get(mageId);

      if (!mage) {
        return;
      }

      const { book } = get();
      const illegalIds = cardsIllegalFor(book, mage, cardsById).map((card) => card.id);
      const counts = withoutCards(book.counts, illegalIds);

      set({ book: { mageId, counts } });
    },

    addCopy: (cardId) => {
      const { book } = get();
      const card = cardsById.get(cardId);
      const mage = book.mageId === null ? undefined : magesById.get(book.mageId);

      if (!(card && mage && canAddCopy(book, card, mage))) {
        return;
      }

      const count = book.counts[cardId] ?? 0;

      set({ book: { ...book, counts: { ...book.counts, [cardId]: count + 1 } } });
    },

    removeCopy: (cardId) => {
      const { book } = get();
      const count = book.counts[cardId] ?? 0;

      if (count === 0) {
        return;
      }

      const counts =
        count === 1 ? withoutCards(book.counts, [cardId]) : { ...book.counts, [cardId]: count - 1 };

      set({ book: { ...book, counts } });
    },

    loadBook: (book) => {
      set({ book });
    },

    clear: () => {
      set({ book: emptyBook() });
    },
  }));

  store.subscribe((state) => {
    writeStored(BOOK_STORAGE_KEY, encodeBook(state.book));
  });

  return store;
};

export const useBookStore = createBookStore();
