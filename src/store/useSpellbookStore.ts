import { create } from 'zustand';
import {
  migrateLegacyBook,
  readCurrentMageId,
  readDraft,
  writeCurrentMageId,
  writeDraft,
} from '@/core/persistence/drafts';
import { saveBook } from '@/core/persistence/savedBooks';
import { emptyBook } from '@/core/rules/bookChanges';
import type { Book } from '@/core/rules/types';
import { canAddCopy } from '@/core/rules/validateBook';
import { bookMage, cardsById } from '@/data/catalog';

interface BookStore {
  /** The book being built, kept as its mage's draft so it survives a reload and a mage switch. */
  book: Book;
  /** The name of the saved book this one was saved as or loaded from, null for none. */
  name: string | null;
  /**
   * Goes up on every save. A save can leave the book and its name as they were, so this is
   * what tells readers of the saved copy to read it again.
   */
  savedRevision: number;
  /** Adds one copy, unless the + control would be disabled for it. */
  addCopy: (cardId: string) => void;
  removeCopy: (cardId: string) => void;
  /** Switches to the mage's draft, or a new book for it; the current book stays as its draft. */
  openMage: (mageId: string) => void;
  loadBook: (book: Book, name?: string | null) => void;
  /** Saves the book under the name, replacing a saved book with that name, and names it. */
  save: (name: string) => void;
  /** Empties the book and drops its name; the mage stays. */
  clear: () => void;
}

const noBook = (): Book => ({ mageId: null, counts: {} });

interface InitialState {
  book: Book;
  name: string | null;
}

const readInitialState = (): InitialState => {
  migrateLegacyBook();

  const mageId = readCurrentMageId();
  const draft = mageId === null ? null : readDraft(mageId);

  return draft ?? { book: noBook(), name: null };
};

const withoutCard = (counts: Book['counts'], cardId: string): Book['counts'] => {
  const remaining = { ...counts };

  delete remaining[cardId];

  return remaining;
};

export const createBookStore = () => {
  const store = create<BookStore>()((set, get) => ({
    ...readInitialState(),
    savedRevision: 0,

    addCopy: (cardId) => {
      const { book } = get();
      const card = cardsById.get(cardId);
      const mage = bookMage(book);

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
        count === 1 ? withoutCard(book.counts, cardId) : { ...book.counts, [cardId]: count - 1 };

      set({ book: { ...book, counts } });
    },

    openMage: (mageId) => {
      if (get().book.mageId === mageId) {
        return;
      }

      const draft = readDraft(mageId);

      set(draft ?? { book: emptyBook(mageId), name: null });
    },

    loadBook: (book, name = null) => {
      set({ book, name });
    },

    save: (name) => {
      const { book, savedRevision } = get();

      saveBook(name, book);
      set({ name, savedRevision: savedRevision + 1 });
    },

    clear: () => {
      const { mageId } = get().book;

      set({ book: { mageId, counts: {} }, name: null });
    },
  }));

  store.subscribe(({ book, name }) => {
    if (book.mageId === null) {
      return;
    }

    writeDraft({ book, name });
    writeCurrentMageId(book.mageId);
  });

  return store;
};

export const useBookStore = createBookStore();
